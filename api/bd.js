import { Client } from "@notionhq/client";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config({ path: "./api/dev.env" }); // Cargar variables de entorno

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function getNotionData() {
  console.log({DB: process.env.NOTION_DB_ID, Token: process.env.NOTION_TOKEN});
  const results = await notion.databases.query({
    database_id: process.env.NOTION_DB_ID,
  });
  console.log(JSON.stringify(results, null, 2));
  return results;
}

async function main() {
  try {
    await getNotionData();
  } catch (error) {
    console.error("Error fetching Notion data:", error);
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Presiona Enter para salir...", () => {
    rl.close();
    process.exit(0);
  });
}

main();
