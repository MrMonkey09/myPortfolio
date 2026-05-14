# RFC-005 — Modelo de Datos Profesional (Upgrade v2.0.0)

- **Estado:** Propuesto
- **Fecha:** 2026-05-14
- **Depende de:** `docs/rfc-002-cotizador-servicios-web-contratos-datos-api.md`
- **Repositorio:** `myPortfolio`
- **Ámbito:** Modelo de datos para generación de Excel profesional

---

## 1. Resumen ejecutivo

Este RFC propone una mejora profunda al modelo de datos del cotizador web para alinearlo con la **Plantilla Madre de Cotizaciones (Excel)**. El objetivo es capturar toda la información estratégica y técnica necesaria para que un agente de IA pueda generar automáticamente la propuesta formal en Excel sin intervención manual.

---

## 2. Cambios en el Esquema (v2.0.0)

Se introducen nuevas secciones en el payload de la cotización:

### 2.1 `client_data` (Datos del Cliente)
Campos requeridos para la carátula comercial:
- `empresa`, `rut`, `contacto_nombre`, `email`, `telefono`, `ciudad_pais`.
- `dominio_estado`, `hosting_estado`, `sitio_actual_url`, `referencia_visual_url`.
- `objetivo_principal`, `fecha_deseada`, `publico_objetivo`.
- `prioridad` (`baja`, `media`, `alta`, `urgente`).
- `observaciones_comerciales`, `notas_internas`.

### 2.2 `config_snapshot` (Gobernanza de Precios)
Congela los parámetros usados para que el Excel sea reproducible:
- `hourly_rate`, `contingency_pct`, `margin_pct`, `vat_pct`, `remodel_factor`.
- Factores de complejidad (`low`, `medium`, `high`).

### 2.3 `cronograma` (Planificación)
Fases del proyecto para la hoja de cronograma:
- Lista de fases con `nombre`, `duracion_dias`, `entregable` y `responsable`.

### 2.4 `checklist_requerimientos` (Validación de Alcance)
Checklist estructurado para la hoja de requerimientos:
- Lista de items con `categoria`, `nombre` y `estado` (`si`, `no`, `pendiente`).

---

## 3. Impacto en Endpoints

### `POST /api/quotes/simulate`
Debe aceptar el nuevo bloque `client_data` y `cronograma`. 
Aunque sea una simulación rápida, se pueden enviar placeholders que luego se completan en la fase avanzada.

### `POST /api/quotes/lead`
Debe capturar la `quote_ref` y asegurar que el lead en Notion tenga acceso a todos los datos de la simulación v2.

---

## 4. Estrategia de Persistencia (SQLite)

La tabla `quotes` mantendrá su estructura pero el campo `input_json` seguirá el nuevo esquema estricto v2.0.0. 
Se recomienda actualizar `server.js` para validar estos campos.

---

## 5. Mapeo a Notion

Se agregarán las siguientes propiedades a la base de datos de Notion (si existen):
- **RUT** (Text)
- **Prioridad** (Select)
- **Fecha Deseada** (Date)
- **Objetivo** (Text)
- **Empresa** (Text)

---

## 6. Próximos Pasos

1. Actualizar `frontend/src/types/index.ts` con las nuevas interfaces.
2. Modificar `frontend/api/server.js` para soportar el nuevo payload.
3. Actualizar la lógica de `buildTotals` para usar los factores del snapshot si se proveen.
4. Extender `backend/sync/notionSync.js` para el mapeo enriquecido.
