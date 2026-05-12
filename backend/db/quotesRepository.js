// CRUD operations para QuoteRecord
import { getDatabase } from "./index.js";

export function createQuoteRecord(record) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO quotes (
      quote_id, trace_id, schema_version, pricing_config_version,
      origin, project_type, project_state, currency,
      input_json, totals_json, meta_json,
      created_at, sync_status, sync_attempts, sync_last_error
    ) VALUES (
      @quote_id, @trace_id, @schema_version, @pricing_config_version,
      @origin, @project_type, @project_state, @currency,
      @input_json, @totals_json, @meta_json,
      @created_at, @sync_status, @sync_attempts, @sync_last_error
    )
  `);

  return stmt.run(record);
}

export function getQuoteByTraceId(traceId) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM quotes WHERE trace_id = ?");
  return stmt.get(traceId);
}

export function getPendingSyncRecords(limit = 10) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM quotes 
    WHERE sync_status IN ('pending', 'retrying')
    ORDER BY created_at ASC
    LIMIT ?
  `);
  return stmt.all(limit);
}

export function updateSyncStatus(quoteId, { status, attempts, error }) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE quotes 
    SET sync_status = ?, sync_attempts = ?, sync_last_error = ?
    WHERE quote_id = ?
  `);
  return stmt.run(status, attempts, error || null, quoteId);
}
