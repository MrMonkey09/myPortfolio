/**
 * Database abstraction layer — SQLite con fallback strategy
 * 
 * Strategy:
 * - Intenta usar better-sqlite3 (sincrónico, rápido, C++)
 * - Si falla (no disponible, cPanel), usa sql.js (WASM, sin native deps)
 * 
 * Esta abstracción permite que el mismo código funcione en:
 * - Desarrollo local: better-sqlite3
 * - cPanel compartido: sql.js (WASM)
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DB_DIR, "quotes.sqlite");

let dbInstance = null;
let dbType = null; // 'better-sqlite3' | 'sql.js'

// ─────────────────────────────────────────────────────────────
// Better-sqlite3 (preferido para desarrollo local)
// ─────────────────────────────────────────────────────────────

async function initBetterSqlite3() {
  const Database = (await import("better-sqlite3")).default;
  
  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  const db = new Database(DB_PATH);
  
  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");
  
   // Create tables if not exist
   db.exec(`
     CREATE TABLE IF NOT EXISTS quotes (
       quote_id TEXT PRIMARY KEY,
       trace_id TEXT NOT NULL UNIQUE,
       schema_version TEXT NOT NULL,
       pricing_config_version TEXT NOT NULL,
       origin TEXT NOT NULL,
       project_type TEXT NOT NULL,
       project_state TEXT NOT NULL,
       currency TEXT NOT NULL,
       input_json TEXT NOT NULL,
       totals_json TEXT NOT NULL,
       meta_json TEXT NOT NULL,
       created_at TEXT NOT NULL,
       sync_status TEXT NOT NULL DEFAULT 'pending',
       sync_attempts INTEGER NOT NULL DEFAULT 0,
       sync_last_error TEXT
     );
     
     CREATE INDEX IF NOT EXISTS idx_quotes_trace_id ON quotes(trace_id);
     CREATE INDEX IF NOT EXISTS idx_quotes_sync_status ON quotes(sync_status);
     CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
   `);

   // Create archive table for retention policy (Work-Unit B)
   db.exec(`
     CREATE TABLE IF NOT EXISTS quotes_archive (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       quote_id TEXT PRIMARY KEY,
       archive_date TEXT NOT NULL DEFAULT (datetime('now')),
       original_created_at TEXT NOT NULL,
       origin TEXT NOT NULL DEFAULT 'unknown',
       project_type TEXT NOT NULL DEFAULT 'unknown',
       total_project INTEGER,
       total_monthly INTEGER,
       confidence_level TEXT,
       sync_status TEXT NOT NULL DEFAULT 'archived',
       archived_reason TEXT
     )
   `);

   db.exec(`
     CREATE INDEX IF NOT EXISTS idx_archive_date ON quotes_archive(archive_date);
     CREATE INDEX IF NOT EXISTS idx_archive_quote_id ON quotes_archive(quote_id);
   `);
  
  dbType = "better-sqlite3";
  return db;
}

// ─────────────────────────────────────────────────────────────
// sql.js (fallback para cPanel / entornos sin native deps)
// ─────────────────────────────────────────────────────────────

async function initSqlJs() {
  const initSqlJs = (await import("sql.js")).default;
  
  // Locate the WASM binary
  const wasmPath = path.join(DB_DIR, "..", "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  let wasmBinary;
  
  if (fs.existsSync(wasmPath)) {
    wasmBinary = fs.readFileSync(wasmPath);
  }
  
  const SQL = await initSqlJs({
    wasmBinary,
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });
  
  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  // Load existing database or create new one
  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  
  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      quote_id TEXT PRIMARY KEY,
      trace_id TEXT NOT NULL UNIQUE,
      schema_version TEXT NOT NULL,
      pricing_config_version TEXT NOT NULL,
      origin TEXT NOT NULL,
      project_type TEXT NOT NULL,
      project_state TEXT NOT NULL,
      currency TEXT NOT NULL,
      input_json TEXT NOT NULL,
      totals_json TEXT NOT NULL,
      meta_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      sync_attempts INTEGER NOT NULL DEFAULT 0,
      sync_last_error TEXT
    )
   `);

   // Create archive table for retention policy (Work-Unit B)
   db.run(`
     CREATE TABLE IF NOT EXISTS quotes_archive (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       quote_id TEXT PRIMARY KEY,
       archive_date TEXT NOT NULL DEFAULT (datetime('now')),
       original_created_at TEXT NOT NULL,
       origin TEXT NOT NULL DEFAULT 'unknown',
       project_type TEXT NOT NULL DEFAULT 'unknown',
       total_project INTEGER,
       total_monthly INTEGER,
       confidence_level TEXT,
       sync_status TEXT NOT NULL DEFAULT 'archived'
     )
   `);

   // Create indexes (sql.js doesn't support IF NOT EXISTS for indexes well)
   try {
     db.run("CREATE INDEX IF NOT EXISTS idx_quotes_trace_id ON quotes(trace_id)");
     db.run("CREATE INDEX IF NOT EXISTS idx_quotes_sync_status ON quotes(sync_status)");
     db.run("CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at)");
     db.run("CREATE INDEX IF NOT EXISTS idx_archive_date ON quotes_archive(archive_date)");
     db.run("CREATE INDEX IF NOT EXISTS idx_archive_quote_id ON quotes_archive(quote_id)");
   } catch {
     // Indexes may already exist
   }
  
  dbType = "sql.js";
  return db;
}

// ─────────────────────────────────────────────────────────────
// sql.js wrapper para API compatible con better-sqlite3
// ─────────────────────────────────────────────────────────────

function createSqlJsWrapper(db) {
  return {
    prepare(sql) {
      return {
        run(...params) {
          db.run(sql, params);
          return { changes: db.getRowsModified() };
        },
        get(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...params) {
          const results = [];
          const stmt = db.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
      };
    },
    exec(sql) {
      db.run(sql);
    },
    pragma(pragma) {
      // sql.js doesn't support PRAGMA well, ignore for compatibility
    },
    save() {
      // Persist to file
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    },
    close() {
      this.save();
      db.close();
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Public API — init y getDatabase
// ─────────────────────────────────────────────────────────────

export async function initDatabase() {
  // Try better-sqlite3 first
  try {
    const db = await initBetterSqlite3();
    console.log("[DB] Using better-sqlite3 (native SQLite)");
    return db;
  } catch (betterError) {
    console.warn("[DB] better-sqlite3 not available, falling back to sql.js:", betterError.message);
  }
  
  // Fallback to sql.js
  try {
    const sqlDb = await initSqlJs();
    const wrapper = createSqlJsWrapper(sqlDb);
    
    // Override save on each run to persist changes
    const originalRun = sqlDb.run.bind(sqlDb);
    sqlDb.run = function(...args) {
      originalRun(...args);
      wrapper.save();
    };
    
    console.log("[DB] Using sql.js (WASM fallback)");
    return wrapper;
  } catch (sqlJsError) {
    throw new Error(`Neither better-sqlite3 nor sql.js available: ${sqlJsError.message}`);
  }
}

export function getDatabase() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}

export function getDbType() {
  return dbType;
}

export async function initializeDatabase() {
  if (!dbInstance) {
    dbInstance = await initDatabase();
  }
  return dbInstance;
}

// For backwards compatibility — sync init for better-sqlite3
export function getDatabaseSync() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return dbInstance;
}