#!/bin/bash
# Reintentar sync de cotizaciones fallidas
# Uso: ./resync-failed.sh [limit]
#
# Ejemplo: './resync-failed.sh 10' -> re-sincronizar hasta 10 cotizaciones fallidas

LIMIT="${1:-10}"

echo "[INFO] Re-syncing $LIMIT failed quotes..."

# Obtener quotes con sync_status=failed
failed_quotes=$(sqlite3 "$HOME/myPortfolio/backend/data/quotes.sqlite" "
  SELECT quote_id, trace_id FROM quotes 
  WHERE sync_status = 'failed' 
  LIMIT $LIMIT;
")

echo "$failed_quotes" | while IFS='|' read -r quote_id trace_id; do
  if [ -n "$quote_id" ]; then
    echo "[RETRY] Attempting to re-sync $quote_id..."
    # Actualizar estado a 'pending' para retry automático
    sqlite3 "$HOME/myPortfolio/backend/data/quotes.sqlite" "
      UPDATE quotes 
      SET sync_status = 'pending', sync_attempts = 0, sync_last_error = NULL 
      WHERE quote_id = '$quote_id';
    "
    echo "[OK] Marked $quote_id for retry"
  fi
done

echo "[INFO] Re-sync initiated for $LIMIT quotes"
