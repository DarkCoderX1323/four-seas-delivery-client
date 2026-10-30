
import express from "express";
import pool from "./config/database";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Ruta principal
app.get("/", (_req, res) => {
  res.json({
    message: "Four Seas API",
    status: "running"
  });
});

// Verificación de conexión con PostgreSQL
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS server_time, current_database() AS database"
    );

    res.status(200).json({
      status: "healthy",
      database: result.rows[0].database,
      serverTime: result.rows[0].server_time
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      status: "unavailable",
      message: "Database connection failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Four Seas API running on port ${PORT}`);
});

