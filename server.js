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
// SERVE FRONTEND FILES
// =================================================
// Only serve frontend for GET requests that don't start with /api
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
