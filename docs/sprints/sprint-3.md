# Sprint 3 — Fase Estable (SQLite-First Consolidado)

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `3` (fase estable)
- **Estado:** `En progreso`
- **Fecha inicio:** `2026-05-11`
- **Framework de ejecución:** `sdd-tdd`
- **Modo de ejecución:** `automatic`
- **Artifact store:** `engram`
- **Estrategia de entrega:** `auto-chain`
- **Estrategia de cadena:** `stacked-to-main`
- **Regla operativa de seguimiento:** `Actualizar este mismo documento (sprint-3.md) en cada avance relevante de planificación, definición o desbloqueo.`

---

## Objetivo del Sprint 3

Consolidar la operación madura, auditable y escalable del cotizador. Transicionar de Fase Escalamiento (híbrido) a Fase Estable (SQLite-first) con backup automatizado, política de retención implementada y observabilidad completa.

---

## Alcance del Sprint 3

1. **Backup automatizado de SQLite** (cron diario + cloud storage)
2. **Política de retención implementada** (archivado automático, limpieza de datos stale)
3. **Scripts de auditoría** (verificación de integridad, paridad Notion vs SQLite)
4. **Dashboard de salud** (estado de sync, métricas, alertas)
5. **Optimización de sync Notion** (reducir volumen enviado, solo datos comerciales clave)

---

## Entradas obligatorias (documentos rectores)

- `docs/manual-biblia-subida-nivel-portfolio-cotizador.md`
- `docs/sprints/sprint-2.md` (estado cerrado)
- `docs/sprints/sprint-1.md` (estado cerrado)
- `docs/decision-log-cotizador.md` (Decision Log §6 y §7.1-7.4)

---

## Plan de trabajo Sprint 3

| Work-Unit | Descripción | Prioridad | Estado |
|---|---|---|---|
| A | Scripts de backup automatizado | P1 | ⏳ Pendiente |
| B | Política de retención y archivado | P1 | ⏳ Pendiente |
| C | Dashboard de salud (API endpoint) | P2 | ⏳ Pendiente |
| D | Optimización sync Notion | P2 | ⏳ Pendiente |

---

## Definition of Done (DoD)

- [ ] Script de backup que copie `quotes.sqlite` a `~/backups/` con timestamp
- [ ] Cron job configurado para backup diario (00:00 UTC)
- [ ] Script de restauración que permita recover desde backup
- [ ] Política de retención implementada: archivar cotizaciones >12 meses
- [ ] Limpieza de cotizaciones stale (>6 meses sin contacto)
- [ ] Endpoint `/api/health/db` que muestre estado de sync (pending/synced/failed)
- [ ] Métricas disponibles: total cotizaciones, tasa sync fallidos, volumen mensual
- [ ] Sync Notion optimizado: solo datos comerciales clave (no input_json completo)
- [ ] Documentación de procedimientos de backup/restore

---

## Stack técnico

- **Backend Express**: scripts en `scripts/backup/` + `scripts/audit/`
- **Backend PHP**: scripts equivalentes en `backend/scripts/`
- **SQLite**: archivo en `backend/data/quotes.sqlite`
- **Cloud storage**: configurable (rclone a Google Drive/Dropbox)
- **Monitoring**: endpoint de salud + logs

---

## Entregables opcionales (si hay tiempo)

- UI de dashboard en `/admin/salud` (consultar métricas de sync)
- Alertas por email cuando `sync_status=failed` > threshold
- Export CSV de cotizaciones para análisis

---

## Bitácora de avances

> Regla: cada actualización debe indicar fecha, cambio, impacto y próximo paso.

### 2026-05-11 — Creación y planificación Sprint 3

- **Cambio:** se crea documento Sprint 3 con metadata `automatic` + `engram` + `auto-chain` + `stacked-to-main`. Se definen 4 work-units (A: backup, B: retención, C: dashboard, D: optimización sync).
- **Impacto:** queda marco operativo formal para consolidar operación SQLite-first.
- **Próximo paso:** ejecutar work-units A → B → C → D en modo auto-chain.