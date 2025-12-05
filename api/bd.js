import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: "./api/dev.env" }); // Cargar variables de entorno

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function getData() {
  console.log({ DB: process.env.NOTION_DB_ID });
  const results = await notion.databases.query({
    database_id: process.env.NOTION_DB_ID,
  });
  console.log(JSON.stringify(results, null, 2));
  return results;
}

export async function addPageToDB(pageProperties) {
  const response = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DB_ID,
    },
    properties: { ...pageProperties },
  });
  console.log(response);
}
