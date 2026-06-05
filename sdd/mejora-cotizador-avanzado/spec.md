# Delta Specs: mejora-cotizador-avanzado

## 1. Frontend — Module ID Bugfix

### MODIFIED: Module Sync in Avanzada.tsx
Previously: `"analitica-basica"` at L124/L249 broke analytics propagation.

The system MUST map `requerimientos.analytics` to `module_id: "analytics"` in both `handleFinalSave()` and `handleCalcular()` sync logic.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Analytics propagates | user sets `requerimientos.analytics = "yes"` in paso 2 | paso 3 renders or calculation triggers | module `analytics` has `include = "yes"`; `analitica-basica` is NOT used |
| Analytics unchecked | user sets `requerimientos.analytics = "no"` | sync logic runs | module `analytics` remains `include = "no"` (user may override in paso 3) |

## 2. Frontend — Paso 2 Conversacional

### MODIFIED: AvanzadaRequerimientos.tsx — Eliminar SEO y Analytics
Previously: 4 fields (diseño, redacción, SEO, analytics) as technical checklist.

The system MUST present paso 2 as a conversational diagnosis with exactly 2 fields: identidad visual (diseno) and contenido (redaccion). SEO and Analytics MUST NOT appear.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Solo diagnóstico visual+contenido | paso 2 renders | user sees form | 2 radio-button groups shown: identidad visual (Sí/No) and contenido (Yo entrego/Necesito) |

### ADDED: Auto-config of paso 3 from paso 2
The system MUST pre-select paso 3 checkboxes based on paso 2: `diseno=yes` → check "Diseño UI/UX"; `redaccion=yes` → check "Copywriting". User MAY override manually.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| User needs both | diseno=yes, redaccion=yes | paso 3 loads | Diseño UI/UX and Copywriting checked |
| User needs neither | diseno=no, redaccion=no | paso 3 loads | both unchecked, user can still toggle |
| User overrides | diseno=yes auto-checks design | user unchecks in paso 3 | design deselected despite paso 2 answer |

## 3. Frontend — Paso 3 Module Grid

### MODIFIED: Full 8-module grid
The system MUST display all 8 modules in paso 3: Páginas/secciones (number input), Diseño UI/UX, Copywriting, SEO Pro, Analytics, Ecommerce, Backend/API, Catálogo de Productos (all checkboxes except pages).

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| All modules visible | paso 3 renders | checking DOM | 8 module entries present with correct controls |
| Catálogo appears | user views paso 3 | scroll to grid | Catálogo de Productos module visible and togglable |

## 4. Frontend — Resumen Cost Breakdown

### MODIFIED: AvanzadaResumen.tsx — module-level cost table
Previously: list with name, quantity, complexity only — no unit cost or subtotal.

The system MUST display a breakdown table: módulo, cantidad, costo unitario (CLP), subtotal (CLP). Monthly services MUST show selected plans with amounts. If backend omits `direct_cost`, frontend MUST compute `unit_hours × hourly_rate × quantity × complexity_factor`.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Backend provides costs | breakdown has direct_cost per item | resumen renders | table shows name, qty, unit cost, subtotal in CLP |
| Backend omits costs | breakdown lacks direct_cost | resumen renders | frontend computes from unit_hours, hourly_rate, qty, complexity |
| Monthly services | serviciosMensuales has items with include=yes | resumen renders | separate section lists each plan with monthly amount |

## 5. Backend — Per-Module direct_cost

### MODIFIED: buildTotals() in enviar.php
Previously: `buildTotals()` returned aggregate values only; breakdown had no per-item cost.

The system MUST include `direct_cost` per item in the breakdown response: `round(unit_hours × hourly_rate × quantity × complexity_factor)`.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Line items with costs | POST /api/quotes/simulate with 3 line items | buildTotals() runs | each breakdown item has direct_cost; totals.direct_cost matches sum |
| Zero-quantity modules | line item with include=yes, quantity=0 | buildTotals() runs | direct_cost = 0 for that item |

## 6. Backend — Notion Removal + SQLite Leads

### REMOVED: Notion persistence
- `backend/sync/notionSync.js` — entire file deleted
- `persistLeadToNotion()`, `syncQuoteToNotionBackground()` — removed from enviar.php
- Endpoints `POST /api/quotes/lead`, legacy `POST /` — removed
- `.env`: `NOTION_TOKEN`, `NOTION_DB_ID` — removed
(Reason: migrate from Notion to local SQLite.)

### ADDED: SQLite leads table
Table `leads`: `lead_id TEXT PK`, `quote_id TEXT`, `trace_id TEXT`, `nombre TEXT`, `email TEXT`, `telefono TEXT`, `red_social TEXT`, `mensaje TEXT`, `servicio TEXT`, `created_at TEXT`.

### ADDED: POST /api/quotes/contact
Simple endpoint persisting contact to `leads` table. Returns 201 on success, 400 on validation error.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Valid contact | POST with nombre, email, telefono | /api/quotes/contact | 201, row inserted in leads, returns {lead_id, status:"created"} |
| Missing fields | POST without nombre | /api/quotes/contact | 400 with validation errors, no row inserted |
| persist=true simulate | POST /api/quotes/simulate with persist=true + contact | simulation succeeds | quote in `quotes` AND contact in `leads`; no Notion call |

### ADDED: Leads CRUD in quotesRepository.js
Functions: `createLeadRecord(lead)`, `getLeadByTraceId(traceId)`, `getLeadByEmail(email)` against `leads` table using prepared statements.
