// useAnalytics.ts — Hook centralizado para telemetría GA4 en cotizador
// Proporciona eventos estructuralmente tipados con fallback universal y fire-and-forget

const dataLayer = typeof window !== 'undefined'
  ? (window.dataLayer = window.dataLayer || [])
  : [];

interface QuickResult {
  success: boolean;
  total_min?: number;
  total_max?: number;
  confidence_level?: 'low' | 'medium' | 'high';
  error_message?: string;
}

interface AdvancedResult {
  success: boolean;
  total_project?: number;
  total_monthly?: number;
  confidence_level?: 'low' | 'medium' | 'high';
  error_message?: string;
}

interface ModuleState {
  trace_id: string;
  advancedStepTimers: Map<number, number>; // stepN → performance.now() timestamp
}

const moduleState: ModuleState = {
  trace_id: 'pending',
  advancedStepTimers: new Map(),
};

/**
 * Obtiene o genera un trace_id único para rastrear el flujo del usuario en la sesión.
 * Persistió en sessionStorage (soporta sesiones multi-página del cotizador).
 */
function getOrCreateTraceId(): string {
  if (typeof window === 'undefined') return 'server';
  const stored = sessionStorage.getItem('cotizador_trace_id');
  if (stored) return stored;
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem('cotizador_trace_id', id);
  return id;
}

/**
 * Actualiza el trace_id en estado del módulo.
 */
moduleState.trace_id = getOrCreateTraceId();

/**
 * Crea payload de analytics con fields comunes y timestamp.
 */
function createAnalyticsPayload(event: string, properties: Record<string, unknown>): Record<string, unknown> {
  return {
    event,
    ...properties,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Tracke evento hacia dataLayer (fallback universal) y gtag() si está disponible.
 * DEV mode console.log con 🔍 prefix para debugging.
 * Fire-and-forget: no await, no error propagation.
 */
function track(event: string, properties: Record<string, unknown>): void {
  const payload = createAnalyticsPayload(event, properties);

  // Fallback universal — pushes evento a dataLayer incluso si gtag está bloqueado
  if (typeof window !== 'undefined') {
    dataLayer.push(payload);
  }

  // Envío vía gtag() si está disponible en la página
  if (typeof gtag !== 'undefined') {
    gtag('event', event, properties);
  }

  // DEV mode logging para debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [Analytics]`, event, payload);
  }
}

// ---------- Helpers para Quick Flow ----------

export function trackQuickStarted(): void {
  track('cotizador_quick_started', {
    mode: 'quick',
    trace_id: moduleState.trace_id,
  });
}

export function trackQuickCalculated(result: QuickResult): void {
  track('cotizador_quick_calculated', {
    success: result.success,
    total_min: result.total_min,
    total_max: result.total_max,
    confidence_level: result.confidence_level,
    error_message: result.error_message,
    mode: 'quick',
    trace_id: moduleState.trace_id,
  });
}

export function trackQuickContactClick(quoteId?: string, quoteTotal?: number): void {
  track('cotizador_quick_contact_click', {
    quote_id: quoteId,
    total: quoteTotal,
    mode: 'quick',
    trace_id: moduleState.trace_id,
  });
}

/**
 * Helpers para Advanced Flow
 */

export function trackAdvancedModeSwitch(): void {
  track('cotizador_mode_switched', {
    from_mode: 'quick',
    to_mode: 'advanced',
    trace_id: moduleState.trace_id,
  });
}

export function trackAdvancedStepViewed(
  step: number,
  stepName: string,
  timeOnPrevStepMs?: number
): void {
  track('cotizador_advanced_step_viewed', {
    step,
    step_name: stepName,
    time_on_prev_step_ms: timeOnPrevStepMs,
    trace_id: moduleState.trace_id,
  });
}

export function trackAdvancedStepCompleted(
  step: number,
  stepName: string,
  durationMs: number
): void {
  track('cotizador_advanced_step_completed', {
    step,
    step_name: stepName,
    duration_ms: durationMs,
    trace_id: moduleState.trace_id,
  });
}

export function trackAdvancedCalculated(result: AdvancedResult): void {
  track('cotizador_advanced_calculated', {
    success: result.success,
    total_project: result.total_project,
    total_monthly: result.total_monthly,
    confidence_level: result.confidence_level,
    error_message: result.error_message,
    mode: 'advanced',
    trace_id: moduleState.trace_id,
  });
}

export function trackAdvancedAbandoned(
  step: number,
  stepName: string,
  durationMs: number
): void {
  track('cotizador_advanced_abandoned', {
    step,
    step_name: stepName,
    duration_ms: durationMs,
    trace_id: moduleState.trace_id,
  });
}

export function trackContactSubmitted(
  mode: 'quick' | 'advanced' | 'direct',
  quoteTotal?: number,
  hasMessage?: boolean
): void {
  track('cotizador_contact_submitted', {
    mode,
    total: quoteTotal,
    has_message: hasMessage,
    trace_id: moduleState.trace_id,
  });
}

export function trackValidationFailed(
  step: number,
  field: string,
  errorCode: string,
  errorMessage?: string
): void {
  track('cotizador_validation_failed', {
    step,
    field,
    error_code: errorCode,
    error_message: errorMessage,
    trace_id: moduleState.trace_id,
  });
}

// ---------- Hook principal para uso en React components ----------

type TrackerFn = () => void;

interface UseAnalyticsReturn {
  /** ID de sesión único que persistió en sessionStorage durante el cotizador. */
  traceId: string;
  // Quick Flow helpers
  trackQuickStarted: TrackerFn;
  trackQuickCalculated: (result: QuickResult) => void;
  trackQuickContactClick: (quoteId?: string, quoteTotal?: number) => void;
  // Advanced Flow helpers
  trackAdvancedModeSwitch: TrackerFn;
  trackAdvancedStepViewed: (step: number, stepName: string, timeOnPrevStepMs?: number) => void;
  trackAdvancedStepCompleted: (step: number, stepName: string, durationMs: number) => void;
  trackAdvancedCalculated: (result: AdvancedResult) => void;
  trackAdvancedAbandoned: (step: number, stepName: string, durationMs: number) => void;
  // Contact helpers
  trackContactSubmitted: (mode: 'quick' | 'advanced' | 'direct', quoteTotal?: number, hasMessage?: boolean) => void;
  // Validation helpers
  trackValidationFailed: (step: number, field: string, errorCode: string, errorMessage?: string) => void;
}

/**
 * useAnalytics — Hook principal que expone todos los trackers con tipado completo.
 * Use case: importar y llamar desde handlers de eventos en componentes React.
 */
function useAnalytics(): UseAnalyticsReturn {
  return {
    traceId: moduleState.trace_id,
    trackQuickStarted,
    trackQuickCalculated,
    trackQuickContactClick,
    trackAdvancedModeSwitch,
    trackAdvancedStepViewed,
    trackAdvancedStepCompleted,
    trackAdvancedCalculated,
    trackAdvancedAbandoned,
    trackContactSubmitted,
    trackValidationFailed,
  };
}

export default useAnalytics;
