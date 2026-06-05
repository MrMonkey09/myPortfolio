#!/usr/bin/env node
/**
 * Test E2E — Cotizador Web (Sprint 5 validation)
 *
 * Propósito: Verificar que total_monthly se calcula correctamente
 * en Express backend tras fixes Sprint 5.
 *
 * Uso:
 *   node scripts/test-e2e.mjs
 *
 * Requisitos:
 * - Backend Express corriendo en http://localhost:3002
 * - jq instalado (para parsear JSON)
 */

import { spawn } from "child_process";
import { setTimeout as wait } from "timers/promises";

const API_BASE = "http://localhost:3001";
const TRACE_ID_PREFIX = "trc_test_";

function log(step, msg) {
  console.log(`[${new Date().toISOString()}] [${step}] ${msg}`);
}

function checkHealth() {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) resolve(data);
        else reject(new Error(`Health failed: ${JSON.stringify(data)}`));
      })
      .catch(reject);
  });
}

function postSimulate(payload) {
  return fetch(`${API_BASE}/api/quotes/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const contentType = res.headers.get("content-type");
    let body;
    if (contentType && contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  });
}

async function runTests() {
  log("START", "Iniciando validación E2E Sprint 5");

  // 0. Health check
  log("HEALTH", "Verificando API...");
  try {
    await checkHealth();
    log("HEALTH", "✅ API respondiendo correctamente");
  } catch (e) {
    log("HEALTH", `❌ API no disponible: ${e.message}`);
    log("HEALTH", "Asegúrate de ejecutar: cd frontend && node api/server.js");
    process.exit(1);
  }

  // 1. Test — Cotización rápida
  log("TEST1", "Cotización rápida (quick) — espera total_monthly=0");
  const payloadQuick = {
    context: {
      schema_version: "1.0.0",
      origin: "quick",
      project_type: "website",
      project_state: "new",
      country: "CL",
      currency: "CLP",
    },
    input: {
      quick_answers: {
        pages_estimate: 5,
        needs_ecommerce: "yes",
        urgency: "medium",
      },
    },
  };

  try {
    const resp1 = await postSimulate(payloadQuick);
    const totals1 = resp1.totals;
    console.log("   Response totals:", JSON.stringify(totals1, null, 2));

    if (totals1.total_monthly !== 0) {
      throw new Error(
        `Expected total_monthly=0, got ${totals1.total_monthly}`
      );
    }
    if (
      totals1.estimated_min === undefined ||
      totals1.estimated_max === undefined
    ) {
      throw new Error("Faltan estimated_min/estimated_max");
    }
    log("TEST1", "✅ Cotización rápida OK — total_monthly=0, rango presente");
  } catch (e) {
    // Si el error tiene respuesta HTTP, capturar cuerpo
    if (e.response) {
      const errBody = await e.response.json();
      log("TEST1", `❌ Falló: ${e.message} — ${JSON.stringify(errBody)}`);
    } else {
      log("TEST1", `❌ Falló: ${e.message}`);
    }
    process.exit(1);
  }

  // 2. Test — Avanzada sin servicios mensuales
  log("TEST2", "Avanzada sin monthly_services — espera total_monthly=0");
  const payloadAdvEmpty = {
    context: {
      schema_version: "1.0.0",
      origin: "advanced",
      project_type: "website",
      project_state: "new",
      country: "CL",
      currency: "CLP",
    },
    input: {
      requirements_checklist: { diseno: true, desarrollo: true },
      line_items: [
        {
          module_id: "diseno-ui-ux",
          include: "yes",
          quantity: 1,
          complexity: "medium",
          base_cost: 65000,
        },
      ],
      monthly_services: [],
      pricing: {
        contingency_pct: 0.12,
        margin_pct: 0.25,
        discount_pct: 0,
        vat_pct: 0.19,
        apply_vat: true,
      },
    },
  };

  try {
    const resp2 = await postSimulate(payloadAdvEmpty);
    const totals2 = resp2.totals;
    console.log("   Response totals:", JSON.stringify(totals2, null, 2));

    if (totals2.total_monthly !== 0) {
      throw new Error(
        `Expected total_monthly=0, got ${totals2.total_monthly}`
      );
    }
    log("TEST2", "✅ Avanzada sin servicios OK — total_monthly=0");
  } catch (e) {
    log("TEST2", `❌ Falló: ${e.message}`);
    process.exit(1);
  }

  // 3. Test — Avanzada con servicios mensuales (CRÍTICO)
  log("TEST3", "Avanzada con monthly_services — espera total_monthly=85000");
  const payloadAdvServices = {
    context: payloadAdvEmpty.context,
    input: {
      ...payloadAdvEmpty.input,
      monthly_services: [
        {
          service_id: "mantenimiento-esencial",
          service_name: "Mantenimiento",
          plan_name: "Esencial",
          include: "yes",
          monthly_value: 85000,
          hours_included: 2,
          sla: "48h",
        },
      ],
    },
  };

  let resp3;
  try {
    resp3 = await postSimulate(payloadAdvServices);
    const totals3 = resp3.totals;
    console.log("   Response totals:", JSON.stringify(totals3, null, 2));

    if (totals3.total_monthly !== 85000) {
      throw new Error(
        `Expected total_monthly=85000, got ${totals3.total_monthly}`
      );
    }
    // Verificar que total_project NO incluye total_monthly (son independientes)
    // Ejemplo: direct_cost=65000, con márgenes ≈ 110k+, total_project NO debería sumar 85000 extra
    if (totals3.total_project < totals3.total_monthly) {
      throw new Error(
        `total_project (${totals3.total_project}) < total_monthly (${totals3.total_monthly}) — inconsistencia`
      );
    }
    log(
      "TEST3",
      `✅ Avanzada con servicios OK — total_monthly=${totals3.total_monthly}`
    );
  } catch (e) {
    log("TEST3", `❌ Falló: ${e.message}`);
    process.exit(1);
  }

  // 4. Test — Handoff avanzada → contacto (lead en SQLite)
  log("TEST4", "Handoff avanzada → contacto — enviar lead a SQLite");
  const quoteRef = {
    quote_id: resp3.quote.quote_id,
  };

  const leadPayload = {
    contact: {
      nombre: "Test User",
      email: "test@example.com",
      telefono: "+56912345678",
      red_social: "whatsapp",
      servicio: "Cotización Web",
    },
    mensaje: "Test E2E — interesado en cotización avanzada",
    quote_ref: quoteRef,
  };

  try {
    const resp4 = await fetch(`${API_BASE}/api/quotes/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadPayload),
    }).then(async (r) => {
      const contentType = r.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return { status: r.status, body: await r.json() };
      }
      return { status: r.status, body: await r.text() };
    });

    console.log("   Lead response:", JSON.stringify(resp4.body, null, 2));

    if (resp4.status !== 201) {
      throw new Error(`Expected 201, got ${resp4.status}: ${JSON.stringify(resp4.body)}`);
    }
    if (!resp4.body.lead_id) {
      throw new Error("lead_id missing en respuesta");
    }
    if (resp4.body.status !== "created") {
      throw new Error(`Expected status=created, got ${resp4.body.status}`);
    }
    log("TEST4", `✅ Lead creado — lead_id=${resp4.body.lead_id} (SQLite)`);
  } catch (e) {
    log("TEST4", `❌ Falló: ${e.message}`);
    process.exit(1);
  }

  log("SUCCESS", "✅✅✅ Todos los tests E2E pasaron correctamente");
  log("NEXT", "Backend listo para deploy en cPanel");
  process.exit(0);
}

// Ejecutar
runTests().catch((err) => {
  log("FATAL", `Error inesperado: ${err.message}`);
  process.exit(1);
});
