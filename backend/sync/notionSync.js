// Sync SQLite → Notion con retry y observabilidad
import { updateSyncStatus } from "../db/quotesRepository.js";

const RETRY_BACKOFF_MS = [1000, 3000, 7000];
const MAX_RETRIES = 3;

// Notion API configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DB_ID;

function isTransientError(error) {
  const status = Number(error?.status ?? error?.statusCode ?? 0);
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  
  const code = String(error?.code ?? "");
  return ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(code);
}

function extractNotionPayload(quoteRecord) {
  // Parse JSON fields
  const totals = JSON.parse(quoteRecord.totals_json);
  const context = JSON.parse(quoteRecord.input_json);
  
  return {
    quote_id: quoteRecord.quote_id,
    trace_id: quoteRecord.trace_id,
    created_at: quoteRecord.created_at,
    schema_version: quoteRecord.schema_version,
    pricing_config_version: quoteRecord.pricing_config_version,
    origin: quoteRecord.origin,
    project_type: quoteRecord.project_type,
    total_project: totals.total_project,
    total_monthly: totals.total_monthly,
    estimated_min: totals.estimated_min,
    estimated_max: totals.estimated_max,
    confidence_level: totals.confidence_level,
  };
}

async function syncQuoteToNotion(quoteRecord) {
  const quoteId = quoteRecord.quote_id;
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
  
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: titleValue.slice(0, 2000) } }],
      },
    },
    children: blocks.slice(0, 40),
  });
  
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
