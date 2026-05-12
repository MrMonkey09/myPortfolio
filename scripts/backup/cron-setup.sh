#!/bin/bash
# Configurar backup diario a las 00:00 UTC
# Uso: ./cron-setup.sh

CRON_JOB="0 0 * * * $HOME/myPortfolio/scripts/backup/backup-sqlite.sh >> $HOME/backups/backup.log 2>&1"

# Agregar al crontab si no existe
(crontab -l 2>/dev/null | grep -v "backup-sqlite.sh"; echo "$CRON_JOB") | crontab -

echo "[OK] Cron job configured:"
crontab -l | grep backup
