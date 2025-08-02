// Vercel Serverless API Handler for Zuasoko Marketplace
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://zuasoko.vercel.com', process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database connection
let pool;
const initializeDatabase = () => {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 5, // Reduced for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
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
    
    if (pool) {
      try {
        const result = await pool.query('SELECT COUNT(*) FROM products');
        productCount = parseInt(result.rows[0].count);
        dbStatus = 'connected';
        
        // Auto-initialize if no products exist
        if (productCount === 0) {
          await initializeProducts();
          const newResult = await pool.query('SELECT COUNT(*) FROM products');
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
  if (!pool) return;
  
  try {
    // Create products table if it doesn't exist
    await pool.query(`
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
    await pool.query(`
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
    
    if (!pool) {
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
    
    const result = await pool.query(query, params);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products WHERE is_available = true`;
    const countResult = await pool.query(countQuery);
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
    
    if (!pool) {
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
    
    const result = await pool.query(
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
    if (!pool) {
      return res.json({
        success: true,
        categories: ['Vegetables', 'Root Vegetables', 'Leafy Greens']
      });
    }
    
    const result = await pool.query(
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

// Demo login endpoint (works without database)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }
    
    // Demo mode - accept any credentials
    if (!pool) {
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
        token: 'demo-jwt-token'
      });
    }
    
    // Real database authentication would go here
    // For now, return demo response
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
      token: 'demo-jwt-token'
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
