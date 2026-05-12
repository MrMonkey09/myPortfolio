#!/usr/bin/env node
/**
 * Helper: iniciar Express, esperar, correr tests, parar.
 * Uso: node scripts/run-e2e-local.mjs
 */

import { spawn } from "child_process";
import { setTimeout as wait } from "timers/promises";

const SERVER_URL = "http://localhost:3002";
let serverProcess = null;

function log(step, msg) {
  console.log(`[${new Date().toISOString()}] [${step}] ${msg}`);
}

async function startServer() {
  log("SRV", "Iniciando servidor Express...");
  serverProcess = spawn("node", ["frontend/api/server.js"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_PATH: "./frontend/node_modules" },
  });

  serverProcess.stdout.on("data", (data) => {
    process.stdout.write(`[SRV-OUT] ${data}`);
  });
  serverProcess.stderr.on("data", (data) => {
    process.stderr.write(`[SRV-ERR] ${data}`);
  });

  // Esperar a que esté listo (max 10s)
  for (let i = 0; i < 20; i++) {
    await wait(500);
    try {
      const res = await fetch(SERVER_URL + "/health");
      if (res.ok) {
        log("SRV", "✅ Servidor respondiendo");
        return;
      }
    } catch (_) {}
  }
  throw new Error("Servidor no respondió en 10s");
}

async function stopServer() {
  if (serverProcess) {
    log("SRV", "Deteniendo servidor...");
    serverProcess.kill("SIGTERM");
    await new Promise((resolve) => serverProcess.once("exit", resolve));
    log("SRV", "Servidor detenido");
  }
}

async function run() {
  try {
    await startServer();

    // Ejecutar tests importando el script E2E
    log("TEST", "Ejecutando suite E2E...");
    const { default: runTests } = await import("./test-e2e.mjs");
    await runTests(); // si test-e2e exporta función, sino reexecutamos lógica

    log("SUCCESS", "✅ Todos los tests pasaron");
    process.exit(0);
  } catch (e) {
    log("FATAL", `Error: ${e.message}`);
    process.exit(1);
  } finally {
    await stopServer();
  }
}

run();
