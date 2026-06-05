# Archive Report: mejora-cotizador-avanzado

**Archived**: 2026-06-04
**Source**: `openspec/changes/mejora-cotizador-avanzado/` → `openspec/changes/archive/2026-06-04-mejora-cotizador-avanzado/`
**Mode**: hybrid (Engram + OpenSpec)

## Summary

Mejora integral del cotizador avanzado: estabilización del flujo paso 2→3 con bugfix de module_id, separación de diagnóstico conversacional (2 preguntas) de la parrilla técnica (8 módulos), resumen con tabla de costos CLP por módulo, y migración de persistencia de leads de Notion a SQLite local.

### Entregas

| Delivery | Descripción | Estado |
|----------|-------------|--------|
| PR #1 | Bugfix + Backend (Notion removal + SQLite leads + .env cleanup) | ✅ Completado |
| PR #2 | Frontend (paso 2/3 separation + resumen CLP) | ✅ Completado |

## Tareas Completadas

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| 1.1 | `"analitica-basica"` → `"analytics"` en Avanzada.tsx (L124, L249) | ✅ |
| 2.1 | `backend/.env`: Remove NOTION_TOKEN, NOTION_DB_ID | ✅ |
| 2.2 | `backend/enviar.php`: Remove persistLeadToNotion(), syncQuoteToNotionBackground(), endpoints legacy | ✅ |
| 2.3 | `backend/enviar.php`: Add leads table, createLeadRecord($pdo, $lead) | ✅ |
| 2.4 | `backend/enviar.php`: Add POST /api/quotes/contact | ✅ |
| 2.5 | `backend/enviar.php`: Add `direct_cost` per item in buildTotals() | ⬜ Pendiente (backend scope reduction) |
| 2.6 | `backend/sync/notionSync.js`: DELETE entire file | ✅ |
| 2.7 | `backend/db/quotesRepository.js`: Add createLeadRecord, getLeadByEmail | ✅ |
| 3.1 | `types/index.ts`: RequerimientosData remove seo/analytics | ✅ |
| 3.2 | `Avanzada.tsx`: INITIAL_REQUERIMIENTOS solo diseno/redaccion, remove mappings | ✅ |
| 3.3 | `Avanzada.tsx`: useEffect sync requerimientos→modulos | ✅ |
| 3.4 | `Avanzada.tsx`: Pass `requerimientos` prop to AvanzadaModulos | ✅ |
| 3.5 | `AvanzadaRequerimientos.tsx`: Remove SEO+Analytics, rename to diagnóstico | ✅ |
| 3.6 | `AvanzadaModulos.tsx`: Accept requerimientos prop, full 8-module grid | ✅ |
| 4.1 | `AvanzadaResumen.tsx`: Module cost table with CLP | ✅ |
| 4.2 | `AvanzadaResumen.tsx`: Monthly services + pricing breakdown | ✅ |
| 5.1-5.4 | Testing (server.test.js + manual) | ⬜ Pendiente |

**Completadas**: 15/19 tareas | **Pendientes**: 4 (direct_cost backend + tests)

## Archivos Modificados

| Archivo | Acción | Líneas |
|---------|--------|--------|
| `frontend/.../Avanzada.tsx` | Modified | Bugfix + sync + cleanup |
| `frontend/.../AvanzadaRequerimientos.tsx` | Modified | Simplified to 2 questions |
| `frontend/.../AvanzadaModulos.tsx` | Modified | Full 8-module grid |
| `frontend/.../AvanzadaResumen.tsx` | Modified | CLP cost table |
| `frontend/src/types/index.ts` | Modified | Removed seo/analytics fields |
| `backend/enviar.php` | Modified | Notion removal + leads SQLite |
| `backend/sync/notionSync.js` | Eliminado | Entire file |
| `backend/db/quotesRepository.js` | Modified | Lead CRUD functions |
| `backend/.env` | Modified | Only API_KEY |
| `frontend/api/server.js` | Fix | Sin Notion + endpoint contact |

**Total**: ~297 líneas agregadas, ~991 eliminadas

## Artefactos Engram (Observation IDs)

| Artifact | Observation ID | Topic Key |
|----------|---------------|-----------|
| Exploration | #4545 | `sdd/mejora-cotizador-avanzado/explore` |
| Proposal | #4546 | `sdd/mejora-cotizador-avanzado/proposal` |
| Spec | #4548 | `sdd/mejora-cotizador-avanzado/spec` |
| Design | #4550 | `sdd/mejora-cotizador-avanzado/design` |
| Tasks | #4553 | `sdd/mejora-cotizador-avanzado/tasks` |
| Apply Progress (PR#1) | (implícito en tasks) | — |
| Apply Progress (PR#2) | #4564 | `sdd/mejora-cotizador-avanzado/apply-progress` |

## Lecciones Aprendidas

1. **Bug de module_id**: El error `"analitica-basica"` vs `"analytics"` era un typo en 2 líneas, pero rompía toda la sincronización entre paso 2 y 3 — el módulo Analytics nunca se propagaba porque el ID no existía en `MODULOS_PREDEFINIDOS`.
2. **Diseño conversacional vs técnico**: Separar el diagnóstico (2 preguntas conversacionales) de la parrilla técnica (8 módulos) redujo la fricción del usuario al eliminar la duplicación de preguntas.
3. **Costo CLP fallback**: El frontend calcula `unit_hours * 18000` como fallback cuando el backend no provee `direct_cost` — la tarea 2.5 quedó pendiente en el backend.
4. **Cold switch Notion→SQLite**: Como no había leads activos que migrar, el corte fue directo sin migración ni rollback complejo.
5. **Sync centralizado**: El sync paso 2→3 se implementó en `Avanzada.tsx` (componente padre) vía `useEffect`, no en `AvanzadaModulos` — mantiene una sola fuente de verdad.

## Recomendaciones para Cambios Futuros

1. **Completar tarea 2.5**: Implementar `direct_cost` por ítem en `buildTotals()` de PHP para que el backend compute los costos y el frontend no dependa del fallback.
2. **Testing automatizado**: Agregar tests para `POST /api/quotes/contact` (casos 201 y 400) y para el breakdown de costos.
3. **Portal de leads**: Una tabla admin para visualizar los leads almacenados en SQLite sería el siguiente feature lógico.
4. **Considerar SSR/SSG**: El cotizador actual es 100% client-side — si crece en complejidad, considerar mover la lógica de pricing al backend.
