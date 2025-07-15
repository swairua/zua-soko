const bcrypt = require("bcryptjs"); // Using bcryptjs for better serverless compatibility
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

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

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "demo-secret", (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
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

  const { url, method } = req;

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

      const validPassword = await bcrypt.compare(password, user.password_hash);
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

      const hashedPassword = await bcrypt.hash(password, 10);

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

    // Default fallback
    return res.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
