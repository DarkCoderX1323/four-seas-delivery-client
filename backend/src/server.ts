import userRoutes from "./routes/user.routes";
import express from "express";
import pool from "./config/database";

import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// ======================================================
// MIDDLEWARES
// ======================================================

app.use(express.json());

// ======================================================
// ROUTES
// ======================================================

// Main route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Four Seas API",
    status: "running"
  });
});

// Database health check
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        NOW() AS server_time,
        current_database() AS database,
        current_schema() AS schema,
        current_user AS database_user,
        to_regclass('public.producto') AS product_table,
        to_regclass('public.categoria') AS category_table
    `);

    res.status(200).json({
      status: "healthy",
      connection: result.rows[0]
    });

  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      status: "unavailable",
      message: "Database connection failed"
    });
  }
});

// Product routes
app.use("/api/products", productRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

app.use("/api/users", userRoutes);

// ======================================================
// SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(`Four Seas API running on port ${PORT}`);
});