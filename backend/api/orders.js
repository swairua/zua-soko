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

async function transaction(callback) {
  const db = await initializeDatabase();
  const client = await db.connect();

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

// Create order
app.post("/", async (req, res) => {
  try {
    const {
      items,
      customerInfo,
      paymentMethod,
      mpesaPhone,
      deliveryFee,
      totalAmount,
    } = req.body;
    const customerId = req.user?.userId || null;

    await transaction(async (client) => {
      const orderResult = await client.query(
        `
        INSERT INTO orders (customer_id, customer_info, total_amount, delivery_fee, payment_method, delivery_address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
        [
          customerId,
          JSON.stringify(customerInfo),
          totalAmount,
          deliveryFee,
          paymentMethod,
          customerInfo.address,
          "PENDING",
        ],
      );

      const orderId = orderResult.rows[0].id;

      for (const item of items) {
        const totalPrice = item.price * item.quantity;
        await client.query(
          `
          INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [orderId, item.productId, item.quantity, item.price, totalPrice],
        );

        await client.query(
          `
          UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND stock_quantity >= $1
        `,
          [item.quantity, item.productId],
        );
      }

      if (paymentMethod === "MPESA") {
        await client.query(
          `
          INSERT INTO payments (user_id, order_id, amount, payment_method, mpesa_phone, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            customerId,
            orderId,
            totalAmount,
            paymentMethod,
            mpesaPhone,
            "PENDING",
          ],
        );
      }
    });

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
