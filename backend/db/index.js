// Inicialización de SQLite con mejor-sqlite3
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths absolutos consistentes con el patrón Vite backend (VITE_BACKEND_ROOT / backend)
const DB_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DB_DIR, "quotes.sqlite");

let dbInstance = null;

export function initDatabase() {
  // Ensure data directory exists
  import("fs").then((fs) => {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  });

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

  return db;
}

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}
