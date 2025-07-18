const { Pool } = require("pg");
const fs = require("fs");

// Database connection using Render.com credentials
const pool = new Pool({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

async function setupDatabase() {
  try {
    console.log("🔄 Connecting to Render.com PostgreSQL database...");

    // Test connection
    const testResult = await pool.query(
      "SELECT NOW() as current_time, version() as db_version",
    );
    console.log("✅ Database connection successful!");
    console.log("📅 Current time:", testResult.rows[0].current_time);
    console.log(
      "🗄️ Database version:",
      testResult.rows[0].db_version.split(",")[0],
    );

    // Read and execute setup script
    console.log("🔄 Setting up database schema...");
    const sqlScript = fs.readFileSync("setup-render-db.sql", "utf8");

    // Execute the SQL script
    await pool.query(sqlScript);

    console.log("✅ Database schema and seed data setup complete!");

    // Verify setup by checking tables
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

    // Check sample data
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const productsCount = await pool.query("SELECT COUNT(*) FROM products");

    console.log(`👥 Users created: ${usersCount.rows[0].count}`);
    console.log(`🛒 Products created: ${productsCount.rows[0].count}`);

    // Test a sample query
    const sampleProducts = await pool.query(`
      SELECT name, category, price_per_unit, unit, farmer_name, farmer_county 
      FROM products 
      WHERE is_active = true 
      LIMIT 3
    `);

    console.log("🔍 Sample products:");
    sampleProducts.rows.forEach((product) => {
      console.log(
        `   - ${product.name} (${product.category}) - KSh ${product.price_per_unit}/${product.unit} by ${product.farmer_name}, ${product.farmer_county}`,
      );
    });
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.detail) {
      console.error("Error detail:", error.detail);
    }
  } finally {
    await pool.end();
    console.log("🔚 Database connection closed");
  }
}

// Run the setup
setupDatabase();
