#!/bin/bash
# Backup automatizado de quotes.sqlite
# Uso: ./backup-sqlite.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
DB_PATH="$HOME/myPortfolio/backend/data/quotes.sqlite"
MAX_BACKUPS=7

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Verificar que la base existe
if [ ! -f "$DB_PATH" ]; then
    echo "[ERROR] Database not found: $DB_PATH"
    exit 1
fi

# Copiar con timestamp
cp "$DB_PATH" "$BACKUP_DIR/quotes_$DATE.sqlite"
cp "$DB_PATH" "$BACKUP_DIR/quotes_latest.sqlite"

echo "[OK] Backup created: quotes_$DATE.sqlite"

# Limpiar backups antiguos (mantener solo MAX_BACKUPS)
cd "$BACKUP_DIR"
ls -t quotes_*.sqlite 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

echo "[OK] Cleanup complete. Backups retained: $(ls -1 quotes_*.sqlite 2>/dev/null | wc -l)"
