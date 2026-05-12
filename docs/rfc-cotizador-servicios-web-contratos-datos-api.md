# RFC-002 — Contratos de Datos y API para Cotizador Web

- **Estado:** Propuesto
- **Fecha:** 2026-05-11
- **Depende de:** `docs/rfc-cotizador-servicios-web.md` (RFC-001)
- **Repositorio:** `myPortfolio`
- **Ámbito:** Modelo de datos, contratos API, validaciones y trazabilidad

---

## 1. Resumen ejecutivo

Este RFC define el **idioma común** entre frontend, backend y capa comercial del cotizador web.  
Su objetivo es eliminar ambigüedades al implementar:

1. Estructuras de datos de cotización.
2. Contratos de request/response de API.
3. Reglas de validación.
4. Estrategia de versionado y trazabilidad.

La decisión central es usar un **modelo canónico de cotización** con `schema_version` y `pricing_config_version`, para que cada simulación sea auditable y reproducible.

---

## 2. Objetivos

- Definir entidades y campos obligatorios para rápida/avanzada/contacto.
- Definir endpoints y payloads de integración.
- Definir errores estandarizados de validación y dominio.
- Definir versión de esquema y snapshot de parámetros.

## 2.1 Fuera de alcance

- Diseño visual de pantallas.
- Persistencia física específica (tabla exacta, proveedor DB).
- Autenticación avanzada de usuarios (si aplica a futuro).

---

## 3. Principios de contrato

1. **Canónico y explícito:** un payload principal para todas las simulaciones.
2. **Tolerante en entrada, estricto en salida:** aceptar variantes razonables, responder formato fijo.
3. **Versionado explícito:** siempre incluir `schema_version` y `pricing_config_version`.
4. **Inmutabilidad de snapshot:** una cotización no cambia por ajustes futuros de pricing.
5. **Errores accionables:** cada error debe indicar campo, código y mensaje humano.

---

## 4. Modelo canónico de datos

## 4.1 `QuoteContext`

Contexto del proyecto y origen de la simulación.

```json
{
  "schema_version": "1.0.0",
  "origin": "advanced",
  "project_type": "ecommerce",
  "project_state": "remodelacion",
  "priority": "alta",
  "country": "CL",
  "currency": "CLP"
}
```

### Campos

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `schema_version` | string | sí | versión del contrato |
| `origin` | enum | sí | `advanced` `quick` `direct_contact` |
| `project_type` | enum/string | sí | landing/corporativa/catalogo/ecommerce/otro |
| `project_state` | enum | sí | `nuevo` `remodelacion` |
| `priority` | enum | no | `baja` `media` `alta` `urgente` |
| `country` | string | no | ISO2 recomendado |
| `currency` | string | sí | p.ej. `CLP` |

---

## 4.2 `PricingConfigSnapshot`

Parámetros comerciales usados en el cálculo (congelados por simulación).

```json
{
  "pricing_config_version": "2026.05.11",
  "hourly_rate": 18000,
  "complexity_factors": { "low": 1.0, "medium": 1.2, "high": 1.45 },
  "urgency_factors": { "normal": 1.0, "high": 1.25 },
  "contingency_pct": 0.12,
  "margin_pct": 0.25,
  "discount_pct": 0.0,
  "vat_pct": 0.19,
  "apply_vat": true,
  "remodel_factor": 0.85
}
```

---

## 4.3 `QuoteLineItem`

Línea calculable por módulo.

```json
{
  "module_id": "ecommerce-payment-gateway",
  "module_name": "Pasarela de pago",
  "category": "Ecommerce",
  "include": "yes",
  "quantity": 1,
  "complexity": "medium",
  "unit_hours": 16,
  "project_factor": 0.85,
  "base_hours": 16,
  "adjusted_hours": 13.6,
  "base_cost": 244800,
  "notes": "Requiere credenciales sandbox/prod"
}
```

### Reglas

- `include` admite: `yes` `optional` `no`.
- Solo `include = yes` participa en el total final.
- `quantity` >= 0 (entero recomendado).

---

## 4.4 `MonthlyServiceItem`

```json
{
  "service_id": "maintenance-essential",
  "service_name": "Mantenimiento",
  "plan_name": "Esencial",
  "include": "yes",
  "monthly_value": 85000,
  "hours_included": 2,
  "sla": "48h"
}
```

---

## 4.5 `QuoteTotals`

```json
{
  "direct_cost": 1000000,
  "contingency_value": 120000,
  "subtotal_with_contingency": 1120000,
  "margin_value": 280000,
  "subtotal_net": 1400000,
  "discount_value": 0,
  "total_net": 1400000,
  "vat_value": 266000,
  "total_project": 1666000,
  "total_monthly": 85000
}
```

---

## 4.6 `QuoteRecord` (objeto completo)

```json
{
  "quote_id": "qt_01J...",
  "created_at": "2026-05-11T14:00:00Z",
  "status": "simulated",
  "context": {},
  "pricing_snapshot": {},
  "line_items": [],
  "monthly_services": [],
  "totals": {},
  "assumptions": [
    "Plazo sujeto a entrega de contenidos y accesos",
    "No incluye costos de terceros"
  ],
  "exclusions": [
    "Dominio",
    "Hosting",
    "Licencias premium"
  ],
  "payment_terms": "50% inicio / 50% antes de publicación",
  "validity_days": 10
}
```

---

## 5. Contratos API propuestos

> Se usa prefijo `/api/quotes` como namespace lógico. El path final puede ajustarse según convención backend.

## 5.1 `POST /api/quotes/simulate`

Calcula cotización (rápida o avanzada) sin cerrar lead obligatorio.

### Request (mínimo)

```json
{
  "context": {
    "schema_version": "1.0.0",
    "origin": "quick",
    "project_type": "corporativa",
    "project_state": "nuevo",
    "currency": "CLP"
  },
  "input": {
    "line_items": [],
    "quick_answers": {
      "pages_estimate": "5-8",
      "needs_ecommerce": false,
      "urgency": "normal"
    }
  }
}
```

### Response 200

```json
{
  "quote": { "quote_id": "qt_...", "status": "simulated" },
  "totals": { "total_project": 0, "total_monthly": 0 },
  "breakdown": [],
  "meta": {
    "schema_version": "1.0.0",
    "pricing_config_version": "2026.05.11"
  }
}
```

---

## 5.2 `POST /api/quotes/lead`

Crea lead comercial con contexto de cotización (reemplaza o complementa `enviar.php`).

### Request

```json
{
  "contact": {
    "name": "Cliente Demo",
    "email": "demo@correo.cl",
    "phone": "+56...",
    "preferred_channel": "whatsapp"
  },
  "quote_ref": {
    "quote_id": "qt_01J...",
    "origin": "advanced",
    "total_project": 1666000,
    "total_monthly": 85000
  },
  "message": "Quiero avanzar con esta simulación"
}
```

### Response 201

```json
{
  "lead_id": "ld_01J...",
  "status": "created",
  "crm_sync": "queued"
}
```

---

## 5.3 `GET /api/quotes/{quote_id}`

Obtiene una simulación guardada para mostrar resumen o reanudar flujo.

### Response 200

`QuoteRecord` completo.

---

## 5.4 `POST /api/quotes/validate`

Valida entrada sin calcular total (útil para UX multipaso).

### Response 200

```json
{
  "valid": false,
  "errors": [
    {
      "code": "LINE_ITEM_COMPLEXITY_REQUIRED",
      "field": "line_items[0].complexity",
      "message": "La complejidad es obligatoria cuando include es yes"
    }
  ]
}
```

---

## 6. Especificación de errores

Formato estándar:

```json
{
  "error": {
    "type": "validation_error",
    "code": "INVALID_REQUEST",
    "message": "Hay campos inválidos",
    "details": [
      { "field": "context.currency", "code": "REQUIRED", "message": "currency es obligatoria" }
    ],
    "trace_id": "trc_..."
  }
}
```

### Tipos

- `validation_error`
- `domain_error`
- `conflict_error`
- `internal_error`

### Códigos de dominio sugeridos

- `LINE_ITEM_NOT_FOUND`
- `LINE_ITEM_COMPLEXITY_REQUIRED`
- `INCLUDE_VALUE_INVALID`
- `PRICING_CONFIG_NOT_AVAILABLE`
- `VAT_CONFIGURATION_INVALID`
- `QUOTE_NOT_FOUND`

---

## 7. Validaciones de negocio mínimas

1. `schema_version` obligatorio.
2. `currency` obligatoria.
3. Si `include = yes` entonces `quantity > 0` y `complexity` obligatoria.
4. `discount_pct` entre 0 y 1.
5. `contingency_pct`, `margin_pct`, `vat_pct` entre 0 y 1.
6. Si `apply_vat=false` entonces `vat_value=0`.
7. `total_project >= 0`.

---

## 8. Versionado y compatibilidad

## 8.1 `schema_version`

- Define versión del contrato payload/API.
- Cambios breaking incrementan major (`2.0.0`).
- Cambios aditivos incrementan minor (`1.1.0`).

## 8.2 `pricing_config_version`

- Define versión de parámetros comerciales.
- Se registra en cada simulación.
- Permite reproducir cotizaciones históricas.

---

## 9. Mapeo con backend actual (`enviar.php`)

## Estado actual

- Recibe contacto genérico y servicio textual.
- Normaliza categorías de servicio a pocas etiquetas.
- Crea página Notion.

## Evolución contractual

- Mantener endpoint actual como compatibilidad transitoria.
- Nuevo payload debe incluir `quote_ref` y resumen de totales.
- Evitar perder granularidad de cotización en mapeo de servicio.

---

## 10. Seguridad y privacidad (mínimo contractual)

- No registrar secretos ni credenciales de terceros en texto libre.
- Limitar campos de contacto a datos necesarios.
- Sanitizar texto libre (`message`, `notes`).
- Registrar `trace_id` para observabilidad sin exponer detalles internos.

---

## 11. Casos de prueba de contrato (obligatorios)

1. Simulación rápida válida (sin line_items explícitos).
2. Simulación avanzada con line_items mixtos (`yes/optional/no`).
3. `apply_vat=false` retorna `vat_value=0`.
4. `discount_pct` inválido (>1) retorna `validation_error`.
5. `include=yes` sin complejidad retorna error de dominio.
6. Consulta de `quote_id` inexistente retorna `QUOTE_NOT_FOUND`.

---

## 12. Plan de tareas (contratos/API)

## Fase 1 — Contrato canónico

- [ ] Congelar `QuoteRecord` v1.0.0.
- [ ] Congelar enums y nomenclaturas (`origin`, `include`, `complexity`).
- [ ] Publicar ejemplos oficiales de request/response.

## Fase 2 — Validaciones

- [ ] Implementar validadores de esquema.
- [ ] Implementar validadores de dominio.
- [ ] Estandarizar envelope de errores.

## Fase 3 — Endpoints

- [ ] Exponer `simulate`, `lead`, `get quote`, `validate`.
- [ ] Integrar `quote_ref` con flujo comercial actual.
- [ ] Mantener compatibilidad controlada con endpoint legado.

## Fase 4 — Observabilidad y trazabilidad

- [ ] Persistir `schema_version` y `pricing_config_version`.
- [ ] Agregar `trace_id` en respuestas.
- [ ] Definir política de retención de simulaciones.

---

## 13. Criterios de aceptación del RFC

- [ ] Frontend y backend acuerdan payload canónico único.
- [ ] Se aprueba catálogo de errores y códigos.
- [ ] Se aprueba estrategia de versionado.
- [ ] Se aprueba compatibilidad transitoria con flujo actual.

---

## 14. Preguntas abiertas

1. ¿Dónde se almacenará `QuoteRecord` (Notion, DB propia, híbrido)?
2. ¿Cuál será la ventana de retención de simulaciones?
3. ¿La respuesta rápida muestra total único o rango?
4. ¿Qué campos exactos del resumen deben ser obligatorios para CRM?

---

## 15. Próximo paso recomendado

Con RFC-001 y RFC-002 aprobados, crear **RFC-003 de UX y estados de flujo multipaso** para cerrar criterios de interacción, mensajes y comportamiento de validaciones en frontend.
