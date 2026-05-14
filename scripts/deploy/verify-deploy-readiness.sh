#!/usr/bin/env bash
#
# verify-deploy-readiness.sh — Verifica que todo esté listo para deploy a cPanel
#
# Uso: bash scripts/verify-deploy-readiness.sh
#

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok() { echo -e "${GREEN}[OK]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

ERRORS=0
WARNINGS=0

echo "=========================================="
echo "🔍 Verificación de Pre-Deploy Sprint 5"
echo "=========================================="
echo ""

# 1. Verificar archivos críticos del código
echo "1. Verificando archivos de código críticos..."
FILES=(
  "backend/enviar.php"
  "frontend/api/server.js"
  "frontend/src/types/index.ts"
  "frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/Avanzada.tsx"
  "frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzadaResumen.tsx"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    ok "$f existe"
  else
    fail "$f NO encontrado"
    ((ERRORS++))
  fi
done

# 2. Verificar que total_monthly esté en types
echo ""
echo "2. Verificando que total_monthly está definido en tipos..."
if grep -q "total_monthly: number" frontend/src/types/index.ts; then
  ok "total_monthly encontrado en QuoteSimulateResponse.totals"
else
  fail "total_monthly NO definido en tipos"
  ((ERRORS++))
fi

# 3. Verificar que monthly_services se envía en Avanzada.tsx
echo ""
echo "3. Verificando que monthly_services se incluye en payload..."
if grep -q "monthly_services: formState.serviciosMensuales" frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/Avanzada.tsx; then
  ok "monthly_services incluido en Avanzada.tsx"
else
  fail "monthly_services NO encontrado en payload Avanzada"
  ((ERRORS++))
fi

# 4. Verificar buildTotals en server.js
echo ""
echo "4. Verificando cálculo total_monthly en server.js..."
if grep -q "totalMonthly = monthlyServices" frontend/api/server.js; then
  ok "buildTotals calcula totalMonthly en server.js"
else
  fail "buildTotals NO calcula totalMonthly"
  ((ERRORS++))
fi

if grep -q "total_monthly: Math.round(totalMonthly)" frontend/api/server.js; then
  ok "buildTotals retorna total_monthly"
else
  fail "buildTotals NO retorna total_monthly"
  ((ERRORS++))
fi

# 5. Verificar buildTotals en enviar.php
echo ""
echo "5. Verificando cálculo total_monthly en enviar.php..."
if grep -q "\$totalMonthly = 0;" backend/enviar.php; then
  ok "buildTotals calcula totalMonthly en PHP"
else
  fail "buildTotals PHP NO calcula totalMonthly"
  ((ERRORS++))
fi

if grep -q "'total_monthly' => round(\$totalMonthly)" backend/enviar.php; then
  ok "buildTotals PHP retorna total_monthly"
else
  fail "buildTotals PHP NO retorna total_monthly"
  ((ERRORS++))
fi

# 6. Verificar que AvanzadaResumen no use fallback
echo ""
echo "6. Verificando AvanzadaResumen sin fallback..."
if grep -q "resultado.totals.total_monthly" frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzadaResumen.tsx; then
  ok "AvanzadaResumen usa total_monthly directo"
else
  warn "AvanzadaResumen podría usar fallback (revisar manualmente)"
  ((WARNINGS++))
fi

# 7. Verificar documentación Sprint 5
echo ""
echo "7. Verificando documentación Sprint 5..."
DOCS=(
  "docs/sprints/sprint-5.md"
  "docs/decision-log-cotizador.md"
  "docs/plan-pendientes-operativos.md"
  "docs/deployment-manifest.md"
  "docs/runbook-cotizador-produccion.md"
)

for d in "${DOCS[@]}"; do
  if [ -f "$d" ]; then
    ok "$d existe"
  else
    warn "$d NO encontrado"
    ((WARNINGS++))
  fi
done

# 8. Verificar scripts operativos
echo ""
echo "8. Verificando scripts operativos..."
SCRIPTS=(
  "scripts/test-e2e.mjs"
  "scripts/deploy-cpanel.sh"
  "scripts/backup/backup-sqlite.sh"
  "scripts/audit/check-health.sh"
)

for s in "${SCRIPTS[@]}"; do
  if [ -f "$s" ]; then
    ok "$s existe"
  else
    warn "$s NO encontrado"
    ((WARNINGS++))
  fi
done

# 9. Verificar Git status limpio (solo archivos Sprint 5)
echo ""
echo "9. Verificando git status..."
UNTRACKED=$(git status --porcelain | grep '^??' | wc -l)
if [ "$UNTRACKED" -lt 5 ]; then
  ok "Sin archivos no rastreados críticos"
else
  warn "Hay ${UNTRACKED} archivos no rastreados (revisar antes de commit)"
  ((WARNINGS++))
fi

# 10. Resumen
echo ""
echo "=========================================="
echo "📊 Resumen de Verificación"
echo "=========================================="
echo "Errores:    $ERRORS"
echo "Warnings:   $WARNINGS"
echo ""

if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✅ TODO LISTO PARA DEPLOY${NC}"
  echo "Puedes ejecutar: bash scripts/deploy-cpanel-complete.sh"
  exit 0
else
  echo -e "${RED}❌ HAY ERRORES QUE BLOQUEAN DEPLOY${NC}"
  echo "Corrige los errores antes de continuar."
  exit 1
fi
