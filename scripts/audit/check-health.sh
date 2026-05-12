#!/bin/bash
# Verificar salud del cotizador
API_URL="${1:-http://localhost:3002}"
ENDPOINT="$API_URL/api/health/db"

echo "Checking cotizador health..."
response=$(curl -s -w "\n%{http_code}" "$ENDPOINT")
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "Status: OK"
    echo "Total quotes: $(echo $body | jq -r '.metrics.total_quotes')"
    echo "Sync rate: $(echo $body | jq -r '.metrics.sync_rate_percent')%"
    exit 0
else
    echo "Health check failed (HTTP $http_code)"
    exit 1
fi
