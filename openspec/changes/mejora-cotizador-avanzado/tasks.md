# Tasks: Mejora Cotizador Avanzado

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~670 total (PR1: ~470, PR2: ~200) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR #1 (bugfix+backend) → PR #2 (frontend) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Bugfix + Backend (Notion removal + leads) | PR #1 | `main` base |
| 2 | Frontend (paso 2/3 sep + resumen CLP) | PR #2 | `main` base; independent |

## Phase 1: Bugfix

- [x] 1.1 `Avanzada.tsx:124,249`: `"analitica-basica"` → `"analytics"`

## Phase 2: Backend — Notion Removal + SQLite Leads

- [x] 2.1 `backend/.env`: Remove NOTION_TOKEN, NOTION_DB_ID lines
- [x] 2.2 `backend/enviar.php`: Remove persistLeadToNotion(), syncQuoteToNotionBackground(), $notionToken/$notionDbId vars, POST /api/quotes/lead, legacy POST /
- [x] 2.3 `backend/enviar.php`: Add `CREATE TABLE IF NOT EXISTS leads`, createLeadRecord($pdo, $lead)
- [x] 2.4 `backend/enviar.php`: Add POST /api/quotes/contact with validation + SQLite insert
- [ ] 2.5 `backend/enviar.php`: Add `direct_cost` per item in buildTotals() breakdown
- [x] 2.6 `backend/sync/notionSync.js`: DELETE entire file
- [x] 2.7 `backend/db/quotesRepository.js`: Add createLeadRecord, getLeadByEmail

## Phase 3: Frontend — Step 2/3 Separation

- [x] 3.1 `types/index.ts`: RequerimientosData remove `seo` and `analytics` fields
- [x] 3.2 `Avanzada.tsx`: INITIAL_REQUERIMIENTOS with diseno+redaccion only; remove seo/analytics mappings in handleCalcular() and handleFinalSave()
- [x] 3.3 `Avanzada.tsx`: Add useEffect to sync requerimientos→modulos when navigating to paso 3 (diseno=yes→diseno-ui-ux, redaccion=yes→contenido)
- [x] 3.4 `Avanzada.tsx`: Pass `requerimientos` prop to AvanzadaModulos
- [x] 3.5 `AvanzadaRequerimientos.tsx`: Remove SEO+Analytics fieldset; keep only identidad visual + contenidos; rename section
- [x] 3.6 `AvanzadaModulos.tsx`: Accept `requerimientos` prop; full 8-module grid including catálogo

## Phase 4: Frontend — Resumen CLP

- [x] 4.1 `AvanzadaResumen.tsx`: Module cost table with columns: módulo, cantidad, costo unitario (CLP), subtotal (CLP); compute from base_cost or fallback to unit_hours × 18000
- [x] 4.2 `AvanzadaResumen.tsx`: Monthly services section showing plan + amount; breakdown sub-sections for contingency, margin, VAT, discount

## Phase 5: Testing

- [ ] 5.1 `server.test.js`: Add test for POST /api/quotes/contact (201 + 400 scenarios)
- [ ] 5.2 `server.test.js`: Add test for breakdown direct_cost per item
- [ ] 5.3 Manual: verify Analytics in paso 2 pre-selects Analytics in paso 3
- [ ] 5.4 Manual: verify resumen shows unit costs CLP correctly
