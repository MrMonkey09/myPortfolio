# Proposal: mejora-cotizador-avanzado

## Intent

El cotizador avanzado tiene un bug donde `module_id: "analytics"` no sincroniza desde paso 2 (referencia `"analitica-basica"`) — el flag Analytics nunca se propaga. SEO y Analytics aparecen duplicados en paso 2 y 3, el resumen no desglosa costos CLP, y la dependencia Notion añade complejidad innecesaria. Buscamos estabilizar, simplificar el flujo y transparentar el pricing.

## Scope

### In Scope
- Bugfix: `"analitica-basica"` → `"analytics"` en Avanzada.tsx (líneas 124, 249)
- Paso 2: solo diseño + redacción (diagnóstico conversacional). Quitar SEO y Analytics.
- Paso 3: parrilla completa de 8 módulos. Diseño/contenido vienen pre-seleccionados según paso 2.
- Resumen: tabla por módulo con costo unitario, cantidad, subtotal en CLP.
- Migrar leads de Notion → tabla SQLite `leads`. Remover `notionSync.js`. Limpiar PHP. `.env` solo `API_KEY`.

### Out of Scope
- UI general del cotizador (colores, layout)
- Portal de leads o tabla admin
- Migración de datos Notion existentes (legacy read-only)
- Landing page del cotizador

## Capabilities

_No existing specs directory (`openspec/specs/`). This change operates entirely within existing feature boundaries. No spec-level contract changes._

### New Capabilities
None

### Modified Capabilities
None — all changes are internal refactors, bugfixes, and data-source migration within the same contract.

## Approach

1. **Bugfix**: Reemplazar `"analitica-basica"` por `"analytics"` en Avanzada.tsx L124 y L249.
2. **Step 2**: En `AvanzadaRequerimientos.tsx`, eliminar fieldsets SEO y Analytics. Dejar solo "Identidad visual" (diseño) y "Contenido" (redacción). Renombrar sección a "Diagnóstico Rápido".
3. **Step 3**: En `AvanzadaModulos.tsx`, los checkboxes de diseño y contenido se pre-seleccionan según `formState.requerimientos` (no necesitan validación extra). La parrilla ya tiene los 8 módulos — solo sincronizar.
4. **Resumen**: En `buildTotals()` de PHP, incluir `direct_cost` por módulo en el breakdown. Frontend (`AvanzadaResumen.tsx`) muestra tabla con: módulo → costo unitario × cantidad → subtotal, más desglose mensual y parciales.
5. **Migration Notion**: Eliminar `backend/sync/notionSync.js`. En PHP: remover `persistLeadToNotion()`, `syncQuoteToNotionBackground()`, endpoint `/api/quotes/lead`, legacy `POST /`. Agregar tabla `leads` en SQLite. Simplificar endpoint posts a solo inserción SQLite. Agregar CRUD leads en `quotesRepository.js`. Limpiar `.env`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/.../Avanzada.tsx` | Modified | Fix module_id + sync logic |
| `frontend/.../AvanzadaRequerimientos.tsx` | Modified | Remove SEO/Analytics, rename |
| `frontend/.../AvanzadaModulos.tsx` | Modified | Pre-select from paso 2 |
| `frontend/.../AvanzadaResumen.tsx` | Modified | Cost table with CLP breakdown |
| `frontend/src/types/index.ts` | Modified | Add `direct_cost` per breakdown item |
| `backend/enviar.php` | Modified | Remove Notion, add leads table |
| `backend/sync/notionSync.js` | Removed | Delete entire file |
| `backend/db/quotesRepository.js` | Modified | Add leads CRUD |
| `backend/.env` | Modified | Remove NOTION_TOKEN, NOTION_DB_ID |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Leads loss during migration | Low | Keep Notion DB read-only as fallback |
| Frontend type mismatch on resumo | Low | Extend existing breakdown interface |
| Backward compatibility break | Low | All changes within existing endpoints |

## Rollback Plan

1. `git revert` de los commits del cambio.
2. Restaurar `notionSync.js` de historial git.
3. Restaurar `.env` original.
4. En PHP, mantener columna `sync_status` en quotes (no se toca).

## Dependencies

- PHP 7.4+ (sin cambios)
- SQLite3 (ya presente)
- Sin nuevas dependencias externas

## Success Criteria

- [ ] Marcar Analytics en paso 2 preselecciona Analytics en paso 3
- [ ] Paso 2 solo tiene diseño y redacción (2 preguntas)
- [ ] Paso 3 muestra diseño/contenido pre-seleccionados según paso 2
- [ ] Resumen desglosa costo unitario, cantidad y subtotal CLP por módulo
- [ ] Lead se guarda en SQLite, no en Notion
- [ ] `.env` contiene solo `API_KEY=...`
