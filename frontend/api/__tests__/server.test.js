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
    // 10 hours * 25000 = 250000 direct cost.
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
});
