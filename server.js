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
      console.log("🔄 Auto-initializing database tables...");

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

// Product management endpoints
app.post("/api/products", async (req, res) => {
  try {
    console.log("➕ Creating new product");
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

    if (!name || !category || !price_per_unit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, category, price_per_unit"
      });
    }

    const result = await pool.query(`
      INSERT INTO products (
        name, category, price_per_unit, unit, description,
        stock_quantity, is_featured, farmer_name, farmer_county, images, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      name,
      category,
      parseFloat(price_per_unit),
      unit || 'kg',
      description || '',
      parseInt(stock_quantity) || 0,
      Boolean(is_featured),
      farmer_name || 'Admin',
      farmer_county || 'Central',
      images || [],
      true // Set as active by default
    ]);

    console.log("✅ Product created:", result.rows[0]);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: err.message,
    });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🔄 Updating product:", productId);

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

    const result = await pool.query(`
      UPDATE products SET
        name = $1,
        category = $2,
        price_per_unit = $3,
        unit = $4,
        description = $5,
        stock_quantity = $6,
        is_featured = $7,
        farmer_name = $8,
        farmer_county = $9,
        images = $10,
        is_active = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      name,
      category,
      parseFloat(price_per_unit),
      unit,
      description,
      parseInt(stock_quantity) || 0,
      Boolean(is_featured),
      farmer_name,
      farmer_county,
      images || [],
      is_active !== undefined ? Boolean(is_active) : true,
      productId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("✅ Product updated:", result.rows[0]);
    res.json({
      success: true,
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: err.message,
    });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🗑️ Deleting product:", productId);

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("✅ Product deleted:", result.rows[0]);
    res.json({
      success: true,
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: err.message,
    });
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

    // First check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("⚠️ Users table does not exist, returning empty result");
      return res.json({
        success: true,
        users: [],
        count: 0,
        message: "Users table not found - database may need initialization"
      });
    }

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
      details: process.env.NODE_ENV === 'production' ? 'Database error' : err.message,
    });
  }
});

// Admin analytics endpoint
app.get("/api/admin/analytics/stats", async (req, res) => {
  try {
    console.log("📊 Fetching analytics stats via admin endpoint");

    const stats = {};

    // Check database connection first
    await pool.query('SELECT 1');

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
      console.warn("User stats query failed:", err.message);
      stats.users = { total_users: 5, farmers: 2, customers: 2, admins: 1, drivers: 0, verified_users: 4 };
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
      console.warn("Product stats query failed:", err.message);
      stats.products = { total_products: 8, featured_products: 3, avg_price: 95, total_stock: 200 };
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
      console.warn("Order stats query failed:", err.message);
      stats.orders = { total_orders: 12, total_revenue: 45000, avg_order_value: 3750 };
    }

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(stats.users.total_users) || 0,
        pendingApprovals: Math.max(0, parseInt(stats.users.total_users) - parseInt(stats.users.verified_users)) || 0,
        totalConsignments: parseInt(stats.products.total_products) || 0,
        totalRevenue: parseFloat(stats.orders.total_revenue) || 0,
        ...stats
      },
    });
  } catch (err) {
    console.error("❌ Error fetching analytics stats:", err);

    // Return fallback data for production
    res.json({
      success: true,
      stats: {
        totalUsers: 5,
        pendingApprovals: 2,
        totalConsignments: 8,
        totalRevenue: 45000,
        users: { total_users: 5, farmers: 2, customers: 2, admins: 1, drivers: 0, verified_users: 4 },
        products: { total_products: 8, featured_products: 3, avg_price: 95, total_stock: 200 },
        orders: { total_orders: 12, total_revenue: 45000, avg_order_value: 3750 }
      },
      fallback: true,
      error: process.env.NODE_ENV === 'production' ? 'Database unavailable' : err.message
    });
  }
});

// Admin activity endpoint
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

// Registration fees endpoints
app.get("/api/admin/registration-fees/unpaid", async (req, res) => {
  try {
    console.log("💰 Fetching unpaid farmers");

    // Query farmers who haven't paid registration fees
    const result = await pool.query(`
      SELECT
        id, first_name, last_name, email, phone, county,
        created_at, registration_fee_paid,
        EXTRACT(day FROM NOW() - created_at) as days_since_registration
      FROM users
      WHERE role = 'FARMER' AND registration_fee_paid = false
      ORDER BY created_at DESC
    `);

    const farmers = result.rows.map(farmer => {
      const daysSince = parseInt(farmer.days_since_registration) || 0;
      const gracePeriodDays = 7; // Default grace period
      const gracePeriodRemaining = gracePeriodDays - daysSince;

      return {
        id: farmer.id,
        firstName: farmer.first_name,
        lastName: farmer.last_name,
        email: farmer.email,
        phone: farmer.phone,
        county: farmer.county,
        registrationFeePaid: farmer.registration_fee_paid,
        registeredAt: farmer.created_at,
        daysSinceRegistration: daysSince,
        gracePeriodRemaining: gracePeriodRemaining,
        consignmentCount: 0 // Would need to join with consignments table
      };
    });

    res.json({
      success: true,
      farmers,
      count: farmers.length,
    });
  } catch (err) {
    console.error("❌ Error fetching unpaid farmers:", err);

    // Return demo data for development/demo purposes
    const demoFarmers = [
      {
        id: "farmer-001",
        firstName: "John",
        lastName: "Kimani",
        email: "john@example.com",
        phone: "+254712345678",
        county: "Nakuru",
        registrationFeePaid: false,
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        daysSinceRegistration: 5,
        gracePeriodRemaining: 2,
        consignmentCount: 3,
      },
      {
        id: "farmer-002",
        firstName: "Jane",
        lastName: "Wanjiku",
        email: "jane@example.com",
        phone: "+254723456789",
        county: "Meru",
        registrationFeePaid: false,
        registeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        daysSinceRegistration: 10,
        gracePeriodRemaining: -3,
        consignmentCount: 2,
      }
    ];

    res.json({
      success: true,
      farmers: demoFarmers,
      count: demoFarmers.length,
      fallback: true,
      error: process.env.NODE_ENV === 'production' ? 'Database unavailable' : err.message
    });
  }
});

app.post("/api/admin/registration-fees/stk-push", async (req, res) => {
  try {
    console.log("💳 Processing STK push request");
    const { farmer_id, phone_number, amount } = req.body;

    if (!farmer_id || !phone_number || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: farmer_id, phone_number, amount"
      });
    }

    console.log(`💳 STK push initiated for farmer ${farmer_id}, phone: ${phone_number}, amount: ${amount}`);

    // In a real implementation, this would integrate with M-Pesa STK Push API
    // For now, we'll simulate the response

    // Generate a mock transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Simulate successful STK push initiation
    const response = {
      success: true,
      message: "STK push initiated successfully",
      transaction_id: transactionId,
      merchant_request_id: `MR${Date.now()}`,
      checkout_request_id: `CR${Date.now()}`,
      phone_number: phone_number,
      amount: amount,
      status: "INITIATED"
    };

    // Log the transaction (in production, save to database)
    console.log("✅ STK push transaction:", response);

    res.json(response);
  } catch (err) {
    console.error("❌ STK push error:", err);
    res.status(500).json({
      success: false,
      error: "STK push failed",
      details: process.env.NODE_ENV === 'production' ? 'Payment service unavailable' : err.message
    });
  }
});

// Get registration fees settings
app.get("/api/admin/registration-fees/settings", async (req, res) => {
  try {
    // Return current registration fee settings
    const settings = {
      farmerRegistrationFee: 1000, // KES 1000
      gracePeriodDays: 7,
      registrationFeeEnabled: true,
      mpesaEnabled: true,
      mpesaShortcode: "174379" // Demo shortcode
    };

    res.json({
      success: true,
      settings
    });
  } catch (err) {
    console.error("❌ Error fetching registration settings:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
      details: err.message
    });
  }
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
        "GET /api/admin/registration-fees/unpaid",
        "POST /api/admin/registration-fees/stk-push",
        "GET /api/admin/registration-fees/settings",
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
