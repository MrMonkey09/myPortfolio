import type { ModuloLinea, MonthlyService } from "../../../types/index.js";

/**
 * Módulos predefinidos para la línea de cotización.
 * Cada módulo tiene una base_cost configurada en CLP.
 */
export const MODULOS_PREDEFINIDOS: readonly ModuloLinea[] = [
  {
    module_id: "diseno-ui-ux",
    module_name: "Diseño UI/UX",
    category: "Diseño",
    include: "no",
    quantity: 0,
    complexity: "medium",
    base_cost: 65000,
  },
  {
    module_id: "desarrollo-frontend",
    module_name: "Desarrollo Frontend",
    category: "Desarrollo",
    include: "no",
    quantity: 0,
    complexity: "medium",
    base_cost: 85000,
  },
  {
    module_id: "backend-api",
    module_name: "Backend / API",
    category: "Desarrollo",
    include: "no",
    quantity: 0,
    complexity: "medium",
    base_cost: 95000,
  },
  {
    module_id: "ecommerce",
    module_name: "E-commerce / Carrito de compras",
    category: "Ecommerce",
    include: "no",
    quantity: 0,
    complexity: "medium",
    base_cost: 120000,
  },
  {
    module_id: "seo-busqueda",
    module_name: "SEO / Optimización de búsqueda",
    category: "Marketing",
    include: "no",
    quantity: 0,
    complexity: "medium",
    base_cost: 45000,
  },
];

/**
 * Servicios mensuales predefinidos.
 * Cada plan incluye horas y SLA diferenciados.
 */
export const SERVICIOS_MENSUALES_PREDEFINIDOS: readonly MonthlyService[] = [
  {
    service_id: "mantenimiento-esencial",
    service_name: "Mantenimiento",
    plan_name: "Esencial",
    include: "no",
    monthly_value: 85000,
    hours_included: 2,
    sla: "48h",
  },
  {
    service_id: "mantenimiento-profesional",
    service_name: "Mantenimiento",
    plan_name: "Profesional",
    include: "no",
    monthly_value: 150000,
    hours_included: 5,
    sla: "24h",
  },
  {
    service_id: "mantenimiento-enterprise",
    service_name: "Mantenimiento",
    plan_name: "Enterprise",
    include: "no",
    monthly_value: 280000,
    hours_included: 10,
    sla: "8h",
  },
];

/**
 * Configuración estática para el cotizador avanzado.
 */
export const CONFIGURACION_AVANZADA = {
  schema_version: "1.0.0",
  currency: "CLP",
  urgencia: {
    low: { multiplier: 0.9, label: "Baja" },
    medium: { multiplier: 1.0, label: "Media" },
    high: { multiplier: 1.25, label: "Alta" },
  },
  complejidad: {
    low: { label: "Baja", factor: 0.8 },
    medium: { label: "Media", factor: 1.0 },
    high: { label: "Alta", factor: 1.4 },
  },
};
