import type {
  ApiErrorEnvelope,
  QuoteLeadRequest,
  QuoteLeadResponse,
  QuoteSimulateRequest,
  QuoteSimulateResponse,
} from "../types";

// Validar VITE_BASE_URL al inicio
const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";
if (!BASE_URL) {
  console.warn(
    "[api.ts] VITE_BASE_URL no está definido. Los requests usarán path relativo. " +
    "Si el proxy no está configurado, las llamadas a API pueden fallar."
  );
}

export class ApiRequestError extends Error {
  readonly traceId?: string;

  constructor(message: string, traceId?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.traceId = traceId;
  }
}

/**
 * Llama a la API backend con endpoint y opciones.
 * @param {string} endpoint - Ejemplo: '/api/notion'
 * @param {object} options - fetch options (headers, method, body, etc)
 * @returns {Promise<any>} - La respuesta en JSON
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_API_KEY || "",
  };
  options.headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const resp = await fetch(url, options);

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(error || "Error en la petición");
  }

  return resp.json();
}

function parseApiError(rawText: string): { message: string; traceId?: string } {
  try {
    const parsed = JSON.parse(rawText) as ApiErrorEnvelope;
    const baseMessage = parsed?.error?.message || "Error en la petición";
    const firstDetail = parsed?.error?.details?.[0]?.message;
    const traceId = parsed?.error?.trace_id;

    if (firstDetail) return { message: `${baseMessage}. ${firstDetail}`, traceId };
    return { message: baseMessage, traceId };
  } catch {
    return { message: rawText || "Error en la petición" };
  }
}

export async function simulateQuickQuote(
  payload: QuoteSimulateRequest,
): Promise<QuoteSimulateResponse> {
  const url = `${BASE_URL}/api/quotes/simulate`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY || "",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const parsedError = parseApiError(errorText);
    throw new ApiRequestError(parsedError.message, parsedError.traceId);
  }

  return (await response.json()) as QuoteSimulateResponse;
}

export async function submitQuoteLead(
  payload: QuoteLeadRequest,
  traceId?: string,
): Promise<QuoteLeadResponse> {
  // Mapear campos name->nombre, phone->telefono para compatibilidad con backend PHP
  const contact = payload.contact || {};
  const mappedPayload = {
    ...payload,
    contact: {
      nombre: contact.name || contact.nombre || "",
      email: contact.email || "",
      telefono: contact.phone || contact.telefono || "",
      red_social: contact.preferred_channel || contact.red_social || "",
      mensaje: payload.message || "",
      servicio: contact.servicio || "",
    },
    quote_ref: payload.quote_ref,
  };
  delete (mappedPayload as any).message;
  delete (mappedPayload as any).pricing_config_version;
  delete (mappedPayload as any).schema_version;

  const url = `${BASE_URL}/api/quotes/contact`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY || "",
      ...(traceId ? { "x-trace-id": traceId } : {}),
    },
    body: JSON.stringify(mappedPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const parsedError = parseApiError(errorText);
    throw new ApiRequestError(parsedError.message, parsedError.traceId);
  }

  return (await response.json()) as QuoteLeadResponse;
}

/**
 * Enviar formulario de contacto legacy — ahora apunta al endpoint PHP unificado
 */
export async function notionCommit(formulario: string) {
  return apiFetch(`/api/quotes/contact`, {
    method: "POST",
    headers: { "x-api-key": import.meta.env.VITE_API_KEY || "" },
    body: formulario,
  });
}
