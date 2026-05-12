import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import { Client as NotionClient } from "@notionhq/client";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3002);

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

const notionToken = process.env.NOTION_TOKEN;
const notionDatabaseId = process.env.NOTION_DB_ID;
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
  const lineItems = Array.isArray(input.line_items) ? input.line_items : [];

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

  lineItems.forEach((item, index) => {
    if (item?.include === "yes") {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        details.push({
          field: `input.line_items[${index}].quantity`,
          code: "INVALID_QUANTITY",
          message: "quantity debe ser mayor a 0 cuando include es yes",
        });
      }

      if (typeof item.complexity !== "string" || item.complexity.trim() === "") {
        details.push({
          field: `input.line_items[${index}].complexity`,
          code: "LINE_ITEM_COMPLEXITY_REQUIRED",
          message: "complexity es obligatoria cuando include es yes",
        });
      }
    }
  });

  const pricing = {
    contingency_pct:
      input?.pricing?.contingency_pct ?? payload?.pricing_snapshot?.contingency_pct ?? PRICING_CONFIG.contingency_pct,
    margin_pct: input?.pricing?.margin_pct ?? payload?.pricing_snapshot?.margin_pct ?? PRICING_CONFIG.margin_pct,
    discount_pct:
      input?.pricing?.discount_pct ?? payload?.pricing_snapshot?.discount_pct ?? PRICING_CONFIG.discount_pct,
    vat_pct: input?.pricing?.vat_pct ?? payload?.pricing_snapshot?.vat_pct ?? PRICING_CONFIG.vat_pct,
  };

  validateRangePct(details, pricing.discount_pct, "pricing.discount_pct");
  validateRangePct(details, pricing.contingency_pct, "pricing.contingency_pct");
  validateRangePct(details, pricing.margin_pct, "pricing.margin_pct");
  validateRangePct(details, pricing.vat_pct, "pricing.vat_pct");

  return { details, lineItems, pricing };
}

function buildTotals({ lineItems, pricing, applyVat }) {
  const directCost = lineItems
    .filter((item) => item.include === "yes")
    .reduce((acc, item) => {
      const unitCost = toNumber(item.base_cost, toNumber(item.unit_hours, 0) * 18000);
      const qty = toNumber(item.quantity, 0);
      return acc + unitCost * qty;
    }, 0);

  const contingencyValue = directCost * pricing.contingency_pct;
  const subtotalWithContingency = directCost + contingencyValue;
  const marginValue = subtotalWithContingency * pricing.margin_pct;
  const subtotalNet = subtotalWithContingency + marginValue;
  const discountValue = subtotalNet * pricing.discount_pct;
  const totalNet = subtotalNet - discountValue;
  const vatValue = applyVat ? totalNet * pricing.vat_pct : 0;
  const totalProject = totalNet + vatValue;

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
    total_monthly: 0,
    estimated_min: Math.round(estimatedMin),
    estimated_max: Math.round(estimatedMax),
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "quotes-api" });
});

app.post("/api/quotes/simulate", (req, res) => {
  const traceId = makeTraceId();

  try {
    const { details, lineItems, pricing } = validateSimulatePayload(req.body);

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

    // Normalize apply_vat to boolean (fix for string "false" being truthy)
    const applyVatInput = req.body?.input?.apply_vat;
    const applyVat = applyVatInput === undefined ? PRICING_CONFIG.apply_vat : normalizeBool(applyVatInput, PRICING_CONFIG.apply_vat);
    const totals = buildTotals({ lineItems, pricing, applyVat });

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

    const origin = req.body?.context?.origin;
    const confidenceLevel = origin === "advanced" ? "high" : "medium";

    if (!CONFIDENCE_VALUES.has(confidenceLevel)) {
      return sendError(
        res,
        500,
        traceId,
        "internal_error",
        "CONFIDENCE_LEVEL_INVALID",
        "No se pudo resolver confidence_level",
      );
    }

    return res.status(200).json({
      quote: {
        quote_id: `qt_${crypto.randomUUID().replace(/-/g, "")}`,
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
  } catch (_error) {
    return sendError(
      res,
      500,
      traceId,
      "internal_error",
      "UNEXPECTED_ERROR",
      "Ocurrió un error inesperado al simular la cotización",
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
  } catch (_error) {
    return sendError(
      res,
      500,
      traceId,
      "internal_error",
      "UNEXPECTED_ERROR",
      "Ocurrió un error inesperado al registrar el lead",
    );
  }
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Quotes API escuchando en http://localhost:${PORT}`);
});
