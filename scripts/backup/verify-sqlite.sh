#!/bin/bash
# Verificar integridad de quotes.sqlite
# Uso: ./verify-sqlite.sh

DB_PATH="$HOME/myPortfolio/backend/data/quotes.sqlite"

if [ ! -f "$DB_PATH" ]; then
    echo "[ERROR] Database not found: $DB_PATH"
    exit 1
fi

echo "[INFO] Verifying database integrity..."
sqlite3 "$DB_PATH" "PRAGMA integrity_check;"
RESULT=$?

if [ $RESULT -eq 0 ]; then
    echo "[OK] Database integrity verified"
else
    echo "[ERROR] Database integrity check failed"
    exit 1
fi

# Estadísticas básicas
echo "[INFO] Database stats:"
sqlite3 "$DB_PATH" "SELECT 'Total quotes: ' || COUNT(*) FROM quotes;"
sqlite3 "$DB_PATH" "SELECT 'By sync_status: ' || sync_status || ' = ' || COUNT(*) FROM quotes GROUP BY sync_status;"
