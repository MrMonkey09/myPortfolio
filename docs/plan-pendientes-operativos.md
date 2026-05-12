# Plan Operativo — Pendientes Post-Sprint 5

**Fecha:** 2026-05-12  
**Estado:** Pendientes críticos para production readiness  
**Sprints completados:** 0–5 (todos cerrados)

---

## Visión general

Los sprints técnicos (0–5) han completado el desarrollo del cotizador. Restan **tareas operativas** para poner el sistema en producción en cPanel y garantizar su operación madura.

---

## Fase 1 — Validación E2E local (pre-deploy)

**Objetivo:** Ejercitar flujos completos rápida y avanzada en entorno local, confirmando que `total_monthly` se calcula y propaga correctamente.

### Checklist Fase 1

- [ ] Iniciar backend: `cd frontend && node api/server.js` (puerto 3002)
- [ ] Verificar health: `curl http://localhost:3002/health` → `{ "ok": true, "service": "quotes-api" }`
- [ ] **Test 1 — Cotización rápida**:
  - Payload: `POST /api/quotes/simulate` con `origin=quick`, `quick_answers: { pages_estimate: 5, needs_ecommerce: "yes", urgency: "medium" }`
  - Validar respuesta incluye `totals.total_monthly` (debería ser `0` porque quick no usa servicios mensuales)
  - Validar `estimated_min/max`, `confidence_level: "medium"`
- [ ] **Test 2 — Cotización avanzada sin servicios mensuales**:
  - Payload: `origin=advanced`, `line_items[]` con al menos 1 módulo `include="yes"`, `monthly_services: []`
  - Validar `total_monthly: 0` (array vacío)
- [ ] **Test 3 — Cotización avanzada con servicios mensuales**:
  - Payload igual a Test 2 pero `monthly_services: [{service_id: "mantenimiento-esencial", include: "yes", monthly_value: 85000}, …]`
  - Validar `total_monthly = 85000` (o suma de `include="yes"`)
  - Validar `total_project` NO incluye `total_monthly` (son independientes: proyecto único vs recurrentes)
- [ ] **Test 4 — Handoff avanzada → contacto**:
  - Usar `quote_id` de Test 3, enviar `POST /api/quotes/lead` con `quote_ref.total_monthly` igual al calculado
  - Validar respuesta `lead_id`, `status: "created"`
  - Verificar logs: "Notion sync" (aunque Notion no configurado local, debe intentar sin fallar crítico)
- [ ] Capturar pantallas/console logs de cada test como evidencia

**Comando rápido Test 3 (curl):**

```bash
curl -X POST http://localhost:3002/api/quotes/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "context": {"schema_version":"1.0.0","origin":"advanced","project_type":"website","project_state":"new","country":"CL","currency":"CLP"},
    "input": {
      "requirements_checklist": {"diseno":true,"desarrollo":true},
      "line_items": [{"module_id":"diseno-ui-ux","include":"yes","quantity":1,"complexity":"medium","base_cost":65000}],
      "monthly_services": [{"service_id":"mantenimiento-esencial","include":"yes","monthly_value":85000,"hours_included":2,"sla":"48h"}],
      "pricing": {"contingency_pct":0.12,"margin_pct":0.25,"discount_pct":0,"vat_pct":0.19,"apply_vat":true}
    }
  }' | jq '.totals'
```

**Éxito:** `total_monthly` aparece con valor `85000` (redondeado).

---

## Fase 2 — Preparación deploy cPanel

**Objetivo:** Empaquetar y subir código al servidor cPanel, configurar entorno.

### 2.1 Archivos requeridos en producción

| Path local | Path cPanel | Notas |
|------------|-------------|-------|
| `frontend/api/server.js` | `~/public_html/api/` | Backend Express |
| `backend/enviar.php` | `~/backend/` (o ruta accesible) | Backend PHP paralelo |
| `backend/data/quotes.sqlite` | `~/backend/data/` | Directorio `data` debe ser writable (755) |
| `backend/db/`, `backend/sync/` | `~/backend/` | Módulos Node.js (si se usa Express desde backend) |
| `frontend/dist/` o build output | `~/public_html/` | Frontend SPA (si Vite build) |
| `.env` (NO versionado) | `~/backend/.env` o `~/public_html/.env` | Configurar `NOTION_TOKEN`, `NOTION_DB_ID`, `PORT` |
| `scripts/backup/`, `scripts/audit/` | `~/scripts/` | Backupsyanización |

### 2.2 Variables de entorno cPanel

Crear `~/.env` o `~/public_html/.env`:

```env
PORT=3002
NOTION_TOKEN=secret_...
NOTION_DB_ID=...
API_KEY=optional_for_internal
```

**Nota:** cPanel puede no soportar `better-sqlite3` (nativo C++). Ya tenemos fallback a `sql.js` en `backend/db/index.js`. Verificar que `node_modules` incluya `sql.js`.

### 2.3 Pasos deploy

1. **Build frontend** (si aplica):
   ```bash
   cd frontend
   npm run build  # genera dist/
   ```

2. **Copiar archivos via FTP/SFTP/Git**:
   - Opción A: Git pull directo en cPanel (si repo clonado)
   - Opción B: SFTP manual (FileZilla, rsync)
   - Opción C: Zip upload + extract

3. **Instalar dependencias backend en cPanel**:
   ```bash
   cd ~/public_html/api  # o donde esté server.js
   npm install --omit=dev  # producción
   ```

   **Importante:** Asegurar que `sql.js` se instale (no `better-sqlite3` si no hay soporte nativo).

4. **Crear directorios con permisos**:
   ```bash
   mkdir -p ~/backend/data
   chmod 755 ~/backend/data
   mkdir -p ~/scripts/backup ~/scripts/audit
   chmod +x ~/scripts/*/*.sh
   ```

5. **Configurar .env**:
   ```bash
   cat > ~/backend/.env << EOF
   NOTION_TOKEN=tu_token
   NOTION_DB_ID=tu_db_id
   PORT=3002
   EOF
   ```

6. **Probar arranque**:
   ```bash
   cd ~/public_html/api
   node server.js
   # Debería mostrar: "Quotes API escuchando en http://localhost:3002"
   ```

7. **Configurar proceso persistente** (cPanel no mantiene procesos SSH):
   - Opción A: **Cron job** que ejecute `node server.js` cada minuto y mantenga PID (no ideal)
   - Opción B: **PM2** si disponible en cPanel (algunos ofrecen Node.js app)
   - Opción C: **Convertir a PHP puro** — el backend PHP (`enviar.php`) ya está listo; podemos usarlo **solo en producción** y desactivar Express en cPanel:
     - En cPanel, apuntar dominios/subdominios a `backend/enviar.php` como endpoint
     - Frontend debe usar URL relativa o configurable: `/api/quotes/simulate` → redirigir a PHP

   **Recomendación Fase 2:** Usar **PHP puro en producción** (ya tenemos paridad completa). Para simplificar:
   - En entorno local: Express + PHP (paralelos)
   - En cPanel: **solo PHP** (más confiable, sin dependencias Node)
   - Frontend: detectar entorno o configurar `API_BASE_URL` para apuntar a PHP en prod

   **Alternativa:** Si insistes en Express en cPanel, verificar que `sql.js` funcione (WASM necesita permisos de memoria).

### 2.4 Matriz de decisión deployment

| Escenario | Backend prod | Ventaja | Riesro |
|-----------|--------------|---------|--------|
| **A — PHP only** | `backend/enviar.php` (con PDO SQLite) | Sin dependencias Node, compatible 100% cPanel | Requiere ajuste frontend URL |
| **B — Express only** | `frontend/api/server.js` (con sql.js fallback) | Un solo código, moderno | Dependencia WASM, memory limits |
| **C — Dual** | Express dev, PHP prod | Máxima redundancia | Complejidad operativa |

**Recomendación:** Opción A (PHP only) para MVP comercial. Sprint 6 puede migrar a Express cuando el hosting lo permita.

---

## Fase 3 — Configurar cron backups en cPanel

**Objetivo:** Automatizar backup diario de `quotes.sqlite` a `~/backups/` y cloud (opcional).

### 3.1 Scripts existentes

- `scripts/backup/backup-sqlite.sh` — backup con timestamp + cleanup 7 días
- `scripts/backup/restore-sqlite.sh` — restauración desde backup
- `scripts/backup/verify-sqlite.sh` — validación integridad
- `scripts/backup/cron-setup.sh` — instalador crontab

### 3.2 Pasos cPanel

1. **Subir scripts** a `~/scripts/backup/` (chmod +x)
2. **Ejecutar instalador**:
   ```bash
   cd ~/scripts/backup
   bash cron-setup.sh
   ```
   Esto agrega a crontab del usuario (cPanel permite crontab vía SSH).

3. **Crontab resultante** (ejemplo):
   ```cron
   # Backup cotizador SQLite — diario 00:00 UTC
   0 0 * * * /home/usuario/scripts/backup/backup-sqlite.sh >> /home/usuario/logs/backup-cotizador.log 2>&1
   ```

4. **Verificar**:
   ```bash
   crontab -l
   ls -la ~/backups/  # debería tener backup_*.sqlite tras medianoche
   ```

5. **Cloud sync (opcional)** — usar `rclone` si cPanel lo soporta:
   ```bash
   # Configurar rclone para Google Drive
   rclone sync ~/backups/ gdrive:cotizador-backups --progress
   ```
   Agregar a cron posterior (ej. weekly).

---

## Fase 4 — Verificación final post-deploy

**Objetivo:** Confirmar que todo funciona en producción.

### 4.1 Health checks

```bash
# Backend PHP (si se usa)
curl https://tudominio.com/backend/enviar.php  # GET devrait devolver 200

# O si hay endpoint API
curl https://tudominio.com/api/quotes/simulate -X OPTIONS  # CORS preflight
```

### 4.2 Smoke tests

1. **Cotización rápida** desde frontend live → verificar redirección a `/servicios` y resultado
2. **Cotización avanzada** → completar paso módulos + ajustes → verificar `total_monthly` en resumen
3. **Contacto** → completar formulario → verificar lead creado en Notion (si configurado)

### 4.3 Logs

- **cPanel:** `~/logs/error_log` y `~/logs/access_log`
- **Node (si Express):** `~/public_html/api/logs/` (crear directorio)
- **PHP:** errores en `/home/usuario/php_errorlog` (configurar en cPanel)

Buscar:
- `SQLite persistence error` — debe ser advertencia, no crash
- `Notion sync error` — reintentos esperados
- `UNEXPECTED_ERROR` — debe estar monitorizado

### 4.4 Métricas iniciales

```sql
-- En SQLite (vía CLI o adminer)
SELECT COUNT(*) as total_quotes, 
       COUNT(CASE WHEN sync_status='synced' THEN 1 END) as synced,
       COUNT(CASE WHEN sync_status='failed' THEN 1 END) as failed
FROM quotes;
```

Si `failed > 0`, revisar `sync_last_error` y reintentar con `scripts/audit/resync-failed.sh`.

---

## Fase 5 — Documentación cierre

**Objetivo:** Registrar Hallazgos operativos y cerrar ciclo.

### 5.1 Actualizar Decision Log

- Agregar fecha de implementación producción en §7 (fecha real deploy)
- Registrar incidentes (si hubo) y resoluciones

### 5.2 Crear runbook operativo

Nuevo archivo: `docs/runbook-cotizador-produccion.md` con:

- Comandos diarios: `backup-sqlite.sh --verify`
- Comandos semanales: `stats-report.sh`, `cleanup-quotes.sh`
- Alertas: qué hacer si `sync_status=failed` > 10%
- Rollback: cómo revertir a versión anterior (git + restore.sqlite)
- Contactos: soporte técnico, dueño producto

### 5.3 Cierre Sprint 5 (actualizar)

Agregar en `docs/sprints/sprint-5.md`:

- Fecha deploy real
- Incidencias encontradas
- Métricas post-deploy (volumen cotizaciones primera semana)
- Próximos pasos (Sprint 6 si hay)

---

## Cronograma estimado

| Fase | Tiempo | Dependencias |
|------|--------|--------------|
| Fase 1 — E2E local | 1 hora | Sprint 5 código ya mergeado |
| Fase 2 — Deploy cPanel | 2–3 horas | Acceso SSH/FTP cPanel, dominio configurado |
| Fase 3 — Cron backups | 30 min | Scripts subidos, permisos |
| Fase 4 — Verificación | 1 hora | Deploy exitoso |
| Fase 5 — Documentación | 30 min | Verificación completada |

**Total:** ~5–6 horas de trabajo operativo.

---

## Responsables

- **Desarrollo Técnico:** @Equipo A&V Devs / Mr Monkey (implementación Sprint 5)
- **Deploy y Operaciones:** @Equipo A&V Devs (cPanel, cron, validación)
- **Validación Comercial:** @Equipo Comercial (probar flujo en vivo, leads en Notion)

---

## Riesgos operativos identificados

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| cPanel no permite Node/Express | Alta | Alto | Tener PHP listo como fallback; ajustar frontend base_url |
| Permisos SQLite denegados | Media | Alto | `chmod 755 backend/data/` ; usar WAL mode |
| Notion API rate limit en producción | Media | Medio | Reintentos con backoff ya implementados |
| Backup cron no ejecuta (cPanel limitado) | Media | Alto | Probar manualmente primero; usar web cron si SSH restringido |
| Despliegue rompe flujo rápido existente | Baja | Alto | Mantener endpoint legacy `/contacto` intacto; A/B test gradual |

---

## Señales de éxito (KPIs)

- ✅ 100% cotizaciones generadas localmente exitosas
- ✅ 100% leads exitosos en Notion (si configurado)
- ✅ Backup diario ejecutándose sin errores 3 días seguidos
- ✅ Tiempo respuesta API < 500ms (p95) en producción
- ✅ Cero errores críticos en logs primeras 48h

---

## Plan de contingencia

**Si falla Express en cPanel:**
1. Desactivar Express (detener proceso)
2. Asegurar que `enviar.php` esté en ruta accesible
3. Cambiar frontend `API_BASE_URL` a URL absoluta de `enviar.php`
4. Probar simulate/lead nuevamente

**Si SQLite no escribe:**
1. Verificar permisos: `ls -la backend/data/`
2. Si `Permission denied`: `chmod 755 backend/data/`
3. Si `No such file`: `touch quotes.sqlite` + `chmod 755`

**Si Notion falla persistentemente:**
1. Verificar credenciales (`.env` NOTION_TOKEN, NOTION_DB_ID)
2. VerificarDB ID correcto y token con permisos write
3. Update код para despachar Notion error como `conflict_error` sin bloquear respuesta (ya implementado)

---

## Estado de ejecución (2026-05-12)

| Fase | Estado | Comentario |
|------|--------|------------|
| **Fase 1 — E2E local** | ✅ Script listo | `scripts/test-e2e.mjs` creado y verificado lógicamente; bloqueado en Windows por better-sqlite3 — se ejecutará en WSL/cPanel |
| **Fase 2 — Deploy cPanel** | ✅ Scripts listos | `deploy-cpanel.sh` y `deploy-cpanel-complete.sh` creados; verificación pre-deploy (`verify-deploy-readiness.sh`) OK |
| **Fase 3 — Cron backups** | ✅ Scripts + guía | Scripts existentes; instrucciones en runbook |
| **Fase 4 — Verificación** | ✅ Checklist | Health checks, smoke tests documentados |
| **Fase 5 — Documentación** | ✅ Completo | Runbook, manifest, readiness report generados |

---

## Entregables Fase 2–5 (generados 2026-05-12)

- ✅ `scripts/deploy-cpanel-complete.sh` — Deploy todo-en-uno
- ✅ `scripts/verify-deploy-readiness.sh` — Verificación automática pre-deploy
- ✅ `docs/deploy-readiness-report.md` — Reporte de readiness
- ✅ `docs/runbook-cotizador-produccion.md` — Operaciones producción (actualizado)
- ✅ `docs/deployment-manifest.md` — Manifest archivos (existente)

**Listo para ejecutar.** ¿Iniciamos con **Fase 1 — Validación E2E local** ahora mismo?
