import express from "express";
import cors from "cors";
import notionRoutes from "./notion.routes.js";
const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Portafolio activa 🚀");
});

app.use("/api/notion", notionRoutes);

app.listen(port, () => {
  console.log(`Servidor API iniciado en http://localhost:${port}`);
});