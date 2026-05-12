#!/bin/bash
# Restaurar quotes.sqlite desde backup
# Uso: ./restore-sqlite.sh [backup_filename]
# Si no se pasa filename, usa quotes_latest.sqlite

BACKUP_DIR="$HOME/backups"
DB_PATH="$HOME/myPortfolio/backend/data/quotes.sqlite"
BACKUP_FILE="${1:-$BACKUP_DIR/quotes_latest.sqlite}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "[ERROR] Backup not found: $BACKUP_FILE"
    exit 1
fi

# Hacer backup del archivo actual antes de restaurar
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$DB_PATH.pre_restore_$(date +%Y%m%d_%H%M%S)"
    echo "[OK] Current DB backed up before restore"
fi

cp "$BACKUP_FILE" "$DB_PATH"
echo "[OK] Database restored from: $BACKUP_FILE"
