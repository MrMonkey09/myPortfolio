#!/usr/bin/env node
/**
 * Helper E2E: inicia Express, ejecuta suite de tests, detiene servidor.
 *
 * Uso: node scripts/run-e2e-local.mjs
 *
 * El servidor Express se inicia en http://localhost:3001,
 * luego se ejecuta test-e2e.mjs como proceso hijo.
 * Al finalizar (éxito o error), se detiene el servidor.
 */

import { spawn } from "child_process";
import { setTimeout as wait } from "timers/promises";

const SERVER_URL = "http://localhost:3001";
let serverProcess = null;

function log(step, msg) {
  console.log(`[${new Date().toISOString()}] [${step}] ${msg}`);
}

async function startServer() {
  log("SRV", "Iniciando servidor Express...");
  serverProcess = spawn("node", ["frontend/api/server.js"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout.on("data", (data) => {
    process.stdout.write(`[SRV-OUT] ${data}`);
  });
  serverProcess.stderr.on("data", (data) => {
    process.stderr.write(`[SRV-ERR] ${data}`);
  });

  // Esperar health check (máx 10s)
  for (let i = 0; i < 20; i++) {
    await wait(500);
    try {
      const res = await fetch(SERVER_URL + "/health");
      if (res.ok) {
        log("SRV", "✅ Servidor respondiendo en " + SERVER_URL);
        return;
      }
    } catch (_) {
      // todavía no arrancó
    }
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
  let exitCode = 0;

  try {
    await startServer();

    // Ejecutar test-e2e.mjs como proceso hijo
    log("TEST", "Ejecutando suite E2E...");
    const testExitCode = await new Promise((resolve) => {
      const testProcess = spawn("node", ["scripts/test-e2e.mjs"], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      testProcess.on("exit", resolve);
    });

    exitCode = testExitCode ?? 1;
    if (exitCode === 0) {
      log("SUCCESS", "✅ Todos los tests E2E pasaron");
    } else {
      log("FAIL", `❌ Tests E2E fallaron (exit code ${exitCode})`);
    }
  } catch (e) {
    log("FATAL", `Error: ${e.message}`);
    exitCode = 1;
  } finally {
    await stopServer();
    process.exit(exitCode);
  }
}

run();
