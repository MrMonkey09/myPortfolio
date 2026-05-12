# Tasks: Sprint 2 - Persistencia Híbrida

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~455 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Delivery strategy | auto-chain |
| Decision needed before apply | No |

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| A — Fundamentos SQLite | Crear db directory, index, repository, .gitignore | PR 1 | Base para todo el resto |
| B — Sync module | Implementar sync async con retry backoff | PR 2 | Depende de A |
| C — Integración Express | Modificar server.js endpoint /api/quotes/simulate | PR 3 | Integra A y B en Node backend |
| D — Paridad PHP | Adaptar enviar.php con PDO SQLite | PR 4 | Para cPanel hosting |

## Phase 1: Fundamentos SQLite (backend/db/)

- [ ] 1.1 Crear directorio `backend/data/` vacío para archivo SQLite
- [ ] 1.2 Crear `backend/db/index.js`:
  - Importar better-sqlite3
  - Inicializar singleton db con WAL mode
  - Create TABLE IF NOT EXISTS quotes con schema RFC-002 compatible (quote_id, trace_id, direct_cost, ... sync_status)
- [ ] 1.3 Crear `backend/db/quotesRepository.js`:
  - `create(record: QuoteRecord): void` — INSERT con unique constraint en quote_id
  - `getByTraceId(traceId): Promise<QuoteRecord>` — SELECT WHERE trace_id = ?
  - `getPendingSync(limit = 10): Promise<QuoteRecord[]>` — ORDER BY created_at DESC LIMIT
  - `updateSyncStatus(quoteId, { status, attempts, error }): void` — UPDATE sync_status field
- [ ] 1.4 Actualizar `.gitignore`: agregar `/backend/data/*.sqlite`

## Phase 2: Sync Module (backend/sync/)

- [ ] 2.1 Crear `backend/sync/notionSync.js`:
  - Importar config (notionToken, notionDbId desde .env)
  - Implementar `isTransientError(httpCode, response): boolean`:
    - Transient: 429, 500–599, codes ECONNRESET/ETIMEDOUT/ENOTFOUND/internal_error
    - Permanent: 401, 403, 404
  - Implementar `syncQuoteToNotion(record): Promise<void>` con retry backoff [1s, 3s, 7s] y max 3 intentos
- [ ] 2.2 Post-sync updates en SQLite:
  - UPDATE sync_status = 'synced', sync_success_at = now()
  - Si error: UPDATE sync_last_error = JSON(error), ATOMICALLY increment sync_attempts
  - Si attempts >= 3: UPDATE sync_status = 'failed' y marcar para dead-letter queue opcional

## Phase 3: Integración Express (server.js)

- [ ] 3.1 Modificar `app.post('/api/quotes/simulate')`:
  - Valida payload RFC-002 (ya existente, no cambiar)
  - Extraer fields: context.origin, input line_items, pricing config, meta datos
  - Construir QuoteRecord completo con sync_status='pending' y created_at ahora mismo
- [ ] 3.2 Persistir sincrono ANTES de responder:
  - Call `quotesRepository.create(record)`
  - Si error SQLite → fallback gracefully (log warning, continuar sin guardar)
  - NO retornar hasta después de persistencia (garantiza atomicity visibilty al frontend)
- [ ] 3.3 Sync async no-bloqueante:
  - Call `syncQuoteToNotion(record)` fuera del event handler principal
  - Usar setImmediate() o promesa.then(noawait()) para evitar bloquear response
  - Capturar error en catch() y actualizar sync_status='retry' o 'failed'

## Phase 4: Paridad PHP (backend/enviar.php)

- [ ] 4.1 Crear PDO SQLite connection helper:
  - function `newSQLiteDB(): PDO`: new PDO('sqlite:' . __DIR__ . '/../data/quotes.sqlite')
  - Enable PRAGMA journal_mode, PRAGMA foreign_keys = ON
- [ ] 4.2 Implementar createQuote con schema idéntico a better-sqlite3:
  - CREATE TABLE IF NOT EXISTS quotes (quote_id TEXT PRIMARY KEY, ...)
  - INSERT OR REPLACE para idempotencia y rollback automático
  - Timestamps RFC3339 en created_at y sync_success_at
- [ ] 4.3 Modificar POST /api/quotes/simulate:
  - Insertar BEFORE buildTotals() response generation
  - Extraer fields, construir record con sync_status='pending'
  - Fallback gracefully si INSERT falla (log error, continuar)
- [ ] 4.4 Implementar sync a Notion async:
  - Option A (recommended): `register_shutdown_function(syncToNotion())` al final del script
  - Option B alternativa (menos recomendado): exec('php backend/sync/worker.php') para background process separado
  - Usar misma lógica de retry backoff del design.md

## Phase 5: Testing & Verification

- [ ] 5.1 Test SQLite schema initialization:
  - Mock better-sqlite3 con in-memory DB
  - Verificar tables creadas después db.init()
- [ ] 5.2 Test CRUD operations:
  - Create → getByTraceId devuelve same record
  - getPendingSync lista últimos N pending
  - updateSyncStatus cambia status correctamente
- [ ] 5.3 Test full flow Express:
  - POST /api/quotes/simulate con válido payload
  - Verificar SQLite file creado en backend/data/quotes.sqlite
  - Sync async ejecutado (verificar sync_status cambiados)
- [ ] 5.4 Test retry logic:
  - Mock Notion API throw error transitorio
  - Verificar reintentos 1s → 3s → 7s y max 3 intentos
  - Verificar dead-letter queue para permanent errors

## Accomplishment Checklist

- [ ] Phase A completo ✓
- [ ] Phase B completo ✓
- [ ] Phase C integrado en Express ✓
- [ ] Phase D paridad PHP ✓
- [ ] Tests unitarios y integration tests escritos ✓

## Next Steps

Ready for `sdd-apply` siguiendo orden:
1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
2. PRs encadenados sugeridos por tamaño ~400+ líneas estimado
