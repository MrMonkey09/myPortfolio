# Matriz Operativa — Tarea → Documento Rector

- **Estado:** Activa
- **Fecha:** 2026-05-11
- **Propósito:** Mantener decisiones, tareas y documentación alineadas sin desorden.

> **Actualización de flujo vigente:** toda tarea pre-implementación debe pasar por `docs/sprints/sprint-0.md` como control de entrada y bitácora viva.

---

## 1. Cómo usar esta matriz

1. Clasificá la tarea (negocio, API/datos, UX, benchmark, persistencia).
2. Revisá el **documento rector** (mandatorio) antes de ejecutar.
3. Revisá el **documento de impacto** para coherencia cruzada.
4. Si la tarea cambia una decisión, actualizá el RFC o decision log el mismo día.
5. Si la tarea pertenece al arranque/preparación, actualizá además `docs/sprints/sprint-0.md` (bloque B correspondiente + bitácora).

---

## 2. Matriz de control

| Tipo de tarea | Documento rector (manda) | Documento de impacto (consulta) | Resultado mínimo esperado |
|---|---|---|---|
| Preparar inicio de implementación (sin código) | `docs/sprints/sprint-0.md` | Biblia + Matriz + RFC-001/002/003/004 | Bloque B actualizado + bitácora con próximo paso |
| Definir o cambiar alcance funcional del cotizador | `docs/rfc-cotizador-servicios-web.md` (RFC-001) | `docs/rfc-004-benchmark-adjustments-governanza.md` | Requerimiento actualizado y trazable |
| Agregar/modificar campos del modelo de cotización | `docs/rfc-cotizador-servicios-web-contratos-datos-api.md` (RFC-002) | `docs/decision-log-cotizador.md` | Contrato de datos ajustado |
| Crear/modificar endpoint backend | RFC-002 | RFC-004 | Endpoint + validaciones + errores consistentes |
| Cambiar flujo multipaso, pasos o bloqueos | `docs/rfc-cotizador-servicios-web-ux-flujo-multipaso.md` (RFC-003) | RFC-001 | Flujo UX y estados actualizados |
| Cambiar mensajería UX (error/warning/info) | RFC-003 | RFC-002 | Mensajería coherente con reglas de validación |
| Ajustar lógica comercial de cálculo (contingencia, margen, IVA, etc.) | RFC-001 | RFC-002 | Regla de negocio documentada + impacto en contrato |
| Incorporar aprendizajes de mercado/benchmark | RFC-004 | `docs/investigacion-cotizadores-mercado-actual.md` | Patch de gobernanza documentado |
| Definir persistencia por fase (Notion/SQLite/Híbrido) | `docs/decision-log-cotizador.md` | RFC-004 | Decisión por fase con criterio de transición |
| Cambiar reglas de transición entre fases | Decision Log | RFC-004 | Registro con fecha, motivo e impacto |
| Ajustar salida comercial (rango, disclaimer, nivel confianza) | RFC-004 | RFC-003 | Política de presentación cerrada |
| Integrar cotización con contacto/CRM | RFC-002 | RFC-003 | Payload de lead + CTA con contexto |
| Revisión estratégica previa a sprint | RFC-001 | Decision Log + RFC-004 | Prioridades alineadas por fase |
| Gestión de bloque Sprint 0 (B1..B5) | `docs/sprints/sprint-0.md` | Documento rector del eje (RFC/Decision Log) | Checklist detallado del bloque y estado al día |
| Configurar o ajustar telemetría GA4 / embudos / goals | `docs/GA4-telemetria-guia.md` | `docs/sprints/sprint-4.md` | Eventos GA4 activos y embudos configurados en dashboard |
| Registrar o ejecutar hipótesis A/B test | `docs/ab-tests.json` | `docs/GA4-telemetria-guia.md` | Hipótesis documentada y resultado analizable |

---

## 3. Regla anti-caos

Si una tarea toca varios ejes:

- El eje dominante define el **documento rector**.
- Los demás se actualizan como impacto.

Ejemplo:

- Tarea: “Agregar `industry` en cotización rápida”.
  - Rector: RFC-002 (modelo/contratos).
  - Impacto: RFC-003 (paso de contexto UX).

---

## 4. Cadencia de mantenimiento

- **Semanal (15 min):** revisar `docs/decision-log-cotizador.md`.
- **Antes de tocar backend:** revisar RFC-002.
- **Antes de tocar frontend UX:** revisar RFC-003.
- **Antes de cambios de alcance:** revisar RFC-001.
- **Al detectar insight de mercado:** registrar ajuste en RFC-004.

---

## 5. Checklist operativo por tarea

- [ ] Identifiqué tipo de tarea.
- [ ] Revisé documento rector.
- [ ] Revisé documento de impacto.
- [ ] Ejecuté cambio alineado.
- [ ] Actualicé RFC/decision log si cambió una decisión.

### 5.1 Control adicional (arranque y pre-implementación)

- [ ] Revisé estado de `docs/sprints/sprint-0.md`.
- [ ] Identifiqué bloque B aplicable (B1..B5).
- [ ] Actualicé checklist del bloque B correspondiente.
- [ ] Registré bitácora (fecha, cambio, impacto, próximo paso).
