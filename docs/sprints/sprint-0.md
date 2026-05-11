# Sprint 0 — Preparación de Implementación Cotizador Web

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `0` (pre-implementación)
- **Estado:** `Activo`
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
| B1. Congelamiento funcional | Alcance MVP y fronteras de cada modo validadas | ☐ Pendiente |
| B2. Contratos y validaciones | Campos obligatorios/opcionales + reglas de validación cerradas | ☐ Pendiente |
| B3. Flujo UX multipaso | Estados, errores, mensajes y transiciones sin ambigüedad | ☐ Pendiente |
| B4. Arquitectura técnica MVP | Confirmación cPanel/PHP/JS + estrategia Notion-first aterrizada | ☐ Pendiente |
| B5. Ready for Build | Checklist final de inicio de implementación aprobado | ☐ Pendiente |

---

## Checklist detallado por bloque (iterable)

> Uso: cuando un bloque inicie, marcar su estado en `in_progress`; al cerrar, pasar a `☑ Completado` y registrar nota en bitácora.

### B1. Congelamiento funcional

- [ ] Confirmar alcance exacto de los 3 caminos: rápida, avanzada, contacto.
- [ ] Definir fronteras explícitas de MVP vs post-MVP por cada camino.
- [ ] Confirmar handoff entre rápida -> avanzada y rápida/avanzada -> contacto.
- [ ] Validar que no existan decisiones funcionales “de palabra” sin documento rector.
- [ ] Registrar supuestos funcionales críticos pendientes de validación comercial.

### B2. Contratos y validaciones

- [ ] Revisar payload de entrada para cotización rápida (campos, tipos, obligatoriedad).
- [ ] Revisar payload de salida rápida (rango, total orientativo, confianza, disclaimers).
- [ ] Revisar payload de captura de contacto enriquecido.
- [ ] Confirmar catálogo de errores y formato de respuesta consistente.
- [ ] Congelar reglas mínimas de validación frontend/backend para MVP.

### B3. Flujo UX multipaso

- [ ] Mapear estados por paso (idle, editing, validating, error, success).
- [ ] Definir mensajes de error por campo y mensajes globales.
- [ ] Validar contenido de disclaimers de estimación referencial.
- [ ] Confirmar CTAs de salida (continuar avanzada / contacto multicanal).
- [ ] Revisar criterios de accesibilidad y legibilidad de pasos críticos.

### B4. Arquitectura técnica MVP

- [ ] Confirmar compatibilidad operativa cPanel-first para backend elegido (PHP/JS).
- [ ] Definir límite de dependencias externas para operación básica.
- [ ] Aterrizar flujo Notion-first (qué se guarda, cuándo y para qué).
- [ ] Definir política temporal de consistencia y reintentos para persistencia MVP.
- [ ] Validar trazabilidad mínima (IDs, timestamps, versión de reglas aplicada).

### B5. Ready for Build

- [ ] Verificar que B1..B4 estén `☑ Completado` o con riesgo explícitamente aceptado.
- [ ] Completar DoR al 100% sin ambigüedades.
- [ ] Publicar orden de implementación de Sprint 1 (secuencia y prioridad).
- [ ] Registrar riesgos abiertos con plan de mitigación inicial.
- [ ] Confirmar regla de actualización continua de este documento durante implementación.

---

## Definition of Ready (DoR) para iniciar implementación

- [ ] Reglas de negocio base alineadas para rápida + avanzada en un solo motor.
- [ ] Payloads de entrada/salida MVP cerrados y versionados.
- [ ] Mensajes de estimación referencial y disclaimers aprobados.
- [ ] Derivación a contacto multicanal definida.
- [ ] Criterio de persistencia MVP (Notion-first) explicitado por caso de uso.
- [ ] Riesgos y supuestos críticos registrados.
- [ ] Tareas de implementación priorizadas para Sprint 1.

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

---

## Bitácora de avances (ACTUALIZAR EN CADA AVANCE)

> Regla: cada actualización debe indicar fecha, cambio, impacto y próximo paso.

### 2026-05-11 — Creación inicial del Sprint 0

- **Cambio:** se crea documento base de Sprint 0 con metadata SDD-TDD automático + artifacts engram.
- **Impacto:** queda marco operativo formal para iniciar preparación sin código.
- **Próximo paso:** ejecutar bloque B1 (congelamiento funcional MVP).
