const { Client } = require("pg");
const crypto = require("crypto");

// Database connection with live Render.com credentials
const client = new Client({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
});

// Hash password function (same as in server)
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

async function setupUsers() {
  try {
    console.log("🚀 Connecting to database...");
    await client.connect();
    console.log("✅ Connected to database");

    // Check if users table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log("👥 Creating users table...");

      // Create ENUM types first
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('ADMIN', 'FARMER', 'CUSTOMER', 'DRIVER');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await client.query(`
        DO $$ BEGIN
          CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role user_role NOT NULL DEFAULT 'CUSTOMER',
          status user_status NOT NULL DEFAULT 'ACTIVE',
          county VARCHAR(100),
          sub_county VARCHAR(100),
          ward VARCHAR(100),
          verified BOOLEAN DEFAULT false,
          registration_fee_paid BOOLEAN DEFAULT false,
          total_earnings DECIMAL(15,2) DEFAULT 0.00,
          profile_image TEXT,
          last_login_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Users table created");
    } else {
      console.log("✅ Users table already exists");
    }

    // Check if we have any users
    const userCount = await client.query("SELECT COUNT(*) FROM users");
    console.log(`👥 Current users in database: ${userCount.rows[0].count}`);

    // Always insert/update test users
    console.log("👥 Setting up test users...");

    const testUsers = [
      {
        first_name: "Admin",
        last_name: "User",
        email: "admin@zuasoko.com",
        phone: "+254712345678",
        password: "password123",
        role: "ADMIN",
        county: "Nairobi",
        verified: true,
        registration_fee_paid: true,
      },
      {
        first_name: "John",
        last_name: "Farmer",
        email: "farmer@zuasoko.com",
        phone: "+254723456789",
        password: "farmer123",
        role: "FARMER",
        county: "Nakuru",
        verified: true,
        registration_fee_paid: true,
      },
      {
        first_name: "Jane",
        last_name: "Customer",
        email: "customer@zuasoko.com",
        phone: "+254734567890",
        password: "customer123",
        role: "CUSTOMER",
        county: "Nairobi",
        verified: true,
        registration_fee_paid: false,
      },
    ];

    for (const user of testUsers) {
      const hashedPassword = hashPassword(user.password);

      // Use UPSERT to insert or update user
      await client.query(
        `
        INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          verified = EXCLUDED.verified,
          registration_fee_paid = EXCLUDED.registration_fee_paid,
          updated_at = CURRENT_TIMESTAMP
      `,
        [
          user.first_name,
          user.last_name,
          user.email,
          user.phone,
          hashedPassword,
          user.role,
          user.county,
          user.verified,
          user.registration_fee_paid,
        ],
      );

      console.log(`✅ User created/updated: ${user.email} (${user.role})`);
    }

    // Verify the data
    const allUsers = await client.query(
      "SELECT email, role, phone, verified FROM users ORDER BY role",
    );
    console.log("👥 Final users in database:");
    allUsers.rows.forEach((user) => {
      console.log(
        `  - ${user.email} (${user.role}) - Phone: ${user.phone} - Verified: ${user.verified}`,
      );
    });

    console.log("🎉 Users setup complete!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

setupUsers();
