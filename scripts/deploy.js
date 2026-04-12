import * as ftp from "basic-ftp";
import * as dotenv from "dotenv";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env.deploy"), override: true });

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
    console.log("🚀 Construyendo Frontend...");
    execSync("npm run web:build", { cwd: path.join(__dirname, "..", "frontend"), stdio: "inherit" });

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
    
    // Subir sistema PHP
    const backendPath = path.join(__dirname, "..", "backend");
    await client.uploadFrom(path.join(backendPath, "enviar.php"), `${remoteDir}/enviar.php`);
    
    console.log("ℹ️ Recuerda que debes subir tu propio archivo .env al servidor para producción manualmente (por seguridad).");
    console.log("✅ Backend PHP desplegado exitosamente.");
  } catch (err) {
    console.error("❌ Error en despliegue de Backend:", err);
  }
  client.close();
}

const target = process.argv[2];

console.log("🧭 FTP_FRONTEND_DIR:", normalizeRemoteDir(process.env.FTP_FRONTEND_DIR, "/public_html"));
console.log("🧭 FTP_BACKEND_DIR:", normalizeRemoteDir(process.env.FTP_BACKEND_DIR, "/api"));

if (target === "frontend") deployFrontend();
else if (target === "backend") deployBackend();
else {
  console.log("Uso: node deploy.js [frontend|backend]");
  deployFrontend().then(() => deployBackend());
}
