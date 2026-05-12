#!/usr/bin/env bash
#
# deploy-cpanel.sh — Despliegue automatizado Cotizador a cPanel
#
# Uso:
#   bash scripts/deploy-cpanel.sh
#
# Qué hace:
# 1. Build frontend (si es necesario)
# 2. Copia archivos a cPanel via SFTP/rsync
# 3. Crea directorios y permisos
# 4. Genera .env en servidor
# 5. Instala dependencias Node en servidor (si aplica)
# 6. Configura cron backups (opcional)
# 7. Verifica health endpoint
#
# Requisitos:
# - Variable entorno CPANEL_HOST, CPANEL_USER, CPANEL_PASS o SSH_KEY
# - rsync instalado localmente
# - Acceso SSH o FTP a cPanel
#

set -euo pipefail

# Configuración (ajustar)
CPANEL_HOST="${CPANEL_HOST:-cpanel.tudominio.com}"
CPANEL_USER="${CPANEL_USER:-usuario_cpanel}"
REMOTE_BASE="${REMOTE_BASE:-/home/${CPANEL_USER}/public_html}"
REMOTE_BACKEND="${REMOTE_BACKEND:-/home/${CPANEL_USER}/backend}"
REMOTE_SCRIPTS="${REMOTE_SCRIPTS:-/home/${CPANEL_USER}/scripts}"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 0. Verificar herramientas
log "🔧 Verificando herramientas requeridas..."
command -v rsync >/dev/null 2>&1 || { error "rsync no instalado"; exit 1; }
command -v ssh >/dev/null 2>&1 || { error "ssh no instalado"; exit 1; }
success "Herramientas OK"

# 1. Build frontend (si existe package.json)
log "🔨 Building frontend..."
if [ -d "frontend" ]; then
  cd frontend
  if command -v npm &>/dev/null; then
    npm run build --if-present || warning "Build frontend skip (no build script o error)"
  fi
  cd ..
fi
success "Frontend listo"

# 2. Crear directorios remotos
log "📁 Creando directorios remotos..."
ssh "${CPANEL_USER}@${CPANEL_HOST}" "mkdir -p ${REMOTE_BASE}/api ${REMOTE_BACKEND}/data ${REMOTE_SCRIPTS}/backup ${REMOTE_SCRIPTS}/audit" || true
ssh "${CPANEL_USER}@${CPANEL_HOST}" "chmod 755 ${REMOTE_BACKEND}/data" || true
success "Directorios creados"

# 3. Copiar archivos via rsync
log "📤 Copiando archivos a cPanel..."

# Rsync options: -avz (archive, verbose, compress), --delete (limpiar remoto)
RSYNC_OPTS="-avz --delete --exclude='node_modules' --exclude='.git' --exclude='dist'"

# Backend (Express api)
rsync ${RSYNC_OPTS} frontend/api/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BASE}/api/" || warning "Frontend api no copiado (puede no existir)"
# Backend PHP
rsync ${RSYNC_OPTS} backend/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BACKEND}/" || error "ERROR copiando backend PHP"
# Scripts
rsync ${RSYNC_OPTS} scripts/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_SCRIPTS}/" || warning "Scripts no copiados"
# Frontend dist (si existe)
if [ -d "frontend/dist" ]; then
  rsync ${RSYNC_OPTS} frontend/dist/ "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_BASE}/" || warning "Dist no copiado"
fi

success "Archivos copiados"

# 4. Instalar dependencias Node en servidor (opcional, si usas Express)
log "📦 Instalando dependencias Node en servidor..."
ssh "${CPANEL_USER}@${CPANEL_HOST}" "cd ${REMOTE_BASE}/api && npm install --omit=dev" || warning "No se pudo instalar npm (quizá Express no se usa en prod)"

# 5. Generar .env en servidor
log "🔐 Configurando variables de entorno..."
read -s -p "Notion Token (dejar vacío para skip): " NOTION_TOKEN
echo
read -s -p "Notion DB ID (dejar vacío para skip): " NOTION_DB_ID
echo

ENV_CONTENT="PORT=3002
"
if [ -n "$NOTION_TOKEN" ]; then
  ENV_CONTENT+="NOTION_TOKEN=${NOTION_TOKEN}
"
fi
if [ -n "$NOTION_DB_ID" ]; then
  ENV_CONTENT+="NOTION_DB_ID=${NOTION_DB_ID}
"
fi

echo "$ENV_CONTENT" | ssh "${CPANEL_USER}@${CPANEL_HOST}" "cat > ${REMOTE_BACKEND}/.env && chmod 600 ${REMOTE_BACKEND}/.env" || warning "No se pudo escribir .env"
success "Variables de entorno configuradas"

# 6. Configurar cron backups (opcional)
read -p "¿Configurar cron backups automáticos? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  log "⏰ Configurando cron backups..."
  ssh "${CPANEL_USER}@${CPANEL_HOST}" "cd ${REMOTE_SCRIPTS}/backup && bash cron-setup.sh" || warning "Error configurando cron"
  success "Cron backups configurados (verificar con 'crontab -l')"
else
  warning "Cron backups omitidos (configurar manualmente)"
fi

# 7. Verificar health endpoint (solo si Express está corriendo)
log "🏥 Verificando health endpoint..."
sleep 2  # dar tiempo a arrancar
if ssh "${CPANEL_USER}@${CPANEL_HOST}" "curl -s ${API_BASE:-http://localhost:3002}/health" | grep -q '"ok":true'; then
  success "Health check OK — API respondiendo"
else
  warning "Health check falló — Express puede no estar corriendo en cPanel"
  warning "Recomendación: usar PHP endpoint en producción (backend/enviar.php)"
fi

# 8. Resumen final
echo
echo "============================================"
echo "✅ DEPLOY COMPLETADO"
echo "============================================"
echo "Próximos pasos:"
echo "  1. Probar flujo en vivo: https://tudominio.com/servicios"
echo "  2. Generar cotización avanzada con servicios mensuales"
echo "  3. Verificar total_monthly en resumen"
echo "  4. Comprobarlead en Notion (si configurado)"
echo "  5. Verificar backups: ls -la ~/backups/"
echo ""
echo "Documentación:"
echo "  - Plan operativo: docs/plan-pendientes-operativos.md"
echo "  - Sprint 5: docs/sprints/sprint-5.md"
echo "  - Runbook futuro: docs/runbook-cotizador-produccion.md (crear)"
echo ""
echo "Si usas PHP en producción (recomendado):"
echo "  Asegurar que frontend use API_BASE_URL=/backend/enviar.php"

exit 0
