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
app.use(express.static(".")); // Serve static files

// Database connection with your live Render.com credentials
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
// LOGIN ENDPOINT - EXACTLY AS YOU REQUESTED
// =================================================
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🚀 Login request received");

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
    const { firstName, lastName, email, phone, password, role, county, categories } =
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

      // Add farmer categories if provided
      if (categories && Array.isArray(categories) && categories.length > 0) {
        for (const categoryId of categories) {
          try {
            await pool.query(
              "INSERT INTO farmer_categories (farmer_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [userId, categoryId],
            );
          } catch (categoryError) {
            console.log(`⚠️ Could not assign category ${categoryId}:`, categoryError.message);
          }
        }
      }
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
// FARMER CATEGORIES ENDPOINTS
// =================================================

// GET /api/farmer-categories - Get all available farmer categories
app.get("/api/farmer-categories", async (req, res) => {
  try {
    console.log("📂 Farmer categories request received");

    const result = await pool.query(`
      SELECT id, name, description, is_active
      FROM farmer_categories_list
      WHERE is_active = true
      ORDER BY name
    `);

    console.log(`📂 Found ${result.rows.length} farmer categories`);

    res.json({
      success: true,
      categories: result.rows,
    });
  } catch (err) {
    console.error("❌ Farmer categories error:", err);
    return res.status(500).json({
      message: "Failed to fetch farmer categories",
      details: err.message,
    });
  }
});

// GET /api/farmer/:id/categories - Get categories for a specific farmer
app.get("/api/farmer/:id/categories", async (req, res) => {
  try {
    const farmerId = req.params.id;
    console.log(`📂 Farmer ${farmerId} categories request received`);

    const result = await pool.query(`
      SELECT fcl.id, fcl.name, fcl.description
      FROM farmer_categories fc
      JOIN farmer_categories_list fcl ON fc.category_id = fcl.id
      WHERE fc.farmer_id = $1 AND fcl.is_active = true
      ORDER BY fcl.name
    `, [farmerId]);

    console.log(`📂 Found ${result.rows.length} categories for farmer ${farmerId}`);

    res.json({
      success: true,
      categories: result.rows,
    });
  } catch (err) {
    console.error("❌ Farmer categories error:", err);
    return res.status(500).json({
      message: "Failed to fetch farmer categories",
      details: err.message,
    });
  }
});

// =================================================
// ADMIN ENDPOINTS
// =================================================

// JWT middleware for admin routes
const authenticateAdmin = (req, res, next) => {
  console.log('🔐 Admin auth middleware called for:', req.method, req.path);

  const authHeader = req.headers.authorization;
  console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing');

  const token = authHeader && authHeader.split(' ')[1];
  console.log('🔐 Token extracted:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zuasoko-production-secret-2024');
    console.log('🔐 Token decoded successfully:', { userId: decoded.userId, role: decoded.role });

    if (decoded.role !== 'ADMIN') {
      console.log('❌ User role is not ADMIN:', decoded.role);
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    console.log('✅ Admin authentication successful');
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/admin/users
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
  try {
    console.log("👥 Admin users request received");

    // First check what columns exist in the users table
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
    `);

    const columns = columnsResult.rows.map(row => row.column_name);
    console.log("👥 Available user columns:", columns);

    // Build query based on available columns
    let selectColumns = "id, first_name, last_name, email, phone, role, county, verified, created_at";

    if (columns.includes('registration_fee_paid')) {
      selectColumns += ", registration_fee_paid";
    }

    const result = await pool.query(`
      SELECT ${selectColumns}
      FROM users
      ORDER BY created_at DESC
    `);

    console.log(`👥 Found ${result.rows.length} users`);

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (err) {
    console.error("❌ Admin users error:", err);
    res.status(500).json({
      message: "Failed to fetch users",
      details: err.message,
    });
  }
});

// POST /api/admin/users/:id/approve
app.post("/api/admin/users/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ Admin approving user: ${id}`);

    const result = await pool.query(
      "UPDATE users SET verified = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User ${id} approved successfully`);

    res.json({
      success: true,
      message: "User approved successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin approve user error:", err);
    res.status(500).json({
      message: "Failed to approve user",
      details: err.message,
    });
  }
});

// =================================================
// JWT MIDDLEWARE FOR PROTECTED ROUTES
// =================================================

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zuasoko-production-secret-2024');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// =================================================
// FARMER DASHBOARD ENDPOINTS
// =================================================

// GET /api/consignments - For farmer dashboard
app.get("/api/consignments", authenticateToken, async (req, res) => {
  try {
    console.log("📦 Farmer consignments request received");

    const userId = req.user.userId;
    const result = await pool.query(`
      SELECT id, title, description, category, quantity, unit,
             bid_price_per_unit as "bidPricePerUnit",
             final_price_per_unit as "finalPricePerUnit",
             status, location, harvest_date as "harvestDate",
             expiry_date as "expiryDate", images, created_at as "createdAt",
             admin_notes as "adminNotes"
      FROM consignments
      WHERE farmer_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    console.log(`📦 Found ${result.rows.length} consignments for farmer ${userId}`);

    res.json({
      success: true,
      consignments: result.rows,
    });
  } catch (err) {
    console.error("❌ Farmer consignments error:", err);
    // Return empty array instead of error to prevent .map errors
    res.json({
      success: true,
      consignments: [],
    });
  }
});

// GET /api/wallet - For farmer wallet
app.get("/api/wallet", authenticateToken, async (req, res) => {
  try {
    console.log("💰 Farmer wallet request received");

    const userId = req.user.userId;

    // First check what columns exist in the wallets table
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'wallets' AND table_schema = 'public'
    `);

    const columns = columnsResult.rows.map(row => row.column_name);
    console.log("💰 Available wallet columns:", columns);

    let wallet = { balance: 0, transactions: [] };

    // Try to get wallet data based on available columns
    try {
      let walletQuery = "SELECT balance FROM wallets WHERE ";
      let userColumn = "user_id";

      if (columns.includes('farmer_id')) {
        userColumn = "farmer_id";
      } else if (columns.includes('user_id')) {
        userColumn = "user_id";
      } else if (columns.includes('id')) {
        userColumn = "id";
      }

      walletQuery += `${userColumn} = $1`;

      const walletResult = await pool.query(walletQuery, [userId]);

      if (walletResult.rows.length > 0) {
        wallet.balance = parseFloat(walletResult.rows[0].balance) || 0;
      }

      console.log(`💰 Wallet balance: ${wallet.balance}`);
    } catch (walletErr) {
      console.log("💰 Wallet table not found or no data, using default balance");
    }

    // Try to get transaction history
    try {
      const transactionsResult = await pool.query(`
        SELECT id, type, amount, description, created_at as "createdAt"
        FROM wallet_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [userId]);

      wallet.transactions = transactionsResult.rows || [];
    } catch (transErr) {
      console.log("💰 Transactions table not found, using empty array");
      wallet.transactions = [];
    }

    res.json({
      success: true,
      wallet,
    });
  } catch (err) {
    console.error("❌ Farmer wallet error:", err);
    // Always return a valid wallet structure to prevent frontend errors
    res.json({
      success: true,
      wallet: {
        balance: 0,
        transactions: [],
      },
    });
  }
});

// GET /api/notifications - For farmer notifications
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    console.log("🔔 Farmer notifications request received");

    const userId = req.user.userId;
    const result = await pool.query(`
      SELECT id, title, message, type, is_read as "isRead",
             created_at as "createdAt"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    console.log(`🔔 Found ${result.rows.length} notifications`);

    res.json({
      success: true,
      notifications: result.rows,
    });
  } catch (err) {
    console.error("❌ Farmer notifications error:", err);
    // Return empty array to prevent errors
    res.json({
      success: true,
      notifications: [],
    });
  }
});

// POST /api/consignments - Submit new consignment
app.post("/api/consignments", authenticateToken, async (req, res) => {
  try {
    console.log("📦 New consignment submission received");

    const userId = req.user.userId;
    const { title, description, category, quantity, unit, bidPricePerUnit, location, harvestDate, expiryDate, images } = req.body;

    const result = await pool.query(`
      INSERT INTO consignments (farmer_id, title, description, category, quantity, unit,
                              bid_price_per_unit, location, harvest_date, expiry_date, images, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
      RETURNING id
    `, [userId, title, description, category, quantity, unit, bidPricePerUnit, location, harvestDate, expiryDate, JSON.stringify(images)]);

    console.log(`📦 Consignment created with ID: ${result.rows[0].id}`);

    res.json({
      success: true,
      message: "Consignment submitted successfully",
      consignmentId: result.rows[0].id,
    });
  } catch (err) {
    console.error("❌ Consignment submission error:", err);
    res.status(500).json({
      message: "Failed to submit consignment",
      details: err.message,
    });
  }
});

// POST /api/wallet/withdraw - Withdraw from wallet
app.post("/api/wallet/withdraw", authenticateToken, async (req, res) => {
  try {
    console.log("💸 Wallet withdrawal request received");

    const userId = req.user.userId;
    const { amount, phoneNumber } = req.body;

    // Check wallet balance
    const walletResult = await pool.query(
      "SELECT balance FROM wallets WHERE user_id = $1",
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const currentBalance = parseFloat(walletResult.rows[0].balance);
    if (currentBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update wallet balance
    await pool.query(
      "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2",
      [amount, userId]
    );

    // Record transaction
    await pool.query(`
      INSERT INTO wallet_transactions (user_id, type, amount, description)
      VALUES ($1, 'DEBIT', $2, $3)
    `, [userId, amount, `Withdrawal to ${phoneNumber}`]);

    console.log(`💸 Withdrawal of ${amount} processed for user ${userId}`);

    res.json({
      success: true,
      message: "Withdrawal initiated successfully",
    });
  } catch (err) {
    console.error("❌ Wallet withdrawal error:", err);
    res.status(500).json({
      error: "Failed to process withdrawal",
      details: err.message,
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    console.log(`🔔 Marking notification ${req.params.id} as read`);

    const { id } = req.params;
    const userId = req.user.userId;

    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (err) {
    console.error("❌ Mark notification error:", err);
    res.status(500).json({
      message: "Failed to mark notification as read",
      details: err.message,
    });
  }
});

// =================================================
// CUSTOMER DASHBOARD ENDPOINTS
// =================================================

// GET /api/orders - For customer orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    console.log("🛒 Customer orders request received");

    const userId = req.user.userId;

    // First check what columns exist in the orders table
    const columnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND table_schema = 'public'
    `);

    const columns = columnsResult.rows.map(row => row.column_name);
    console.log("🛒 Available order columns:", columns);

    // Build query based on available columns
    let selectColumns = `o.id,
                        o.total_amount as "totalAmount",
                        o.status,
                        o.created_at as "orderDate"`;

    if (columns.includes('payment_method')) {
      selectColumns += ', o.payment_method as "paymentMethod"';
    }
    if (columns.includes('payment_status')) {
      selectColumns += ', o.payment_status as "paymentStatus"';
    }
    if (columns.includes('delivery_address')) {
      selectColumns += ', o.delivery_address as "deliveryAddress"';
    }
    if (columns.includes('delivery_phone')) {
      selectColumns += ', o.delivery_phone as "deliveryPhone"';
    }
    if (columns.includes('estimated_delivery')) {
      selectColumns += ', o.estimated_delivery as "estimatedDelivery"';
    }

    const result = await pool.query(`
      SELECT ${selectColumns}
      FROM orders o
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);

    console.log(`🛒 Found ${result.rows.length} orders for customer ${userId}`);

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (err) {
    console.error("❌ Customer orders error:", err);
    // Return empty array to prevent errors
    res.json({
      success: true,
      orders: [],
    });
  }
});

// =================================================
// ADMIN ANALYTICS ENDPOINTS
// =================================================

// GET /api/admin/analytics/stats
app.get("/api/admin/analytics/stats", authenticateAdmin, async (req, res) => {
  try {
    console.log("📊 Admin analytics stats request received");

    // Get user count
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    const totalUsers = parseInt(userCount.rows[0].count);

    // Get pending users
    const pendingUsers = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE verified = false"
    );
    const pendingApprovals = parseInt(pendingUsers.rows[0].count);

    // Get consignment count
    const consignmentCount = await pool.query("SELECT COUNT(*) as count FROM consignments");
    const totalConsignments = parseInt(consignmentCount.rows[0].count);

    // Get revenue (this would be calculated based on your business logic)
    const totalRevenue = 150000; // Placeholder

    console.log(`📊 Stats: ${totalUsers} users, ${pendingApprovals} pending, ${totalConsignments} consignments`);

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingApprovals,
        totalConsignments,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("❌ Admin analytics error:", err);
    res.json({
      success: true,
      stats: {
        totalUsers: 0,
        pendingApprovals: 0,
        totalConsignments: 0,
        totalRevenue: 0,
      },
    });
  }
});

// GET /api/admin/activity
app.get("/api/admin/activity", authenticateAdmin, async (req, res) => {
  try {
    console.log("🔄 Admin activity request received");

    // For now, return static activity data
    // In a real app, you'd have an activity/audit log table
    const activities = [
      {
        id: 1,
        type: "user",
        description: "New farmer registration",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: "consignment",
        description: "New consignment submitted",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    res.json({
      success: true,
      activities,
    });
  } catch (err) {
    console.error("❌ Admin activity error:", err);
    res.json({
      success: true,
      activities: [],
    });
  }
});

// =================================================
// DRIVER DASHBOARD ENDPOINTS
// =================================================

// GET /api/driver/available-deliveries - Get available deliveries for driver
app.get("/api/driver/available-deliveries", authenticateToken, async (req, res) => {
  try {
    console.log("🚛 Driver available deliveries request received");

    const driverId = req.user.userId;

    // Get consignments that need driver assignment or are ready for pickup
    const result = await pool.query(`
      SELECT c.id, c.title, c.description, c.location, c.quantity, c.unit,
             c.bid_price_per_unit as "bidPricePerUnit", c.status,
             c.created_at as "createdAt", u.first_name as "farmerFirstName",
             u.last_name as "farmerLastName", u.county as "farmerCounty"
      FROM consignments c
      JOIN users u ON c.farmer_id = u.id
      WHERE c.status IN ('APPROVED', 'PRICE_SUGGESTED')
      AND c.driver_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT 20
    `);

    console.log(`🚛 Found ${result.rows.length} available deliveries`);

    res.json({
      success: true,
      deliveries: result.rows,
    });
  } catch (err) {
    console.error("❌ Available deliveries error:", err);
    res.json({
      success: true,
      deliveries: [],
    });
  }
});

// POST /api/driver/accept-delivery - Accept a delivery assignment
app.post("/api/driver/accept-delivery", authenticateToken, async (req, res) => {
  try {
    console.log("🚛 Driver accepting delivery");

    const driverId = req.user.userId;
    const { consignmentId } = req.body;

    // Update consignment with driver assignment
    const result = await pool.query(`
      UPDATE consignments
      SET driver_id = $1, status = 'DRIVER_ASSIGNED', updated_at = NOW()
      WHERE id = $2 AND driver_id IS NULL
      RETURNING id, title
    `, [driverId, consignmentId]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Delivery no longer available"
      });
    }

    console.log(`🚛 Driver ${driverId} accepted delivery ${consignmentId}`);

    res.json({
      success: true,
      message: "Delivery accepted successfully",
      delivery: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Accept delivery error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to accept delivery"
    });
  }
});

// POST /api/driver/report-issue - Submit driver issue report
app.post("/api/driver/report-issue", authenticateToken, async (req, res) => {
  try {
    console.log("🚛 Driver reporting issue");

    const driverId = req.user.userId;
    const { type, description, deliveryId, severity } = req.body;

    const result = await pool.query(`
      INSERT INTO driver_issues (driver_id, type, description, delivery_id, severity, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'OPEN', NOW())
      RETURNING id
    `, [driverId, type, description, deliveryId || null, severity]);

    console.log(`🚛 Issue reported with ID: ${result.rows[0].id}`);

    res.json({
      success: true,
      message: "Issue reported successfully",
      issueId: result.rows[0].id
    });
  } catch (err) {
    console.error("❌ Report issue error:", err);

    // If table doesn't exist, create it
    if (err.code === '42P01') {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS driver_issues (
            id SERIAL PRIMARY KEY,
            driver_id UUID NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            delivery_id UUID,
            severity VARCHAR(20) NOT NULL DEFAULT 'medium',
            status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
            admin_response TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);

        // Retry the insert
        const retryResult = await pool.query(`
          INSERT INTO driver_issues (driver_id, type, description, delivery_id, severity, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'OPEN', NOW())
          RETURNING id
        `, [driverId, type, description, deliveryId || null, severity]);

        res.json({
          success: true,
          message: "Issue reported successfully",
          issueId: retryResult.rows[0].id
        });
      } catch (createErr) {
        console.error("❌ Failed to create issues table:", createErr);
        res.status(500).json({
          success: false,
          message: "Failed to report issue"
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to report issue"
      });
    }
  }
});

// GET /api/driver/earnings - Get driver earnings data
app.get("/api/driver/earnings", authenticateToken, async (req, res) => {
  try {
    console.log("🚛 Driver earnings request received");

    const driverId = req.user.userId;

    // Get earnings from completed deliveries
    const earningsResult = await pool.query(`
      SELECT
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN c.status = 'DELIVERED' AND c.created_at >= CURRENT_DATE THEN
          (c.final_price_per_unit * c.quantity * 0.1)
          ELSE 0 END) as today_earnings,
        SUM(CASE WHEN c.status = 'DELIVERED' AND c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN
          (c.final_price_per_unit * c.quantity * 0.1)
          ELSE 0 END) as week_earnings,
        SUM(CASE WHEN c.status = 'DELIVERED' AND c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN
          (c.final_price_per_unit * c.quantity * 0.1)
          ELSE 0 END) as month_earnings,
        SUM(CASE WHEN c.status = 'DELIVERED' THEN
          (c.final_price_per_unit * c.quantity * 0.1)
          ELSE 0 END) as total_earnings
      FROM consignments c
      WHERE c.driver_id = $1
    `, [driverId]);

    // Get recent payment history
    const paymentsResult = await pool.query(`
      SELECT
        DATE(c.updated_at) as payment_date,
        COUNT(*) as deliveries_count,
        SUM(c.final_price_per_unit * c.quantity * 0.1) as amount,
        'paid' as status
      FROM consignments c
      WHERE c.driver_id = $1 AND c.status = 'DELIVERED'
      AND c.updated_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(c.updated_at)
      ORDER BY payment_date DESC
      LIMIT 10
    `);

    const earnings = earningsResult.rows[0] || {
      total_deliveries: 0,
      today_earnings: 0,
      week_earnings: 0,
      month_earnings: 0,
      total_earnings: 0
    };

    console.log(`🚛 Driver earnings: Today ${earnings.today_earnings}, Week ${earnings.week_earnings}`);

    res.json({
      success: true,
      earnings: {
        today: parseFloat(earnings.today_earnings) || 0,
        week: parseFloat(earnings.week_earnings) || 0,
        month: parseFloat(earnings.month_earnings) || 0,
        total: parseFloat(earnings.total_earnings) || 0,
        totalDeliveries: parseInt(earnings.total_deliveries) || 0,
        recentPayments: paymentsResult.rows.map(row => ({
          date: row.payment_date,
          deliveries: parseInt(row.deliveries_count),
          amount: parseFloat(row.amount),
          status: row.status
        }))
      }
    });
  } catch (err) {
    console.error("❌ Driver earnings error:", err);
    res.json({
      success: true,
      earnings: {
        today: 0,
        week: 0,
        month: 0,
        total: 0,
        totalDeliveries: 0,
        recentPayments: []
      }
    });
  }
});

// =================================================
// ADMIN DRIVER MANAGEMENT ENDPOINTS
// =================================================

// GET /api/admin/driver-issues - Get all driver issue reports
app.get("/api/admin/driver-issues", authenticateAdmin, async (req, res) => {
  try {
    console.log("👨‍💼 Admin driver issues request received");

    const result = await pool.query(`
      SELECT di.*, u.first_name, u.last_name, u.phone, c.title as delivery_title
      FROM driver_issues di
      JOIN users u ON di.driver_id = u.id
      LEFT JOIN consignments c ON di.delivery_id = c.id
      ORDER BY di.created_at DESC
    `);

    console.log(`👨‍💼 Found ${result.rows.length} driver issues`);

    res.json({
      success: true,
      issues: result.rows
    });
  } catch (err) {
    console.error("❌ Admin driver issues error:", err);
    res.json({
      success: true,
      issues: []
    });
  }
});

// PUT /api/admin/driver-issues/:id/resolve - Resolve driver issue
app.put("/api/admin/driver-issues/:id/resolve", authenticateAdmin, async (req, res) => {
  try {
    console.log("👨‍💼 Admin resolving driver issue");

    const { id } = req.params;
    const { response } = req.body;

    const result = await pool.query(`
      UPDATE driver_issues
      SET status = 'RESOLVED', admin_response = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `, [response, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    console.log(`👨‍💼 Issue ${id} resolved`);

    res.json({
      success: true,
      message: "Issue resolved successfully"
    });
  } catch (err) {
    console.error("❌ Admin resolve issue error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to resolve issue"
    });
  }
});

// GET /api/admin/driver-earnings - Get all driver earnings overview
app.get("/api/admin/driver-earnings", authenticateAdmin, async (req, res) => {
  try {
    console.log("👨‍💼 Admin driver earnings request received");

    const result = await pool.query(`
      SELECT
        u.id, u.first_name, u.last_name, u.phone,
        COUNT(c.id) as total_deliveries,
        SUM(CASE WHEN c.status = 'DELIVERED' THEN
          (c.final_price_per_unit * c.quantity * 0.1)
          ELSE 0 END) as total_earnings,
        SUM(CASE WHEN c.status = 'DELIVERED' AND c.updated_at >= CURRENT_DATE - INTERVAL '30 days' THEN
          (c.final_price_per_unit * c.quantity * 0.1)
          ELSE 0 END) as month_earnings
      FROM users u
      LEFT JOIN consignments c ON c.driver_id = u.id
      WHERE u.role = 'DRIVER'
      GROUP BY u.id, u.first_name, u.last_name, u.phone
      ORDER BY total_earnings DESC
    `);

    console.log(`👨‍💼 Found ${result.rows.length} drivers with earnings data`);

    res.json({
      success: true,
      drivers: result.rows.map(row => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        phone: row.phone,
        totalDeliveries: parseInt(row.total_deliveries) || 0,
        totalEarnings: parseFloat(row.total_earnings) || 0,
        monthEarnings: parseFloat(row.month_earnings) || 0
      }))
    });
  } catch (err) {
    console.error("❌ Admin driver earnings error:", err);
    res.json({
      success: true,
      drivers: []
    });
  }
});

// =================================================
// ADMIN FARMER CATEGORIES ENDPOINTS
// =================================================

// GET /api/admin/farmer-categories - Get all farmer categories with stats
app.get("/api/admin/farmer-categories", authenticateAdmin, async (req, res) => {
  try {
    console.log("📂 Admin farmer categories request received");

    const result = await pool.query(`
      SELECT
        fcl.id,
        fcl.name,
        fcl.description,
        fcl.is_active,
        fcl.created_at,
        COUNT(fc.farmer_id) as farmer_count
      FROM farmer_categories_list fcl
      LEFT JOIN farmer_categories fc ON fcl.id = fc.category_id
      GROUP BY fcl.id, fcl.name, fcl.description, fcl.is_active, fcl.created_at
      ORDER BY fcl.name
    `);

    console.log(`📂 Found ${result.rows.length} farmer categories`);

    res.json({
      success: true,
      categories: result.rows,
    });
  } catch (err) {
    console.error("❌ Admin farmer categories error:", err);
    return res.status(500).json({
      message: "Failed to fetch farmer categories",
      details: err.message,
    });
  }
});

// POST /api/admin/farmer-categories - Create new farmer category
app.post("/api/admin/farmer-categories", authenticateAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log("📂 Admin creating farmer category:", { name, description });

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const result = await pool.query(`
      INSERT INTO farmer_categories_list (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, is_active, created_at
    `, [name.trim(), description || '', true]);

    console.log("✅ Farmer category created successfully");

    res.status(201).json({
      success: true,
      message: "Farmer category created successfully",
      category: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin create farmer category error:", err);
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        message: "Category name already exists",
      });
    }
    return res.status(500).json({
      message: "Failed to create farmer category",
      details: err.message,
    });
  }
});

// PUT /api/admin/farmer-categories/:id - Update farmer category
app.put("/api/admin/farmer-categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, is_active } = req.body;
    console.log("📂 Admin updating farmer category:", { categoryId, name, description, is_active });

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const result = await pool.query(`
      UPDATE farmer_categories_list
      SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, description, is_active, created_at, updated_at
    `, [name.trim(), description || '', is_active !== false, categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Farmer category not found" });
    }

    console.log("✅ Farmer category updated successfully");

    res.json({
      success: true,
      message: "Farmer category updated successfully",
      category: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin update farmer category error:", err);
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        message: "Category name already exists",
      });
    }
    return res.status(500).json({
      message: "Failed to update farmer category",
      details: err.message,
    });
  }
});

// DELETE /api/admin/farmer-categories/:id - Delete farmer category
app.delete("/api/admin/farmer-categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    console.log("📂 Admin deleting farmer category:", categoryId);

    // Check if category is being used by farmers
    const usageCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM farmer_categories
      WHERE category_id = $1
    `, [categoryId]);

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(409).json({
        message: "Cannot delete category that is currently assigned to farmers",
        farmersUsingCategory: parseInt(usageCheck.rows[0].count),
      });
    }

    const result = await pool.query(`
      DELETE FROM farmer_categories_list
      WHERE id = $1
      RETURNING id, name
    `, [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Farmer category not found" });
    }

    console.log("✅ Farmer category deleted successfully");

    res.json({
      success: true,
      message: "Farmer category deleted successfully",
      deletedCategory: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin delete farmer category error:", err);
    return res.status(500).json({
      message: "Failed to delete farmer category",
      details: err.message,
    });
  }
});

// =================================================
// ADMIN PRODUCT MANAGEMENT ENDPOINTS
// =================================================

// POST /api/admin/products - Create new product
app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const {
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
    } = req.body;

    console.log("📦 Admin creating product:", { name, category, price_per_unit });

    if (!name || !category || !price_per_unit || !unit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(`
      INSERT INTO products (
        name, description, category, quantity, unit, price_per_unit,
        images, stock_quantity, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      name,
      description || '',
      category,
      stock_quantity || 0,
      unit,
      parseFloat(price_per_unit),
      Array.isArray(images) ? images : [],
      stock_quantity || 0,
      true
    ]);

    console.log("✅ Product created successfully");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin create product error:", err);
    return res.status(500).json({
      message: "Failed to create product",
      details: err.message,
    });
  }
});

// PUT /api/admin/products/:id - Update product
app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const {
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
      is_active,
    } = req.body;

    console.log("📦 Admin updating product:", productId);

    if (!name || !category || !price_per_unit || !unit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(`
      UPDATE products
      SET name = $1, description = $2, category = $3, quantity = $4, unit = $5,
          price_per_unit = $6, images = $7, stock_quantity = $8, is_active = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [
      name,
      description || '',
      category,
      stock_quantity || 0,
      unit,
      parseFloat(price_per_unit),
      Array.isArray(images) ? images : [],
      stock_quantity || 0,
      is_active !== false,
      productId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product updated successfully");

    res.json({
      success: true,
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin update product error:", err);
    return res.status(500).json({
      message: "Failed to update product",
      details: err.message,
    });
  }
});

// DELETE /api/admin/products/:id - Delete product
app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("📦 Admin deleting product:", productId);

    const result = await pool.query(`
      DELETE FROM products
      WHERE id = $1
      RETURNING id, name
    `, [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product deleted successfully");

    res.json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Admin delete product error:", err);
    return res.status(500).json({
      message: "Failed to delete product",
      details: err.message,
    });
  }
});

// GET /api/admin/products - Get all products for admin management
app.get("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    console.log("📦 Admin products request received");

    const result = await pool.query(`
      SELECT
        p.*,
        'Admin' as farmer_name,
        'Central' as farmer_county
      FROM products p
      ORDER BY p.created_at DESC
    `);

    console.log(`📦 Found ${result.rows.length} products`);

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (err) {
    console.error("❌ Admin products error:", err);
    return res.status(500).json({
      message: "Failed to fetch products",
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
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
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
  console.log("  GET  /api/consignments (Farmer)");
  console.log("  POST /api/consignments (Farmer)");
  console.log("  GET  /api/wallet (Farmer)");
  console.log("  POST /api/wallet/withdraw (Farmer)");
  console.log("  GET  /api/notifications (Farmer)");
  console.log("  PUT  /api/notifications/:id/read (Farmer)");
  console.log("  GET  /api/orders (Customer)");
  console.log("  GET  /api/driver/available-deliveries (Driver)");
  console.log("  POST /api/driver/accept-delivery (Driver)");
  console.log("  POST /api/driver/report-issue (Driver)");
  console.log("  GET  /api/driver/earnings (Driver)");
  console.log("  GET  /api/admin/users (Admin only)");
  console.log("  POST /api/admin/users/:id/approve (Admin only)");
  console.log("  GET  /api/admin/analytics/stats (Admin only)");
  console.log("  GET  /api/admin/activity (Admin only)");
  console.log("  GET  /api/admin/driver-issues (Admin only)");
  console.log("  PUT  /api/admin/driver-issues/:id/resolve (Admin only)");
  console.log("  GET  /api/admin/driver-earnings (Admin only)");
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
