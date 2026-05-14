#!/usr/bin/env bash
#
# deploy-cpanel-complete.sh — Paquete completo de despliegue cPanel
#
# Este script prepara y sube el cotizador a cPanel.
# Uso: bash scripts/deploy-cpanel-complete.sh
#
# Requiere variables de entorno:
#   CPANEL_HOST, CPANEL_USER, CPANEL_PASS (o configurar SSH keys)
#

set -euo pipefail

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Configuración
CPANEL_HOST="${CPANEL_HOST:-}"
CPANEL_USER="${CPANEL_USER:-}"
CPANEL_PASS="${CPANEL_PASS:-}"
REMOTE_BASE="${REMOTE_BASE:-/home/${CPANEL_USER}/public_html}"
REMOTE_BACKEND="${REMOTE_BACKEND:-/home/${CPANEL_USER}/backend}"
REMOTE_SCRIPTS="${REMOTE_SCRIPTS:-/home/${CPANEL_USER}/scripts}"

# Validar credenciales
if [ -z "$CPANEL_HOST" ] || [ -z "$CPANEL_USER" ]; then
  err "Faltan credenciales. Define CPANEL_HOST y CPANEL_USER (o configura SSH keys)."
fi

log "🚀 Iniciando deployment completo a cPanel..."

# 1. Compilar frontend (si es necesario)
if [ -d "frontend" ]; then
  log "🔨 Compilando frontend..."
  cd frontend
  if [ -f "package.json" ]; then
    npm run build --if-present || warn "Build frontend falló, continuando con dist existente"
  fi
  cd ..
fi

# 2. Crear estructura remota
log "📁 Creando estructura de directorios en cPanel..."
ssh "${CPANEL_USER}@${CPANEL_HOST}" "mkdir -p ${REMOTE_BASE}/api ${REMOTE_BACKEND}/data ${REMOTE_SCRIPTS}/backup ${REMOTE_SCRIPTS}/audit ${REMOTE_BASE}/backend" || true
ssh "${CPANEL_USER}@${CPANEL_HOST}" "chmod 755 ${REMOTE_BACKEND}/data" || true

# 3. Copiar archivos via rsync
log "📤 Copiando archivos a cPanel..."
RSYNC_OPTS="-avz --delete --exclude='node_modules' --exclude='.git' --exclude='*.sqlite' --exclude='.env'"

# Backend PHP (producción)
rsync ${RSYNC_OPTS} backend/enviar.php "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BACKEND}/" || err "ERROR copiando enviar.php"
rsync ${RSYNC_OPTS} backend/db/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BACKEND}/db/" || true
rsync ${RSYNC_OPTS} backend/sync/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BACKEND}/sync/" || true

# Frontend API (Express opcional, para staging)
rsync ${RSYNC_OPTS} frontend/api/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BASE}/api/" || warn "Express API no copiado (opcional)"

# Frontend dist
if [ -d "frontend/dist" ]; then
  rsync ${RSYNC_OPTS} frontend/dist/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BASE}/" || err "ERROR copiando frontend dist"
fi

# Scripts
rsync ${RSYNC_OPTS} scripts/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_SCRIPTS}/" || err "ERROR copiando scripts"
ssh "${CPANEL_USER}@${CPANEL_HOST}" "chmod +x ${REMOTE_SCRIPTS}/*/*.sh ${REMOTE_SCRIPTS}/*.sh" || true

ok "Archivos copiados"

# 4. Configurar .env interactivo
log "🔐 Configurando variables de entorno..."
read -s -p "Notion Token (dejar vacío para skip): " NOTION_TOKEN
echo
read -s -p "Notion DB ID (dejar vacío para skip): " NOTION_DB_ID
echo

ENV_CONTENT="PORT=3002
NODE_ENV=production
"
if [ -n "$NOTION_TOKEN" ]; then
  ENV_CONTENT+="NOTION_TOKEN=${NOTION_TOKEN}
"
fi
if [ -n "$NOTION_DB_ID" ]; then
  ENV_CONTENT+="NOTION_DB_ID=${NOTION_DB_ID}
"
fi

echo "$ENV_CONTENT" | ssh "${CPANEL_USER}@${CPANEL_HOST}" "cat > ${REMOTE_BACKEND}/.env && chmod 600 ${REMOTE_BACKEND}/.env" || err "ERROR escribiendo .env"
ok "Variables de entorno configuradas"

# 5. Instalar dependencias PHP (ninguna, ya incluye todo)
log "📦 Verificando PHP..."
ssh "${CPANEL_USER}@${CPANEL_HOST}" "php -v" || err "PHP no disponible en cPanel"

# 6. Configurar cron backups (opcional)
read -p "¿Configurar cron backups automáticos? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  log "⏰ Configurando cron backups..."
  ssh "${CPANEL_USER}@${CPANEL_HOST}" "cd ${REMOTE_SCRIPTS}/backup && bash cron-setup.sh" || warn "Error configurando cron (puede requerir ajuste manual)"
  ok "Cron backups configurados"
else
  warn "Cron omitidos — configurar manualmente más tarde"
fi

# 7. Verificación post-deploy
log "🏥 Verificando deployment..."
sleep 2

# Health check PHP
PHP_URL="https://$(echo $CPANEL_HOST | sed 's/^https?:\/\///')/backend/enviar.php"
if curl -s -o /dev/null -w "%{http_code}" "${PHP_URL}" 2>/dev/null | grep -q "^200$"; then
  ok "Health check PHP respondiendo 200"
else
  warn "Health check PHP no respondió (puede ser normal si .htaccess no configurado aún)"
fi

# Verificar archivos remotos
ssh "${CPANEL_USER}@${CPANEL_HOST}" "ls -lh ${REMOTE_BACKEND}/enviar.php" || err "enviar.php no encontrado en remoto"
ssh "${CPANEL_USER}@${CPANEL_HOST}" "ls -ld ${REMOTE_BACKEND}/data" || err "Directorio data no existe"
ok "Estructura remota verificada"

# 8. Reporte final
echo
echo "============================================"
echo "✅ DEPLOY COMPLETADO"
echo "============================================"
echo ""
echo "Próximos pasos manuales:"
echo "  1. Probar flujo en vivo: https://${CPANEL_HOST}/servicios"
echo "  2. Generar cotización avanzada con servicios mensuales"
echo "  3. Verificar total_monthly en resumen (debería ser >0 si seleccionaste servicios)"
echo "  4. Comprobar lead en Notion (si configuraste token)"
echo "  5. Verificar backups: ls -la ~/backups/"
echo ""
echo "Documentación:"
echo "  - Runbook: docs/runbook-cotizador-produccion.md"
echo "  - Manifest: docs/deployment-manifest.md"
echo "  - Sprint 5: docs/sprints/sprint-5.md"
echo ""
echo "Si encuentras errores:"
echo "  1. Revisar logs: tail -f ~/logs/error_log"
echo "  2. Verificar SQLite permisos: chmod 755 ${REMOTE_BACKEND}/data"
echo "  3. Ejecutar health-check manual: curl ${PHP_URL}"
echo ""
echo "¡Cotizador desplegado! 🎯"

exit 0
