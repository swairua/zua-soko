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
async function getDB() {
  if (!pool) {
    // Use internal URL for Render service communication, external for others
    const isRenderEnvironment =
      process.env.RENDER || process.env.RENDER_SERVICE_ID;
    const databaseUrl = isRenderEnvironment
      ? process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL
      : process.env.DATABASE_URL ||
        "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db";

    console.log("🚀 ZUASOKO DATABASE CONNECTION INITIALIZATION");
    console.log("================================================");
    console.log("🌍 Environment:", process.env.NODE_ENV || "development");
    console.log("🏗️ Render Environment:", isRenderEnvironment ? "YES" : "NO");
    console.log(
      "🔗 Database URL Type:",
      isRenderEnvironment ? "INTERNAL" : "EXTERNAL",
    );
    console.log("🔗 Database URL:", databaseUrl.replace(/:[^:]*@/, ":****@"));
    console.log("📊 Database Name:", process.env.DB_NAME || "zuasoko_db");
    console.log("👤 Database User:", process.env.DB_USER || "zuasoko_db_user");
    console.log(
      "🏠 Database Host:",
      isRenderEnvironment
        ? "dpg-d1rl7vripnbc73cj06j0-a"
        : "dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com",
    );
    console.log("🔌 Database Port:", process.env.DB_PORT || "5432");
    console.log("🔒 SSL Enabled:", "true");
    console.log("================================================");

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection with detailed logging
    try {
      console.log("🔄 Testing database connection...");
      const startTime = Date.now();
      const result = await pool.query(
        "SELECT NOW() as current_time, version() as db_version",
      );
      const endTime = Date.now();
      const connectionTime = endTime - startTime;

      console.log("✅ DATABASE CONNECTION SUCCESS!");
      console.log("================================================");
      console.log("⏱️ Connection Time:", connectionTime + "ms");
      console.log("📅 Database Time:", result.rows[0].current_time);
      console.log(
        "🗄️ Database Version:",
        result.rows[0].db_version.split(",")[0],
      );
      console.log("🔢 Pool Max Connections:", 3);
      console.log("⏰ Idle Timeout:", "5000ms");
      console.log("⏰ Connection Timeout:", "10000ms");
      console.log("================================================");

      // Test if tables exist
      try {
        const tableCheck = await pool.query(`
          SELECT COUNT(*) as table_count
          FROM information_schema.tables
          WHERE table_schema = 'public'
        `);
        console.log(
          "📋 Database Tables Found:",
          tableCheck.rows[0].table_count,
        );

        const userCheck = await pool.query(
          "SELECT COUNT(*) as user_count FROM users",
        );
        console.log("👥 Users in Database:", userCheck.rows[0].user_count);

        const productCheck = await pool.query(
          "SELECT COUNT(*) as product_count FROM products",
        );
        console.log(
          "🛒 Products in Database:",
          productCheck.rows[0].product_count,
        );
      } catch (tableError) {
        console.warn("⚠️ Tables may not exist yet:", tableError.message);
      }
    } catch (error) {
      console.error("❌ DATABASE CONNECTION FAILED!");
      console.error("================================================");
      console.error("❌ Error Code:", error.code);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Error Stack:", error.stack);
      console.error("❌ Will use fallback/demo data");
      console.error("================================================");
    }
  }
  return pool;
}

async function query(text, params = []) {
  try {
    const db = await getDB();
    return await db.query(text, params);
  } catch (error) {
    console.warn("Database query failed:", error.message);
    throw error;
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
    // Health check with database status
    if (url === "/api/health" && method === "GET") {
      console.log("🔍 Health check requested");
      let dbStatus = "disconnected";
      let dbDetails = {};

      try {
        const startTime = Date.now();
        const result = await query(
          "SELECT NOW() as current_time, version() as db_version",
        );
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        dbStatus = "connected";
        dbDetails = {
          response_time_ms: responseTime,
          current_time: result.rows[0].current_time,
          version: result.rows[0].db_version.split(",")[0],
          host: process.env.DB_HOST || "unknown",
          database: process.env.DB_NAME || "zuasoko_db",
          user: process.env.DB_USER || "zuasoko_db_user",
          ssl_enabled: true,
        };

        console.log(
          "✅ Health check - Database connected in",
          responseTime + "ms",
        );
      } catch (error) {
        dbStatus = "error";
        dbDetails = {
          error_message: error.message,
          error_code: error.code,
          host: process.env.DB_HOST || "unknown",
        };

        console.error("❌ Health check - Database error:", error.message);
      }

      const healthResponse = {
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: dbStatus,
        database_details: dbDetails,
        render_environment: !!(
          process.env.RENDER || process.env.RENDER_SERVICE_ID
        ),
        api_version: "1.0.0",
      };

      console.log("📊 Health check response:", {
        database: dbStatus,
        response_time: dbDetails.response_time_ms || "N/A",
      });

      return res.json(healthResponse);
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
        console.log(`🔍 Login attempt for: ${phone}`);

        // Try real database first
        const result = await query(
          "SELECT * FROM users WHERE phone = $1 OR email = $1",
          [phone.trim()],
        );
        console.log(
          `📊 Database query result: ${result.rows.length} users found`,
        );

        const user = result.rows[0];

        if (!user) {
          console.log(`❌ No user found for: ${phone}`);
          return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log(
          `👤 Found user: ${user.first_name} ${user.last_name} (${user.role})`,
        );
        console.log(
          `🔐 Stored hash: ${user.password_hash.substring(0, 10)}...`,
        );
        console.log(`🔐 Input password: ${password}`);
        console.log(
          `🔐 Generated hash: ${hashPassword(password).substring(0, 10)}...`,
        );

        const validPassword = verifyPassword(password, user.password_hash);
        console.log(`✅ Password valid: ${validPassword}`);

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
        console.error("❌ Database login failed:", error.message);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error stack:", error.stack);
        console.warn("🔄 Trying demo login fallback...");
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
    console.error("❌ API error:", error.message);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error code:", error.code);
    console.error("❌ Request URL:", url);
    console.error("❌ Request method:", method);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      url: url,
    });
  }
}
