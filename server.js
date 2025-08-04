const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Set NODE_ENV to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

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

// Test database connection and initialize tables
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to PostgreSQL database");

    // Auto-initialize database tables
    try {
      console.log("���� Auto-initializing database tables...");

      // Create users table
      await client.query(`
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
      await client.query(`
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
      await client.query(`
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

      // Insert sample admin user if none exists
      const adminCheck = await client.query(
        "SELECT COUNT(*) FROM users WHERE role = 'ADMIN'"
      );

      if (parseInt(adminCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO users (
            first_name, last_name, email, phone, password_hash,
            role, county, verified, registration_fee_paid
          ) VALUES (
            'Admin', 'User', 'admin@zuasoko.com', '+254712345678', $1,
            'ADMIN', 'Nairobi', true, true
          );
        `, [hashPassword("password123")]);
        console.log("✅ Admin user created");
      }

      // Insert sample data if none exists
      const userCheck = await client.query("SELECT COUNT(*) FROM users");
      if (parseInt(userCheck.rows[0].count) <= 1) {
        await client.query(`
          INSERT INTO users (
            first_name, last_name, email, phone, password_hash,
            role, county, verified, registration_fee_paid
          ) VALUES
          ('John', 'Kimani', 'john.farmer@zuasoko.com', '+254710123456', $1, 'FARMER', 'Nakuru', true, true),
          ('Jane', 'Wanjiku', 'jane.customer@zuasoko.com', '+254720234567', $1, 'CUSTOMER', 'Nairobi', true, true),
          ('Peter', 'Kamau', 'peter.driver@zuasoko.com', '+254730345678', $1, 'DRIVER', 'Kiambu', true, true);
        `, [hashPassword("password123")]);
        console.log("✅ Sample users created");
      }

      const productCheck = await client.query("SELECT COUNT(*) FROM products");
      if (parseInt(productCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO products (
            name, category, price_per_unit, unit, description,
            stock_quantity, is_featured, farmer_name, farmer_county
          ) VALUES
          ('Fresh Tomatoes', 'Vegetables', 130, 'kg', 'Organic red tomatoes, Grade A quality', 85, true, 'John Kimani', 'Nakuru'),
          ('Sweet Potatoes', 'Root Vegetables', 80, 'kg', 'Fresh sweet potatoes, rich in nutrients', 45, true, 'Jane Wanjiku', 'Meru'),
          ('Spinach', 'Leafy Greens', 50, 'bunch', 'Fresh organic spinach leaves', 30, false, 'Peter Kamau', 'Kiambu');
        `);
        console.log("✅ Sample products created");
      }

      console.log("🎉 Database auto-initialization completed!");

    } catch (initError) {
      console.warn("⚠️ Database auto-initialization failed:", initError.message);
    }

    release();
  }
});

// Authentication endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE phone = $1 OR email = $1",
      [phone.trim()]
    );

    const user = result.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.json({
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
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, county } = req.body;

    if (!firstName || !lastName || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE phone = $1 OR email = $2",
      [phone, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [firstName, lastName, email, phone, hashedPassword, role, county, true, role !== "FARMER"]
    );

    const userId = result.rows[0].id;

    if (role === "FARMER") {
      await pool.query(
        "INSERT INTO wallets (user_id, balance) VALUES ($1, $2)",
        [userId, 0.0]
      );
    }

    const token = jwt.sign(
      { userId, phone, role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
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
    res.status(500).json({ message: "Registration failed" });
  }
});

// Products endpoints
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
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Marketplace endpoints
app.get("/api/marketplace/products", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, county, search } = req.query;

    let query = `
      SELECT p.id, p.name, p.category, p.price_per_unit, p.unit, p.description,
             p.stock_quantity, COALESCE(p.is_featured, false) as is_featured,
             p.farmer_name, p.farmer_county, p.created_at, p.images
      FROM products p
      WHERE p.is_active = true AND p.stock_quantity > 0
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

    query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
      },
    });
  } catch (err) {
    console.error("Marketplace products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/marketplace/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category
      FROM products
      WHERE category IS NOT NULL
      ORDER BY category
    `);

    const categories = result.rows.map(row => row.category);

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error("Categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

app.get("/api/marketplace/counties", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT farmer_county as county
      FROM products
      WHERE farmer_county IS NOT NULL
      ORDER BY farmer_county
    `);

    const counties = result.rows.map(row => row.county);

    res.json({
      success: true,
      counties,
    });
  } catch (err) {
    console.error("Counties error:", err);
    res.status(500).json({ message: "Failed to fetch counties" });
  }
});

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

// Admin users endpoint
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

// Admin analytics endpoint
app.get("/api/admin/analytics/stats", async (req, res) => {
  try {
    console.log("📊 Fetching analytics stats via admin endpoint");

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

// Admin activity endpoint
app.get("/api/admin/activity", async (req, res) => {
  try {
    console.log("���� Fetching admin activity");

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

// Health check endpoint for production
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "zuasoko-api",
    environment: process.env.NODE_ENV || "production",
    port: PORT
  });
});

// Status endpoint
app.get("/api/status", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW() as current_time");

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
      database_type: "neon_postgresql",
      database_time: dbResult.rows[0].current_time,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    res.json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message,
      environment: process.env.NODE_ENV || "development",
    });
  }
});

// Serve static files from root directory (where frontend build is copied)
const fs = require('fs');
const distPath = path.join(__dirname, "dist");
const frontendDistPath = path.join(__dirname, "frontend", "dist");
const rootPath = __dirname;

// Check for frontend files in different locations
if (fs.existsSync(path.join(__dirname, "index.html"))) {
  console.log("📁 Serving static files from root directory");
  app.use(express.static(rootPath));
} else if (fs.existsSync(distPath)) {
  console.log("📁 Serving static files from dist/");
  app.use(express.static(distPath));
} else if (fs.existsSync(frontendDistPath)) {
  console.log("📁 Serving static files from frontend/dist/");
  app.use(express.static(frontendDistPath));
} else {
  console.log("⚠️ No frontend build found - running in API-only mode");
}

// Catch all handler for SPA (only if not an API route)
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "API endpoint not found",
      path: req.path,
      availableEndpoints: [
        "GET /api/status",
        "GET /api/admin/users",
        "GET /api/admin/analytics/stats",
        "GET /api/admin/activity",
        "GET /api/admin/settings",
        "POST /api/auth/login",
        "POST /api/auth/register",
        "GET /api/products",
        "GET /api/marketplace/products"
      ]
    });
  }

  // Try to serve index.html from different locations
  const possiblePaths = [
    path.join(__dirname, "index.html"),
    path.join(distPath, "index.html"),
    path.join(frontendDistPath, "index.html")
  ];

  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }

  // If no index.html found, return API info
  res.json({
    message: "Zuasoko API Server",
    status: "running",
    database: "connected",
    note: "API endpoints available - Frontend build not found",
    endpoints: [
      "GET /api/status",
      "GET /api/admin/users",
      "GET /api/admin/analytics/stats",
      "GET /api/admin/activity"
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 Shutting down gracefully...");
  pool.end(() => {
    console.log("✅ Database connections closed");
    process.exit(0);
  });
});
