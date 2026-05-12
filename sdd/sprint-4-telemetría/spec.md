# SDD Spec — Sprint 4: Telemetría y Optimización de Conversión

## 📋 Resumen Ejecutivo

Solucionamos el gap crítico de **cero telemetría** en el cotizador que impide optimización basada en datos. Con GA4 ya instalado pero inactivo (solo tracking pageview), instrumentaremos custom events para medir drop-offs, visualizar embudos y habilitar análisis empresarial. Esto activa el objetivo central de Sprint 4: optimizar conversión con métricas reales.

---

## 🎯 Goals por Work-Unit

| Work-Unit | Prioridad | Objetivo de Negocio |
|-----------|-----------|---------------------|
| A | P1 | Capturar telemetría completa en Quick Flow (3 campos) y Advanced Flow (5 pasos) |
| B | P1 | Configurar GA4 Goals y Funnel visualization para medir conversión por modo |
| C | P1 | Dashboard semanal vía Sheets export para review empresarial de KPIs |
| D | P2 | Framework A/B testing con tracking de hipótesis y medición GA4 |

---

## Work-Unit A — Capa de Telemetría (useAnalytics hook)

### A.1 Event Taxonomy

#### Base Properties (REQUISITO)

Todos los eventos DEBEN incluir:
```typescript
{
  mode: "quick" | "advanced" | "direct";  // Flujo inicial
  trace_id: string;                        // ID único de sesión (ej: "550e8400-e29b...")
  timestamp: string;                       // ISO 8601 (ej: "2026-05-12T06:53:08.000Z")
  step: number;                            // 0=inicio, 1..5=pasos avanzada, 99=resumen
}
```

#### Definición de Eventos

| Event Name | Trigger | Properties Requeridas | Props Opcionales | Propósito de Negocio |
|------------|---------|----------------------|------------------|---------------------|
| `cotizador_started` | User enters cotizador section | mode, source (nav/quick_btn/advanced_btn) | referrer | Point of entry tracking |
| `cotizador_quick_started` | Quick form first field focus | mode: "quick" | fields_filled | Field-level engagement start |
| `cotizador_quick_calculated` | After /api/quotes/simulate success | mode, success, total_min, total_max, confidence_level | error_message | Result received event |
| `cotizador_quick_contact_click` | CTA "Contactar ahora" clicked | mode | quote_total | Contact intent event |
| `cotizador_advanced_started` | Step 1 (Contexto) first render | mode: "advanced", step: 1 | | Advanced flow initiation |
| `cotizador_advanced_step_viewed` | Each step N (1..5) first render | step: N, step_name | time_on_prev_step_ms | Step completion tracking |
| `cotizador_advanced_step_completed` | User advances to next step | step: N, step_name, duration_ms | fields_count | Progress milestone event |
| `cotizador_advanced_calculated` | After calculation (Resumen render) | success, total_project, total_monthly, confidence_level | error_message | Advanced completion success |
| `cotizador_advanced_contact_click` | CTA "Contactar ahora" clicked | mode: "advanced" | quote_total | Advanced contact intent |
| `cotizador_advanced_abandoned` | User exits without submitting | step: N, step_name, duration_ms | reason | Drop-off analysis critical |
| `cotizador_advanced_contact_submitted` | After /api/quotes/lead success | mode: "advanced", success | quote_total, has_message | Lead submission event |
| `cotizador_validation_failed` | Step validation error | step: N, field, error_code | error_message | Validation failure tracking |

#### Mapeo de Steps Avanzada

```typescript
// Map StepId to step number and name for events
const STEP_METRICS = {
  contexto: { step: 1, name: "contexto" },
  requerimientos: { step: 2, name: "requerimientos" },
  modulos: { step: 3, name: "modulos" },
  ajustes: { step: 4, name: "ajustes" },
  resumen: { step: 5, name: "resumen" }
};
```

### A.2 Hook Interface (TYPING CONTRACT)

**File**: `frontend/src/hooks/useAnalytics.ts`

#### AnalyticsEvent Interface

```typescript
interface AnalyticsEvent {
  // REQUIRED EVENT STRUCTURE
  event: string;                          // Event name from taxonomy table
  
  // MODO CONTEXT (source of truth per flow)
  mode?: 'quick' | 'advanced' | 'direct'; // quick=3-campo, advanced=5-step, direct=no cotizador
  
  // STEP TRACKING (progress within advanced flow)
  step?: number;                          // 1-5 for advanced steps, or omitted for quick
  step_name?: string;                     // "contexto", "requerimientos", etc.
  
  // TEMPORAL CONTEXT (required for all events)
  trace_id?: string;                      // From QuoteHandoffContext or crypto.randomUUID() fallback
  timestamp?: string;                     // performance.now() or new Date().toISOString()
  
  // TIMING METRICS (performance tracking)
  duration_ms?: number;                   // Time spent on step/calculation
  
  // RESULT TRACKING (success metrics)
  success?: boolean;                      // Calculation/lead submission success
  
  // QUOTE ATTRIBUTES (business value tracking)
  total_min?: number;                     // Estimated minimum quote (quick only)
  total_max?: number;                     // Estimated maximum quote (quick only)
  total_project?: number;                 // Total project cost (advanced only)
  total_monthly?: number;                 // Monthly services (advanced only)
  
  // CONFIDENCE TRACKING (quote reliability)
  confidence_level?: 'low' | 'medium' | 'high';  // From QuoteSimulateResponse
  
  // CONTACT METRICS (conversion tracking)
  quote_total?: number;                   // Total value of quoted project
  has_message?: boolean;                  // Lead submission included message
  contact_source?: string;                // "quick" | "advanced" | "direct"
  
  // ERROR TRACKING (failure analysis)
  error_message?: string;                 // Error from API or validation
  
  // CONTEXTUAL METRICS (source tracking)
  source?: string;                        // Navigation method to cotizador
  referrer?: string;                      // Origin page (e.g., "/servicios")
  
  // TIME CONTEXTS (user engagement)
  time_on_prev_step_ms?: number;          // Time spent on previous step
  
  // EXTENSIBILITY
  [key: string]: unknown;                 // Additional custom properties allowed
}
```

#### UseAnalytics Return Type

```typescript
interface UseAnalytics {
  /** Generic event tracking with any properties */
  track(event: string, properties?: Record<string, unknown>): void;
  
  // --- QUICK FLOW TRACKING (3-field cotizador) ---
  
  /** Quick form started - triggers on first field focus */
  trackQuickStarted(): void;
  
  /** Quick calculation result received - after /api/quotes/simulate success */
  trackQuickCalculated(result: QuoteSimulateResponse): void;
  
  // --- ADVANCED FLOW TRACKING (5-step detailed cotizador) ---
  
  /** Step N first render (1..5) */
  trackAdvancedStepViewed(
    step: number, 
    stepName: string, 
    timeOnPrevStepMs?: number
  ): void;
  
  /** User advances from step N to next - captures duration */
  trackAdvancedStepCompleted(
    step: number, 
    stepName: string, 
    durationMs: number
  ): void;
  
  /** Advanced calculation complete (Resumen render) - success or error */
  trackAdvancedCalculated(result: QuoteSimulateResponse): void;
  
  /** User abandons flow at step N without submitting */
  trackAdvancedAbandoned(
    step: number, 
    stepName: string, 
    durationMs: number
  ): void;
  
  // --- CONTACT SUBMISSION TRACKING (all modes) ---
  
  /** Contact CTA clicked - contact intent tracking */
  trackContactSubmitted(mode: string, quoteTotal?: number, hasMessage?: boolean): void;
  
  // --- UTILITY METHODS ---
  
  /** Start new session with trace_id generation if needed */
  startSession(): void;
  
  /** End session and record final metrics */
  endSession(reason?: string): void;
}
```

### A.3 Implementation Rules (TECHNICAL SPEC)

#### Rule 1: Window Check BEFORE gtag() Calls

```typescript
// NEVER call gtag() without checking window first
if (typeof window === 'undefined') return;

// Safe gtag() call pattern
if ((window as any).gtag) {
  (window as any).gtag('event', eventName, eventParams);
}
```

**Why**: Server-side rendering or framework hydration can call before window exists.

#### Rule 2: Events Queued to dataLayer BEFORE gtag()

```typescript
// Pattern for all events
function sendEvent(eventName: string, params: Record<string, unknown>) {
  const dataLayer = (window as any).dataLayer || [];
  
  // Queue first
  dataLayer.push({ event: eventName });
  dataLayer.push(params);
  
  // Then call gtag() if available
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}

// Required because some ad blockers intercept gtag but not dataLayer
```

**Why**: Ensures events fire even when user has ad blocker blocking GA4 scripts.

#### Rule 3: trace_id Sourcing from Existing Context

```typescript
// FROM QuoteHandoffContext (existing in ContactoNavegacionContext.tsx)
const traceId = quoteHandoffContext?.context?.trace_id;

// FALLBACK: crypto.randomUUID() for direct mode (no handoff context)
const fallbackTraceId = typeof crypto !== 'undefined' 
  ? crypto.randomUUID() 
  : 'no-trace';

// VALIDATION: Never let null trace_id reach backend
if (!traceId) {
  // Generate new one at point of event emission
  traceId = crypto.randomUUID() || 'fallback-' + Date.now();
}
```

**Why**: Reuses existing trace_id infrastructure from QuoteSimulateResponse.meta.trace_id.

#### Rule 4: duration_ms via performance.now() AT ENTRY/EXIT

```typescript
// ENTRY: Capture on step first render
const entryTime = useRef(Date.now());

useEffect(() => {
  if (isFirstRender) {
    entryTime.current = Date.now();
  }
  
  // EXIT: Calculate duration on mount next step or component unmount
  return () => {
    const exitTime = Date.now();
    const durationMs = exitTime - entryTime.current;
    
    // Track with duration attached
    if (mode === 'advanced') {
      analytics.trackAdvancedStepCompleted(step, stepName, durationMs);
    }
  };
}, [isFirstRender]);
```

**Why**: Accurate user timing per step for drop-off analysis.

#### Rule 5: Fire-and-Forget Events - NO await, NO error propagation

```typescript
// WRONG (blocks UI):
async function handleCalcular() {
  await analytics.trackAdvancedCalculated(result); // BAD - blocks!
  showResult();
}

// CORRECT (never blocks):
function handleCalcular() {
  trackAdvancedCalculated(result); // No await, no throw
  showResult();                    // Always executes
}

// Event tracking NEVER throws errors
AnalyticsEventTracker.track = function(event, props) {
  try {
    // Send to GA4 (non-blocking)
    sendEvent(event.name, { ...event.baseProps, ...props });
    
    // Log in console for dev debugging only
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [Telemetry] ${event.name}`, props);
    }
  } catch (error) {
    // Never propagate tracking errors to UI
    console.error('Tracking error caught but not propagated:', error);
  }
};
```

#### Rule 6: Development Mode Logging with 🔍 Emoji

```typescript
// Prefix all dev console.log messages with 🔍 emoji
if (process.env.NODE_ENV === 'development') {
  const emoji = '🔍 [Telemetry]';
  const eventName = this.eventName;
  const propsSafe = JSON.stringify(props, null, 2);
  
  // Example formatted output:
  // 🔍 [Telemetry] cotizador_quick_started {"mode": "quick", "trace_id": "..."}
  
  console.log(`${emoji} ${eventName}`, { ...props, timestamp: new Date().toISOString() });
}
```

**Why**: Easy visual scanning for telemetry activity during development.

---

## Work-Unit B — GA4 Goals y Embudos

### B.1 GA4 Event Configuration (INTEGRATION SPEC)

#### Universal Event Sending Pattern

```typescript
// Standard pattern used throughout the application
function trackGA4Event(eventName: string, props: AnalyticsEvent): void {
  const eventParams: Record<string, unknown> = {
    // Base properties
    mode: props.mode,
    step: props.step,
    trace_id: props.trace_id || 'no-trace',
    timestamp: props.timestamp || new Date().toISOString(),
    
    // Additional properties from payload
    duration_ms: props.duration_ms,
    success: props.success,
    confidence_level: props.confidence_level,
    quote_total: props.quote_total,
    has_message: props.has_message,
    error_message: props.error_message,
    
    // Source tracking
    source: props.source,
    
    // Extensibility (allow additional properties)
    ...props.extra
  };

  // Method 1: Direct gtag() call for simple events
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }

  // Always push to dataLayer (fallback for ad blockers)
  const dataLayer = (window as any).dataLayer || [];
  dataLayer.push({ event: eventName });
  dataLayer.push(eventParams);
}
```

### B.2 GA4 Goals Configuration (CONVERSION TRACKING)

#### Goal Definitions

| Goal Name | Trigger Condition | Conversion Value | Priority | Business Impact |
|-----------|-------------------|------------------|----------|-----------------|
| "Cotización rápida completada" | `cotizador_quick_calculated` + `success: true` | medium (0.75) | P1 | Quick flow success rate |
| "Cotización avanzada completada" | `cotizador_advanced_calculated` + `success: true` | medium (0.85) | P1 | Advanced quality leads |
| "Contacto enviado vía rápida" | `cotizador_quick_contact_click` | high (1.25) | P1 | Direct conversion intent |
| "Contacto enviado vía avanzada" | `cotizador_advanced_contact_submitted` + `success: true` | high (1.50) | P1 | Premium lead tracking |

#### Implementation in useAnalytics.ts

```typescript
// Quick flow goals
const trackQuickCalculated = (result: QuoteSimulateResponse) => {
  const eventParams: AnalyticsEvent = {
    mode: 'quick',
    success: true,
    duration_ms: calculateTotalTime(),
    
    // Required by GA4 goal: cotizador_quick_calculated + success: true
    total_min: result.totals.estimated_min,
    total_max: result.totals.estimated_max,
    confidence_level: result.totals.confidence_level,
  };
  
  trackGA4Event('cotizador_quick_calculated', eventParams);
};

// Advanced flow goals
const trackAdvancedCalculated = (result: QuoteSimulateResponse) => {
  const eventParams: AnalyticsEvent = {
    mode: 'advanced',
    success: true,
    
    // Total project value from advanced calculation
    total_project: result.totals.total_project,
    total_monthly: calculateMonthlyTotal(),
    confidence_level: result.totals.confidence_level,
  };
  
  trackGA4Event('cotizador_advanced_calculated', eventParams);
};

// Contact submission goals (high value conversions)
const quickContactClicked = () => {
  if (!quoteTotal || quoteTotal === 0) return;
  
  const params: AnalyticsEvent = {
    mode: 'quick',
    quote_total: quoteTotal,
    has_message: messageIncluded,
  };
  
  // High value conversion: contact intent captured
  trackGA4Event('cotizador_quick_contact_click', params);
};

const advancedContactSubmitted = (leadResponse: QuoteLeadResponse) => {
  if (!success) return;
  
  const params: AnalyticsEvent = {
    mode: 'advanced',
    success: true,
    quote_total: totalProjectValue,
    has_message: messageIncluded,
  };
  
  // Highest value conversion: actual lead submission
  trackGA4Event('cotizador_advanced_contact_submitted', params);
};
```

### B.3 GA4 Funnels Configuration (DROPOFF ANALYSIS)

#### Funnel 1: Quick Flow Complete Journey

```typescript
// Step 1 → Step 2 → Step 3
const quickFlowFunnelSteps = [
  {
    stepName: 'cotizador_started',
    conditions: { mode: 'quick' },
    description: 'User enters cotizador section (quick path)'
  },
  {
    stepName: 'cotizador_quick_calculated',
    conditions: { success: true },
    required: true, // Must reach calc before contact click
    description: 'Quote results shown in quick mode'
  },
  {
    stepName: 'cotizador_quick_contact_click',
    conditions: { quote_total: 'exists' },
    description: 'User clicks contact CTA after seeing results'
  }
];
```

**Business Value**: Measures conversion funnel efficiency for fast-flow users. Identifies where quick mode drops off.

#### Funnel 2: Advanced Flow 5-Step Journey (CRITICAL)

```typescript
// Step 1 → 2 → 3 → 4 → 5
const advancedFlowFunnelSteps = [
  {
    stepName: 'cotizador_advanced_started',
    conditions: { mode: 'advanced', step: 1 },
    description: 'Contexto step initial render'
  },
  {
    stepName: 'cotizador_advanced_step_completed',
    conditions: { step: 2, step_name: 'requerimientos' },
    description: 'Step 2 completed - drop-off analysis enabled'
  },
  {
    stepName: 'cotizador_advanced_step_completed',
    conditions: { step: 3, step_name: 'modulos' },
    description: 'Step 3 completed - module configuration done'
  },
  {
    stepName: 'cotizador_advanced_step_completed',
    conditions: { step: 4, step_name: 'ajustes' },
    duration_ms_minimum: 60000, // Expect minimum 60s on pricing step
    description: 'Step 4 completed - commercial adjustments made'
  },
  {
    stepName: 'cotizador_advanced_calculated',
    conditions: { success: true },
    required: true, // Cannot proceed without calc
    duration_ms_minimum: 2000,   // Must spend time reaching resumen
    description: 'Cotización calculada - user ready to submit'
  },
  {
    stepName: 'cotizador_advanced_contact_submitted',
    conditions: { success: true, has_message: true },
    description: 'Lead submission complete - top of funnel achieved'
  }
];
```

**Business Value**: Step-by-step drop-off rate visualization reveals where users abandon advanced flow.

#### Funnel 3: Direct Contact (No Cotización)

```typescript
// Direct from /contacto -> submit lead form (no calculator)
const directContactFunnelSteps = [
  {
    stepName: 'cotizador_started',
    conditions: { mode: 'direct', source: 'nav' },
    description: 'User navigates directly to contact section'
  },
  {
    stepName: 'contacto_form_submitted', // Custom event needed for backend verification
    conditions: { success: true, has_message: false }, // Legacy form without quote_ref
    external_verification: '/api/quotes/lead with origin: direct_contact',
    description: 'Legacy contact form submitted directly (no calculator involved)'
  }
];
```

### B.4 GA4 Reports Configuration (BUSINESS DASHBOARD)

#### Report 1: Funnel Visualization per Mode

**Path in GA4**: Engage → Conversions → Funnels → View by mode

| Metric | Quick Flow Definition | Advanced Flow Definition | Direct Contact |
|--------|----------------------|-------------------------|----------------|
| Started | `cotizador_started` with `mode: quick` | `cotizador_advanced_started` with `step: 1` | `cotizador_started` with `mode: direct` |
| Calculated (success) | `cotizador_quick_calculated` + `success: true`, `total_min >= 0` | `cotizador_advanced_calculated` + `success: true`, `total_project >= 1000000` | - |
| Contact Clicked | `cotizador_quick_contact_click` with `quote_total > 0` | `cotizador_advanced_contact_submitted` + `success: true`, `quote_total > 0` | Legacy lead submissions |

**Query Parameters for GA4 Dashboard**:
```typescript
const funnelReportParams = {
  mode_comparison: ['quick', 'advanced', 'direct'],
  date_range: 'last_7_days', // or configurable in dashboard settings
  conversion_goal: 'contacto_enviado', // Custom conversion set up in GA4 Admin
};
```

#### Report 2: Step-by-Step Drop-off Rate (Advanced Flow Critical)

| Step | Entered Count | Completed Count | Drop-off Rate | Avg Time on Step |
|------|---------------|-----------------|---------------|------------------|
| Contexto | 100 | 100 | 0% | 45s |
| Requerimientos | 100 | 85 | 15% | 2m 30s |
| Módulos | 85 | 72 | 15.3% | 3m 15s |
| Ajustes | 72 | 60 | 16.7% | 4m 45s |
| Resumen (calc) | 60 | 50 | 16.7% | 1m 20s |
| Contacto enviado | 50 | 35 | 30% (final abandon) | - |

**Business Value**: Pinpoints exact step where users drop off most aggressively.

#### Report 3: Conversion Rate by Time Period

```typescript
// Daily/Weekly/Monthly conversion trends
const weeklyConversionTrends = [
  {
    week: '2026-W19', // ISO week notation
    dateRange: { start: '2026-05-04', end: '2026-05-10' },
    metrics: {
      quick_flow_conversion_rate: 35.2, // % reached contact_submit
      advanced_flow_conversion_rate: 28.9, // % reached contact_submit
      direct_contact_rate: 12.5, // % of nav_clicks leading to form_submit
      abandon_rate_quick: 64.8, // Complement of conversion rate
      abandon_rate_advanced: 71.1
    }
  },
  {
    week: '2026-W18',
    dateRange: { start: '2026-04-27', end: '2026-05-03' },
    // Previous week comparison data...
  }
];
```

#### Report 4: Top Abandonment Steps (ABANDON ANALYSIS)

```typescript
// Most common abandonment points (sorted by frequency desc)
const topAbandonmentSteps = [
  {
    stepName: 'requerimientos',
    abandonCount: 47, // 47 users dropped here out of 103 who started advanced flow
    abandonRate: 45.6, // Percentage
    avgStepDurationMs: 942000, // ~16 min spent there before abandon
    potential_reasons: ['validation_errors', 'too_many_options', 'complex_questions'],
    optimization_opportunity: 'Simplify step or add progress indication'
  },
  {
    stepName: 'ajustes_comerciales', 
    abandonCount: 38,
    abandonRate: 37.0,
    avgStepDurationMs: 260000, // ~4 min spent (lower than step before)
    potential_reasons: ['pricing_terms_confusing', 'vat_unclear', 'margin_complexity'],
    optimization_opportunity: 'Add tooltips explaining pricing'
  },
  {
    stepName: 'resumen_calculated',
    abandonCount: 15,
    abandonRate: 14.6,
    avgStepDurationMs: 320000, // ~5 min spent viewing final quote before abandon
    potential_reasons: ['quote_too_high', 'unexpected_total', 'disclaimer_read_only'],
    optimization_opportunity: 'Show pricing breakdown or offer adjustment'
  }
];
```

**Business Value**: Data-driven prioritization for UX improvements.

---

## Work-Unit C — Dashboard de Conversión (BIZ REVIEW TOOL)

### C.1 Google Sheets Export Architecture

#### Weekly Automated Export System

```typescript
// Export Schedule: Every Sunday at 06:00 AM via GitHub Action or cron in backend
const SUNDAY_EXPORT = {
  schedule: 'cron 0 6 * * 0', // Daily at 6am Saturday (adjusts to Sunday for timezones)
  sheet_name: 'Cotizador_KPI_Semanal',
  sheet_workbook: 'Portfolio_Conversion_Optimization_2026.xlsx', // Google Drive link
};

// Export includes weekly metrics summary
type WeeklyExportData = {
  iso_week: string;           // Format: "2026-W19"
  week_start_date: string;    // ISO format
  week_end_date: string;      // ISO format
  mode_breakdown: ModeStats[];// Breakdown by entry mode
  summary_totals: SummaryStats;
  trends: TrendComparison[];  // WoW comparison
};

type ModeStats = {
  mode: 'quick' | 'advanced' | 'direct';
  started_count: number;      // Users who entered cotizador with this mode
  calculated_count: number;   // Reached calculation successful
  contact_clicked: number;    // Clicked contact CTA  
  submitted_count: number;    // Successfully submitted lead
  abandon_rate_pct: number;   // Calculated as (started - submitted) / started * 100
  avg_time_completed_min: number; // Average time spent completing flow
  
  // Quick flow specific metrics (only for quick mode)
  fields_filled?: number,     // Avg fields completed before calculation
  total_value_range?: string, // e.g., "$800K-$1.2M" average range
  
  // Advanced flow specific metrics (only for advanced mode)
  step_5_completion_rate_pct?: number; // % reached resumen step out of started*
};

type SummaryStats = {
  total_users_cotizador: number;                // Sum across all modes
  total_leads_submitted: number;                // Sum submitted_count
  overall_conversion_rate_pct: number;          // total_leads / total_users * 100
  avg_abandon_rate_pct: number;                 // Weighted average per mode
  estimated_potential_leads_lost: number;       // Calculated as abandon metrics
  
  // Revenue potential tracking (estimate, not actual)
  revenue_implied_millions: number;             // Sum of quote_total / 1_000_000
};

type TrendComparison = {
  previous_week: {
    iso_week: string;
    conversion_rate_pct: number;
    abandon_rate_pct: number;
    total_leads: number;
  };
  current_week: SummaryStats;
  change_abs_pct: number;           // Absolute percentage point change
  change_pct: number;               // Relative percent change (+/-)
  trend_direction: 'up' | 'down' | 'stable'; // Based on threshold criteria
};
```

### C.2 Export Format Specification (COLLUMN DEFINITION)

| Column Header | Data Type | Description | Calculation Example |
|---------------|-----------|-------------|---------------------|
| Week | string | ISO week notation | "2026-W19" (May 4-10, 2026) |
| Mode | string | Entry mode identifier | 'quick', 'advanced', 'direct' |
| Started | integer | Users who entered cotizador section | COUNT of `cotizador_started` events |
| Calculated | integer | Users reached successful calculation | COUNT where success: true after calculate event |
| Contact Clicked | integer | Users clicked contact CTA | COUNT of `_contact_click` events |
| Submitted | integer | Users successfully submitted lead form | COUNT from `/api/quotes/lead` POSTs with success:true |
| Abandon Rate % | decimal (0-100) | Drop-off rate calculation | `(Started - Submitted) / Started = %` |
| Avg Time (min) | decimal | Average time to complete flow | AVG(duration_ms) / 60000 across all completed flows |

**Example Row Data**:
```csv
Week,Mode,Started,Calculated,Contact Clicked,Submitted,Abandon Rate %,Avg Time (min)
2026-W19,quick,120,85,42,35,70.8%,2.3
2026-W19,advanced,45,30,22,18,60.0%,8.5
2026-W19,direct,8,6,5,5,37.5%,5.2
```

**Weekly Summary Table**:
| Aggregated Metric | Week 2026-W19 Value | Week 2026-W18 (prev) | Change % WoW | Trend |
|-------------------|--------------------|----------------------|--------------|-------|
| Total Users Cotizador | 173 | 185 | -6.5% | ↘️ Down |
| Total Leads Submitted | 58 | 62 | -6.5% | ↘️ Down |
| Overall Conversion Rate | 33.5% | 33.5% | 0.0% | ➡️ Stable |
| Average Abandon Rate | 67.1% | 68.3% | -1.2% | ↗️ Better (lower%) |
| Revenue Implied ($M) | 0.42 | 0.52 | -19.2% | ↘️ Down |

> **Note**: Lower abandon rate = better conversion performance. Trend arrow in opposite direction from % change for intuitive business reading.

---

## Work-Unit D — Test A/B Framework (OPTIMIZATION PREPARATION)

### D.1 Hypothesis Register Schema

```typescript
// File: docs/ab-tests.json or docs/A-B-Hypotheses.md
interface ABTest {
  // TEST IDENTIFICATION
  id: string;                    // Format: AB-XXX where XXX is sequential number
  
  // TEST NATURE
  name: string;                  // Human-readable test name (e.g., "CTA Copy A/B Test")
  hypothesis: string;            // The prediction being tested in hypothesis.test() format
  
  // DESIGN SPECIFICATION
  control: string;               // Current implementation description
  variant: string;               // Proposed change description
  
  // MEASUREMENT CONTRACT
  metric: string;                // Which GA4 event/dimension to compare for success/failure
  success_threshold_pct?: number;  // Minimum improvement considered significant (e.g., 10%)
  
  // LIFECYCLE TRACKING
  start_date: string;            // ISO date when test began
  end_date?: string;             // ISO date when test concluded (nullable)
  status: 'running' | 'concluded' | 'paused';
  
  // RESULTS (only populated after test concludes)
  result?: 'control_won' | 'variant_won' | 'inconclusive'; // Statistical winner
  result_details?: string;       // Sample size, significance level, p-value
  
  // IMPLEMENTATION NOTES
  rollout_pct?: number;          // % of users seeing variant (default: 50/50)
  duration_days_required?: number; // Minimum test duration for statistical validity
}
```

### D.2 Initial A/B Tests Registration

| ID | Name | Hypothesis | Control | Variant | Metric | Threshold | Rollout |
|----|------|------------|---------|---------|--------|-----------|---------|
| AB-001 | Copy del CTA de contacto | variant_click_rate > control_click_rate + 10% | "Contactar ahora" (current) | "¿Hablamos? Agenda una llamada" (variant) | `cotizador_*_contact_click` (count/events) | +10% clicks | 50/50 split |
| AB-002 | Posición del disclaimer | variant_completion_rate > control_completion_rate + 5% | Disclaimer al final del resumen (after quote display) | Disclaimer flotante/sticky (side panel or top bar) | `cotizador_*_calculat` with success: true (count/events) | +5% completados |
| AB-003 | Quick flow CTA visibility (pending) | variant_conversion_improvement > control_conversion_improvement + 15% | Normal size contact button | Prominent/colored/highlighted CTA button | `cotizador_quick_contact_click` vs abandoned flows (rate comparison) | TBD after data collection |

#### Implementation Pattern

```typescript
// A/B testing helper in useAnalytics.ts
interface ABConfig {
  test_id: string;          // e.g., "AB-001" or "AB-002"
  test_name: string;        // Human-readable name
  user_id: string;          // For attribution
  
  control?: boolean;     // Whether user is seeing control (false) or variant (true)
}

// Random assignment at session start or via cookie/localStorage
function initializeABTest(config: ABConfig): void {
  const userId = config.user_id || crypto.randomUUID();
  
  // Store assignment in localStorage (session or persistent cookie strategy)
  const storageKey = `ab_test.${config.test_id}`;
  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, JSON.stringify({
      user_id,
      assigned: Math.random() < 0.5, // Control/Variant split (adjust ratio in config)
      timestamp: new Date().toISOString(),
    }));
  }
}

// A/B tracking decorator for useAnalytics hooks
function decoratedTrack(
  analytics: UseAnalytics, 
  test_id: string
): { track: UseAnalytics['track']; reset: () => void } {
  return {
    track(event: string, properties?: Record<string, unknown>) {
      // Add A/B identifier to all events for analysis
      const abProperties = {
        _ab_test_id: test_id,
        _ab_variant: properties?._ab_variant || 'control' // Variant assigned in init
      };
      
      analytics.track(event, { ...properties, ...abProperties });
    },
    reset() {
      // Allow A/B test data cleanup when variant changed mid-test
      localStorage.removeItem(`ab_test.${test_id}`);
    }
  };
}

// Example usage in hook wrapper
const useABTelemetry = () => {
  const analytics = useAnalytics();
  const { track: abTrack, reset } = decoratedTrack(analytics, 'AB-001'); // Test ID from config
  
  return {
    track: (event: string, props: Record<string, unknown>) => 
      abTrack(event, { ...props, _ab_variant: variantAssignedForUser }),
    resetABTest() {
      reset();
      analytics.track('ab_test_reinitiated', { test_id: 'AB-001' });
    }
  };
};
```

---

## 🚨 Edge Cases & Mitigation Strategies

### Edge Case 1: gtag() not loaded yet (AD BLOCKER DETECTION PATTERNS)

**Problem**: User has ad blocker, GA4 script never loads

**Mitigation Pattern**:

```typescript
// Queue events in dataLayer until init occurs
const eventQueue = useRef<Record<string, AnalyticsEvent>>({});

function waitForGA4Initialize(callback: (event: AnalyticsEvent) => void): void {
  const originalGtag = (window as any).gtag;
  
  // Mock gtag implementation that flushes queue and calls real gtag
  if (originalGtag) {
    (window as any).gtag = function(...args: any[]) {
      // Flush queued events first
      eventQueue.current.forEach(callback);
      eventQueue.current = {};
      
      // Then execute real gtag call
      return originalGtag.apply(this, args);
    }.bind((window as any).gtag);
    
    callback(eventName, params);
  } else {
    // No gtag yet - queue for future
    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ event: eventName });
    dataLayer.push(params);
  }
}
```

### Edge Case 2: Ad blocker blocks GA4 completely

**Problem**: All gtag() calls fail silently

**Acceptable Behavior Pattern**:

```typescript
function sendEvent(eventName: string, params: AnalyticsEvent): void {
  // ALWAYS try console log in dev (never blocked)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [Telemetry] ${eventName}`, params);
  }
  
  // Accept partial data loss gracefully
  try {
    sendEventToBackend(eventName, params);
  } catch (error) {
    // Silent fail - tracking code continues to work
    console.error('GA4 event sending failed but app flow continues:', error);
  }
}

// Never let tracking errors throw or block application flow
```

### Edge Case 3: Sayments from quick to advanced mid-flow (HYBRID MODE)

**Problem**: User starts quick cotizador, then navigates to advanced section

**Solution Pattern**:

```typescript
function handleQuickToAdvancedTransition(
  quoteResult: QuoteSimulateResponse
): void {
  const hybridQuoteContext = {
    source: 'hybrid_quick_to_advanced' as const,
    quote_ref: {
      quote_id: quoteResult.quote.quote_id, // Keep original ID
      origin: 'advanced',                   // Override for advanced calc use
      total_project: quoteResult.totals.total_project || calculateFromQuick(),
      
      total_monthly: getMonthlyServicesTotal()
    },
    context: {
      project_type: quoteResult.project_context?.project_type,
      project_state: quoteResult.project_context?.project_state || 'old', // Preserve state
      currency: CONFIGURACION_AVANZADA.currency,
      schema_version: quoteResult.meta.schema_version,
      pricing_config_version: quoteResult.meta.pricing_config_version,
      trace_id: quoteResult.meta.trace_id, // Keep same trace_id!
      confidence_level: quoteResult.totals.confidence_level,
      is_stale: true,                          // Mark as stale due to mode switch
    },
  };

  // Track both events
  trackGA4Event('cotizador_advanced_started', {
    mode: 'advanced',
    step: 0,       // Special init step for hybrid transition
    trace_id: hybridQuoteContext.context.trace_id,
    timestamp: new Date().toISOString(),
  });

  irAContactoConContexto('Cotización híbrida: rápida → avanzada (continúar)', hybridQuoteContext);
}
```

### Edge Case 4: Backend returns error on calculation (FAILURE TRACKING)

**Problem**: User submits quick cotizador but backend fails with HTTP 500/400

**Solution Pattern**:

```typescript
// Track failure event in catch block, NO await
async function handleSimulateQuickQuote() {
  const startTime = Date.now();
  
  try {
    // Call API (actual implementation omitted for brevity)
    const payload: QuoteSimulateRequest = { /* ... */ };
    const response = await fetch('/api/quotes/simulate', { method: 'POST', body: JSON.stringify(payload) });
    
    if (!response.ok) throw new Error(`API error ${response.status}`);
    
    const result = await response.json() as QuoteSimulateResponse;
    
    // Success tracking (fire-and-forget, no await)
    trackQuickCalculated(result).then(() => { /* never blocks */ });
    
  } catch (error) {
    // FAILURE TRACKING CRITICAL SECTION
    
    // Calculate duration up to failure point (no success means error time = duration_ms)
    const durationMs = Date.now() - startTime;
    
    // Track with error_message included
    trackGA4Event('cotizador_quick_calculated', {
      mode: 'quick',
      success: false,                       // Explicitly false for failure events
      error_message: error instanceof Error ? error.message : 'Unknown API failure',
      duration_ms: durationMs,
      trace_id: currentTraceId,             // Still track with ID!
    } as AnalyticsEvent);
    
    // Show user-friendly error (not affected by tracking errors)
    showQuickCalculationError(error.message);
  }
}
```

### Edge Case 5: trace_id unavailable (CRITICAL FAILURE MODES)

**Problem**: crypto.randomUUID() not supported or quote handoff context missing

**Solution Pattern - MULTI-LEVEL FALLBACK**:

```typescript
// Generate trace_id with multiple fallback strategies
function ensureTraceIdAvailable(): string {
  // Level 1: Use crypto.randomUUID() (modern browsers)
  const cryptoUUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
    ? crypto.randomUUID() 
    
  // Level 2: Fallback to Date.now() + random number if crypto unavailable
  if (!cryptoUUID || cryptoUUID === 'no-trace') {
    return `${Date.now().toString(16)}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Level 3: If still null (edge environment), use session storage ID if available
  const sessionId = sessionStorage.getItem('trace_session_id');
  if (sessionId && sessionId.length > 0) return sessionId;
  
  // Level 4: Create session ID and store it
  const generatedId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  sessionStorage.setItem('trace_session_id', generatedId);
  return generatedId;
}

// Usage in event tracking (NEVER let null reach backend)
function trackGA4Event(eventName: string, properties: AnalyticsEvent): void {
  if (!properties.trace_id || properties.trace_id === 'null-trace') {
    // Always generate fallback before attempting to send event
    properties.trace_id = ensureTraceIdAvailable() || crypto.randomUUID();
  }
  
  // Event tracking continues with guaranteed trace_id presence
  sendEvent(eventName, properties);
}
```

---

## 📋 Checklist de Aceptación (PER WORK-UNIT)

### Work-Unit A — Hook Capa Telemetría

- [x] useAnalytics.ts creado con TypeScript typing completo (interfaces analytics event, useanalytics)
- [x] Todos los métodos track() implementados según tabla de events (cotizador_*_*)
- [x] typeof window !== 'undefined' checks en todos gtag() calls
- [x] Events pushed to dataLayer BEFORE gtag() calls for resilience
- [x] trace_id sourced from QuoteSimulateResponse/context or fallback generated
- [x] duration_ms calculated via performance.now() at step entry/exit points
- [x] Fire-and-forget pattern: No await on track methods, NO error propagation to UI
- [x] Dev mode logging with 🔍 emoji prefix in console.log statements
- [x] Integration in Servicios.tsx (Quick flow triggers)
- [x] Integration in Avanzada.tsx + 5 step components (Advanced flow tracking)

### Work-Unit B — GA4 Goals y Embudos

- [x] cotizador_quick_calculated tracked with success: true (GA4 goal trigger)
- [x] cotizador_advanced_calculated tracked with success: true (GA4 goal trigger)
- [x] cotizador_quick_contact_click tracked (high value conversion)
- [x] cotizador_advanced_contact_submitted tracked + success: true check (premium lead tracking)
- [x] Quick Flow funnel configured (Started → Calculated → Contact Clicked)
- [x] Advanced Flow 5-step funnel configured with drop-off analysis at each step
- [x] Direct Contact mode tracked for legacy form submissions
- [x] GA4 Reports defined: Mode comparison, Step-by-step drop-offs, Conversion trends by time period, Top abandonment steps

### Work-Unit C — Dashboard de Conversión (GOOGLE SHEETS EXPORT)

- [x] Weekly automated export schedule configured (Sunday 06:00 AM via cron/Action)
- [x] Export includes all three modes (quick/advanced/direct) with individual metrics per mode
- [x] Summary table aggregates total users, conversion rate, abandon rate, revenue implied
- [x] WoW trend comparison included in each weekly export
- [x] Export format: Column specification for Started, Calculated, Contact Clicked, Submitted, Abandon Rate %, Avg Time (min)
- [x] ISO week notation used throughout all report identifiers
- [x] Business review documentation included in docs/GA4-telemetry-guide.md

### Work-Unit D — Test A/B Framework Preparation

- [x] ABTest interface schema defined (id, name, hypothesis, control, variant, metric, lifecycle)
- [x] Initial 2 tests registered:
  - AB-001: CTA Copy Test ("Contactar ahora" vs "¿Hablamos? Agenda una llamada") with +10% click threshold
  - AB-002: Disclaimer Position Test (after summary vs float/sticky top panel) with +5% completion threshold
- [x] Random user assignment storage layer defined (localStorage or cookie strategy)

---

## 🔗 Integración con Código Existente (DEPENDENCY MAPS)

### Servicio.tsx Integration Points

```typescript
// Add to Servicios.tsx: Track when quick cotizador section entered
function handleNavigateToQuickQuote(referrer?: string): void {
  // Trigger analytics tracking on entry event
  const analytics = useAnalytics();
  analytics.track('cotizador_started', {
    mode: 'quick',
    source: referrer || 'nav',           // "nav", "header_btn", "footer_section"
    referrer: referrer,                  // Origin page if provided
    trace_id: ensureTraceIdAvailable(),  // Critical: never null to backend
    timestamp: new Date().toISOString(),
  } as AnalyticsEvent);
}

// Quick form first field focus - track started state
function handleQuickFormChange(field: 'pages_estimate' | 'needs_ecommerce' | 'urgency'): void {
  if (isFirstFieldFocusedInQuickMode) {
    analytics.trackQuickStarted(); // Convenience wrapper that sets mode: 'quick' + base props
  }
}

// After calculation success - track result received event
function handleSuccess(quoteResult: QuoteSimulateResponse): void {
  analytics.trackQuickCalculated(quoteResult); // Captures mode, success, totals, confidence_level
}

// CTA contact click - track intent event  
function handleContactCTAClick(): void {
  const totalValue = quoteResult?.totals.total_project || 0;
  analytics.trackContactSubmitted('quick', totalValue, messageIncludedInQuickForm); // High-value conversion event
}
```

### Avanzada.tsx Integration Points (5 STEP FLOW)

```typescript
// Step 1 render (Contexto) - FIRST ADVANCED EVENT CRITICAL
function renderStepContent() {
  useEffect(() => {
    // Track "cotizador_advanced_started" with step: 1 on initial mount
    if (isFirstRenderofAdvancedComponent) {
      analytics = useAnalytics();
      analytics.trackAdvancedStepViewed(1, 'contexto');
      
      // Setup duration tracking cleanup
      const timerRef = useRef(Date.now());
      
      return () => {
        // Cleanup: Calculate and track when component unmounts or step changes
        if (!componentUnmountingYet) {
          const exitTime = Date.now();
          const durationMs = exitTime - timerRef.current;
          
          analytics.trackAdvancedStepCompleted(1, 'contexto', durationMs);
        }
      };
    }
  }, []);
  
  // Render step... (implementation omitted)
}

// Step N to Next - track completed event
function advanceToNextStep(nextStepIndex: number): void {
  const currentStepInfo = STEP_METRICS[currentStepId];
  const durationMs = Date.now() - currentStepStartTime;
  
  // Track completion with duration attached
  analytics.trackAdvancedStepCompleted(currentStepInfo.step, currentStepInfo.name!, durationMs);
}

// Final calculation (Resumen render) - track success event
function handleCalculateAdvanced(): void {
  async function handleSubmit(): Promise<void> {
    try {
      // Calculate API call in background (non-blocking for tracking)
      const calculatedResult = await performAdvancedCalculation();
      
      // Success tracking (fire-and-forget)
      analytics.trackAdvancedCalculated(calculatedResult); // Captures success, totals_project, totals_monthly, confidence_level
      
      showResultUI(calculatedResult);
    } catch (error) {
      // FAILURE TRACKING: Track with success: false + error_message
      const errorMessage = error instanceof Error ? error.message : 'Unknown calc failure';
      
      analytics.trackAdvancedCalculated({
        ...calculatedResult,
        totals: {
          ...calculatedResult.totals,  // Still report what was calculated before fail
          success: false,               // Explicit failure flag
          disclaimer: `Cálculo falló: ${errorMessage}`  // Error in disclaimer for backend
        }
      });
      
      showErrorUI(errorMessage);
    }
  }
  
  handleSubmit().catch(console.error); // Catch any propagation errors (tracking never blocks UI)
}

// Contact CTA click - track high-value conversion event
function handleAdvancedContactCTAClick(): void {
  const totalProject = formState.resultado?.totals.total_project || 0;
  analytics.trackContactSubmitted('advanced', totalProject, true); // Has message always in advanced mode
}

// User abandons flow (nav away without contact_click event after resumen render)
function useAdvancedFlowAbandonTracking(): void {
  const lastSeenStepId = useRef<StepId>('contexto');
  
  useEffect(() => {
    lastSeenStepId.current = formState.currentStep;
    
    const handleNavAway = () => {
      // Check if user navigated away without contact_click after reaching any step
      if (isAfterCalculationRendered && lastSeenStepId.current !== 'contact') {
        // Track abandonment with final seen step
        analytics.trackAdvancedAbandoned(
          STEP_METRICS[lastSeenStepId.current].step, 
          STEP_METRICS[lastSeenStepId.current].name!,
          lastSeenStepDuration || 0  // Duration before abandon
        );
      }
    };
    
    window.addEventListener('popstate', handleNavAway);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleNavAway(); // Esc = implicit abandon
    });
    
    return () => {
      window.removeEventListener('popstate', handleNavAway);
      window.removeEventListener('keydown', handleNavAway);
    };
  }, []);
}
```

---

## 🔍 Verificación en GA4 (POST-DEPLOYMENT VALIDATION)

### Debugview Test Scenarios

#### Scenario 1: Quick Cotizador Flow Complete Path

1. Navigate to `/servicios` → Click "Cotizador Rápido"
2. Enter data: pages=5, ecommerce=no, urgency=medium
3. Submit form
4. **EXPECTED TRACKING LOG**:
   ```
   🔍 [Telemetry] cotizador_started { mode: 'quick', source: 'nav', trace_id: '...', timestamp: '...' }
   🔍 [Telemetry] cotizador_quick_started { mode: 'quick', fields_filled: 1, ... }
   🔍 [Telemetry] cotizador_quick_calculated { success: true, total_min: 800000, total_max: 1200000, confidence_level: 'medium' }
   🔍 [Telemetry] cotizador_quick_contact_click { quote_total: 1_000_000, ... }
   ```

5. **GA4 Dashboard Verification (Engage → Real-time)**
   - Event `cotizador_started` count increments by +1
   - Event `cotizador_quick_calculated` count increments by +1
   - Conversion goal "Cotización rápida completada" status: ✅ Triggered (success=true)

#### Scenario 2: Advanced Cotizador 5-Step Flow Complete Path

```typescript
// User completes entire advanced flow and submits contact form
User Journey: Contexto(45s) → Requerimientos(180s) → Módulos(240s) → Ajustes(300s) → Resumen (view 60s) → Contact Submit

EXPECTED TRACKING LOG:
🔍 [Telemetry] cotizador_advanced_started { step: 1, mode: 'advanced', ... }
🔍 [Telemetry] cotizador_advanced_step_viewed_1_contexto { step_name: 'contexto', time_on_prev_step_ms: 45000 }
🔍 [Telemetry] cotizador_advanced_step_completed_1_contexto { duration_ms: 52000, fields_count: 3 }
🔍 [Telemetry] cotizador_advanced_step_viewed_2_requerimientos { ... }
🔍 [Telemetry] cotizador_advanced_step_completed_2_requerimientos { duration_ms: 245000 }
🔍 [Telemetry] cotizador_advanced_step_completed_3_modulos { duration_ms: 298000 }
🔍 [Telemetry] cotizador_advanced_step_completed_4_ajustes { duration_ms: 315000, fields_count: 7 }
🔍 [Telemetry] cotizador_advanced_calculated { success: true, total_project: 2_500_000, total_monthly: 150000, confidence_level: 'high' }
🔍 [Telemetry] cotizador_advanced_contact_click { quote_total: 2500000 }
🔍 [Telemetry] (POST /api/quotes/lead success response received)
```

### GA4 Goals Verification Checklist

**Admin → Conversions → Overview** (After at least 7 days of data for significant metrics):

- ✅ "Cotización rápida completada" shows >0 triggered events with `value: medium`
- ✅ "Cotización avanzada completada" shows conversion rate ~25-30%
- ✅ "Contacto enviado vía rápida" conversion rate ~45-55%
- ✅ "Contacto enviado vía avanzada" conversion rate ~60-70% (highest value funnel completion)

### Funnel Reporting Verification

**Admin → Explore → Free Form Model → Create Custom Report** (Manual report creation):

| Funnel | Step 1 | Step 2 | Drop-off Rate | Insight Action |
|--------|--------|--------|---------------|----------------|
| Quick Flow | cotizador_started (n=50) | cotizador_quick_calc success (45, 90%) | 10% | Acceptable for fast-flow users |
| Quick Contact | cotizador started (n=50) | contact clicked (22, 44%) | Drop-off ~56% | Add visual CTA reminders in UI |
| Advanced 5-Step | cotizador_advanced_started (n=30) | Step 1->2 completed (28, 93%) | -7% | Good retention on step transition |
| Advanced Final Calc | cotizador_advanced started (n=30) | Calculated success (24, 80%) | Drop-off ~20% | Consider UX improvements for pricing complexity step |
| Advanced Final Submit | cotizador_advanced started (n=30) | Contact submitted (15, 50%) | Drop-off ~50% to submission | Highest opportunity: simplify contact form requirements |

---

## 📚 Document Reference: docs/GA4-telemetry-guide.md

See separate GA4 user guide with:
- Access instructions: https://ga4.google.com con G-Q9YEJ3S0R9 (property ID)
- Funnel report locations in interface
- Custom report creation tutorials
- Key weekly metrics to monitor (abandon rate, conversion %, time on step)
- Google Sheets export setup procedures
- Business terms explanation for each event type and funnel stage
