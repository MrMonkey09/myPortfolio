# Proposal: Sprint 2 - Escalamiento con Persistencia Híbrida

## Intent

Implementar persistencia híbrida SQLite + Notion para el cotizador web, mejorando trazabilidad técnica mientras mantiene proyección comercial en Notion. Esta fase habilita auditoría de cálculos, versionado y reportes internos sin romper conversión existente.

## Scope

### In Scope
- QuoteRecord v1 (quote_id TEXT, context JSON, input JSON, totals JSON, meta JSON, timestamps DATETIME)
- pricing_config_version persistente (schema_v1)
- Sync SQLite → Notion POST /api/quotes/simulate (persistir primero, async a Notion con reintentos)
- Observabilidad: estado_sync, retries count, error_code por operación
- Backend Express (`server.js`) persiste QuoteRecord antes de responder
- Backend PHP (`enviar.php`) sync equivalente para cPanel hosting

### Out of Scope
- Reescribir frontend (ya funcional con Notion-first)
- Migrar datos históricos a SQLite
- UI dashboard o reportes visuales
- Backup automático de SQLite
- Transición automática a Fase Estable

## Capabilities

### New Capabilities
- `quote-persistence`: Persistencia de cotizaciones en SQLite con schema v1 y versionado de configuración

### Modified Capabilities
None

## Approach

SQLite como store primario local (`backend/data/.sqlite`). Antes de responder POST /api/quotes/simulate, persistir QuoteRecord sincrónico. Después mantener sync async a Notion para proyección comercial. Si falla sync a Notion, cotización sigue válida en SQLite. Reintentos idempotentes por trace_id + tipo_evento.

| File | Impact | Description |
|------|--------|-------------|
| `server.js` | Modified | Persistir QuoteRecord antes de finalizar request /api/quotes/simulate |
| `enviar.php` | New | Sync SQLite → Notion equivalente para cPanel |
| `backend/data/.sqlite` | New | Archivo local de persistencia SQLite |
| `api/types.ts` | Modified | Definir tipos QuoteRecord y pricing_config_version |

## Rollback Plan

1. Eliminar tabla `QuoteRecord` y `pricing_config_version` de SQLite
2. Revertir lógica de persistión en POST /api/quotes/simulate a Notion-first puro
3. Revertir cambios en `enviar.php` si existieron
4. Mantener frontend intacto (no dependiente de nuevo backend)

## Dependencies

- Sprint 0/1: endpoints simulate/lead funcionando, tipos definidos en `api/types.ts`
- SQLite driver: `better-sqlite3` para Express (sincrónico); PDO SQLite nativo para PHP
- cPanel hosting con compatibilidad SQLite y límites de disco controlados

## Success Criteria

- [ ] QuoteRecord persistido antes de respuesta frontend (log timestamp)
- [ ] pricing_config_version = "schema_v1" registrado
- [ ] Sync async a Notion no bloquea respuesta /api/quotes/simulate
- [ ] Reintentos idempotentes funcionales con trace_id único por operación
- [ ] SQLite size < 10MB post-sincronización inicial (mitigación R1 cPanel)

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| R1: cPanel limits disk/memory — SQLite too large or OOM in PHP | Medium | Keep SQLite small (schema v1, no indexes yet); PHP sync uses stream buffering |
| R2: Async sync diverges Notion vs SQLite | Low | SQLite as truth; manual re-sync UI deferred; audit log in meta.JSON |
| R3: Native deps (better-sqlite3) complicate cPanel deploy | Medium | Verify Node.js hosting supports `.node` or compile ahead to verify compatibility first |
