# Runbook — Cotizador Web en Producción

**Versión:** 1.0  
**Fecha:** 2026-05-12  
**Entorno:** cPanel (PHP-first) + SQLite local + Notion sync  
**Sprint:** 5 (post-fix total_monthly)

---

## 1. Arquitectura producción

```
Frontend (SPA React)
    ↓
API Gateway (cPanel/Apache)
    ├→ POST /api/quotes/simulate → backend/enviar.php (PDO SQLite)
    └→ POST /api/quotes/lead     → backend/enviar.php (Notion sync async)
        
Data:
  SQLite: ~/backend/data/quotes.sqlite (source of truth)
  Notion: API sync (fire-and-forget)
  Backups: ~/backups/quotes.sqlite.{timestamp} (daily cron)
```

**Nota:** En producción se usa **PHP únicamente** (mejor compatibilidad cPanel). Express (Node) solo en desarrollo local.

---

## 2. Comandos diarios

### 2.1 Verificar salud del sistema

```bash
# 1. Health check API PHP
curl -s https://tudominio.com/backend/enviar.php | head -1
# Esperado: {"error": null, "data": {...}} o 200 OK

# 2. Verificar SQLite connectivity (via test script)
php -r "require 'backend/enviar.php'; echo 'OK';" 2>&1 || echo "FAIL"

# 3. Revisar logs de error (cPanel)
tail -n 50 ~/logs/error_log | grep -i cotizador

# 4. Métricas rápidas (consulta SQLite)
sqlite3 ~/backend/data/quotes.sqlite "SELECT COUNT(*) as total, sync_status, COUNT(*) FROM quotes GROUP BY sync_status;"
```

### 2.2 Backup verification

```bash
# Listar backups recientes
ls -lht ~/backups/quotes.sqlite.* | head -5

# Verificar integridad del último backup
latest=$(ls -t ~/backups/quotes.sqlite.* | head -1)
sqlite3 "$latest" "PRAGMA integrity_check;"
# Debe retornar: ok
```

### 2.3 Sync status monitor

```sql
-- En sqlite3 CLI o Adminer
SELECT 
  sync_status,
  COUNT(*) as count,
  ROUND(COUNT(*)*100.0/(SELECT COUNT(*) FROM quotes), 2) as pct
FROM quotes 
WHERE created_at > datetime('now', '-7 days')
GROUP BY sync_status;
```

Esperado: `synced > 90%`, `failed < 5%`, `pending < 5%`.

---

## 3. Comandos semanales

### 3.1 Reporte de actividad

```bash
# Ejecutar script stats
bash ~/scripts/audit/stats-report.sh > ~/logs/weekly-cotizador-$(date +%Y%W).log

# Resumen en pantalla
sqlite3 ~/backend/data/quotes.sqlite "
  SELECT 
    strftime('%Y-%W', created_at) as week,
    COUNT(*) as quotes,
    SUM(total_project) as revenue_estimate,
    COUNT(DISTINCT trace_id) as unique_visitors
  FROM quotes
  WHERE created_at > datetime('now', '-30 days')
  GROUP BY week
  ORDER BY week DESC;
"
```

### 3.2 Limpieza stale/archivado (automático ya, pero verificar)

```bash
# Ver cotizaciones >6 meses sin contacto (stale)
sqlite3 ~/backend/data/quotes.sqlite "
  SELECT quote_id, origin, created_at, sync_status
  FROM quotes
  WHERE created_at < datetime('now', '-6 months')
    AND sync_status = 'pending';
"

# Ejecutar cleanup manual si falla cron
bash ~/scripts/audit/cleanup-quotes.sh --dry-run
bash ~/scripts/audit/cleanup-quotes.sh --execute
```

### 3.3 Resync de fallidos

```bash
# Listar fallidos recientes
sqlite3 ~/backend/data/quotes.sqlite "
  SELECT quote_id, trace_id, sync_last_error, sync_attempts
  FROM quotes
  WHERE sync_status = 'failed'
    AND created_at > datetime('now', '-1 day')
  ORDER BY sync_attempts DESC;
"

# Reintentar (script automatizado)
bash ~/scripts/audit/resync-failed.sh --limit 10
```

---

## 4. Alertas y monitoreo

### 4.1 Umbrales de alerta

| Métrica | Umbral | Acción |
|---------|--------|--------|
| Tasa fallos sync (`failed/total`) | >5% en 1h | Revisar logs Notion API, reintentar |
| Quotes pendientes > 100 | >100 en cola | Verificar queue, procesar backlog |
| Errores 500 en access_log | >10/h | Investigar trace_id específicos |
| SQLite file size > 100MB | >100MB | Considerar archive old data |
| Backup fallido (archivo ausente) | último backup > 24h | Ejecutar backup manual |

### 4.2 Comando de diagnóstico rápido

```bash
#!/bin/bash
# health-check-cotizador.sh

echo "=== Cotizador Health Check ==="
echo ""

# 1. API endpoint
echo -n "API HTTP: "
if curl -s -o /dev/null -w "%{http_code}" https://tudominio.com/backend/enviar.php | grep -q "^200$"; then
  echo "✅ OK"
else
  echo "❌ FAIL"
fi

# 2. SQLite accesible
echo -n "SQLite file: "
if [ -r ~/backend/data/quotes.sqlite ]; then
  echo "✅ readable"
else
  echo "❌ not readable"
fi

# 3. Backup reciente
echo -n "Backup reciente: "
if ls ~/backups/quotes.sqlite.* 1>/dev/null 2>&1; then
  latest=$(ls -t ~/backups/quotes.sqlite.* | head -1)
  age_days=$(( ( $(date +%s) - $(stat -c %Y "$latest") ) / 86400 ))
  echo "✅ existe (${age_days}d)"
else
  echo "❌ no encontrado"
fi

# 4. Sync status
echo -n "Pending sync: "
pending=$(sqlite3 ~/backend/data/quotes.sqlite "SELECT COUNT(*) FROM quotes WHERE sync_status='pending';")
echo "$pending pendientes"

# 5. Disk usage
echo "Disk usage:"
df -h ~/backend/data/

echo ""
echo "=== End health check ==="
```

---

## 5. Procedimientos de recuperación

### 5.1 Restaurar backup SQLite

```bash
# 1. Detener API (si se puede)
# cPanel: desactivar cron temporalmente

# 2. Mover DB actual (backup de emergencia)
mv ~/backend/data/quotes.sqlite ~/backend/data/quotes.sqlite.bak-$(date +%s)

# 3. Copiar backup seleccionado a location activa
cp ~/backups/quotes.sqlite.2026-05-10 ~/backend/data/quotes.sqlite

# 4. Asegurar permisos
chmod 755 ~/backend/data/quotes.sqlite

# 5. Reiniciar API (si Express, matar proceso y arrancar)
# pkill -f "node.*server.js" ; cd ~/public_html/api && node server.js &

# 6. Verificar integridad
sqlite3 ~/backend/data/quotes.sqlite "PRAGMA integrity_check;"

# 7. Reactivar cron (si se deshabilitó)
```

### 5.2 Resetear sync status (cuando Notion falla masivamente)

```sql
-- Marcar todos los pending como failed para resync manual
UPDATE quotes 
SET sync_status = 'failed', sync_last_error = 'Manual reset after outage'
WHERE sync_status = 'pending' 
  AND created_at < datetime('now', '-1 hour');

-- Luego ejecutar resync
bash ~/scripts/audit/resync-failed.sh --all
```

### 5.3 Rollback de código

```bash
# Si deploy rompe funcionalidad:
cd ~/public_html
git log --oneline -5  # identificar commit bueno conocido
git checkout <commit-hash>
# O si no usas git en prod: restaurar from zip backup anterior
```

---

## 6. Contactos de emergencia

| Rol | Responsable | Contacto |
|-----|-------------|----------|
| Dueño de producto | Mr Monkey | github @ repository |
| Soport técnico cPanel | Hosting provider | support @ hosting.com |
| API Notion | Notion HQ | developers @ notion.so |

**Plan de escalación:**
1. Error → revisar runbook sección 3
2. No resuelto → abrir issue en repo GitHub (`myPortfolio`) con etiqueta `cotizador-prod`
3. Crítico (API caída >30 min) → contactar hosting + revisar logs `/home/*/logs/`

---

## 7. Checklist pre-deploy (cada release)

Antes de mergear a main/production:

- [ ] Tests E2E locales pasan (`scripts/test-e2e.mjs`)
- [ ] Backend PHP parity verificada (comparar Express vs PHP output)
- [ ] TypeScript compila sin errores (`npm run build` frontend)
- [ ] Migraciones SQLite aplicadas (`backend/db/index.js` → create table)
- [ ] Variables entorno `.env` documentadas en runbook
- [ ] Backups configurados y verificados (`backup-sqlite.sh --dry-run`)
- [ ] Health endpoint accesible (`/api/health` o `/backend/enviar.php`)
- [ ] Notion API token válido y DB ID correcto (test manual en staging si hay)
- [ ] Rollback plan documentado (qué archivos revertir)
- [ ] Sprint document actualizado (`docs/sprints/sprint-X.md`)

---

## 8. Métricas de negocio a monitorear

| Métrica | Fuente | Frecuencia |
|---------|--------|------------|
| Cotizaciones generadas/día | SQLite `quotes` | Diario |
| Tasa conversión lead (quote → lead) | Notion DB | Semanal |
| Valor total cotizado (sum total_project) | SQLite | Semanal |
| Servicios mensuales más seleccionados | SQLite `monthly_services` en input_json | Mensual |
| Tiempo promedio en paso avanzado | GA4 event `advanced_step_completed` | Semanal |
| trace_id uniqueness rate | SQLite `quotes` | Diario (debe ser 100%) |

**Consulta métricas ejemplo:**

```sql
-- Top 5 módulos más seleccionados
SELECT 
  json_extract(line_items, '$[0].module_name') as modulo,
  COUNT(*) as veces_seleccionado
FROM quotes
WHERE json_array_length(line_items) > 0
GROUP BY modulo
ORDER BY veces_seleccionado DESC
LIMIT 5;
```

---

## 9. Mantenimiento programado

| Actividad | Frecuencia | Comando |
|-----------|------------|---------|
| Verificar backups | Diario (mañana) | `ls -lht ~/backups/` |
| Integridad SQLite | Semanal (Lunes) | `sqlite3 quotes.sqlite "PRAGMA integrity_check;"` |
| Limpieza stale >6m | Automático (cron) | `cleanup-quotes.sh` |
| Archive old quotes >12m | Automático (cron) | `cleanup-quotes.sh` |
| Reporte métricas | Semanal (Viernes) | `stats-report.sh > weekly.log` |
| Resync fallidos | Diario (06:00) | `resync-failed.sh` |

---

## 10. Apéndices

### A. Glosario

- **sync_status:** `pending` → `synced` | `retrying` | `failed`
- **trace_id:** UUID único por simulación, propagado a lead y logs
- **quote_id:** ID local SQLite (qt_ UUID)
- **lead_id:** ID Notion (ld_ UUID)
- **QuoteRecord:** JSON persistido en SQLite (input_json, totals_json, meta_json)

### B. Cron jobs recomendados (cPanel → Cron Jobs UI)

```cron
# Backup diario SQLite — 00:00 UTC
0 0 * * * /home/usuario/scripts/backup/backup-sqlite.sh >> /home/usuario/logs/backup.log 2>&1

# Health check cada 15 min
*/15 * * * * /home/usuario/scripts/audit/check-health.sh >> /home/usuario/logs/health.log 2>&1

# Resync fallidos cada 6h
0 */6 * * * /home/usuario/scripts/audit/resync-failed.sh --limit 20 >> /home/usuario/logs/resync.log 2>&1
```

### C. Contacto soporte hosting

Si cPanel limita procesos Node:
- Usar PHP endpoint exclusivamente
- Frontend debe configurar `API_BASE_URL=/backend/enviar.php` (relativo)

---

**Fin runbook.** Guardar como `docs/runbook-cotizador-produccion.md` y mantener actualizado con incidentes reales.
