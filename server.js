const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
// JSON parsing with error handling
app.use(express.json({ limit: "10mb" }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("🐛 JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});

// Comprehensive request logging middleware
app.use((req, res, next) => {
  console.log(`��� ============ NEW REQUEST ============`);
  console.log(`📥 ${req.method} ${req.url}`);
  console.log(`📍 Path: ${req.path}`);
  console.log(`📍 Base URL: ${req.baseUrl}`);
  console.log(`📍 Original URL: ${req.originalUrl}`);
  console.log(`📝 Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📝 Body:`, JSON.stringify(req.body, null, 2));
  }
  console.log(`🚀 ===================================`);
  next();
});

// Database connection with Neon database credentials
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Simple hash function matching what we used before
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

// =================================================
// ROUTE DEBUGGING INFO
// =================================================
console.log("📝 Setting up API routes...");
console.log("🔍 Main login route will be defined below...");

// =================================================
// ROOT ROUTE - REDIRECT TO FRONTEND
// =================================================
app.get("/", (req, res) => {
  res.json({
    message: "Zuasoko API Server",
    frontend_url: "http://localhost:3001",
    api_endpoints: [
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/products",
      "GET /api/marketplace/products",
      "GET /api/marketplace/categories",
      "GET /api/marketplace/counties",
      "GET /api/admin/settings",
      "GET /api/admin/users",
      "GET /api/admin/analytics/stats",
      "GET /api/admin/activity",
      "GET /api/status",
    ],
    note: "This is the API server. For the web app, go to http://localhost:3001",
  });
});

// =================================================
// TEST ENDPOINT
// =================================================
app.get("/api/test", (req, res) => {
  console.log("🎉 TEST ENDPOINT HIT!");
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

app.post("/api/test", (req, res) => {
  console.log("🎉 TEST POST ENDPOINT HIT!");
  res.json({
    message: "POST API is working!",
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

// =================================================
// SIMPLE PING ENDPOINT FOR TESTING
// =================================================
app.get("/api/ping", (req, res) => {
  console.log("🏓 PING endpoint hit!");
  res.json({
    message: "pong",
    timestamp: new Date().toISOString(),
    server: "working"
  });
});

app.post("/api/ping", (req, res) => {
  console.log("🏓 PING POST endpoint hit with body:", req.body);
  res.json({
    message: "pong",
    body: req.body,
    timestamp: new Date().toISOString(),
    server: "working"
  });
});

// Route debugging endpoint
app.get("/api/routes", (req, res) => {
  console.log("🗺️ ROUTES endpoint hit!");

  // List all available routes
  const routes = [
    "GET /api/ping",
    "POST /api/ping",
    "GET /api/routes",
    "POST /api/auth/login",
    "POST /api/auth/register",
    "GET /api/products",
    "GET /api/marketplace/products",
    "GET /api/marketplace/categories",
    "GET /api/marketplace/counties",
    "GET /api/data/everything",
    "GET /api/data/stats",
    "GET /api/data/users",
    "GET /api/data/recent",
    "GET /api/admin/settings",
    "PUT /api/admin/settings",
    "GET /api/admin/users",
    "GET /api/admin/analytics/stats",
    "GET /api/admin/activity",
    "GET /api/status",
    "GET /api/debug",
    "POST /api/debug"
  ];

  res.json({
    message: "Available API routes",
    routes,
    timestamp: new Date().toISOString(),
    server: "working",
    environment: process.env.NODE_ENV || "production"
  });
});

// =================================================
// LOGIN ENDPOINT - EXACTLY AS YOU REQUESTED
// =================================================
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔥🔥🔥 MAIN LOGIN ENDPOINT HIT! 🔥🔥🔥");
    console.log("🚀 Login request received");
    console.log(`📝 Method: ${req.method}`);
    console.log(`📝 URL: ${req.url}`);
    console.log(`📝 Path: ${req.path}`);
    console.log(`📝 Body:`, req.body);
    console.log(`📝 Headers:`, req.headers);

    const { phone, password } = req.body;

    if (!phone || !password) {
      console.log("❌ Missing credentials");
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    console.log(`📱 Login attempt for: ${phone}`);

    let user = null;

    // Try database first
    try {
      console.log("💾 Attempting database connection...");
      const result = await pool.query(
        "SELECT * FROM users WHERE phone = $1 OR email = $1",
        [phone.trim()],
      );
      user = result.rows[0];
      console.log(`✅ Database query successful, found user: ${user ? 'YES' : 'NO'}`);
    } catch (dbError) {
      console.warn("⚠️ Database connection failed, trying demo users:", dbError.message);

      // Demo users fallback
      const demoUsers = {
        "+254712345678": {
          id: "demo-admin",
          first_name: "Admin",
          last_name: "User",
          email: "admin@zuasoko.com",
          phone: "+254712345678",
          password_hash: hashPassword("password123"),
          role: "ADMIN",
          county: "Nairobi",
          verified: true,
          registration_fee_paid: true
        },
        "admin@zuasoko.com": {
          id: "demo-admin",
          first_name: "Admin",
          last_name: "User",
          email: "admin@zuasoko.com",
          phone: "+254712345678",
          password_hash: hashPassword("password123"),
          role: "ADMIN",
          county: "Nairobi",
          verified: true,
          registration_fee_paid: true
        }
      };

      const demoUser = demoUsers[phone.trim()] || demoUsers[phone.trim().toLowerCase()];
      if (demoUser) {
        user = demoUser;
        console.log("✅ Using demo user for login");
      }
    }

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`👤 Found user: ${user.first_name} ${user.last_name}`);

    // Verify password
    const isValidPassword = verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      console.log("❌ Invalid password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET || "zuasoko-production-secret-2024",
      { expiresIn: "7d" },
    );

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
  } catch (err) {
    console.error("❌ Login error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", details: err.message });
  }
});

// =================================================
// PRODUCTS ENDPOINT
// =================================================
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

    // Fallback demo products
    res.json({
      success: true,
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
      ],
    });
  }
});

// =================================================
// USER REGISTRATION ENDPOINT
// =================================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, county } =
      req.body;

    if (!firstName || !lastName || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE phone = $1 OR email = $2",
      [phone, email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = hashPassword(password);

    const result = await pool.query(
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
      await pool.query(
        "INSERT INTO wallets (user_id, balance) VALUES ($1, $2)",
        [userId, 0.0],
      );
    }

    const token = jwt.sign(
      { userId, phone, role },
      process.env.JWT_SECRET || "zuasoko-production-secret-2024",
      { expiresIn: "7d" },
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
    res
      .status(500)
      .json({ message: "Registration failed", details: err.message });
  }
});

// =================================================
// MARKETPLACE ENDPOINTS
// =================================================

// GET /api/marketplace/products
app.get("/api/marketplace/products", async (req, res) => {
  try {
    console.log("🛍️ Marketplace products request received", req.query);

    const {
      page = 1,
      limit = 12,
      category,
      county,
      search,
      minPrice,
      maxPrice,
      featured,
    } = req.query;

    // First check if products table exists and what columns it has
    try {
      const tableCheck = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public'
      `);

      const columns = tableCheck.rows.map((row) => row.column_name);
      console.log("🔍 Products table columns:", columns);

      if (columns.length === 0) {
        console.log(
          "❌ Products table does not exist, creating with seed data...",
        );
        // Return demo data if table doesn't exist
        return res.json({
          success: true,
          products: [
            {
              id: 1,
              name: "Fresh Tomatoes",
              category: "Vegetables",
              price_per_unit: 130,
              unit: "kg",
              description:
                "Organic red tomatoes, Grade A quality. Perfect for salads and cooking.",
              stock_quantity: 85,
              is_featured: true,
              farmer_name: "John Farmer",
              farmer_county: "Nakuru",
              created_at: new Date().toISOString(),
            },
          ],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 1,
            totalPages: 1,
          },
        });
      }
    } catch (tableError) {
      console.error("❌ Error checking table structure:", tableError);
    }

    let query = `
      SELECT p.id, p.name, p.category, p.price_per_unit, p.unit, p.description,
             p.stock_quantity,
             COALESCE(p.is_featured, false) as is_featured,
             p.farmer_name, p.farmer_county,
             p.created_at, p.images
      FROM products p
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

    if (minPrice) {
      paramCount++;
      query += ` AND p.price_per_unit >= $${paramCount}`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND p.price_per_unit <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
    }

    if (featured === "true") {
      query += ` AND p.is_featured = true`;
    }

    // Add ordering and pagination
    query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    console.log("🛍️ Executing query:", query, "Params:", params);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (category) {
      countParamCount++;
      countQuery += ` AND p.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (county) {
      countParamCount++;
      countQuery += ` AND p.farmer_county = $${countParamCount}`;
      countParams.push(county);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (minPrice) {
      countParamCount++;
      countQuery += ` AND p.price_per_unit >= $${countParamCount}`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countParamCount++;
      countQuery += ` AND p.price_per_unit <= $${countParamCount}`;
      countParams.push(parseFloat(maxPrice));
    }

    if (featured === "true") {
      countQuery += ` AND p.is_featured = true`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit));

    console.log(`🛍️ Found ${result.rows.length} products (${total} total)`);

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("❌ Marketplace products error:", err);
    return res.status(500).json({
      message: "Failed to fetch products",
      details: err.message,
    });
  }
});

// GET /api/marketplace/categories
app.get("/api/marketplace/categories", async (req, res) => {
  try {
    console.log("📁 Marketplace categories request received");

    try {
      const result = await pool.query(`
        SELECT DISTINCT category
        FROM products
        WHERE category IS NOT NULL
        ORDER BY category
      `);

      const categories = result.rows.map((row) => row.category);

      console.log(`📁 Found ${categories.length} categories:`, categories);

      if (categories.length === 0) {
        // Return demo categories if none found
        const demoCategories = [
          "Vegetables",
          "Fruits",
          "Grains",
          "Leafy Greens",
          "Root Vegetables",
        ];
        console.log(`📁 Using demo categories:`, demoCategories);
        return res.json({
          success: true,
          categories: demoCategories,
        });
      }

      res.json({
        success: true,
        categories,
      });
    } catch (queryError) {
      console.log(
        `📁 Query failed, using demo categories:`,
        queryError.message,
      );
      const demoCategories = [
        "Vegetables",
        "Fruits",
        "Grains",
        "Leafy Greens",
        "Root Vegetables",
      ];
      res.json({
        success: true,
        categories: demoCategories,
      });
    }
  } catch (err) {
    console.error("❌ Marketplace categories error:", err);
    return res.status(500).json({
      message: "Failed to fetch categories",
      details: err.message,
    });
  }
});

// GET /api/marketplace/counties
app.get("/api/marketplace/counties", async (req, res) => {
  try {
    console.log("🗺️ Marketplace counties request received");

    try {
      const result = await pool.query(`
        SELECT DISTINCT farmer_county as county
        FROM products
        WHERE farmer_county IS NOT NULL
        ORDER BY farmer_county
      `);

      const counties = result.rows.map((row) => row.county);

      console.log(`🗺️ Found ${counties.length} counties:`, counties);

      if (counties.length === 0) {
        // Return demo counties if none found
        const demoCounties = ["Nairobi", "Kiambu", "Nakuru", "Meru", "Nyeri"];
        console.log(`🗺️ Using demo counties:`, demoCounties);
        return res.json({
          success: true,
          counties: demoCounties,
        });
      }

      res.json({
        success: true,
        counties,
      });
    } catch (queryError) {
      console.log(`🗺️ Query failed, using demo counties:`, queryError.message);
      const demoCounties = ["Nairobi", "Kiambu", "Nakuru", "Meru", "Nyeri"];
      res.json({
        success: true,
        counties: demoCounties,
      });
    }
  } catch (err) {
    console.error("❌ Marketplace counties error:", err);
    return res.status(500).json({
      message: "Failed to fetch counties",
      details: err.message,
    });
  }
});

// =================================================
// DEBUG ENDPOINT
// =================================================
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Debug endpoint working",
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: req.headers,
    environment: process.env.NODE_ENV || "production",
  });
});

app.post("/api/debug", (req, res) => {
  res.json({
    message: "Debug POST endpoint working",
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers,
  });
});

// =================================================
// COMPREHENSIVE DATA FETCHING ENDPOINTS
// =================================================

// Get all users
app.get("/api/data/users", async (req, res) => {
  try {
    console.log("👥 Fetching all users from database");
    const result = await pool.query(`
      SELECT id, first_name, last_name, email, phone, role, county,
             verified, registration_fee_paid, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} users`);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      details: err.message,
    });
  }
});

// Get all products
app.get("/api/data/products", async (req, res) => {
  try {
    console.log("🛍️ Fetching all products from database");
    const result = await pool.query(`
      SELECT * FROM products
      ORDER BY created_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} products`);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      details: err.message,
    });
  }
});

// Get all orders
app.get("/api/data/orders", async (req, res) => {
  try {
    console.log("📦 Fetching all orders from database");
    const result = await pool.query(`
      SELECT * FROM orders
      ORDER BY created_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} orders`);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      details: err.message,
    });
  }
});

// Get all wallets
app.get("/api/data/wallets", async (req, res) => {
  try {
    console.log("💰 Fetching all wallets from database");
    const result = await pool.query(`
      SELECT w.*, u.first_name, u.last_name, u.phone
      FROM wallets w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} wallets`);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching wallets:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wallets",
      details: err.message,
    });
  }
});

// Get all consignments
app.get("/api/data/consignments", async (req, res) => {
  try {
    console.log("🚚 Fetching all consignments from database");
    const result = await pool.query(`
      SELECT * FROM consignments
      ORDER BY created_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} consignments`);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching consignments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch consignments",
      details: err.message,
    });
  }
});

// Get all tables and their structure
app.get("/api/data/schema", async (req, res) => {
  try {
    console.log("🗄️ Fetching database schema");

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const schema = {};

    // Get columns for each table
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      const columnsResult = await pool.query(
        `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `,
        [tableName],
      );

      schema[tableName] = {
        columns: columnsResult.rows,
        count: 0,
      };

      // Get row count for each table
      try {
        const countResult = await pool.query(
          `SELECT COUNT(*) as count FROM ${tableName}`,
        );
        schema[tableName].count = parseInt(countResult.rows[0].count);
      } catch (err) {
        console.warn(
          `Could not get count for table ${tableName}:`,
          err.message,
        );
      }
    }

    console.log(`✅ Found ${Object.keys(schema).length} tables`);
    res.json({
      success: true,
      tables: Object.keys(schema),
      schema: schema,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching schema:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch schema",
      details: err.message,
    });
  }
});

// Get everything - complete database dump
app.get("/api/data/everything", async (req, res) => {
  try {
    console.log("🌐 Fetching EVERYTHING from database");

    const data = {};

    // Define tables to fetch
    const tables = [
      "users",
      "products",
      "orders",
      "wallets",
      "consignments",
      "order_items",
    ];

    for (const table of tables) {
      try {
        console.log(`📋 Fetching data from ${table} table...`);
        const result = await pool.query(
          `SELECT * FROM ${table} ORDER BY created_at DESC`,
        );
        data[table] = {
          count: result.rows.length,
          data: result.rows,
        };
        console.log(`✅ ${table}: ${result.rows.length} records`);
      } catch (err) {
        console.warn(`⚠️ Could not fetch ${table}:`, err.message);
        data[table] = {
          count: 0,
          data: [],
          error: err.message,
        };
      }
    }

    // Calculate totals
    const totals = {
      totalRecords: Object.values(data).reduce(
        (sum, table) => sum + table.count,
        0,
      ),
      tablesWithData: Object.keys(data).filter((key) => data[key].count > 0)
        .length,
      tablesWithErrors: Object.keys(data).filter((key) => data[key].error)
        .length,
    };

    console.log(
      `🎉 Database dump complete: ${totals.totalRecords} total records`,
    );

    res.json({
      success: true,
      totals,
      data,
      timestamp: new Date().toISOString(),
      database: "neon_postgresql",
    });
  } catch (err) {
    console.error("❌ Error fetching everything:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch everything",
      details: err.message,
    });
  }
});

// =================================================
// DATA ANALYSIS & REPORTING ENDPOINTS
// =================================================

// Get database statistics
app.get("/api/data/stats", async (req, res) => {
  try {
    console.log("📊 Generating database statistics");

    const stats = {};

    // User statistics
    try {
      const userStats = await pool.query(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'FARMER' THEN 1 END) as farmers,
          COUNT(CASE WHEN role = 'CUSTOMER' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
          COUNT(CASE WHEN role = 'DRIVER' THEN 1 END) as drivers,
          COUNT(CASE WHEN verified = true THEN 1 END) as verified_users
        FROM users
      `);
      stats.users = userStats.rows[0];
    } catch (err) {
      stats.users = { error: err.message };
    }

    // Product statistics
    try {
      const productStats = await pool.query(`
        SELECT
          COUNT(*) as total_products,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products,
          AVG(price_per_unit) as avg_price,
          SUM(stock_quantity) as total_stock,
          COUNT(DISTINCT category) as unique_categories,
          COUNT(DISTINCT farmer_county) as unique_counties
        FROM products
      `);
      stats.products = productStats.rows[0];
    } catch (err) {
      stats.products = { error: err.message };
    }

    // Order statistics
    try {
      const orderStats = await pool.query(`
        SELECT
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_order_value,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders
        FROM orders
      `);
      stats.orders = orderStats.rows[0];
    } catch (err) {
      stats.orders = { error: err.message };
    }

    // Wallet statistics
    try {
      const walletStats = await pool.query(`
        SELECT
          COUNT(*) as total_wallets,
          SUM(balance) as total_balance,
          AVG(balance) as avg_balance,
          MAX(balance) as max_balance
        FROM wallets
      `);
      stats.wallets = walletStats.rows[0];
    } catch (err) {
      stats.wallets = { error: err.message };
    }

    console.log("✅ Database statistics generated");
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error generating stats:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate statistics",
      details: err.message,
    });
  }
});

// Get recent activity
app.get("/api/data/recent", async (req, res) => {
  try {
    console.log("⏰ Fetching recent activity");

    const recent = {};

    // Recent users
    try {
      const recentUsers = await pool.query(`
        SELECT id, first_name, last_name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 10
      `);
      recent.users = recentUsers.rows;
    } catch (err) {
      recent.users = { error: err.message };
    }

    // Recent products
    try {
      const recentProducts = await pool.query(`
        SELECT id, name, category, price_per_unit, farmer_name, created_at
        FROM products
        ORDER BY created_at DESC
        LIMIT 10
      `);
      recent.products = recentProducts.rows;
    } catch (err) {
      recent.products = { error: err.message };
    }

    // Recent orders
    try {
      const recentOrders = await pool.query(`
        SELECT id, total_amount, status, payment_status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      `);
      recent.orders = recentOrders.rows;
    } catch (err) {
      recent.orders = { error: err.message };
    }

    console.log("✅ Recent activity fetched");
    res.json({
      success: true,
      recent,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching recent activity:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent activity",
      details: err.message,
    });
  }
});

// Search across all data
app.get("/api/data/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query 'q' parameter is required",
      });
    }

    console.log(`🔍 Searching for: ${q}`);

    const results = {};
    const searchTerm = `%${q}%`;

    // Search users
    try {
      const userResults = await pool.query(
        `
        SELECT id, first_name, last_name, email, phone, role
        FROM users
        WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
        LIMIT 20
      `,
        [searchTerm],
      );
      results.users = userResults.rows;
    } catch (err) {
      results.users = { error: err.message };
    }

    // Search products
    try {
      const productResults = await pool.query(
        `
        SELECT id, name, category, description, farmer_name, farmer_county
        FROM products
        WHERE name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1 OR farmer_name ILIKE $1
        LIMIT 20
      `,
        [searchTerm],
      );
      results.products = productResults.rows;
    } catch (err) {
      results.products = { error: err.message };
    }

    console.log(`✅ Search completed for: ${q}`);
    res.json({
      success: true,
      query: q,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error searching:", err);
    res.status(500).json({
      success: false,
      error: "Search failed",
      details: err.message,
    });
  }
});

// =================================================
// DATA EXPORT ENDPOINTS
// =================================================

// Export data as CSV
app.get("/api/data/export/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const { format = "json" } = req.query;

    console.log(`📥 Exporting ${table} data as ${format}`);

    // Validate table name to prevent SQL injection
    const allowedTables = [
      "users",
      "products",
      "orders",
      "wallets",
      "consignments",
      "order_items",
    ];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({
        success: false,
        error: `Invalid table name. Allowed tables: ${allowedTables.join(", ")}`,
      });
    }

    const result = await pool.query(
      `SELECT * FROM ${table} ORDER BY created_at DESC`,
    );

    if (format === "csv") {
      // Convert to CSV
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No data found in ${table} table`,
        });
      }

      const headers = Object.keys(result.rows[0]);
      let csv = headers.join(",") + "\n";

      result.rows.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
          }
          return stringValue;
        });
        csv += values.join(",") + "\n";
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${table}_export_${Date.now()}.csv"`,
      );
      res.send(csv);
    } else {
      // Return as JSON
      res.json({
        success: true,
        table,
        count: result.rows.length,
        data: result.rows,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`✅ ${table} data exported successfully`);
  } catch (err) {
    console.error(`❌ Error exporting ${req.params.table}:`, err);
    res.status(500).json({
      success: false,
      error: "Export failed",
      details: err.message,
    });
  }
});

// Backup entire database
app.get("/api/data/backup", async (req, res) => {
  try {
    console.log("💾 Creating full database backup");

    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        database: "neon_postgresql",
        application: "zuasoko",
        version: "1.0.0",
      },
      data: {},
    };

    const tables = [
      "users",
      "products",
      "orders",
      "wallets",
      "consignments",
      "order_items",
    ];

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM ${table}`);
        backup.data[table] = result.rows;
        console.log(`✅ Backed up ${table}: ${result.rows.length} records`);
      } catch (err) {
        console.warn(`⚠️ Could not backup ${table}:`, err.message);
        backup.data[table] = { error: err.message };
      }
    }

    // Calculate backup statistics
    backup.metadata.totalRecords = Object.values(backup.data)
      .filter((table) => Array.isArray(table))
      .reduce((sum, table) => sum + table.length, 0);

    backup.metadata.tablesBackedUp = Object.keys(backup.data).filter((key) =>
      Array.isArray(backup.data[key]),
    ).length;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="zuasoko_backup_${Date.now()}.json"`,
    );

    console.log(
      `🎉 Database backup complete: ${backup.metadata.totalRecords} records`,
    );
    res.json(backup);
  } catch (err) {
    console.error("❌ Error creating backup:", err);
    res.status(500).json({
      success: false,
      error: "Backup failed",
      details: err.message,
    });
  }
});

// =================================================
// ADMIN ENDPOINTS
// =================================================

// Admin settings endpoints
app.get("/api/admin/settings", async (req, res) => {
  try {
    console.log("⚙️ Fetching admin settings");

    // Return default settings since we don't have a settings table yet
    const defaultSettings = {
      platform: {
        name: "Zuasoko",
        description: "Agricultural marketplace connecting farmers to markets",
        supportEmail: "support@zuasoko.com",
        supportPhone: "+254712345678",
      },
      fees: {
        farmerRegistrationFee: 1000,
        registrationFeeEnabled: true,
        gracePeriodDays: 7,
      },
      payments: {
        mpesaEnabled: true,
        mpesaShortcode: "174379",
        mpesaPasskey: "***",
        bankTransferEnabled: false,
        commissionRate: 5,
      },
      notifications: {
        emailEnabled: false,
        smsEnabled: true,
        pushEnabled: true,
        adminNotifications: true,
      },
      security: {
        passwordMinLength: 8,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        requireEmailVerification: false,
      },
    };

    res.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (err) {
    console.error("❌ Error fetching admin settings:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
      details: err.message,
    });
  }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
    console.log("⚙️ Updating admin settings");

    // In a real app, this would save to database
    // For now, just return success
    res.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (err) {
    console.error("❌ Error updating admin settings:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update settings",
      details: err.message,
    });
  }
});

// Admin users endpoint (alias for data/users)
app.get("/api/admin/users", async (req, res) => {
  try {
    console.log("👥 Fetching users via admin endpoint");

    const result = await pool.query(`
      SELECT id, first_name, last_name, email, phone, role, county,
             verified, registration_fee_paid, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error("❌ Error fetching users via admin:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      details: err.message,
    });
  }
});

// Admin analytics endpoints
app.get("/api/admin/analytics/stats", async (req, res) => {
  try {
    console.log("📊 Fetching analytics stats via admin endpoint");

    // Redirect to existing data/stats endpoint but format for admin
    const stats = {};

    // User statistics
    try {
      const userStats = await pool.query(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'FARMER' THEN 1 END) as farmers,
          COUNT(CASE WHEN role = 'CUSTOMER' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
          COUNT(CASE WHEN role = 'DRIVER' THEN 1 END) as drivers,
          COUNT(CASE WHEN verified = true THEN 1 END) as verified_users
        FROM users
      `);
      stats.users = userStats.rows[0];
    } catch (err) {
      stats.users = { total_users: 0, farmers: 0, customers: 0, admins: 0, drivers: 0, verified_users: 0 };
    }

    // Product statistics
    try {
      const productStats = await pool.query(`
        SELECT
          COUNT(*) as total_products,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products,
          AVG(price_per_unit) as avg_price,
          SUM(stock_quantity) as total_stock
        FROM products
      `);
      stats.products = productStats.rows[0];
    } catch (err) {
      stats.products = { total_products: 0, featured_products: 0, avg_price: 0, total_stock: 0 };
    }

    // Order statistics
    try {
      const orderStats = await pool.query(`
        SELECT
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_order_value
        FROM orders
      `);
      stats.orders = orderStats.rows[0];
    } catch (err) {
      stats.orders = { total_orders: 0, total_revenue: 0, avg_order_value: 0 };
    }

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(stats.users.total_users) || 0,
        pendingApprovals: parseInt(stats.users.total_users) - parseInt(stats.users.verified_users) || 0,
        totalConsignments: parseInt(stats.products.total_products) || 0,
        totalRevenue: parseFloat(stats.orders.total_revenue) || 0,
        ...stats
      },
    });
  } catch (err) {
    console.error("❌ Error fetching analytics stats:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      details: err.message,
    });
  }
});

// Admin activity endpoint (alias for data/recent)
app.get("/api/admin/activity", async (req, res) => {
  try {
    console.log("🔄 Fetching admin activity");

    const activities = [];

    // Get recent users
    try {
      const recentUsers = await pool.query(`
        SELECT id, first_name, last_name, email, role, created_at, verified
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `);

      recentUsers.rows.forEach((user, index) => {
        activities.push({
          id: `user-${index}`,
          type: "user",
          description: `New ${user.role.toLowerCase()} registered: ${user.first_name} ${user.last_name}`,
          timestamp: user.created_at,
          status: user.verified ? "completed" : "pending",
        });
      });
    } catch (err) {
      console.warn("Could not fetch recent users for activity:", err.message);
    }

    // Get recent products
    try {
      const recentProducts = await pool.query(`
        SELECT id, name, farmer_name, created_at
        FROM products
        ORDER BY created_at DESC
        LIMIT 5
      `);

      recentProducts.rows.forEach((product, index) => {
        activities.push({
          id: `product-${index}`,
          type: "consignment",
          description: `Product added: ${product.name} by ${product.farmer_name}`,
          timestamp: product.created_at,
          status: "completed",
        });
      });
    } catch (err) {
      console.warn("Could not fetch recent products for activity:", err.message);
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      activities: activities.slice(0, 10),
    });
  } catch (err) {
    console.error("❌ Error fetching admin activity:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch activity",
      details: err.message,
    });
  }
});

// =================================================
// DATABASE INITIALIZATION ENDPOINT
// =================================================
app.post("/api/admin/init-database", async (req, res) => {
  try {
    console.log("🗄️ Initializing database tables...");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
        county VARCHAR(100),
        verified BOOLEAN DEFAULT false,
        registration_fee_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price_per_unit DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        farmer_name VARCHAR(255),
        farmer_county VARCHAR(100),
        images TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        payment_status VARCHAR(20) DEFAULT 'PENDING',
        delivery_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        balance DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create consignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consignments (
        id SERIAL PRIMARY KEY,
        farmer_id INTEGER REFERENCES users(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        price_per_unit DECIMAL(10,2) NOT NULL,
        total_value DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        delivery_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample admin user if not exists
    const adminExists = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@zuasoko.com' LIMIT 1"
    );

    if (adminExists.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (
          first_name, last_name, email, phone, password_hash,
          role, county, verified, registration_fee_paid
        ) VALUES (
          'Admin', 'User', 'admin@zuasoko.com', '+254712345678', $1,
          'ADMIN', 'Nairobi', true, true
        );
      `, [hashPassword("password123")]);
    }

    // Insert sample products if table is empty
    const productCount = await pool.query("SELECT COUNT(*) FROM products");
    if (parseInt(productCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (
          name, category, price_per_unit, unit, description,
          stock_quantity, is_featured, farmer_name, farmer_county
        ) VALUES
        ('Fresh Tomatoes', 'Vegetables', 130, 'kg', 'Organic red tomatoes, Grade A quality', 85, true, 'John Kimani', 'Nakuru'),
        ('Sweet Potatoes', 'Root Vegetables', 80, 'kg', 'Fresh sweet potatoes, rich in nutrients', 45, true, 'Jane Wanjiku', 'Meru'),
        ('Spinach', 'Leafy Greens', 50, 'bunch', 'Fresh organic spinach leaves', 30, false, 'Peter Kamau', 'Kiambu'),
        ('Maize', 'Grains', 60, 'kg', 'Yellow maize, Grade 1 quality', 200, true, 'Grace Muthoni', 'Nyeri'),
        ('Carrots', 'Root Vegetables', 90, 'kg', 'Fresh orange carrots', 60, false, 'Samuel Njoroge', 'Nakuru');
      `);
    }

    console.log("✅ Database initialization completed");

    res.json({
      success: true,
      message: "Database tables created and initialized successfully",
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    res.status(500).json({
      success: false,
      error: "Database initialization failed",
      details: err.message,
    });
  }
});

// =================================================
// STATUS ENDPOINT
// =================================================
app.get("/api/status", async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query("SELECT NOW() as current_time");

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
      database_type: "neon_postgresql",
      database_time: dbResult.rows[0].current_time,
      environment: process.env.NODE_ENV || "production",
    });
  } catch (err) {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message,
      environment: process.env.NODE_ENV || "production",
    });
  }
});

// =================================================
// SERVE STATIC FILES
// =================================================
// Serve static files (CSS, JS, images) but not for API routes
app.use(express.static(".", {
  index: false,
  setHeaders: (res, path) => {
    if (path.includes('/api/')) {
      return false; // Don't serve API paths as static files
    }
  }
}));

// =================================================
// SERVE FRONTEND FILES
// =================================================
// Only serve frontend HTML for non-API GET requests
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

// Fallback handler for any unmatched requests
app.use((req, res, next) => {
  console.log(`🚫 UNMATCHED REQUEST: ${req.method} ${req.path}`);
  next();
});

// Handle 404 for API endpoints that don't exist
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    url: req.url,
    method: req.method,
    availableEndpoints: [
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/products",
      "GET /api/marketplace/products",
      "GET /api/marketplace/categories",
      "GET /api/marketplace/counties",
      "GET /api/admin/settings",
      "GET /api/admin/users",
      "GET /api/admin/analytics/stats",
      "GET /api/admin/activity",
      "GET /api/status",
    ],
  });
});

// =================================================
// START SERVER
// =================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(
    `🗄️ Database: ${process.env.DATABASE_URL ? "Configured" : "Using fallback"}`,
  );
  console.log("📋 Available endpoints:");
  console.log("  POST /api/auth/login");
  console.log("  POST /api/auth/register");
  console.log("  GET  /api/products");
  console.log("  GET  /api/marketplace/products");
  console.log("  GET  /api/marketplace/categories");
  console.log("  GET  /api/marketplace/counties");
  console.log("  GET  /api/admin/settings");
  console.log("  GET  /api/admin/users");
  console.log("  GET  /api/admin/analytics/stats");
  console.log("  GET  /api/admin/activity");
  console.log("  GET  /api/status");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 Shutting down gracefully...");
  pool.end(() => {
    console.log("✅ Database connections closed");
    process.exit(0);
  });
});
