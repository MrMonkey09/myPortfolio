import type { ReactNode } from "react";

// --- Application / Navigation ---

export interface Aplicacion {
  readonly ID: string;
  readonly nombre: string;
  readonly icono: ReactNode;
  readonly contenido: ReactNode;
}

// --- Timeline (EducaciÃ³n) ---

export interface PuntoTiempoData {
  readonly id: number | string;
  readonly titulo: string;
  readonly universidad?: string;
  readonly logo?: string;
  readonly ubicacion: string;
  readonly fecha: string;
  readonly descripcion: string;
  readonly etiquetas?: readonly string[];
}

// --- Cards ---

export interface Tarjeta {
  readonly id: number | string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly imagen: string;
  /** Si existe, la tarjeta completa actÃºa como enlace (p. ej. contacto). */
  readonly enlace?: string;
}

export interface Proyecto {
  readonly id: number;
  readonly titulo: string;
  readonly descripcion: string;
  readonly imagen: string;
  readonly tecnologias: readonly string[];
  readonly enlace: string;
}

// --- Section Configuration ---

export interface DatosContacto {
  readonly ciudad?: string;
  readonly correo?: string;
  readonly github?: string;
}

export interface EncabezadoData {
  readonly saludo: string;
  readonly nombre01: string;
  readonly nombre02: string;
  readonly datos: DatosContacto;
}

export interface ConfiguracionSeccion {
  readonly contenido: {
    readonly encabezado: EncabezadoData;
    readonly [key: string]: unknown;
  };
}

export interface SeoSection {
  readonly appId: string;
  readonly nombre: string;
  readonly path: string;
  readonly aliases: readonly string[];
  readonly title: string;
  readonly description: string;
  readonly keywords: string;
}

export interface AvatarProps {
  readonly src: string;
  readonly name1: string;
  readonly name2: string;
  readonly nameIcon: string;
  readonly role: string;
}

// --- Forms ---

export interface OpcionSeleccionFormulario {
  readonly value: string;
  readonly label: string;
}

export interface CampoFormulario {
  readonly id: number | string;
  readonly label?: string;
  readonly tipo: string;
  readonly ejemplo?: string;
  readonly ayuda?: string;
  readonly requerido?: boolean;
  readonly minimo?: string;
  readonly maximo?: string;
  readonly icono?: string;
  readonly opciones?: readonly OpcionSeleccionFormulario[];
}

export type FormData = Readonly<Record<string, string>>;

// --- Cotizador rÃ¡pido (Sprint 1 P1) ---

export interface QuickQuoteAnswers {
  readonly pages_estimate: number;
  readonly needs_ecommerce: "yes" | "no";
  readonly urgency: "low" | "medium" | "high";
}

export interface QuoteSimulateRequest {
  readonly context: {
    readonly schema_version: string;
    /**
     * Origen de la cotizaciÃ³n:
     * - "quick": CotizaciÃ³n rÃ¡pida (Sprint 1 P1)
     * - "advanced": CotizaciÃ³n avanzada (modo detalle por mÃ³dulos)
     * - "direct_contact": Contacto directo (flujo legacy sin pasar por simulate)
     *
     * Nota: origin=direct_contact viene del formulario legacy y NO pasa por
     * POST /api/quotes/simulate. Se registra directamente en Notion via lead.
     */
    readonly origin: "quick";
    readonly project_type: string;
    readonly project_state: string;
    readonly currency: string;
  };
  readonly input: {
    readonly quick_answers: QuickQuoteAnswers;
    readonly line_items: readonly {
      readonly include: "yes";
      readonly quantity: number;
      readonly complexity: "low" | "medium" | "high";
      readonly base_cost: number;
    }[];
  };
}

export interface QuoteSimulateResponse {
  readonly quote: {
    readonly quote_id: string;
    readonly status: string;
    readonly created_at: string;
    readonly confidence_level: "low" | "medium" | "high";
    readonly disclaimer: string;
  };
  readonly totals: {
    readonly estimated_min: number;
    readonly estimated_max: number;
    readonly total_project: number;
    readonly total_monthly: number;
    readonly confidence_level: "low" | "medium" | "high";
    readonly disclaimer: string;
  };
  readonly meta: {
    readonly trace_id: string;
    readonly schema_version: string;
    readonly pricing_config_version: string;
  };
}

export interface QuoteRef {
  readonly quote_id: string;
  /** @see QuoteSimulateRequest.context.origin para valores vÃ¡lidos */
  readonly origin: "quick" | "advanced";
  readonly total_project: number;
  readonly total_monthly: number;
}

export interface QuoteHandoffContext {
  readonly source: "quick" | "advanced";
  readonly quote_ref: QuoteRef;
  readonly context: {
    readonly project_type: string;
    readonly project_state: string;
    readonly currency: string;
    readonly schema_version: string;
    readonly pricing_config_version: string;
    readonly trace_id: string;
    readonly confidence_level: "low" | "medium" | "high";
    readonly is_stale: boolean;
  };
  readonly quick_answers?: QuickQuoteAnswers;
}

export interface ApiErrorEnvelope {
  readonly error: {
    readonly type: "validation_error" | "domain_error" | "conflict_error" | "internal_error";
    readonly code: string;
    readonly message: string;
    readonly details?: readonly {
      readonly field?: string;
      readonly code?: string;
      readonly message?: string;
    }[];
    readonly trace_id?: string;
  };
}

/** Request para POST /api/quotes/lead
 *
 * Origenes vÃ¡lidos en quote_ref.origin:
 * - "quick": Desde cotizaciÃ³n rÃ¡pida
 * - "advanced": Desde cotizaciÃ³n avanzada
 * - "direct_contact": Desde formulario de contacto legacy (sin cotizaciÃ³n)
 */
export interface QuoteLeadRequest {
  readonly contact: {
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly preferred_channel: string;
  };
  readonly quote_ref: {
    readonly quote_id: string;
    readonly origin: "quick" | "advanced" | "direct_contact";
    readonly total_project: number;
    readonly total_monthly: number;
  };
  readonly message: string;
  readonly schema_version?: string;
  readonly pricing_config_version?: string;
}

export interface QuoteLeadResponse {
  readonly lead_id: string;
  readonly status: string;
  readonly crm_sync: string;
  readonly meta: {
    readonly trace_id: string;
    readonly schema_version: string;
    readonly pricing_config_version: string;
  };
}
// --- Cotización Avanzada (Sprint 1 P2) ---

export type AdvancedStatus = "idle" | "in_progress" | "validating" | "calculated" | "error" | "submitted";
export type StepStatus = "locked" | "active" | "completed" | "warning" | "invalid";
export type StepId = "contexto" | "requerimientos" | "modulos" | "ajustes" | "resumen";

export interface ContextoData {
  readonly projectType: "website" | "ecommerce" | "web_app";
  readonly projectState: "new" | "remodelacion";
  readonly country: string;
  readonly priority: "low" | "medium" | "high";
}

export interface RequerimientosData {
  readonly diseno: boolean;
  readonly desarrollo: boolean;
  readonly contenido: boolean;
  readonly seo: boolean;
  readonly analytics: boolean;
}

export interface ModuloLinea {
  readonly module_id: string;
  readonly module_name: string;
  readonly category: string;
  readonly include: "yes" | "optional" | "no";
  readonly quantity: number;
  readonly complexity: "low" | "medium" | "high";
  readonly base_cost: number;
}

export interface AjustesComerciales {
  readonly urgencyMultiplier: number; // 0.8 a 1.3
  readonly contingency_pct: number; // 0 a 0.25
  readonly margin_pct: number; // 0.15 a 0.40
  readonly discount_pct: number; // 0 a 0.20
  readonly apply_vat: boolean;
  readonly vat_pct: number; // 0.19
}

export interface MonthlyService {
  readonly service_id: string;
  readonly service_name: string;
  readonly plan_name: string;
  readonly include: "yes" | "no";
  readonly monthly_value: number;
  readonly hours_included: number;
  readonly sla: string;
}

export interface AdvancedFormState {
  readonly currentStep: StepId;
  readonly stepStatuses: Record<StepId, StepStatus>;
  readonly globalStatus: AdvancedStatus;
  readonly contexto: ContextoData;
  readonly requerimientos: RequerimientosData;
  readonly modulos: Readonly<ModuloLinea[]>;
  readonly ajustes: AjustesComerciales;
  readonly serviciosMensuales: Readonly<MonthlyService[]>;
  readonly resultado: QuoteSimulateResponse | null;
  readonly isStale: boolean;
  readonly errorMessage: string | null;
}
