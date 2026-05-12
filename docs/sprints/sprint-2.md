# Sprint 2 — Persistencia Híbrida (SQLite + Notion)

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `2` (escalamiento)
- **Estado:** `En progreso`
- **Fecha inicio:** `2026-05-11`
- **Framework de ejecución:** `sdd-tdd`
- **Modo de ejecución:** `automatic`
- **Artifact store:** `engram`
- **Estrategia de entrega:** `auto-chain` (PRs encadenados ante riesgo alto)
- **Estrategia de cadena:** `stacked-to-main`
- **Regla operativa de seguimiento:** `Actualizar este mismo documento (sprint-2.md) en cada avance relevante de planificación, definición o desbloqueo.`

---

## Objetivo del Sprint 2

Implementar persistencia híbrida SQLite + Notion para el cotizador web, mejorando trazabilidad técnica mientras se mantiene la proyección comercial en Notion. SQLite como fuente de verdad, Notion como espejo comercial.

---

## Alcance del Sprint 2

1. **Esquema SQLite QuoteRecord v1** (quote_id, context, input, totals, meta, sync_status)
2. **Sync SQLite → Notion** (async, no bloquea respuesta API)
3. **Observabilidad de sync** (estado + reintentos + error code)
4. **Paridad PHP** para cPanel (mismo flujo SQLite + sync)
5. **Regla de consistencia**: SQLite prevalece sobre Notion

---

## Entradas obligatorias (documentos rectores)

- `docs/manual-biblia-subida-nivel-portfolio-cotizador.md`
- `docs/sprints/sprint-1.md` (estado cerrado)
- `docs/decision-log-cotizador.md` (Decision Log §6: MVP → Escalamiento)
- `docs/rfc-cotizador-servicios-web-contratos-datos-api.md` (RFC-002)

---

## Plan de trabajo Sprint 2

| Work-Unit | Descripción | Estado |
|---|---|---|
| A | Fundamentos SQLite (backend/db/, quotesRepository) | ⏳ Pendiente |
| B | Sync module (backend/sync/notionSync.js) | ⏳ Pendiente |
| C | Integración server.js (persistir antes de responder) | �pm Pending |
| D | Paridad PHP (enviar.php con SQLite + sync) | ⏳ Pendiente |

---

## Definition of Done (DoD)

- [ ] Esquema SQLite QuoteRecord v1 creado con todos los campos
- [ ] CRUD operations funcionando (create, getByTraceId, getPendingSync, updateSyncStatus)
- [ ] Sync async a Notion no bloquea respuesta API
- [ ] Estados de sync: pending → synced/retrying/failed con transiciones correctas
- [ ] Reintentos con backoff (1s, 3s, 7s) para errores transitorios
- [ ] Backend Express persiste en SQLite antes de responder
- [ ] Backend PHP (enviar.php) implementa paridad completa
- [ ] `.gitignore` excluye `backend/data/*.sqlite`
- [ ] No se rompen flujos existentes (simulate, lead, legacy)

---

## Stack técnico

- **Backend Express**: `frontend/api/server.js` + `backend/db/` + `backend/sync/`
- **Backend PHP**: `backend/enviar.php` (PDO SQLite)
- **SQLite**: mejor-sqlite3 (Express), PDO SQLite (PHP)
- **Notion**: API existente para sync
- **Archivo SQLite**: `backend/data/quotes.sqlite` (gitignored)

---

## Riesgos identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Límites de disco/memoria cPanel con SQLite | Media | Alto | Archivo SQLite pequeño, schema v1 optimizado |
| R2 | Dependencias nativas (better-sqlite3) incompatibles | Media | Alto | Verificar compatibilidad cPanel, fallback a sql.js |
| R3 | Divergencia Notion vs SQLite en sync async | Baja | Medio | SQLite source of truth, regla de precedencia |
| R4 | Race conditions en writes concurrentes SQLite | Baja | Medio | WAL mode + singleton pattern |

---

## Bitácora de avances

> Regla: cada actualización debe indicar fecha, cambio, impacto y próximo paso.

### 2026-05-11 — Creación y planificación Sprint 2

- **Cambio:** se crea documento Sprint 2 con metadata `automatic` + `engram` + `auto-chain` + `stacked-to-main`. Se ejecutan SDD phases proposal/spec/design/tasks.
- **Impacto:** queda marco operativo formal para implementar persistencia híbrida SQLite + Notion.
- **Próximo paso:** ejecutar work-units A → B → C → D en modo auto-chain.