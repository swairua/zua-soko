const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load environment variables
require('dotenv').config();

// Database configuration for localhost
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "zuasoko_db",
  user: process.env.DB_USER || "zuasoko_user",
  password: process.env.DB_PASSWORD || "password",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

console.log("🔄 Setting up localhost database...");
console.log("📊 Database config:", {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: dbConfig.ssl,
});

const pool = new Pool(dbConfig);

// Simple hash function for demo purposes
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

async function setupLocalhostDatabase() {
  try {
    console.log("🔄 Connecting to PostgreSQL database...");

    // Test connection first
    const testResult = await pool.query(
      "SELECT NOW() as current_time, version() as db_version"
    );
    console.log("✅ Database connection successful!");
    console.log("📅 Current time:", testResult.rows[0].current_time);
    console.log(
      "🗄️ Database version:",
      testResult.rows[0].db_version.split(",")[0]
    );

    // Read and execute schema file
    console.log("🔄 Setting up database schema...");
    const schemaPath = path.join(__dirname, "backend/src/database/schema.sql");
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const sqlScript = fs.readFileSync(schemaPath, "utf8");
    await pool.query(sqlScript);
    console.log("✅ Database schema created successfully!");

    // Setup demo data
    console.log("🔄 Setting up demo data...");
    await setupDemoData();

    // Verify setup
    await verifySetup();

    console.log("🎉 Localhost database setup complete!");
    console.log("\n📋 Demo credentials:");
    console.log("   Admin: +254712345678 / password123");
    console.log("   Farmer: +254734567890 / password123");
    console.log("   Customer: +254756789012 / password123");
    console.log("   Driver: +254778901234 / password123");
    console.log("\n🚀 You can now start the application with 'npm run dev'");

  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.detail) {
      console.error("Error detail:", error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log("🔚 Database connection closed");
  }
}

async function setupDemoData() {
  // Check if users already exist
  const userCount = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(userCount.rows[0].count) > 0) {
    console.log("ℹ️ Demo data already exists, skipping initialization");
    return;
  }

  const demoPassword = hashPassword("password123");

  // Create demo users
  const users = [
    {
      id: "admin-user-id",
      firstName: "Admin",
      lastName: "User",
      email: "admin@zuasoko.com",
      phone: "+254712345678",
      role: "ADMIN",
      county: "Nairobi",
      verified: true,
    },
    {
      id: "farmer-user-id",
      firstName: "John",
      lastName: "Farmer",
      email: "farmer@zuasoko.com",
      phone: "+254734567890",
      role: "FARMER",
      county: "Nakuru",
      verified: true,
    },
    {
      id: "customer-user-id",
      firstName: "Jane",
      lastName: "Customer",
      email: "customer@zuasoko.com",
      phone: "+254756789012",
      role: "CUSTOMER",
      county: "Nairobi",
      verified: true,
    },
    {
      id: "driver-user-id",
      firstName: "Mike",
      lastName: "Driver",
      email: "driver@zuasoko.com",
      phone: "+254778901234",
      role: "DRIVER",
      county: "Kiambu",
      verified: true,
    },
  ];

  for (const user of users) {
    await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
    `,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        demoPassword,
        user.role,
        user.county,
        user.verified,
      ]
    );
  }

  // Get user IDs for relationships
  const adminUser = await pool.query("SELECT id FROM users WHERE email = 'admin@zuasoko.com'");
  const farmerUser = await pool.query("SELECT id FROM users WHERE email = 'farmer@zuasoko.com'");
  const customerUser = await pool.query("SELECT id FROM users WHERE email = 'customer@zuasoko.com'");
  const driverUser = await pool.query("SELECT id FROM users WHERE email = 'driver@zuasoko.com'");

  if (farmerUser.rows.length === 0) {
    console.log("⚠️ Could not find farmer user for demo data setup");
    return;
  }

  const farmerId = farmerUser.rows[0].id;

  // Create demo warehouse
  await pool.query(
    `
    INSERT INTO warehouses (name, location, capacity, current_stock, manager_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT DO NOTHING
  `,
    [
      "Nairobi Central Warehouse",
      "Industrial Area, Nairobi",
      10000,
      850,
      adminUser.rows.length > 0 ? adminUser.rows[0].id : null,
    ]
  );

  // Create farmer wallet
  if (farmerUser.rows.length > 0) {
    await pool.query(
      `
      INSERT INTO wallets (user_id, balance, total_earned)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO NOTHING
    `,
      [farmerId, 2500.0, 5000.0]
    );
  }

  // Create demo farmer categories
  const categories = [
    { name: "Vegetables", description: "Fresh vegetables and leafy greens" },
    { name: "Fruits", description: "Fresh fruits and berries" },
    { name: "Grains", description: "Cereals, rice, wheat, and other grains" },
    { name: "Legumes", description: "Beans, peas, lentils, and pulses" },
    { name: "Cereals", description: "Maize, millet, sorghum, and other cereals" },
    { name: "Herbs", description: "Medicinal and culinary herbs" },
    { name: "Root Vegetables", description: "Potatoes, carrots, onions, and tubers" },
    { name: "Dairy", description: "Milk and dairy products" },
    { name: "Poultry", description: "Chickens, eggs, and poultry products" },
    { name: "Livestock", description: "Cattle, goats, sheep, and livestock products" }
  ];

  for (const category of categories) {
    await pool.query(
      `
      INSERT INTO farmer_categories_list (name, description, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO NOTHING
      `,
      [category.name, category.description, true]
    );
  }

  // Assign categories to demo farmer
  try {
    const vegetableCategory = await pool.query(
      "SELECT id FROM farmer_categories_list WHERE name = 'Vegetables'"
    );
    const fruitCategory = await pool.query(
      "SELECT id FROM farmer_categories_list WHERE name = 'Fruits'"
    );

    if (vegetableCategory.rows.length > 0) {
      await pool.query(
        `
        INSERT INTO farmer_categories (farmer_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (farmer_id, category_id) DO NOTHING
        `,
        [farmerId, vegetableCategory.rows[0].id]
      );
    }

    if (fruitCategory.rows.length > 0) {
      await pool.query(
        `
        INSERT INTO farmer_categories (farmer_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (farmer_id, category_id) DO NOTHING
        `,
        [farmerId, fruitCategory.rows[0].id]
      );
    }
  } catch (categoryError) {
    console.log("⚠️ Could not assign demo categories:", categoryError.message);
  }

  // Create demo consignments
  const consignments = [
    {
      farmer_id: farmerId,
      title: "Fresh Tomatoes",
      description: "Premium quality tomatoes from Nakuru",
      category: "Vegetables",
      quantity: 500,
      unit: "kg",
      bid_price_per_unit: 80,
      final_price_per_unit: 85,
      images: ["https://images.unsplash.com/photo-1546470427-e212b9d56085"],
      location: "Nakuru",
      status: "APPROVED",
    },
    {
      farmer_id: farmerId,
      title: "Organic Carrots",
      description: "Freshly harvested organic carrots",
      category: "Vegetables",
      quantity: 300,
      unit: "kg",
      bid_price_per_unit: 60,
      status: "PENDING",
      images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37"],
      location: "Nakuru",
    },
  ];

  for (const consignment of consignments) {
    await pool.query(
      `
      INSERT INTO consignments (
        farmer_id, title, description, category, quantity, unit,
        bid_price_per_unit, final_price_per_unit, images, location, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `,
      [
        consignment.farmer_id,
        consignment.title,
        consignment.description,
        consignment.category,
        consignment.quantity,
        consignment.unit,
        consignment.bid_price_per_unit,
        consignment.final_price_per_unit || null,
        consignment.images,
        consignment.location,
        consignment.status,
      ]
    );
  }

  // Get warehouse ID for products
  const warehouse = await pool.query("SELECT id FROM warehouses LIMIT 1");
  const warehouseId = warehouse.rows.length > 0 ? warehouse.rows[0].id : null;

  // Create demo marketplace products
  const products = [
    {
      name: "Fresh Tomatoes",
      description: "Premium quality tomatoes from Nakuru. Perfect for salads and cooking.",
      category: "Vegetables",
      quantity: 500,
      unit: "kg",
      price_per_unit: 85,
      images: ["https://images.unsplash.com/photo-1546470427-e212b9d56085"],
      stock_quantity: 500,
      warehouse_id: warehouseId,
    },
    {
      name: "Organic Spinach",
      description: "Fresh organic spinach, rich in vitamins and minerals.",
      category: "Vegetables",
      quantity: 100,
      unit: "kg",
      price_per_unit: 120,
      images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb"],
      stock_quantity: 100,
      warehouse_id: warehouseId,
    },
    {
      name: "Sweet Bananas",
      description: "Sweet and ripe bananas from central Kenya.",
      category: "Fruits",
      quantity: 200,
      unit: "kg",
      price_per_unit: 60,
      images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"],
      stock_quantity: 200,
      warehouse_id: warehouseId,
    },
  ];

  for (const product of products) {
    await pool.query(
      `
      INSERT INTO products (
        name, description, category, quantity, unit, price_per_unit,
        images, stock_quantity, warehouse_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [
        product.name,
        product.description,
        product.category,
        product.quantity,
        product.unit,
        product.price_per_unit,
        product.images,
        product.stock_quantity,
        product.warehouse_id,
        true,
      ]
    );
  }

  console.log("✅ Demo data created successfully");
}

async function verifySetup() {
  console.log("🔍 Verifying database setup...");

  // Check tables
  const tablesResult = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  console.log("📋 Created tables:");
  tablesResult.rows.forEach((row) => {
    console.log(`   - ${row.table_name}`);
  });

  // Check data counts
  const usersCount = await pool.query("SELECT COUNT(*) FROM users");
  const productsCount = await pool.query("SELECT COUNT(*) FROM products");
  const categoriesCount = await pool.query("SELECT COUNT(*) FROM farmer_categories_list");
  const consignmentsCount = await pool.query("SELECT COUNT(*) FROM consignments");

  console.log(`👥 Users: ${usersCount.rows[0].count}`);
  console.log(`📦 Products: ${productsCount.rows[0].count}`);
  console.log(`📂 Categories: ${categoriesCount.rows[0].count}`);
  console.log(`🌾 Consignments: ${consignmentsCount.rows[0].count}`);

  // Test sample queries
  const sampleUsers = await pool.query(`
    SELECT first_name, last_name, role, phone 
    FROM users 
    ORDER BY role
  `);

  console.log("👤 Sample users:");
  sampleUsers.rows.forEach((user) => {
    console.log(`   - ${user.first_name} ${user.last_name} (${user.role}) - ${user.phone}`);
  });

  const sampleProducts = await pool.query(`
    SELECT name, category, price_per_unit, unit, stock_quantity
    FROM products 
    WHERE is_active = true 
    ORDER BY name
  `);

  console.log("🛒 Sample products:");
  sampleProducts.rows.forEach((product) => {
    console.log(
      `   - ${product.name} (${product.category}) - KSh ${product.price_per_unit}/${product.unit} (Stock: ${product.stock_quantity})`
    );
  });

  console.log("✅ Database verification complete");
}

// Run the setup
if (require.main === module) {
  setupLocalhostDatabase();
}

module.exports = { setupLocalhostDatabase };
