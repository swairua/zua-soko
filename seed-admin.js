const { Pool } = require("pg");
const crypto = require("crypto");

// Simple hash function
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// Database connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 15000,
});

async function seedAdmin() {
  try {
    console.log("🌱 Seeding admin user...");

    const adminPasswordHash = hashPassword("password123");

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

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log("✅ Admin user ready!");
      console.log(`📱 Login: ${user.phone} / password123`);
      console.log(`👤 Role: ${user.role}`);
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin();
}

module.exports = { seedAdmin };
