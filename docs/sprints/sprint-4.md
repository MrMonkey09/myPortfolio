# Sprint 4 — Telemetría y Optimización de Conversión

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `4` (madurez operativa)
- **Estado:** `En Progreso`
- **Fecha inicio:** `2026-05-12`
- **Framework:** `sdd-tdd`
- **Modo de ejecución:** `automatic`
- **Artifact store:** `engram`
- **Estrategia de entrega:** `auto-chain`
- **Estrategia de cadena:** `stacked-to-main`

---

## Objetivo del Sprint 4

Instrumentar telemetría completa del cotizador para medir embudo de conversión, identificar puntos de abandono, y habilitar optimización basada en datos. Con GA4 ya instalado pero sin eventos custom, el objetivo es cerrar el gap de visibilidad del comportamiento de usuarios.

---

## Alcance del Sprint 4

| Work-Unit | Descripción | Prioridad |
|-----------|-------------|-----------|
| A | Capa de telemetría — useAnalytics hook + instrumentación en 9 componentes | P1 |
| B | GA4 Goals y embudos — documentación de configuración | P1 |
| C | Dashboard de conversión — guía GA4 + Google Sheets | P1 |
| D | Test A/B framework — registro de hipótesis | P2 |

---

## Entradas obligatorias (documentos rectores)

- `docs/manual-biblia-subida-nivel-portfolio-cotizador.md`
- `docs/rfc-cotizador-servicios-web-ux-flujo-multipaso.md` (RFC-003 §14 — telemetría pendiente)
- `docs/sprints/sprint-3.md` (estado cerrado)
- `docs/sprints/sprint-2.md` (estado cerrado)
- `docs/sprints/sprint-1.md` (estado cerrado)
- `docs/sprints/sprint-0.md` (estado cerrado)

---

## Plan de trabajo

| Work-Unit | Descripción | Estado |
|-----------|-------------|--------|
| A.1 | useAnalytics hook (10 helpers, dataLayer, gtag, trace_id) | ✅ Completado |
| A.2 | Servicios.tsx Quick Flow instrumentation | ✅ Completado |
| A.3 | Avanzada.tsx step tracking + timers | ✅ Completado |
| A.4 | 5 step components (view events + Resumen CTA) | ✅ Completado |
| B | Documentación configuración GA4 | ✅ Completado |
| C | docs/GA4-telemetria-guia.md (8 secciones) | ✅ Completado |
| D | docs/ab-tests.json (AB-001, AB-002) | ✅ Completado |
| Verificación | Fix typos + duplicate JSX encontrados en SDD verify | ✅ Completado |

---

## Stack técnico

| Capa | Tecnología | Notas |
|------|------------|-------|
| Frontend | React 19 + TypeScript + Vite 7 | SPA con path aliases `@/` |
| Analytics | GA4 property G-Q9YEJ3S0R9 | gtag.js deferred, GTM-K8TXDJXQ |
| Hook | `frontend/src/hooks/useAnalytics.ts` | Singleton module pattern |

---

## Entregables

### useAnalytics hook

- 10 funciones helper exportadas (`trackQuickStarted`, `trackQuickCalculated`, `trackContactSubmitted`, `trackAdvancedModeSwitch`, `trackAdvancedStepViewed`, `trackAdvancedStepCompleted`, `trackAdvancedCalculated`, `trackAdvancedAbandoned`, `trackContactSubmitted`, `trackValidationFailed`)
- dataLayer singleton + gtag() fallback
- DEV mode con 🔍 prefix
- trace_id persistente en sessionStorage con crypto.randomUUID()

### Componentes instrumentados

- `Servicios.tsx` — Quick Flow: started, calculated (success/error), contact click, mode switch
- `Avanzada.tsx` — step viewed/completed/abandoned con performance.now()
- `AvanzadaContexto.tsx` — step 1 viewed
- `AvanzadaRequerimientos.tsx` — step 2 viewed
- `AvanzadaModulos.tsx` — step 3 viewed
- `AvanzadaAjustes.tsx` — step 4 viewed
- `AvanzadaResumen.tsx` — step 5 viewed + calculated + contact submitted

### Documentación

- `docs/GA4-telemetria-guia.md` — guía completa 8 secciones
- `docs/ab-tests.json` — AB-001 (CTA copy), AB-002 (disclaimer position)
- `docs/sprints/sprint-4.md` — este documento

---

## Definition of Done

- [x] useAnalytics hook creado con 10 helpers y sin errores de compilación
- [x] Servicios.tsx instrumentado (Quick Flow)
- [x] Avanzada.tsx instrumentado (step tracking + timers)
- [x] 5 step components con trackAdvancedStepViewed en mount
- [x] AvanzadaResumen con trackAdvancedCalculated + trackContactSubmitted
- [x] GA4 guía completa con tabla de eventos
- [x] ab-tests.json con AB-001 y AB-002
- [x] Lint pasa sin errores en archivos Sprint 4
- [x] Fix de typos y duplicate JSX aplicado

---

## Bitácora de avances

> Regla: cada actualización debe indicar fecha, cambio, impacto y próximo paso.

### 2026-05-12 — Work-Unit A.1 completada (useAnalytics hook)

- **Cambio:** se crea `frontend/src/hooks/useAnalytics.ts` con 10 funciones helper, dataLayer singleton, gtag() wrapper, trace_id con crypto.randomUUID(), DEV logging con 🔍.
- **Impacto:** base del sistema de telemetría lista para instrumentar en todos los flujos.
- **Commit:** `dfe291b feat(cotizador): work-unit A.1 — useAnalytics hook con telemetría GA4`

### 2026-05-12 — Work-Unit A.2 completada (Servicios.tsx)

- **Cambio:** se instrumenta Quick Flow con trackQuickStarted/trackQuickCalculated/trackQuickContactClick/trackAdvancedModeSwitch en los handlers correspondientes.
- **Impacto:** Quick Flow completamente trackeado.
- **Commit:** `869e1cf feat(cotizador): work-unit A.2 — instrumentar eventos Quick Flow en Servicios.tsx`

### 2026-05-12 — Work-Unit A.3 completada (Avanzada.tsx)

- **Cambio:** se instrumenta tracking de pasos en Avanzada.tsx con stepTimers Map y performance.now().
- **Impacto:** Advanced Flow con medición de tiempo por paso.
- **Commit:** `7e3f5be feat(cotizador): work-unit A.3 — instrumentar tracking de pasos avanzada`

### 2026-05-12 — Work-Units B+C+D completadas (documentación)

- **Cambio:** se crea GA4-telemetria-guia.md (435 líneas, 8 secciones), ab-tests.json (AB-001+AB-002), actualización de sprint-4.md.
- **Impacto:** documentación completa para configuración GA4 y framework A/B testing.
- **Commit:** `07b63f1 feat(cotizador): work-units B+C+D — documentación GA4 y guía`

### 2026-05-12 — Work-Unit A.4 completada (5 step components)

- **Cambio:** se instrumentan los 5 componentes de pasos con trackAdvancedStepViewed en mount. Se añade trackAdvancedCalculated + trackContactSubmitted en AvanzadaResumen.
- **Impacto:** todos los flujos del cotizador con eventos de telemetría.
- **Commit:** `e2b0962 feat(cotizador): work-unit A.4 — instrumentar eventos en 5 step components`

### 2026-05-12 — SDD verification fixes

- **Cambio:** se corrigen typos encontrados en SDD verify: `avanza daHandoffContext` → `advancedHandoffContext` en Avanzada.tsx y duplicate JSX en AvanzadaResumen.tsx.
- **Impacto:** lint pasa sin errores en archivos del Sprint 4.
- **Commit:** `3ddccd8 fix(cotizador): corregir typos y duplicate JSX en Avanzada (Sprint 4 verification)`

### 2026-05-12 — Sprint 4 en progreso

- **Cambio:** Sprint 4 con todas las work-units completadas y verificadas. DoD 9/9 ✅.
- **Impacto:** telemetría instrumentada en todos los flujos del cotizador. GA4 listo para configurar embudos.
- **Próximo paso:** push a origin/dev y configurar GA4 goals en ga4.google.com siguiendo docs/GA4-telemetria-guia.md.
