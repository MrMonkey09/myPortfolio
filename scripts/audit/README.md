# Scripts de Auditoría y Sync

Este directorio contiene scripts para auditoría, diagnóstico y recuperación de sincronización con Notion.

## `resync-failed.sh` — Reintentar Sync Fallidos

Script bash para reintentar sincronización de cotizaciones que fallaron anteriormente.

### Uso

```bash
# Re-sincronizar hasta 10 cotizaciones fallidas (por defecto)
./scripts/audit/resync-failed.sh

# Re-sincronizar límite específico (ej: 5 quotes)
./scripts/audit/resync-failed.sh 5
```

### Comportamiento

1. Lee citas con `sync_status = 'failed'` desde `quotes.sqlite`
2. Actualiza el estado a `sync_status = 'pending'` con `sync_attempts = 0`
3. Limpia errores previos (`sync_last_error = NULL`)
4. Prepara la base de datos para que el sistema intente sincronización automática nuevamente

### Estructura de Datos Afectada

Al ejecutar, se modifica `quotes.sqlite`:

```sql
UPDATE quotes 
SET sync_status = 'pending', 
    sync_attempts = 0, 
    sync_last_error = NULL 
WHERE quote_id = ?;
```

### Variables de Entorno Requeridas

- `$HOME` — directorio del usuario en Linux/Mac (debe ser accesible desde donde se ejecuta el script)

## Diagnóstico y Muestreo Manual

Puedes inspeccionar el estado de sincronización manualmente:

```bash
# Ver cotizaciones fallidas
sqlite3 backend/data/quotes.sqlite "
  SELECT quote_id, trace_id, created_at, sync_status, 
         sync_attempts, LEFT(sync_last_error, 50) as error_preview
  FROM quotes 
  WHERE sync_status = 'failed'
  ORDER BY created_at DESC;
"

# Ver citas pendientes por sincronizar
sqlite3 backend/data/quotes.sqlite "
  SELECT quote_id, trace_id, status, sync_status
  FROM quotes 
  WHERE sync_attempts <= 2
  ORDER BY created_at DESC;
"
```

## Notas de Implementación

- Este script NO ejecuta la sincronización en sí, solo repara el estado en base de datos
- La sincronización real se realiza vía `syncWithRetry()` en `backend/sync/notionSync.js`
- Máximo 10 citas por ejecución para evitar cargas masivas no deseadas
