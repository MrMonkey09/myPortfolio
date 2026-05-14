import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { Client as NotionClient } from "@notionhq/client";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB se inicializa async con fallback (better-sqlite3 -> sql.js)
// backend/ está en nivel superior: ../../backend/
import { initializeDatabase } from "../../backend/db/index.js";
import { createQuoteRecord } from "../../backend/db/quotesRepository.js";
import { syncWithRetry } from "../../backend/sync/notionSync.js";

dotenv.config(); // Load from frontend/.env if exists
dotenv.config({ path: path.join(__dirname, "../../backend/.env") }); // Fallback to backend/.env

// Inicializar DB async al cargar el módulo (con fallback a sql.js si better-sqlite3 no disponible)
let db = null;

initializeDatabase()
  .then((database) => {
    db = database;
    console.log("[API] Database initialized successfully");
  })
  .catch((err) => {
    console.error("[API] Database initialization failed:", err.message);
    // API continuará sin persistencia local — no bloqueamos startup
  });

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-trace-id, x-api-key");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const ORIGIN_VALUES = new Set(["quick", "advanced", "direct_contact"]);
const CONFIDENCE_VALUES = new Set(["low", "medium", "high"]);

const PRICING_CONFIG = {
  pricing_config_version: "2026.05.11",
  contingency_pct: 0.12,
  margin_pct: 0.25,
  discount_pct: 0,
  vat_pct: 0.19,
  apply_vat: true,
};

const DISCLAIMER = "La cotización final se confirma tras validar requerimientos.";
const LEAD_SCHEMA_VERSION = "1.0.0";
const LEAD_EVENT_NAME = "lead_submit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY_TTL_MS = 1000 * 60 * 30;
const RETRY_BACKOFF_MS = [1000, 3000, 7000];

const notionToken = process.env.NOTION_TOKEN?.trim();
const notionDatabaseId = process.env.NOTION_DB_ID?.trim();
const notionClient = notionToken ? new NotionClient({ auth: notionToken }) : null;
const idempotencyStore = new Map();

let notionTitlePropertyName = null;

app.use(express.json({ limit: "1mb" }));

function makeTraceId() {
  return `trc_${crypto.randomUUID().replace(/-/g, "")}`;
}

function sendError(res, status, traceId, type, code, message, details = []) {
  return res.status(status).json({
    error: {
      type,
      code,
      message,
      details,
      trace_id: traceId,
    },
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNotionError(error) {
  const status = Number(error?.status ?? error?.statusCode ?? 0);
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;

  const code = String(error?.code ?? "");
  return code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ENOTFOUND";
}

async function withRetry(operation) {
  let lastError;

  for (let attempt = 0; attempt < RETRY_BACKOFF_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientNotionError(error) || attempt === RETRY_BACKOFF_MS.length - 1) {
        throw error;
      }
      await sleep(RETRY_BACKOFF_MS[attempt]);
    }
  }

  throw lastError;
}

function sanitizeMessage(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.replace(/\s+/g, " ").slice(0, 2000);
}

function chunkText(value, chunkSize = 2000) {
  if (typeof value !== "string" || value.length === 0) return [""];
  const chunks = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize));
  }
  return chunks;
}

function pruneIdempotencyStore() {
  const now = Date.now();
  for (const [key, value] of idempotencyStore.entries()) {
    if (!value || value.expiresAt <= now) {
      idempotencyStore.delete(key);
    }
  }
}

function getIdempotencyEntry(key) {
  pruneIdempotencyStore();
  return idempotencyStore.get(key);
}

function setIdempotencyEntry(key, payload) {
  idempotencyStore.set(key, {
    ...payload,
    expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
  });
}

async function resolveNotionTitlePropertyName() {
  if (notionTitlePropertyName) {
    return notionTitlePropertyName;
  }

  const database = await notionClient.databases.retrieve({ database_id: notionDatabaseId });
  const titleEntry = Object.entries(database?.properties ?? {}).find(([, prop]) => prop?.type === "title");

  if (!titleEntry) {
    throw new Error("NOTION_TITLE_PROPERTY_NOT_FOUND");
  }

  notionTitlePropertyName = titleEntry[0];
  return notionTitlePropertyName;
}

function validateLeadPayload(payload) {
  const details = [];
  const contact = payload?.contact ?? {};
  const quoteRef = payload?.quote_ref ?? {};

  if (typeof contact.name !== "string" || contact.name.trim() === "") {
    details.push({ field: "contact.name", code: "REQUIRED", message: "name es obligatorio" });
  }

  if (typeof contact.email !== "string" || contact.email.trim() === "") {
    details.push({ field: "contact.email", code: "REQUIRED", message: "email es obligatorio" });
  } else if (!EMAIL_REGEX.test(contact.email.trim())) {
    details.push({ field: "contact.email", code: "INVALID_EMAIL", message: "email no es válido" });
  }

  if (typeof quoteRef.quote_id !== "string" || quoteRef.quote_id.trim() === "") {
    details.push({ field: "quote_ref.quote_id", code: "REQUIRED", message: "quote_id es obligatorio" });
  }

  if (typeof quoteRef.origin !== "string" || quoteRef.origin.trim() === "") {
    details.push({ field: "quote_ref.origin", code: "REQUIRED", message: "origin es obligatorio" });
  } else if (!ORIGIN_VALUES.has(quoteRef.origin.trim())) {
    details.push({
      field: "quote_ref.origin",
      code: "INVALID_ENUM",
      message: "origin debe ser quick, advanced o direct_contact",
    });
  }

  if (!Number.isFinite(quoteRef.total_project) || quoteRef.total_project < 0) {
    details.push({
      field: "quote_ref.total_project",
      code: "OUT_OF_RANGE",
      message: "total_project debe ser mayor o igual a 0",
    });
  }

  if (!Number.isFinite(quoteRef.total_monthly) || quoteRef.total_monthly < 0) {
    details.push({
      field: "quote_ref.total_monthly",
      code: "OUT_OF_RANGE",
      message: "total_monthly debe ser mayor o igual a 0",
    });
  }

  return {
    details,
    sanitized: {
      contact: {
        name: typeof contact.name === "string" ? contact.name.trim() : "",
        email: typeof contact.email === "string" ? contact.email.trim().toLowerCase() : "",
        phone: typeof contact.phone === "string" ? contact.phone.trim() : "",
        preferred_channel:
          typeof contact.preferred_channel === "string" ? contact.preferred_channel.trim().toLowerCase() : "",
      },
      quote_ref: {
        quote_id: typeof quoteRef.quote_id === "string" ? quoteRef.quote_id.trim() : "",
        origin: typeof quoteRef.origin === "string" ? quoteRef.origin.trim() : "",
        total_project: Number(quoteRef.total_project),
        total_monthly: Number(quoteRef.total_monthly),
      },
      message: sanitizeMessage(payload?.message),
    },
  };
}

async function persistLeadToNotion({ traceId, leadId, payload }) {
  const titlePropertyName = await withRetry(() => resolveNotionTitlePropertyName());
  const createdAt = new Date().toISOString();

  const notionPayload = {
    lead_id: leadId,
    event: LEAD_EVENT_NAME,
    trace_id: traceId,
    schema_version: payload.schema_version,
    pricing_config_version: payload.pricing_config_version,
    created_at: createdAt,
    submitted_at: createdAt,
    ...payload,
  };

  const titleValue = `Lead ${leadId} | ${payload.quote_ref.quote_id}`;
  const serialized = JSON.stringify(notionPayload, null, 2);
  const payloadBlocks = chunkText(serialized).slice(0, 40).map((chunk) => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: chunk } }],
    },
  }));

  return withRetry(() =>
    notionClient.pages.create({
      parent: { database_id: notionDatabaseId },
      properties: {
        [titlePropertyName]: {
          title: [{ text: { content: titleValue.slice(0, 2000) } }],
        },
      },
      children: payloadBlocks,
    }),
  );
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBool(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (value === "false" || value === "0" || value === 0 || value === "no") return false;
  if (value === "true" || value === "1" || value === 1 || value === "yes") return true;
  return defaultValue;
}

function validateRangePct(details, value, field) {
  if (value === undefined || value === null) return;
  if (typeof value !== "number" || value < 0 || value > 1) {
    details.push({
      field,
      code: "OUT_OF_RANGE",
      message: `${field} debe estar entre 0 y 1`,
    });
  }
}

function validateSimulatePayload(payload) {
  const details = [];
  const context = payload?.context ?? {};
  const input = payload?.input ?? {};

  const requiredContext = [
    "schema_version",
    "origin",
    "project_type",
    "project_state",
    "currency",
  ];

  requiredContext.forEach((field) => {
    if (typeof context[field] !== "string" || context[field].trim() === "") {
      details.push({
        field: `context.${field}`,
        code: "REQUIRED",
        message: `${field} es obligatorio`,
      });
    }
  });

  if (context.origin && !ORIGIN_VALUES.has(context.origin)) {
    details.push({
      field: "context.origin",
      code: "INVALID_ENUM",
      message: "origin debe ser quick, advanced o direct_contact",
    });
  }

  if (context.origin === "quick") {
    const quickAnswers = input.quick_answers;
    if (!quickAnswers || typeof quickAnswers !== "object") {
      details.push({
        field: "input.quick_answers",
        code: "REQUIRED",
        message: "quick_answers es obligatorio para simulación rápida",
      });
    } else {
      const requiredQuickFields = ["pages_estimate", "needs_ecommerce", "urgency"];
      requiredQuickFields.forEach((field) => {
        const value = quickAnswers[field];
        if (value === undefined || value === null || value === "") {
          details.push({
            field: `input.quick_answers.${field}`,
            code: "REQUIRED",
            message: `${field} es obligatorio en quick_answers`,
          });
        }
      });
    }
  }

  // Re-assign lineItems for consistency in return
  const currentLineItems = input?.line_items || [];
  if (!Array.isArray(currentLineItems)) {
    details.push({
      field: "input.line_items",
      code: "INVALID_TYPE",
      message: "line_items debe ser un array",
    });
  }

  const pricing = {
    contingency_pct:
      input?.pricing?.contingency_pct ?? payload?.config_snapshot?.contingency_pct ?? PRICING_CONFIG.contingency_pct,
    margin_pct: input?.pricing?.margin_pct ?? payload?.config_snapshot?.margin_pct ?? PRICING_CONFIG.margin_pct,
    discount_pct:
      input?.pricing?.discount_pct ?? payload?.config_snapshot?.discount_pct ?? PRICING_CONFIG.discount_pct,
    vat_pct: input?.pricing?.vat_pct ?? payload?.config_snapshot?.vat_pct ?? PRICING_CONFIG.vat_pct,
  };

  validateRangePct(details, pricing.discount_pct, "pricing.discount_pct");
  validateRangePct(details, pricing.contingency_pct, "pricing.contingency_pct");
  validateRangePct(details, pricing.margin_pct, "pricing.margin_pct");
  validateRangePct(details, pricing.vat_pct, "pricing.vat_pct");

  return { 
    details, 
    lineItems: currentLineItems, 
    pricing,
    clientData: payload?.client_data || null,
    configSnapshot: payload?.config_snapshot || null,
    cronograma: payload?.cronograma || [],
    checklist: payload?.checklist || []
  };
}

function buildTotals({ lineItems, pricing, applyVat, monthlyServices = [], projectState = "new", configSnapshot = null }) {
  const HOURLY_RATE = configSnapshot?.hourly_rate ?? 18000;
  const complexityFactors = configSnapshot?.complexity_factors ?? {
    low: 1.0,
    medium: 1.2,
    high: 1.45,
  };

  const projectStateMultiplier = projectState === "remodel" 
    ? (configSnapshot?.remodel_factor ?? 0.85) 
    : 1.0;

  const directCostRaw = lineItems
    .filter((item) => item.include === "yes")
    .reduce((acc, item) => {
      const hours = toNumber(item.unit_hours, 0);
      const qty = toNumber(item.quantity, 0);
      const complexity = item.complexity || "medium";
      const factor = complexityFactors[complexity] || 1.2;

      // Prioridad: base_cost > (horas * factor * tarifa)
      const unitCost =
        toNumber(item.base_cost, 0) > 0
          ? toNumber(item.base_cost, 0)
          : Math.round(hours * factor * HOURLY_RATE);

      return acc + unitCost * qty;
    }, 0);

  const directCost = Math.round(directCostRaw * projectStateMultiplier);

  const contingencyValue = directCost * pricing.contingency_pct;
  const subtotalWithContingency = directCost + contingencyValue;
  const marginValue = subtotalWithContingency * pricing.margin_pct;
  const subtotalNet = subtotalWithContingency + marginValue;
  const discountValue = subtotalNet * pricing.discount_pct;
  const totalNet = subtotalNet - discountValue;
  const vatValue = applyVat ? totalNet * pricing.vat_pct : 0;
  const totalProject = totalNet + vatValue;

  const totalMonthly = monthlyServices
    .filter((s) => s.include === "yes")
    .reduce((sum, s) => sum + toNumber(s.monthly_value, 0), 0);

  const estimatedMin = totalProject * 0.9;
  const estimatedMax = totalProject * 1.15;

  return {
    direct_cost: Math.round(directCost),
    contingency_value: Math.round(contingencyValue),
    subtotal_with_contingency: Math.round(subtotalWithContingency),
    margin_value: Math.round(marginValue),
    subtotal_net: Math.round(subtotalNet),
    discount_value: Math.round(discountValue),
    total_net: Math.round(totalNet),
    vat_value: Math.round(vatValue),
    total_project: Math.round(totalProject),
    total_monthly: Math.round(totalMonthly),
    estimated_min: Math.round(estimatedMin),
    estimated_max: Math.round(estimatedMax),
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "quotes-api" });
});

app.post("/api/quotes/simulate", (req, res) => {
  const traceId = makeTraceId();
  const context = req.body?.context || {};

  try {
    const { 
      details, 
      lineItems, 
      pricing, 
      clientData, 
      configSnapshot, 
      cronograma, 
      checklist 
    } = validateSimulatePayload(req.body);

    if (details.length > 0) {
      return sendError(res, 400, traceId, "VALIDATION_ERROR", "INVALID_PAYLOAD", "Payload inválido", details);
    }

    const applyVat = req.body?.input?.apply_vat ?? PRICING_CONFIG.apply_vat;
    const totals = buildTotals({
      lineItems,
      pricing,
      applyVat,
      monthlyServices: req.body?.input?.monthly_services || [],
      projectState: context?.project_state || "new",
      configSnapshot
    });

    if (applyVat === false && totals.vat_value !== 0) {
      return sendError(
        res,
        422,
        traceId,
        "domain_error",
        "VAT_CONFIGURATION_INVALID",
        "Si apply_vat=false entonces vat_value debe ser 0",
        [{ field: "totals.vat_value", code: "INVALID_VALUE", message: "vat_value debe ser 0" }],
      );
    }

    if (totals.total_project < 0) {
      return sendError(
        res,
        422,
        traceId,
        "domain_error",
        "TOTAL_PROJECT_INVALID",
        "total_project no puede ser negativo",
        [{ field: "totals.total_project", code: "OUT_OF_RANGE", message: "Debe ser mayor o igual a 0" }],
      );
    }

    const origin = context?.origin;
    const confidenceLevel = origin === "advanced" ? "high" : "medium";

    const newQuoteId = `qt_${crypto.randomUUID().replace(/-/g, "")}`;

    const quoteRecord = {
      quote_id: newQuoteId,
      trace_id: traceId,
      origin: context.origin,
      status: "simulated",
      confidence_level: confidenceLevel,
      schema_version: context.schema_version,
      pricing_config_version: PRICING_CONFIG.pricing_config_version,
      project_type: context.project_type,
      project_state: context.project_state,
      currency: context.currency,
      input_json: JSON.stringify({
        ...req.body.input,
        client_data: clientData,
        cronograma,
        checklist,
        config_snapshot: configSnapshot
      }),
      totals_json: JSON.stringify(totals),
      meta_json: JSON.stringify({
        trace_id: traceId,
        schema_version: context.schema_version,
        pricing_config_version: PRICING_CONFIG.pricing_config_version,
        client_data: clientData,
        contact: {
          nombre: req.body.input?.nombre || req.body.input?.name || "Pendiente",
          email: req.body.input?.email || req.body.input?.correo_electronico || "No proveído",
          telefono: req.body.input?.telefono || req.body.input?.phone || "No proveído",
          mensaje: req.body.input?.mensaje || req.body.input?.message || "Sin mensaje",
          red_social: req.body.input?.red_social || req.body.input?.social || "No especificado",
          servicio: req.body.input?.servicio || req.body.context?.project_type || "General"
        }
      }),
      created_at: new Date().toISOString(),
      sync_status: "pending",
      sync_attempts: 0,
      sync_last_error: null,
    };

    const shouldPersist = req.body.persist !== false;

    // Persistir en SQLite (si DB está disponible y se solicita persistencia)
    if (shouldPersist && db) {
      try {
        createQuoteRecord(quoteRecord);
      } catch (persistError) {
        console.error("SQLite persistence error:", persistError);
      }
    } else if (!shouldPersist) {
      console.log(`[API] Simulation only (persist=false) for trace ${traceId} — skipping persistence`);
    } else {
      console.warn("[API] DB not ready yet — skipping local persistence");
    }

    // Sync a Notion async solo si se solicita persistencia
    if (shouldPersist) {
      syncWithRetry(quoteRecord).catch((syncError) => {
        console.error("Notion sync error:", syncError);
      });
    }

    return res.status(200).json({
      quote: {
        quote_id: newQuoteId,
        status: "simulated",
        created_at: new Date().toISOString(),
        confidence_level: confidenceLevel,
        disclaimer: DISCLAIMER,
      },
      totals: {
        ...totals,
        confidence_level: confidenceLevel,
        disclaimer: DISCLAIMER,
      },
      breakdown: lineItems,
      meta: {
        schema_version: req.body.context.schema_version,
        pricing_config_version: PRICING_CONFIG.pricing_config_version,
        trace_id: traceId,
      },
    });
  } catch (err) {
    console.error("[SIMULATE-ERROR]", err);
    return sendError(
      res,
      500,
      traceId,
      "internal_error",
      "No se pudo obtener información de la base de datos",
      [{ field: "internal", code: "UNEXPECTED_ERROR", message: String(err.message) }],
    );
  }
});

app.post("/api/quotes/lead", async (req, res) => {
  const traceId = req.header("x-trace-id") || makeTraceId();

  try {
    if (!notionToken || !notionDatabaseId || !notionClient) {
      return sendError(
        res,
        503,
        traceId,
        "internal_error",
        "NOTION_NOT_CONFIGURED",
        "Persistencia Notion no configurada en el entorno",
        [
          { field: "NOTION_TOKEN", code: "REQUIRED_ENV", message: "Variable de entorno faltante" },
          { field: "NOTION_DB_ID", code: "REQUIRED_ENV", message: "Variable de entorno faltante" },
        ],
      );
    }

    const { details, sanitized } = validateLeadPayload(req.body);

    if (details.length > 0) {
      return sendError(
        res,
        400,
        traceId,
        "validation_error",
        "INVALID_REQUEST",
        "Hay campos inválidos",
        details,
      );
    }

    const leadId = `ld_${crypto.randomUUID().replace(/-/g, "")}`;
    const idempotencyKey = `${traceId}:${LEAD_EVENT_NAME}:${sanitized.quote_ref.quote_id}`;
    const existingEntry = getIdempotencyEntry(idempotencyKey);

    if (existingEntry?.status === "done") {
      return res.status(200).json(existingEntry.response);
    }

    if (existingEntry?.status === "in_progress") {
      return sendError(
        res,
        409,
        traceId,
        "conflict_error",
        "LEAD_IN_PROGRESS",
        "Ya existe una operación en curso para esta clave de idempotencia",
      );
    }

    setIdempotencyEntry(idempotencyKey, { status: "in_progress" });

    const persistencePayload = {
      ...sanitized,
      schema_version: req.body?.schema_version || LEAD_SCHEMA_VERSION,
      pricing_config_version: req.body?.pricing_config_version || PRICING_CONFIG.pricing_config_version,
    };

    try {
      await persistLeadToNotion({
        traceId,
        leadId,
        payload: persistencePayload,
      });
    } catch (error) {
      setIdempotencyEntry(idempotencyKey, { status: "failed" });

      if (isTransientNotionError(error)) {
        return sendError(
          res,
          409,
          traceId,
          "conflict_error",
          "NOTION_TRANSIENT_FAILURE",
          "No se pudo persistir el lead en Notion por una falla transitoria. Reintentá en unos segundos.",
        );
      }

      return sendError(
        res,
        500,
        traceId,
        "internal_error",
        "NOTION_PERSISTENCE_FAILED",
        "No se pudo persistir el lead en Notion",
        [{ field: "notion", code: String(error?.code || "UNKNOWN"), message: String(error?.message || "Error") }],
      );
    }

    const response = {
      lead_id: leadId,
      status: "created",
      crm_sync: "queued",
      meta: {
        trace_id: traceId,
        schema_version: persistencePayload.schema_version,
        pricing_config_version: persistencePayload.pricing_config_version,
      },
    };

    setIdempotencyEntry(idempotencyKey, { status: "done", response });
    return res.status(201).json(response);
} catch {
    return sendError(
      res,
      500,
      traceId,
      "internal_error",
      "No se pudo obtener información de la base de datos",
      [],
    );
  }

  // POST /api/quotes/lead
});

app.use((req, res) => {
  const traceId = makeTraceId();
  return sendError(
    res,
    404,
    traceId,
    "validation_error",
    "ROUTE_NOT_FOUND",
    `Ruta no encontrada: ${req.method} ${req.path}`,
  );
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Quotes API escuchando en http://[IP_ADDRESS]:${PORT}`);
  });
}

export default app;
