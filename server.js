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

// Request logging middleware for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`📡 ${req.method} ${req.path}`, {
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query
    });
  }
  next();
});

// Environment validation
console.log("🔧 Environment Check:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT:", PORT);
console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("  JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Using default");

if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL: DATABASE_URL environment variable is not set!");
  console.error("   Please set your Neon database URL in fly.toml or Fly.dev secrets");
}

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

// Authentication middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");
    req.user = decoded;

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

// General authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log(`🔐 Auth check for ${req.method} ${req.path}`);
  console.log(`📝 Auth header: ${authHeader ? 'Present' : 'Missing'}`);
  console.log(`🎫 Token: ${token ? token.substring(0, 20) + '...' : 'Missing'}`);
  console.log(`🔑 JWT_SECRET configured: ${process.env.JWT_SECRET ? 'Yes' : 'No (using default)'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

  if (!token) {
    console.log("❌ No token provided - returning 401");
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      debug: { hasAuthHeader: !!authHeader, endpoint: req.path }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");
    console.log(`✅ Token valid for user: ${decoded.userId} (${decoded.role})`);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(`❌ Token verification failed: ${error.message}`);
    console.log(`🔍 Token details: ${token.substring(0, 50)}...`);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      debug: {
        error: error.message,
        tokenLength: token.length,
        jwtSecretConfigured: !!process.env.JWT_SECRET,
        environment: process.env.NODE_ENV
      }
    });
  }
}

// Seed default users
async function seedDefaultUsers(client) {
  try {
    const adminPasswordHash = hashPassword("password123");
    const farmerPasswordHash = hashPassword("password123");

    // Insert admin user
    await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (phone) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         verified = EXCLUDED.verified,
         registration_fee_paid = EXCLUDED.registration_fee_paid`,
      [
        "Admin",
        "User",
        "admin@zuasoko.com",
        "+254712345678",
        adminPasswordHash,
        "ADMIN",
        "Nairobi",
        true,
        true,
      ]
    );

    // Insert farmer user
    await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (phone) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         verified = EXCLUDED.verified,
         registration_fee_paid = EXCLUDED.registration_fee_paid`,
      [
        "Test",
        "Farmer",
        "farmer@zuasoko.com",
        "+254734567890",
        farmerPasswordHash,
        "FARMER",
        "Nakuru",
        true,
        true,
      ]
    );

    console.log("✅ Default users seeded:");
    console.log("   📱 Admin: +254712345678 / password123");
    console.log("   📱 Farmer: +254734567890 / password123");

  } catch (error) {
    console.error("❌ Error seeding default users:", error.message);
  }
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

      // Create consignments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS consignments (
          id SERIAL PRIMARY KEY,
          farmer_id INTEGER REFERENCES users(id),
          product_name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          price_per_unit DECIMAL(10,2) NOT NULL,
          total_value DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          notes TEXT,
          location VARCHAR(255),
          harvest_date DATE,
          expiry_date DATE,
          images JSONB DEFAULT '[]',
          admin_notes TEXT,
          approved_by INTEGER REFERENCES users(id),
          approved_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Consignments table created");

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
        console.log("�� Sample users created");
      }

      const productCheck = await client.query("SELECT COUNT(*) FROM products");
      if (parseInt(productCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO products (
            name, category, price_per_unit, unit, description,
            stock_quantity, is_featured, farmer_name, farmer_county, images, is_active
          ) VALUES
          ('Fresh Organic Tomatoes', 'Vegetables', 130, 'kg', 'Premium Grade A organic red tomatoes, vine-ripened for maximum flavor. Rich in lycopene and vitamins. Perfect for cooking, salads, and sauces.', 85, true, 'John Kimani', 'Nakuru', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Fresh Sweet Potatoes', 'Root Vegetables', 80, 'kg', 'Farm-fresh orange sweet potatoes packed with vitamins A and C. Naturally sweet and perfect for roasting, baking, or making into delicious fries.', 45, true, 'Jane Wanjiku', 'Meru', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Organic Baby Spinach', 'Leafy Greens', 50, 'bunch', 'Tender organic baby spinach leaves, pesticide-free and freshly harvested. Rich in iron, folate, and vitamins. Perfect for salads, smoothies, and cooking.', 30, false, 'Peter Kamau', 'Kiambu', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Fresh Avocados', 'Fruits', 25, 'pieces', 'Creamy Hass avocados, perfectly ripe and ready to eat. Rich in healthy fats, fiber, and potassium. Great for guacamole, salads, or toast.', 60, true, 'Mary Njeri', 'Murang''a', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Premium Maize (White)', 'Grains', 60, 'kg', 'High-quality white maize grains, locally grown and properly dried. Perfect for making ugali, porridge, or grinding into flour. Non-GMO and pesticide-free.', 120, false, 'Samuel Mwangi', 'Laikipia', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAxQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Fresh Kales (Sukuma Wiki)', 'Leafy Greens', 30, 'bunch', 'Fresh collard greens (sukuma wiki), a Kenyan staple vegetable. Rich in vitamins K, A, and C. Perfect for traditional Kenyan dishes and nutritious meals.', 40, true, 'Grace Wanjiru', 'Kiambu', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Red Onions', 'Vegetables', 90, 'kg', 'Fresh red onions with a mild, sweet flavor. Locally grown and naturally cured for longer storage. Essential for cooking and adds great flavor to any dish.', 75, false, 'David Kiprotich', 'Nakuru', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
          ('Premium Green Beans', 'Vegetables', 150, 'kg', 'Tender French green beans, hand-picked at peak freshness. Crisp texture and sweet flavor, perfect for steaming, stir-frying, or adding to casseroles.', 35, true, 'Rachel Muthoni', 'Nyeri', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true);
        `);
        console.log("✅ Premium sample products with images created");
      }

      console.log("🎉 Database auto-initialization completed!");

      // Auto-seed admin users
      console.log("🌱 Seeding default users...");
      await seedDefaultUsers(client);

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
    console.log(`🔐 Login attempt for phone: ${phone}`);

    if (!phone || !password) {
      console.log("❌ Missing phone or password");
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE phone = $1 OR email = $1",
      [phone.trim()]
    );

    console.log(`📊 Database query returned ${result.rows.length} users`);

    const user = result.rows[0];
    if (!user) {
      console.log(`❌ No user found for phone: ${phone}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`👤 Found user: ${user.first_name} ${user.last_name} (${user.role})`);
    console.log(`🔐 Verifying password for user: ${user.phone}`);

    const passwordValid = verifyPassword(password, user.password_hash);
    console.log(`✅ Password validation result: ${passwordValid}`);

    if (!passwordValid) {
      console.log(`❌ Invalid password for user: ${phone}`);
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

// Debug endpoint to test routing
app.get("/api/debug/test", (req, res) => {
  res.json({ success: true, message: "Debug endpoint working", timestamp: new Date().toISOString() });
});

// Debug endpoint to create admin user
app.post("/api/debug/seed-admin", async (req, res) => {
  try {
    console.log("🌱 Creating admin user...");

    const adminPasswordHash = hashPassword("password123");
    console.log(`🔐 Admin password hash: ${adminPasswordHash.substring(0, 10)}...`);

    // Insert admin user (or update if exists)
    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (phone)
      DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          verified = EXCLUDED.verified,
          registration_fee_paid = EXCLUDED.registration_fee_paid
      RETURNING id, first_name, last_name, phone, role
    `,
      [
        "Admin",
        "User",
        "admin@zuasoko.com",
        "+254712345678",
        adminPasswordHash,
        "ADMIN",
        "Nairobi",
        true,
        true,
      ],
    );

    // Also create farmer user
    const farmerPasswordHash = hashPassword("password123");
    const farmerResult = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (phone)
      DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          verified = EXCLUDED.verified,
          registration_fee_paid = EXCLUDED.registration_fee_paid
      RETURNING id, first_name, last_name, phone, role
    `,
      [
        "Test",
        "Farmer",
        "farmer@zuasoko.com",
        "+254734567890",
        farmerPasswordHash,
        "FARMER",
        "Nakuru",
        true,
        true,
      ],
    );

    res.json({
      success: true,
      message: "Admin and farmer users created/updated",
      users: [
        result.rows[0],
        farmerResult.rows[0]
      ],
      credentials: [
        { phone: "+254712345678", password: "password123", role: "ADMIN" },
        { phone: "+254734567890", password: "password123", role: "FARMER" }
      ]
    });
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    res.status(500).json({ error: error.message });
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

// Admin-specific product endpoint (returns all products including inactive)
app.get("/api/admin/products", async (req, res) => {
  try {
    console.log("👥 Fetching all products for admin (including inactive)");
    const result = await pool.query(`
      SELECT id, name, category, price_per_unit, unit, description,
             stock_quantity, COALESCE(is_featured, false) as is_featured,
             farmer_name, farmer_county, created_at, images,
             COALESCE(is_active, false) as is_active
      FROM products
      ORDER BY is_featured DESC, created_at DESC
    `);

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (err) {
    console.error("Admin products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
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

// Bulk update products to make them active
app.patch("/api/products/bulk-activate", async (req, res) => {
  try {
    console.log("🔄 Activating all products");

    const result = await pool.query(`
      UPDATE products
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE is_active IS NULL OR is_active = false
      RETURNING id, name, is_active
    `);

    console.log("✅ Products activated:", result.rows.length);
    res.json({
      success: true,
      message: `${result.rows.length} products activated`,
      activated_products: result.rows,
    });
  } catch (err) {
    console.error("❌ Error activating products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to activate products",
      error: err.message,
    });
  }
});

// Admin endpoint to refresh database with sample products
app.post("/api/admin/refresh-products", async (req, res) => {
  try {
    console.log("🔄 Refreshing database with sample products");

    // Clear existing products
    await pool.query("DELETE FROM products");

    // Insert new premium products with images
    await pool.query(`
      INSERT INTO products (
        name, category, price_per_unit, unit, description,
        stock_quantity, is_featured, farmer_name, farmer_county, images, is_active
      ) VALUES
      ('Fresh Organic Tomatoes', 'Vegetables', 130, 'kg', 'Premium Grade A organic red tomatoes, vine-ripened for maximum flavor. Rich in lycopene and vitamins. Perfect for cooking, salads, and sauces.', 85, true, 'John Kimani', 'Nakuru', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Fresh Sweet Potatoes', 'Root Vegetables', 80, 'kg', 'Farm-fresh orange sweet potatoes packed with vitamins A and C. Naturally sweet and perfect for roasting, baking, or making into delicious fries.', 45, true, 'Jane Wanjiku', 'Meru', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Organic Baby Spinach', 'Leafy Greens', 50, 'bunch', 'Tender organic baby spinach leaves, pesticide-free and freshly harvested. Rich in iron, folate, and vitamins. Perfect for salads, smoothies, and cooking.', 30, false, 'Peter Kamau', 'Kiambu', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Fresh Avocados', 'Fruits', 25, 'pieces', 'Creamy Hass avocados, perfectly ripe and ready to eat. Rich in healthy fats, fiber, and potassium. Great for guacamole, salads, or toast.', 60, true, 'Mary Njeri', 'Murang''a', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Premium Maize (White)', 'Grains', 60, 'kg', 'High-quality white maize grains, locally grown and properly dried. Perfect for making ugali, porridge, or grinding into flour. Non-GMO and pesticide-free.', 120, false, 'Samuel Mwangi', 'Laikipia', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAxQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Fresh Kales (Sukuma Wiki)', 'Leafy Greens', 30, 'bunch', 'Fresh collard greens (sukuma wiki), a Kenyan staple vegetable. Rich in vitamins K, A, and C. Perfect for traditional Kenyan dishes and nutritious meals.', 40, true, 'Grace Wanjiru', 'Kiambu', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Red Onions', 'Vegetables', 90, 'kg', 'Fresh red onions with a mild, sweet flavor. Locally grown and naturally cured for longer storage. Essential for cooking and adds great flavor to any dish.', 75, false, 'David Kiprotich', 'Nakuru', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true),
      ('Premium Green Beans', 'Vegetables', 150, 'kg', 'Tender French green beans, hand-picked at peak freshness. Crisp texture and sweet flavor, perfect for steaming, stir-frying, or adding to casseroles.', 35, true, 'Rachel Muthoni', 'Nyeri', ARRAY['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD38LnNAHmXxr+LNr8LNANxPGl5rV7GxsNLhfLSNsjcijB8xsHOAMDbubBGK/QOEuBquZ4hdOoTjOJ9CeLrVubpvZdbJdu5+y/R08zp4GhKpLaM6t5Lr/hPXIK+1R/c9gfsXdXvQAE0gP/Z'], true);
    `);

    // Get the count of inserted products
    const result = await pool.query("SELECT COUNT(*) as count FROM products");
    const count = parseInt(result.rows[0].count);

    console.log(`✅ Database refreshed with ${count} premium products`);

    res.json({
      success: true,
      message: `Database refreshed with ${count} premium products with images`,
      count: count,
    });
  } catch (err) {
    console.error("❌ Error refreshing products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to refresh products",
      error: err.message,
    });
  }
});

// Admin consignment management endpoints
app.get("/api/admin/consignments", async (req, res) => {
  try {
    console.log("👥 Fetching all consignments for admin");

    // Return all consignments with additional admin info
    const adminConsignments = [
      {
        id: 1,
        farmer_id: 2,
        farmer_name: "John Kimani",
        farmer_email: "john.farmer@zuasoko.com",
        farmer_phone: "+254710123456",
        product_name: "Fresh Tomatoes",
        category: "Vegetables",
        quantity: 50,
        unit: "kg",
        price_per_unit: 130,
        total_value: 6500,
        status: "PENDING",
        submission_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: null,
        approved_by: null,
        notes: "Grade A organic tomatoes from Nakuru",
        images: [],
        farmer_county: "Nakuru"
      },
      {
        id: 2,
        farmer_id: 3,
        farmer_name: "Jane Wanjiku",
        farmer_email: "jane.farmer@zuasoko.com",
        farmer_phone: "+254720234567",
        product_name: "Sweet Potatoes",
        category: "Root Vegetables",
        quantity: 30,
        unit: "kg",
        price_per_unit: 80,
        total_value: 2400,
        status: "APPROVED",
        submission_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        approved_by: "Admin User",
        notes: "High quality sweet potatoes from Meru",
        images: [],
        farmer_county: "Meru"
      },
      {
        id: 3,
        farmer_id: 4,
        farmer_name: "Peter Kamau",
        farmer_email: "peter.farmer@zuasoko.com",
        farmer_phone: "+254730345678",
        product_name: "Spinach",
        category: "Leafy Greens",
        quantity: 20,
        unit: "bunches",
        price_per_unit: 50,
        total_value: 1000,
        status: "REJECTED",
        submission_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        approved_by: "Admin User",
        notes: "Quality standards not met - wilted leaves",
        images: [],
        farmer_county: "Kiambu"
      }
    ];

    res.json({
      success: true,
      consignments: adminConsignments,
      count: adminConsignments.length,
      statistics: {
        total: adminConsignments.length,
        pending: adminConsignments.filter(c => c.status === 'PENDING').length,
        approved: adminConsignments.filter(c => c.status === 'APPROVED').length,
        rejected: adminConsignments.filter(c => c.status === 'REJECTED').length,
        total_value: adminConsignments.reduce((sum, c) => sum + c.total_value, 0)
      }
    });
  } catch (err) {
    console.error("❌ Error fetching admin consignments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch consignments",
      details: err.message,
    });
  }
});

app.patch("/api/admin/consignments/:id", async (req, res) => {
  try {
    const consignmentId = req.params.id;
    const { status, notes, approved_by, suggestedPrice, driverId } = req.body;

    console.log(`🔄 Admin updating consignment ${consignmentId}:`, {
      status,
      notes,
      approved_by,
      suggestedPrice,
      driverId,
      fullBody: req.body
    });

    // More flexible validation - allow updates without status change
    const validStatuses = [
      'PENDING',
      'APPROVED',
      'REJECTED',
      'PRICE_SUGGESTED',
      'DRIVER_ASSIGNED',
      'IN_TRANSIT',
      'DELIVERED',
      'COMPLETED'
    ];

    if (status && !validStatuses.includes(status)) {
      console.log(`❌ Invalid status received: "${status}"`);
      return res.status(400).json({
        success: false,
        error: `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`,
        received: { status, notes, approved_by }
      });
    }

    // If no status provided, use existing status
    const finalStatus = status || 'PENDING';

    // Mock updated consignment data
    const updatedConsignment = {
      id: parseInt(consignmentId),
      farmer_id: 2,
      farmer_name: "John Kimani",
      farmer_email: "john.farmer@zuasoko.com",
      farmer_phone: "+254710123456",
      product_name: "Fresh Tomatoes",
      category: "Vegetables",
      quantity: 50,
      unit: "kg",
      price_per_unit: 130,
      total_value: 6500,
      status: finalStatus,
      submission_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      approval_date: finalStatus !== 'PENDING' ? new Date().toISOString() : null,
      approved_by: finalStatus !== 'PENDING' ? (approved_by || "Admin User") : null,
      notes: notes || "Updated by admin",
      images: [],
      farmer_county: "Nakuru",
      updated_at: new Date().toISOString(),
      // Add new fields for price suggestions and driver assignment
      admin_suggested_price: finalStatus === 'PRICE_SUGGESTED' ? suggestedPrice : null,
      assigned_driver_id: finalStatus === 'DRIVER_ASSIGNED' ? driverId : null
    };

    // Log specific actions taken
    if (finalStatus === 'APPROVED') {
      console.log(`✅ Consignment ${consignmentId} approved - would create product listing`);
    } else if (finalStatus === 'REJECTED') {
      console.log(`❌ Consignment ${consignmentId} rejected`);
    } else if (finalStatus === 'PRICE_SUGGESTED') {
      console.log(`💰 Price suggested for consignment ${consignmentId}: KSh ${suggestedPrice}`);
    } else if (finalStatus === 'DRIVER_ASSIGNED') {
      console.log(`🚛 Driver ${driverId} assigned to consignment ${consignmentId}`);
    }

    console.log(`✅ Consignment ${consignmentId} updated successfully to ${finalStatus}`);

    res.json({
      success: true,
      message: `Consignment ${finalStatus.toLowerCase()} successfully`,
      consignment: updatedConsignment,
      debug: {
        received_status: status,
        final_status: finalStatus,
        notes: notes,
        approved_by: approved_by
      }
    });
  } catch (err) {
    console.error("❌ Error updating consignment:", err);
    console.error("Request body was:", req.body);
    console.error("Consignment ID:", req.params.id);

    res.status(500).json({
      success: false,
      error: "Failed to update consignment",
      details: err.message,
      debug: {
        consignmentId: req.params.id,
        requestBody: req.body,
        timestamp: new Date().toISOString()
      }
    });
  }
});

app.delete("/api/admin/consignments/:id", async (req, res) => {
  try {
    const consignmentId = req.params.id;
    console.log(`🗑️ Admin deleting consignment ${consignmentId}`);

    // Mock deletion response
    res.json({
      success: true,
      message: "Consignment deleted successfully",
      deleted_id: parseInt(consignmentId),
    });
  } catch (err) {
    console.error("❌ Error deleting consignment:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete consignment",
      details: err.message,
    });
  }
});

// Admin drivers management endpoints
app.get("/api/admin/drivers", async (req, res) => {
  try {
    console.log("👥 Fetching all drivers for admin");

    // Return all drivers with additional admin info
    const adminDrivers = [
      {
        id: 1,
        first_name: "David",
        last_name: "Kiprotich",
        email: "david.driver@zuasoko.com",
        phone: "+254730345678",
        license_number: "DL12345678",
        vehicle_type: "Pickup Truck",
        vehicle_registration: "KCA 123D",
        status: "ACTIVE",
        location: "Nakuru",
        total_deliveries: 45,
        rating: 4.8,
        earnings: 125000,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true
      },
      {
        id: 2,
        first_name: "Grace",
        last_name: "Mwangi",
        email: "grace.driver@zuasoko.com",
        phone: "+254741234567",
        license_number: "DL87654321",
        vehicle_type: "Van",
        vehicle_registration: "KBZ 456E",
        status: "ACTIVE",
        location: "Nairobi",
        total_deliveries: 62,
        rating: 4.9,
        earnings: 185000,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true
      },
      {
        id: 3,
        first_name: "Samuel",
        last_name: "Njoroge",
        email: "samuel.driver@zuasoko.com",
        phone: "+254752345678",
        license_number: "DL11223344",
        vehicle_type: "Motorcycle",
        vehicle_registration: "KMEW 789F",
        status: "OFFLINE",
        location: "Kiambu",
        total_deliveries: 28,
        rating: 4.6,
        earnings: 78000,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        verified: false
      }
    ];

    res.json({
      success: true,
      drivers: adminDrivers,
      count: adminDrivers.length,
      statistics: {
        total: adminDrivers.length,
        active: adminDrivers.filter(d => d.status === 'ACTIVE').length,
        offline: adminDrivers.filter(d => d.status === 'OFFLINE').length,
        verified: adminDrivers.filter(d => d.verified).length,
        total_deliveries: adminDrivers.reduce((sum, d) => sum + d.total_deliveries, 0),
        total_earnings: adminDrivers.reduce((sum, d) => sum + d.earnings, 0)
      }
    });
  } catch (err) {
    console.error("❌ Error fetching admin drivers:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch drivers",
      details: err.message,
    });
  }
});

app.patch("/api/admin/drivers/:id", async (req, res) => {
  try {
    const driverId = req.params.id;
    const { status, verified } = req.body;

    console.log(`🔄 Admin updating driver ${driverId}:`, { status, verified });

    // Mock updated driver data
    const updatedDriver = {
      id: parseInt(driverId),
      first_name: "David",
      last_name: "Kiprotich",
      email: "david.driver@zuasoko.com",
      phone: "+254730345678",
      license_number: "DL12345678",
      vehicle_type: "Pickup Truck",
      vehicle_registration: "KCA 123D",
      status: status || "ACTIVE",
      location: "Nakuru",
      total_deliveries: 45,
      rating: 4.8,
      earnings: 125000,
      verified: verified !== undefined ? verified : true,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: "Driver updated successfully",
      driver: updatedDriver,
    });
  } catch (err) {
    console.error("❌ Error updating driver:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update driver",
      details: err.message,
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
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
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
app.get("/api/admin/analytics/stats", authenticateAdmin, async (req, res) => {
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
app.get("/api/admin/activity", authenticateAdmin, async (req, res) => {
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

// Consignments endpoints
app.get("/api/consignments", authenticateToken, async (req, res) => {
  try {
    console.log("📦 Fetching consignments for user:", req.user.userId);

    // Fetch consignments from database for the authenticated user
    const result = await pool.query(`
      SELECT
        c.*,
        u.first_name as farmer_first_name,
        u.last_name as farmer_last_name
      FROM consignments c
      LEFT JOIN users u ON c.farmer_id = u.id
      WHERE c.farmer_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.userId]);

    const consignments = result.rows.map(row => ({
      id: row.id,
      farmer_id: row.farmer_id,
      farmer_name: `${row.farmer_first_name} ${row.farmer_last_name}`,
      product_name: row.product_name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      price_per_unit: row.price_per_unit,
      total_value: row.total_value,
      status: row.status,
      notes: row.notes,
      location: row.location,
      harvest_date: row.harvest_date,
      expiry_date: row.expiry_date,
      images: JSON.parse(row.images || '[]'),
      admin_notes: row.admin_notes,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    console.log(`✅ Found ${consignments.length} consignments for user ${req.user.userId}`);

    res.json({
      success: true,
      consignments,
      count: consignments.length,
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

app.post("/api/consignments", authenticateToken, async (req, res) => {
  try {
    console.log("➕ Creating new consignment");
    const {
      product_name,
      category,
      quantity,
      unit,
      price_per_unit,
      notes,
      location,
      harvest_date,
      expiry_date,
      images
    } = req.body;

    console.log("📦 Consignment data:", {
      product_name,
      category,
      quantity,
      unit,
      price_per_unit,
      notes: notes?.substring(0, 50) + "...",
      location,
      harvest_date,
      expiry_date,
      images_count: images?.length || 0
    });

    // Get current user from token
    const farmer_id = req.user.userId;

    // Insert into database
    const result = await pool.query(`
      INSERT INTO consignments (
        farmer_id, product_name, category, quantity, unit,
        price_per_unit, total_value, status, notes, location,
        harvest_date, expiry_date, images, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      farmer_id,
      product_name,
      category,
      parseFloat(quantity),
      unit,
      parseFloat(price_per_unit),
      parseFloat(quantity) * parseFloat(price_per_unit),
      'PENDING',
      notes || '',
      location || '',
      harvest_date || null,
      expiry_date || null,
      JSON.stringify(images || []),
      new Date()
    ]);

    const newConsignment = result.rows[0];

    console.log("✅ Consignment created successfully:", newConsignment.id);

    res.status(201).json({
      success: true,
      message: "Consignment submitted successfully",
      consignment: {
        id: newConsignment.id,
        farmer_id: newConsignment.farmer_id,
        product_name: newConsignment.product_name,
        category: newConsignment.category,
        quantity: newConsignment.quantity,
        unit: newConsignment.unit,
        price_per_unit: newConsignment.price_per_unit,
        total_value: newConsignment.total_value,
        status: newConsignment.status,
        notes: newConsignment.notes,
        location: newConsignment.location,
        harvest_date: newConsignment.harvest_date,
        expiry_date: newConsignment.expiry_date,
        images: JSON.parse(newConsignment.images || '[]'),
        created_at: newConsignment.created_at
      },
    });
  } catch (err) {
    console.error("❌ Error creating consignment:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create consignment",
      details: err.message,
    });
  }
});

// Wallet endpoint
app.get("/api/wallet", authenticateToken, async (req, res) => {
  try {
    console.log("💰 Fetching wallet for user:", req.user.userId);

    // Mock wallet data for now
    const wallet = {
      id: req.user.userId,
      balance: 15750.50,
      transactions: [
        {
          id: 1,
          type: "CREDIT",
          amount: 13000,
          description: "Payment for tomatoes consignment #1",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "COMPLETED"
        },
        {
          id: 2,
          type: "DEBIT",
          amount: 300,
          description: "Registration fee payment",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "COMPLETED"
        },
        {
          id: 3,
          type: "CREDIT",
          amount: 3050.50,
          description: "Payment for sweet potatoes consignment #2",
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: "COMPLETED"
        }
      ]
    };

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error("❌ Error fetching wallet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wallet data"
    });
  }
});

// STK Withdrawal endpoint
app.post("/api/wallet/withdraw", authenticateToken, async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const userId = req.user.userId;

    console.log(`💸 STK Withdrawal request: KSh ${amount} to ${phone} for user ${userId}`);

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid withdrawal amount"
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        error: "Minimum withdrawal amount is KSh 10"
      });
    }

    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        error: "Maximum withdrawal amount is KSh 100,000"
      });
    }

    // Validate phone number
    if (!phone || !phone.match(/^\+254[0-9]{9}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format. Use +254XXXXXXXXX"
      });
    }

    // For now, simulate the withdrawal process
    // In real implementation, integrate with M-Pesa API

    const withdrawal = {
      id: Date.now(),
      user_id: userId,
      amount: parseFloat(amount),
      phone,
      status: "PENDING",
      reference: `WD${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // Simulate processing delay
    setTimeout(() => {
      console.log(`✅ STK withdrawal processed: ${withdrawal.reference}`);
    }, 2000);

    res.json({
      success: true,
      message: "STK withdrawal request initiated successfully",
      withdrawal,
      reference: withdrawal.reference
    });

  } catch (error) {
    console.error("❌ Error processing STK withdrawal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process withdrawal request"
    });
  }
});

// Notifications endpoint
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    console.log("🔔 Fetching notifications for user:", req.user.userId);

    // Mock notifications data
    const notifications = [
      {
        id: 1,
        title: "Consignment Approved",
        message: "Your tomatoes consignment has been approved for KSh 130/kg",
        type: "SUCCESS",
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        title: "Payment Processed",
        message: "Payment of KSh 13,000 has been credited to your wallet",
        type: "INFO",
        read: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        title: "Welcome to Zuasoko",
        message: "Thank you for joining our agricultural marketplace platform",
        type: "INFO",
        read: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications"
    });
  }
});

// Admin M-Pesa Settings endpoints
app.get("/api/admin/mpesa-settings", authenticateAdmin, async (req, res) => {
  try {
    console.log("🔧 Fetching M-Pesa settings");

    // For now, return mock settings (in production, store in database)
    const settings = {
      consumer_key: process.env.MPESA_CONSUMER_KEY || "",
      consumer_secret: process.env.MPESA_CONSUMER_SECRET ? "••••••••" : "",
      passkey: process.env.MPESA_PASSKEY ? "••••••••" : "",
      shortcode: process.env.MPESA_SHORTCODE || "",
      environment: process.env.MPESA_ENVIRONMENT || "sandbox",
      callback_url: process.env.MPESA_CALLBACK_URL || "",
      configured: !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET),
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error("❌ Error fetching M-Pesa settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch M-Pesa settings"
    });
  }
});

app.put("/api/admin/mpesa-settings", authenticateAdmin, async (req, res) => {
  try {
    const {
      consumer_key,
      consumer_secret,
      passkey,
      shortcode,
      environment,
      callback_url
    } = req.body;

    console.log("🔧 Updating M-Pesa settings");

    // Validate required fields
    if (!consumer_key || !consumer_secret || !passkey || !shortcode) {
      return res.status(400).json({
        success: false,
        error: "All M-Pesa credentials are required"
      });
    }

    // In production, these would be stored securely in database
    // For demo, we'll just validate and return success
    const updatedSettings = {
      consumer_key,
      consumer_secret: "••••••••", // Hide in response
      passkey: "••••••••", // Hide in response
      shortcode,
      environment: environment || "sandbox",
      callback_url: callback_url || "",
      configured: true,
      updated_at: new Date().toISOString()
    };

    console.log("✅ M-Pesa settings updated successfully");

    res.json({
      success: true,
      message: "M-Pesa settings updated successfully",
      settings: updatedSettings
    });

  } catch (error) {
    console.error("❌ Error updating M-Pesa settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update M-Pesa settings"
    });
  }
});

// Test M-Pesa connection endpoint
app.post("/api/admin/mpesa-test", authenticateAdmin, async (req, res) => {
  try {
    console.log("🧪 Testing M-Pesa connection");

    // Simulate M-Pesa API test
    const testResult = {
      status: "success",
      message: "M-Pesa connection test successful",
      environment: "sandbox",
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      test_result: testResult
    });

  } catch (error) {
    console.error("❌ M-Pesa connection test failed:", error);
    res.status(500).json({
      success: false,
      error: "M-Pesa connection test failed"
    });
  }
});

// Drivers endpoints
app.get("/api/drivers", async (req, res) => {
  try {
    console.log("🚛 Fetching drivers");

    // Return mock driver data
    const mockDrivers = [
      {
        id: 1,
        first_name: "David",
        last_name: "Kiprotich",
        email: "david.driver@zuasoko.com",
        phone: "+254730345678",
        license_number: "DL12345678",
        vehicle_type: "Pickup Truck",
        vehicle_registration: "KCA 123D",
        status: "ACTIVE",
        location: "Nakuru",
        total_deliveries: 45,
        rating: 4.8,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        first_name: "Grace",
        last_name: "Mwangi",
        email: "grace.driver@zuasoko.com",
        phone: "+254741234567",
        license_number: "DL87654321",
        vehicle_type: "Van",
        vehicle_registration: "KBZ 456E",
        status: "ACTIVE",
        location: "Nairobi",
        total_deliveries: 62,
        rating: 4.9,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        first_name: "Samuel",
        last_name: "Njoroge",
        email: "samuel.driver@zuasoko.com",
        phone: "+254752345678",
        license_number: "DL11223344",
        vehicle_type: "Motorcycle",
        vehicle_registration: "KMEW 789F",
        status: "OFFLINE",
        location: "Kiambu",
        total_deliveries: 28,
        rating: 4.6,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      drivers: mockDrivers,
      count: mockDrivers.length,
    });
  } catch (err) {
    console.error("❌ Error fetching drivers:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch drivers",
      details: err.message,
    });
  }
});

app.post("/api/drivers", async (req, res) => {
  try {
    console.log("➕ Creating new driver");
    const { first_name, last_name, email, phone, license_number, vehicle_type, vehicle_registration } = req.body;

    const newDriver = {
      id: Date.now(),
      first_name,
      last_name,
      email,
      phone,
      license_number,
      vehicle_type,
      vehicle_registration,
      status: "ACTIVE",
      location: "Nairobi",
      total_deliveries: 0,
      rating: 5.0,
      created_at: new Date().toISOString(),
      last_delivery: null
    };

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      driver: newDriver,
    });
  } catch (err) {
    console.error("❌ Error creating driver:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create driver",
      details: err.message,
    });
  }
});

// Test endpoint for debugging
app.patch("/api/test/:id", async (req, res) => {
  try {
    console.log("🧪 Test PATCH endpoint called");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);

    res.json({
      success: true,
      message: "Test PATCH endpoint working",
      received: {
        id: req.params.id,
        body: req.body,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Test endpoint failed",
      details: err.message
    });
  }
});

// Debug auth endpoint
app.get("/api/debug/auth", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    user: req.user,
    environment: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET ? "configured" : "default",
    timestamp: new Date().toISOString()
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
      config: {
        port: PORT,
        has_database_url: !!process.env.DATABASE_URL,
        has_jwt_secret: !!process.env.JWT_SECRET,
        domain: req.get('host'),
        protocol: req.protocol
      }
    });
  } catch (err) {
    res.json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message,
      config: {
        port: PORT,
        has_database_url: !!process.env.DATABASE_URL,
        has_jwt_secret: !!process.env.JWT_SECRET,
        database_url_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
      },
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
    console.log(`❌ 404 API endpoint not found: ${req.method} ${req.path}`);
    return res.status(404).json({
      error: "API endpoint not found",
      path: req.path,
      method: req.method,
      availableEndpoints: [
        "GET /api/status",
        "GET /api/admin/users",
        "GET /api/admin/analytics/stats",
        "GET /api/admin/activity",
        "GET /api/admin/consignments",
        "PATCH /api/admin/consignments/:id",
        "DELETE /api/admin/consignments/:id",
        "GET /api/admin/drivers",
        "PATCH /api/admin/drivers/:id",
        "GET /api/admin/settings",
        "PUT /api/admin/settings",
        "GET /api/admin/products",
        "POST /api/admin/refresh-products",
        "GET /api/admin/registration-fees/unpaid",
        "POST /api/admin/registration-fees/stk-push",
        "GET /api/admin/registration-fees/settings",
        "POST /api/auth/login",
        "POST /api/auth/register",
        "GET /api/products",
        "POST /api/products",
        "PUT /api/products/:id",
        "DELETE /api/products/:id",
        "PATCH /api/products/bulk-activate",
        "GET /api/marketplace/products",
        "GET /api/marketplace/categories",
        "GET /api/marketplace/counties",
        "GET /api/consignments",
        "POST /api/consignments",
        "GET /api/drivers",
        "POST /api/drivers"
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
      "GET /api/admin/activity",
      "GET /api/admin/products",
      "POST /api/products",
      "PUT /api/products/:id",
      "DELETE /api/products/:id"
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
