const express = require("express");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Database connection
let pool;
async function initializeDatabase() {
  if (pool) return pool;

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

  return pool;
}

async function query(text, params = []) {
  const db = await initializeDatabase();
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

// Get wallet
app.get("/", authenticateToken, requireRole(["FARMER"]), async (req, res) => {
  try {
    let result = await query("SELECT * FROM wallets WHERE user_id = $1", [
      req.user.userId,
    ]);
    let wallet = result.rows[0];

    if (!wallet) {
      await query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2)", [
        req.user.userId,
        0.0,
      ]);
      result = await query("SELECT * FROM wallets WHERE user_id = $1", [
        req.user.userId,
      ]);
      wallet = result.rows[0];
    }

    res.json({ wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Withdraw from wallet
app.post(
  "/withdraw",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const { amount, phoneNumber } = req.body;

      const walletResult = await query(
        "SELECT * FROM wallets WHERE user_id = $1",
        [req.user.userId],
      );
      const wallet = walletResult.rows[0];

      if (!wallet || parseFloat(wallet.balance) < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // For now, just update the balance (M-Pesa integration would go here)
      const newBalance = parseFloat(wallet.balance) - amount;

      await query(
        "UPDATE wallets SET balance = $1, total_withdrawn = total_withdrawn + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [newBalance, amount, wallet.id],
      );

      res.json({
        message: "Withdrawal initiated successfully",
        newBalance: newBalance,
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = app;
