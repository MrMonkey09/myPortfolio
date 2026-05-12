#!/bin/bash
# Cleanup de cotizaciones según política de retención
# - Archivar cotizaciones > 12 meses (sync_status=synced)
# - Eliminar cotizaciones stale > 6 meses sin contacto
# - Eliminar sync_status=failed > 6 meses
# Uso: ./cleanup-quotes.sh

DB_PATH="$HOME/myPortfolio/backend/data/quotes.sqlite"
LOG_FILE="$HOME/backups/cleanup.log"

ERROR_MARKER="DATABASE_INTEGRITY_CHECK_FAILED"

echo "[$(date)] Starting cleanup..." >> "$LOG_FILE"

# Verificar que la base de datos existe
if [ ! -f "$DB_PATH" ]; then
    echo "[ERROR] Database not found at $DB_PATH" >> "$LOG_FILE"
    exit 1
fi

# Marcar punto de control antes del cleanup
cp "$DB_PATH" "${DB_PATH}.cleanup.pre-$(date +%Y%m%d-%H%M%S)"

# 1. Verificar integridad antes de cleanup
INTEGRITY=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;")
if [ "$INTEGRITY" != "ok" ]; then
    echo "[ERROR] Database integrity check failed: $INTEGRITY. Aborting cleanup." >> "$LOG_FILE"
    echo "$ERROR_MARKER" | tee -a "$LOG_FILE"
    exit 1
fi

# 2. Marcar como archivadas las cotizaciones > 12 meses (synced, no ya archivadas)
TWELVE_MONTHS_AGO=$(date -d "12 months ago" +%Y-%m-%dT%H:%M:%S 2>/dev/null || date +"%Y-%m-%dT00:00:00" | cut -c1-19)
if [ "$OS" = "Windows_NT" ]; then
    # Windows no tiene fecha -d nativo, usar PowerShell para calcular
    TWELVE_MONTHS_AGO=$(powershell -Command "[DateTime]::Now.AddMonths(-12).ToString('yyyy-MM-ddTHH:mm:ss')" 2>/dev/null || echo "$(date +%Y-%m-%dT00:00:00)")
fi
ARCHIVED_COUNT=$(sqlite3 "$DB_PATH" "
    UPDATE quotes 
    SET sync_status = 'archived' 
    WHERE sync_status = 'synced' 
    AND created_at < '$TWELVE_MONTHS_AGO' 
    AND sync_status != 'archived';
")
echo "[$(date)] Archived $ARCHIVED_COUNT quotes older than 12 months" >> "$LOG_FILE"

# 3. Marcar como stale las cotizaciones sin contacto > 6 meses (incluyendo synced y archived)
SIX_MONTHS_AGO=$(powershell -Command "[DateTime]::Now.AddMonths(-6).ToString('yyyy-MM-ddTHH:mm:ss')" 2>/dev/null || echo "$(date +%Y-%m-%dT00:00:00)")
STALE_COUNT=$(sqlite3 "$DB_PATH" "
    UPDATE quotes 
    SET sync_status = 'stale' 
    WHERE sync_status IN ('synced', 'archived') 
    AND created_at < '$SIX_MONTHS_AGO';
")
echo "[$(date)] Marked $STALE_COUNT quotes as stale (> 6 months)" >> "$LOG_FILE"

# 4. Eliminar sync_status=failed > 6 meses (revisar manualmente primero)
FAILED_COUNT=$(sqlite3 "$DB_PATH" "
    SELECT COUNT(*) FROM quotes 
    WHERE sync_status = 'failed' 
    AND created_at < '$SIX_MONTHS_AGO';
")

if [ -n "$FAILED_COUNT" ] && [ "$FAILED_COUNT" -gt 0 ]; then
    echo "[$(date)] Found $FAILED_COUNT failed quotes older than 6 months (manual review needed)" >> "$LOG_FILE"
else
    # Por seguridad, solo marcar con una etiqueta si no hay fallidas
    echo "[$(date)] No failed quotes older than 6 months to remove" >> "$LOG_FILE"
fi

# 5. Compactar base de datos (vacuum)
echo "[$(date)] Running VACUUM to reclaim space..." >> "$LOG_FILE"
sqlite3 "$DB_PATH" "VACUUM;"
echo "[$(date)] VACUUM complete" >> "$LOG_FILE"

# Estadísticas finales
echo "[$(date)] Final stats:" >> "$LOG_FILE"

TOTAL_COUNT=$(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM quotes;')
sqlite3 "$DB_PATH" "SELECT 'Total: ' || COUNT(*) FROM quotes;" | head -1
sql3 "$DB_PATH" "SELECT sync_status, COUNT(*) as count FROM quotes GROUP BY sync_status ORDER BY count DESC;"

echo "[OK] Cleanup completed. See $LOG_FILE for details."
echo "" >> "$LOG_FILE"
rm -f "${DB_PATH}.cleanup.pre-*" 2>/dev/null || true
