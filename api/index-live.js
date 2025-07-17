const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

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

// LIVE Database connection - Render.com PostgreSQL
console.log("🔗 Connecting to LIVE Render.com database...");
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ LIVE Database connection error:", err);
  } else {
    console.log("✅ Connected to LIVE Render.com PostgreSQL database");
    console.log("🗄️ Database ready for live testing");
    release();
  }
});

// Database query helper
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("❌ Live database query error:", error);
    throw error;
  }
}

// Demo users as fallback only (if database fails)
const DEMO_USERS = {
  "+254712345678": {
    password: "password123",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
  },
};

// Demo products (fallback)
const DEMO_PRODUCTS = [
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
];

// LIVE DATABASE API HANDLER
export default async function handler(req, res) {
  try {
    console.log(`🌐 LIVE API Request: ${req.method} ${req.url}`);

    // CORS headers
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

    // =================================================
    // LIVE DATABASE LOGIN ENDPOINT
    // =================================================
    if (url === "/api/auth/login" && method === "POST") {
      console.log("🚀 LIVE DATABASE LOGIN REQUEST");

      try {
        // Parse request body
        let phone, password;

        if (!req.body) {
          console.error("❌ No request body");
          return res.status(400).json({
            error: "Request body required",
            success: false,
          });
        }

        if (typeof req.body === "string") {
          try {
            const parsed = JSON.parse(req.body);
            phone = parsed.phone;
            password = parsed.password;
          } catch (parseError) {
            console.error("❌ JSON parse error:", parseError);
            return res.status(400).json({
              error: "Invalid JSON in request body",
              success: false,
            });
          }
        } else {
          phone = req.body.phone;
          password = req.body.password;
        }

        console.log(`📱 Login attempt for: ${phone}`);

        if (!phone || !password) {
          console.error("❌ Missing credentials");
          return res.status(400).json({
            error: "Phone and password are required",
            success: false,
          });
        }

        // QUERY LIVE DATABASE
        console.log("🔍 Querying LIVE database...");
        try {
          const result = await query(
            "SELECT * FROM users WHERE phone = $1 OR email = $1",
            [phone.trim()],
          );

          console.log(
            `📊 Database query result: ${result.rows.length} users found`,
          );

          if (result.rows.length === 0) {
            console.log("❌ No user found in live database");
            return res.status(401).json({
              error: "Invalid credentials",
              success: false,
              source: "live_database",
            });
          }

          const user = result.rows[0];
          console.log(
            `👤 Found user in LIVE DB: ${user.first_name} ${user.last_name} (${user.role})`,
          );

          if (!user.password_hash) {
            console.error("❌ User has no password hash in live database");
            return res.status(500).json({
              error: "User authentication data corrupted",
              success: false,
            });
          }

          console.log(`🔐 Verifying password against live database...`);
          const validPassword = verifyPassword(password, user.password_hash);
          console.log(`✅ Password verification result: ${validPassword}`);

          if (!validPassword) {
            console.log("❌ Invalid password for live database user");
            return res.status(401).json({
              error: "Invalid credentials",
              success: false,
              source: "live_database",
            });
          }

          // Generate JWT token
          const token = jwt.sign(
            {
              userId: user.id,
              phone: user.phone,
              role: user.role,
            },
            process.env.JWT_SECRET || "zuasoko-live-production-2024",
            { expiresIn: "7d" },
          );

          console.log("✅ LIVE DATABASE LOGIN SUCCESSFUL!");

          return res.status(200).json({
            success: true,
            message: "Login successful with live database",
            token,
            source: "live_database",
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
        } catch (dbError) {
          console.error("❌ Live database query failed:", dbError);

          // Fallback to demo user if database fails
          console.log("🔄 Database failed, trying demo fallback...");

          const demoUser = DEMO_USERS[phone.trim()];

          if (demoUser && demoUser.password === password) {
            console.log("✅ Demo fallback login successful!");

            const token = jwt.sign(
              {
                userId: `demo-${demoUser.role.toLowerCase()}`,
                phone: phone.trim(),
                role: demoUser.role,
              },
              process.env.JWT_SECRET || "zuasoko-live-production-2024",
              { expiresIn: "7d" },
            );

            return res.status(200).json({
              success: true,
              message:
                "Login successful with demo fallback (database unavailable)",
              token,
              source: "demo_fallback",
              user: {
                id: `demo-${demoUser.role.toLowerCase()}`,
                firstName: demoUser.firstName,
                lastName: demoUser.lastName,
                email: demoUser.email,
                phone: phone.trim(),
                role: demoUser.role,
                county: "Demo County",
                verified: true,
                registrationFeePaid: true,
              },
            });
          }

          return res.status(500).json({
            error:
              "Database connection failed and credentials don't match demo users",
            details: dbError.message,
            success: false,
          });
        }
      } catch (loginError) {
        console.error("❌ Login error:", loginError);
        return res.status(500).json({
          error: "Login system error",
          details: loginError.message,
          success: false,
        });
      }
    }

    // =================================================
    // LIVE DATABASE PRODUCTS ENDPOINT
    // =================================================
    if (url === "/api/products" && method === "GET") {
      console.log("📦 LIVE DATABASE Products request");

      try {
        const result = await query(`
          SELECT id, name, category, price_per_unit, unit, description, 
                 stock_quantity, is_featured, farmer_name, farmer_county, created_at
          FROM products 
          WHERE is_active = true AND stock_quantity > 0
          ORDER BY is_featured DESC, created_at DESC
        `);

        console.log(`📦 Found ${result.rows.length} products in live database`);

        return res.status(200).json({
          success: true,
          products: result.rows,
          source: "live_database",
          count: result.rows.length,
        });
      } catch (dbError) {
        console.error("❌ Products query failed:", dbError);
        console.log("🔄 Using demo products fallback");

        return res.status(200).json({
          success: true,
          products: DEMO_PRODUCTS,
          source: "demo_fallback",
          count: DEMO_PRODUCTS.length,
        });
      }
    }

    // =================================================
    // LIVE DATABASE STATUS ENDPOINT
    // =================================================
    if (url === "/api/status" && method === "GET") {
      console.log("🔍 LIVE DATABASE Status check");

      try {
        const startTime = Date.now();
        const result = await query(
          "SELECT NOW() as current_time, version() as db_version",
        );
        const endTime = Date.now();

        return res.status(200).json({
          status: "OK",
          timestamp: new Date().toISOString(),
          database: "connected",
          database_type: "live_render_postgresql",
          response_time_ms: endTime - startTime,
          database_time: result.rows[0].current_time,
          database_version: result.rows[0].db_version.split(",")[0],
          environment: "development_with_live_db",
        });
      } catch (dbError) {
        return res.status(200).json({
          status: "OK",
          timestamp: new Date().toISOString(),
          database: "error",
          database_type: "live_render_postgresql",
          error: dbError.message,
          environment: "development_with_live_db",
        });
      }
    }

    // =================================================
    // TEST ADMIN USER ENDPOINT
    // =================================================
    if (url === "/api/test/admin" && method === "GET") {
      console.log("🔍 Testing admin user in live database...");

      try {
        const result = await query(
          "SELECT id, first_name, last_name, phone, role, password_hash FROM users WHERE phone = $1",
          ["+254712345678"],
        );

        if (result.rows.length > 0) {
          const user = result.rows[0];
          const testHash = hashPassword("password123");
          const passwordMatch = testHash === user.password_hash;

          return res.json({
            found: true,
            source: "live_database",
            user: {
              id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              phone: user.phone,
              role: user.role,
            },
            password_hash_correct: passwordMatch,
            test_hash: testHash.substring(0, 10) + "...",
            stored_hash: user.password_hash.substring(0, 10) + "...",
          });
        } else {
          return res.json({
            found: false,
            source: "live_database",
            message: "Admin user not found in live database",
          });
        }
      } catch (error) {
        console.error("❌ Test admin error:", error);
        return res.status(500).json({
          error: "Test failed",
          details: error.message,
          source: "live_database",
        });
      }
    }

    // =================================================
    // DEFAULT RESPONSE
    // =================================================
    return res.status(404).json({
      error: "Endpoint not found",
      requested: url,
      method: method,
      available_endpoints: [
        "POST /api/auth/login",
        "GET /api/products",
        "GET /api/status",
        "GET /api/test/admin",
      ],
      database: "live_render_postgresql",
      success: false,
    });
  } catch (error) {
    console.error("❌ CRITICAL API ERROR:", error);

    return res.status(500).json({
      error: "Critical server error",
      message: error.message,
      timestamp: new Date().toISOString(),
      database: "live_render_postgresql",
      success: false,
    });
  }
}
