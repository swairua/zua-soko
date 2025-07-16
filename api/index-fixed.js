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

// Database connection
let pool;
async function getDB() {
  if (!pool) {
    // Use environment variable or fallback
    const isRenderEnvironment =
      process.env.RENDER || process.env.RENDER_SERVICE_ID;
    const databaseUrl = isRenderEnvironment
      ? process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL
      : process.env.DATABASE_URL ||
        "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db";

    console.log("🚀 ZUASOKO DATABASE CONNECTION");
    console.log("================================");
    console.log("🔗 Database URL:", databaseUrl.replace(/:[^:]*@/, ":****@"));
    console.log("🏗️ Render Environment:", isRenderEnvironment ? "YES" : "NO");
    console.log("================================");

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection and setup tables if needed
    try {
      console.log("🔄 Testing database connection...");
      const result = await pool.query("SELECT NOW() as current_time");
      console.log("✅ Database connected at:", result.rows[0].current_time);

      // Check if users table exists, create if not
      try {
        const userCheck = await pool.query(
          "SELECT COUNT(*) FROM users LIMIT 1",
        );
        console.log(
          "📊 Users table exists, user count:",
          userCheck.rows[0].count,
        );
      } catch (tableError) {
        console.log("⚠️ Users table doesn't exist, creating...");
        await setupEmergencyTables();
      }
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
    }
  }
  return pool;
}

async function setupEmergencyTables() {
  try {
    console.log("🔧 Setting up emergency database tables...");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
          county VARCHAR(100),
          verified BOOLEAN DEFAULT false,
          registration_fee_paid BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          price_per_unit DECIMAL(10,2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          stock_quantity INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          farmer_name VARCHAR(200),
          farmer_county VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert admin user
    const adminPasswordHash = hashPassword("password123");
    await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (phone) 
      DO UPDATE SET 
          password_hash = $5,
          verified = $8,
          registration_fee_paid = $9
    `,
      [
        "Admin",
        "User",
        "admin@zuasoko.com",
        "+254712345678",
        adminPasswordHash,
        "ADMIN",
        "Nairobi",
        true,
        true,
      ],
    );

    // Insert demo products
    await pool.query(
      `
      INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, is_featured, farmer_name, farmer_county) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9),
      ($10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT DO NOTHING
    `,
      [
        "Fresh Tomatoes",
        "Organic red tomatoes, Grade A quality",
        "Vegetables",
        130.0,
        "kg",
        85,
        true,
        "Demo Farmer",
        "Nakuru",
        "Sweet Potatoes",
        "Fresh sweet potatoes, rich in nutrients",
        "Root Vegetables",
        80.0,
        "kg",
        45,
        true,
        "Demo Farmer",
        "Meru",
      ],
    );

    console.log("✅ Emergency tables and data created successfully!");
  } catch (error) {
    console.error("❌ Error setting up emergency tables:", error);
  }
}

async function query(text, params = []) {
  try {
    const db = await getDB();
    return await db.query(text, params);
  } catch (error) {
    console.error("❌ Database query failed:", error.message);
    throw error;
  }
}

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
  try {
    console.log(`🌐 API Request: ${req.method} ${req.url}`);

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const url = req.url || "";
    const { method } = req;

    // Health check
    if (url === "/api/health" && method === "GET") {
      console.log("🔍 Health check requested");
      let dbStatus = "disconnected";
      let dbDetails = {};

      try {
        const startTime = Date.now();
        const result = await query("SELECT NOW() as current_time");
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        dbStatus = "connected";
        dbDetails = {
          response_time_ms: responseTime,
          current_time: result.rows[0].current_time,
          host: process.env.DB_HOST || "unknown",
        };

        console.log(
          "✅ Health check - Database connected in",
          responseTime + "ms",
        );
      } catch (error) {
        dbStatus = "error";
        dbDetails = { error_message: error.message };
        console.error("❌ Health check - Database error:", error.message);
      }

      return res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: dbStatus,
        database_details: dbDetails,
      });
    }

    // Login endpoint with comprehensive error handling
    if (url === "/api/auth/login" && method === "POST") {
      console.log("🚀 LOGIN ATTEMPT STARTED");
      console.log("================================");

      try {
        if (!req.body) {
          console.error("❌ No request body found");
          return res.status(400).json({
            error: "Request body is required",
          });
        }

        const { phone, password } = req.body;

        if (!phone || !password) {
          console.error("❌ Missing credentials:", {
            phone: !!phone,
            password: !!password,
          });
          return res.status(400).json({
            error: "Phone and password are required",
          });
        }

        console.log(`📱 Phone: ${phone}`);
        console.log(`🔐 Password length: ${password.length}`);

        // Query database
        console.log("🔍 Querying database...");
        const result = await query(
          "SELECT * FROM users WHERE phone = $1 OR email = $1",
          [phone.trim()],
        );

        console.log(`📊 Query result: ${result.rows.length} users found`);

        if (result.rows.length === 0) {
          console.log("❌ No user found");
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];
        console.log(
          `👤 Found user: ${user.first_name} ${user.last_name} (${user.role})`,
        );

        if (!user.password_hash) {
          console.error("❌ User has no password hash");
          return res
            .status(500)
            .json({ error: "User authentication data corrupted" });
        }

        console.log(`🔐 Verifying password...`);
        const validPassword = verifyPassword(password, user.password_hash);
        console.log(`✅ Password valid: ${validPassword}`);

        if (!validPassword) {
          console.log("❌ Invalid password");
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, phone: user.phone, role: user.role },
          process.env.JWT_SECRET || "zuasoko-render-secret",
          { expiresIn: "7d" },
        );

        console.log("✅ Login successful!");
        console.log("================================");

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
      } catch (loginError) {
        console.error("❌ Login error:", loginError);
        return res.status(500).json({
          error: "Login failed",
          details: loginError.message,
        });
      }
    }

    // Products endpoint
    if (url === "/api/products" && method === "GET") {
      try {
        const result = await query(`
          SELECT id, name, category, price_per_unit, unit, description, 
                 stock_quantity, is_featured, farmer_name, farmer_county, created_at
          FROM products 
          WHERE is_active = true AND stock_quantity > 0
          ORDER BY is_featured DESC, created_at DESC
        `);

        console.log(
          `📦 Returning ${result.rows.length} products from database`,
        );
        return res.json({ products: result.rows });
      } catch (error) {
        console.warn("Products query failed, using fallback:", error.message);
        return res.json({ products: fallbackProducts });
      }
    }

    // Demo endpoints
    if (url === "/api/demo/products" && method === "GET") {
      return res.json({ products: fallbackProducts });
    }

    if (url === "/api/demo/login" && method === "POST") {
      const { phone, password } = req.body || {};

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
    console.error("❌ UNHANDLED API ERROR:", error);
    console.error("❌ Stack:", error.stack);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
