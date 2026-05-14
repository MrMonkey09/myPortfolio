import * as ftp from "basic-ftp";
import * as dotenv from "dotenv";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import * as fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el root
dotenv.config({ path: path.join(__dirname, "..", ".env.deploy"), override: false });

function normalizeRemoteDir(value, fallback) {
  const raw = (value || "").trim().replace(/^['"]|['"]$/g, "");
  if (!raw) return fallback;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const config = {
  host: (process.env.FTP_HOST || "").replace(/^ftp?s?:\/\//, ""),
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  port: parseInt(process.env.FTP_PORT || "21", 10),
  secure: process.env.FTP_SECURE === "true" ? "explicit" : false,
};

async function deployFrontend() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    console.log("\n--- Desplegando Frontend ---");
    if (process.env.SKIP_BUILD === "true" || process.env.CI === "true") {
      console.log("⏭️ Saltando build (SKIP_BUILD=true o CI detectado).");
    } else {
      console.log("🚀 Construyendo Frontend...");
      execSync("npm run web:build", { cwd: path.join(__dirname, "..", "frontend"), stdio: "inherit" });
    }

    console.log(`📡 Conectando a FTP: ${config.host}:${config.port} (User: ${config.user}, Secure: ${config.secure})`);
    
    await client.access({
      ...config,
      secureOptions: {
        rejectUnauthorized: false,
      },
    });

    const remoteDir = normalizeRemoteDir(process.env.FTP_FRONTEND_DIR, "/public_html");
    console.log(`📂 Preparando directorio remoto: ${remoteDir}...`);
    await client.ensureDir(remoteDir);
    await client.cd(remoteDir);

    if (remoteDir === "/") {
      throw new Error("FTP_FRONTEND_DIR no puede ser '/'. Esto evitará borrar la raíz por seguridad.");
    }

    console.log("🧹 Limpiando directorio de trabajo remoto...");
    await client.clearWorkingDir();
    
    const distPath = path.join(__dirname, "..", "frontend", "dist");
    if (!fs.existsSync(distPath)) {
        throw new Error(`La carpeta de distribución no existe: ${distPath}`);
    }
    
    console.log("📤 Subiendo archivos de frontend...");
    await client.uploadFromDir(distPath);

    console.log("✅ Frontend desplegado exitosamente.");
  } catch (err) {
    console.error("❌ Error en despliegue de Frontend:", err);
    throw err; // Re-lanzar para que el proceso falle
  } finally {
    client.close();
  }
}

async function deployBackend() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    console.log("\n--- Desplegando Backend ---");
    console.log(`📡 Conectando a FTP: ${config.host}:${config.port} (User: ${config.user}, Secure: ${config.secure})`);
    await client.access({
      ...config,
      secureOptions: {
        rejectUnauthorized: false,
      },
    });

    const remoteDir = normalizeRemoteDir(process.env.FTP_BACKEND_DIR, "/api");
    console.log(`📂 Subiendo Backend PHP a ${remoteDir}...`);
    await client.ensureDir(remoteDir);
    await client.cd(remoteDir);

    const backendPath = path.join(__dirname, "..", "backend");

    // Subir archivos PHP core
    const phpFiles = ["enviar.php", "router.php"];
    for (const file of phpFiles) {
      const src = path.join(backendPath, file);
      if (fs.existsSync(src)) {
        await client.uploadFrom(src, `${remoteDir}/${file}`);
        console.log(`  ✅ ${file}`);
      } else {
        console.warn(`  ⚠️  Archivo backend no encontrado: ${file}`);
      }
    }

    // Subir .env (solo si existe localmente)
    const envPath = path.join(backendPath, ".env");
    if (fs.existsSync(envPath)) {
      await client.uploadFrom(envPath, `${remoteDir}/.env`);
      console.log("  ✅ .env (credenciales)");
    } else {
      console.log(
        "  ⚠️  .env no existe localmente. Asegurate de que esté en el servidor."
      );
    }

    console.log("✅ Backend PHP desplegado exitosamente.");
  } catch (err) {
    console.error("❌ Error en despliegue de Backend:", err);
    throw err;
  } finally {
    client.close();
  }
}

async function checkHealth() {
  const backendUrl =
    process.env.FTP_BACKEND_URL?.replace(/\/$/, "") ||
    `https://${(process.env.FTP_HOST || "").replace(/^ftp\./, "")}`;

  console.log(`\n🏥 Verificando backend en: ${backendUrl}/api/quotes/simulate`);

  // Bypass SSL para el health check si es una IP (común en despliegues iniciales)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(new URL(backendUrl).hostname)) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${backendUrl}/api/quotes/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: { schema_version: "2.0.0", origin: "deploy-check", project_type: "check", project_state: "check", currency: "USD" }, input: {} }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 400 || response.status === 401 || (response.status >= 200 && response.status < 300)) {
      console.log(`✅ Backend reachable and responding (HTTP ${response.status}).`);
    } else {
      console.log(`⚠️  Backend responded with HTTP ${response.status}.`);
    }
  } catch (err) {
    console.log(`⚠️  Health check failed: ${err.message}`);
    console.log("   Esto no detiene el despliegue, pero verificá manualmente.");
  } finally {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}

async function main() {
    const target = process.argv[2];

    console.log("🚀 Iniciando proceso de despliegue...");
    console.log("🧭 FTP_FRONTEND_DIR:", normalizeRemoteDir(process.env.FTP_FRONTEND_DIR, "/public_html"));
    console.log("🧭 FTP_BACKEND_DIR:", normalizeRemoteDir(process.env.FTP_BACKEND_DIR, "/api"));

    try {
        if (target === "frontend") {
            await deployFrontend();
        } else if (target === "backend") {
            await deployBackend();
            await checkHealth();
        } else if (target === "check") {
            await checkHealth();
        } else {
            await deployFrontend();
            await deployBackend();
            await checkHealth();
        }
        console.log("\n🎉 Proceso finalizado exitosamente.");
    } catch (err) {
        console.error("\n💥 Error crítico durante el proceso.");
        process.exit(1);
    }
}

main();
