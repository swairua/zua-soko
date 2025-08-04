const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Simple hash function
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to PostgreSQL database");
    release();
  }
});

// Authentication endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE phone = $1 OR email = $1",
      [phone.trim()]
    );

    const user = result.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        county: user.county,
        verified: user.verified,
        registrationFeePaid: user.registration_fee_paid,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, county } = req.body;

    if (!firstName || !lastName || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE phone = $1 OR email = $2",
      [phone, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [firstName, lastName, email, phone, hashedPassword, role, county, true, role !== "FARMER"]
    );

    const userId = result.rows[0].id;

    if (role === "FARMER") {
      await pool.query(
        "INSERT INTO wallets (user_id, balance) VALUES ($1, $2)",
        [userId, 0.0]
      );
    }

    const token = jwt.sign(
      { userId, phone, role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        firstName,
        lastName,
        email,
        phone,
        role,
        county,
        verified: true,
        registrationFeePaid: role !== "FARMER",
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Products endpoints
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, category, price_per_unit, unit, description, 
             stock_quantity, is_featured, farmer_name, farmer_county, created_at
      FROM products 
      WHERE is_active = true AND stock_quantity > 0
      ORDER BY is_featured DESC, created_at DESC
    `);

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (err) {
    console.error("Products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Marketplace endpoints
app.get("/api/marketplace/products", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, county, search } = req.query;

    let query = `
      SELECT p.id, p.name, p.category, p.price_per_unit, p.unit, p.description,
             p.stock_quantity, COALESCE(p.is_featured, false) as is_featured,
             p.farmer_name, p.farmer_county, p.created_at, p.images
      FROM products p
      WHERE p.is_active = true AND p.stock_quantity > 0
    `;

    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
    }

    if (county) {
      paramCount++;
      query += ` AND p.farmer_county = $${paramCount}`;
      params.push(county);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
      },
    });
  } catch (err) {
    console.error("Marketplace products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/marketplace/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category
      FROM products
      WHERE category IS NOT NULL
      ORDER BY category
    `);

    const categories = result.rows.map(row => row.category);

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error("Categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

app.get("/api/marketplace/counties", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT farmer_county as county
      FROM products
      WHERE farmer_county IS NOT NULL
      ORDER BY farmer_county
    `);

    const counties = result.rows.map(row => row.county);

    res.json({
      success: true,
      counties,
    });
  } catch (err) {
    console.error("Counties error:", err);
    res.status(500).json({ message: "Failed to fetch counties" });
  }
});

// Status endpoint
app.get("/api/status", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW() as current_time");

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
      database_type: "postgresql",
      database_time: dbResult.rows[0].current_time,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message,
      environment: process.env.NODE_ENV || "development",
    });
  }
});

// Serve static files only if dist directory exists (production)
const distPath = path.join(__dirname, "dist");
const frontendDistPath = path.join(__dirname, "frontend", "dist");

if (require('fs').existsSync(distPath)) {
  console.log("📁 Serving static files from dist/");
  app.use(express.static(distPath));
} else if (require('fs').existsSync(frontendDistPath)) {
  console.log("📁 Serving static files from frontend/dist/");
  app.use(express.static(frontendDistPath));
} else {
  console.log("⚠️ No dist folder found - running in API-only mode");
}

// Catch all handler for SPA (only if not an API route)
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Try to serve index.html if available
  const indexPath = require('fs').existsSync(distPath)
    ? path.join(distPath, "index.html")
    : require('fs').existsSync(frontendDistPath)
    ? path.join(frontendDistPath, "index.html")
    : null;

  if (indexPath) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: "Zuasoko API Server",
      status: "running",
      note: "Frontend not built yet - run 'npm run build' first"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 Shutting down gracefully...");
  pool.end(() => {
    console.log("✅ Database connections closed");
    process.exit(0);
  });
});
