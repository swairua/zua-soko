const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// Simple hash function using built-in crypto
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Database connection
let pool;
async function getDB() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function query(text, params = []) {
  const db = await getDB();
  return await db.query(text, params);
}

// Auth middleware helper functions
const authenticateToken = async (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "demo-secret");
    return user;
  } catch (err) {
    throw new Error("Invalid token");
  }
};

// Main handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = req.url || "";
  const { method } = req;

  try {
    // Health check
    if (url === "/api/health" && method === "GET") {
      return res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    }

    // Auth endpoints
    if (url === "/api/auth/login" && method === "POST") {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res
          .status(400)
          .json({ error: "Phone and password are required" });
      }

      const result = await query("SELECT * FROM users WHERE phone = $1", [
        phone.trim(),
      ]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = verifyPassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET || "demo-secret",
        { expiresIn: "7d" },
      );

      return res.json({
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
    }

    if (url === "/api/auth/register" && method === "POST") {
      const { firstName, lastName, email, phone, password, role, county } =
        req.body;

      if (!firstName || !lastName || !phone || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUser = await query(
        "SELECT id FROM users WHERE phone = $1 OR email = $2",
        [phone, email],
      );
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = hashPassword(password);

      const result = await query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          firstName,
          lastName,
          email,
          phone,
          hashedPassword,
          role,
          county,
          true,
          role !== "FARMER",
        ],
      );

      const userId = result.rows[0].id;

      if (role === "FARMER") {
        await query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2)", [
          userId,
          0.0,
        ]);
      }

      const token = jwt.sign(
        { userId, phone, role },
        process.env.JWT_SECRET || "demo-secret",
        { expiresIn: "7d" },
      );

      return res.status(201).json({
        message: "User registered successfully",
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
        token,
      });
    }

    // Products endpoint
    if (url === "/api/products" && method === "GET") {
      const result = await query(`
        SELECT p.*, c.title as consignment_title, u.first_name, u.last_name
        FROM products p
        JOIN consignments c ON p.consignment_id = c.id
        JOIN users u ON c.farmer_id = u.id
        WHERE p.is_active = true AND p.stock_quantity > 0
        ORDER BY p.created_at DESC
      `);

      return res.json({ products: result.rows });
    }

    // Demo endpoints for testing without database
    if (url === "/api/demo/products" && method === "GET") {
      const demoProducts = [
        {
          id: 1,
          name: "Fresh Tomatoes",
          description: "Organic red tomatoes",
          price: 150,
          unit: "kg",
          stock_quantity: 50,
          first_name: "John",
          last_name: "Doe",
        },
        {
          id: 2,
          name: "Green Beans",
          description: "Fresh green beans",
          price: 200,
          unit: "kg",
          stock_quantity: 30,
          first_name: "Jane",
          last_name: "Smith",
        },
      ];
      return res.json({ products: demoProducts });
    }

    if (url === "/api/demo/login" && method === "POST") {
      const { phone, password } = req.body;

      // Demo login - accepts any phone/password
      if (phone && password) {
        const token = jwt.sign(
          { userId: 1, phone, role: "FARMER" },
          process.env.JWT_SECRET || "demo-secret",
          { expiresIn: "7d" },
        );

        return res.json({
          message: "Demo login successful",
          token,
          user: {
            id: 1,
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com",
            phone,
            role: "FARMER",
            county: "Nairobi",
            verified: true,
            registrationFeePaid: true,
          },
        });
      }

      return res.status(400).json({ error: "Phone and password required" });
    }

    // Protected endpoints (require authentication)
    if (url.startsWith("/api/wallet") || url.startsWith("/api/orders")) {
      try {
        const user = await authenticateToken(req);
        req.user = user;
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    }

    // Wallet endpoints
    if (url === "/api/wallet/balance" && method === "GET") {
      const result = await query(
        "SELECT balance FROM wallets WHERE user_id = $1",
        [req.user.userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      return res.json({ balance: parseFloat(result.rows[0].balance) });
    }

    // Default fallback
    return res.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
