const { Pool } = require("pg");

// Use the same connection string as the server
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    "postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  try {
    console.log("🗄️ Setting up Neon database tables...");

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
    console.log("✅ Users table created/verified");

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
    console.log("✅ Products table created/verified");

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
    console.log("✅ Orders table created/verified");

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
    console.log("✅ Order items table created/verified");

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
    console.log("✅ Wallets table created/verified");

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
    console.log("✅ Consignments table created/verified");

    // Insert sample admin user if not exists
    const adminExists = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@zuasoko.com' LIMIT 1"
    );

    if (adminExists.rows.length === 0) {
      // Hash for password123
      const hashedPassword = require("crypto")
        .createHash("sha256")
        .update("password123" + "salt123")
        .digest("hex");

      await pool.query(`
        INSERT INTO users (
          first_name, last_name, email, phone, password_hash, 
          role, county, verified, registration_fee_paid
        ) VALUES (
          'Admin', 'User', 'admin@zuasoko.com', '+254712345678', $1,
          'ADMIN', 'Nairobi', true, true
        );
      `, [hashedPassword]);
      console.log("✅ Admin user created");
    } else {
      console.log("✅ Admin user already exists");
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
      console.log("✅ Sample products inserted");
    } else {
      console.log("✅ Products already exist");
    }

    console.log("🎉 Database setup completed successfully!");

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(console.error);
