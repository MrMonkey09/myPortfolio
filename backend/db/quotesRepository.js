/**
 * CRUD operations para QuoteRecord
 * Compatible con better-sqlite3 y sql.js (WASM fallback)
 * 
 * better-sqlite3: usa @campo named parameters
 * sql.js: usa ? positional parameters (el wrapper los convierte)
 */

import { getDatabase } from "./index.js";

export function createQuoteRecord(record) {
  const db = getDatabase();
  
  // Usar named params para better-sqlite3, el wrapper de sql.js los maneja
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
  
  // Crear objeto con las keys correctas para el wrapper
  const params = {
    quote_id: record.quote_id,
    trace_id: record.trace_id,
    schema_version: record.schema_version,
    pricing_config_version: record.pricing_config_version,
    origin: record.origin,
    project_type: record.project_type,
    project_state: record.project_state,
    currency: record.currency,
    input_json: record.input_json,
    totals_json: record.totals_json,
    meta_json: record.meta_json,
    created_at: record.created_at,
    sync_status: record.sync_status || "pending",
    sync_attempts: record.sync_attempts || 0,
    sync_last_error: record.sync_last_error || null,
  };
  
  return stmt.run(params);
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

export function getQuoteById(quoteId) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM quotes WHERE quote_id = ?");
  return stmt.get(quoteId);
}

export function countQuotesByStatus(status) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE sync_status = ?");
  const result = stmt.get(status);
  return result?.count || 0;
}