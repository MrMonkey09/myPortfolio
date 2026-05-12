# Sprint 2 — Persistencia Híbrida (SQLite + Notion)

## Metadata

- **Proyecto:** `myPortfolio`
- **Sprint:** `2` (escalamiento)
- **Estado:** `Cerrado`
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
| A | Fundamentos SQLite (backend/db/, quotesRepository) | ✅ Completado |
| B | Sync module (backend/sync/notionSync.js) | ✅ Completado |
| C | Integración server.js (persistir antes de responder) | ✅ Completado |
| D | Paridad PHP (enviar.php con SQLite + sync) | ✅ Completado |

---

## Definition of Done (DoD)

- [x] Esquema SQLite QuoteRecord v1 creado con todos los campos
- [x] CRUD operations funcionando (create, getByTraceId, getPendingSync, updateSyncStatus)
- [x] Sync async a Notion no bloquea respuesta API
- [x] Estados de sync: pending → synced/retrying/failed con transiciones correctas
- [x] Reintentos con backoff (1s, 3s, 7s) para errores transitorios
- [x] Backend Express persiste en SQLite antes de responder
- [x] Backend PHP (enviar.php) implementa paridad completa
- [x] `.gitignore` excluye `backend/data/*.sqlite`
- [x] No se rompen flujos existentes (simulate, lead, legacy)

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

### 2026-05-11 — Work-Unit A completada (fundamentos SQLite)

- **Cambio:** se implementan backend/db/index.js (inicialización SQLite con create tables, WAL mode, singleton), backend/db/quotesRepository.js (CRUD: create, getByTraceId, getPendingSync, updateSyncStatus), y backend/data/ directory. Se actualiza .gitignore.
- **Impacto:** base sólida para persistencia local del cotizador.
- **Commit:** `feat(cotizador): work-unit A — fundamentos SQLite para persistencia híbrida`
- **Próximo paso:** implementar sync module (Work-Unit B).

### 2026-05-11 — Work-Unit B completada (sync module)

- **Cambio:** se implementa backend/sync/notionSync.js con syncQuoteToNotion, syncWithRetry, extractNotionPayload. Backoff exponencial (1s/3s/7s), max 3 retries, detección de errores transient vs permanent.
- **Impacto:** sync async a Notion con observabilidad completa de estados.
- **Commit:** `feat(cotizador): work-unit B — sync module SQLite → Notion con retry`
- **Próximo paso:** integrar en server.js (Work-Unit C).

### 2026-05-11 — Work-Unit C completada (integración server.js)

- **Cambio:** se integra persistencia SQLite y sync Notion en app.post("/api/quotes/simulate"). Se persiste QuoteRecord ANTES de responder y se ejecuta sync async fire-and-forget.
- **Impacto:** cotización queda persistida localmente antes de entregar respuesta al cliente.
- **Commit:** `feat(cotizador): work-unit C — integrar persistencia SQLite en server.js`
- **Próximo paso:** implementar paridad PHP (Work-Unit D).

### 2026-05-11 — Work-Unit D completada (paridad PHP)

- **Cambio:** se implementa paridad PHP en enviar.php con PDO SQLite, initSqliteDb, createQuoteRecord, updateSyncStatus, syncQuoteToNotionBackground. Sync async via register_shutdown_function.
- **Impacto:** backend cPanel tiene mismo flujo de persistencia híbrida que Express.
- **Commit:** `feat(cotizador): work-unit D — paridad PHP con SQLite + sync Notion`
- **Próximo paso:** ejecutar SDD verify y cerrar Sprint 2.

### 2026-05-11 — Fixes post-verificación

- **Cambio:** se corrigen issues identificados en SDD verify: (1) server.js ahora no bloquea respuesta si SQLite falla, (2) enviar.php usa closure correcta en register_shutdown_function.
- **Impacto:** implementación cumple con regla de consistencia SQLite source of truth y paridad PHP correcta.
- **Commit:** `fix(cotizador): corregir issues de verificación Sprint 2`
- **Próximo paso:** commit final y cierre de Sprint 2.

### 2026-05-11 — Sprint 2 cerrado

- **Cambio:** se cierra Sprint 2 con todos los Deliverables completados y verificados. DoD 9/9 ✅.
- **Impacto:** transicionando de Fase MVP (Notion-first) a Fase Escalamiento (SQLite + Notion híbrido) según Decision Log §6.
- **Próximo paso:** Decision Log §7 — abrir decisiones operativas abiertas (retención, backup, umbral transición).