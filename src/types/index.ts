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

// --- Forms ---

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
}

export type FormData = Record<string, string>;
