const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

// Test database connection on startup
pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("✅ Database connected successfully at:", result.rows[0].now);
  })
  .catch((err) => {
    console.warn("⚠️ Database connection failed:", err.message);
  });

// Health check endpoint
app.get("/api/health", async (req, res) => {
  let dbStatus = "disconnected";
  try {
    await pool.query("SELECT NOW()");
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "error: " + error.message;
  }

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
  });
});

// Products endpoint
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, category, price_per_unit, unit, description, 
             stock_quantity, is_featured, farmer_name, farmer_county, created_at
      FROM products 
      WHERE is_active = true AND stock_quantity > 0
      ORDER BY is_featured DESC, created_at DESC
    `);

    res.json({ products: result.rows });
  } catch (error) {
    console.warn("Products query failed:", error.message);
    // Fallback data
    res.json({
      products: [
        {
          id: 1,
          name: "Fresh Tomatoes",
          category: "Vegetables",
          price_per_unit: 130,
          unit: "kg",
          description: "Organic red tomatoes, Grade A quality",
          stock_quantity: 85,
          is_featured: true,
          farmer_name: "Demo Farmer",
          farmer_county: "Nakuru",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Sweet Potatoes",
          category: "Root Vegetables",
          price_per_unit: 80,
          unit: "kg",
          description: "Fresh sweet potatoes, rich in nutrients",
          stock_quantity: 45,
          is_featured: true,
          farmer_name: "Demo Farmer",
          farmer_county: "Meru",
          created_at: new Date().toISOString(),
        },
      ],
    });
  }
});

// Demo endpoints for backwards compatibility
app.get("/api/demo/products", (req, res) => {
  res.json({
    products: [
      {
        id: "demo-1",
        name: "Demo Tomatoes",
        category: "Vegetables",
        price_per_unit: 130,
        unit: "kg",
        description: "Demo organic tomatoes",
        stock_quantity: 85,
        is_featured: true,
        farmer_name: "Demo Farmer",
        farmer_county: "Nakuru",
        created_at: new Date().toISOString(),
      },
    ],
  });
});

app.post("/api/demo/login", (req, res) => {
  const { phone, password } = req.body;

  if (phone && password) {
    res.json({
      message: "Demo login successful",
      token: "demo-token-" + Date.now(),
      user: {
        id: "demo-user",
        firstName: "Demo",
        lastName: "User",
        email: "demo@example.com",
        phone,
        role: "CUSTOMER",
        county: "Demo County",
        verified: true,
        registrationFeePaid: true,
      },
    });
  } else {
    res.status(400).json({ error: "Phone and password required" });
  }
});

// Catch-all for other API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET  /api/health");
  console.log("  GET  /api/products");
  console.log("  GET  /api/demo/products");
  console.log("  POST /api/demo/login");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔚 Shutting down API server...");
  pool.end().then(() => {
    console.log("Database connections closed.");
    process.exit(0);
  });
});
