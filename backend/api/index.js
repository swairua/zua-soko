const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Database connection (will be configured for cloud database)
let pool;

// Initialize database connection for serverless
async function initializeDatabase() {
  if (pool) return pool;

  const { Pool } = require("pg");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 3, // Reduced for serverless
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

// Database query helper
async function query(text, params = []) {
  const db = await initializeDatabase();
  return await db.query(text, params);
}

// Database transaction helper
async function transaction(callback) {
  const db = await initializeDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "demo-secret", (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ==================== AUTH ROUTES ====================

app.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    const trimmedPhone = phone.trim();
    const result = await query("SELECT * FROM users WHERE phone = $1", [
      trimmedPhone,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || "demo-secret",
      { expiresIn: "7d" },
    );

    res.json({
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, county } =
      req.body;

    if (!firstName || !lastName || !phone || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await query(
      "SELECT id FROM users WHERE phone = $1 OR email = $2",
      [phone, email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);

    const result = await query(
      `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `,
      [
        firstName,
        lastName,
        email,
        phone,
        hashedPassword,
        role,
        county,
        true,
        role !== "FARMER",
      ],
    );

    const userId = result.rows[0].id;

    if (role === "FARMER") {
      await query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2)", [
        userId,
        0.0,
      ]);
    }

    const token = jwt.sign(
      { userId, phone, role },
      process.env.JWT_SECRET || "demo-secret",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
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
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== PRODUCTS ROUTES ====================

app.get("/products", async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, c.title as consignment_title, u.first_name, u.last_name
      FROM products p
      JOIN consignments c ON p.consignment_id = c.id
      JOIN users u ON c.farmer_id = u.id
      WHERE p.is_active = true AND p.stock_quantity > 0
      ORDER BY p.created_at DESC
    `);

    res.json({ products: result.rows });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== CONSIGNMENTS ROUTES ====================

app.get(
  "/consignments",
  authenticateToken,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT c.*, u.first_name, u.last_name, u.phone
      FROM consignments c
      JOIN users u ON c.farmer_id = u.id
      ORDER BY c.created_at DESC
    `);

      res.json({ consignments: result.rows });
    } catch (error) {
      console.error("Fetch consignments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.post(
  "/consignments",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        quantity,
        unit,
        bidPricePerUnit,
        images,
        location,
        harvestDate,
        expiryDate,
      } = req.body;

      const result = await query(
        `
      INSERT INTO consignments (farmer_id, title, description, category, quantity, unit, bid_price_per_unit, images, location, harvest_date, expiry_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `,
        [
          req.user.userId,
          title,
          description,
          category,
          quantity,
          unit,
          bidPricePerUnit,
          images,
          location,
          harvestDate,
          expiryDate,
          "PENDING",
        ],
      );

      const consignmentId = result.rows[0].id;
      res.status(201).json({
        message: "Consignment created successfully",
        id: consignmentId,
      });
    } catch (error) {
      console.error("Create consignment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Export the Express app for Vercel
module.exports = app;
