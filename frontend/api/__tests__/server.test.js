/**
 * Manual testing notes for frontend scenarios (no automated test available):
 *
 * 5.3 — Analytics preselection sync (AvanzadaRequerimientos → AvanzadaModulos)
 *   1. Abrir /servicios/avanzada
 *   2. En Paso 2, responder "Sí" a "¿Necesitás analítica y métricas?"
 *   3. Avanzar al Paso 3
 *   4. ✓ Verificar que el módulo "Analítica y Métricas" esté pre-seleccionado
 *   5. Volver al Paso 2, cambiar a "No"
 *   6. Avanzar al Paso 3
 *   7. ✓ Verificar que Analytics esté des-seleccionado
 *
 * 5.4 — Resumen con desglose de costos CLP
 *   1. Completar cotización avanzada hasta Paso 5 (Resumen)
 *   2. ✓ Verificar que la tabla "Desglose por Módulo" muestre:
 *      - Nombre del módulo
 *      - Cantidad
 *      - Costo Unitario (CLP)
 *      - Subtotal (CLP)
 *   3. ✓ Verificar que los totales (Proyecto + Mensual) tengan valores > 0
 *   4. ✓ Verificar que "Estructura de Costos" muestre desglose pricing
 *   5. Abrir DevTools → Network, enviar lead de contacto
 *   6. ✓ Verificar POST /api/quotes/contact devuelva 201
 */

import request from 'supertest';
import app from '../server.js';

describe('Quotes API v2.0.0 Contracts', () => {
  it('should return 200 and correct totals for a valid v2.0.0 payload', async () => {
    const payload = {
      context: {
        schema_version: "2.0.0",
        origin: "advanced",
        project_type: "web_app",
        project_state: "new",
        currency: "CLP"
      },
      input: {
        line_items: [
          {
            module_id: "m1",
            module_name: "Auth",
            category: "core",
            include: "yes",
            quantity: 1,
            complexity: "high",
            unit_hours: 10
          }
        ],
        apply_vat: true
      },
      client_data: {
        empresa: "Test Corp",
        rut: "12.345.678-9",
        prioridad: "alta"
      },
      config_snapshot: {
        hourly_rate: 25000
      }
    };

    const response = await request(app)
      .post('/api/quotes/simulate')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.totals).toBeDefined();
    expect(response.body.meta.schema_version).toBe("2.0.0");
    // 10 hours * 25000 * 1.45 (high) = 362500 direct cost.
    // Plus margin/contingency defined in server.js defaults...
    expect(response.body.totals.direct_cost).toBeGreaterThan(0);
  });

  it('should reject invalid payload with 400', async () => {
    const response = await request(app)
      .post('/api/quotes/simulate')
      .send({ invalid: 'data' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.type).toBe('VALIDATION_ERROR');
  });

  it('should include per-item direct_cost and computed_unit_cost in breakdown', async () => {
    const payload = {
      context: {
        schema_version: "2.0.0",
        origin: "advanced",
        project_type: "web_app",
        project_state: "new",
        currency: "CLP"
      },
      input: {
        line_items: [
          {
            module_id: "m1",
            module_name: "Auth",
            category: "core",
            include: "yes",
            quantity: 2,
            complexity: "medium",
            unit_hours: 8
          },
          {
            module_id: "m2",
            module_name: "Dashboard",
            category: "core",
            include: "no",
            quantity: 1,
            complexity: "high",
            unit_hours: 16
          }
        ],
        apply_vat: true
      },
      config_snapshot: {
        hourly_rate: 18000
      }
    };

    const response = await request(app)
      .post('/api/quotes/simulate')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.breakdown).toHaveLength(2);

    // m1 (include=yes): 8h * 1.2 (medium) * 18000 = 172800/unit * 2 = 345600
    const m1 = response.body.breakdown.find((i) => i.module_id === "m1");
    expect(m1.direct_cost).toBe(345600);
    expect(m1.computed_unit_cost).toBe(172800);

    // m2 (include=no): direct_cost = 0
    const m2 = response.body.breakdown.find((i) => i.module_id === "m2");
    expect(m2.direct_cost).toBe(0);
    expect(m2.computed_unit_cost).toBe(0);
  });
});

describe('POST /api/quotes/contact', () => {
  it('should return 201 with valid contact payload', async () => {
    const response = await request(app)
      .post('/api/quotes/contact')
      .send({
        contact: {
          nombre: "Juan Pérez",
          email: "juan@test.com",
          telefono: "+56912345678",
          red_social: "linkedin"
        },
        mensaje: "Quiero una cotización para mi negocio",
        quote_ref: {
          quote_id: "qt_test123"
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("created");
    expect(response.body.lead_id).toMatch(/^ld_/);
  });

  it('should return 400 when nombre is missing', async () => {
    const response = await request(app)
      .post('/api/quotes/contact')
      .send({
        contact: {
          email: "juan@test.com"
        }
      });

    expect(response.status).toBe(400);
    expect(response.body.error.type).toBe("validation_error");
    expect(response.body.error.code).toBe("REQUIRED_FIELDS");
  });

  it('should return 400 when email is missing', async () => {
    const response = await request(app)
      .post('/api/quotes/contact')
      .send({
        contact: {
          nombre: "Juan Pérez"
        }
      });

    expect(response.status).toBe(400);
    expect(response.body.error.type).toBe("validation_error");
    expect(response.body.error.code).toBe("REQUIRED_FIELDS");
  });
});
