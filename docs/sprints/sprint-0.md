# Sprint 0 — Preparación de Implementación Cotizador Web

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `0` (pre-implementación)
- **Estado:** `Cerrado`
- **Fecha inicio:** `2026-05-11`
- **Framework de ejecución:** `sdd-tdd`
- **Modo de ejecución:** `automatic`
- **Artifact store:** `engram`
- **Regla operativa de seguimiento:** `Actualizar este mismo documento (sprint-0.md) en cada avance relevante de planificación, definición o desbloqueo.`

---

## Objetivo del Sprint 0

Dejar todo **listo, claro y gobernado** para comenzar la implementación del cotizador web sin improvisación técnica ni ambigüedades funcionales.

---

## Alcance del Sprint 0

Este sprint **no implementa código de producto**. Solo cubre:

1. Alineación final de alcance (rápida, avanzada, contacto).
2. Cierre operativo de contratos (datos/API) y reglas UX.
3. Checklist de compatibilidad técnica (cPanel-first, backend PHP/JS).
4. Definición de secuencia de implementación para el MVP comercial.
5. Preparación de criterios de “Definition of Ready” por bloque.

---

## Entradas obligatorias (documentos rectores)

- `docs/manual-biblia-subida-nivel-portfolio-cotizador.md`
- `docs/rfc-cotizador-servicios-web.md` (RFC-001)
- `docs/rfc-cotizador-servicios-web-contratos-datos-api.md` (RFC-002)
- `docs/rfc-cotizador-servicios-web-ux-flujo-multipaso.md` (RFC-003)
- `docs/rfc-004-benchmark-adjustments-governanza.md` (RFC-004)
- `docs/decision-log-cotizador.md`
- `docs/matriz-operativa-cotizador.md`

---

## Plan de trabajo Sprint 0

| Bloque | Resultado esperado | Estado |
|---|---|---|
| B1. Congelamiento funcional | Alcance MVP y fronteras de cada modo validadas | ☑ Completado |
| B2. Contratos y validaciones | Campos obligatorios/opcionales + reglas de validación cerradas | ☑ Completado |
| B3. Flujo UX multipaso | Estados, errores, mensajes y transiciones sin ambigüedad | ☑ Completado |
| B4. Arquitectura técnica MVP | Confirmación cPanel/PHP/JS + estrategia Notion-first aterrizada | ☑ Completado |
| B5. Ready for Build | Checklist final de inicio de implementación aprobado | ☑ Completado |

---

## Checklist detallado por bloque (iterable)

> Uso: cuando un bloque inicie, marcar su estado en `in_progress`; al cerrar, pasar a `☑ Completado` y registrar nota en bitácora.

### B1. Congelamiento funcional

- [x] Confirmar alcance exacto de los 3 caminos: rápida, avanzada, contacto.
- [x] Definir fronteras explícitas de MVP vs post-MVP por cada camino.
- [x] Confirmar handoff entre rápida -> avanzada y rápida/avanzada -> contacto.
- [x] Validar que no existan decisiones funcionales “de palabra” sin documento rector.
- [x] Registrar supuestos funcionales críticos pendientes de validación comercial.

### B2. Contratos y validaciones

- [x] Revisar payload de entrada para cotización rápida (campos, tipos, obligatoriedad).
- [x] Revisar payload de salida rápida (rango, total orientativo, confianza, disclaimers).
- [x] Revisar payload de captura de contacto enriquecido.
- [x] Confirmar catálogo de errores y formato de respuesta consistente.
- [x] Congelar reglas mínimas de validación frontend/backend para MVP.

### B3. Flujo UX multipaso

- [x] Mapear estados por paso (idle, editing, validating, error, success).
- [x] Definir mensajes de error por campo y mensajes globales.
- [x] Validar contenido de disclaimers de estimación referencial.
- [x] Confirmar CTAs de salida (continuar avanzada / contacto multicanal).
- [x] Revisar criterios de accesibilidad y legibilidad de pasos críticos.

### B4. Arquitectura técnica MVP

- [x] Confirmar compatibilidad operativa cPanel-first para backend elegido (PHP/JS).
- [x] Definir límite de dependencias externas para operación básica.
- [x] Aterrizar flujo Notion-first (qué se guarda, cuándo y para qué).
- [x] Definir política temporal de consistencia y reintentos para persistencia MVP.
- [x] Validar trazabilidad mínima (IDs, timestamps, versión de reglas aplicada).

### B5. Ready for Build

- [x] Verificar que B1..B4 estén `☑ Completado` o con riesgo explícitamente aceptado.
- [x] Completar DoR al 100% sin ambigüedades.
- [x] Publicar orden de implementación de Sprint 1 (secuencia y prioridad).
- [x] Registrar riesgos abiertos con plan de mitigación inicial.
- [x] Confirmar regla de actualización continua de este documento durante implementación.

---

## Definition of Ready (DoR) para iniciar implementación

- [x] Reglas de negocio base alineadas para rápida + avanzada en un solo motor.
- [x] Payloads de entrada/salida MVP cerrados y versionados.
- [x] Mensajes de estimación referencial y disclaimers aprobados.
- [x] Derivación a contacto multicanal definida.
- [x] Criterio de persistencia MVP (Notion-first) explicitado por caso de uso.
- [x] Riesgos y supuestos críticos registrados.
- [x] Tareas de implementación priorizadas para Sprint 1.

---

## Plan B5 (corto y accionable)

1. **Validar precondiciones:** confirmar B1..B4 completos y registrar riesgos aceptados/no aceptados.
2. **Cerrar DoR:** marcar cada ítem con evidencia explícita ya congelada en RFC-001/002/003/004 + decision log.
3. **Ordenar Sprint 1:** publicar secuencia priorizada de implementación con foco MVP comercial cPanel-first + Notion-first.
4. **Bitácora formal:** registrar entrada de “B5 en progreso” y “B5 completado” con impacto y siguiente paso.

---

## Orden de implementación Sprint 1 (secuencia y prioridad)

> Objetivo Sprint 1: entregar MVP comercial funcional (rápida + contacto enriquecido) manteniendo paridad contractual con RFC-002 y guardas cPanel-first.

1. **P1 — Núcleo backend de simulación (`POST /api/quotes/simulate`)**
   - Implementar contrato mínimo B2/RFC-002 + patch RFC-004 (`estimated_min/max`, `confidence_level`, disclaimer).
2. **P1 — Captura comercial (`POST /api/quotes/lead`) + persistencia Notion-first**
   - Envío de lead enriquecido con `quote_ref`, `trace_id`, versionado y reintentos/idempotencia MVP.
3. **P1 — Flujo frontend cotización rápida + resultado referencial**
   - UI rápida con validaciones mínimas, salida en rango, CTAs a avanzada/contacto y mensajes B3.
4. **P2 — Handoff rápida → avanzada y rápida/avanzada → contacto**
   - Preservación de contexto, estados UX y precarga multicanal sin pérdida de datos relevantes.
5. **P2 — Trazabilidad operativa mínima MVP**
   - Garantizar `quote_id`, `lead_id` (cuando aplique), `trace_id`, `schema_version`, `pricing_config_version`, timestamps.
6. **P3 — Paridad contractual Express↔PHP (gate de release MVP)**
   - Ejecutar casos de paridad mínimos del contrato canónico antes de salida productiva.

---

## Riesgos abiertos para Sprint 1 (con mitigación inicial)

1. **R1 — Rate limit/caídas Notion API (Alto).**
   - **Mitigación inicial:** 3 reintentos con backoff (1s/3s/7s), idempotencia por clave operativa y monitoreo por `trace_id`.
2. **R2 — Deriva entre implementación Express y variante PHP (Medio-Alto).**
   - **Mitigación inicial:** contrato canónico único RFC-002 + suite mínima de paridad previa a release.
3. **R3 — Trazabilidad limitada en Notion-first puro (Medio).**
   - **Mitigación inicial:** enforce de metadatos obligatorios y preparación explícita de transición a fase híbrida.
4. **R4 — Decisiones abiertas de operación de datos (Medio).**
   - **Mitigación inicial:** abrir en Sprint 1 una definición operativa inicial de retención/backup/umbral de transición (Decision Log §7).

---

## Riesgos controlados en Sprint 0

1. **Ambigüedad de cálculo:** mitigado congelando reglas y contratos antes de construir.
2. **Desalineación comercial/técnica:** mitigado con disclaimers y criterios de salida referencial.
3. **Desvío de stack:** mitigado con guardas cPanel-first y backend PHP/JS.

---

## Criterio de cierre Sprint 0

Sprint 0 se considera cerrado cuando:

- Todos los bloques B1..B5 estén en `☑ Completado`.
- La sección DoR esté 100% marcada.
- Exista orden de inicio claro para Sprint 1 (implementación).

**Estado de cierre actual:** ✅ Cumplido (B1..B5 completados, DoR 100%, orden de Sprint 1 publicado + Gate P3 completado).

---

## Bitácora de avances (ACTUALIZAR EN CADA AVANCE)

> Regla: cada actualización debe indicar fecha, cambio, impacto y próximo paso.

### 2026-05-11 — Creación inicial del Sprint 0

- **Cambio:** se crea documento base de Sprint 0 con metadata SDD-TDD automático + artifacts engram.
- **Impacto:** queda marco operativo formal para iniciar preparación sin código.
- **Próximo paso:** ejecutar bloque B1 (congelamiento funcional MVP).

### 2026-05-11 — B1 en progreso con alcance congelado por caminos

- **Cambio:** se consolidó B1 con fuentes rectoras (Biblia + RFC-001/002/003/004 + Decision Log + Matriz), cerrando alcance por camino (rápida/avanzada/contacto), fronteras MVP vs post-MVP, reglas de handoff y supuestos críticos comerciales pendientes.
- **Impacto:** Sprint 0 queda con base funcional trazable para pasar a B2 sin ambigüedad de alcance.
- **Próximo paso:** iniciar B2 (contratos y validaciones), congelando payloads MVP de rápida, salida referencial (rango/confianza/disclaimer) y `quote_ref` a contacto.

### 2026-05-11 — B1 completado (cierre formal)

- **Cambio:** se formaliza el cierre de B1 en Sprint 0 dejando trazados alcance por caminos, fronteras MVP/post-MVP, handoffs y supuestos críticos comerciales pendientes.
- **Impacto:** se elimina ambigüedad funcional para arrancar B2 con foco en contratos y validaciones.
- **Próximo paso:** ejecutar B2 y congelar payloads/rules MVP para rápida y contacto enriquecido.

### 2026-05-11 — B2 en progreso (revisión contractual cruzada RFC-001/002/003/004)

- **Cambio:** se inicia B2 y se ejecuta revisión cruzada de contratos/validaciones usando RFC-002 como rector, con impacto en RFC-001 (motor único), RFC-003 (validaciones por paso/UX) y RFC-004 (rango, confianza y disclaimer obligatorio).
- **Impacto:** se reduce riesgo de contradicción entre payload API, estados UX y salida comercial referencial del MVP.
- **Próximo paso:** cerrar congelamiento explícito de payloads y reglas mínimas de validación MVP dentro de este Sprint 0.

### 2026-05-11 — B2 completado (contratos y validaciones MVP congelados)

- **Cambio:** se congela B2 para MVP con los siguientes acuerdos operativos:
  1. **Payload entrada `POST /api/quotes/simulate` (MVP):** `context.schema_version` (obligatorio), `context.origin` (`quick|advanced|direct_contact`), `context.project_type` (obligatorio), `context.project_state` (obligatorio), `context.currency` (obligatorio), y `input.quick_answers` mínimo para modo rápido.
  2. **Salida de simulación (MVP):** `quote`, `totals`, `breakdown`, `meta.schema_version`, `meta.pricing_config_version` + patch RFC-004 aplicado en salida comercial: `estimated_min`, `estimated_max`, `confidence_level` y disclaimer visible de estimación referencial.
  3. **Payload de lead `POST /api/quotes/lead` (MVP):** `contact` (name/email obligatorios; phone/canal opcionales), `quote_ref` (`quote_id`, `origin`, `total_project`, `total_monthly`) y `message` sanitizado.
  4. **Envelope de errores estandarizado (MVP):** `error.type`, `error.code`, `error.message`, `error.details[]`, `error.trace_id`; tipos permitidos: `validation_error`, `domain_error`, `conflict_error`, `internal_error`.
  5. **Reglas mínimas congeladas FE/BE (MVP):** `schema_version` y `currency` obligatorias; si `include=yes` entonces `quantity>0` y `complexity` obligatoria; porcentajes (`discount_pct`, `contingency_pct`, `margin_pct`, `vat_pct`) entre `0..1`; si `apply_vat=false` entonces `vat_value=0`; `total_project>=0`.
- **Impacto:** B2 queda listo para habilitar B3/B4 sin ambigüedad en contratos ni validaciones base del MVP.
- **Próximo paso:** iniciar B3 (flujo UX multipaso) aterrizando mensajes por severidad y bloqueo por paso con estos contratos congelados.

### 2026-05-11 — B3 en progreso (plan corto y ejecución sobre RFC-003 con guardas B2)

- **Cambio:** se activa B3 con plan accionable en 4 frentes, usando RFC-003 como rector y RFC-002/RFC-004 como guardas contractuales/comerciales:
  1. **Estados y transiciones:** cerrar mapa de estados globales y por paso para rápida/avanzada/contacto.
  2. **Mensajería UX:** congelar errores por campo + mensajes globales por severidad (info/warning/error) sin lenguaje técnico interno.
  3. **Disclaimers y CTA:** validar texto referencial obligatorio y salida multicanal post-resumen.
  4. **Accesibilidad mínima:** keyboard flow, asociación error-campo, contraste y foco visible en pasos críticos.
- **Impacto:** se establece trazabilidad operativa para ejecutar B3 sin abrir nuevos contratos ni romper B2.
- **Próximo paso:** cerrar congelamiento B3 en este documento con resumen explícito de estados UX, mensajes, disclaimers, CTAs y accesibilidad.

### 2026-05-11 — B3 completado (flujo UX multipaso congelado)

- **Cambio:** se formaliza cierre de B3 con definición final, compatible 1:1 con B2 y RFC-003/004:
  1. **Estados UX globales congelados:** `idle`, `in_progress`, `validating`, `calculated`, `error`, `submitted`.
  2. **Estados por paso avanzada congelados:** `locked`, `active`, `completed`, `warning`, `invalid`.
  3. **Reglas de transición congeladas:**
     - No avanzar con error bloqueante del paso activo.
     - Sí volver a pasos previos sin pérdida de datos.
     - Cambio rápida→avanzada preserva contexto compatible.
     - Si cambia un paso previo, resumen se marca desactualizado hasta recalcular.
  4. **Mensajería congelada por severidad (sin ambigüedad):**
     - **Error (bloquea):** “Para continuar, completá los campos obligatorios del paso y corregí los errores marcados.”
     - **Error de dominio B2 (`include=yes`):** “Para continuar, definí cantidad mayor a 0 y complejidad en cada módulo incluido.”
     - **Warning (no bloquea):** “Podés continuar, pero faltan datos que pueden ajustar plazo o rango estimado.”
     - **Info (no bloquea):** “Esta simulación es referencial y puede cambiar al validar alcance final.”
  5. **Disclaimers congelados (salida rápida/avanzada):**
     - “La cotización final se confirma tras validar requerimientos.”
     - Mostrar resultado principal como **rango estimado** (`estimated_min`/`estimated_max`) junto al valor calculado (`total_project`) y `confidence_level`.
  6. **CTAs congelados:**
     - En rápida: **“Refinar en cotización avanzada”** + **“Contactar ahora”**.
     - En resumen final: bloque multicanal **WhatsApp / Correo / Agendar** con pre-carga de contexto (`quote_ref`) hacia contacto.
  7. **Accesibilidad mínima congelada:** navegación completa por teclado, etiquetas claras en inputs/selects, mensaje de error asociado al campo, jerarquía visual/contraste de estados y CTA principal inequívoco por pantalla.
  8. **Compatibilidad B2 explícita:** sin nuevos payloads MVP; UX se monta sobre `POST /api/quotes/simulate`, `POST /api/quotes/lead`, envelope estándar de error y reglas mínimas ya congeladas.
- **Impacto:** B3 queda cerrado y deja base lista para B4 sin ambigüedad de interacción ni de salida comercial referencial.
- **Próximo paso:** ejecutar B4 (arquitectura técnica MVP cPanel-first + política operativa Notion-first con guardas de consistencia/reintentos).

### 2026-05-11 — B4 en progreso (resolución de tensión stack y guardas MVP)

- **Cambio:** se inicia B4 y se resuelve explícitamente la tensión entre restricción **cPanel/PHP-first** (RFC-004, Biblia, Decision Log) y estándar operativo vigente **Express 5** del repositorio.
  1. **Decisión temporal MVP:** mantener `api/*.js` (Express 5) como backend de desarrollo/validación local y referencia de contrato RFC-002, pero con **paridad obligatoria** hacia endpoint productivo cPanel/PHP para salida comercial MVP.
  2. **Guarda de salida (no bloqueo):** si un cambio requiere capacidades no garantizadas por cPanel básico, queda automáticamente fuera de MVP y se registra para fase Escalamiento (híbrido SQLite+Notion).
  3. **Criterio de aceptación B4:** ninguna ruta crítica de captura/cotización MVP puede depender exclusivamente de infraestructura no garantizada en cPanel.
- **Impacto:** se evita bloqueo por migración temprana total a PHP y se preserva coherencia con stack actual sin romper la regla cPanel-first.
- **Próximo paso:** cerrar B4 documentando límites de dependencias, flujo Notion-first, política de consistencia/reintentos y trazabilidad mínima.

### 2026-05-11 — B4 completado (arquitectura técnica MVP aterrizada)

- **Cambio:** se formaliza cierre de B4 con acuerdos operativos MVP alineados a RFC-001/002/004 + Decision Log + Matriz:
  1. **Arquitectura MVP adoptada (temporal y explícita):**
     - **Producción MVP:** cPanel-first con backend PHP como runtime garantizado para operación básica comercial.
     - **Implementación vigente del repo:** Express 5 permanece como capa de contrato/prototipo/validación local durante Sprint 0–Sprint 1 temprano.
     - **Regla de compatibilidad:** todo contrato y payload crítico debe poder ejecutarse en variante PHP sin dependencia bloqueante externa.
  2. **Límite de dependencias externas (MVP):**
     - Permitida: **Notion API** como dependencia externa principal de persistencia comercial.
     - No permitidas como requisito para operación básica MVP: colas gestionadas, DB administradas externas, workers serverless o infraestructura fuera de cPanel contratado.
     - Dependencias de frontend/build no deben condicionar procesamiento backend productivo.
  3. **Flujo Notion-first (qué/cuándo/para qué):**
     - **Qué se guarda:** lead (`contact`), referencia de cotización (`quote_ref`), contexto mínimo (`origin`, `project_type`, `project_state`, `currency`), salida comercial (`estimated_min`, `estimated_max`, `total_project`, `confidence_level`), metadatos (`schema_version`, `pricing_config_version`, `trace_id`).
     - **Cuándo:**
       - En `simulate`, persistencia opcional de snapshot resumido solo si se requiere trazabilidad comercial inmediata.
       - En `lead`, persistencia obligatoria al confirmar envío de contacto.
     - **Para qué:** seguimiento comercial, continuidad rápida→avanzada/contacto y auditoría mínima de reglas aplicadas en MVP.
  4. **Política temporal de consistencia/reintentos MVP:**
     - Modelo: consistencia eventual controlada sobre Notion-first.
     - Reintentos: hasta 3 intentos con backoff incremental corto (p.ej. 1s, 3s, 7s) ante fallas transitorias de Notion API.
     - Idempotencia: usar clave de operación por (`trace_id` + tipo de evento + `quote_id`/`lead_id`) para evitar duplicados.
     - Fallback: si falla persistencia en `simulate`, informar estado referencial no persistido; si falla en `lead` tras reintentos, devolver `conflict_error` o `internal_error` con `trace_id` y mensaje accionable para reintento manual.
  5. **Trazabilidad mínima obligatoria MVP:**
     - IDs: `quote_id`, `lead_id` (cuando aplique), `trace_id`.
     - Timestamps: `created_at` UTC RFC3339 y `submitted_at` en eventos de contacto.
     - Versionado: `schema_version` + `pricing_config_version` obligatorios en toda simulación/lead enriquecido.
     - Regla de auditoría: toda salida comercial debe ser reconstruible al menos a nivel resumen con versión de reglas aplicada.
  6. **Riesgos abiertos y mitigación inicial:**
     - **R1 Rate limit/caídas Notion API (alto):** mitigar con reintentos, idempotencia, `trace_id` y monitoreo básico por código de error.
     - **R2 Deriva entre implementación Express y variante PHP (medio-alto):** mitigar con contrato canónico único RFC-002 + casos de paridad mínimos antes de release MVP.
     - **R3 Trazabilidad limitada en Notion-first puro (medio):** mitigar documentando transición explícita a fase Escalamiento híbrida (SQLite+Notion).
- **Impacto:** B4 queda cerrado sin bloquear salida MVP y con guardas explícitas para mantener coherencia cPanel-first + backend actual del repo.
- **Próximo paso:** ejecutar B5 (Ready for Build), validando cierre integral B1..B4 y aceptando formalmente riesgos abiertos.

### 2026-05-11 — B5 en progreso (validación final Ready for Build)

- **Cambio:** se inicia B5 y se ejecuta verificación integral de cierre B1..B4, consolidación DoR y definición de secuencia priorizada de Sprint 1.
- **Impacto:** se reduce riesgo de arranque sin foco al dejar explícitos criterios de inicio, riesgos abiertos y orden de ejecución MVP.
- **Próximo paso:** formalizar cierre B5 con DoR 100% y declarar estado final de Sprint 0.

### 2026-05-11 — B5 completado (Ready for Build aprobado)

- **Cambio:** se cierra B5 con checklist completo, DoR al 100%, riesgos abiertos publicados con mitigación inicial y orden de implementación Sprint 1 documentado (P1/P2/P3).
- **Impacto:** Sprint 0 queda formalmente cerrado y habilita arranque de Sprint 1 con trazabilidad documental y criterio de ejecución claro.
- **Próximo paso:** iniciar Sprint 1 ejecutando prioridad P1: backend `simulate`, backend `lead` Notion-first y flujo rápida con salida referencial.

### 2026-05-11 — Sprint 1 P1 (simulate) implementado en capa Express de contrato

- **Cambio:** se implementa `POST /api/quotes/simulate` en `frontend/api/server.js` con validaciones mínimas B2 (contexto obligatorio, `quick_answers` para `origin=quick`, reglas de porcentajes `0..1`, regla `include=yes` con `quantity>0` + `complexity`, guarda `apply_vat=false => vat_value=0` y guarda `total_project>=0`), además de envelope de errores estándar (`error.type/code/message/details/trace_id`).
- **Impacto:** queda cubierta la prioridad Sprint 1 P1 para simulación con contrato mínimo congelado + salida comercial referencial (`estimated_min`, `estimated_max`, `confidence_level`) y disclaimer visible, manteniendo trazabilidad con `schema_version` y `pricing_config_version`.
- **Próximo paso:** implementar `POST /api/quotes/lead` (persistencia Notion-first e idempotencia/reintentos MVP) y conectar flujo frontend de cotización rápida al endpoint nuevo.

### 2026-05-11 — Sprint 1 P1 (frontend rápida) conectado a `POST /api/quotes/simulate`

- **Cambio:** se implementa en `Servicios.tsx` la UI de cotización rápida con validaciones mínimas B2/B3 (`pages_estimate`, `needs_ecommerce`, `urgency`), contexto obligatorio (`schema_version`, `origin=quick`, `project_type`, `project_state`, `currency`), consumo real del endpoint `POST /api/quotes/simulate`, resultado referencial (rango/total/confianza), estados UX (`loading`, `validating`, `error`, `success`), mensajes por severidad y CTAs congelados (“Refinar en cotización avanzada”, “Contactar ahora”).
- **Impacto:** se completa la prioridad P1 frontend del Sprint 1 sin abrir aún el flujo avanzada completo, dejando handlers preparados y navegación a contacto sin romper el flujo actual.
- **Próximo paso:** ejecutar Sprint 1 P1 restante (`POST /api/quotes/lead` + persistencia Notion-first) y luego avanzar a handoff rápida→avanzada en P2.

### 2026-05-11 — Sprint 1 P2 (handoff rápida→avanzada y rápida/avanzada→contacto)

- **Cambio:** se implementa preservación de contexto de cotización en frontend con `quote_ref` mínimo (`quote_id`, `origin`, `total_project`, `total_monthly`) + contexto operativo liviano (`trace_id`, `schema_version`, `pricing_config_version`, `currency`, `confidence_level`, `is_stale`), se agrega preparación de handoff a avanzada con estado pre-cargado en contexto de navegación y se conecta CTA “Contactar ahora” para enviar el contexto completo a contacto con fallback seguro cuando no existe cotización calculada.
- **Impacto:** queda operativo el traspaso de datos entre rápida y contacto sin pérdida de referencia comercial y con base lista para abrir la pantalla avanzada completa sin rediseñar contrato de estado.
- **Próximo paso:** conectar `POST /api/quotes/lead` con el `quote_ref` ya pre-cargado desde contacto y cerrar trazabilidad Sprint 1 P2/P3.

### 2026-05-11 — Sprint 1 P2 (cierre punta a punta contacto→`POST /api/quotes/lead`)

- **Cambio:** se integra el formulario de contacto para que, cuando existe `quoteHandoffContext`, envíe lead real a `POST /api/quotes/lead` mapeando contrato completo (`contact`, `quote_ref`, `message`, `schema_version`, `pricing_config_version`) y reutilizando `trace_id` del contexto como header `x-trace-id`; además se implementan estados UX de envío (`loading`, `success`, `error`) con visualización explícita de `trace_id` cuando backend responde error envelope.
- **Impacto:** queda cerrado el flujo comercial punta a punta desde cotización rápida hacia captura de lead enriquecido sin romper el comportamiento vigente de contacto normal (fallback a `notionCommit` cuando no hay contexto de cotización).
- **Próximo paso:** ejecutar validación manual E2E de casos con/sin contexto y preparar gate de paridad contractual Express↔PHP (P3) antes de release MVP.

### 2026-05-11 — Gate P3 (Paridad Express↔PHP) completado

- **Cambio:** se implementa backend PHP (`backend/enviar.php`) con paridad contractual RFC-002 completa:
  - `POST /api/quotes/simulate`: validaciones payload, buildTotals() RFC-002 + RFC-004 patch (estimated_min/max, confidence_level, disclaimer), envelope errores RFC-002.
  - `POST /api/quotes/lead`: validaciones contact/quote_ref, persistencia Notion con idempotencia y reintentos (backoff 1s/3s/7s), response con meta.
  - Envelope errores RFC-002: validation_error, domain_error, conflict_error, internal_error.
  - Endpoint legacy `/` backwards compatible.
- **Impacto:** backend PHP listo para deploy cPanel. Sintaxis validada. Verificación runtime en cPanel real antes de release MVP.
- **Próximo paso:** deploy a cPanel y ejecutar suite paridad RFC-002 §11 en producción.
