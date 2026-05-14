---
# MANIFEST — Cotizador Web v1.2 (Sprint 5)
# Paquete de despliegue cPanel
---

## Estructura de archivos a desplegar

```
~/ (home usuario cPanel)
├── public_html/
│   ├── index.html (tu portfolio actual)
│   ├── servicios.html (o ruta actual)
│   ├── api/
│   │   ├── server.js          ← Backend Express (desarrollo)
│   │   ├── package.json       ← solo si usas Express en prod
│   │   └── node_modules/      ← instalar via npm en servidor
│   └── (resto del portfolio)
├── backend/
│   ├── enviar.php             ← Backend PHP (producción)
│   ├── .env                   ← configuración (NO versionar)
│   ├── data/
│   │   └── quotes.sqlite      ← base de datos (gitignored, se crea en deploy)
│   ├── db/
│   │   ├── index.js           ← SQLite abstraction
│   │   └── quotesRepository.js
│   ├── sync/
│   │   └── notionSync.js      ← solo si usas Express
│   └── scripts/              ← backups + audit (opcional en prod)
├── scripts/
│   ├── backup/
│   │   ├── backup-sqlite.sh
│   │   ├── restore-sqlite.sh
│   │   ├── verify-sqlite.sh
│   │   ├── cron-setup.sh
│   │   └── README.md
│   └── audit/
│       ├── check-health.sh
│       ├── cleanup-quotes.sh
│       ├── resync-failed.sh
│       └── stats-report.sh
├── logs/
│   ├── error.log              ← Apache/PHP errors
│   └── backup.log            ← cron backup logs
└── .env                      ← variables entorno (ver below)
```

---

## Archivos críticos (checklist pre-deploy)

### ✅ backend/enviar.php
- [x] Implementado completamente (RFC-002)
- [x] Paridad Express (buildTotals con total_monthly)
- [x] Validaciones, reintentos, idempotencia
- [x] SQLite + Notion sync async

### ✅ frontend/api/server.js
- [x] buildTotals con monthlyServices
- [x] simulate endpoint pasa monthly_services
- [x] lead endpoint con idempotencia
- [x] Envelope errores RFC-002

### ✅ Tipos y frontend
- [x] types/index.ts con total_monthly
- [x] Avanzada.tsx envía monthly_services
- [x] AvanzadaResumen.tsx sin fallback

### ✅ Persistencia
- [x] backend/db/index.js (WAL mode, better-sqlite3 → sql.js fallback)
- [x] backend/db/quotesRepository.js (CRUD)
- [x] backend/sync/notionSync.js (reintentos 1s/3s/7s)

### ✅ Scripts
- [x] scripts/backup/*.sh (backup, restore, verify, cron-setup)
- [x] scripts/audit/*.sh (health, cleanup, resync, stats)

---

## Variables de entorno .env (producción)

```env
# Puerto API (solo si Express)
PORT=3002

# Notion integration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Key interna (opcional)
API_KEY=optional_internal_key

# Ambiente
NODE_ENV=production

# SQLite path (relativo a este .env)
SQLITE_PATH=backend/data/quotes.sqlite
```

**Ubicación:** `~/backend/.env` (recomendado) o `~/public_html/api/.env` si Express.

---

## Paso a paso deploy (Fase 2 plan)

### Opción A — Git pull (si tienes repo clonado en cPanel)

```bash
# SSH a cPanel
ssh usuario@cpanel.tudominio.com

# Ir a directorio public_html
cd ~/public_html

# Pull actualizado
git pull origin main

# Instalar dependencias backend (si Express)
cd api
npm install --omit=dev

# Crear directorios
mkdir -p ~/backend/data ~/scripts/backup ~/scripts/audit ~/logs
chmod 755 ~/backend/data

# Copiar .env (manualmente subir o generar vía editor)
nano ~/backend/.env  # pegar contenido

# Test rápido
node server.js &
sleep 2
curl http://localhost:3002/health
```

### Opción B — SFTP upload (FileZilla / rsync)

```bash
# Local: comprimir artefactos necesarios
cd ..
zip -r cotizador-deploy.zip \
  frontend/api/server.js \
  frontend/api/package.json \
  backend/ \
  scripts/ \
  -x "*.git*" "node_modules/*" "*.sqlite"

# Subir via SFTP y descomprimir en cPanel
sftp usuario@cpanel.tudominio.com
put cotizador-deploy.zip
# En cPanel: extraer en ~/
# Luego mover archivos a ubicaciones finales
```

---

## Verificación post-deploy (Fase 4)

### Health check

```bash
# 1. API PHP respondiendo?
curl -s https://tudominio.com/backend/enviar.php -X POST \
  -H "Content-Type: application/json" \
  -d '{"context":{"schema_version":"1.0.0","origin":"quick","project_type":"website","project_state":"new","currency":"CLP"},"input":{"quick_answers":{"pages_estimate":5,"needs_ecommerce":"yes","urgency":"medium"}}}' \
  | jq '.error'  # debe ser null o no existir
```

### Test rápido avanzado con monthly_services

```bash
curl -s https://tudominio.com/backend/enviar.php -X POST \
  -H "Content-Type: application/json" \
  -d @scripts/test-e2e-payload.json | jq '.totals.total_monthly'
# Esperado: 85000 (si payload incluye mantenimiento-esencial)
```

### Check SQLite file

```bash
ssh usuario@cpanel.tudominio.com "ls -lh ~/backend/data/quotes.sqlite"
# Tamaño esperado: unos KB iniciales, crece con uso
```

### Check cron

```bash
ssh usuario@cpanel.tudominio.com "crontab -l"
# Deberías ver líneas de backup/health/resync
```

---

## Rollback plan

Si el deploy rompe algo:

1. **Frontend:** restaurar versión anterior (git checkout HEAD~1 o zip backup)
2. **Backend PHP:** reemplazar `enviar.php` por versión anterior (guardada como `.bak`)
3. **Database:** si SQLite corrupto, restaurar desde último backup:
   ```bash
   cp ~/backups/quotes.sqlite.2026-05-12 ~/backend/data/quotes.sqlite
   ```
4. **Cron:** desactivar temporalmente (`crontab -l > cron.bak && crontab -r`)

---

## Contacto y soporte

- **Repo:** github.com/tuuser/myPortfolio
- **Issues:** github.com/tuuser/myPortfolio/issues
- **Runbook:** este archivo (`docs/runbook-cotizador-produccion.md`)

---

**Despliegue recomendado:**  
Usar **PHP endpoint únicamente** en producción (`backend/enviar.php`). Express (`server.js`) se mantiene para desarrollo local y como referencia. Ajustar frontend para usar ruta relativa `/backend/enviar.php` o variable `API_BASE_URL`.

**Estado:** Listo para ejecutar `scripts/deploy-cpanel.sh` (requiere configurar credenciales SSH).