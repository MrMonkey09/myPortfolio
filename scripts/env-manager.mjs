#!/usr/bin/env node
/**
 * env-manager.mjs
 *
 * Safe environment manager for this project.
 *
 * Commands:
 *   node scripts/env-manager.mjs setup [--target deploy|backend|frontend|all] [--env development|production]
 *   node scripts/env-manager.mjs check [--target deploy|backend|frontend|all] [--env development|production]
 *   node scripts/env-manager.mjs show  [--target deploy|backend|frontend|all] [--env development|production]
 *
 * Security rules:
 * - Never prints secret values.
 * - Creates a timestamped backup before overwriting an existing env file.
 * - Frontend values are treated as public because Vite exposes VITE_* to the browser.
 */

import fs from "fs";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const COMMANDS = new Set(["setup", "check", "show"]);
const TARGETS = new Set(["deploy", "backend", "frontend", "all"]);
const ENVS = new Set(["development", "production"]);
const DB_DRIVERS = new Set(["mysql", "sqlite", "auto"]);

const SECRET_KEYS = new Set([
  "API_KEY",
  "MYSQL_PASSWORD",
  "FTP_PASSWORD",
  "DB_PASSWORD",
  "PASSWORD",
  "TOKEN",
  "SECRET",
]);

function parseArgs(argv) {
  const [command = "show", ...rest] = argv;
  const args = {
    command,
    target: "backend",
    env: "development",
    yes: false,
  };

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--target") args.target = rest[++i];
    else if (arg === "--env") args.env = rest[++i];
    else if (arg === "--yes" || arg === "-y") args.yes = true;
    else throw new Error(`Argumento desconocido: ${arg}`);
  }

  if (!COMMANDS.has(args.command)) {
    throw new Error(`Comando inválido: ${args.command}. Usar: setup, check o show.`);
  }
  if (!TARGETS.has(args.target)) {
    throw new Error(`Target inválido: ${args.target}. Usar: deploy, backend, frontend o all.`);
  }
  if (!ENVS.has(args.env)) {
    throw new Error(`Env inválido: ${args.env}. Usar: development o production.`);
  }

  return args;
}

function targetFiles(target, envName) {
  const files = [];
  if (target === "deploy" || target === "all") {
    files.push({ target: "deploy", file: path.join(ROOT, ".env.deploy") });
  }
  if (target === "backend" || target === "all") {
    files.push({ target: "backend", file: path.join(ROOT, "backend", ".env") });
  }
  if (target === "frontend" || target === "all") {
    files.push({ target: "frontend", file: path.join(ROOT, "frontend", `.env.${envName}`) });
  }
  return files;
}

function parseEnv(content) {
  const values = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rawValue] = trimmed.split("=");
    values.set(rawKey.trim(), rawValue.join("=").trim());
  }
  return values;
}

function readEnv(file) {
  if (!fs.existsSync(file)) return new Map();
  return parseEnv(fs.readFileSync(file, "utf8"));
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function backupFile(file) {
  if (!fs.existsSync(file)) return null;
  const backup = `${file}.backup-${timestamp()}`;
  fs.copyFileSync(file, backup);
  return backup;
}

function isSecretKey(key) {
  const upper = key.toUpperCase();
  return SECRET_KEYS.has(upper) || [...SECRET_KEYS].some((marker) => upper.includes(marker));
}

function maskValue(key, value) {
  if (!value) return "<empty>";
  if (!isSecretKey(key)) return value;
  return `${"*".repeat(Math.min(12, Math.max(8, value.length)))} (${value.length} chars)`;
}

function fingerprint(value) {
  // Non-crypto fingerprint by design: enough to compare changes without revealing the value.
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  return `fp:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function ask(rl, label, current = "", options = {}) {
  const suffix = current ? ` [actual: ${options.secret ? maskValue(label, current) : current}]` : "";
  const answer = await rl.question(`${label}${suffix}: `);
  if (answer.trim() === "" && current) return current;
  if (answer.trim() === "" && options.defaultValue != null) return options.defaultValue;
  return answer.trim();
}

async function askChoice(rl, label, allowed, current, defaultValue) {
  while (true) {
    const value = await ask(rl, `${label} (${[...allowed].join("|")})`, current, { defaultValue });
    if (allowed.has(value)) return value;
    console.log(`Valor inválido: ${value}`);
  }
}

function renderBackendEnv(values) {
  const driver = values.get("DB_DRIVER") || "mysql";
  const lines = [
    "# Configuración de Backend PHP",
    "# Generado por npm run env:setup",
    "",
    "# API",
    `API_KEY=${values.get("API_KEY") || ""}`,
    "",
    "# Persistencia: mysql primero, SQLite como fallback. Usar sqlite para forzar SQLite.",
    `DB_DRIVER=${driver}`,
    "",
    "# MySQL cPanel",
    `MYSQL_HOST=${values.get("MYSQL_HOST") || "localhost"}`,
    `MYSQL_PORT=${values.get("MYSQL_PORT") || "3306"}`,
    `MYSQL_DATABASE=${values.get("MYSQL_DATABASE") || ""}`,
    `MYSQL_USER=${values.get("MYSQL_USER") || ""}`,
    `MYSQL_PASSWORD=${values.get("MYSQL_PASSWORD") || ""}`,
    `MYSQL_CHARSET=${values.get("MYSQL_CHARSET") || "utf8mb4"}`,
    "",
    "# SQLite fallback/local: backend/data/quotes.sqlite",
  ];
  return `${lines.join("\n")}\n`;
}

function renderDeployEnv(values) {
  const lines = [
    "# Configuración de Deploy FTP/cPanel",
    "# Generado por npm run env:setup",
    "",
    "# Credenciales FTP",
    `FTP_HOST=${values.get("FTP_HOST") || ""}`,
    `FTP_USER=${values.get("FTP_USER") || ""}`,
    `FTP_PASSWORD=${values.get("FTP_PASSWORD") || ""}`,
    `FTP_PORT=${values.get("FTP_PORT") || "21"}`,
    `FTP_SECURE=${values.get("FTP_SECURE") || "false"}`,
    "",
    "# Rutas remotas en cPanel",
    `FTP_FRONTEND_DIR=${values.get("FTP_FRONTEND_DIR") || "/public_html"}`,
    `FTP_BACKEND_DIR=${values.get("FTP_BACKEND_DIR") || "/api"}`,
    `FTP_BACKEND_URL=${values.get("FTP_BACKEND_URL") || ""}`,
    "",
    "# Opcional: saltar build durante deploy",
    `SKIP_BUILD=${values.get("SKIP_BUILD") || "false"}`,
  ];
  return `${lines.join("\n")}\n`;
}

function renderFrontendEnv(values) {
  const lines = [
    "# Configuración Frontend Vite",
    "# Generado por npm run env:setup",
    "# ATENCIÓN: VITE_* se expone al navegador. No guardar secretos reales acá.",
    "",
    `VITE_BASE_URL=${values.get("VITE_BASE_URL") || "http://localhost:3001"}`,
    `VITE_API_KEY=${values.get("VITE_API_KEY") || ""}`,
  ];
  return `${lines.join("\n")}\n`;
}

async function setupBackend(rl, file, yes) {
  const current = readEnv(file);
  const values = new Map(current);

  values.set("API_KEY", await ask(rl, "API_KEY", values.get("API_KEY") || "", { secret: true }));
  values.set("DB_DRIVER", await askChoice(rl, "DB_DRIVER", DB_DRIVERS, values.get("DB_DRIVER") || "mysql", "mysql"));

  if (values.get("DB_DRIVER") !== "sqlite") {
    values.set("MYSQL_HOST", await ask(rl, "MYSQL_HOST", values.get("MYSQL_HOST") || "localhost", { defaultValue: "localhost" }));
    values.set("MYSQL_PORT", await ask(rl, "MYSQL_PORT", values.get("MYSQL_PORT") || "3306", { defaultValue: "3306" }));
    values.set("MYSQL_DATABASE", await ask(rl, "MYSQL_DATABASE", values.get("MYSQL_DATABASE") || ""));
    values.set("MYSQL_USER", await ask(rl, "MYSQL_USER", values.get("MYSQL_USER") || ""));
    values.set("MYSQL_PASSWORD", await ask(rl, "MYSQL_PASSWORD", values.get("MYSQL_PASSWORD") || "", { secret: true }));
    values.set("MYSQL_CHARSET", await ask(rl, "MYSQL_CHARSET", values.get("MYSQL_CHARSET") || "utf8mb4", { defaultValue: "utf8mb4" }));
  }

  await writeEnvFile(rl, file, renderBackendEnv(values), yes);
}

async function setupDeploy(rl, file, yes) {
  const current = readEnv(file);
  const values = new Map(current);

  values.set("FTP_HOST", await ask(rl, "FTP_HOST", values.get("FTP_HOST") || ""));
  values.set("FTP_USER", await ask(rl, "FTP_USER", values.get("FTP_USER") || ""));
  values.set("FTP_PASSWORD", await ask(rl, "FTP_PASSWORD", values.get("FTP_PASSWORD") || "", { secret: true }));
  values.set("FTP_PORT", await ask(rl, "FTP_PORT", values.get("FTP_PORT") || "21", { defaultValue: "21" }));
  values.set("FTP_SECURE", await askChoice(rl, "FTP_SECURE", new Set(["true", "false"]), values.get("FTP_SECURE") || "false", "false"));
  values.set("FTP_FRONTEND_DIR", await ask(rl, "FTP_FRONTEND_DIR", values.get("FTP_FRONTEND_DIR") || "/public_html", { defaultValue: "/public_html" }));
  values.set("FTP_BACKEND_DIR", await ask(rl, "FTP_BACKEND_DIR", values.get("FTP_BACKEND_DIR") || "/api", { defaultValue: "/api" }));
  values.set("FTP_BACKEND_URL", await ask(rl, "FTP_BACKEND_URL", values.get("FTP_BACKEND_URL") || ""));
  values.set("SKIP_BUILD", await askChoice(rl, "SKIP_BUILD", new Set(["true", "false"]), values.get("SKIP_BUILD") || "false", "false"));

  await writeEnvFile(rl, file, renderDeployEnv(values), yes);
}

async function setupFrontend(rl, file, yes) {
  const current = readEnv(file);
  const values = new Map(current);
  values.set("VITE_BASE_URL", await ask(rl, "VITE_BASE_URL", values.get("VITE_BASE_URL") || "http://localhost:3001", { defaultValue: "http://localhost:3001" }));
  values.set("VITE_API_KEY", await ask(rl, "VITE_API_KEY", values.get("VITE_API_KEY") || "", { secret: true }));
  await writeEnvFile(rl, file, renderFrontendEnv(values), yes);
}

async function writeEnvFile(rl, file, content, yes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && !yes) {
    const answer = await rl.question(`\n${path.relative(ROOT, file)} existe. Crear backup y sobrescribir? (yes/no): `);
    if (answer.trim().toLowerCase() !== "yes") {
      console.log("Cancelado.");
      return;
    }
  }
  const backup = backupFile(file);
  fs.writeFileSync(file, content, "utf8");
  if (backup) console.log(`Backup creado: ${path.relative(ROOT, backup)}`);
  console.log(`Archivo actualizado: ${path.relative(ROOT, file)}`);
}

function requiredKeysFor(target, values) {
  if (target === "deploy") return ["FTP_HOST", "FTP_USER", "FTP_PASSWORD", "FTP_FRONTEND_DIR", "FTP_BACKEND_DIR"];
  if (target === "frontend") return ["VITE_BASE_URL", "VITE_API_KEY"];
  const driver = values.get("DB_DRIVER") || "mysql";
  const keys = ["API_KEY", "DB_DRIVER"];
  if (driver !== "sqlite") {
    keys.push("MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_CHARSET");
  }
  return keys;
}

function showFile({ target, file }) {
  console.log(`\n${target.toUpperCase()} — ${path.relative(ROOT, file)}`);
  if (!fs.existsSync(file)) {
    console.log("  Estado: archivo no existe");
    return;
  }

  const values = readEnv(file);
  for (const key of requiredKeysFor(target, values)) {
    const value = values.get(key) || "";
    const fp = value && isSecretKey(key) ? ` ${fingerprint(value)}` : "";
    console.log(`  ${key}=${maskValue(key, value)}${fp}`);
  }
}

function checkFile({ target, file }) {
  console.log(`\n${target.toUpperCase()} — ${path.relative(ROOT, file)}`);
  if (!fs.existsSync(file)) {
    console.log("  ❌ archivo no existe");
    return false;
  }

  const values = readEnv(file);
  const missing = requiredKeysFor(target, values).filter((key) => !values.get(key));
  if (target === "backend") {
    const driver = values.get("DB_DRIVER") || "mysql";
    if (!DB_DRIVERS.has(driver)) missing.push("DB_DRIVER(valid:mysql|sqlite|auto)");
  }

  if (missing.length > 0) {
    console.log(`  ❌ faltan: ${missing.join(", ")}`);
    return false;
  }
  console.log("  ✅ OK");
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = targetFiles(args.target, args.env);

  if (args.command === "show") {
    files.forEach(showFile);
    return;
  }

  if (args.command === "check") {
    const ok = files.map(checkFile).every(Boolean);
    process.exit(ok ? 0 : 1);
  }

  const rl = readline.createInterface({ input, output });
  try {
    for (const item of files) {
      console.log(`\nConfigurando ${item.target}: ${path.relative(ROOT, item.file)}`);
      if (item.target === "deploy") await setupDeploy(rl, item.file, args.yes);
      else if (item.target === "backend") await setupBackend(rl, item.file, args.yes);
      else await setupFrontend(rl, item.file, args.yes);
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
