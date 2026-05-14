import * as ftp from "basic-ftp";
import * as dotenv from "dotenv";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env.deploy"), override: false });

function normalizeRemoteDir(value, fallback) {
  const raw = (value || "").trim().replace(/^['"]|['"]$/g, "");
  if (!raw) return fallback;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const config = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === "true",
};

async function deployFrontend() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    if (process.env.SKIP_BUILD === "true") {
      console.log("⏭️ Saltando build (SKIP_BUILD=true).");
    } else {
      console.log("🚀 Construyendo Frontend...");
      execSync("npm run web:build", { cwd: path.join(__dirname, "..", "frontend"), stdio: "inherit" });
    }

    console.log(`📡 Conectando a FTP: ${config.host}`);
    await client.access(config);

    const remoteDir = normalizeRemoteDir(process.env.FTP_FRONTEND_DIR, "/public_html");
    console.log(`📂 Subiendo Frontend a ${remoteDir}...`);
    await client.ensureDir(remoteDir);
    await client.cd(remoteDir);

    if (remoteDir === "/") {
      throw new Error("FTP_FRONTEND_DIR no puede ser '/'. Esto evitará borrar la raíz por seguridad.");
    }

    await client.clearWorkingDir();
    await client.uploadFromDir(path.join(__dirname, "..", "frontend", "dist"));

    console.log("✅ Frontend desplegado exitosamente.");
  } catch (err) {
    console.error("❌ Error en despliegue de Frontend:", err);
  }
  client.close();
}

async function deployBackend() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    console.log(`📡 Conectando a FTP: ${config.host}`);
    await client.access(config);

    const remoteDir = normalizeRemoteDir(process.env.FTP_BACKEND_DIR, "/api");
    console.log(`📂 Subiendo Backend PHP a ${remoteDir}...`);
    await client.ensureDir(remoteDir);
    await client.cd(remoteDir);

    const backendPath = path.join(__dirname, "..", "backend");

    // Subir archivos PHP core
    const phpFiles = ["enviar.php", "router.php"];
    for (const file of phpFiles) {
      const src = path.join(backendPath, file);
      await client.uploadFrom(src, `${remoteDir}/${file}`);
      console.log(`  ✅ ${file}`);
    }

    // Subir .env (solo si existe localmente; en prod debe existir en servidor)
    const envPath = path.join(backendPath, ".env");
    const fs = await import("fs");
    if (fs.existsSync(envPath)) {
      await client.uploadFrom(envPath, `${remoteDir}/.env`);
      console.log("  ✅ .env (credenciales)");
    } else {
      console.log(
        "  ⚠️  .env no existe localmente. Asegurate de subirlo manualmente al servidor (por seguridad)."
      );
    }

    console.log("✅ Backend PHP desplegado exitosamente.");
  } catch (err) {
    console.error("❌ Error en despliegue de Backend:", err);
  }
  client.close();
}

async function checkHealth() {
  const backendUrl =
    process.env.FTP_BACKEND_URL?.replace(/\/$/, "") ||
    `https://${(process.env.FTP_HOST || "").replace(/^ftp\./, "")}`;

  console.log(`\n🏥 Verificando backend en:\n   ${backendUrl}/api/quotes/simulate`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${backendUrl}/api/quotes/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: { schema_version: "", origin: "", project_type: "", project_state: "", currency: "" }, input: {} }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // 400 = endpoint exists but validation failed (expected)
    if (response.status === 400 || response.status === 401) {
      console.log("✅ Backend reachable and responding.");
    } else if (response.status >= 200 && response.status < 500) {
      console.log(`✅ Backend responding (HTTP ${response.status}).`);
    } else {
      console.log(`⚠️  Backend responded with HTTP ${response.status}.`);
    }
  } catch (err) {
    console.log(`⚠️  Health check failed: ${err.message}`);
    console.log("   Verificá manualmente que el backend esté respondiendo.");
  }
}

const target = process.argv[2];

console.log("🧭 FTP_FRONTEND_DIR:", normalizeRemoteDir(process.env.FTP_FRONTEND_DIR, "/public_html"));
console.log("🧭 FTP_BACKEND_DIR:", normalizeRemoteDir(process.env.FTP_BACKEND_DIR, "/api"));

if (target === "frontend") deployFrontend();
else if (target === "backend") deployBackend().then(checkHealth);
else if (target === "check") checkHealth();
else {
  const frontend = await deployFrontend();
  const backend = await deployBackend();
  await checkHealth();
}
