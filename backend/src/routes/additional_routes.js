// Additional routes for Orders, Payments, Wallet, and Driver functionality
// This file contains the remaining routes that need to be added to server_new.js

// ==================== ORDER ROUTES ====================

// Create new order
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

    const orderId = uuidv4();
    const customerId = req.user?.userId || null;

    // Start transaction
    await transaction(async (client) => {
      // Create order
      await client.query(
        `
        INSERT INTO orders (
          id, customer_id, customer_info, total_amount, delivery_fee, 
          payment_method, delivery_address, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          orderId,
          customerId,
          JSON.stringify(customerInfo),
          totalAmount,
          deliveryFee,
          paymentMethod,
          customerInfo.address,
          "PENDING",
        ],
      );

      // Create order items and update stock
      for (const item of items) {
        const orderItemId = uuidv4();
        const totalPrice = item.price * item.quantity;

        await client.query(
          `
          INSERT INTO order_items (id, order_id, product_id, quantity, price_per_unit, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            orderItemId,
            orderId,
            item.productId,
            item.quantity,
            item.price,
            totalPrice,
          ],
        );

        // Update product stock
        await client.query(
          `
          UPDATE products 
          SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND stock_quantity >= $1
        `,
          [item.quantity, item.productId],
        );
      }

      // Create payment record
      if (paymentMethod === "MPESA") {
        const paymentId = uuidv4();
        await client.query(
          `
          INSERT INTO payments (
            id, user_id, order_id, amount, payment_method, mpesa_phone, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            paymentId,
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

// Get user orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT o.*, 
             array_agg(
               json_build_object(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'quantity', oi.quantity,
                 'pricePerUnit', oi.price_per_unit,
                 'totalPrice', oi.total_price,
                 'productName', p.name
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
      [req.user.userId],
    );

    const orders = result.rows.map((row) => ({
      id: row.id,
      totalAmount: parseFloat(row.total_amount),
      deliveryFee: parseFloat(row.delivery_fee),
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      deliveryAddress: row.delivery_address,
      items: row.items.filter((item) => item.id), // Filter out null items
      createdAt: row.created_at,
    }));

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== PAYMENT ROUTES ====================

// Registration fee payment
app.post(
  "/api/payments/registration-fee",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      // Check if already paid
      const userResult = await query(
        "SELECT registration_fee_paid FROM users WHERE id = $1",
        [req.user.userId],
      );
      const user = userResult.rows[0];

      if (user.registration_fee_paid) {
        return res.status(400).json({ error: "Registration fee already paid" });
      }

      // Initiate M-Pesa STK push
      const stkResponse = await mpesaService.stkPush({
        phoneNumber: phoneNumber,
        amount: 300,
        accountReference: `REG-${req.user.userId}`,
        transactionDesc: "Farmer Registration Fee",
      });

      if (stkResponse.ResponseCode === "0") {
        // Create payment record
        const paymentId = uuidv4();
        await query(
          `
        INSERT INTO payments (
          id, user_id, amount, payment_method, mpesa_phone, mpesa_checkout_request_id,
          reference_code, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
          [
            paymentId,
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
        res.status(400).json({ error: "Failed to initiate payment" });
      }
    } catch (error) {
      console.error("Registration fee payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// M-Pesa callback handler
app.post("/api/payments/callback", async (req, res) => {
  try {
    console.log(
      "📞 M-Pesa callback received:",
      JSON.stringify(req.body, null, 2),
    );

    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ error: "Invalid callback format" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find payment record
    const paymentResult = await query(
      "SELECT * FROM payments WHERE mpesa_checkout_request_id = $1",
      [CheckoutRequestID],
    );

    if (paymentResult.rows.length === 0) {
      console.log(
        "⚠️ Payment record not found for CheckoutRequestID:",
        CheckoutRequestID,
      );
      return res.status(404).json({ error: "Payment record not found" });
    }

    const payment = paymentResult.rows[0];
    const success = ResultCode === 0;

    // Update payment status
    await query(
      `
      UPDATE payments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
      [success ? "COMPLETED" : "FAILED", payment.id],
    );

    if (success) {
      // Handle successful payment based on type
      if (payment.description === "Farmer Registration Fee") {
        // Update user registration status
        await query(
          `
          UPDATE users 
          SET registration_fee_paid = true, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
          [payment.user_id],
        );

        // Create notification
        await query(
          `
          INSERT INTO notifications (user_id, title, message, type)
          VALUES ($1, $2, $3, $4)
        `,
          [
            payment.user_id,
            "Registration Fee Paid",
            "Your registration fee has been paid successfully. Your account is now active.",
            "PAYMENT_SUCCESS",
          ],
        );
      }

      // Update order status if it's an order payment
      if (payment.order_id) {
        await query(
          `
          UPDATE orders 
          SET payment_status = 'COMPLETED', status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
          [payment.order_id],
        );
      }

      console.log("✅ Payment processed successfully:", payment.id);
    } else {
      console.log("❌ Payment failed:", ResultDesc);
    }

    res.json({ message: "Callback processed successfully" });
  } catch (error) {
    console.error("Callback processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== WALLET ROUTES ====================

// Get wallet information
app.get(
  "/api/wallet",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const result = await query(
        `
      SELECT w.*, 
             array_agg(
               json_build_object(
                 'id', wt.id,
                 'type', wt.type,
                 'amount', wt.amount,
                 'description', wt.description,
                 'createdAt', wt.created_at
               ) ORDER BY wt.created_at DESC
             ) FILTER (WHERE wt.id IS NOT NULL) as transactions
      FROM wallets w
      LEFT JOIN wallet_transactions wt ON w.id = wt.wallet_id
      WHERE w.user_id = $1
      GROUP BY w.id
    `,
        [req.user.userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const row = result.rows[0];
      const wallet = {
        id: row.id,
        balance: parseFloat(row.balance),
        pendingBalance: parseFloat(row.pending_balance),
        totalEarned: parseFloat(row.total_earned),
        totalWithdrawn: parseFloat(row.total_withdrawn),
        transactions: row.transactions || [],
      };

      res.json(wallet);
    } catch (error) {
      console.error("Get wallet error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Wallet withdrawal
app.post(
  "/api/wallet/withdraw",
  authenticateToken,
  requireRole(["FARMER"]),
  async (req, res) => {
    try {
      const { amount, phoneNumber } = req.body;

      if (amount < 10) {
        return res
          .status(400)
          .json({ error: "Minimum withdrawal amount is KES 10" });
      }

      // Get wallet
      const walletResult = await query(
        "SELECT * FROM wallets WHERE user_id = $1",
        [req.user.userId],
      );
      const wallet = walletResult.rows[0];

      if (!wallet || parseFloat(wallet.balance) < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Initiate M-Pesa withdrawal
      const stkResponse = await mpesaService.stkPush({
        phoneNumber: phoneNumber,
        amount: amount,
        accountReference: `WTH-${req.user.userId}`,
        transactionDesc: "Wallet Withdrawal",
      });

      if (stkResponse.ResponseCode === "0") {
        const transactionId = uuidv4();
        const newBalance = parseFloat(wallet.balance) - amount;

        await transaction(async (client) => {
          // Update wallet balance
          await client.query(
            `
          UPDATE wallets 
          SET balance = $1, total_withdrawn = total_withdrawn + $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `,
            [newBalance, amount, wallet.id],
          );

          // Create transaction record
          await client.query(
            `
          INSERT INTO wallet_transactions (
            id, wallet_id, user_id, type, amount, balance_before, balance_after, 
            description, reference
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
            [
              transactionId,
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

          // Create payment record
          await client.query(
            `
          INSERT INTO payments (
            id, user_id, amount, payment_method, mpesa_phone, mpesa_checkout_request_id,
            reference_code, description, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
            [
              uuidv4(),
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
          transactionId: transactionId,
          checkoutRequestID: stkResponse.CheckoutRequestID,
          customerMessage: stkResponse.CustomerMessage,
          newBalance: newBalance,
        });
      } else {
        res.status(400).json({ error: "Failed to initiate withdrawal" });
      }
    } catch (error) {
      console.error("Wallet withdrawal error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==================== DRIVER ROUTES ====================

// Get driver assignments
app.get(
  "/api/driver/assignments",
  authenticateToken,
  requireRole(["DRIVER"]),
  async (req, res) => {
    try {
      const result = await query(
        `
      SELECT c.*, 
             u.first_name || ' ' || u.last_name as farmer_name,
             u.phone as farmer_phone,
             u.county as farmer_county
      FROM consignments c
      JOIN users u ON c.farmer_id = u.id
      WHERE c.driver_id = $1 AND c.status IN ('DRIVER_ASSIGNED', 'IN_TRANSIT')
      ORDER BY c.created_at DESC
    `,
        [req.user.userId],
      );

      const assignments = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        quantity: row.quantity,
        unit: row.unit,
        location: row.location,
        status: row.status,
        farmer: {
          user: {
            firstName: row.farmer_name.split(" ")[0],
            lastName: row.farmer_name.split(" ")[1] || "",
          },
          phone: row.farmer_phone,
          county: row.farmer_county,
        },
        createdAt: row.created_at,
      }));

      res.json(assignments);
    } catch (error) {
      console.error("Get driver assignments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Update assignment status
app.put(
  "/api/driver/assignments/:id/status",
  authenticateToken,
  requireRole(["DRIVER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      // Verify assignment belongs to driver
      const assignmentResult = await query(
        "SELECT * FROM consignments WHERE id = $1 AND driver_id = $2",
        [id, req.user.userId],
      );

      if (assignmentResult.rows.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Update consignment status
      await query(
        `
      UPDATE consignments 
      SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `,
        [status, notes || "", id],
      );

      // Create notification for farmer
      const consignment = assignmentResult.rows[0];
      await query(
        `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
    `,
        [
          consignment.farmer_id,
          "Delivery Update",
          `Your consignment "${consignment.title}" status has been updated to ${status}`,
          "DELIVERY_UPDATE",
        ],
      );

      res.json({ message: "Assignment status updated successfully" });
    } catch (error) {
      console.error("Update assignment status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Update driver location
app.put(
  "/api/driver/location",
  authenticateToken,
  requireRole(["DRIVER"]),
  async (req, res) => {
    try {
      const { latitude, longitude, timestamp } = req.body;

      // For now, we'll just log the location
      // In a full implementation, you might store this in a driver_locations table
      console.log(`📍 Driver ${req.user.userId} location updated:`, {
        latitude,
        longitude,
        timestamp,
      });

      res.json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Update driver location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==================== ADMIN ROUTES ====================

// Get all users (admin only)
app.get(
  "/api/admin/users",
  authenticateToken,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT id, first_name, last_name, email, phone, role, county, 
             verified, registration_fee_paid, created_at
      FROM users
      ORDER BY created_at DESC
    `);

      const users = result.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        county: row.county,
        verified: row.verified,
        registrationFeePaid: row.registration_fee_paid,
        createdAt: row.created_at,
      }));

      res.json(users);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get analytics data (admin only)
app.get(
  "/api/admin/analytics",
  authenticateToken,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const [userStats, orderStats, paymentStats] = await Promise.all([
        query("SELECT role, COUNT(*) as count FROM users GROUP BY role"),
        query("SELECT status, COUNT(*) as count FROM orders GROUP BY status"),
        query(
          "SELECT SUM(amount) as total FROM payments WHERE status = 'COMPLETED'",
        ),
      ]);

      const analytics = {
        usersByRole: userStats.rows.reduce((acc, row) => {
          acc[row.role] = parseInt(row.count);
          return acc;
        }, {}),
        ordersByStatus: orderStats.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {}),
        totalRevenue: parseFloat(paymentStats.rows[0]?.total || 0),
      };

      res.json(analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// These routes should be added to the main server_new.js file
module.exports = {
  // Export individual route handlers if needed
};
