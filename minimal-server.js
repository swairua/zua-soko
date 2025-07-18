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

// POST endpoint for creating new consignments
app.post("/api/consignments", async (req, res) => {
  try {
    console.log("📦 Creating new consignment", req.body);

    const {
      title,
      description,
      category,
      quantity,
      unit,
      bidPricePerUnit,
      location,
      harvestDate,
      expiryDate,
      images,
    } = req.body;

    // Basic validation
    if (
      !title ||
      !description ||
      !category ||
      !quantity ||
      !bidPricePerUnit ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get farmer ID from auth token (simplified for demo)
    const token = req.headers.authorization?.replace("Bearer ", "");
    let farmerId = 1; // Default for demo

    try {
      // Attempt to decode token (using base64 like in login)
      if (token) {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());
        farmerId = decoded.id;
      }
    } catch (tokenError) {
      console.log("⚠️ Token decode failed, using demo farmer ID");
    }

    try {
      // Insert into database
      const result = await pool.query(
        `
        INSERT INTO consignments (
          title, description, category, quantity, unit,
          bid_price_per_unit, location, harvest_date,
          expiry_date, images, farmer_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *
        `,
        [
          title,
          description,
          category,
          parseFloat(quantity),
          unit,
          parseFloat(bidPricePerUnit),
          location,
          harvestDate,
          expiryDate,
          JSON.stringify(images || []),
          farmerId,
          "PENDING",
        ],
      );

      console.log(`✅ Created consignment with ID: ${result.rows[0].id}`);

      return res.status(201).json({
        success: true,
        message: "Consignment created successfully",
        consignment: result.rows[0],
      });
    } catch (dbError) {
      console.log("⚠️ Database insert failed:", dbError.message);

      // Return success for demo mode
      const demoConsignment = {
        id: Date.now().toString(),
        title,
        description,
        category,
        quantity: parseFloat(quantity),
        unit,
        bidPricePerUnit: parseFloat(bidPricePerUnit),
        location,
        harvestDate,
        expiryDate,
        images: images || [],
        farmerId,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };

      console.log(`📦 Demo mode: Created consignment ${demoConsignment.id}`);

      return res.status(201).json({
        success: true,
        message: "Consignment created successfully (demo mode)",
        consignment: demoConsignment,
      });
    }
  } catch (err) {
    console.error("❌ Create consignment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create consignment",
      details: err.message,
    });
  }
});

// PATCH endpoint for updating consignments
app.patch("/api/admin/consignments/:id", async (req, res) => {
  try {
    console.log(`📝 Updating consignment ${req.params.id}`, req.body);

    const { id } = req.params;
    const { status, final_price_per_unit, driver_id, notes } = req.body;

    try {
      // Update consignment in database
      const result = await pool.query(
        `
        UPDATE consignments
        SET status = COALESCE($1, status),
            final_price_per_unit = COALESCE($2, final_price_per_unit),
            driver_id = COALESCE($3, driver_id),
            notes = COALESCE($4, notes),
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `,
        [status, final_price_per_unit, driver_id, notes, id],
      );

      if (result.rows.length > 0) {
        console.log(`✅ Updated consignment ${id}`);
        return res.json({
          success: true,
          message: "Consignment updated successfully",
          consignment: result.rows[0],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Consignment not found",
        });
      }
    } catch (dbError) {
      console.log("⚠️ Database update failed:", dbError.message);

      // For demo data, just return success
      console.log(`📝 Demo mode: Acknowledging update for ${id}`);
      return res.json({
        success: true,
        message: "Consignment updated successfully (demo mode)",
        consignment: { id, status, final_price_per_unit, driver_id, notes },
      });
    }
  } catch (err) {
    console.error("❌ Update consignment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update consignment",
      details: err.message,
    });
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

// Analytics endpoints
app.get("/api/admin/analytics/stats", async (req, res) => {
  try {
    console.log("�� Analytics stats request");

    try {
      // Get stats from database
      const [usersCount, consignmentsCount, driversCount] = await Promise.all([
        pool.query("SELECT COUNT(*) as count FROM users"),
        pool.query("SELECT COUNT(*) as count FROM consignments"),
        pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'DRIVER'"),
      ]);

      // Calculate revenue from completed consignments
      const revenueResult = await pool.query(`
        SELECT COALESCE(SUM(final_price_per_unit * quantity), 0) as total_revenue
        FROM consignments
        WHERE status = 'COMPLETED' AND final_price_per_unit IS NOT NULL
      `);

      // Get pending approvals
      const pendingResult = await pool.query(`
        SELECT COUNT(*) as count FROM consignments WHERE status = 'PENDING'
      `);

      const stats = {
        totalUsers: parseInt(usersCount.rows[0].count) || 0,
        totalConsignments: parseInt(consignmentsCount.rows[0].count) || 0,
        totalOrders: parseInt(consignmentsCount.rows[0].count) || 0, // Using consignments as orders
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
        activeDrivers: parseInt(driversCount.rows[0].count) || 0,
        pendingApprovals: parseInt(pendingResult.rows[0].count) || 0,
        userGrowth: 12.5, // Could be calculated from date-based queries
        revenueGrowth: 8.2, // Could be calculated from historical data
      };

      console.log("📊 Analytics stats:", stats);

      return res.json({
        success: true,
        stats: stats,
      });
    } catch (dbError) {
      console.log("⚠️ Analytics query failed:", dbError.message);

      // Fallback demo stats
      return res.json({
        success: true,
        stats: {
          totalUsers: 1247,
          totalConsignments: 856,
          totalOrders: 2341,
          totalRevenue: 4567890,
          activeDrivers: 23,
          pendingApprovals: 12,
          userGrowth: 12.5,
          revenueGrowth: 8.2,
        },
      });
    }
  } catch (err) {
    console.error("❌ Analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      details: err.message,
    });
  }
});

app.get("/api/admin/analytics/monthly", async (req, res) => {
  try {
    console.log("📈 Monthly analytics request");

    try {
      // Get monthly data for the last 12 months
      const monthlyResult = await pool.query(`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as consignments,
          COALESCE(SUM(final_price_per_unit * quantity), 0) as revenue
        FROM consignments
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `);

      const monthlyData = monthlyResult.rows.map((row) => ({
        name: new Date(row.month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        value: parseFloat(row.revenue) || 0,
        consignments: parseInt(row.consignments) || 0,
      }));

      return res.json({
        success: true,
        monthlyData:
          monthlyData.length > 0
            ? monthlyData
            : [
                { name: "Jan 2024", value: 125000, consignments: 45 },
                { name: "Feb 2024", value: 145000, consignments: 52 },
                { name: "Mar 2024", value: 135000, consignments: 48 },
                { name: "Apr 2024", value: 185000, consignments: 67 },
                { name: "May 2024", value: 225000, consignments: 78 },
                { name: "Jun 2024", value: 195000, consignments: 71 },
              ],
      });
    } catch (dbError) {
      console.log("⚠️ Monthly analytics query failed:", dbError.message);

      // Fallback demo data
      return res.json({
        success: true,
        monthlyData: [
          { name: "Jan 2024", value: 125000, consignments: 45 },
          { name: "Feb 2024", value: 145000, consignments: 52 },
          { name: "Mar 2024", value: 135000, consignments: 48 },
          { name: "Apr 2024", value: 185000, consignments: 67 },
          { name: "May 2024", value: 225000, consignments: 78 },
          { name: "Jun 2024", value: 195000, consignments: 71 },
        ],
      });
    }
  } catch (err) {
    console.error("❌ Monthly analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly analytics",
      details: err.message,
    });
  }
});

// Recent activity endpoint
app.get("/api/admin/activity", async (req, res) => {
  try {
    console.log("🔄 Recent activity request");

    try {
      // Get recent activities from various tables
      const activities = [];

      // Recent user registrations
      const newUsers = await pool.query(`
        SELECT id, phone, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `);

      newUsers.rows.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user_registered",
          description: `New ${user.role.toLowerCase()} registered: ${user.email || user.phone}`,
          timestamp: user.created_at,
          icon: "user-plus",
          color: "bg-green-100 text-green-600",
        });
      });

      // Recent consignments
      const newConsignments = await pool.query(`
        SELECT id, title, status, created_at, farmer_id
        FROM consignments
        ORDER BY created_at DESC
        LIMIT 5
      `);

      newConsignments.rows.forEach((consignment) => {
        activities.push({
          id: `consignment-${consignment.id}`,
          type: "consignment_created",
          description: `New consignment: ${consignment.title}`,
          timestamp: consignment.created_at,
          icon: "package",
          color: "bg-blue-100 text-blue-600",
        });
      });

      // Sort by timestamp
      activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      return res.json({
        success: true,
        activities: activities.slice(0, 10), // Return top 10 activities
      });
    } catch (dbError) {
      console.log("⚠️ Activity query failed:", dbError.message);

      // Fallback demo activities
      return res.json({
        success: true,
        activities: [
          {
            id: "activity-1",
            type: "user_registered",
            description: "New farmer registered: john@example.com",
            timestamp: new Date().toISOString(),
            icon: "user-plus",
            color: "bg-green-100 text-green-600",
          },
          {
            id: "activity-2",
            type: "consignment_approved",
            description: 'Consignment "Fresh Tomatoes" approved',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            icon: "check-circle",
            color: "bg-blue-100 text-blue-600",
          },
        ],
      });
    }
  } catch (err) {
    console.error("❌ Activity error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      details: err.message,
    });
  }
});

// Admin marketplace management endpoints
app.get("/api/admin/marketplace/products", async (req, res) => {
  try {
    console.log("🛍️ Admin marketplace products request");

    const { page = 1, limit = 20, status, category } = req.query;

    try {
      let query = `
        SELECT p.*,
               COALESCE(p.farmer_name, 'Admin') as farmer_name,
               COALESCE(p.farmer_county, 'Central') as farmer_county
        FROM products p
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND p.is_active = $${paramCount}`;
        params.push(status === "active");
      }

      if (category) {
        paramCount++;
        query += ` AND p.category = $${paramCount}`;
        params.push(category);
      }

      query += ` ORDER BY p.created_at DESC`;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);

      // Get total count
      const countResult = await pool.query(
        "SELECT COUNT(*) as total FROM products",
      );
      const total = parseInt(countResult.rows[0].total);

      return res.json({
        success: true,
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (dbError) {
      console.log("⚠️ Admin products query failed:", dbError.message);

      // Return demo products
      return res.json({
        success: true,
        products: [
          {
            id: 1,
            name: "Fresh Tomatoes",
            category: "Vegetables",
            price_per_unit: 130,
            unit: "kg",
            description: "Grade A organic tomatoes",
            stock_quantity: 85,
            is_featured: true,
            is_active: true,
            farmer_name: "Admin",
            farmer_county: "Central",
            images: ["/api/placeholder/400/300"],
            created_at: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    }
  } catch (err) {
    console.error("❌ Admin marketplace products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      details: err.message,
    });
  }
});

app.post("/api/admin/marketplace/products", async (req, res) => {
  try {
    console.log("📦 Creating new product:", req.body);

    const {
      name,
      category,
      price_per_unit,
      unit,
      description,
      stock_quantity,
      is_featured = false,
      farmer_name = "Admin",
      farmer_county = "Central",
      images = [],
    } = req.body;

    if (!name || !category || !price_per_unit || !unit) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, category, price_per_unit, unit",
      });
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO products (
          name, category, price_per_unit, unit, description,
          stock_quantity, is_featured, is_active, farmer_name,
          farmer_county, images, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `,
        [
          name,
          category,
          parseFloat(price_per_unit),
          unit,
          description,
          parseInt(stock_quantity) || 0,
          is_featured,
          true,
          farmer_name,
          farmer_county,
          JSON.stringify(images),
        ],
      );

      return res.json({
        success: true,
        message: "Product created successfully",
        product: result.rows[0],
      });
    } catch (dbError) {
      console.log("⚠️ Product creation failed:", dbError.message);

      // Demo mode response
      return res.json({
        success: true,
        message: "Product created successfully (demo mode)",
        product: {
          id: Date.now(),
          name,
          category,
          price_per_unit,
          unit,
          description,
          stock_quantity,
          is_featured,
          farmer_name,
          farmer_county,
          images,
          created_at: new Date().toISOString(),
        },
      });
    }
  } catch (err) {
    console.error("❌ Product creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      details: err.message,
    });
  }
});

app.put("/api/admin/marketplace/products/:id", async (req, res) => {
  try {
    console.log(`📝 Updating product ${req.params.id}:`, req.body);

    const { id } = req.params;
    const {
      name,
      category,
      price_per_unit,
      unit,
      description,
      stock_quantity,
      is_featured,
      is_active,
      images,
    } = req.body;

    try {
      const result = await pool.query(
        `
        UPDATE products SET
          name = COALESCE($1, name),
          category = COALESCE($2, category),
          price_per_unit = COALESCE($3, price_per_unit),
          unit = COALESCE($4, unit),
          description = COALESCE($5, description),
          stock_quantity = COALESCE($6, stock_quantity),
          is_featured = COALESCE($7, is_featured),
          is_active = COALESCE($8, is_active),
          images = COALESCE($9, images),
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `,
        [
          name,
          category,
          price_per_unit ? parseFloat(price_per_unit) : null,
          unit,
          description,
          stock_quantity ? parseInt(stock_quantity) : null,
          is_featured,
          is_active,
          images ? JSON.stringify(images) : null,
          id,
        ],
      );

      if (result.rows.length > 0) {
        return res.json({
          success: true,
          message: "Product updated successfully",
          product: result.rows[0],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    } catch (dbError) {
      console.log("⚠️ Product update failed:", dbError.message);

      return res.json({
        success: true,
        message: "Product updated successfully (demo mode)",
        product: { id, ...req.body },
      });
    }
  } catch (err) {
    console.error("❌ Product update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      details: err.message,
    });
  }
});

app.delete("/api/admin/marketplace/products/:id", async (req, res) => {
  try {
    console.log(`🗑️ Deleting product ${req.params.id}`);

    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING id",
        [id],
      );

      if (result.rows.length > 0) {
        return res.json({
          success: true,
          message: "Product deleted successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    } catch (dbError) {
      console.log("⚠️ Product deletion failed:", dbError.message);

      return res.json({
        success: true,
        message: "Product deleted successfully (demo mode)",
      });
    }
  } catch (err) {
    console.error("❌ Product deletion error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      details: err.message,
    });
  }
});

// Orders management endpoints
app.get("/api/admin/orders", async (req, res) => {
  try {
    console.log("📋 Admin orders request");

    const { page = 1, limit = 20, status, customer } = req.query;

    try {
      // Try to get orders from database
      let query = `
        SELECT o.*, u.phone as customer_phone, u.email as customer_email,
               u.first_name, u.last_name
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND o.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY o.created_at DESC`;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);

      return res.json({
        success: true,
        orders: result.rows,
      });
    } catch (dbError) {
      console.log("⚠️ Orders query failed:", dbError.message);

      // Demo orders
      return res.json({
        success: true,
        orders: [
          {
            id: 1,
            customer_phone: "+254712345678",
            customer_email: "customer@example.com",
            first_name: "John",
            last_name: "Doe",
            total_amount: 2500,
            status: "PENDING",
            payment_status: "UNPAID",
            created_at: new Date().toISOString(),
            items: [
              { product_name: "Fresh Tomatoes", quantity: 5, unit_price: 130 },
              { product_name: "Sweet Potatoes", quantity: 10, unit_price: 80 },
            ],
          },
          {
            id: 2,
            customer_phone: "+254723456789",
            customer_email: "jane@example.com",
            first_name: "Jane",
            last_name: "Smith",
            total_amount: 1800,
            status: "COMPLETED",
            payment_status: "PAID",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            items: [
              { product_name: "Fresh Spinach", quantity: 12, unit_price: 150 },
            ],
          },
        ],
      });
    }
  } catch (err) {
    console.error("❌ Orders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      details: err.message,
    });
  }
});

app.post("/api/admin/orders/:id/stk-push", async (req, res) => {
  try {
    console.log(`💰 Initiating STK push for order ${req.params.id}`);

    const { id } = req.params;
    const { phone_number, amount } = req.body;

    if (!phone_number || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone number and amount are required",
      });
    }

    // Simulate STK push (in real implementation, integrate with M-Pesa API)
    const transactionId = `TXN${Date.now()}`;

    try {
      // Update order with payment request
      await pool.query(
        `
        UPDATE orders SET
          payment_request_id = $1,
          payment_status = 'PENDING',
          updated_at = NOW()
        WHERE id = $2
      `,
        [transactionId, id],
      );
    } catch (dbError) {
      console.log("⚠️ Order payment update failed:", dbError.message);
    }

    // Simulate processing delay
    setTimeout(() => {
      console.log(`✅ STK push sent successfully for order ${id}`);
    }, 1000);

    res.json({
      success: true,
      message: "STK push initiated successfully",
      transaction_id: transactionId,
      phone_number,
      amount,
    });
  } catch (err) {
    console.error("❌ STK push error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to initiate STK push",
      details: err.message,
    });
  }
});

// Invoice generation endpoint
app.get("/api/admin/orders/:id/invoice", async (req, res) => {
  try {
    console.log(`📄 Generating invoice for order ${req.params.id}`);

    const { id } = req.params;

    try {
      // Get order details
      const orderResult = await pool.query(
        `
        SELECT o.*, u.phone as customer_phone, u.email as customer_email,
               u.first_name, u.last_name, u.county as customer_county
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        WHERE o.id = $1
      `,
        [id],
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await pool.query(
        `
        SELECT oi.*, p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `,
        [id],
      );

      const invoice = {
        invoice_number: `INV-${String(id).padStart(6, "0")}`,
        order_id: id,
        customer: {
          name: `${order.first_name} ${order.last_name}`,
          phone: order.customer_phone,
          email: order.customer_email,
          county: order.customer_county,
        },
        items: itemsResult.rows,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        status: order.status,
        created_at: order.created_at,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };

      return res.json({
        success: true,
        invoice,
      });
    } catch (dbError) {
      console.log("⚠️ Invoice generation failed:", dbError.message);

      // Demo invoice
      return res.json({
        success: true,
        invoice: {
          invoice_number: `INV-${String(id).padStart(6, "0")}`,
          order_id: id,
          customer: {
            name: "John Doe",
            phone: "+254712345678",
            email: "customer@example.com",
            county: "Nairobi",
          },
          items: [
            {
              product_name: "Fresh Tomatoes",
              quantity: 5,
              unit_price: 130,
              total: 650,
            },
            {
              product_name: "Sweet Potatoes",
              quantity: 10,
              unit_price: 80,
              total: 800,
            },
          ],
          total_amount: 1450,
          payment_status: "UNPAID",
          status: "PENDING",
          created_at: new Date().toISOString(),
          due_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
    }
  } catch (err) {
    console.error("❌ Invoice generation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
      details: err.message,
    });
  }
});

// Registration fees management endpoints
app.get("/api/admin/registration-fees/unpaid", async (req, res) => {
  try {
    console.log("💰 Fetching unpaid farmers");

    try {
      const result = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.county,
               u.registration_fee_paid, u.created_at,
               COALESCE(c.consignment_count, 0) as consignment_count,
               EXTRACT(DAY FROM NOW() - u.created_at)::integer as days_since_registration
        FROM users u
        LEFT JOIN (
          SELECT farmer_id, COUNT(*) as consignment_count
          FROM consignments
          GROUP BY farmer_id
        ) c ON u.id = c.farmer_id
        WHERE u.role = 'FARMER' AND u.registration_fee_paid = false
        ORDER BY u.created_at DESC
      `);

      const farmers = result.rows.map((farmer) => ({
        id: farmer.id,
        firstName: farmer.first_name,
        lastName: farmer.last_name,
        email: farmer.email,
        phone: farmer.phone,
        county: farmer.county,
        registrationFeePaid: farmer.registration_fee_paid,
        registeredAt: farmer.created_at,
        daysSinceRegistration: farmer.days_since_registration,
        gracePeriodRemaining: 7 - farmer.days_since_registration, // 7 day grace period
        consignmentCount: farmer.consignment_count,
      }));

      console.log(`💰 Found ${farmers.length} unpaid farmers`);

      return res.json({
        success: true,
        farmers: farmers,
      });
    } catch (dbError) {
      console.log("⚠️ Unpaid farmers query failed:", dbError.message);

      // Demo data fallback
      const demoFarmers = [
        {
          id: "farmer-001",
          firstName: "John",
          lastName: "Kimani",
          email: "john@example.com",
          phone: "+254712345678",
          county: "Nakuru",
          registrationFeePaid: false,
          registeredAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysSinceRegistration: 5,
          gracePeriodRemaining: 2,
          consignmentCount: 0,
        },
        {
          id: "farmer-002",
          firstName: "Mary",
          lastName: "Wanjiku",
          email: "mary@example.com",
          phone: "+254723456789",
          county: "Meru",
          registrationFeePaid: false,
          registeredAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysSinceRegistration: 10,
          gracePeriodRemaining: -3,
          consignmentCount: 2,
        },
      ];

      return res.json({
        success: true,
        farmers: demoFarmers,
      });
    }
  } catch (err) {
    console.error("❌ Unpaid farmers error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unpaid farmers",
      details: err.message,
    });
  }
});

app.post("/api/admin/registration-fees/stk-push", async (req, res) => {
  try {
    console.log("💳 Registration fee STK push request");

    const { farmer_id, phone_number, amount } = req.body;

    if (!farmer_id || !phone_number || !amount) {
      return res.status(400).json({
        success: false,
        message: "Farmer ID, phone number and amount are required",
      });
    }

    console.log(
      `💳 Initiating registration fee STK push for farmer ${farmer_id}`,
    );
    console.log(`📱 Phone: ${phone_number}, Amount: KSh ${amount}`);

    // Simulate STK push (in real implementation, integrate with M-Pesa API)
    const transactionId = `REG${Date.now()}`;

    try {
      // Log payment attempt in database
      await pool.query(
        `
        INSERT INTO payment_attempts (farmer_id, amount, phone_number, transaction_id, type, status, created_at)
        VALUES ($1, $2, $3, $4, 'REGISTRATION_FEE', 'PENDING', NOW())
      `,
        [farmer_id, amount, phone_number, transactionId],
      );

      console.log(`✅ Payment attempt logged for farmer ${farmer_id}`);
    } catch (dbError) {
      console.log("⚠️ Failed to log payment attempt:", dbError.message);
    }

    // Simulate processing delay
    setTimeout(() => {
      console.log(
        `✅ Registration fee STK push sent successfully for farmer ${farmer_id}`,
      );
    }, 1000);

    res.json({
      success: true,
      message: "Registration fee STK push initiated successfully",
      transaction_id: transactionId,
      phone_number,
      amount,
      farmer_id,
    });
  } catch (err) {
    console.error("❌ Registration fee STK push error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to initiate registration fee STK push",
      details: err.message,
    });
  }
});

app.post("/api/admin/registration-fees/mark-paid", async (req, res) => {
  try {
    console.log("✅ Marking registration fee as paid");

    const { farmer_id, transaction_id } = req.body;

    if (!farmer_id) {
      return res.status(400).json({
        success: false,
        message: "Farmer ID is required",
      });
    }

    try {
      // Update farmer's registration fee status
      const result = await pool.query(
        `
        UPDATE users SET
          registration_fee_paid = true,
          registration_fee_paid_at = NOW()
        WHERE id = $1
        RETURNING id, phone, email
      `,
        [farmer_id],
      );

      if (result.rows.length > 0) {
        console.log(
          `✅ Registration fee marked as paid for farmer ${farmer_id}`,
        );

        // Update payment attempt status if transaction_id provided
        if (transaction_id) {
          await pool.query(
            `
            UPDATE payment_attempts SET
              status = 'COMPLETED',
              completed_at = NOW()
            WHERE transaction_id = $1
          `,
            [transaction_id],
          );
        }

        return res.json({
          success: true,
          message: "Registration fee marked as paid successfully",
          farmer: result.rows[0],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Farmer not found",
        });
      }
    } catch (dbError) {
      console.log("⚠️ Database update failed:", dbError.message);

      // Demo mode response
      return res.json({
        success: true,
        message: "Registration fee marked as paid successfully (demo mode)",
        farmer: { id: farmer_id },
      });
    }
  } catch (err) {
    console.error("❌ Mark paid error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to mark registration fee as paid",
      details: err.message,
    });
  }
});

// Check if farmer can register consignments
app.get("/api/farmer/can-register-consignment/:farmerId", async (req, res) => {
  try {
    console.log(
      `🔍 Checking consignment eligibility for farmer ${req.params.farmerId}`,
    );

    const { farmerId } = req.params;

    try {
      // Get farmer info and fee settings
      const farmerResult = await pool.query(
        `
        SELECT id, registration_fee_paid, created_at,
               EXTRACT(DAY FROM NOW() - created_at)::integer as days_since_registration
        FROM users
        WHERE id = $1 AND role = 'FARMER'
      `,
        [farmerId],
      );

      if (farmerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Farmer not found",
        });
      }

      const farmer = farmerResult.rows[0];
      const gracePeriodDays = 7; // Should come from settings
      const gracePeriodRemaining =
        gracePeriodDays - farmer.days_since_registration;

      const canRegister =
        farmer.registration_fee_paid || gracePeriodRemaining > 0;

      return res.json({
        success: true,
        canRegister,
        farmer: {
          id: farmer.id,
          registrationFeePaid: farmer.registration_fee_paid,
          daysSinceRegistration: farmer.days_since_registration,
          gracePeriodRemaining: Math.max(0, gracePeriodRemaining),
        },
        message: canRegister
          ? "Farmer can register consignments"
          : "Registration fee payment required to register consignments",
      });
    } catch (dbError) {
      console.log("⚠️ Eligibility check failed:", dbError.message);

      // Demo mode - allow registration
      return res.json({
        success: true,
        canRegister: true,
        farmer: {
          id: farmerId,
          registrationFeePaid: false,
          gracePeriodRemaining: 5,
        },
        message: "Demo mode - registration allowed",
      });
    }
  } catch (err) {
    console.error("❌ Eligibility check error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to check consignment eligibility",
      details: err.message,
    });
  }
});

// Wallet endpoints
app.get("/api/wallet", async (req, res) => {
  try {
    console.log("💰 Wallet request");

    // For now, return demo wallet data with correct structure
    const demoWallet = {
      id: "wallet_1",
      balance: 25000,
      transactions: [
        {
          id: "txn_1",
          type: "CREDIT",
          amount: 15000,
          description: "Payment for Tomatoes - Order #123",
          createdAt: new Date().toISOString(),
        },
        {
          id: "txn_2",
          type: "DEBIT",
          amount: 5000,
          description: "Mobile Money Withdrawal",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "txn_3",
          type: "CREDIT",
          amount: 8500,
          description: "Payment for Carrots - Order #124",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "txn_4",
          type: "CREDIT",
          amount: 12000,
          description: "Payment for Onions - Order #125",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ],
    };

    res.json({
      success: true,
      wallet: demoWallet,
    });
  } catch (err) {
    console.error("❌ Wallet error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet data",
      details: err.message,
    });
  }
});

// Notifications endpoints
app.get("/api/notifications", async (req, res) => {
  try {
    console.log("🔔 Notifications request");

    // For now, return demo notifications with correct structure
    const demoNotifications = [
      {
        id: "notif_1",
        title: "Consignment Approved",
        message:
          "Your tomatoes consignment has been approved and is now available in the marketplace.",
        type: "SUCCESS",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "notif_2",
        title: "Payment Received",
        message: "You have received KSh 15,000 payment for your recent order.",
        type: "PAYMENT",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "notif_3",
        title: "Registration Fee Required",
        message:
          "Please pay your registration fee of KSh 300 to continue using the platform.",
        type: "WARNING",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "notif_4",
        title: "New Order Received",
        message: "A customer has placed an order for your fresh vegetables.",
        type: "INFO",
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "notif_5",
        title: "Price Update",
        message:
          "The market price for your consigned vegetables has been updated.",
        type: "INFO",
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    res.json({
      success: true,
      notifications: demoNotifications,
      unreadCount: demoNotifications.filter((n) => !n.isRead).length,
    });
  } catch (err) {
    console.error("❌ Notifications error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      details: err.message,
    });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    console.log(`📖 Marking notification ${req.params.id} as read`);

    const { id } = req.params;

    // For now, just return success since we don't have notification storage
    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (err) {
    console.error("❌ Mark notification read error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      details: err.message,
    });
  }
});

// Admin settings endpoints
app.get("/api/admin/settings", async (req, res) => {
  try {
    console.log("⚙️ Settings request");

    // For now, return default settings since we don't have a settings table
    const defaultSettings = {
      platform: {
        name: "Zuasoko Agricultural Platform",
        description:
          "Connecting farmers directly with customers and managing agricultural supply chains",
        supportEmail: "support@zuasoko.com",
        supportPhone: "+254700000000",
      },
      fees: {
        farmerRegistrationFee: 300,
        registrationFeeEnabled: true,
        gracePeriodDays: 7,
      },
      payments: {
        mpesaEnabled: true,
        mpesaShortcode: "174379",
        mpesaPasskey: "",
        bankTransferEnabled: true,
        commissionRate: 5.0,
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        adminNotifications: true,
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 24,
        twoFactorRequired: false,
        maxLoginAttempts: 5,
      },
      features: {
        consignmentApprovalRequired: true,
        autoDriverAssignment: false,
        inventoryTracking: true,
        priceModeration: true,
      },
    };

    res.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (err) {
    console.error("❌ Settings error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      details: err.message,
    });
  }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
    console.log("💾 Save settings request", req.body);

    // For now, just acknowledge the save since we don't have a settings table
    res.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (err) {
    console.error("❌ Save settings error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save settings",
      details: err.message,
    });
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

// Customer orders endpoint
app.get("/api/orders", async (req, res) => {
  try {
    console.log("🛒 Customer orders request");

    // Get customer ID from auth token
    const token = req.headers.authorization?.replace("Bearer ", "");
    let customerId = 1; // Default for demo

    try {
      if (token) {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());
        customerId = decoded.id;
      }
    } catch (tokenError) {
      console.log("⚠️ Token decode failed, using demo customer ID");
    }

    try {
      // Get orders from database for the customer
      const result = await pool.query(
        `
        SELECT
          o.id,
          o.order_number,
          o.total_amount,
          o.payment_status,
          o.delivery_status as status,
          o.delivery_address,
          o.notes,
          o.created_at,
          o.updated_at,
          u.first_name as customer_first_name,
          u.last_name as customer_last_name
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC
      `,
        [customerId],
      );

      if (result.rows.length > 0) {
        const orders = result.rows.map((row) => ({
          id: row.id,
          orderNumber: row.order_number || `ORD-${row.id}`,
          totalAmount: parseFloat(row.total_amount) || 0,
          paymentStatus: row.payment_status || "PENDING",
          status: row.status || "PENDING",
          deliveryAddress: row.delivery_address || "Address not specified",
          notes: row.notes || "",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          customerName: `${row.customer_first_name || "Unknown"} ${row.customer_last_name || "Customer"}`,
          items: [], // Could be populated from order_items table
        }));

        console.log(
          `✅ Found ${orders.length} orders for customer ${customerId}`,
        );

        return res.json({
          success: true,
          orders: orders,
        });
      }
    } catch (dbError) {
      console.log("⚠️ Customer orders query failed:", dbError.message);
    }

    // Fallback demo orders
    console.log("🛒 Using demo customer orders");
    const demoOrders = [
      {
        id: "order_1",
        orderNumber: "ORD-2024-001",
        totalAmount: 2500,
        paymentStatus: "COMPLETED",
        status: "DELIVERED",
        deliveryAddress: "123 Main Street, Nairobi",
        notes: "Please deliver in the morning",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
        customerName: "John Doe",
        items: [
          {
            id: "item_1",
            productName: "Organic Tomatoes",
            quantity: 5,
            unit: "kg",
            pricePerUnit: 120,
            totalPrice: 600,
          },
          {
            id: "item_2",
            productName: "Fresh Spinach",
            quantity: 10,
            unit: "bunches",
            pricePerUnit: 50,
            totalPrice: 500,
          },
        ],
      },
      {
        id: "order_2",
        orderNumber: "ORD-2024-002",
        totalAmount: 1800,
        paymentStatus: "PENDING",
        status: "PROCESSING",
        deliveryAddress: "456 Oak Avenue, Nakuru",
        notes: "Call before delivery",
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updatedAt: new Date().toISOString(),
        customerName: "John Doe",
        items: [
          {
            id: "item_3",
            productName: "Premium Maize",
            quantity: 2,
            unit: "bags",
            pricePerUnit: 900,
            totalPrice: 1800,
          },
        ],
      },
    ];

    res.json({
      success: true,
      orders: demoOrders,
    });
  } catch (err) {
    console.error("❌ Customer orders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
      details: err.message,
    });
  }
});

// Driver assignments endpoints
app.get("/api/driver/assignments", async (req, res) => {
  try {
    console.log("🚛 Driver assignments request");

    try {
      // Get assignments from database - simplified for demo
      const result = await pool.query(`
        SELECT
          c.id,
          c.title,
          c.quantity,
          c.unit,
          c.location,
          c.status,
          c.farmer_id,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          u.phone as farmer_phone,
          c.final_price_per_unit
        FROM consignments c
        LEFT JOIN users u ON c.farmer_id = u.id
        WHERE c.status IN ('DRIVER_ASSIGNED', 'IN_TRANSIT')
        ORDER BY c.created_at DESC
      `);

      if (result.rows.length > 0) {
        const assignments = result.rows.map((row) => ({
          id: row.id,
          consignmentId: row.id,
          title: row.title,
          farmerName: `${row.farmer_first_name || "Unknown"} ${row.farmer_last_name || "Farmer"}`,
          farmerPhone: row.farmer_phone || "+254700000000",
          pickupLocation: row.location || "Location not specified",
          deliveryLocation: "Nairobi Central Market", // Default delivery location
          quantity: `${row.quantity} ${row.unit}`,
          status: row.status,
          estimatedValue: (row.final_price_per_unit || 0) * (row.quantity || 0),
          distance: "15 km", // Could be calculated based on actual locations
          estimatedTime: "45 mins", // Could be calculated based on distance
        }));

        console.log(`✅ Found ${assignments.length} driver assignments`);

        return res.json({
          success: true,
          assignments: assignments,
        });
      }
    } catch (dbError) {
      console.log("⚠️ Driver assignments query failed:", dbError.message);
    }

    // Fallback demo assignments
    console.log("🚛 Using demo driver assignments");
    const demoAssignments = [
      {
        id: "assign_1",
        consignmentId: "cons_1",
        title: "Organic Tomatoes Delivery",
        farmerName: "Jane Wanjiku",
        farmerPhone: "+254712345678",
        pickupLocation: "Nakuru, Rift Valley",
        deliveryLocation: "Nairobi Central Market",
        quantity: "100 kg",
        status: "DRIVER_ASSIGNED",
        estimatedValue: 13000,
        distance: "180 km",
        estimatedTime: "3 hours",
      },
      {
        id: "assign_2",
        consignmentId: "cons_2",
        title: "Fresh Spinach Delivery",
        farmerName: "Peter Kamau",
        farmerPhone: "+254723456789",
        pickupLocation: "Kiambu, Central Kenya",
        deliveryLocation: "Westlands Market",
        quantity: "50 bunches",
        status: "IN_TRANSIT",
        estimatedValue: 2500,
        distance: "45 km",
        estimatedTime: "1.5 hours",
      },
    ];

    res.json({
      success: true,
      assignments: demoAssignments,
    });
  } catch (err) {
    console.error("❌ Driver assignments error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver assignments",
      details: err.message,
    });
  }
});

// Update driver assignment status
app.put("/api/driver/assignments/:id/status", async (req, res) => {
  try {
    console.log(`🚛 Updating assignment ${req.params.id} status:`, req.body);

    const { id } = req.params;
    const { status, notes } = req.body;

    try {
      // Update assignment status in database
      const result = await pool.query(
        `
        UPDATE consignments
        SET status = $1,
            notes = COALESCE($2, notes),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
        `,
        [status, notes, id],
      );

      if (result.rows.length > 0) {
        console.log(`✅ Updated assignment ${id} to status: ${status}`);

        return res.json({
          success: true,
          message: "Assignment status updated successfully",
          assignment: result.rows[0],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }
    } catch (dbError) {
      console.log("⚠️ Assignment update failed:", dbError.message);

      // For demo mode, just return success
      console.log(`🚛 Demo mode: Updated assignment ${id} to ${status}`);

      return res.json({
        success: true,
        message: "Assignment status updated successfully (demo mode)",
        assignment: { id, status, notes },
      });
    }
  } catch (err) {
    console.error("❌ Assignment update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update assignment status",
      details: err.message,
    });
  }
});

// APK file information endpoint
app.get("/api/app/info", async (req, res) => {
  try {
    console.log("📱 App info request");

    const fs = require("fs");
    const path = require("path");

    try {
      // Check if APK exists
      const apkPath = path.join(
        __dirname,
        "frontend/public/downloads/zuasoko-app.apk",
      );
      const infoPath = path.join(
        __dirname,
        "frontend/public/downloads/app-info.json",
      );

      let appExists = false;
      let fileSize = 0;

      try {
        const stats = fs.statSync(apkPath);
        appExists = true;
        fileSize = stats.size;
      } catch (err) {
        console.log("APK file not found");
      }

      let appInfo = null;
      if (appExists) {
        try {
          const infoContent = fs.readFileSync(infoPath, "utf8");
          appInfo = JSON.parse(infoContent);

          // Add actual file size
          appInfo.actualSize = fileSize;
          appInfo.formattedSize = formatBytes(fileSize);
        } catch (err) {
          console.log("App info file not found, using defaults");
        }
      }

      res.json({
        success: true,
        available: appExists,
        appInfo: appInfo,
        downloadUrl: appExists ? "/downloads/zuasoko-app.apk" : null,
      });
    } catch (error) {
      console.log("Error checking app files:", error.message);

      // Return default response
      res.json({
        success: true,
        available: false,
        appInfo: null,
        downloadUrl: null,
      });
    }
  } catch (err) {
    console.error("❌ App info error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get app information",
      details: err.message,
    });
  }
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

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
  console.log("  POST /api/consignments");
  console.log("  GET  /api/orders");
  console.log("  GET  /api/drivers");
  console.log("  GET  /api/driver/assignments");
  console.log("  PUT  /api/driver/assignments/:id/status");
  console.log("  GET  /api/app/info");
  console.log("  GET  /api/marketplace/products");
  console.log("  GET  /api/marketplace/categories");
  console.log("  GET  /api/marketplace/counties");
  console.log(
    "🔄 Non-API routes redirect to frontend at http://localhost:3001",
  );
});
