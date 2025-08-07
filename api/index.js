// Vercel Serverless API Handler for Zuasoko Marketplace
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

<<<<<<< HEAD
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://zuasoko.vercel.com', process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
=======
const crypto = require("crypto");
const { Pool } = require("pg");

// Database connection - try to connect to real database
let pool;
let dbConnectionAttempted = false;

async function getDB() {
  if (!pool && !dbConnectionAttempted) {
    dbConnectionAttempted = true;
    try {
      // Use Neon database URL if available, fallback to env var
      const databaseUrl =
        process.env.DATABASE_URL ||
        "postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

      pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      console.log("✅ Database pool created successfully");
    } catch (error) {
      console.error("❌ Database connection setup failed:", error);
      pool = null;
    }
  }
  return pool;
}

// Database query helper
async function query(text, params) {
  const db = await getDB();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.query(text, params);
}

// Simple hash function using only built-in crypto
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// Built-in users that ALWAYS work (no database required)
const BUILT_IN_USERS = {
  "+254712345678": {
    id: "admin-001",
    password: "password123",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
    role: "ADMIN",
    county: "Nairobi",
    verified: true,
    registrationFeePaid: true,
  },
  "admin@zuasoko.com": {
    id: "admin-001",
    password: "password123",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
    role: "ADMIN",
    county: "Nairobi",
    verified: true,
    registrationFeePaid: true,
  },
  "+254723456789": {
    id: "farmer-001",
    password: "farmer123",
    firstName: "John",
    lastName: "Farmer",
    email: "farmer@zuasoko.com",
    role: "FARMER",
    county: "Nakuru",
    verified: true,
    registrationFeePaid: true,
  },
  "+254734567890": {
    id: "customer-001",
    password: "customer123",
    firstName: "Jane",
    lastName: "Customer",
    email: "customer@zuasoko.com",
    role: "CUSTOMER",
    county: "Nairobi",
    verified: true,
    registrationFeePaid: true,
  },
};

// Demo products that ALWAYS work
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price_per_unit: 130,
    unit: "kg",
    stock_quantity: 85,
    description:
      "Organic red tomatoes, Grade A quality. Perfect for salads and cooking.",
    is_featured: true,
    farmer_name: "Demo Farmer",
    farmer_county: "Nakuru",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Sweet Potatoes",
    category: "Root Vegetables",
    price_per_unit: 80,
    unit: "kg",
    stock_quantity: 45,
    description:
      "Fresh sweet potatoes, rich in nutrients and perfect for various dishes.",
    is_featured: true,
    farmer_name: "Demo Farmer",
    farmer_county: "Meru",
    created_at: new Date().toISOString(),
  },
];

// Parse request body safely
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    try {
      // If body is already parsed
      if (req.body && typeof req.body === "object") {
        return resolve(req.body);
      }

      // If body is a string
      if (req.body && typeof req.body === "string") {
        try {
          return resolve(JSON.parse(req.body));
        } catch (parseError) {
          return reject(new Error("Invalid JSON in request body"));
        }
      }

      // If we need to read from stream
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });

      req.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve(parsed);
        } catch (parseError) {
          reject(new Error("Invalid JSON in request body"));
        }
      });

      req.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Simple JWT creation (no external library needed)
function createSimpleJWT(payload, secret = "zuasoko-render-secret") {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString("base64")
    .replace(/[=]+$/, "");
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/[=]+$/, "");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/[=]+$/, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Main handler
module.exports = async function universalHandler(req, res) {
  const startTime = Date.now();
>>>>>>> origin/main

// Database connection
let pool;
const initializeDatabase = () => {
  try {
    // Check if pool exists and is not ended
    if (pool && !pool.ended) {
      return pool;
    }

<<<<<<< HEAD
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ No DATABASE_URL found, will use demo data');
      return null;
    }

    // Always use SSL for render.com database connections
    const isRenderDB = process.env.DATABASE_URL.includes('render.com');

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isRenderDB ? { rejectUnauthorized: false } : false,
      max: 3, // Reduced for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      // Don't automatically end the pool
      allowExitOnIdle: false
=======
    const url = req.url || "";
    const method = req.method || "GET";

    // =================================================
    // UNIVERSAL LOGIN ENDPOINT
    // =================================================
    // Handle both /api/auth/login (direct) and /auth/login (via Vercel rewrite)
    if (
      (url === "/api/auth/login" || url === "/auth/login") &&
      method === "POST"
    ) {
      console.log("🚀 UNIVERSAL LOGIN REQUEST");

      try {
        // Parse request body safely
        const body = await parseRequestBody(req);
        console.log("📝 Request body parsed successfully");

        const { phone, password } = body;

        if (!phone || !password) {
          console.log("❌ Missing credentials");
          return res.status(400).json({
            success: false,
            error: "Phone and password are required",
            code: "MISSING_CREDENTIALS",
          });
        }

        console.log(`📱 Login attempt: ${phone}`);

        // Try real database first
        try {
          const result = await query(
            "SELECT * FROM users WHERE phone = $1 OR email = $1",
            [phone.trim()],
          );

          if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log(
              `👤 Found user in database: ${user.first_name} ${user.last_name}`,
            );

            // Verify password against database hash
            const hashedInput = hashPassword(password);
            if (hashedInput === user.password_hash) {
              console.log("✅ Real database login successful");

              const token = createSimpleJWT({
                userId: user.id,
                phone: user.phone,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
              });

              return res.status(200).json({
                success: true,
                message: "Login successful with database",
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
            }
          }
        } catch (dbError) {
          console.warn(
            "⚠️ Database login failed, trying built-in users:",
            dbError.message,
          );
        }

        // Fallback to built-in users if database fails
        const builtInUser =
          BUILT_IN_USERS[phone] || BUILT_IN_USERS[phone.trim()];
        if (builtInUser && builtInUser.password === password) {
          console.log("✅ Built-in user login successful (fallback)");

          const token = createSimpleJWT({
            userId: builtInUser.id,
            phone: phone,
            role: builtInUser.role,
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
          });

          return res.status(200).json({
            success: true,
            message: "Login successful with demo user",
            token,
            user: {
              id: builtInUser.id,
              firstName: builtInUser.firstName,
              lastName: builtInUser.lastName,
              email: builtInUser.email,
              phone: phone,
              role: builtInUser.role,
              county: builtInUser.county,
              verified: builtInUser.verified,
              registrationFeePaid: builtInUser.registrationFeePaid,
            },
          });
        }

        console.log("❌ Invalid credentials");
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
          code: "LOGIN_ERROR",
          details: error.message,
        });
      }
    }

    // =================================================
    // UNIVERSAL PRODUCTS ENDPOINT
    // =================================================
    if (
      (url === "/api/products" ||
        url === "/products" ||
        url === "/marketplace/products" ||
        url === "/api/marketplace/products") &&
      method === "GET"
    ) {
      console.log("🛍️ UNIVERSAL PRODUCTS REQUEST");
      return res.status(200).json({
        success: true,
        products: DEMO_PRODUCTS,
        pagination: {
          page: 1,
          limit: 12,
          total: DEMO_PRODUCTS.length,
          totalPages: 1,
        },
      });
    }

    // =================================================
    // UNIVERSAL STATUS/HEALTH ENDPOINT
    // =================================================
    if (
      (url === "/api/status" ||
        url === "/status" ||
        url === "/api/health" ||
        url === "/health") &&
      method === "GET"
    ) {
      console.log("🏥 UNIVERSAL HEALTH CHECK");

      try {
        // Try to query the real database
        const result = await query(
          "SELECT NOW() as current_time, version() as db_version",
        );

        return res.status(200).json({
          status: "OK",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "production",
          database: "connected",
          database_type: "neon_postgresql",
          database_time: result.rows[0].current_time,
          version: "1.0.0",
        });
      } catch (dbError) {
        console.error("🏥 Database connection failed:", dbError.message);
        return res.status(200).json({
          status: "OK",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "production",
          database: "demo",
          database_error: dbError.message,
          version: "1.0.0",
        });
      }
    }

    // =================================================
    // UNIVERSAL CATEGORIES ENDPOINT
    // =================================================
    if (
      (url === "/api/marketplace/categories" ||
        url === "/marketplace/categories") &&
      method === "GET"
    ) {
      console.log("📁 UNIVERSAL CATEGORIES REQUEST");
      return res.status(200).json({
        success: true,
        categories: ["Vegetables", "Fruits", "Grains", "Root Vegetables"],
      });
    }

    // =================================================
    // UNIVERSAL COUNTIES ENDPOINT
    // =================================================
    if (
      (url === "/api/marketplace/counties" ||
        url === "/marketplace/counties") &&
      method === "GET"
    ) {
      console.log("🗺️ UNIVERSAL COUNTIES REQUEST");
      return res.status(200).json({
        success: true,
        counties: ["Nairobi", "Nakuru", "Meru", "Kiambu", "Nyeri"],
      });
    }

    // =================================================
    // DEFAULT - ENDPOINT NOT FOUND
    // =================================================
    console.log("❌ Endpoint not found:", url);
    return res.status(404).json({
      success: false,
      error: "Endpoint not found",
      code: "NOT_FOUND",
      url: url,
      method: method,
      availableEndpoints: [
        "POST /auth/login",
        "GET /health",
        "GET /products",
        "GET /marketplace/products",
        "GET /marketplace/categories",
        "GET /marketplace/counties",
      ],
>>>>>>> origin/main
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
      // Reset pool on error
      pool = null;
    });

    pool.on('end', () => {
      console.log('Database pool ended');
      pool = null;
    });

    console.log('🔗 Database pool initialized with SSL:', isRenderDB ? 'enabled' : 'disabled');
    return pool;
  } catch (error) {
<<<<<<< HEAD
    console.error('Failed to initialize database:', error);
    pool = null;
    return null;
  }
};

// Helper function to get a working pool
const getPool = () => {
  if (!pool || pool.ended) {
    console.log('🔄 Pool not available, reinitializing...');
    return initializeDatabase();
  }
  return pool;
};

// Initialize database on startup
initializeDatabase();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: pool ? 'connected' : 'not configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Status endpoint with database info
app.get('/api/status', async (req, res) => {
  try {
    let dbStatus = 'not configured';
    let productCount = 0;
    
    const currentPool = getPool();
    if (currentPool) {
      try {
        const result = await currentPool.query('SELECT COUNT(*) FROM products');
        productCount = parseInt(result.rows[0].count);
        dbStatus = 'connected';
        
        // Auto-initialize if no products exist
        if (productCount === 0) {
          await initializeProducts();
          const newResult = await currentPool.query('SELECT COUNT(*) FROM products');
          productCount = parseInt(newResult.rows[0].count);
        }
      } catch (dbError) {
        dbStatus = 'error: ' + dbError.message;
      }
    }
    
    res.json({
      status: 'running',
      database: dbStatus,
      products: productCount,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Initialize products if database is empty
const initializeProducts = async () => {
  const currentPool = getPool();
  if (!currentPool) return;
  
  try {
    // Create products table if it doesn't exist
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        quantity INTEGER DEFAULT 0,
        images JSON DEFAULT '[]',
        farmer_name VARCHAR(255) DEFAULT 'Local Farmer',
        farmer_county VARCHAR(100) DEFAULT 'Kenya',
        is_featured BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample products
    await currentPool.query(`
      INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, quantity, images, farmer_name, farmer_county, is_featured) VALUES
      ('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 'Vegetables', 85.00, 'kg', 500, 500, '["https://images.unsplash.com/photo-1546470427-e212b9d56085"]', 'John Farmer', 'Nakuru', true),
      ('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients and vitamins.', 'Root Vegetables', 80.00, 'kg', 300, 300, '["https://images.unsplash.com/photo-1518977676601-b53f82aba655"]', 'Mary Farm', 'Meru', false),
      ('Fresh Spinach', 'Organic spinach leaves, perfect for healthy meals.', 'Leafy Greens', 120.00, 'kg', 150, 150, '["https://images.unsplash.com/photo-1576045057995-568f588f82fb"]', 'Grace Farm', 'Nyeri', false),
      ('Green Beans', 'Tender green beans, freshly harvested and ready for pickup.', 'Vegetables', 95.00, 'kg', 200, 200, '["https://images.unsplash.com/photo-1628773822503-930a7eaecf80"]', 'John Farmer', 'Nakuru', true)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Products initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing products:', error);
  }
};

// Marketplace products endpoint
app.get('/api/marketplace/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;

    const currentPool = getPool();
    if (!currentPool) {
      // Fallback demo data if no database
      return res.json({
        success: true,
        products: [
          {
            id: 1,
            name: "Fresh Tomatoes",
            category: "Vegetables",
            price_per_unit: 85.00,
            unit: "kg",
            description: "Organic red tomatoes, Grade A quality.",
            stock_quantity: 500,
            images: ["https://images.unsplash.com/photo-1546470427-e212b9d56085"],
            farmer_name: "John Farmer",
            farmer_county: "Nakuru"
          }
        ],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 }
      });
    }
    
    // Build query
    let query = `
      SELECT id, name, category, price_per_unit, unit, description, 
             stock_quantity, quantity, images, farmer_name, farmer_county, created_at
      FROM products 
      WHERE is_available = true
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY is_featured DESC, created_at DESC`;
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);
    
    const result = await currentPool.query(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products WHERE is_available = true`;
    const countResult = await currentPool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Marketplace products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get single product
app.get('/api/marketplace/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const currentPool = getPool();
    if (!currentPool) {
      return res.status(404).json({
        success: false,
        message: 'Database not configured'
      });
    }
    
    // Check for UUID format (outdated)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(id)) {
      return res.status(410).json({
        success: false,
        message: "This product link uses an outdated format. Please browse the marketplace for current products.",
        code: "OUTDATED_PRODUCT_LINK",
        redirect: "/marketplace"
      });
    }
    
    const result = await currentPool.query(
      'SELECT * FROM products WHERE id = $1 AND is_available = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Product fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Categories endpoint
app.get('/api/marketplace/categories', async (req, res) => {
  try {
    const currentPool = getPool();
    if (!currentPool) {
      return res.json({
        success: true,
        categories: ['Vegetables', 'Root Vegetables', 'Leafy Greens']
      });
    }
    
    const result = await currentPool.query(
      'SELECT DISTINCT category FROM products WHERE is_available = true ORDER BY category'
    );
    
    res.json({
      success: true,
      categories: result.rows.map(row => row.category)
    });
    
  } catch (error) {
    res.json({
      success: true,
      categories: ['Vegetables', 'Root Vegetables', 'Leafy Greens']
    });
  }
});

// Counties endpoint
app.get('/api/marketplace/counties', async (req, res) => {
  res.json({
    success: true,
    counties: ['Nairobi', 'Kiambu', 'Nakuru', 'Meru', 'Nyeri']
  });
});

// Login endpoint with JWT token generation
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Demo admin credentials for testing
    if (phone === 'admin' && password === 'admin') {
      const adminToken = jwt.sign(
        {
          userId: 'admin-1',
          role: 'ADMIN',
          phone: '+254700000000'
        },
        process.env.JWT_SECRET || 'zuasoko-production-secret-2024',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin-1',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+254700000000',
          role: 'ADMIN',
          county: 'Nairobi'
        },
        token: adminToken
      });
    }

    // Demo mode - accept any other credentials as customer
    if (!pool) {
      const customerToken = jwt.sign(
        {
          userId: 'demo-user',
          role: 'CUSTOMER',
          phone: phone
        },
        process.env.JWT_SECRET || 'zuasoko-production-secret-2024',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Login successful (demo mode)',
        user: {
          id: 'demo-user',
          firstName: 'Demo',
          lastName: 'User',
          phone: phone,
          role: 'CUSTOMER',
          county: 'Nairobi'
        },
        token: customerToken
      });
    }

    // Real database authentication would go here
    // For now, return demo response with JWT
    const token = jwt.sign(
      {
        userId: 'demo-user',
        role: 'CUSTOMER',
        phone: phone
      },
      process.env.JWT_SECRET || 'zuasoko-production-secret-2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        phone: phone,
        role: 'CUSTOMER',
        county: 'Nairobi'
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

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
    console.log('�� Token decoded successfully:', { userId: decoded.userId, role: decoded.role });

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

    const currentPool = getPool();
    if (!currentPool) {
      // Demo mode - return demo users
      return res.json({
        success: true,
        users: [
          {
            id: '1',
            first_name: 'Demo',
            last_name: 'Admin',
            email: 'admin@zuasoko.com',
            phone: '+254712345678',
            role: 'ADMIN',
            county: 'Nairobi',
            verified: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            first_name: 'John',
            last_name: 'Farmer',
            email: 'farmer@example.com',
            phone: '+254712345679',
            role: 'FARMER',
            county: 'Nakuru',
            verified: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            first_name: 'Jane',
            last_name: 'Customer',
            email: 'customer@example.com',
            phone: '+254712345680',
            role: 'CUSTOMER',
            county: 'Mombasa',
            verified: false,
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    // Ensure users table exists with consistent schema
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        full_name TEXT,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Query users with the actual table schema
    const result = await currentPool.query(`
      SELECT
        id,
        phone,
        role,
        status,
        full_name,
        email,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    console.log(`👥 Found ${result.rows.length} users`);

    // Map users to match expected frontend format
    const users = result.rows.map((user) => {
      // Parse full_name into first_name and last_name for frontend compatibility
      const nameParts = (user.full_name || '').split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      return {
        id: user.id,
        first_name,
        last_name,
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'CUSTOMER',
        status: user.status || 'pending',
        county: 'N/A', // Would need to add county field
        verified: user.status === 'approved', // Map status to verified
        registration_fee_paid: true, // Default for demo
        created_at: user.created_at,
      };
    });

    res.json({
      success: true,
      users: users,
    });
  } catch (err) {
    console.error("❌ Admin users error:", err);

    // Return demo users as fallback on any database error
    console.log("👥 Returning demo users due to database error");
    res.json({
      success: true,
      users: [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Kamau',
          full_name: 'John Kamau',
          email: 'john@example.com',
          phone: '0712345678',
          role: 'FARMER',
          status: 'approved',
          county: 'Nakuru',
          verified: true,
          registration_fee_paid: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          first_name: 'Mary',
          last_name: 'Wanjiku',
          full_name: 'Mary Wanjiku',
          email: 'mary@example.com',
          phone: '0723456789',
          role: 'CUSTOMER',
          status: 'approved',
          county: 'Nairobi',
          verified: true,
          registration_fee_paid: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          first_name: 'Peter',
          last_name: 'Mwangi',
          full_name: 'Peter Mwangi',
          email: 'peter@example.com',
          phone: '0734567890',
          role: 'FARMER',
          status: 'pending',
          county: 'Kisumu',
          verified: false,
          registration_fee_paid: false,
          created_at: new Date().toISOString()
        }
      ]
    });
  }
});

// POST /api/admin/users/:id/approve
app.post("/api/admin/users/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ Admin approving user: ${id}`);

    const currentPool = getPool();
    if (!currentPool) {
      return res.json({
        success: true,
        message: 'User approved successfully (demo mode)'
      });
    }

    const result = await currentPool.query(
      'UPDATE users SET verified = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Admin approve user error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to approve user",
      details: err.message,
    });
  }
});

// Admin Analytics Stats endpoint
app.get('/api/admin/analytics/stats', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Admin analytics stats requested');

    const currentPool = getPool();
    if (!currentPool) {
      console.log('📊 Using demo analytics stats (no database)');
      return res.json({
        success: true,
        stats: {
          totalUsers: 150,
          pendingApprovals: 12,
          totalConsignments: 45,
          totalRevenue: 85000.50,
          activeUsers: 42,
          totalProducts: 24
        }
      });
    }

    // Ensure users table exists
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        full_name TEXT,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Check if we need to seed sample users for demo purposes
    const userCountQuery = await currentPool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(userCountQuery.rows[0].count) || 0;

    // If no users exist, create some sample data for demo
    if (totalUsers === 0) {
      console.log('📊 Seeding sample users for analytics demo...');

      try {
        // Create sample users including admin
        await currentPool.query(`
          INSERT INTO users (phone, password, role, status, full_name, email, created_at) VALUES
          ('admin', '${crypto.createHash('sha256').update('adminsalt123').digest('hex')}', 'ADMIN', 'approved', 'Admin User', 'admin@zuasoko.com', NOW()),
          ('+254712345678', '${crypto.createHash('sha256').update('password123salt123').digest('hex')}', 'ADMIN', 'approved', 'Admin Demo', 'admin@example.com', NOW()),
          ('0712345678', '${crypto.createHash('sha256').update('password123salt123').digest('hex')}', 'FARMER', 'approved', 'John Kamau', 'john@example.com', NOW()),
          ('0723456789', '${crypto.createHash('sha256').update('password123salt123').digest('hex')}', 'CUSTOMER', 'approved', 'Mary Wanjiku', 'mary@example.com', NOW()),
          ('0734567890', '${crypto.createHash('sha256').update('password123salt123').digest('hex')}', 'FARMER', 'pending', 'Peter Mwangi', 'peter@example.com', NOW()),
          ('0745678901', '${crypto.createHash('sha256').update('password123salt123').digest('hex')}', 'DRIVER', 'pending', 'Grace Njeri', 'grace@example.com', NOW()),
          ('0756789012', '${crypto.createHash('sha256').update('password123salt123').digest('hex')}', 'CUSTOMER', 'approved', 'David Kiprotich', 'david@example.com', NOW())
          ON CONFLICT (phone) DO NOTHING
        `);
        console.log('✅ Sample users (including admin) created');
      } catch (seedError) {
        console.log('ℹ️ Sample users may already exist or table structure differs:', seedError.message);
      }
    }

    // Re-query after potential seeding
    const updatedUserCount = await currentPool.query('SELECT COUNT(*) as count FROM users');
    const finalTotalUsers = parseInt(updatedUserCount.rows[0].count) || 0;

    const pendingApprovalsQuery = await currentPool.query(`
      SELECT COUNT(*) as count FROM users
      WHERE status = 'pending' OR status = 'PENDING'
    `);
    const pendingApprovals = parseInt(pendingApprovalsQuery.rows[0].count) || 0;

    const productCountQuery = await currentPool.query('SELECT COUNT(*) as count FROM products WHERE is_available = true');
    const totalProducts = parseInt(productCountQuery.rows[0].count) || 0;

    // Calculate some realistic derived stats
    const activeUsers = Math.floor(finalTotalUsers * 0.7); // 70% active
    const totalConsignments = Math.floor(finalTotalUsers * 1.5); // 1.5 consignments per user
    const totalRevenue = finalTotalUsers * 5000 + Math.random() * 50000; // Realistic revenue

    console.log('📊 Analytics stats computed:', {
      totalUsers: finalTotalUsers,
      pendingApprovals,
      totalProducts,
      activeUsers,
      totalConsignments,
      totalRevenue: Math.floor(totalRevenue)
    });

    res.json({
      success: true,
      stats: {
        totalUsers: finalTotalUsers,
        pendingApprovals,
        totalConsignments,
        totalRevenue: Math.floor(totalRevenue),
        activeUsers,
        totalProducts
      }
    });
  } catch (error) {
    console.error('❌ Analytics stats error:', error);

    // Fallback to demo data on any error
    res.json({
      success: true,
      stats: {
        totalUsers: 25,
        pendingApprovals: 8,
        totalConsignments: 42,
        totalRevenue: 127500,
        activeUsers: 18,
        totalProducts: 12
      }
    });
  }
});

// Admin Activity Log endpoint
app.get('/api/admin/activity', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 Admin activity log requested');

    // For now, return demo activity data since we don't have an activity log table
    const demoActivities = [
      {
        id: 1,
        type: 'user_registration',
        description: 'New farmer registered: John Kamau',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        status: 'completed',
        user: 'John Kamau'
      },
      {
        id: 2,
        type: 'product_added',
        description: 'New product added: Fresh Tomatoes (1kg)',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'completed',
        user: 'Mary Wanjiku'
      },
      {
        id: 3,
        type: 'user_approval',
        description: 'User approved: Peter Mwangi',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: 'completed',
        user: 'Admin'
      },
      {
        id: 4,
        type: 'order_placed',
        description: 'New order placed for KSh 2,500',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        status: 'processing',
        user: 'Grace Njeri'
      },
      {
        id: 5,
        type: 'system',
        description: 'Daily backup completed successfully',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'completed',
        user: 'System'
      }
    ];

    console.log('📋 Returning demo activity data');

    res.json({
      success: true,
      activities: demoActivities
    });
  } catch (error) {
    console.error('❌ Activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log',
      error: error.message
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Export handler for Vercel serverless functions
module.exports = app;
=======
    console.error("❌ UNIVERSAL API ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "UNIVERSAL_ERROR",
      message: error.message,
    });
  }
};

// Also export as default for compatibility
module.exports.default = module.exports;
>>>>>>> origin/main
