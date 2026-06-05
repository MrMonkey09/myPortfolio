/**
 * local-node.mjs — Arranca Frontend (Vite) + Backend Node (Express) para desarrollo.
 *
 * Frontend: vite dev (http://localhost:5173)
 * Backend:  Node Express en http://localhost:3001
 *
 * vite.config.ts debe tener proxy para redirigir /api/* → localhost:3001,
 * o definir VITE_BASE_URL=http://localhost:3001 en .env.development.
 *
 * Uso: node scripts/local-node.mjs
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const BACKEND_PORT = 3001;

// Arrancar Backend (Node Express)
const backend = spawn("node", ["api/server.js"], {
  cwd: path.join(ROOT, "frontend"),
  stdio: "inherit",
  shell: true,
});

// Esperar un poco antes de arrancar Vite
setTimeout(() => {
  const frontend = spawn("npm", ["run", "web:dev"], {
    cwd: path.join(ROOT, "frontend"),
    stdio: "inherit",
    shell: true,
  });

  console.log(`🚀 Backend Node en http://localhost:${BACKEND_PORT}`);
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
