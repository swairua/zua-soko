const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());

// Database connection with live Render.com credentials
const pool = new Pool({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to PostgreSQL database");
    release();
  }
});

// Root route - redirect to frontend
app.get("/", (req, res) => {
  res.json({
    message: "Zuasoko API Server",
    frontend_url: "http://localhost:3001",
    api_endpoints: [
      "GET /api/status",
      "GET /api/marketplace/products",
      "GET /api/marketplace/categories",
      "GET /api/marketplace/counties",
    ],
    note: "This is the API server. For the web app, go to http://localhost:3001",
  });
});

// Setup endpoint to create users
app.post("/api/setup/users", async (req, res) => {
  try {
    console.log("🔧 Setting up users in database...");

    // Create ENUM types first
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'FARMER', 'CUSTOMER', 'DRIVER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Check existing table structure
    const columns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
    `);

    console.log(
      "📋 Existing columns:",
      columns.rows.map((r) => r.column_name),
    );

    const crypto = require("crypto");
    function hashPassword(password) {
      return crypto
        .createHash("sha256")
        .update(password + "salt123")
        .digest("hex");
    }

    // Update existing users with correct emails and passwords
    const testUsers = [
      {
        phone: "+254712345678",
        email: "admin@zuasoko.com",
        password: "password123",
        role: "ADMIN",
      },
      {
        phone: "+254734567890",
        email: "farmer@zuasoko.com",
        password: "password123",
        role: "FARMER",
      },
      {
        phone: "+254756789012",
        email: "customer@zuasoko.com",
        password: "password123",
        role: "CUSTOMER",
      },
      {
        phone: "+254778901234",
        email: "driver@zuasoko.com",
        password: "password123",
        role: "DRIVER",
      },
    ];

    const updatedUsers = [];
    for (const user of testUsers) {
      const hashedPassword = hashPassword(user.password);

      // First try to update existing user
      const updateResult = await pool.query(
        `
        UPDATE users SET
          email = $1,
          password_hash = $2
        WHERE phone = $3
        RETURNING id, phone, email, role
      `,
        [user.email, hashedPassword, user.phone],
      );

      if (updateResult.rows.length > 0) {
        updatedUsers.push(updateResult.rows[0]);
        console.log(`✅ Updated user: ${user.phone} -> ${user.email}`);
      } else {
        // User doesn't exist, insert new one
        try {
          const insertResult = await pool.query(
            `
            INSERT INTO users (phone, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, phone, email, role
          `,
            [user.phone, user.email, hashedPassword, user.role],
          );

          updatedUsers.push(insertResult.rows[0]);
          console.log(`✅ Created new user: ${user.phone} -> ${user.email}`);
        } catch (insertError) {
          console.log(
            `⚠️ Could not create user ${user.phone}: ${insertError.message}`,
          );
        }
      }
    }

    res.json({
      success: true,
      message: "Users setup completed",
      users: updatedUsers,
    });
  } catch (err) {
    console.error("❌ Setup error:", err);
    res.status(500).json({ message: "Setup failed", details: err.message });
  }
});

// Debug endpoint to check users
app.get("/api/debug/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT phone, email, role, password_hash FROM users LIMIT 3",
    );
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows.map((user) => ({
        phone: user.phone,
        email: user.email,
        role: user.role,
        password_hash_preview: user.password_hash
          ? user.password_hash.substring(0, 20) + "..."
          : "null",
      })),
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Simple status endpoint
app.get("/api/status", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW() as current_time");
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
      database_time: dbResult.rows[0].current_time,
    });
  } catch (err) {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message,
    });
  }
});

// Marketplace products endpoint
app.get("/api/marketplace/products", async (req, res) => {
  try {
    console.log("🛍️ Marketplace products request");

    // Try to get products from database
    try {
      const result = await pool.query(`
        SELECT id, name, category, price_per_unit, unit, description,
               stock_quantity, farmer_name, farmer_county, created_at
        FROM products 
        LIMIT 20
      `);

      console.log(`✅ Found ${result.rows.length} products in database`);

      if (result.rows.length > 0) {
        return res.json({
          success: true,
          products: result.rows,
          pagination: {
            page: 1,
            limit: 20,
            total: result.rows.length,
            totalPages: 1,
          },
        });
      }
    } catch (dbError) {
      console.log("⚠️ Database query failed:", dbError.message);
    }

    // Fallback to demo data
    console.log("📦 Using demo products");
    res.json({
      success: true,
      products: [
        {
          id: 1,
          name: "Fresh Tomatoes",
          category: "Vegetables",
          price_per_unit: 130,
          unit: "kg",
          description: "Organic red tomatoes, Grade A quality.",
          stock_quantity: 85,
          farmer_name: "John Farmer",
          farmer_county: "Nakuru",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Sweet Potatoes",
          category: "Root Vegetables",
          price_per_unit: 80,
          unit: "kg",
          description: "Fresh sweet potatoes, rich in nutrients.",
          stock_quantity: 45,
          farmer_name: "Mary Farmer",
          farmer_county: "Meru",
          created_at: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
  } catch (err) {
    console.error("❌ Products error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch products", details: err.message });
  }
});

// Marketplace categories endpoint
app.get("/api/marketplace/categories", async (req, res) => {
  try {
    console.log("📁 Categories request");

    try {
      const result = await pool.query(`
        SELECT DISTINCT category 
        FROM products 
        WHERE category IS NOT NULL
        ORDER BY category
      `);

      if (result.rows.length > 0) {
        const categories = result.rows.map((row) => row.category);
        return res.json({ success: true, categories });
      }
    } catch (dbError) {
      console.log("⚠️ Categories query failed:", dbError.message);
    }

    // Fallback
    res.json({
      success: true,
      categories: [
        "Vegetables",
        "Fruits",
        "Grains",
        "Leafy Greens",
        "Root Vegetables",
      ],
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", details: err.message });
  }
});

// Authentication endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login request received");

    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    console.log(`📱 Login attempt for: ${phone}`);

    // Query the database for user
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE phone = $1 OR email = $1",
        [phone.trim()],
      );

      const user = result.rows[0];

      if (!user) {
        console.log("❌ User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`👤 Found user: ${user.first_name} ${user.last_name}`);

      // Simple password verification (in real app, use bcrypt)
      const crypto = require("crypto");
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password + "salt123")
        .digest("hex");

      if (hashedPassword !== user.password_hash) {
        console.log("❌ Invalid password");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate simple JWT (in real app, use proper JWT library)
      const token = Buffer.from(
        JSON.stringify({
          userId: user.id,
          phone: user.phone,
          role: user.role,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        }),
      ).toString("base64");

      console.log("✅ Login successful");

      return res.json({
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
    } catch (dbError) {
      console.log(
        "⚠️ Database query failed, checking built-in users:",
        dbError.message,
      );

      // Fallback to built-in users if database fails
      const builtInUsers = {
        "+254712345678": {
          id: "admin-001",
          password: "password123",
          first_name: "Admin",
          last_name: "User",
          email: "admin@zuasoko.com",
          role: "ADMIN",
          county: "Nairobi",
          verified: true,
          registration_fee_paid: true,
        },
      };

      const builtInUser =
        builtInUsers[phone] || builtInUsers[phone.toLowerCase()];

      if (builtInUser && builtInUser.password === password) {
        const token = Buffer.from(
          JSON.stringify({
            userId: builtInUser.id,
            phone: phone,
            role: builtInUser.role,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
          }),
        ).toString("base64");

        return res.json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: builtInUser.id,
            firstName: builtInUser.first_name,
            lastName: builtInUser.last_name,
            email: builtInUser.email,
            phone: phone,
            role: builtInUser.role,
            county: builtInUser.county,
            verified: builtInUser.verified,
            registrationFeePaid: builtInUser.registration_fee_paid,
          },
        });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", details: err.message });
  }
});

// Admin endpoints
app.get("/api/admin/users", async (req, res) => {
  try {
    console.log("👥 Admin users request");

    try {
      const result = await pool.query(`
        SELECT id, phone, email, role, created_at
        FROM users
        ORDER BY created_at DESC
      `);

      console.log(`✅ Found ${result.rows.length} users in database`);

      if (result.rows.length > 0) {
        // Map to expected format
        const users = result.rows.map((user) => ({
          id: user.id,
          firstName: user.email ? user.email.split("@")[0] : "User",
          lastName: user.role.charAt(0) + user.role.slice(1).toLowerCase(),
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: true,
          createdAt: user.created_at,
          status: "ACTIVE",
        }));

        return res.json({
          success: true,
          users: users,
        });
      }
    } catch (dbError) {
      console.log("⚠️ Users query failed:", dbError.message);
    }

    // Fallback demo users
    console.log("👥 Using demo users");
    res.json({
      success: true,
      users: [
        {
          id: "admin-001",
          first_name: "Admin",
          last_name: "User",
          email: "admin@zuasoko.com",
          phone: "+254712345678",
          role: "ADMIN",
          county: "Nairobi",
          verified: true,
          registration_fee_paid: true,
          created_at: new Date().toISOString(),
          status: "ACTIVE",
        },
        {
          id: "farmer-001",
          first_name: "John",
          last_name: "Farmer",
          email: "farmer@zuasoko.com",
          phone: "+254723456789",
          role: "FARMER",
          county: "Nakuru",
          verified: true,
          registration_fee_paid: true,
          created_at: new Date().toISOString(),
          status: "ACTIVE",
        },
      ],
    });
  } catch (err) {
    console.error("❌ Users error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch users", details: err.message });
  }
});

// Consignments endpoint
app.get("/api/consignments", async (req, res) => {
  try {
    console.log("📦 Consignments request");

    try {
      const result = await pool.query(`
        SELECT id, title, description, category, quantity, unit,
               proposed_price_per_unit, final_price_per_unit,
               status, created_at, farmer_id
        FROM consignments
        ORDER BY created_at DESC
      `);

      console.log(`✅ Found ${result.rows.length} consignments in database`);

      if (result.rows.length > 0) {
        return res.json({
          success: true,
          consignments: result.rows,
        });
      }
    } catch (dbError) {
      console.log("⚠️ Consignments query failed:", dbError.message);
    }

    // Fallback demo consignments
    console.log("📦 Using demo consignments");
    res.json({
      success: true,
      consignments: [
        {
          id: "cons-001",
          title: "Fresh Tomatoes Harvest",
          description: "High quality Roma tomatoes from organic farm",
          category: "Vegetables",
          quantity: 500,
          unit: "kg",
          proposed_price_per_unit: 85.0,
          final_price_per_unit: null,
          status: "PENDING",
          created_at: new Date().toISOString(),
          farmer_id: "farmer-001",
          farmer: {
            name: "John Farmer",
            phone: "+254723456789",
          },
        },
        {
          id: "cons-002",
          title: "Sweet Potato Harvest",
          description: "Fresh sweet potatoes ready for market",
          category: "Root Vegetables",
          quantity: 300,
          unit: "kg",
          proposed_price_per_unit: 75.0,
          final_price_per_unit: 80.0,
          status: "APPROVED",
          created_at: new Date().toISOString(),
          farmer_id: "farmer-002",
          farmer: {
            name: "Mary Farmer",
            phone: "+254734567890",
          },
        },
      ],
    });
  } catch (err) {
    console.error("❌ Consignments error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch consignments", details: err.message });
  }
});

// Drivers endpoint
app.get("/api/drivers", async (req, res) => {
  try {
    console.log("🚛 Drivers request");

    try {
      const result = await pool.query(`
        SELECT id, phone, email, role
        FROM users
        WHERE role = 'DRIVER'
        ORDER BY created_at DESC
      `);

      if (result.rows.length > 0) {
        const drivers = result.rows.map((user) => ({
          id: user.id,
          userId: user.id,
          name: user.email ? user.email.split("@")[0] : "Driver",
          licenseNumber: `DL${user.id.slice(-8)}`,
          vehicleType: "Pickup Truck",
          vehicleRegNo: `KCA${Math.floor(Math.random() * 999)}X`,
          isAvailable: true,
          rating: 4.5 + Math.random() * 0.5,
        }));

        return res.json({
          success: true,
          drivers: drivers,
        });
      }
    } catch (dbError) {
      console.log("⚠️ Drivers query failed:", dbError.message);
    }

    // Fallback demo drivers
    res.json({
      success: true,
      drivers: [
        {
          id: "driver-001",
          userId: "driver-001",
          name: "Michael Kiprotich",
          licenseNumber: "DL123456789",
          vehicleType: "Pickup Truck",
          vehicleRegNo: "KCA123X",
          isAvailable: true,
          rating: 4.7,
        },
        {
          id: "driver-002",
          userId: "driver-002",
          name: "Sarah Wanjiku",
          licenseNumber: "DL987654321",
          vehicleType: "Van",
          vehicleRegNo: "KBZ456Y",
          isAvailable: false,
          rating: 4.9,
        },
      ],
    });
  } catch (err) {
    console.error("❌ Drivers error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch drivers", details: err.message });
  }
});

// Marketplace counties endpoint
app.get("/api/marketplace/counties", async (req, res) => {
  try {
    console.log("🗺️ Counties request");

    try {
      const result = await pool.query(`
        SELECT DISTINCT farmer_county as county
        FROM products 
        WHERE farmer_county IS NOT NULL
        ORDER BY farmer_county
      `);

      if (result.rows.length > 0) {
        const counties = result.rows.map((row) => row.county);
        return res.json({ success: true, counties });
      }
    } catch (dbError) {
      console.log("⚠️ Counties query failed:", dbError.message);
    }

    // Fallback
    res.json({
      success: true,
      counties: ["Nairobi", "Kiambu", "Nakuru", "Meru", "Nyeri"],
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch counties", details: err.message });
  }
});

// Serve frontend for all non-API routes (SPA fallback)
app.get("*", (req, res) => {
  // Only handle non-API routes
  if (!req.path.startsWith("/api")) {
    res.redirect(`http://localhost:3001${req.path}`);
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log("📋 Available endpoints:");
  console.log("  GET  /api/status");
  console.log("  POST /api/auth/login");
  console.log("  GET  /api/admin/users");
  console.log("  GET  /api/consignments");
  console.log("  GET  /api/drivers");
  console.log("  GET  /api/marketplace/products");
  console.log("  GET  /api/marketplace/categories");
  console.log("  GET  /api/marketplace/counties");
  console.log(
    "🔄 Non-API routes redirect to frontend at http://localhost:3001",
  );
});
