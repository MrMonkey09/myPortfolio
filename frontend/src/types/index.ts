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

export type FormData = Record<string, string>;

// --- Cotizador rápido (Sprint 1 P1) ---

export interface QuickQuoteAnswers {
  readonly pages_estimate: number;
  readonly needs_ecommerce: "yes" | "no";
  readonly urgency: "low" | "medium" | "high";
}

export interface QuoteSimulateRequest {
  readonly context: {
    readonly schema_version: string;
    /**
     * Origen de la cotización:
     * - "quick": Cotización rápida (Sprint 1 P1)
     * - "advanced": Cotización avanzada (modo detalle por módulos)
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
  /** @see QuoteSimulateRequest.context.origin para valores válidos */
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
 * Origenes válidos en quote_ref.origin:
 * - "quick": Desde cotización rápida
 * - "advanced": Desde cotización avanzada
 * - "direct_contact": Desde formulario de contacto legacy (sin cotización)
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
