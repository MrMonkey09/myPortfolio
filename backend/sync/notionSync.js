// Sync SQLite → Notion con retry y observabilidad
import { updateSyncStatus } from "../db/quotesRepository.js";

const RETRY_BACKOFF_MS = [1000, 3000, 7000];
const MAX_RETRIES = 3;

// Notion API configuration — read inside functions to ensure env is loaded

function isTransientError(error) {
  const status = Number(error?.status ?? error?.statusCode ?? 0);
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  
  const code = String(error?.code ?? "");
  return ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(code);
}

function extractNotionPayload(quoteRecord) {
  // Parse solo los campos necesarios para visualización comercial (Decision Log §7.3)
  let totals = {};
  try {
    totals = JSON.parse(quoteRecord.totals_json || "{}");
  } catch {
    // ignore parse errors
  }

  return {
    // Identificación
    quote_id: quoteRecord.quote_id,
    trace_id: quoteRecord.trace_id,
    created_at: quoteRecord.created_at,
    
    // Versionado
    schema_version: quoteRecord.schema_version,
    pricing_config_version: quoteRecord.pricing_config_version,
    
    // Datos comerciales (SOLO datos clave)
    origin: quoteRecord.origin,
    project_type: quoteRecord.project_type,
    project_state: quoteRecord.project_state,
    currency: quoteRecord.currency,
    
    // Métricas clave
    total_project: totals.total_project || 0,
    total_monthly: totals.total_monthly || 0,
    estimated_min: totals.estimated_min || 0,
    estimated_max: totals.estimated_max || 0,
    confidence_level: totals.confidence_level || "unknown",
    
    // Enriquecimiento v2.0.0
    client_data: totals.client_data || null,
  };
}

async function syncQuoteToNotion(quoteRecord) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN?.trim();
  const NOTION_DATABASE_ID = process.env.NOTION_DB_ID?.trim();

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    throw new Error("Missing Notion credentials in environment (NOTION_TOKEN or NOTION_DB_ID)");
  }

  const quoteId = quoteRecord.quote_id;
  console.log(`[SYNC] Starting sync for quote ${quoteId}...`);
  
  const payload = extractNotionPayload(quoteRecord);
  
  // Get Notion client
  const { Client } = await import("@notionhq/client");
  const notion = new Client({ auth: NOTION_TOKEN });
  
  // Create Notion page
  const titleValue = `Quote ${quoteId} | ${new Date(payload.created_at).toLocaleDateString()}`;
  const content = JSON.stringify(payload, null, 2);
  const chunks = content.match(/.{1,1900}/g) || [content];
  
  const blocks = chunks.map(chunk => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: chunk } }],
    },
  }));
  
  // Detect primary title property (could be "Name", "Nombre", etc.)
  const dbConfig = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID });
  const titleProp = Object.keys(dbConfig.properties).find(
    key => dbConfig.properties[key].type === 'title'
  ) || "Name";

  // 3. Prepare properties mapping (Dynamic based on DB schema)
  const meta = JSON.parse(quoteRecord.meta_json || "{}");
  const contact = meta.contact || {};
  
  const properties = {
    [titleProp]: {
      title: [{ text: { content: titleValue.slice(0, 2000) } }],
    },
  };

  // Helper to safely add properties if they exist in schema
  const dbProps = dbConfig.properties;
  const addProp = (notionName, type, value) => {
    // Buscar coincidencia exacta o por lowercase
    const actualName = Object.keys(dbProps).find(
      k => k.toLowerCase() === notionName.toLowerCase()
    );
    
    if (actualName && value) {
      const propType = dbProps[actualName].type;
      
      if (propType === 'email') {
        properties[actualName] = { email: value };
      } else if (propType === 'phone_number') {
        properties[actualName] = { phone_number: value };
      } else if (propType === 'url') {
        properties[actualName] = { url: value };
      } else if (propType === 'select') {
        // Para select, el valor debe existir o ser un string simple
        properties[actualName] = { select: { name: value.slice(0, 100) } };
      } else if (propType === 'rich_text') {
        properties[actualName] = { rich_text: [{ text: { content: value.slice(0, 2000) } }] };
      }
    }
  };

  // Mapear campos solicitados por el usuario
  addProp("Nombre", "rich_text", contact.nombre);
  addProp("Correo electronico", "email", contact.email);
  addProp("Telefono", "phone_number", contact.telefono);
  addProp("Mensaje", "rich_text", contact.mensaje);
  addProp("Red social preferente", "select", contact.red_social);
  addProp("Servicio de interes", "select", contact.servicio);

  // Mapear campos enriquecidos v2.0.0
  if (meta.client_data) {
    const cd = meta.client_data;
    addProp("Empresa", "rich_text", cd.empresa);
    addProp("RUT", "rich_text", cd.rut);
    addProp("Prioridad", "select", cd.prioridad);
    addProp("Fecha Deseada", "rich_text", cd.fecha_deseada);
    addProp("Objetivo", "rich_text", cd.objetivo_principal);
  }

  const page = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties,
    children: blocks.slice(0, 20),
  });
  
  console.log(`[SYNC] Success: created Notion page ${page.id} for quote ${quoteId}`);
  
  // Update sync status to synced
  await updateSyncStatus(quoteId, { status: "synced", attempts: 0, error: null });
  
  return page;
}

export async function syncWithRetry(quoteRecord) {
  let lastError;
  const currentAttempts = Number(quoteRecord.sync_attempts ?? 0);
  
  for (let attempt = currentAttempts; attempt < MAX_RETRIES; attempt++) {
    try {
      await syncQuoteToNotion(quoteRecord);
      return; // Success
    } catch (error) {
      lastError = error;
      
      if (!isTransientError(error) || attempt === MAX_RETRIES - 1) {
        // Permanent error or max retries reached
        await updateSyncStatus(quoteRecord.quote_id, {
          status: "failed",
          attempts: attempt + 1,
          error: `${error?.code ?? "UNKNOWN"}: ${error?.message ?? "Unknown error"}`,
        });
        return;
      }
      
      // Update status to retrying
      await updateSyncStatus(quoteRecord.quote_id, {
        status: "retrying",
        attempts: attempt + 1,
        error: `Transient error, retry ${attempt + 1}/${MAX_RETRIES}: ${error?.message}`,
      });
      
      // Wait with backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_MS[attempt]));
    }
  }
  
  // If we reach here, all retries failed
  await updateSyncStatus(quoteRecord.quote_id, {
    status: "failed",
    attempts: MAX_RETRIES,
    error: lastError?.message ?? "Max retries exceeded",
  });
}
