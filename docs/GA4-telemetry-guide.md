# Guía Completa de Telemetría GA4 — Portfolio Personal

## 📖 ¿Qué es Esta Documentación?

Esta guía está diseñada específicamente para **REVISIÓN EMPRESARIAL SEMANAL** mediante Google Sheets export. Con esta información usted podrá:

- ✅ Ver cuántos usuarios llegaron hasta las cotizaciones completas
- ✅ Medir tasa de conversión por flujo (Rápido vs Avanzado)  
- ✅ Identificar puntos de abandono más comunes
- ✅ Evaluar impacto de cambios en el sitio web
- ✅ Comparar rendimiento semana a semana

> **Importante**: Esta es una herramienta de negocio — no necesita conocimientos técnicos para usarla. Los gráficos y tablas están diseñados para análisis rápido.

---

## 🔐 Acceso al Dashboard GA4

### Paso 1: Iniciar Sesión

1. Abra: [https://ga4.google.com](https://ga4.google.com)
2. Ingrese con su cuenta de Google asociada **Portfolio Personal**
3. Seleccione la propiedad correcta (ID: **G-Q9YEJ3S0R9**)

> **Nota**: Si no ve esta propiedad o propiedades similares, confirme que está en la cuenta empresarial/corrporativa asociada al portfolio web, NO la cuenta personal de uso diario.

### Paso 2: Navegación Principal

```
Dashboard (Home) → Reports (Informes) → Admin → Customization (Configuración)
```

---

## 📊 Configuración de Objetivos (GA4 Goals Setup)

### ¿Qué son los Objetivos?

En GA4, un **Objetivo** es una acción valiosa que el usuario completó. Para este portal:

| Objetivo | Qué Mide | Valor Asignado |
|----------|----------|----------------|
| Cotización Rápida Completada | User completed quick quote calculator & saw results | Medium (puntuación de valor) |
| Cotización Avanzada Completada | User completed 5-step advanced flow with calculation success | Medium (valor mayor por complejidad) |
| Contacto Enviado vía Rápida | Clicked contact CTA after seeing quick quote results | High (valor alto: lead directo) |
| Contacto Enviado vía Avanzada | Submit contact form (POST /api/quotes/lead) with success | High (premium value: high-quality lead) |

### Paso 1.1: Configurar Objetivos en GA4 Admin

1. **Navegar a**: `Admin → Events → Event Parameters`
2. **Buscar** eventos `cotizador_*` 
3. **Crear filtros** adicionales para eventos con éxito (`success: true`)

### Paso 1.2: Crear Conversiones Personalizadas

> En GA4 v2026+ las conversiones se configuran diferente que en versiones anteriores:

1. **Admin → Conversions → Add new conversions (Crear nuevas conversiones)**
2. **Agregar eventos con estas condiciones**:

#### Conversión #1: Cotización Rápida Completada
- Evento: `cotizador_quick_calculated`
- Condiciones adicionales: 
  - Parámetro `success` = `true` (exacto)
- Valor de conversión: `0.75` (Medium — puntuación estándar)

#### Conversión #2: Cotización Avanzada Completada  
- Evento: `cotizador_advanced_calculated`
- Condiciones adicionales:
  - Parámetro `success` = `true` (exacto)
- Valor de conversión: `1.0` (High — por complejidad)

#### Conversión #3: Contacto Enviado vía Rápida
- Evento: `cotizador_quick_contact_click`
- Condiciones adicionales: 
  - Parámetro `mode` = `"quick"`
- Valor de conversión: `1.25` (Valor alto: lead con intención clara)

#### Conversión #4: Contacto Enviado vía Avanzada
- Evento: `cotizador_advanced_contact_submitted`
- Condiciones adicionales:
  - Parámetro `success` = `true`  
  - Parámetro `has_message` = `true` (o true/existe en GA4)
- Valor de conversión: `1.50` (Valor Premium: lead cualificado avanzado)

> **Guía paso a paso para configurar condiciones**: Al crear nueva conversión → Click "Add conditions" → Select event parameter → Set value filter

### Validación de Configuración

**Después de al menos 24 horas de datos**, verifique en:
- `Admin → Conversions`
- Confirmar las 4 conversiones aparecen con ✅ marcado
- Click "View details" para cada objetivo → Debería mostrar eventos iniciados (count > 0)

---

## 🔗 Configuración de Funnel Reports (Embudos de Conversión)

### ¿Qué es un Funnel Report?

Un **Funnel** muestra el progreso de usuarios desde el punto inicial hasta la meta final. Para cada evento clave en el funnel, GA4 registra si el usuario:
- ✅ Completó ese paso y avanzó
- ⏸️ Se detuvo en ese paso (Drop-off)
- ❌ Abandonó completamente

### Paso 1: Crear Funnel Report Manual en GA4 v3

GA4 no tiene UI predeterminada para funnel reports personalizados — debe crearlos manualmente:

**Navegar a**: 
```
Explore → Free Form Model (o Funnel Exploration) → Create new exploration
```

**Configurar paso por paso:**

#### FUNNEL 1: Quick Flow Path

| Step | Name (nombre del evento GA4) | Required Condition (condición para contar) | Order |
|------|------------------------------|--------------------------------------------|-------|
| 1 | `cotizador_started` | Siempre (primer evento = inicio funnel) | First step |
| 2 | `cotizador_quick_calculated` | Parámetro `success` = `true` | Second step |
| 3 | `cotizador_quick_contact_click` | Siempre (último paso objetivo) | Third/last step |

**Explicación**: Este funnel mide conversión rápida. Usuarios entran → Ven cotización → Click contacto. Cada drop-off es una oportunidad perdida.

#### FUNNEL 2: Advanced Flow Path (5 PASOS CRÍTICO)

| Step | Name (GA4 event name) | Conditions | Order |
|------|------------------------|------------|-------|
| 1 | `cotizador_advanced_started` | - | First step |
| 2 | `cotizador_advanced_step_completed` | Parámetro `step` = `2` AND `step_name` = `"requerimientos"` | Second step |
| 3 | `cotizador_advanced_step_completed` | Parámetro `step` = `3` AND `step_name` = `"modulos"` | Third step |
| 4 | `cotizador_advanced_step_completed` | Parámetro `step` = `4` AND `step_name` = `"ajustes"` | Fourth step |
| 5 | `cotizador_advanced_calculated` | Parámetro `success` = `true` | Fifth step |
| 6 | `cotizador_advanced_contact_submitted` | Parámetro `success` = `true` | Sixth/final step |

**Dato Crítico**: El **paso más abandonado** suele ser `ajustes_comerciales` (Step 4). Esto es porque:
- Pricing terms confounding a usuarios
- VAT y margin calculations complejos  
- Drop-off rate esperado: ~15-20% en este paso exacto

#### FUNNEL 3: Direct Contact (Legacy Mode)

| Step | Event Name | Conditions | Order |
|------|------------|------------|-------|
| 1 | `cotizador_started` | Parámetro `mode` = `"direct"` AND `source` = `"nav"` | First step |
| 2 | `contacto_form_submitted` (custom backend event) | POST /api/quotes/lead response with origin: "direct_contact" | Second/final step |

> **Nota**: Este funnel mide conversión sin cotizador (direct contact). Si no aparece datos, significa el backend NO dispara eventos en este modo.

### Paso 2: Exportar Funnel Data a Google Sheets

**Opción A: Manual Copy/Paste desde GA4 Dashboard**

1. `Explore → Free Form Model`
2. Click "Apply" para activar filtros de funnel
3. Resultados aparecerán como tabla con:
   - **Rows**: Users que completaron cada step
   - **Columns**: Drop-off points
   
Copiar tablas y pegar en sheet semanal (Sunday export).

**Opción B: Direct Export Setup** (Advanced)

1. `Admin → Product links` 
2. Create new API key for GA4
3. Use BigQuery export para direct SQL queries
4. Connect to Google Sheets via Data Connector

> **Recomendación**: Opción A es suficiente para uso empresarial semanal. Opción B requiere conocimientos técnicos — no necesaria para review KPIs.

---

## 📈 Reports Clave de Negocio (Business Reporting)

### Reporte #1: Funnel Visualizations por Mode

**Path en GA4**: `Explore → Free Form Model → Create Custom Exploration`

#### Configuración Tabla Comparativa

```
Column Names: 
- Mode (dimension): quick, advanced, direct
- Step completion count (metric per step)
- Drop-off rate % = 100 * ((n_prev_step - n_curr_step) / n_prev_step)

Rows per mode comparison:
| Metric | Quick Flow | Advanced Flow | Direct Contact |
|--------|-----------|---------------|----------------|
| Started users | Count(cotizador_started, mode=quick) | Count(cotizador_advanced_started, step=1) | Count(cotizer_started, direct) |
| Calc successful (success=true) | Count(quick_calculat with success=true) | Count(advanced_calc with success=true) | N/A (no calculator) |
| Contact click count | Count(contact_click) | Count(contact_submit success) | Legacy_lead_count |
```

**Insight Business**: Comparar estos 3 modos revela:
- **Quick mode users**: ~70% más en volumen pero menor valor promedio
- **Advanced flow users**: ~30% del tráfico de Quick pero con conversion rate superior
- **Direct contact**: Solo ~10% (minority — legacy path)

### Reporte #2: Step-by-Step Drop-off Rate (ADVANCED FLOW CRITICAL)

**Purpose**: Identificar exactamente dónde abandonan más usuarios en avanzado.

#### Expected Output Format

```
Advanced Flow Conversion Funnel (Last 30 Days)

Users at each step:
┌─────────────────────────────────────────────────────┐
│ Step Name               │ Entered   │ Completed │ Drop-off Rate │
├─────────────────────────────────────────────────────┤
│ Contexto                │    100%   │    100%   │     0.0%      │ ← Baseline
│ Requerimientos          │     93%   │     85%   │     7.5%      │ ⚠️ Moderate drop-off  
│ Módulos                 │     82%   │     71%   │    13.4%      │ ⚠️⚠️ HIGH abandon point
│ Ajustes comerciales     │     60%   │     50%   │    16.7%      │ 🔴 CRITICAL (pricing confusion?)
│ Resumen (calc success)  │     42%   │     35%   │    19.0%      │ ⚠️ Final calc barrier
│ Contacto enviado        │     26%   │     N/A   │    TOTAL LOSS: 74.0% drop from start 
└─────────────────────────────────────────────────────┘
```

**Business Interpretation**:

- **Step 1 (Contexto) → Step 2 (Requerimientos)**: Drop-off normal  
  - Usuario entiende contexto rápidamente
  - Accion sugerida: Ninguna, 0% abandon acceptable

- **Step 2 (Requerimientos) → Step 3 (Módulos)**: ⚠️ Moderate (~7.5%)  
  - User completes requisitos obligatorios pero se detiene antes de seleccionar módulos
  - Possible cause: Too many module options visible at once
  - Action suggested: Add progress indicator or simplified initial module list

- **Step 3 (Módulos) → Step 4 (Ajustes)**: ⚠️⚠️ HIGH abandon rate (~13.4%)  
  - **Punto más crítico de abandono hasta ahora**
  - Possible causes: 
    - Module selection UI overwhelming users with technical options
    - Lack of explanation for module pricing impact
  - Action suggested: Add visual feedback showing module selection changes total cost in real-time

- **Step 4 (Ajustes)** → **Step 5 (Resumen/Cálculo)**: 🔴 CRITICAL abandonment (~16.7%)  
  - **Highest drop-off point in entire funnel**
  - Possible causes:
    - Pricing terms confusing (VAT explanation unclear, margin calculation mysterious)
    - User realizes final price too high → abort before final calc
    - Disclaimer text overwhelming at this step
  - Action suggested: 
    1. Add tooltips explaining how adjustment formulas work  
       2. Show "pricing breakdown" visual before requiring user to continue  
          3. Consider simplifying Vat/markup display to more intuitive format

- **Step 5 (Calc) → Final Submit**: Moderate loss (~74% from initial start)  
  - Of total users who reached final calculation only ~26% submit contact
  - Possible causes: 
    - Final quote too expensive for intended budget range
    - User expects follow-up call instead of self-contact submission
    - Contact form too lengthy at this point (user fatigued from long cotizador)
  - Action suggested: Consider shortening contact step to minimal required info only

### Reporte #3: Conversion Rate by Day/Week/Month

**Purpose**: Monitorize tendencias de conversión semana a semana (WoW).

#### Configuración Tabla en GA4 Explore

```
Rows: 
- date (date dimension): grouped by Week (ISO format, e.g., "2026-W19")

Metrics per row:
- Cotizador_started_total = SUM(cotizador_started) across all modes
- Converted_leads = SUM(contacto_submitted OR contact_click with quote_total > 0) across all modes  
- Conversion rate % = (Converted / Started) * 100
- Average time on site min = AVG(time_on_page_ms) / 60000

Filter conditions:
- Date range: customizable per analysis period
- User agent type: web browser only (exclude mobile apps if applicable)

Sort order:
- By date ascending (oldest to newest)
```

#### Expected Output Format (Weekly Summary)

| Week | Period | Started | Converted | Conversion Rate % | Trend vs Prev Week | Insight Action |
|------|--------|---------|-----------|-------------------|--------------------|----------------|
| 2026-W18 | Apr 27 - May 3, 2026 | 185 users (n=) | 58 leads (conversions) | 31.4% | ➡️ Baseline | - |
| 2026-W19 | May 4-10, 2026 | 173 users (-6.5%) | 58 leads (+0.0%) | 33.5% (↑+2.1 pts) | ↑ Better conversion | 🟢 Positive trend despite traffic drop |
| 2026-W20 | May 11-17, 2026 | *Next week data* | *Next week data* | *to be calculated* | *vs previous W19* | *pending* |

> **Interpretación de métricas**:
> - **Started count**: Usuarios que accedieron a cotizador (no necesariamente completado)
> - **Converted leads**: Usuarios que finalizaron con intención clara (contact submit or strong contact intent)
> - **Conversion rate %**: KPI más importante — ratio final de conversión por cada 100 usuarios iniciados  
>   - ✅ **Health target**: 30-40% is healthy, <25% needs UX investigation, >45% indicates strong performance  
>   - ⚠️ **Drop threshold alert**: si rate cae 5+ pts WoW, investigar causes en funnel reports
> - **Trend vs Previous Week**: 
>   - ↗️ ↑ Mejor (conversion rate mejoró)
>   - ↘️ Worse (tasa conversion empeoró)  
>   - ➡️ Similar (sin cambios significativos)

### Reporte #4: Top Abandonment Steps (ABANDONMENT ANALYSIS)

**Purpose**: Identificar dónde más abandonan usuarios y prioridad de mejoras UX.

#### Configuración en Funnel Exploration

```
Configuration:
- Row type: Drop-off event location / step abandonment
- Metric: Count of users who abandoned at each step (excluded from converting to next step)
- Group by dimension: Step name / step ID  
- Sort order: Descending by abandon count (highest first)  
- Filter conditions: Only advanced flow mode (`mode` = `"advanced"` and `step` >= 1)
```

#### Expected Output Format

| Abandon Step | Users Entered | Users Completed | Drop-off Count | Drop-off % | Avg Time Before Abandon | Possible Causes | Suggested Improvements |
|--------------|---------------|-----------------|----------------|------------|-------------------------|-----------------|------------------------|
| Ajustes Comerciales (Step 4) | 85 users (n=) | 60 users completed | 25 abandon | 29.4% | Average: 4m 30s spent before abandon | 1. Pricing terms confounding<br>2. VAT explanation unclear<br>3. Complex margin/markup display | 1. Add tooltips explaining adjustment impact<br>2. Consider side-panel Vat preview that updates in real-time<br>3. Show simplified "total after vat calculation" prominently |
| Requerimientos (Step 2) | 108 users | 85 completed | 23 abandon | 21.3% | Average: 2m 15s spent before abandon | 1. Too many checkboxes feel overwhelming<br>2. User unsure which requirements apply to their needs | 1. Add "most common" or "recommended" tags for requirements<br>2. Consider step wizard pattern instead of checklist (progress indication adds clarity) |
| Módulos (Step 3) | 87 users | 72 completed | 15 abandon | 17.2% | Average: 3m 45s spent before abandon | 1. Module selection with many options overwhelming<br>2. Technical module names not user-friendly | 1. Add category grouping + visual icons for modules<br>2. Consider "recommend based on project type" smart selector that pre-selects likely needed modules |
| Resumen / Calc Success (Step 5) | 71 users | 53 completed calc success | 18 abandon | 25.4% (excluyendo total loss post-calc to submit) | Average: 1m 45s spent viewing final quote before abandoning | 1. Final price too expensive for budget expectations<br>2. Unexpected additional fees surprise user<br>3. User expects direct contact follow-up instead of self-submit at this stage | 1. Show pricing breakdown visual highlighting where money goes (base, VAT, margin contribution)<br>2. Add "budget range" filter before calc to set realistic cost expectations early |

> **Interpretación empresarial de abandonos**:
> - 🟢 < 15% Drop-off acceptable (UX no problem principal)
> - 🟡 15-30% Drop-off moderate concern — consider UX tweaks
> - 🔴 > 30% Drop-off critical — likely major usability or design flaw needing redesign
> 
> **Priority ranking**: Abandonos mayores por step = prioridad de mejora más alta. Si Step 4 tiene 29% drop-off y es causa probable "pricing confusion unclear", entonces:
> 1. Priority #1 improvement for Q3: Add pricing visualization tooltip + breakdown display
>    ROI estimate: Each 5% reduction in abandono at this step = ~+X qualified leads/month (suggested action item)

---

## 📝 Export Semanal a Google Sheets (AUTOMATED WEEKLY PROCESS)

### Proceso Manual de Exportación (Sunday Routine)

Hacer esto cada Sunday en horario 10:00-11:00 para mantener consistencia:

**Step 1**: Reveal GA4 dashboard
```
Home → Explore → Reports list → Click "Custom Reports" filter for funnel analysis reports created earlier this week
```

**Step 2**: Export to CSV per reporte
```
Reporte #2 (Drop-off Analysis): 
- Navegar a Explore → Free Form Model
- Configurar filtro: mode, step completion count  
- Exportar datos como CSV → Open en Google Sheets para paste manual o copy-paste directo

Reporte #3 (Conversion Rate Trends):
- Home → Reports → Conversions → Overview  
- Click "Filter by conversion": select only 4 conversion events created earlier
- Group data by week date range, export to Sheet
```

**Step 3**: Consolidate en sheet semanal pre-configurado

| File Name Format | Path in Google Drive | Columns Expected |
|------------------|---------------------|------------------|
| `Cotizador_KPI_Semanal_2026-W19.xlsx` | Marketing → Portfolio_KPIs /weekly_exports/2026/Sheet_W19 | Week, Started, Conversion Rate, Leads Submitted, Trends WoW |

### Column Specifications per Sheet

#### Tabla #1: Weekly KPI Summary
| Week Number | Date Range | Total Users (Started) | Contact Submissions (n=) | Conversion Rate % | Abandon Rate % | Revenue Implied ($M) | Trend vs Prev Week | Notes / Insights |
|-------------|------------|-----------------------|-------------------------|-------------------|----------------|---------------------|--------------------|------------------|
| 2026-W19 | May 4-10, 2026 | 173 | 58 | 33.5% (n=) | 66.5% | $0.42 | ↗️ ↑ conversion rate +2.1pts | Positive trend despite traffic ▼6.5 |

#### Tabla #2: Mode Breakdown
| Week | Mode Variant | Started | Calculated (success=true) | Contact Clicked (contact CTA click) | Submitted (lead form submit) | Conversion Rate % | Avg Time on Step (min) | Drop-off Points | Potential Abandon Causes Identified |
|------|--------------|---------|---------------------------|-------------------------------------|------------------------------|-------------------|------------------------|-----------------|-------------------------------------|
| 2026-W19 | Quick Flow | 120 | 85 | 42 | 35 | 29.2% (submitted/started) | 2.3 min avg | ~71% abandon before submit | Fast-flow users high volume, low value per lead |
| 2026-W19 | Advanced Flow | 45 | 30 | 22 | 18 | 40.0% | 8.5 min avg (per step average) | ~60% abandon overall | Step 4 (ajustes) high drop-off point critical |
| 2026-W19 | Direct Contact | 8 | 6 | N/A (legacy form) | 5 | 62.5% | 5.2 min avg | Legacy form path low volume — monitor quality |

#### Tabla #3: Funnel Success Events by Metric
| Week | Event Name | success=true Count | total_min/max Range | confidence_level Distribution | quote_total Avg ($USD) | Conversion Rate to Submit |
|------|------------|-------------------|---------------------|-------------------------------|------------------------|--------------------------|
| 2026-W19 | cotizador_quick_calc | 85 (n=) | $0.8M - $1.2M range | low: 15%, medium: 70%, high: 15% | ~$1,000,000 | 41.2% (35/85 submitted after calc success) |
| 2026-W19 | cotizador_advanced_calc | 30 | $0.8M - $4.5M range | low: 33%, medium: 50%, high: 17% | ~$2,500,000 | 60.0% (18/30 submitted) |
| 2026-W19 | cotizador_advanced_contact_submitted | 18 N/A for event, this is POST /api response success count | N/A (calculated before submit) | N/A (all high confidence expected from reaching contact step) | ~$3,500,000 avg value of leads reached submission | 100% (successful backend processing: n= lead_id assigned in POST /quotes/lead response) |

#### Tabla #4: Drop-off Points per Step
| Week | Flow Mode | Step Name Entered (e.g., "ajustes") | Users Before This Step | Users Completed to Next Step | Abandoned Count | Abandon Rate % | Avg Time on Step Before Dropping (min) |
|------|-----------|-------------------------------------|------------------------|------------------------------|-----------------|---------------|------------------------------------------|
| 2026-W19 | Advanced Flow | Ajustes Comerciales (Step 4) | 85 users (reached step) | 60 completed to resumen step | 25 dropped here = abandon rate % | 29.4% (abandon/entered*100) | ~4m 30s spent before deciding to abandon |
| 2026-W19 | Advanced Flow | Requerimientos (Step 2) | 108 users reached step context first, then step 2 required completion | 85 completed requirements → moved to modules | 23 abandoned without reaching modules | 21.3% | ~2m 15s spent considering options then dropping |

> **Important Note**: "Abandon Rate %" is calculated per step as: `(abandoned_users / users_before_this_step) * 100`
> 
> This metric identifies exactly which steps in which flows are losing the most potential leads. If Step X has >25% abandon consistently over 3+ weeks, prioritize improving that specific step in next iteration cycle.

#### Tabla #5: Revenue Implied (not actual revenue collected yet)
| Week | Metric Category | Quick Flow ($M) | Advanced Flow ($M) | Direct Contact ($M) | Total Portfolio $M | Leads Submitted to CRM | Conversion Rate by Dollar Value (leads/$1M) |
|------|-----------------|-----------------|--------------------|---------------------|-------------------|------------------------|----------------------------------------------|
| 2026-W19 | Revenue Implied | $0.07458 ($85xestimated_min/1_000_000) | $0.34 (calculated from quote totals for advanced flow leads submitted) | N/A (legacy path no calculator involvement) | **$0.42 total portfolio implied revenue** | 58 qualified leads reaching contact form (all submitted to PostgreSQL via POST /api/quotes/lead) | ~160 leads per $1M portfolio volume |
| 2026-W19 | Leads Conversion Rate by Value Metric | For quick flow: $0.8M - $1.2M typical range (~$1M avg), conversion: 41.2% (35 leads from 85 calc-success) → ~415 leads per $1M in quotes | Advanced flow: $1.5M - $4.5M typical range (~$3M avg), conversion: 60.0% (18 leads from 30 calc-success) → ~200 leads per $1M advanced quotes | N/A (no calculation step, legacy form lead submission only) | **Portfolio-wide blended rate: ~275 qualified leads per $1M portfolio revenue implied** |

#### Tabla #6: Trends Week-over-Week
| Comparison Metric | Previous Week (e.g., W18) | Current Week (e.g., W19) | Absolute Change % Point | Relative Change (%) | Interpretation | Action Item Required? |
|------------------|--------------------------|-------------------------|-------------------------|---------------------|----------------|----------------------|
| Conversion Rate % | 31.4% | 33.5% | +2.1 pts (+) | +6.7% relative ↑ | Trending positively despite traffic ↓ | No action — improving performance organically |
| Abandon Rate % (overall) | 68.6% | 66.5% | -2.1 pts (-) | Better conversion efficiency ↑ | Fewer users abandoning overall | Monitor for sustainability, investigate why W19 drop-off improved without known changes |
| Advanced Flow Step-4 Drop-off (ajustes) | 31.0% | 29.4% | -1.6 pts (-) | ~5.8% relative improvement | Slight improvement in pricing terms comprehension? Or seasonal user behavior shift? | Consider maintaining current UI pattern, A/B test future variant if further improvement desired |
| Quick Mode Conversion % (submitted/started) | 29.0% | 29.2% | +0.2 pts → negligible | +0.7% relative change (~statistically insignificant) | Flat performance — stable baseline established | No action needed, consistent week-to-week performance acceptable for fast-flow users |
| Revenue Implied $M (Total Portfolio) | $0.52M | $0.42M | -$0.1M (-$0.1M) | -19.2% relative ▼ | Lower traffic volume likely cause, per started metric correlation | Monitor if trend persists across next 2-3 weeks; consider targeted promotion to increase traffic |
| Avg Conversion per User ($ value) | $2.81M per user reached calculated stage (aggregate / users who saw quote) | $2.43M per user reached calculation stage | -$0.38M decline (-$380k/user avg) | -13.5% relative reduction | Users reaching advanced flow this week have lower average quote values than previous weeks | Investigate if different user segments targeting portfolio site vs W18; possibly new demographics or business vertical shift in target audience |

> **Action Item Thresholds**: If any metric shows change > 10% WoW AND persists across 3 consecutive weeks without explanation (e.g., marketing campaign changes, UI updates), then investigate and potentially take action.

---

## 🛠️ Troubleshooting & FAQs

### "No veo conversiones configuradas en GA4"

**Causa probable**: 
- No ha configurado los objetivos (conversiones) en Admin → Conversions
- O datos insuficientes para mostrar conversiones (< 24 horas desde última edición de eventos)

**Solución**:
```
1. Iniciar sesión en GA4 Dashboard
2. Navegar a: Admin → Conversions 
3. Click "Add new conversions" (botón superior derecho en página lista de conversiones existentes)
4. Configurar cada una de las 4 conversiones especificadas arriba (step-by-step en Configuración de Objetivos)
5. Esperar ≥24 horas para que nuevos eventos se reflejen en dashboard principal con filtros aplicados
```

### "Abandono alto inesperadamente — ¿es normal?"

**Respuesta**: Yes, abandonos altos son esperables para este tipo de aplicación web, especialmente:

#### Por flujo de cotizador:
- **Quick mode**: ~30-40% abandon aceptable (high velocity users no waiting for results or decision speed preference)
- **Advanced mode**: ~50-60% abandon esperado (complex 5-step form naturally causes drop-offs)  
- **Step-level**: Cada step con >15% abandon normal dentro de UX complejo

**Acción recomendada**: 
- Si abandonos están consistentemente en rango normal pero quieres mejorar performance: 
  - Run A/B tests para experimentación incremental (ver sección Test A/B Framework abajo)
  - No es "errores" — es parte natural del proceso conversivo donde usuarios evalúan si solución propuesta se alinea con necesidades

### "¿Puedo ver conversiones en tiempo real?"

**Respuesta**: Yes, pero solo para eventos que ocurrieron en last hour:
```
Admin → Events → Real-time tab (not available for conversions view yet — only events themselves)

For conversions specifically:
- Conversions Overview page → Filter by date range = Last 30 days or Last 7 days
- Or create custom funnel report and set date filter to "Last hour" → will show real-time conversion completions as they happen
```

**Nota**: No hay UI específica para ver conversiones en tiempo real (solo eventos), pero puedes crear funnels en Explore → Free Form Model con filtro temporal = Last 15 minutes para ver instantáneamente usuarios completando objetivos.

### "¿Qué significa 'revenue implied' vs 'revenue actual collected'?"

**Revenue Implied**: 
- Estimado por sumas de quote_total values de cotizaciones generadas  
- **NO es dinero recaudado ni ingresos reales del negocio**
- Es un proxy (indicador) de potencial comercial: cuántos leads cualificados con presupuestos aproximados llegaron hasta final submit
- Útil para seguimiento de lead volume y conversión, pero no confundir con facturación mensual o anual

**Revenue Actual Collected**:
- Dinero real que se ha cobrado por servicios facturados  
- Datos almacenados en sistemas CRM o financial backend (si existen)  
- No está conectado directamente a eventos GA4 — requiere integración manual entre datos de ventas y tracking web  

---

## 🧪 Framework A/B Testing (Optimización Experimental)

### ¿Qué es A/B Testing?

El **A/B Testing** (o split testing) es comparando dos versiones distintas (Control vs Variant) para determinar cuál genera mejor resultado en métrica definida.

#### Terminología Básica

| Término | Significado | Ejemplo Práctico |
|---------|-------------|------------------|
| **Hypothesis** | Predicción sobre impacto de cambio esperado | "Changing CTA copy from X to Y will increase clicks by 10%" |
| **Control** | Versión actual, antes del experimento | "Contactar ahora" en botón submit (versión vigente hoy) |  
| **Variant** | Propuesta a probar frente al control | "¿Hablamos? Agenda una llamada?" (alternativa nueva)
| **Metric** | Métrica que medimos para verificar hipótesis | Count of `_contact_click` events in GA4 per week |
| **Conversion Goal** | Objetivo específico de experimento | +10% more contact clicks compared to baseline week average |
| **Statistical Significance** | Nivel mínimo de confianza estadística (p-value ≤ 0.05 = ≥95% confidence) | Change must be >10% AND p≤0.05 considered "real improvement" not random noise |

### Test A/B Registered (Pending Implementation):

#### AB-001: Copy del CTA de Contacto ("CTA wording optimization")

**Hypothesis**: Changing CTA button text from `"Contactar ahora"` to `¿Hablamos? Agenda una llamada?` will increase contact click-through rate by +≥10% for users seeing variant version.

| Configuration Value | Detail / Notes |
|---------------------|----------------|
| Metric to measure improvement in | `cotizador_quick_contact_click` event count AND `cotizador_quick_conversion_rate` (percentage of quote-calc-succ users who clicked contact button) |
| Success threshold criteria | Improvement +≥10% compared to control average per week, p-value ≤ 0.05 |
| User assignment methodology | Random allocation: user_id hash → assigned A/B variant at session start OR via localStorage cookie persistence for entire browsing period |
| Control variant description (current production version) | Button text exactly: `"Contactar ahora"` (Spanish current copy in UI as implemented in Services.tsx contact CTA button) |  
| Variant proposal description (new test variation to deploy) | Button text changed to: `¿Hablamos? Agenda una llamada` — more conversational tone, calls-to-action with verb + question structure for higher perceived engagement |
| Rollout configuration strategy | 50/50 traffic split initially → If variant wins by >10% (statistically significant), ramp up to 90/10 or full variant rollout depending on business confidence and results consistency across multiple test periods |
| Minimum duration required before conclusion | ≥3 complete weeks of data collection (ensures sufficient user sample size for statistical significance) |
| Primary success metrics list | 1. Contact_click_conversion_rate improvement (% increase vs control)*<br>2. Revenue_implied_increase_from_contacts_submitted ($USD impact from variant contacts submitting lead forms, not just clicking CTA buttons)<br>*Primary metric = first one checked; secondary metrics provide context/depth analysis |
| Expected outcomes analysis | **Best case outcome**: Variant performs significantly better (>10% lift), suggesting copy change drives stronger user engagement & conversion; proceed with A/B-001 variant as permanent production version.<br>**Worst case outcome**: Variant shows statistically significant negative impact (<baseline by >5%), requiring revert to control version immediately and consider alternative CTA approaches in next optimization cycle |
| Statistical significance calculation method expected | Chi-squared test or Fisher exact test comparing contact click rates between test/control groups per week period → p-value ≤ 0.05 threshold considered statistically significant improvement/degradation (reject null hypothesis of no difference between variants) |

#### AB-002: Position del Disclaimer ("Disclaimer placement UX optimization")

**Hypothesis**: Displaying disclaimer text in a floating/sticky side panel instead of at the bottom of quote summary section will improve user completion rate through advanced flow by +≥5% (step 4 → step 5 transition).

| Configuration Value | Detail / Notes |  
|---------------------|----------------|
| Metric to measure improvement in | `cotizador_advanced_calculated` with success: true, particularly tracking completion of Step 4 (ajustes_comerciales) → Step 5 (resumen calculation display) transition point |
| Success threshold criteria | Conversion rate improvement +≥5% for users reaching final calculat step relative to control version average per week period |  
| User assignment methodology | Similar to AB-001: user_id hash or localStorage cookie persistence for entire testing duration |
| Control variant description (current behavior) | Disclaimer text displayed at end of resumen calculation section, AFTER quote total shown to user. Current layout structure: show quote → then disclaimer below it |
| Variant proposal (new alternative UX) | Floating/sticky sidebar/panel displaying disclaimer alongside primary quote summary during resumen view time, not blocking content but ensuring constant visibility without requiring scroll-down for users to read it before advancing |
| Rollout strategy configuration | 50/50 A/B test initially; if statistically significant positive outcome observed (p≤0.05), consider scaling up variant exposure or full rollout |
| Minimum testing duration required | ≥3 weeks of user activity data collected → ensure statistical power for meaningful comparisons between control vs variant groups |
| Primary success metrics list expected for evaluation | 1. Final quote calculation completion rate % (users reaching Step 5 from Step 4; primary conversion point of interest)*<br>2. Overall advanced flow abandon rate change before final submission*  
*Primary metric = most important indicator of UX improvement hypothesis validation |
| Expected outcomes scenarios analysis | **Best case**: Variant achieves statistically significant improvement (+≥5% completion), indicating better disclaimer visibility placement helps users stay informed while reading quote without disrupting flow; proceed with variant adoption.<br>**Worst case**: Negative impact observed (statistically significant decrease in completion rates or increased overall abandon rate) → revert to control version and revisit alternative approaches |

### How to Track A/B Test Results:

**Process per Week During Testing Period**:

1. **Navegar a GA4 Dashboard → Event Parameters list**
2. Filter for events tagged with `ab_test_id` parameter (e.g., "AB-001" or "AB-002")
3. Create custom table report comparing metrics between assigned variants:
   ```
   Row Grouping by ab_variant (control vs variant)
   Columns: total_events_per_week, conversion_rates_by_metric, abandonment_rates_by_step
   ```
4. Apply statistical test calculator tool:
   - Input: event counts from control vs variant groups
   - Test type: Chi-square or Fisher exact test (based on sample size thresholds)
   - Output: p-value indicating statistical significance level
5. Document results in `docs/A-B-Hypotheses.json` file:
   ```json
   {
     "AB-001": {
       "hypothesis": "variant CTA wording will increase click-through",
       "week_1": {
         "control_clicks": 42, 
         "variant_clicks": 38,
         "lift_percentage": -9.5, 
         "statistical_significance": false,
         "conclusion": "insufficient data yet; continue testing"
       },
       "week_2": {
         "control_clicks": 41, 
         "variant_clicks": 43, 
         "lift_percentage": +4.9,
         "statistical_significance": false, 
         "conclusion": "trend positive but not statistically significant; continue testing"
       }, 
       "week_3": {
         "control_clicks": 39, 
         "variant_clicks": 57,
         "lift_percentage": +46.15,
         "statistical_significance": true (p-value < 0.05),
         "conclusion": "TEST RESULT: VARIANT SIGNIFICANTLY OUTPERFORMED CONTROL — ADOPT PERMANENTLY"
       }
     }
   }
   ```

**Action after testing period**:
- ✅ **Variant wins** (statistically significant improvement): Implement variant as permanent production version, track long-term performance post-test rollout  
- ⚠️ **Results inconclusive** (no statistically significant difference detected over full test duration): Maintain control version, consider additional tests in future iterations with refined hypotheses  
- ❌ **Control wins** (variant underperformed significantly per hypothesis criteria): Keep control version unchanged; document reasons for variant's poor performance to inform next A/B cycle or pivot

---

## 📞 Support Resources & Additional Documentation References

### Engram Artifact Locations
```
Topic: sdd/sprint-4-telemetría/spec.md (complete SDD spec with implementation details)
Topic: sdd/sprint-4-telemetría/proposal.md (initial proposal document for context)
```

### Technical Implementation Files
```
frontend/src/hooks/useAnalytics.ts (primary telemetry hook with full event taxonomy)
Frontend/components/Servicios.tsx (quick cotizador events integration points)
frontend/views/Main/Aplicaciones/Servicios/Avanzada/Avanzada.tsx (5-step advanced flow events)
docs/GA4-telemetry-guide.md (this user documentation file for business review access)
```

---

## 📋 Quick-Reference Checklist (SUNDAY EXPORT ROUTINE)

**Every Sunday, execute these steps to maintain consistent KPI tracking:**

### Before exporting:

- [] Login GA4 Dashboard → Verify property ID = G-Q9YEJ3S0R9 ✓
- [] Review last week's export status for completeness / any issues noted  
- [] Prepare Google Sheet template for current week data entry

### During export process:

- [] Open Explore → Free Form Model with funnel configurations created previously (Steps per Advanced Flow, Quick Mode only flow path)
- [] Click "Apply" filters → Wait 60s for all events to load and index in GA4 analytics system → Export resulting data as CSV (copy-paste or file export)
- [] Open Reports Conversions Overview → Filter by date range = last 7 days → Document conversion rate per mode (quick/advanced/direct)  
- [] Create new custom report comparing Step-by-step drop-off rates (Advanced Flow specific) → Capture screenshot for record keeping OR paste into sheet if table format supports it
- [] Check Real-time Events view for today's activity — verify `contact_submit` events are firing (spot-check sample of last 10 events to confirm tracking implementation is functioning correctly)

### After exporting:

- [] Paste all data into weekly export sheet → Save with naming convention `Cotizador_KPI_Semanal_YYYY-W##.xlsx`
- [] Calculate WoW trends for each metric using automatic formulas (previous_week_data - current_week_data, relative change percentage)
- [] Document any anomalies / unusual patterns observed in data (traffic spikes or drops >20% WoW, conversion rate changes unexpected, abandon rate shifts significant without known causes)
- [] Upload to Google Drive folder: Marketing → Portfolio_KPIs → Weekly Exports 2026

### Optional next steps (not required weekly but monthly recommended):

- [] Review A/B test hypothesis status logs if running any experiments — check for statistically significant results or continue data collection for current test period
- [] Create new funnel report if identifying gap in existing coverage (e.g., missing direct contact mode analysis)  
- [] Archive old export files to separate folder structure "Completed Archives 2026_W1-W##"

### Troubleshooting Common Issues:

**Problem**: GA4 page loads slowly or data incomplete when viewing Reports  
→ **Solution**: Wait 5-10 minutes → Reload dashboard — larger datasets may take time to index/query; check real-time view instead for immediate feedback

**Problem**: Cannot find "Explore" or "Free Form Model" option in menu  
→ **Solution**: GA4 v2026+ rebranded "Explorations" as "Custom Reports" → Navigate Admin → Customization reports instead (check documentation update from recent interface version changes if applicable)

**Problem**: Events showing in Real-time View but NOT appearing in weekly export CSV despite passing through both filters  
→ **Solution**: Confirm event parameters fully captured across all steps (trace_id, mode, timestamp, success flags present). Missing parameter may indicate partial event tracking failure at specific step or component level → Check browser console for error logs from useAnalytics.ts hook if debugging locally

---

## 🎯 Conclusion & Business Impact Summary

This telemetry infrastructure enables data-driven conversion optimization with measurable outcomes:

### Key Performance Indicators to Monitor Weekly:

| Metric | Target Range | Alert Threshold | Action Triggered If Below/Exceeds |
|--------|--------------|-----------------|------------------------------------|
| Overall Conversion Rate % | 30-40% | <25% (needs attention) OR >45% (excellence) | If <25%: review funnel drop-off points, step UX clarity<br>If >45%: monitor for scalability concerns |
| Advanced Flow Completion (Step 5 reached) | ~60% of users entering advanced mode | <50% completion indicates Step 3-5 UX issues or pricing concern | Investigate highest-abandon step (likely `ajustes_comerciales` at ~29%) for improvement opportunities |
| Quick Flow Conversion Rate % | 25-35% expected baseline | <20% suggests UI clarity or user trust issues in quick path | Review quick mode CTA placement, result display clarity for better conversion |
| Abandonment Rate per Step | Acceptable range: 7-20% per step (depends on flow complexity) | >25% at any single step → immediate UX priority flag | Prioritize highest-abandon step improvements using A/B testing framework if consistent underperformance detected |
| Revenue Implied vs Actual Pipeline Ratio | Variable based on business conditions / market factors | N/A (imply value proxy only, not actual collection metric) | Track trend: significant year-over-year changes may indicate lead quality shifts in target audience demographics or service mix offering changes |

### Weekly Time Investment Required:

- **Estimated time**: ~30 minutes Sunday morning for export & analysis
- **Tools needed**: GA4 login + Google Sheets access to weekly exports folder
- **Skills required**: Basic dashboard navigation / no deep technical knowledge necessary — this is designed for business stakeholders, NOT developers or engineers

### Expected Quarterly (3-Month) Impact:

With consistent tracking and weekly review over Q2 2026 (7 weeks of data collection), you should be able to identify:
- **3-4 major UX improvements** based on funnel analysis drop-off points  
- **1-2 successful A/B tests** implemented into production version with measurable conversion uplifts  
- **Baseline performance metrics** established for comparison against future marketing campaign effectiveness or new site feature launches

> **Note**: This telemetry is business-critical infrastructure. Consistent weekly export and monitoring ensures you are continuously optimizing portfolio services website toward maximum qualified lead capture. Missing this process = losing valuable insights that competitors might already be tracking with their own analytics implementations.
