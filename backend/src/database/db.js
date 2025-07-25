const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database configuration with fallback to default values
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "zuasoko_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on("connect", () => {
  console.log("📦 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("💥 Database connection error:", err);
  process.exit(-1);
});

// Initialize database schema
async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database schema...");

    // Read and execute schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("✅ Database schema initialized successfully");

    // Initialize demo data
    await initializeDemoData();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

// Initialize demo data (test users and sample data)
async function initializeDemoData() {
  try {
    console.log("🔄 Initializing demo data...");

    // Check if users already exist
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log("ℹ️ Demo data already exists, skipping initialization");
      return;
    }

    const argon2 = require("argon2");
    const demoPassword = await argon2.hash("password123");

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
        registrationFeePaid: true,
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
        registrationFeePaid: true,
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
        registrationFeePaid: false,
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
        registrationFeePaid: false,
      },
    ];

    for (const user of users) {
      await pool.query(
        `
        INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `,
        [
          user.id,
          user.firstName,
          user.lastName,
          user.email,
          user.phone,
          demoPassword,
          user.role,
          user.county,
          user.verified,
          user.registrationFeePaid,
        ],
      );
    }

    // Create demo warehouse
    await pool.query(
      `
      INSERT INTO warehouses (id, name, location, capacity, current_stock, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        "warehouse-1",
        "Nairobi Central Warehouse",
        "Industrial Area, Nairobi",
        10000,
        850,
        "admin-user-id",
      ],
    );

    // Create farmer wallet
    await pool.query(
      `
      INSERT INTO wallets (user_id, balance, total_earned)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO NOTHING
    `,
      ["farmer-user-id", 2500.0, 5000.0],
    );

    // Create demo consignments
    const consignments = [
      {
        id: "consignment-1",
        farmer_id: "farmer-user-id",
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
        id: "consignment-2",
        farmer_id: "farmer-user-id",
        title: "Organic Carrots",
        description: "Freshly harvested organic carrots",
        category: "Vegetables",
        quantity: 300,
        unit: "kg",
        bid_price_per_unit: 60,
        status: "PENDING",
        images: [
          "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
        ],
        location: "Nakuru",
      },
      {
        id: "consignment-3",
        farmer_id: "farmer-user-id",
        title: "Green Beans",
        description: "Fresh green beans ready for pickup",
        category: "Vegetables",
        quantity: 200,
        unit: "kg",
        bid_price_per_unit: 90,
        final_price_per_unit: 95,
        images: [
          "https://images.unsplash.com/photo-1628773822503-930a7eaecf80",
        ],
        location: "Nakuru",
        status: "DRIVER_ASSIGNED",
        driver_id: "driver-user-id",
      },
    ];

    for (const consignment of consignments) {
      await pool.query(
        `
        INSERT INTO consignments (
          id, farmer_id, title, description, category, quantity, unit,
          bid_price_per_unit, final_price_per_unit, images, location, status, driver_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
      `,
        [
          consignment.id,
          consignment.farmer_id,
          consignment.title,
          consignment.description,
          consignment.category,
          consignment.quantity,
          consignment.unit,
          consignment.bid_price_per_unit,
          consignment.final_price_per_unit,
          consignment.images,
          consignment.location,
          consignment.status,
          consignment.driver_id,
        ],
      );
    }

    // Create marketplace products from approved consignments
    await pool.query(
      `
      INSERT INTO products (id, consignment_id, warehouse_id, name, category, quantity, unit, price_per_unit, images, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        "product-1",
        "consignment-1",
        "warehouse-1",
        "Fresh Tomatoes",
        "Vegetables",
        500,
        "kg",
        85,
        ["https://images.unsplash.com/photo-1546470427-e212b9d56085"],
        500,
      ],
    );

    await pool.query(
      `
      INSERT INTO products (id, consignment_id, warehouse_id, name, category, quantity, unit, price_per_unit, images, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        "product-3",
        "consignment-3",
        "warehouse-1",
        "Green Beans",
        "Vegetables",
        200,
        "kg",
        95,
        ["https://images.unsplash.com/photo-1628773822503-930a7eaecf80"],
        200,
      ],
    );

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

    // Assign demo categories to the demo farmer
    try {
      // Get vegetable and fruit category IDs
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
          ["farmer-user-id", vegetableCategory.rows[0].id]
        );
      }

      if (fruitCategory.rows.length > 0) {
        await pool.query(
          `
          INSERT INTO farmer_categories (farmer_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT (farmer_id, category_id) DO NOTHING
          `,
          ["farmer-user-id", fruitCategory.rows[0].id]
        );
      }
    } catch (categoryError) {
      console.log("⚠️ Could not assign demo categories:", categoryError.message);
    }

    console.log("✅ Demo data initialized successfully");
    console.log("📋 Demo credentials:");
    console.log("   Admin: +254712345678 / password123");
    console.log("   Farmer: +254734567890 / password123");
    console.log("   Customer: +254756789012 / password123");
    console.log("   Driver: +254778901234 / password123");
  } catch (error) {
    console.error("❌ Error initializing demo data:", error);
    throw error;
  }
}

// Query helper function
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.log("🐌 Slow query:", { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error("💥 Database query error:", { text, error: error.message });
    throw error;
  }
}

// Transaction helper
async function transaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🔄 Gracefully shutting down database connections...");
  pool.end(() => {
    console.log("✅ Database pool has ended");
    process.exit(0);
  });
});

module.exports = {
  pool,
  query,
  transaction,
  initializeDatabase,
  initializeDemoData,
};
