# 🎯 Sprint 5 — Commit Plan (recomendado)

**Objetivo:** Consolidar cambios Sprint 5 en commits atómicos siguiendo Conventional Commits.

---

## Orden de commits (recomendado)

### 1. types: extender QuoteSimulateResponse con total_monthly

```bash
git add frontend/src/types/index.ts
git commit -m "feat(cotizador): add total_monthly to QuoteSimulateResponse.totals and monthly_services to request input"
```

**Motivo:** Cambio base de contrato RFC-002. Asegura que TypeScript refleje entidad MonthlyServiceSelection.

---

### 2. frontend: incluir monthly_services en simulate payload avanzado

```bash
git add frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/Avanzada.tsx
git commit -m "feat(cotizador): send monthly_services in advanced simulate payload"
```

**Motivo:** Frontend ya tenía serviciosMensuales en estado, pero no los enviaba al backend.

---

### 3. backend(express): calcular total_monthly en buildTotals

```bash
git add frontend/api/server.js
git commit -m "feat(cotizador): calculate total_monthly from monthly_services in buildTotals"
```

**Motivo:** Corrige gap crítico: total_monthly ahora es Σ(monthly_value include=yes), no 0 hardcodeado.

---

### 4. backend(php): paridad total_monthly en enviar.php

```bash
git add backend/enviar.php
git commit -m "feat(cotizador): parity PHP buildTotals with monthly_services calculation"
```

**Motivo:** Mantiene consistencia Express ↔ PHP para cPanel deployment.

---

### 5. frontend: eliminar fallback total_project/12 en resumen avanzado

```bash
git add frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzadaResumen.tsx
git commit -m "fix(cotizador): use actual total_monthly instead of fallback in advanced summary"
```

**Motivo:** Muestra valor real calculado, no aproximación.

---

### 6. docs: sprint 5 completo + decision log cierre

```bash
git add docs/sprints/sprint-5.md docs/decision-log-cotizador.md
git commit -m "docs(sprint-5): fix total_monthly gap RFC-002 compliance and close Decision Log §7"
```

**Motivo:** Documenta cambios y gobernanza.

---

### 7. ops: agregar scripts E2E, deployment, runbook

```bash
git add scripts/test-e2e.mjs docs/plan-pendientes-operativos.md docs/deployment-manifest.md docs/runbook-cotizador-produccion.md
git commit -m "chore(ops): add E2E test script, deployment guide, and production runbook"
```

**Motivo:** Infraestructura operativa para validación y despliegue.

---

## Commit combinado (alternativa single-PR)

Si prefieres un solo commit ( Sprint 5 es pequeño <400 líneas):

```bash
git add -A
git commit -m "fix(cotizador): total_monthly calculation gap RFC-002 compliance

- Add total_monthly to QuoteSimulateResponse.totals
- Frontend sends monthly_services in advanced simulate payload
- Backend Express buildTotals calculates Σ(monthly_value | include=yes)
- Backend PHP parity: identical buildTotals calculation
- AvanzadaResumen uses real total_monthly, removes fallback
- Backward compatible: missing monthly_services → total_monthly=0
- Adds E2E test script, deployment manifest, production runbook
- Closes Decision Log §7.1-7.3 (retention, backup, Notion detail)
- Sprint 5 completed — project now 100% RFC-002 §4.5 compliant"

git tag -a sprint-5-complete -m "Sprint 5: total_monthly fix + operational readiness"
```

---

## Verificación pre-push

```bash
# 1. Typecheck
npm run typecheck  # o tsc --noEmit

# 2. Lint (si tienes)
npm run lint

# 3. E2E local test (requiere server corriendo)
node scripts/test-e2e.mjs

# 4. Git log sanity
git log --oneline -7
# Deberías ver los 7 commits en orden temático
```

---

## Push策略

```bash
# Si usas feature branch
git push origin feature/sprint-5-total-monthly-fix

# Si main directo (recomendado para hotfixes)
git push origin main
```

---

## Post-merge: checklist production

- [ ] Ejecutar E2E en ambiente de staging (si existe)
- [ ] Deploy a cPanel siguiendo `docs/deployment-manifest.md`
- [ ] Configurar cron backups (`scripts/backup/cron-setup.sh`)
- [ ] Ejecutar `scripts/audit/check-health.sh` post-deploy
- [ ] Generar primer backup manual: `scripts/backup/backup-sqlite.sh`
- [ ] Verificar lead en Notion (test real)
- [ ] Cerrar Sprint 5 en documento con fechas reales de deploy

---

**Listo.** Los archivos ya están modificados; solo falta commitear y push.
