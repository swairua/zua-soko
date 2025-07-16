const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database connection using environment variables
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 15000,
});

async function deployDatabase() {
  try {
    console.log("🔄 Starting database deployment...");

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

    // Check if backend/database.sql exists, otherwise use setup-render-db.sql
    let sqlFile = "backend/database.sql";
    if (!fs.existsSync(sqlFile)) {
      sqlFile = "setup-render-db.sql";
      console.log(
        "⚠️ backend/database.sql not found, using setup-render-db.sql",
      );
    }

    if (!fs.existsSync(sqlFile)) {
      console.error("❌ No database schema file found!");
      process.exit(1);
    }

    console.log(`🔄 Reading database schema from ${sqlFile}...`);
    const sqlSchema = fs.readFileSync(sqlFile, "utf8");

    console.log("🔄 Executing database schema...");
    await pool.query(sqlSchema);

    console.log("✅ Database schema executed successfully!");

    // Verify deployment by checking tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("📋 Database tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check sample data
    try {
      const usersCount = await pool.query("SELECT COUNT(*) FROM users");
      const productsCount = await pool.query("SELECT COUNT(*) FROM products");

      console.log(`👥 Users in database: ${usersCount.rows[0].count}`);
      console.log(`🛒 Products in database: ${productsCount.rows[0].count}`);

      if (parseInt(usersCount.rows[0].count) > 0) {
        const adminUser = await pool.query(`
          SELECT first_name, last_name, phone, email, role 
          FROM users 
          WHERE role = 'ADMIN' 
          LIMIT 1
        `);

        if (adminUser.rows.length > 0) {
          const admin = adminUser.rows[0];
          console.log(
            `🔑 Admin user: ${admin.first_name} ${admin.last_name} (${admin.phone})`,
          );
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not verify sample data:", error.message);
    }

    console.log("🎉 Database deployment completed successfully!");
  } catch (error) {
    console.error("❌ Database deployment failed:", error.message);
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

// Run deployment if this script is executed directly
if (require.main === module) {
  deployDatabase();
}

module.exports = { deployDatabase };
