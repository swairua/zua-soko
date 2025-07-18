const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// Simple hash function using built-in crypto
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Database connection - prioritize Render.com database
let pool;
let dbConnectionAttempted = false;

async function getDB() {
  if (!pool && !dbConnectionAttempted) {
    dbConnectionAttempted = true;
    try {
      // Use Render.com database URL if available, fallback to env var
      const databaseUrl =
        process.env.DATABASE_URL ||
        "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db";

      pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 10000,
      });

      // Test connection
      await pool.query("SELECT NOW()");
      console.log("✅ Connected to Render.com PostgreSQL database");
    } catch (error) {
      console.warn("⚠️ Database connection failed:", error.message);
      pool = null; // Reset pool so we don't try to use failed connection
    }
  }
  return pool;
}

async function query(text, params = []) {
  try {
    const db = await getDB();
    if (!db) {
      throw new Error("Database not available");
    }
    return await db.query(text, params);
  } catch (error) {
    console.warn("Database query failed:", error.message);
    throw error;
  }
}

// Safe database health check
async function checkDatabaseHealth() {
  try {
    const db = await getDB();
    if (!db) {
      return "disconnected";
    }

    await db.query("SELECT NOW()");
    return "connected";
  } catch (error) {
    return "error: " + error.message.substring(0, 50);
  }
}

// Auth middleware helper functions
const authenticateToken = async (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET || "zuasoko-render-secret",
    );
    return user;
  } catch (err) {
    throw new Error("Invalid token");
  }
};

// Fallback demo data
const fallbackProducts = [
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
  },
];

// Main handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = req.url || "";
  const { method } = req;

  try {
    // Health check with safe database status
    if (url === "/api/health" && method === "GET") {
      const dbStatus = await checkDatabaseHealth();

      return res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: dbStatus,
        version: "1.0.0",
      });
    }

    // Auth endpoints - prioritize real database
    if (url === "/api/auth/login" && method === "POST") {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res
          .status(400)
          .json({ error: "Phone and password are required" });
      }

      try {
        // Try real database first
        const result = await query(
          "SELECT * FROM users WHERE phone = $1 OR email = $1",
          [phone.trim()],
        );
        const user = result.rows[0];

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = verifyPassword(password, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
          { userId: user.id, phone: user.phone, role: user.role },
          process.env.JWT_SECRET || "zuasoko-render-secret",
          { expiresIn: "7d" },
        );

        return res.json({
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
        console.warn("Database login failed, trying demo:", error.message);
        // Demo fallback - accepts specific demo credentials
        if (
          (phone === "admin@zuasoko.com" && password === "admin123") ||
          (phone === "john@farmer.com" && password === "farmer123") ||
          (phone === "jane@customer.com" && password === "customer123")
        ) {
          const demoRole = phone.includes("admin")
            ? "ADMIN"
            : phone.includes("farmer")
              ? "FARMER"
              : "CUSTOMER";

          const token = jwt.sign(
            { userId: "demo-" + demoRole.toLowerCase(), phone, role: demoRole },
            process.env.JWT_SECRET || "zuasoko-render-secret",
            { expiresIn: "7d" },
          );

          return res.json({
            message: "Demo login successful",
            token,
            user: {
              id: "demo-" + demoRole.toLowerCase(),
              firstName: "Demo",
              lastName: "User",
              email: phone,
              phone,
              role: demoRole,
              county: "Demo County",
              verified: true,
              registrationFeePaid: true,
            },
          });
        }

        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    // Register endpoint
    if (url === "/api/auth/register" && method === "POST") {
      const { firstName, lastName, email, phone, password, role, county } =
        req.body;

      if (!firstName || !lastName || !phone || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      try {
        // Check if user exists
        const existingUser = await query(
          "SELECT id FROM users WHERE phone = $1 OR email = $2",
          [phone, email],
        );

        if (existingUser.rows.length > 0) {
          return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = hashPassword(password);

        const result = await query(
          `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
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

        // Create wallet for farmers
        if (role === "FARMER") {
          await query(
            "INSERT INTO wallets (user_id, balance) VALUES ($1, $2)",
            [userId, 0.0],
          );
        }

        const token = jwt.sign(
          { userId, phone, role },
          process.env.JWT_SECRET || "zuasoko-render-secret",
          { expiresIn: "7d" },
        );

        return res.status(201).json({
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
        return res.status(500).json({ error: "Registration failed" });
      }
    }

    // Products endpoint - prioritize real database
    if (url === "/api/products" && method === "GET") {
      try {
        const result = await query(`
          SELECT id, name, category, price_per_unit, unit, description, 
                 stock_quantity, is_featured, farmer_name, farmer_county, created_at
          FROM products 
          WHERE is_active = true AND stock_quantity > 0
          ORDER BY is_featured DESC, created_at DESC
        `);

        return res.json({ products: result.rows });
      } catch (error) {
        console.warn(
          "Database products query failed, using fallback:",
          error.message,
        );
        return res.json({ products: fallbackProducts });
      }
    }

    // Protected endpoints (require authentication)
    if (url.startsWith("/api/wallet") || url.startsWith("/api/orders")) {
      try {
        const user = await authenticateToken(req);
        req.user = user;
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    }

    // Wallet endpoints
    if (url === "/api/wallet/balance" && method === "GET") {
      try {
        const result = await query(
          "SELECT balance FROM wallets WHERE user_id = $1",
          [req.user.userId],
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Wallet not found" });
        }

        return res.json({ balance: parseFloat(result.rows[0].balance) });
      } catch (error) {
        console.warn("Wallet query failed:", error.message);
        return res.json({ balance: 0 });
      }
    }

    // Demo endpoints for backwards compatibility
    if (url === "/api/demo/products" && method === "GET") {
      return res.json({ products: fallbackProducts });
    }

    if (url === "/api/demo/login" && method === "POST") {
      const { phone, password } = req.body;

      if (phone && password) {
        const token = jwt.sign(
          { userId: "demo-user", phone, role: "CUSTOMER" },
          process.env.JWT_SECRET || "zuasoko-render-secret",
          { expiresIn: "7d" },
        );

        return res.json({
          message: "Demo login successful",
          token,
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
      }

      return res.status(400).json({ error: "Phone and password required" });
    }

    // Default fallback
    return res.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
