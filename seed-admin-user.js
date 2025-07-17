const { Pool } = require("pg");
const crypto = require("crypto");

// Simple hash function matching api/index.js
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

async function seedAdminUser() {
  try {
    console.log("🔄 Seeding admin user...");

    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected");

    // Hash the password properly
    const adminPasswordHash = hashPassword("password123");
    console.log(
      "🔐 Generated password hash for password123:",
      adminPasswordHash.substring(0, 10) + "...",
    );

    // Insert or update admin user
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
      console.log("✅ Admin user created/updated successfully!");
      console.log("📱 Phone:", user.phone);
      console.log("👤 Name:", user.first_name, user.last_name);
      console.log("🔑 Role:", user.role);
      console.log("🆔 ID:", user.id);
    }

    // Verify the user can be found
    const verifyResult = await pool.query(
      "SELECT id, first_name, last_name, phone, role, password_hash FROM users WHERE phone = $1",
      ["+254712345678"],
    );

    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log("✅ Verification: Admin user found in database");
      console.log(
        "🔐 Stored hash:",
        user.password_hash.substring(0, 10) + "...",
      );

      // Test password verification
      const testHash = hashPassword("password123");
      const passwordMatch = testHash === user.password_hash;
      console.log(
        "🔍 Password verification test:",
        passwordMatch ? "PASS" : "FAIL",
      );

      if (!passwordMatch) {
        console.error("❌ Password hash mismatch!");
        console.error("Expected:", testHash.substring(0, 10) + "...");
        console.error("Stored:", user.password_hash.substring(0, 10) + "...");
      }
    } else {
      console.error("❌ Admin user not found after creation!");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
    console.error("Error code:", error.code);
  } finally {
    await pool.end();
  }
}

seedAdminUser();
