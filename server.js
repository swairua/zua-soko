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
app.use(express.json());
// Serve static files only for non-API routes
app.use(express.static(".", { index: false }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 Incoming request: ${req.method} ${req.url}`);
  console.log(`📝 Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📝 Body:`, req.body);
  }
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
// LOGIN ENDPOINT - EXACTLY AS YOU REQUESTED
// =================================================
// Special middleware for login route debugging
app.use("/api/auth/login", (req, res, next) => {
  console.log("🔥 LOGIN ROUTE MIDDLEWARE HIT!");
  console.log(`🔥 Method: ${req.method}`);
  console.log(`🔥 URL: ${req.url}`);
  console.log(`🔥 Body:`, req.body);
  next();
});

app.post("/api/auth/login", async (req, res) => {
  try {
    console.log(
      "🚀 Login request received - URL:",
      req.url,
      "Method:",
      req.method,
    );
    console.log("📝 Request headers:", req.headers);
    console.log("📝 Request body:", req.body);

    const { phone, password } = req.body;

    if (!phone || !password) {
      console.log("❌ Missing credentials");
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    console.log(`📱 Login attempt for: ${phone}`);

    // Query the DB and check credentials
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
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
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
