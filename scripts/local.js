/**
 * local.js — Arranca Frontend (Vite) + Backend PHP para desarrollo local.
 *
 * Frontend: vite dev (por defecto http://localhost:5173)
 * Backend:  PHP built-in server con router.php en http://localhost:3001
 *
 * vite.config.ts debe tener proxy para redirigir /api/* → localhost:3001,
 * o bien definir VITE_BASE_URL=http://localhost:3001 en .env.development.
 *
 * Uso: node scripts/local.js
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const BACKEND_PORT = 3001;

// Arrancar Backend (PHP Built-in Server con router.php)
const backend = spawn("php", [
  "-S", `localhost:${BACKEND_PORT}`,
  "router.php"  // router.php redirige todas las rutas a enviar.php
], {
  cwd: path.join(ROOT, "backend"),
  stdio: "inherit",
  shell: true,
  env: { ...process.env, APP_ENV: "development" },
});

// Esperar un poco para que PHP arranque antes de Vite
setTimeout(() => {
  // Arrancar Frontend (Vite)
  const frontend = spawn("npm", ["run", "web:dev"], {
    cwd: path.join(ROOT, "frontend"),
    stdio: "inherit",
    shell: true,
  });

  console.log(`🐘 Backend PHP corriendo en http://localhost:${BACKEND_PORT}`);
  console.log("🚀 Frontend Vite arrancando...");

  frontend.on("close", (code) => {
    console.log(`Frontend finalizó con código ${code}`);
    backend.kill();
  });

  backend.on("close", (code) => {
    console.log(`Backend finalizó con código ${code}`);
    frontend.kill();
  });

  process.on("SIGINT", () => {
    frontend.kill("SIGINT");
    backend.kill("SIGINT");
    process.exit();
  });
}, 500);
