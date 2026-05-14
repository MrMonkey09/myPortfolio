# RFC-004 — Benchmark Adjustments y Gobernanza Documental

- **Estado:** Propuesto
- **Fecha:** 2026-05-11
- **Depende de:**
  - `docs/rfc-cotizador-servicios-web.md` (RFC-001)
  - `docs/rfc-cotizador-servicios-web-contratos-datos-api.md` (RFC-002)
  - `docs/rfc-cotizador-servicios-web-ux-flujo-multipaso.md` (RFC-003)
- **Motivación:** Hallazgos de `docs/investigacion-cotizadores-mercado-actual.md`

---

## 1. Resumen ejecutivo

Este RFC aplica ajustes de mercado sobre RFC-001/002/003 para mejorar conversión y realismo comercial del cotizador.

Además, formaliza la restricción de plataforma:

- **Backend objetivo:** JavaScript/PHP compatible con hosting cPanel.
- **Persistencia a evaluar:** Notion-only, SQLite-only o híbrido.

---

## 2. Cambios de gobernanza (patch normativo)

## 2.1 Cambio A — Resultado principal en rango referencial

### Decisión

El resultado visible al usuario debe priorizar **rango estimado** (`desde X hasta Y`) y no solo total puntual.

### Patch sobre RFC-001

- Agregar requisito funcional: salida dual (`rango` + `valor puntual calculado`).
- Mensaje obligatorio: “La cotización final se confirma tras validar requerimientos”.

### Patch sobre RFC-002

Agregar en `QuoteTotals`:

```json
{
  "estimated_min": 1400000,
  "estimated_max": 1850000,
  "total_project": 1666000
}
```

---

## 2.2 Cambio B — Nuevos parámetros de contexto (benchmark)

### Decisión

Incorporar variables comunes en cotizadores líderes para mejorar precisión percibida.

### Patch sobre RFC-002 (`QuoteContext`)

Agregar campos:

- `industry` (retail/salud/logistica/etc.)
- `product_stage` (`idea` `poc` `mvp` `full` `redesign` `maintenance`)
- `expected_users_range` (`<10000` `10000-100000` `>100000` `internal_only`)
- `platform_scope` (`web` `mobile` `both` `web_plus_admin`)

### Patch sobre RFC-003

- Incluir estos campos en modo rápido y avanzada (paso contexto).

---

## 2.3 Cambio C — Reporte compartible

### Decisión

Toda simulación calculada debe poder compartirse en formato resumen.

### Patch sobre RFC-002

Agregar en `QuoteRecord`:

```json
{
  "share_token": "qsh_01J...",
  "share_url": "https://.../cotizador/resumen/qsh_01J..."
}
```

### Patch sobre RFC-003

- En resumen final, agregar acción “Compartir estimación”.

---

## 2.4 Cambio D — CTA multicanal post-resumen

### Decisión

Después del cálculo, mostrar contacto por:

1. WhatsApp
2. Correo
3. Agendamiento

### Patch sobre RFC-003

- Reemplazar CTA única por bloque de CTA multicanal con pre-carga de contexto de cotización.

---

## 2.5 Cambio E — Nivel de confianza

### Decisión

Mostrar nivel de confianza de estimación para gestionar expectativa comercial.

### Patch sobre RFC-002

Agregar en respuesta de `simulate` y `QuoteRecord`:

```json
{
  "confidence_level": "medium"
}
```

Valores permitidos: `low` `medium` `high`.

### Reglas sugeridas

- `quick` con datos mínimos -> `low` / `medium`
- `advanced` con datos completos -> `high`

---

## 3. Decisión de stack backend (cPanel)

## 3.1 Restricción aprobada

El backend debe ser compatible con **cPanel**, priorizando:

- **PHP** como runtime principal de API.
- **JavaScript** en frontend y, solo si cPanel lo permite en ese hosting, para tooling/build y posibles servicios auxiliares.

### Norma de compatibilidad

La solución final NO debe depender de infraestructura fuera del alcance operativo del cPanel contratado para funcionar en producción básica.

---

## 4. Estrategias de persistencia (Notion vs SQLite vs Híbrido)

## 4.1 Opción 1 — Notion-only

### Pros

- Implementación comercial rápida.
- Visibilidad inmediata para gestión manual de leads.
- Bajo costo inicial operativo.

### Contras

- Limitaciones para consultas complejas/versionado técnico.
- Dependencia de API externa y límites/rate.
- Menor control transaccional para lógica de cotización avanzada.

### Cuándo conviene

Etapa inicial enfocada en captura comercial y validación rápida del flujo.

---

## 4.2 Opción 2 — SQLite-only

### Pros

- Control total del modelo y consultas.
- Muy buena trazabilidad y versionado local.
- Sin dependencia externa para datos críticos.

### Contras

- Más trabajo operativo para vista comercial/CRM.
- Requiere definir procesos de backup/administración en cPanel.

### Cuándo conviene

Cuando el foco es robustez técnica y evolución del motor de cotización.

---

## 4.3 Opción 3 — Híbrido (recomendación arquitectónica)

### Modelo

- **SQLite** = fuente de verdad de cotizaciones y cálculos.
- **Notion** = vista comercial/sincronización de leads y resúmenes.

### Pros

- Balance entre control técnico y operación comercial.
- Permite analítica y auditoría interna sin perder rapidez de gestión.

### Contras

- Mayor complejidad de sincronización.
- Requiere reglas claras de consistencia y reintentos.

### Norma propuesta

Si existe divergencia, prevalece SQLite como verdad del cálculo y Notion como proyección comercial.

---

## 5. ADRs adicionales

## ADR-004 — Backend cPanel-first (PHP compatible)

- **Decisión:** Diseñar APIs compatibles con despliegue PHP en cPanel.
- **Motivo:** restricción operativa declarada por negocio.
- **Consecuencia:** evitar dependencias de infraestructura no garantizada.

## ADR-005 — Persistencia híbrida preferida

- **Decisión:** Recomendar SQLite + Notion en etapas maduras.
- **Motivo:** equilibrio entre rigor técnico y operación comercial.
- **Consecuencia:** diseñar sincronización y trazabilidad desde el inicio.

---

## 6. Checklist de actualización documental

- [ ] RFC-001 actualizado con salida en rango y disclaimer obligatorio.
- [ ] RFC-002 actualizado con nuevos campos de contexto, `estimated_min/max`, `confidence_level`, `share_token`.
- [ ] RFC-003 actualizado con CTA multicanal y paso de contexto ampliado.
- [ ] Definida política de persistencia inicial (Notion/SQLite/Híbrido) por etapa.

---

## 7. Próximo paso recomendado

Crear `docs/decision-log-cotizador.md` para registrar la decisión final de persistencia por fase:

1. Fase MVP
2. Fase escalamiento
3. Fase operación estable

y evitar cambios implícitos de arquitectura durante implementación.
