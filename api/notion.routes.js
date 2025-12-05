import { Router } from "express";
import dotenv from "dotenv";
import { addPageToDB, getData } from "./bd.js";
dotenv.config({ path: "./api/dev.env" });

const router = Router();

// Middleware de protección básica por API KEY (puedes mejorarlo más adelante)
router.use((req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
});

// Endpoint protegido con API Key
router.get("/mostrar", async (req, res) => {
  try {
    const results = await getData();
    res.json(results);
  } catch (error) {
    console.error("Error consultando Notion:", error);
    res.status(500).json({ error: "Error consultando Notion" });
  }
});

/* Añadir Pagina */
router.post("/enviar", async (req, res) => {
  try {
    const formulario = req.body;
    console.log("Datos recibidos en backend:", formulario);
    const results = await addPageToDB({
      Nombre: {
        type: "title",
        title: [{ type: "text", text: { content: formulario["Nombre"] } }],
      },
      "Correo electrónico": {
        type: "email",
        email: formulario["Correo"],
      },
      Teléfono: {
        type: "phone_number",
        phone_number: formulario["N° de Contacto"],
      },
      "Red Social Preferente": {
        type: "url",
        url: formulario["Red Social Preferente"] || null,
      },
      Mensaje: {
        type: "rich_text",
        rich_text: [
          {
            type: "text",
            text: {
              content: formulario["Mensaje"],
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: formulario["Mensaje"],
            href: null,
          },
        ],
      },
    });
    res.json(formulario);
  } catch (error) {
    console.error("Error consultando Notion:", error);
    res.status(500).json({ error: "Error consultando Notion" });
  }
});

export default router;
