// Utilitario para llamadas a la API del backend (Express)
const API_BASE = "http://localhost:3001"; // Usa variables de entorno si lo deseas

/**
 * Llama a la API backend con endpoint y opciones.
 * @param {string} endpoint - Ejemplo: '/api/notion'
 * @param {object} options - fetch options (headers, method, body, etc)
 * @returns {Promise<any>} - La respuesta en JSON
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    // "x-api-key": "TU_API_KEY", // Descomenta y agrega tu API key si tu endpoint es privado
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

// Ejemplo específico para obtener datos de Notion
export async function fetchNotionData(id = "") {
  // Descomenta la línea de API key y úsala si tu endpoint lo requiere
  // const API_KEY = "TU_API_KEY";
  return apiFetch(`/api/notion/cerebro${id}`, {
    method: "GET",
    headers: { "x-api-key": "MI_CLAVE_SECRETA_123" },
  });
}
