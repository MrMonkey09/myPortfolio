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
