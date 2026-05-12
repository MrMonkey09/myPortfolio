#!/bin/bash
# Generar reporte de estadísticas del cotizador
# Uso: ./stats-report.sh

DB_PATH="$HOME/myPortfolio/backend/data/quotes.sqlite"

HEADER="═══════════════════════════════════════"
TITLE="   COTIZADOR — REPORTE DE ESTADÍSTICAS"
DATE_HEADER="   $(date)"
SEP="═══════════════════════════════════════"

echo "${SEP}"
echo "$TITLE" | sed 's/$/$(date)/' 2>/dev/null || echo "   COTIZADOR — REPORTE DE ESTADÍSTICAS"
echo "${SEP}"

# Verificar que la base de datos existe
if [ ! -f "$DB_PATH" ]; then
    echo "[ERROR] Database not found at $DB_PATH" | tee -a /dev/stderr
    exit 1
fi

echo ""
echo "─ Resumen General ──"
echo "Total de cotizaciones: $(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM quotes;')"
echo "Total archivadas:      $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM quotes WHERE sync_status='archived';")"

echo ""
echo "─ Estado de Sync ──"
echo $(sqlite3 "$DB_PATH" "SELECT printf('%-10s %d', sync_status, COUNT(*)) FROM quotes WHERE sync_status != 'archived' GROUP BY sync_status;") | sed "s/^$/No cotizaciones con sync status/ || [ '' ]" 2>/dev/null

echo ""
echo "─ Volumen por Origen ──"
echo $(sqlite3 "$DB_PATH" "SELECT printf('%-15s | %d', origin, COUNT(*)) FROM quotes GROUP BY origin ORDER BY COUNT(*) DESC;") | sed 's/^$/No cotizaciones/ || [ '' ]' 2>/dev/null

echo ""
echo "─ Cotizaciones este mes ──"
THIS_MONTH=$(date +%Y-%m)
echo "$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM quotes WHERE created_at GLOB '$THIS_MONTH*';") citas generadas en $THIS_MONTH"

echo ""
echo "─ Tasa de Conversión (leads) ──"
SYNCED_COUNT=$(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM quotes WHERE sync_status="synced";')
NON_ARCHIVED_COUNT=$(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM quotes WHERE sync_status!="archived";')
if [ "$NON_ARCHIVED_COUNT" -gt 0 ]; then
    CONVERSION=$(echo "scale=2; $SYNCED_COUNT * 100 / $NON_ARCHIVED_COUNT" | bc 2>/dev/null || echo "N/A")
else
    CONVERSION="0.00"
fi
printf "Conversion a synced: %s%%\n" "$CONVERSION"

echo ""
echo "${SEP}"
