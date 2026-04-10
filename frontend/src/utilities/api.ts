/**
 * Llama a la API backend con endpoint y opciones.
 * @param {string} endpoint - Ejemplo: '/api/notion'
 * @param {object} options - fetch options (headers, method, body, etc)
 * @returns {Promise<any>} - La respuesta en JSON
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${import.meta.env.VITE_BASE_URL || ""}${endpoint}`;
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
export async function notionCommit(formulario: string) {
  return apiFetch(`/enviar.php`, {
    method: "POST",
    headers: { "x-api-key": import.meta.env.VITE_API_KEY || "" },
    body: formulario,
  });
}
