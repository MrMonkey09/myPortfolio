import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arrancar Frontend (Vite)
const frontend = spawn("npm", ["run", "web:dev"], {
  cwd: path.join(__dirname, "..", "frontend"),
  stdio: "inherit",
  shell: true,
});

// Arrancar Backend (PHP Built-in Server en puerto 3001)
const backend = spawn("php", ["-S", "localhost:3001", "-t", "."], {
  cwd: path.join(__dirname, "..", "backend"),
  stdio: "inherit",
  shell: true,
});

console.log("🚀 Servidor Frontend corriendo (Vite)");
console.log("🐘 Servidor Backend corriendo (PHP en http://localhost:3001)");

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
