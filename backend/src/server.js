const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mpesaService = require("./mpesa");
const { query, transaction, initializeDatabase } = require("./database/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Constants
const CONSIGNMENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PRICE_SUGGESTED: "PRICE_SUGGESTED",
  DRIVER_ASSIGNED: "DRIVER_ASSIGNED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
};

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

// Initialize database
initializeDatabase().catch(console.error);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    const trimmedPhone = phone.trim();
    const result = await query("SELECT * FROM users WHERE phone = $1", [
      trimmedPhone,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || "demo-secret",
      { expiresIn: "7d" },
    );

    res.json({
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
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

    const hashedPassword = await argon2.hash(password);

    const result = await query(
      `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `,
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

    res.status(201).json({
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
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== CONSIGNMENTS ROUTES ====================

app.post(
  "/api/consignments",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        quantity,
        unit,
        bidPricePerUnit,
        images,
        location,
        harvestDate,
        expiryDate,
      } = req.body;

      const result = await query(
        `
      INSERT INTO consignments (farmer_id, title, description, category, quantity, unit, bid_price_per_unit, images, location, harvest_date, expiry_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `,
        [
          req.user.userId,
          title,
          description,
          category,
          quantity,
          unit,
          bidPricePerUnit,
          images,
          location,
          harvestDate,
          expiryDate,
          "PENDING",
        ],
      );

      const consignmentId = result.rows[0].id;
      res.status(201).json({
        message: "Consignment created successfully",
        id: consignmentId,
      });
    } catch (error) {
      console.error("Create consignment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.get(
  "/api/consignments",
  authenticateToken,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT c.*, u.first_name, u.last_name, u.phone
      FROM consignments c
      JOIN users u ON c.farmer_id = u.id
      ORDER BY c.created_at DESC
    `);

      res.json({ consignments: result.rows });
    } catch (error) {
      console.error("Fetch consignments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==================== PRODUCTS ROUTES ====================

app.get("/api/products", async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, c.title as consignment_title, u.first_name, u.last_name
      FROM products p
      JOIN consignments c ON p.consignment_id = c.id
      JOIN users u ON c.farmer_id = u.id
      WHERE p.is_active = true AND p.stock_quantity > 0
      ORDER BY p.created_at DESC
    `);

    res.json({ products: result.rows });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== ORDERS ROUTES ====================

app.post("/api/orders", async (req, res) => {
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

    res
      .status(201)
      .json({ message: "Order created successfully", orderId: orderId });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== PAYMENT ROUTES ====================

app.post(
  "/api/payments/registration-fee",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      const stkResponse = await mpesaService.initiateSTKPush({
        phoneNumber,
        amount: 300,
        accountReference: `REG-${req.user.userId}`,
        transactionDesc: "Farmer Registration Fee",
      });

      if (stkResponse.ResponseCode === "0") {
        await query(
          `
        INSERT INTO payments (user_id, amount, payment_method, mpesa_phone, mpesa_checkout_request_id, reference_code, description, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
          [
            req.user.userId,
            300,
            "MPESA",
            phoneNumber,
            stkResponse.CheckoutRequestID,
            `REG-${req.user.userId}`,
            "Farmer Registration Fee",
            "PENDING",
          ],
        );

        res.json({
          message: "Registration fee payment initiated successfully",
          checkoutRequestID: stkResponse.CheckoutRequestID,
          customerMessage: stkResponse.CustomerMessage,
        });
      } else {
        res
          .status(400)
          .json({ error: "Failed to initiate payment", details: stkResponse });
      }
    } catch (error) {
      console.error("Registration fee payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==================== WALLET ROUTES ====================

app.get(
  "/api/wallet",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
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
  },
);

app.post(
  "/api/wallet/withdraw",
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

      const stkResponse = await mpesaService.initiateSTKPush({
        phoneNumber,
        amount,
        accountReference: `WTH-${req.user.userId}`,
        transactionDesc: "Wallet Withdrawal",
      });

      if (stkResponse.ResponseCode === "0") {
        const newBalance = parseFloat(wallet.balance) - amount;

        await transaction(async (client) => {
          await client.query(
            "UPDATE wallets SET balance = $1, total_withdrawn = total_withdrawn + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
            [newBalance, amount, wallet.id],
          );
          await client.query(
            `
          INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_before, balance_after, description, reference)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
            [
              wallet.id,
              req.user.userId,
              "WITHDRAWAL",
              amount,
              parseFloat(wallet.balance),
              newBalance,
              "Wallet Withdrawal",
              `WTH-${req.user.userId}`,
            ],
          );
          await client.query(
            `
          INSERT INTO payments (user_id, amount, payment_method, mpesa_phone, mpesa_checkout_request_id, reference_code, description, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
            [
              req.user.userId,
              amount,
              "MPESA",
              phoneNumber,
              stkResponse.CheckoutRequestID,
              `WTH-${req.user.userId}`,
              "Wallet Withdrawal",
              "PENDING",
            ],
          );
        });

        res.json({
          message: "Withdrawal initiated successfully",
          checkoutRequestID: stkResponse.CheckoutRequestID,
          customerMessage: stkResponse.CustomerMessage,
        });
      } else {
        res.status(400).json({
          error: "Failed to initiate withdrawal",
          details: stkResponse,
        });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==================== ADMIN ROUTES ====================

app.get(
  "/api/admin/users",
  authenticateToken,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT id, first_name, last_name, email, phone, role, status, county, verified, registration_fee_paid, created_at
      FROM users
      ORDER BY created_at DESC
    `);

      res.json({ users: result.rows });
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==================== DRIVER ROUTES ====================

app.get(
  "/api/driver/assignments",
  authenticateToken,
  requireRole(["DRIVER"]),
  async (req, res) => {
    try {
      const result = await query(
        `
      SELECT c.id, c.title, c.status, c.location, c.quantity, c.unit,
             u.first_name as farmer_name, u.phone as farmer_phone
      FROM consignments c
      JOIN users u ON c.farmer_id = u.id
      WHERE c.driver_id = $1 OR c.driver_id IS NULL
      ORDER BY c.created_at DESC
    `,
        [req.user.userId],
      );

      res.json({ assignments: result.rows });
    } catch (error) {
      console.error("Fetch assignments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

app.put(
  "/api/driver/assignments/:id/status",
  authenticateToken,
  requireRole(["DRIVER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await query(
        "UPDATE consignments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [status, id],
      );

      res.json({ message: "Assignment status updated successfully" });
    } catch (error) {
      console.error("Update assignment status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🎯 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  );
});

module.exports = app;
