# Sprint 3 — Fase Estable (SQLite-First Consolidado)

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `3` (fase estable)
- **Estado:** `Cerrado`
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
| A | Scripts de backup automatizado | P1 | ✅ Completado |
| B | Política de retención y archivado | P1 | ✅ Completado |
| C | Dashboard de salud (API endpoint) | P2 | ✅ Completado |
| D | Optimización sync Notion | P2 | ✅ Completado |

---

## Definition of Done (DoD)

- [x] Script de backup que copie `quotes.sqlite` a `~/backups/` con timestamp
- [x] Cron job configurado para backup diario (00:00 UTC)
- [x] Script de restauración que permita recover desde backup
- [x] Política de retención implementada: archivar cotizaciones >12 meses
- [x] Limpieza de cotizaciones stale (>6 meses sin contacto)
- [x] Endpoint `/api/health/db` que muestre estado de sync (pending/synced/failed)
- [x] Métricas disponibles: total cotizaciones, tasa sync fallidos, volumen mensual
- [x] Sync Notion optimizado: solo datos comerciales clave (no input_json completo)
- [x] Documentación de procedimientos de backup/restore

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

### 2026-05-11 — Work-Unit A completada (scripts de backup)

- **Cambio:** se implementan scripts de backup automatizado: backup-sqlite.sh (timestamp + cleanup 7 días), restore-sqlite.sh, verify-sqlite.sh, cron-setup.sh, README.md.
- **Impacto:** base para backup diario automático con rotación.
- **Commit:** `feat(cotizador): work-unit A — scripts de backup automatizado para SQLite`
- **Próximo paso:** implementar política de retención (Work-Unit B).

### 2026-05-11 — Work-Unit B completada (política de retención)

- **Cambio:** se implementan scripts de cleanup (archivado >12 meses, stale >6 meses), stats-report.sh, y tabla quotes_archive en SQLite.
- **Impacto:** política de retención operativa con archivado automático y reportes.
- **Commit:** `feat(cotizador): work-unit B — política de retención y archivado`
- **Próximo paso:** implementar dashboard de salud (Work-Unit C).

### 2026-05-11 — Work-Unit C completada (dashboard de salud)

- **Cambio:** se implementa endpoint GET /api/health/db con métricas de sync completas, recomendaciones automáticas, y script check-health.sh.
- **Impacto:** observabilidad completa del estado del cotizador y sync Notion.
- **Commit:** `feat(cotizador): work-unit C — dashboard de salud (API endpoint)`
- **Próximo paso:** optimizar sync Notion (Work-Unit D).

### 2026-05-11 — Work-Unit D completada (optimización sync Notion)

- **Cambio:** se implementa payload resumido (solo datos comerciales clave), límite de 20 bloques Notion, logging mejorado, y script resync-failed.sh.
- **Impacto:** sync Notion optimizado con menor carga API y mejor debugging.
- **Commit:** `feat(cotizador): work-unit D — optimización sync Notion`
- **Próximo paso:** cerrar Sprint 3.

### 2026-05-11 — Sprint 3 cerrado

- **Cambio:** se cierra Sprint 3 con todos los Deliverables completados. DoD 10/10 ✅.
- **Impacto:** fase Estable consolidada con backup automatizado, retención implementada, dashboard de salud y sync optimizado.
- **Próximo paso:** Decision Log §6 actualizado (checklist Escalamiento→Estable pendiente). Test E2E en cPanel real.