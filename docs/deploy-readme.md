# AUTOMATIZED DEPLOYMENT - mrmonkey.avdev.cl

Scripts para automatizar despliegue completo: **subida de .htarchess al servidor cPanel + purge Cloudflare cache**

## 📋 REQUISITOS PREVIOS

### OBLIGATORIOS:
- ✅ Archivo local `.htaccess-corrected-version.txt` generado en repo root
- ✅ `cf cli.exe` instalado globalmente (PATH) OR token CF listo para usar  
- ✅ pSmtp2 configurado en PATH OR credenciales cPanel disponibles para FileZilla

### OPCIONALES:
- Variables de entorno PowerShell pre-configuradas:
  - `$env:CF_CLI_TOKEN` - Token Cloudflare API  
  - `$env:FTP_USERNAME` / `$env:FTP_PASSWORD` - Credenciales cPanel

---

## 🎯 SCRIPTS DISPONIBLES

### 1. `deploy-all.ps1` *(PRINCIPAL)*
Automatiza despliegue completo del sitio + purge CF cache

**Usage:**
```powershell
# Ejecutar deploy completo (requiere cf-cli instalado globalmente)
\.\scripts\deploy-all.ps1 --skip-cloudflare

# Verificar CF token para purge automático después  
.\scripts\deploy-all.ps1 -cloudflareToken TU_TOKEN -email tu@email.com

# Skip Cloudflare si ya hizo manualmente o no tiene token
\.\scripts\deploy-all.ps1 --skip-cloudflare
```

### 2. `purge-cf-only.ps1` *(STAN ALONE)*  
Purge Cloudflare cache independientemente de subida FTP

**Usage:**
```powershell
# Con token CF específico
.\scripts\purge-cf-only.ps1 -ZoneTag mrmonkey.avdev.cl -Token TU_TOKEN

# O solo por zona (si cf-cli ya está autenticado)
.\scripts\purge-cf-only.ps1 --skip-confirm
```

---

## 🚀 WORKFLOW DEPLOY AUTOMATIZADO

### PRE-REQUISITO: Instalar Cloudflare CLI (si no está instalado)

**Opción A - Download desde CF:**
1. Ir a https://developers.cloudflare.com/cli/  
2. Descargar Windows EXE
3. Ejecutar instalador
4. O instalar vía Chocolatey: `choco install cloudflare-cli`

**Verificar instalación:**
```powershell
cf --version  # Debería mostrar versión si está instalado
```

### WORKFLOW AUTOMATIZADO COMPLETO:

```powershell
# Paso 1: Verificar archivo .htarchess en local (debe existir)
ls .htaccess-corrected-version.txt

# Paso 2: Ejecutar deployment automático
.\scripts\deploy-all.ps1 --skip-cloudflare

# O con token Cloudflare para purge completo  
.\scripts\deploy-all.ps1 -cloudflareToken TU_TOKEN -email tu@email.com

# Paso 3: Verificar deployment en navegador
http://mrmonkey.avdev.cl/frontend/servicios.html
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
myPortfolio/
├── scripts/
│   ├── deploy-all.ps1                # Script principal automation (FTP + CF) ✓
│   └── purge-cf-only.ps1             # Purge Cloudflare standalone ✓
├── .htaccess-corrected-version.txt   # Archivo listo para subir a /frontend/ ✓
└── DEPLOY-README.md                  # Este archivo de instrucciones
```

---

## 🛠️ FALLBACK MANUAL (si scripts no funcionan)

### SUBIR .HTACHES VÍA FILEZILLA:

**Instrucciones detalladas:**

1. **Abrir FileZilla client**
   - Descárgalo desde https://www.filezilla.net/ si no lo tienes
   - O usa cualquier FTP client similar (WinSCP, Cyberduck, etc)

2. **Configurar conexión al hosting cPanel:**
   
   En la ventana de FileZilla:
   - Server: `avdev.cl`
   - Username (Login): `mrmonkey`
   - Password: Tu contraseña cPanel
   - Port: `21` (FTP estándar) o `990` si FTPS seguro
   - Protocol: Default FTP (o FileZilla detectará el protocolo correcto)

3. **Conectar:**
   - Click en "Quickconnect" o "Connect"
   - Esperar conexión establecida al servidor remoto

4. **Verificar path remoto /frontend/:**
   - En panel derecho (Remote Site), navegar a `/frontend/`
   - O directamente a `/frontend/.htarchess` (el archivo actual)

5. **Subir archivo local:**
   ```
   C:\Users\MrMonkey\Documents\GitHub\myPortfolio\.htaccess-corrected-version.txt
   ```
   Drag & drop desde panel izquierdo (Local Sites) al remote /frontend/

6. **Rename en servidor RENAMER archivo:**
   - File subido se llama: `.htarchess-corrected-version.txt`
   - Click derecho → Rename a:
     ```
     .htaccess  # Sin extensión, es crítico para Apache
     ```
   
   Alternativa si no permite rename a mismo nombre:
   ```
   .htaccess.local  
   → Rename a: .htaccess
   ```

7. **Verificar deploy en navegador:**
   ```
   http://mrmonkey.avdev.cl/frontend/servicios.html
   (o http://mrmonkey.avdev.cl/frontend/)
   ```

### PURGE CLOUDFLARE CACHE MANUALMENTE (sin token CF):

**Opción A - Cloudflare Web UI (recomendado):**
1. Ir a dashboard: https://dash.cloudflare.com/  
2. Login con cuenta de Cloudflare
3. Click en "My Sites" → `mrmonkey.avdev.cl`  
4. En sidebar izquierdo, click "Caching"
5. Click botón grande "Purge Cache Zone" o "Purge Everything"
6. Confirmar purge
7. Esperar unos segundos
8. Verificar deploy en navegador

**Opción B - Cloudflare CLI manual:**
```bash
# Primero loguearse si no está ya logueado
cf login --email tu@email.com --token TU_API_TOKEN

# Purge específico para la zona/zone-tag
cf cache purge mrmonkey.avdev.cl

# O purgo completo de zona
cf purge-cache mrmonkey.avdev.cl
```

---

## 🔧 TROUBLESHOOTING

### ERROR: "pSmtp no encontrado" o "FTP tool not found"

**Solución:** Script necesita herramienta FTP automática en PATH

**Opción A - Instalar pSMTP2 (recomendado):**
1. Descargar desde https://www.powershelltools.com/pSmtp/
2. Instalador automático a `C:\Program Files\pSMTP2`
3. O vía Chocolatey: `choco install psmp`  
4. Reiniciar PowerShell y verificar `pSmtp --version`

**Opción B - Usar .NET WebClient fallback:**
- El script incluye fallback para Windows PowerShell 5.1+
- Requerirás variables de entorno FTP configuradas o manual FileZilla

### ERROR: "cf-cli no encontrado" cuando se necesita CF purge

**Solución: Instalar Cloudflare CLI primero:**

```powershell
# Opción 1: Descargar manualmente desde https://developers.cloudflare.com/cli/
# Extract a C:\Program Files\Cloudflare\CLI o similar en PATH

# Opción 2: Windows Package Manager (winget)
winget install Cloudflare.CLI

# Verificar instalación  
cf --version
```

**O usar token CF explícito:**
```powershell
.\scripts\deploy-all.ps1 -cloudflareToken TU_API_TOKEN -email tu@email.com
```

### ERROR: "Auth failed" o "Invalid API Key/Token Cloudflare"

**Solución:** Token CF inválido o sin permisos requeridos

**Requisitos mínimos para purge cache:**
1. **Zone.Purge Cache** → Permite purgar caché por URL/zona
2. **Zone Settings** → Listar zonas disponibles  
3. (Opcional) Zone Edit → Si necesita modificar configuración de zona

**Obtener tokens válidos CF:**
```
https://dash.cloudflare.com/profile/api-tokens
→ Click "Create Token"
→ Seleccionar: "Cloudflare API Access" o "Account Memberships"
→ Permisos requeridos anotados arriba (☑)
→ Guardar token y usar en scripts
```

### ERROR: Connection refused al conectar a cPanel FTP

**Solución:** Verificar credenciales cPanel o firewall

1. **Usar contraseña cPanel, no user de cuenta raíz**
2. **Firewall local/antivirus:** Permitir conexión FTP (puerto 21)  
3. **Verificar IP whitelisting en cPanel hosting:** Si aplica
4. **Intentar con FileZilla web UI para testear conexión:**
   ```
   https://www.filezilla.net/server/file-transfer-protocols.php
   → "Open FTP Server" → Testeo de conectividad
   ```

### ERROR: Apache server no acepta archivo .htarchess porque tiene extensión

**Solución CRÍTICA:** File `.htaccess` NO debe tener extensión en servidor

FileZilla manual requerirá usar rename específico antes de guardar:
- Archivo remoto actual: `.htaccess.old` o `router.php`
- Rename a: `.htarchess` (sin `.txt` o extensores)  
- Apache reconoce .htaccess por extensiones específicas, no archivos normales

---

## 📚 COMANDOS RÁPIDOS

### Checklist de comandos útiles para deploy manual/repeatable:

```powershell
# Verificar script listo en scripts/, file local existe
ls scripts\deploy-all.ps1, scripts\purge-cf-only.ps1
ls .htaccess-corrected-version.txt

# Ejecutar deployment rápido (sin purge CF por defecto)
.\scripts\deploy-all.ps1 --skip-cloudflare

# Solo purge Cloudflare cache completa
.\scripts\purge-cf-only.ps1 --skip-confirm

# Subir archivo manualmente a FTP via comandos line-by-line:
#   FileZilla → conectarse avdev.cl/mrmonkey  
#   Path remoto: /frontend/  
#   Drag file desde local al remote
#   RENAMER .htarchess-corrected-version.txt → .htaccess

# Purgo Cloudflare manualmente vía Web UI
# URL: https://dash.cloudflare.com/cache
```

---

## 🎯 WORKFLOW DEPLoy EN CURSO - RESUMEN ACTUALIZADO

### SITUACIÓN ACTUAL (12-05-2026):

✅ **Archivos .htarchess corregidos generados:**
   - `.htaccess-corrected-version.txt` en repo root  
   - Vite multi-entry routing fix aplicado correctamente  
   - Serve archivos estáticos directos, fallback PHP routes si necesarios

⚠️ **Scripts automatizados listos pero requieren configuración previa:**
   - `deploy-all.ps1`: Necesita FTP/Token CF configurados para auto-execución completa
   - `purge-cf-only.ps1`: Requiere cf-cli instalado globalmente OR token CF explícito

📋 **Workflow recomendado (sin token, sin pSmtp):**

```powershell
# PRIMER PASO: Generar file .htaccess corregido (ya hecho)
# El archivo existe en root ya generado por fix-htaccess routing issue

# SEGUNDO PASO: Usar FileZilla manual para subir al servidor cPanel:
# 1. FileZilla → avdev.cl/mrmonkey  
# 2. Upload .htaccess-corrected-version.txt a /frontend/ 
# 3. Rename a .htaccess en servidor remoto

# TERCER PASO: Purge Cloudflare manualmente vía Web UI si necesito:
# URL: https://dash.cloudflare.com/cache → purge everything

# VERIFICACIÓN FINAL:
http://mrmonkey.avdev.cl/frontend/servicios.html
```

### SITUACIÓN FUTURA (automatización completa):

- Instalar pSmtp2 o configurar credenciales
- Instalar cf-cli globalmente  
- Ejecutar: `.\scripts\deploy-all.ps1 --skip-cloudflare`
- Automático upload FTP + manual CF purge si no token config

---

## 🔒 SEGURIDAD Y CREDS

**NUNCA compromet credenciales en:**
- Scripts .ps1 en repos públicos (GitHub)
- Variables de entorno sin restricción  
- Logs o outputs por defecto  

**Si scripts ya existen con credenciales expuestas:**
```powershell
# Eliminar credential exposure antes de push git
Remove-Item -Recurse -Force c:\path\creds.config
# Add .gitignore para evitar accidental commit:
Add-Content .gitignore "/**/*password*"
```

---

## 📞 CONTACTO / SOPORTE

Problemas con scripts/deployment:
1. **Logs de error:** FileZilla transfer logs o cPanel error logs
2. **Verificar conectividad:** `Test-NetConnection avdev.cl -Port 21`
3. **Cloudflare purge failing:** Check quota limits en dashboard CF  
4. **Token CF invalida/regenerar:** Revisar section Troubleshooting

---

**ULTIMA ACTUALIZACIÓN: 12-05-2026**  
Versión: v1.0.0 (automatización inico, requiere ajustes config previos)  
