const { Pool } = require("pg");
const crypto = require("crypto");

// Simple hash function using built-in crypto
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// Database connection using Render.com credentials
const pool = new Pool({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🚀 Initializing Zuasoko database on Render.com...");

    // Test connection
    console.log("📡 Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");

    // Create tables
    console.log("🏗️ Creating database schema...");

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('FARMER', 'CUSTOMER', 'ADMIN', 'DRIVER')) NOT NULL,
        county VARCHAR(255),
        verified BOOLEAN DEFAULT false,
        registration_fee_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table (simplified for demo)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        description TEXT,
        stock_quantity DECIMAL(10,2) NOT NULL,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        farmer_name VARCHAR(255),
        farmer_county VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    console.log("✅ Database schema created successfully");

    // Insert sample data
    console.log("🌱 Seeding database with sample data...");

    // Check if users already exist
    const existingUsers = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(existingUsers.rows[0].count) === 0) {
      // Sample users with properly hashed passwords
      const adminPasswordHash = hashPassword("admin123");
      const farmerPasswordHash = hashPassword("farmer123");
      const customerPasswordHash = hashPassword("customer123");

      await pool.query(
        `
        INSERT INTO users (first_name, last_name, phone, email, password_hash, role, county, verified, registration_fee_paid) VALUES
        ('Admin', 'User', '+254700000001', 'admin@zuasoko.com', $1, 'ADMIN', 'Nairobi', true, true),
        ('John', 'Kamau', '+254700000002', 'john@farmer.com', $2, 'FARMER', 'Nakuru', true, true),
        ('Jane', 'Wanjiku', '+254700000003', 'jane@customer.com', $3, 'CUSTOMER', 'Nairobi', true, true)
      `,
        [adminPasswordHash, farmerPasswordHash, customerPasswordHash],
      );

      // Get farmer user ID for wallet
      const farmerUser = await pool.query(
        "SELECT id FROM users WHERE role = 'FARMER' LIMIT 1",
      );
      if (farmerUser.rows.length > 0) {
        await pool.query(
          "INSERT INTO wallets (user_id, balance) VALUES ($1, $2)",
          [farmerUser.rows[0].id, 1500.0],
        );
      }

      console.log("✅ Sample users created");
    }

    // Check if products already exist
    const existingProducts = await pool.query("SELECT COUNT(*) FROM products");
    if (parseInt(existingProducts.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, category, price_per_unit, unit, description, stock_quantity, is_featured, farmer_name, farmer_county) VALUES
        ('Fresh Tomatoes', 'Vegetables', 130.00, 'kg', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 85, true, 'John Kamau', 'Nakuru'),
        ('Sweet Potatoes', 'Root Vegetables', 80.00, 'kg', 'Fresh sweet potatoes, rich in nutrients and perfect for various dishes.', 45, true, 'Mary Njeri', 'Meru'),
        ('Fresh Spinach', 'Leafy Greens', 50.00, 'bunch', 'Freshly harvested spinach bunches, rich in iron and vitamins.', 30, false, 'Jane Wanjiku', 'Kiambu'),
        ('Green Beans', 'Vegetables', 200.00, 'kg', 'Fresh green beans, crisp and nutritious.', 25, false, 'Peter Mwangi', 'Nyeri'),
        ('Carrots', 'Root Vegetables', 60.00, 'kg', 'Organic carrots, sweet and crunchy.', 40, false, 'Alice Mutua', 'Machakos')
      `);

      console.log("✅ Sample products created");
    }

    // Create indexes for performance
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)",
    );

    console.log("✅ Database indexes created");

    // Show summary
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const productCount = await pool.query("SELECT COUNT(*) FROM products");

    const summary = {
      status: "success",
      message: "Database initialized successfully",
      users: parseInt(userCount.rows[0].count),
      products: parseInt(productCount.rows[0].count),
      credentials: {
        admin: "admin@zuasoko.com / admin123",
        farmer: "john@farmer.com / farmer123",
        customer: "jane@customer.com / customer123",
      },
    };

    console.log("🎉 Database initialization completed successfully!");
    return res.json(summary);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Database initialization failed",
      error: error.message,
    });
  }
}
