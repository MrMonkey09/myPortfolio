# Sprint 1 — Cotización Avanzada Core

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `1` (implementación avanzada core)
- **Estado:** `Cerrado`
- **Fecha inicio:** `2026-05-11`
- **Framework de ejecución:** `sdd-tdd`
- **Modo de ejecución:** `automatic`
- **Artifact store:** `engram`
- **Estrategia de entrega:** `auto-chain` (PRs encadenados ante riesgo alto)
- **Estrategia de cadena:** `stacked-to-main`
- **Regla operativa de seguimiento:** `Actualizar este mismo documento (sprint-1.md) en cada avance relevante de planificación, definición o desbloqueo.`

---

## Objetivo del Sprint 1

Implementar la pantalla de cotización avanzada completa (5 pasos según RFC-003) con motor de cálculo en backend ya existente. MVP: usuario llena los pasos, obtiene resumen con factores comerciales y puede derivar a contacto.

---

## Alcance del Sprint 1

1. **Pantalla avanzada — UI de 5 pasos** (Contexto → Requerimientos → Módulos → Ajustes comerciales → Resumen)
2. **Factores comerciales configurables** (urgencia, contingencia, margen, descuento, IVA)
3. **Servicios mensuales recurrentes** (integración total_monthly en buildTotals)
4. **Handoff a contacto** (derivación con contexto enriquecido)
5. **Backend listo** (ya soporta advanced origin + pricing override)

---

## Entradas obligatorias (documentos rectores)

- `docs/manual-biblia-subida-nivel-portfolio-cotizador.md`
- `docs/sprints/sprint-0.md` (estado cerrado)
- `docs/rfc-cotizador-servicios-web-ux-flujo-multipaso.md` (RFC-003)
- `docs/rfc-cotizador-servicios-web-contratos-datos-api.md` (RFC-002)
- `docs/rfc-cotizador-servicios-web.md` (RFC-001)
- `docs/decision-log-cotizador.md`

---

## Plan de trabajo Sprint 1

| Prioridad | Entregable | Descripción | Estado |
|---|---|---|---|
| P1 | Pantalla avanzada — UI 5 pasos | Componente completo con flujos, estados, validaciones | ✅ Completado |
| P1 | Factores comerciales en UI | Sliders/inputs para contingencia, margen, descuento, IVA | ✅ Completado |
| P1 | Integración total_monthly | Backend calcula servicios mensuales, frontend muestra | ✅ Completado |
| P1 | Handoff avanzada → contacto | Resumen con CTA multicanal (WhatsApp/Correo/Agendar) | ✅ Completado |
| P2 | Paridad PHP (avanzada) | Endpoint `origin=advanced` funciona en backend PHP | ✅ Completado |

---

## Definition of Done (DoD)

- [x] Pantalla avanzada renderiza 5 pasos navegables (Contexto → Requerimientos → Módulos → Ajustes → Resumen)
- [x] Cada paso valida campos obligatorios antes de avanzar
- [x] Factores comerciales (contingency, margin, discount, VAT) se envían al endpoint y afectan el cálculo
- [x] `total_monthly` se calcula correctamente a partir de servicios mensuales
- [x] Resumen muestra desglose completo (costo directo, contingencia, margen, descuento, IVA, rango estimado, confianza)
- [x] CTA "Contactar ahora" envía contexto enriquecido a contacto
- [x] Backend PHP parity: `origin=advanced` con pricing override funciona en `enviar.php`
- [x] No se rompen flujos existentes (rápida, contacto legacy)

---

## Stack técnico

- **Frontend**: React 18 + Vite 7 + JavaScript (JSX)
- **Backend Express**: `frontend/api/server.js` — endpoint `POST /api/quotes/simulate`
- **Backend PHP**: `backend/enviar.php` — paridad avanzada
- **Persistencia**: Notion-first (lead submission)
- **Navegación**: `ContactoNavegacionContext.tsx` (handoff avanzada pre-cableado)

---

## Riesgos identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Complejidad UI 5 pasos excede scope | Media | Alto | Dividir en commits atómicos por paso |
| R2 | Servicios mensuales no integrados en backend | Baja | Medio | Agregar lógica en buildTotals() antes de UI |
| R3 | Deriva de diseño vs RFC-003 | Media | Medio | Validar cada paso contra RFC-003 antes de avanzar |

---

## Bitácora de avances

> Regla: cada actualización debe indicar fecha, cambio, impacto y próximo paso.

### 2026-05-11 — Creación y planificación Sprint 1

- **Cambio:** se crea documento Sprint 1 con metadata `automatic` + `engram` + `auto-chain`.
- **Impacto:** queda marco operativo formal para implementar cotización avanzada sin improvisación.
- **Próximo paso:** ejecutar SDD phases para planificar implementación en detalle.

### 2026-05-11 — Work-Unit A completada (fundamentos y tipos)

- **Cambio:** se implementan tipos avanzados en `types/index.ts` (AdvancedFormState, ContextoData, RequerimientosData, ModuloLinea, AjustesComerciales, MonthlyService), se crea `Avanzada/Configuracion.ts` con módulos y servicios predefinidos, y se crea índice del módulo.
- **Impacto:** base sólida de tipos para todo el desarrollo posterior de la cotización avanzada.
- **Commit:** `feat(cotizador): work-unit A — fundamentos y tipos para cotización avanzada`
- **Próximo paso:** implementar componentes de pasos (Work-Unit B).

### 2026-05-11 — Work-Unit B completada (componentes de pasos)

- **Cambio:** se implementan los 5 componentes de paso (AvanzadaContexto, AvanzadaRequerimientos, AvanzadaModulos, AvanzadaAjustes, AvanzadaResumen) con validación local, estilos CSS completos para navegación stepper y formularios.
- **Impacto:** interfaz de usuario completa para los 5 pasos de la cotización avanzada.
- **Commit:** `feat(cotizador): work-unit B — componentes de pasos para cotización avanzada`
- **Próximo paso:** implementar contenedor principal con orquestación y conexión API (Work-Unit C).

### 2026-05-11 — Work-Unit C completada (integración API y handoff)

- **Cambio:** se crea `Avanzada.tsx` como contenedor principal con orchestación de 5 pasos, integración con `simulateQuickQuote` (origin=advanced), pre-carga de handoff desde contexto de navegación, handlers `handleRecalculate` y `handleContactarAhora` completos. Se actualiza `Servicios.tsx` para renderizar `Avanzada` condicionalmente.
- **Impacto:** flujo completo ponta a punta: rápida → avanzada → resumen → contacto enriquecido.
- **Commit:** `feat(cotizador): work-unit C — integración API y handoff para cotización avanzada`
- **Próximo paso:** verificar paridad backend y cálculo total_monthly (Work-Unit D).

### 2026-05-11 — Work-Unit D completada (paridad backend y total_monthly)

- **Cambio:** se actualiza `buildTotals()` en `server.js` para calcular `total_monthly` desde servicios mensuales, se verifica paridad PHP en `enviar.php` para `origin=advanced` con `monthly_services`.
- **Impacto:** backend calcula correctamente servicios recurrentes y frontend puede mostrar total mensual.
- **Commit:** `feat(cotizador): work-unit D — paridad backend y total_monthly`
- **Próximo paso:** ejecutar SDD verify y cerrar Sprint 1.

### 2026-05-11 — Sprint 1 cerrado (verificación SDD completa)

- **Cambio:** se ejecuta SDD verify con resultado 100% compliance (F1-F8 PASS, backend total_monthly PASS, PHP parity PASS, servicios integration PASS). No critical issues encontrados.
- **Impacto:** Sprint 1 queda formalmente cerrado con todos los Deliverables completados y verificados.
- **DoD:** 8/8 items completados ✅
- **Próximo paso:** planificar Sprint 2 (fase escalamiento con persistencia híbrida SQLite+Notion).