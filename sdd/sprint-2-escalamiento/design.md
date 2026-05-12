# Design: Sprint 2 - Persistencia Híbrida

## Technical Approach

Implementamos una arquitectura de persistencia híbrida donde todas las cotizaciones se almacenan en un archivo SQLite local (para rapidez y sin dependencias web) y sincronizamos asincrónicamente a Notion. El modelo sigue **Async-First**: persistimos primero, sincronizamos después. Esto evita bloquear respuestas APIs y garantiza que datos estén disponibles incluso si falla Notion temporalmente.

El Express backend usará un singleton `db` para evitar multiples conexiones concurrentes al mismo archivo SQLite. PHP mantendrá paridad usando PDO con la misma estructura de tablas.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|---------|
| **Database Engine** | better-sqlite3 (Express) + PDO (PHP) | sql.js (WebAssembly), MySQL, PostgreSQL | better-sqlite3 es más rápido y simple para archivos locales. sql.js elimina native deps pero añade overhead de WASM. Hosting cPanel soporta mejor SQLite nativo. |
| **Async Sync** | Event loop async (setImmediate) en Express | Background workers (Bull), cron jobs, AJAX polling | Async event loop mantiene código simple sin external dependencies. Suficiente para volumen de cotizaciones típicas. |
| **File Location** | backend/data/quotes.sqlite | Backend root (.gitignored), environment path | data/ es estándar y claro. .gitignore lo protege de commits accidentales. |
| **Status Transitions** | pending → synced / retrying → synced / failed → never sync again | Only pending→synced, or statusless with timestamps | Explicit status permite manejo preciso de errores transitorios vs permanentes y reintentos inteligentes. |
| **Retry Strategy** | Exponential backoff: 1s, 3s, 7s (max 3 intentos) | Fixed delay (retry every 5s), Fibonacci backoff, no retries | Backoff exponencial minimiza presión en Notion API al acercarse al límite. Máximo hard-limited a 3 intentos para evitar infinite loops. |

## Data Flow

```
┌──────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Client     │ POST →│ /api/quotes/sim │  sync→│ Notion API  │
└──────────────┘      └────────┬─────────┘       └─────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   better-sqlite3     │
                    │  (backend/db/        │
                    │   quotes.sqlite)     │
                    └──────┬───────────────┘
                           │ sync async    │
        ┌──────────────────┼───────────────┤──────────────────┐
        │                  │               │                  │
        ▼                  ▼               ▼                  ▼
    Express              PHP              Sync Worker    Rollback/Re-sync
    Handler             (enviar.php)      (bg processor)   on data corruption
  
  
    1. Validar payload
    2. Insert SQLite (quick, no lock)
    3. Responder inmediatamente

                  [async]                    [via setImmediate / exec()]
                         │                           │
                         ▼                           ▼
            syncQuoteToNotion()           register_shutdown_function()

                 │                           │
              ┌──┴────┐                   ┌──┴────┐
              │ Transient│               │ Permanent │
              │ (429/5xx)│                │(401/403/404)│
              └───┬─────┘                └─────────────┘
                  │                                    │
                  ▼                                    ▼
         Retry: 1s / 3s / 7s                 Mark status=failed, skip sync
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/db/index.js` | Create | Inicializa singleton SQLite con mejor-sqlite3. Crea tablas IF NOT EXISTS |
| `backend/db/quotesRepository.js` | Create | CRUD operations (create, getByTraceId, getPendingSync, updateSyncStatus) |
| `backend/sync/notionSync.js` | Create | Lógica de sincronización con retry backoff exponencial y clasificación error transitoria vs permanente |
| `server.js` endpoint /api/quotes/simulate* | Modify | Insert persist BEFORE response, sync async después (no await) |
| `backend/enviar.php` - route POST /api/quotes/simulate | Modify | INSERT en SQLite BEFORE responder, syncToNotion background via shutdown/register_async |
| `.gitignore` | Modify | Agregar `/data/quotes.sqlite` para evitar commits accidentales |

## Interfaces / Contracts

### Quote Record Schema (SQLite)

```sql
CREATE TABLE IF NOT EXISTS quotes (
  quote_id TEXT PRIMARY KEY,        -- e.g., "qt_1234567890ab"
  trace_id TEXT NOT NULL UNIQUE,    -- para idempotencia y rollback
  schema_version TEXT DEFAULT '1.0.0',
  
  -- Context fields
  origin TEXT NOT NULL,             -- quick / advanced / direct_contact
  
  -- Calculated totals
  direct_cost INTEGER NOT NULL,
  contingency_value INTEGER NOT NULL,
  subtotal_with_contingency INTEGER NOT NULL,
  margin_value INTEGER NOT NULL,
  subtotal_net INTEGER NOT NULL,
  discount_value INTEGER DEFAULT 0,
  total_net INTEGER NOT NULL,
  vat_value INTEGER DEFAULT 0,
  total_project INTEGER NOT NULL,
  total_monthly INTEGER DEFAULT 0,
  
  -- Confidence & metadata
  confidence_level TEXT NOT NULL,   -- low / medium / high

  -- Sync state
  sync_status TEXT NOT NULL,        -- pending / retrying / synced / failed (default: pending)
  sync_attempts INTEGER DEFAULT 0,
  sync_last_error TEXT,             -- JSON string or null
  sync_success_at DATETIME,         -- RFC3339 timestamp or null

  created_at DATETIME NOT NULL      -- UTC timestamp
);
```

### Sync Functions Contracts

**express (Node.js):**
```javascript
export function createQuoteRecord(record: QuoteRecord): void // Insert
export function getPendingSyncRecords(limit?: number): QuoteRecord[] // Fetch retries queue
export function updateSyncStatus(quoteId, { status, attempts, error }): void // Transition state
export type SyncError = 'transient' | 'permanent' | 'timeout';
```

**PHP:**
```php
function createQuote($quoteId, $record): bool;          // INSERT
function getPendingSyncRecords(int $limit = 10): array;  // SELECT pending+retrying
function updateSyncStatus(string $quoteId, string $status, int $attempts, ?string $error): bool;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|---------|
| Unit | SQLite schema initialization (tables created on init) | Mock better-sqlite3 with in-memory DB |
| Unit | CRUD operations (Create, Read by trace_id, Update status) | Jest + test database fixture |
| Integration | Full flow: POST /api/quotes/simulate → SQLite persist → Sync call → status updated | Real Express server stubs Notion API |
| Integration | Retry logic with backoff (1s→3s→7s) & max 3 attempts | Time-mock or manual delay verification |
| Error Classification | Transient vs Permanent errors mapped correctly | HTTP code mapping: 429/5xx→transient, 401/403/404→permanent |
| Async / Race Conditions | Multiple rapid requests don't corrupt SQLite DB | Concurrent request stress test (5-10 parallel POST) |

## Migration / Rollout

**No migration required.** Tablas se crean automáticamente al ejecutar initDatabase() si no existen. El archivo SQLite está versionado y solo cambia esctructura en cambios futuros con explicit migration plan.

**Deployment order:**
1. Add new files (db/quotesRepository.js, sync/notionSync.js) — NO CODE CHANGES to existing endpoints
2. Modify server.js and enviar.php only when ready (ensures compatibility with v1 without persistence during rollback period)
3. Verify SQLite file exists and empty initially before enabling live traffic

## Open Questions

- [ ] ¿Mover syncToNotion a worker separado (BullMQ o similar) en lugar de setImmediate para evitar timeouts si Notion tarda >10s?
- [ ] ¿Incluir `sync_lock` column para evitar dupplicated sync jobs del mismo record por race conditions?
- [ ] ¿Agregar audit trail en tabla separate para debugging de re-sync manuales?
