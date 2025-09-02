import { Router } from "express";
import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: "./api/dev.env" });

const router = Router();
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Middleware de protección básica por API KEY (puedes mejorarlo más adelante)
router.use((req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
});

// Endpoint protegido con API Key
router.get("/cerebro", async (req, res) => {
  try {
    const results = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
    });
    res.json(results);
  } catch (error) {
    console.error("Error consultando Notion:", error);
    res.status(500).json({ error: "Error consultando Notion" });
  }
});

router.post("/cerebro/<id>", async (req, res) => {
  const dbID = req.params.id;
  try {
    const results = await notion.databases.query({
      database_id: dbID,
    });
    res.json(results);
  } catch (error) {
    console.error("Error obteniendo página de Notion:", error);
    res.status(500).json({ error: "Error obteniendo página de Notion" });
  }
});

export default router;
