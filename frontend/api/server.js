import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB se inicializa async con fallback (better-sqlite3 -> sql.js)
// backend/ está en nivel superior: ../../backend/
import { initializeDatabase } from "../../backend/db/index.js";
import { createQuoteRecord, createLeadRecord } from "../../backend/db/quotesRepository.js";

const appEnv = process.env.APP_ENV || process.env.NODE_ENV || "development";

dotenv.config(); // Legacy fallback: frontend/.env if exists
dotenv.config({ path: path.join(__dirname, `../.env.${appEnv}`), override: true });
dotenv.config({ path: path.join(__dirname, "../../backend/.env") }); // Legacy fallback: backend/.env
dotenv.config({ path: path.join(__dirname, `../../backend/.env.${appEnv}`), override: true });

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

function sanitizeMessage(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.replace(/\s+/g, " ").slice(0, 2000);
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

    // Enrich lineItems with per-item direct_cost for breakdown
    const hourlyRate = configSnapshot?.hourly_rate ?? 18000;
    const complexityFactors = configSnapshot?.complexity_factors ?? { low: 1.0, medium: 1.2, high: 1.45 };
    const projectStateMultiplier = context?.project_state === "remodel"
      ? (configSnapshot?.remodel_factor ?? 0.85)
      : 1.0;
    for (const item of lineItems) {
      if (item.include === "yes") {
        const hours = toNumber(item.unit_hours, 0);
        const qty = toNumber(item.quantity, 0);
        const complexity = item.complexity || "medium";
        const factor = complexityFactors[complexity] || 1.2;
        const unitCost =
          toNumber(item.base_cost, 0) > 0
            ? toNumber(item.base_cost, 0)
            : Math.round(hours * factor * hourlyRate);
        item.direct_cost = Math.round(unitCost * qty * projectStateMultiplier);
        item.computed_unit_cost = Math.round(unitCost);
      } else {
        item.direct_cost = 0;
        item.computed_unit_cost = 0;
      }
    }

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

    // Persistir contacto en SQLite leads si viene en el payload
    const contact = req.body.contact;
    if (shouldPersist && db && contact && contact.nombre && contact.email) {
      try {
        createLeadRecord({
          lead_id: `ld_${crypto.randomUUID().replace(/-/g, "")}`,
          quote_id: newQuoteId,
          trace_id: traceId,
          nombre: contact.nombre.trim(),
          email: contact.email.trim().toLowerCase(),
          telefono: (contact.telefono || "").trim(),
          red_social: (contact.red_social || "").trim(),
          mensaje: (contact.mensaje || "").trim(),
          servicio: (contact.servicio || context.project_type || "").trim(),
          created_at: new Date().toISOString(),
        });
      } catch (leadError) {
        console.error("SQLite lead persistence error:", leadError);
      }
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

app.post("/api/quotes/contact", async (req, res) => {
  const traceId = makeTraceId();

  try {
    const contact = req.body?.contact ?? {};
    const quoteRef = req.body?.quote_ref ?? {};

    // Validar campos obligatorios
    if (typeof contact.nombre !== "string" || contact.nombre.trim() === "") {
      return sendError(res, 400, traceId, "validation_error", "REQUIRED_FIELDS", "nombre es obligatorio", [
        { field: "contact.nombre", code: "REQUIRED", message: "nombre es obligatorio" },
      ]);
    }
    if (typeof contact.email !== "string" || contact.email.trim() === "") {
      return sendError(res, 400, traceId, "validation_error", "REQUIRED_FIELDS", "email es obligatorio", [
        { field: "contact.email", code: "REQUIRED", message: "email es obligatorio" },
      ]);
    }

    const leadId = `ld_${crypto.randomUUID().replace(/-/g, "")}`;
    const leadRecord = {
      lead_id: leadId,
      quote_id: (quoteRef?.quote_id || "").trim(),
      trace_id: traceId,
      nombre: contact.nombre.trim(),
      email: contact.email.trim().toLowerCase(),
      telefono: (contact.telefono || "").trim(),
      red_social: (contact.red_social || "").trim(),
      mensaje: sanitizeMessage(req.body?.mensaje || ""),
      servicio: (contact.servicio || "").trim(),
      created_at: new Date().toISOString(),
    };

    if (db) {
      try {
        createLeadRecord(leadRecord);
      } catch (persistError) {
        console.error("SQLite lead persistence error:", persistError);
      }
    } else {
      console.warn("[API] DB not ready — lead not persisted to SQLite");
    }

    return res.status(201).json({
      lead_id: leadId,
      status: "created",
      meta: { trace_id: traceId },
    });
  } catch (err) {
    console.error("[CONTACT-ERROR]", err);
    return sendError(res, 500, traceId, "internal_error", "INTERNAL_ERROR", "Error al guardar contacto");
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

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Quotes API escuchando en http://[IP_ADDRESS]:${PORT}`);
  });
}

export default app;
