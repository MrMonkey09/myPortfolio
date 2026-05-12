## Goal
Work-Unit B: Componentes de Pasos para Cotización Avanzada (Sprint 1 P2) — Sprint 1 Phase B complete

## Instructions
- Auto-chain delivery, stacked-to-main strategy  
- No build after changes
- Components as functions with readonly props
- Use relative imports (`@types`, `@utilitie` not configured for frontend paths)

## Discoveries
- Types already defined in `frontend/src/types/index.ts` (ContextoData, RequerimientosData, ModuloLinea, AjustesComerciales, QuoteSimulateResponse)
- Configuracion.ts has `MODULOS_PREDEFINIDOS` and `SERVICIOS_MENSUALES_PREDEFINIDOS` lists
- Estilos.css pattern uses `quick-quote__field` class for form styling

## Accomplished
- ✅ B.1: AvanzadaContexto.tsx (Paso 1: tipo proyecto, estado, país, prioridad) — radio buttons con iconos emoji, validación obligatoria por campo
- ✅ B.2: AvanzadaRequerimientos.tsx (Paso 2: checklist de áreas con diseño/ desarrollo / contenido / SEO / analytics) — mínimo 1 área required con contador visual
- ✅ B.3: AvanzadaModulos.tsx (Paso 3: tabla modules con include (yes/optional/no), quantity, complexity (low/medium/high), calculo costo base automático) — validacion: al menos 1 modulo incluido con quantity>0 y complejidad seteada
- ✅ B.4: AvanzaAjustes.tsx (Paso 4: radio buttons para urgencia (Baja 0.9x / Media 1.0x / Alta 1.25x), sliders para contingencia (0-25%), margen (15-40%), descuento (0-20%), toggle IVA) — preview de factores aplicados
- ✅ B.5: AvanzaResumen.tsx (Paso 5: desglose completo del resultado `simulateQuickQuote` con estimated_min-max, total proyecto/mensual, nivel confianza) — CTA "Contactar ahora" y "Recalcular", servicios mensuales renderizados
- ✅ B.6: Estilos.css complementario para navegación steppers `.avanza__steps`, estados de pasos (locked/active/completed/warning), formularios multi-paso

## Next Steps
- Connect components to `CotizadorAvanzado` main component in index.ts (exportar los 5 componentes y usarlos en flujo multipaso)
- Test full flow step 1→2→3→4→5 con validaciones locales
- Verify validation prevents invalid submissions (contexto vacío, modulos sin incluir, ajustes fuera de rango)
- Implement work-unit C (API integration handlers + handoff context avanzado)

## Relevant Files
| File | Action | What Was Done |
|------|--------|---------------|
| `frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzaContexto.tsx` | Created | Paso 1 con radios para projectType, projectState, country, priority + validación campos obligatorios |
| `frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzadaRequerimientos.tsx` | Created | Paso 2 checklist 5 áreas (diseno/ desarrollo / contenido/SEO/analytics) con contador visual |
| `frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzaModulos.tsx` | Created | Paso 3 tabla con MODULOS_PREDEFINIDOS, include/quantity/complexity + cálculos costo base |
| `frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzaAjustes.tsx` | Created | Paso 4 sliders ajustes (urgencia/contingencia/margen/descuento) con preview factores |
| `frontend/src/views/Main/Aplicaciones/Servicios/Avanzada/AvanzaResumen.tsx` | Created | Paso 5 resumen quote completo con CTA recalcular y contactar ahora |
| `frontent/src/views/Main/Aplicaciones/Servicios/Avanzada/Estilos.css` | Created/Updated | Estilos navegación steppers `.avanza__steps`, validación visual, badges por estado |
| `frontend/src/types/index.ts` | Read only | Existing types para cotización avanzada ya definidas (ContextoData, RequerimientosData, etc.) |

## Risks Identified
- **Import alias `@types`**: No está configurado en Vite config — usar imports relativos directos a `@types`
- **Missing validation logic**: Validaciones son solo frontend (no backend yet) — work-unit C debe manejar API handlers
- **Slider range UX**: Rangos personalizados pueden necesitar micro-interactions adicionales para feedback visual claro

## Status
6/20 tasks complete (Work-Unit B complete). Ready for next batch.
