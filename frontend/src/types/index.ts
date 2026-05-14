import type { ReactNode } from "react";

// --- Application / Navigation ---

export interface Aplicacion {
  readonly ID: string;
  readonly nombre: string;
  readonly icono: ReactNode;
  readonly contenido: ReactNode;
}

// --- Timeline (Educación) ---

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
  /** Si existe, la tarjeta completa actúa como enlace (p. ej. contacto). */
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

// --- Cotizador rápido (Sprint 1 P1) ---

export interface QuickQuoteAnswers {
  readonly pages_estimate: number;
  readonly needs_ecommerce: "yes" | "no";
  readonly urgency: "low" | "medium" | "high";
}

// --- Data Model v2.0.0 (Professional Upgrade) ---

export interface ClientData {
  readonly empresa: string;
  readonly rut?: string;
  readonly contacto_nombre: string;
  readonly email: string;
  readonly telefono?: string;
  readonly ciudad_pais?: string;
  readonly dominio_estado?: string;
  readonly hosting_estado?: string;
  readonly sitio_actual_url?: string;
  readonly referencia_visual_url?: string;
  readonly objetivo_principal?: string;
  readonly fecha_deseada?: string;
  readonly publico_objetivo?: string;
  readonly prioridad: "baja" | "media" | "alta" | "urgente";
  readonly observaciones_comerciales?: string;
  readonly notas_internas?: string;
}

export interface ConfigSnapshot {
  readonly pricing_config_version: string;
  readonly hourly_rate: number;
  readonly complexity_factors: {
    readonly low: number;
    readonly medium: number;
    readonly high: number;
  };
  readonly urgency_factors: {
    readonly normal: number;
    readonly high: number;
  };
  readonly contingency_pct: number;
  readonly margin_pct: number;
  readonly vat_pct: number;
  readonly apply_vat: boolean;
  readonly discount_pct: number;
  readonly remodel_factor: number;
}

export interface CronogramaFase {
  readonly fase: string;
  readonly descripcion: string;
  readonly duracion_dias: number;
  readonly entregable: string;
  readonly responsable: string;
}

export interface RequirementItem {
  readonly categoria: string;
  readonly nombre: string;
  readonly estado: "si" | "no" | "pendiente";
}

export interface QuoteSimulateRequest {
  readonly persist?: boolean;
  readonly client_data?: ClientData; // v2.0.0
  readonly config_snapshot?: Partial<ConfigSnapshot>; // v2.0.0
  readonly cronograma?: CronogramaFase[]; // v2.0.0
  readonly checklist?: RequirementItem[]; // v2.0.0
  readonly contact?: {
    readonly nombre: string;
    readonly email: string;
    readonly telefono?: string;
    readonly mensaje?: string;
    readonly red_social?: string;
    readonly servicio?: string;
  };
  readonly context: {
    readonly schema_version: string;
    readonly origin: "quick" | "advanced" | "direct_contact";
    readonly project_type: string;
    readonly project_state: string;
    readonly currency: string;
    readonly country?: string;
    readonly trace_id?: string;
  };
  readonly input: {
    readonly quick_answers?: QuickQuoteAnswers;
    readonly requirements_checklist?: any;
    readonly line_items: any[];
    readonly monthly_services?: any[];
    readonly pricing?: {
      readonly contingency_pct: number;
      readonly margin_pct: number;
      readonly discount_pct: number;
      readonly vat_pct: number;
    };
    readonly apply_vat?: boolean;
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
    readonly direct_cost?: number;
    readonly contingency_value?: number;
    readonly margin_value?: number;
    readonly vat_value?: number;
  };
  readonly meta: {
    readonly trace_id: string;
    readonly schema_version: string;
    readonly pricing_config_version: string;
  };
  readonly breakdown?: any[];
  readonly input?: any;
}

export interface QuoteRef {
  readonly quote_id: string;
  readonly origin: "quick" | "advanced" | "direct_contact";
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

// --- Cotización Avanzada (Sprint 1 P2) ---

export type AdvancedStatus = "idle" | "active" | "validating" | "completed" | "error" | "invalid";
export type StepStatus = "locked" | "active" | "completed" | "warning" | "invalid";
export type StepId = "contexto" | "requerimientos" | "modulos" | "ajustes" | "resumen";

export interface ContextoData {
  projectType: "website" | "ecommerce" | "web_app";
  projectState: "new" | "remodel";
  priority: "low" | "medium" | "high" | "urgente";
  country: string;
}

export interface RequerimientosData {
  diseno: "yes" | "no";
  redaccion: "yes" | "no";
  seo: "yes" | "no";
  analytics: "yes" | "no";
}

export interface ModuloLinea {
  module_id: string;
  module_name: string;
  category: string;
  include: "yes" | "optional" | "no";
  quantity: number;
  complexity: "low" | "medium" | "high";
  base_cost: number;
  unit_hours: number;
}

export interface AjustesComerciales {
  contingency_pct: number;
  margin_pct: number;
  discount_pct: number;
  urgency: "low" | "medium" | "high";
}

export interface MonthlyService {
  service_id: string;
  service_name: string;
  plan_name: string;
  include: "yes" | "no";
  monthly_value: number;
  hours_included: number;
  sla: string;
}

export interface AdvancedFormState {
  currentStep: StepId;
  stepStatuses: Record<StepId, StepStatus>;
  globalStatus: AdvancedStatus;
  contexto: ContextoData;
  clientData: ClientData; // v2.0.0
  requerimientos: RequerimientosData;
  checklist: RequirementItem[]; // v2.0.0
  modulos: ModuloLinea[];
  ajustes: AjustesComerciales;
  cronograma: CronogramaFase[]; // v2.0.0
  serviciosMensuales: MonthlyService[];
  resultado: QuoteSimulateResponse | null;
  isStale: boolean;
  errorMessage: string | null;
}

