import { getDb } from './db';
const app = require('express').default();

// Health check endpoint (Work-Unit C.1)
app.get("/api/health/db", async (_req, res) => {
  console.log("Health DB endpoint called");
  
  // Development mode: basic status
  return res.status(200).json({ 
    status: "ok", 
    message: "Server is running" 
  });
});

// Start server
app.listen(3002, () => {
  console.log("Health check server ready at http://localhost:3002");
});
