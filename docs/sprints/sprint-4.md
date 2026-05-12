# Tasks: Sprint 4 — Telemetría y Optimización de Conversión

```markdown
- **Sprint:** `4`
- **Estado:** `En Progreso`
- **Fecha inicio:** `2026-05-12`
- **Framework:** `sdd-tdd`
- **Modo:** `automatic`
- **Artifact store:** `engram`
- **Estrategia de entrega:** `auto-chain`
- **Estrategia de cadena:** `stacked-to-main`

## Stack Técnico Actual

| Capa | Tecnologías | Notas |
|------|-------------|-------|
| Frontend | React 19 + TypeScript | App shell Vite 7 |
| Framework frontend | Vite 7 (dev + production bundling) | HMR enabled, esbuild loader |
| Backend API | Express 5 (Node.js runtime) | CommonJS/ESM dual format |
| Data Layer | `dataLayer[]` GA4 + localStorage (offline cache) | Persistencia híbrida MVP |
| Analytics | Google Analytics 4 (gtag().js SDK v1.0.0) | Property: G-Q9YEJ3S0R9 |
```

## Plan de Trabajo por Work-Units

### ✅ Bloque A — Instrumentación de código (Core Telemetry Module)

| Work-Unit | Status | Descripción | Líneas estimadas | PR | Completado en (UTC) |
|-----------|--------|-------------|------------------|-----|---------------------|
| **A.1** | 📝 *En Progreso* | `useAnalytics` hook con 10 helper functions de tracking, interfaces TypeScript + dataLayer singleton | ~180 líneas nuevas | #1 | `--:-- UTC` |
| **A.2+A.3** | 🔴 Pendiente | Servicios.tsx + Avanzada.tsx instrumentation (hook calls + useEffect timers) | ~50 líneas modificadas | #2 | Pending |
| **A.4** | ⚪ No iniciado | 5 step components view events (Contexto/Requerimientos/Módulos/Ajustes/Resumen) | ~25 líneas por componente | #3 | Not started |

### ✅ Bloque B+C+D — Documentación y configuración

| Work-Unit | Status | Descripción | PR |
|-----------|--------|-------------|-----|
| **B** | 📝 *Pending* | Referencia docs/GA4-telemetria-guia.md para admin conversion markings | #4 |
| **C.1** | ✅ Created | `docs/GA4-telemetria-guia.md` — guía de uso completo (8 sections + 10 eventos) | #5 |
| **C.2** | 📝 *Pending* | `docs/sprints/sprint-4.md` actualizado con metadata, plan table y bitácora (este archivo) | Current |
| **D.1** | ⚪ No iniciado | `docs/ab-tests.json` — registry AB test (AB-001 CTA copy, AB-002 disclaimer position) | #6 |

## Phase 1: Core Telemetry Module (Foundation)

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 (180 new, 170 modified) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | useAnalytics hook → GA4 instrumentation → Documentation |
| Chain strategy | stacked-to-main |
| Decision needed before apply | No |

## Implementation Order

1. **Phase 1**: complete `useAnalytics` module hook first (all other tasks depend on this)
2. **Phase 2-4**: Instrumentation across cotizador flows (sequential, no parallelism)
3. **Phase 5-7**: Documentation after instrumentation completes but before final verification (B+C+D can be written independently and PR'd together as #4)

### Cadena de entrega recomendada (auto-chain strategy):

| Orden | PR # | Work-Units incluidos | Merge-after-review-by |
|-------|------|---------------------|----------------------|
| 1. Foundation | #1 | A.1 useAnalytics hook module (dataLayer + interfaces) | QA technical review |
| - Documentation | N/A | B documentation written now → ready for PR #4 after implementation verified | User acceptance (ga4.google.com walkthrough test) |
| 2-3. Frontend instrumentation | #2, #3 | A.2+A.3 + A.4 (cotizador flows + step components) | QA manual testing (browser console filtering check) |
| 4. Final docs | #4 | B+C+D GA4 guide + user training materials in docs/ | UAT (user non-technical acceptance of guide clarity) |

---

## Next Step (Work-Unit D: A/B tests file planned)

Ready para crear `docs/ab-tests.json` con AB-001 y AB-002 registrados.

- [ ] **A.1** Create `frontend/src/hooks/useAnalytics.ts` with module-level dataLayer guard, `track(event, properties)` dispatcher wrapping gtag() with fallback, interfaces `AnalyticsEvent` and `UseAnalytics`, helper functions `trackQuickStarted`, `trackQuickCalculated`, `trackQuickContactClick`, `trackAdvancedModeSwitch`, `trackAdvancedStepViewed`, `trackAdvancedStepCompleted`, `trackAdvancedCalculated`, `trackAdvancedAbandoned`, `trackContactSubmitted`, `trackValidationFailed`, trace_id from `crypto.randomUUID()`, DEV mode console logs with 🔍 prefix, fire-and-forget (no await)
  - **AC**: All 10 helpers present, dataLayer singleton guarded, crypto fallback works, DEV logging verified, TypeScript compilation passes
  - **Estimate**: 4h • **Rollback**: Delete hook file

## Work-Unit B: Documentación de Configuración GA4 (References Only)

### B.1 — Referencia docs/GA4-telemetria-guia.md
- [ ] **B.1.1** El administrador/usuario no técnico puede acceder GA4 con propiedad G-Q9YEJ3S0R9
- [ ] **B.1.2** Sección clara de eventos del cotizador con tabla mapeos: evento GA4 → Significado de Negocio → Métrica Clave
- [ ] **B.1.3** Guías paso a paso para crear embudos Quick (2 pasos) y Advanced (5+2+1 pasos) con interpretación de tasas
- [ ] **B.1.4** Instrucciones: Informes semanales, Exportar a Google Sheets, Plantilla cálculo KPIs conversion_rate

## Work-Unit C: Actualización Sprint Doc + User Guide Completa

### C.1 — `docs/GA4-telemetria-guia.md`
- [ ] **C.1.1** Acceso y configuración (URL + property ID G-Q9YEJ3S0R9 + menú lateral)
- [ ] **C.1.2** Tabla de 10 eventos con significado de negocio para no teco users
- [ ] **C.1.3** Crear embudos Quick Flow + Advanced Flow con pasos exactos y guardar como favorito
- [ ] **C.1.4** Reportes Semanales: cómo acceder, filtros time range, compartir por email
- [ ] **C.1.5** Exportar a Google Sheets: conectar propiedad + plantillas de cálculo KPI (conversion rate, abandon rate)
- [ ] **C.1.6** Interpretación de métricas con checklist semanal: abandono (>40%), conversión global (5-10% target), Quick vs Advanced balance
- [ ] **C.1.7** KPIs de negocio: leads generados (cotizador_contact_submitted weekly count), costo por lead estimado, valor promedio cotización, top 3 módulos más seleccionados
- [ ] **C.1.8** Debugging: DevTools console filter 🔍 Analytics + GA4 DebugView + latencia típica 24-48h para appearance in standard reports

### C.2 — `docs/sprints/sprint-4.md` (this file) Update con metadata, plan table y DoD
- [ ] **C.2.1** Metadata block actualizado con estado `En Progreso`, fecha inicio 2026-05-12
- [ ] **C.2.2** Stack técnico completo: React 19 + Vite 7 + Express 5 + GA4 gtag()
- [ ] [✓ Done] Work-unit status en plan table (A.4 ⚪, B+C+D 📝 pending)
- [ ] **C.2.3** DoD checklist: code compilation passes (no TS errors), browser console logs verificados, GA4 DebugView testeo manual, JSON schema validation ab-tests.json

## Work-Unit D: A/B Test Framework Registered

### D.1 — `docs/ab-tests.json`
- [ ] **D.1.1** File con AB-001 CTA copy optimization {control: "Contactar ahora", variant: "¿Hablamos? Agenda una llamada"}
- [ ] **D.1.2** AB-002 disclaimer position {control: static_at_bottom, variant: sticky_container}
- [ ] **D.1.3** Schema valido con fields: hypothesis, metric (GA4 event combinations), target_lift (%)%, status (registered)

## Phase 5: GA4 Configuration Documentation (Moved — see Work-Unit B above)

## Phase 6: User Guide + Test Evidence (Renamed C.1-C.2 for clarity, moved up)

- [ ] **A.2.1** Instrument `handleQuickSimulate` submit handler with `trackQuickStarted()` call before fetch request
  - **AC**: Event fires on form submit, includes mode="quick" in payload
- [ ] **A.2.2** Add POST response success tracking with `trackQuickCalculated()` after `/api/quotes/simulate` resolves
  - **AC**: Event fires on successful simulation (status 200)
- [ ] **A.2.3** Wire "Contactar ahora" CTA click to `trackQuickContactClick()` with properties { quoteId, total }
  - **AC**: Click handler calls track with correct metadata
- [ ] **A.2.4** Add "Refinar en avanzada" mode switch with `trackAdvancedModeSwitch(mode="advanced")`
  - **AC**: Mode toggle triggers tracking event

## Phase 3: Avanzada.tsx Advanced Flow Orchestrator

- [ ] **A.3.1** Create stepTimers `Map<number, number>` for tracking entry times on component mount via useEffect
  - **Accumulate**: performance.now() timestamp when each step renders
- [ ] **A.3.2** useEffect track step viewed on each render with `trackAdvancedStepViewed({ stepN, timeOnStep_ms })` before unmount
  - **AC**: Uses setTimeout to measure duration correctly
- [ ] **A.3.3** Effect cleanup: track abandonment via setTimeout clearing logic, unbound events logged as dropped
  - **AC**: Cleanup runs on component unmount with correct trace_id

## Phase 4: Step Component Instrumentation (5 Components)

### AvanzadaContexto.tsx (Step 1)
- [ ] **A.4.1** Mount effect: `trackAdvancedStepViewed({ stepN: 1 })` at component lifecycle begin
  - **AC**: Event fires on first render, no user interaction needed

### AvanzadaRequerimientos.tsx (Step 2)
- [ ] **A.4.2** Mount effect: track step 2 viewed with same pattern as Step 1
  - **AC**: Consistent across flow, includes proper trace_id propagation
- [ ] **A.4.3** Input change events: no tracking required (per spec, only view/complete)

### AvanzadaModulos.tsx (Step 3)
- [ ] **A.4.4** Mount effect: track step 3 viewed via useEffect with performance.now() timing
  - **AC**: Measures actual user dwell time on module selection screen

### AvanzadaAjustes.tsx (Step 4)
- [ ] **A.4.5** Mount/tracker effects: Step 4 view tracking + CTA button enabled/disabled sync
  - **AC**: Tracks only when form valid (enabled state)

### AvanzadaResumen.tsx (Step 5)
- [ ] **A.4.6** Mount: View summary event with `trackAdvancedStepViewed({ stepN: 5 })`
  - **AC**: Summary render triggers tracking
- [ ] **A.4.7** CTA "Contactar ahora" click: Fire contact form submission event `trackContactSubmitted()`
  - **AC**: Click handler dispatches to analytics with full quote metadata
- [ ] **A.4.8** Validation error display: Optional non-intrusive tracking (per spec, not required)

## Phase 5: GA4 Configuration Documentation

- [ ] **B.1.1** Reference `docs/GA4-telemetria-guia.md` created by Work-Unit C for goal configuration steps
- [ ] **B.1.2** Document admin conversion marking via GA4 Admin → Events → Conversions page
- [ ] **B.1.3** Document funnel creation via Engage → Explorations → Free form funnel report
  - **AC**: Steps verifiable in GA4 interface

## Phase 6: User Guide + Test Evidence

### docs/GA4-telemetria-guia.md (Work-Unit C)
- [ ] **C.1** Access GA4 via ga4.google.com with property ID G-Q9YEJ3S0R9
- [ ] **C.2** Locate funnel reports: Engage → Conversions → Funnel Explorer
  - **AC**: Screenshots or step-by-step paths included
- [ ] **C.3** Create custom exploration for step drop-off (Advanced Flow 5 steps)
- [ ] **C.4** Key metrics to monitor weekly list: abandonment rate per step, conversion %, avg time_on_step
- [ ] **C.5** Export to Google Sheets via Reports → Download link
- [ ] **C.6** Business glossary mapping each event (cotizador_*) to business outcome lead

### docs/sprints/sprint-4.md (Sprint Master Doc)
- [ ] **C.7** Full metadata header (sprint 4, automatic, engram, auto-chain, stacked-to-main)
- [ ] **C.8** Objective section with scope, plan table, DoD checklist referencing RFC-003 §14 backlog items
- [ ] **C.9** Stack technical specs (React 19 + Vite 7 + Express 5)
- [ ] **C.10** Work-Unit A through D summary with estimated lines (~300 for A, ~200 for documentation)

## Phase 7: A/B Test Framework (Work-Unit D)

### docs/ab-tests.json
- [ ] **D.1.1** Define `ABTest` interface/type with hypothesis, variation_a, variation_b, winner field
- [ ] **D.1.2** Register AB-001: CTA copy test {variation_a: "Contactar ahora", variation_b: "¿Hablamos? Agenda una llamada"}
- [ ] **D.1.3** Register AB-002: Disclaimer position test (static bottom vs sticky container)
  - **AC**: JSON schema valid, both variations documented with measurable differences

## Phase 8: Verification & Testing (Quality Gates)

- [ ] **B.2.1** Test browser console 🔍 filtering for all analytics events across Quick Flow path
- [ ] **B.2.2** Manual end-to-end test: Submit form → Check GA4 DebugView (requires user access or simulator)
  - **AC**: All expected events appear with correct properties, no console errors
- [ ] **D.2** Validate ab-tests.json against schema via `npx ajv-cli validate`

## Bitácora de Avances (To Be Filled During Execution)

**Formato:** `[YYYY-MM-DD] Task X/Y complete: <descripción>`

| Fecha | Work-Unit | Status | Acción / Resultado | Próximo paso |
|-------|-----------|--------|-------------------|--------------|
| `2026-05-12` | A.1 | ✅ Completing | Hook module en desarrollo con gtag() abstraction + interfaces | Build test compile |
| `2026-05-12` | B+C+D | 📝 In Progreso | docs/GA4-telemetria-guia.md escrito (435 lines) + sprint-update + ab-tests.json planned | Finalizar JSON y PR #4 |
| `--:--` | A.2+A.3 | ⚪ Pendiente | Servicios.tsx + Avanzada.tsx instrumentation no iniciada | Apply useAnalytics hook calls after A.1 passes tests |
| `--:--` | A.4 | ⚪ Pending | Step components view tracking pending code review after implementation phase | After all telemetry hooks verified working |

---

## DoD Checklist (Definition of Done)

### ✅ Criterios Técnicos Obligatarios

- [ ] **Code compilation** — No TypeScript errors en `frontend/` dir (`tsc --noEmit`)
- [ ] **Browser console logs** — Todos los eventos con marcador `🔍 [Analytics]` visibles
- [ ] **GA4 DebugView** — Al menos 1 evento testado enviado con propiedades correctas (modo sandbox/test property)
- [ ] **JSON validation** — `ab-tests.json` es válido (schema checked via ajv-cli o online validator)

### ✅ Criterios de Documentación

- [ ] docs/GA4-telemetria-guia.md tiene 8 secciones completas + tabla de 10 eventos
- [ ] docs/sprints/sprint-4.md tiene metadata block, plan table con status, DoD checklist, bitácora de avances (este documento)
- [ ] docs/ab-tests.json contiene AB-001 y AB-002 registrados con hypothesis + metric + target_lift

### ✅ Criterios de Entrega y Cadena

- [ ] Work-units A.1-A.4 completados y PR #1, #2, #3 merged al main (o staged pending merge)
- [ ] Work-units B+C+D (docs) en PR #4 listo para merged-to-main después de verification
- [ ] Todos los cambios documentados en commit message convencional (`feat(cotizador): <descripción>`)


1. **Phase 1**: useAnalytics module first (all other tasks depend on this)
2. **Phase 2-4**: Instrumentation across cotizador flows (sequential, no parallelism)
3. **Phase 5-7**: Documentation after implementation completes (reference working code)
4. **Phase 8**: Final verification, manual testing in browser

## Next Step

Ready for **sdd-apply**. Reviewers should verify:
- Tasks grouped logically by work-unit dependencies
- Effort estimates realistic (<5h/item for pure frontend changes)
- Acceptance criteria verifiable via console logs / GA4 interface
- 400-line budget respected via chained PR strategy
