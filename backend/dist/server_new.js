"use strict";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const mpesaService = require("./mpesa");
const { query, transaction, initializeDatabase } = require("./database/db");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5001;
// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// Status constants
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
const ORDER_STATUS = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
};
const PAYMENT_STATUS = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    REFUNDED: "REFUNDED",
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
// Role-based access control
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
// ==================== AUTH ROUTES ====================
// Login endpoint
app.post("/api/auth/login", async (req, res) => {
    try {
        console.log("🔐 Backend login attempt:", {
            body: req.body,
            phone: req.body?.phone,
            password: req.body?.password
                ? req.body.password.substring(0, 3) + "***"
                : "missing",
        });
        const { phone, password } = req.body;
        if (!phone || !password) {
            console.log("❌ Missing phone or password");
            return res.status(400).json({ error: "Phone and password are required" });
        }
        // Trim whitespace from phone number
        const trimmedPhone = phone.trim();
        const result = await query("SELECT * FROM users WHERE phone = $1", [
            trimmedPhone,
        ]);
        const user = result.rows[0];
        if (!user) {
            console.log("❌ User not found for phone:", trimmedPhone);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log("🔒 Password check result:", validPassword);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Update last login
        await query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
        const token = jwt.sign({ userId: user.id, phone: user.phone, role: user.role }, process.env.JWT_SECRET || "demo-secret", { expiresIn: "7d" });
        const userResponse = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            county: user.county,
            verified: user.verified,
            registrationFeePaid: user.registration_fee_paid,
            totalEarnings: parseFloat(user.total_earnings) || 0,
        };
        console.log("✅ Login successful for user:", user.phone);
        res.json({
            message: "Login successful",
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Register endpoint
app.post("/api/auth/register", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, county, role = "CUSTOMER", } = req.body;
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        // Check if user already exists
        const existingUser = await query("SELECT id FROM users WHERE email = $1 OR phone = $2", [email, phone]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        // Insert new user
        await query(`
      INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
            userId,
            firstName,
            lastName,
            email,
            phone,
            hashedPassword,
            role,
            county,
            true,
            role !== "FARMER",
        ]);
        // Create wallet for farmers
        if (role === "FARMER") {
            await query("INSERT INTO wallets (user_id, balance) VALUES ($1, $2)", [
                userId,
                0.0,
            ]);
        }
        const token = jwt.sign({ userId, phone, role }, process.env.JWT_SECRET || "demo-secret", { expiresIn: "7d" });
        const userResponse = {
            id: userId,
            firstName,
            lastName,
            email,
            phone,
            role,
            county,
            verified: true,
            registrationFeePaid: role !== "FARMER",
        };
        res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// ==================== USER PROFILE ROUTES ====================
// Get user profile
app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
        const result = await query("SELECT * FROM users WHERE id = $1", [
            req.user.userId,
        ]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userProfile = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            county: user.county,
            subCounty: user.sub_county,
            ward: user.ward,
            verified: user.verified,
            registrationFeePaid: user.registration_fee_paid,
            totalEarnings: parseFloat(user.total_earnings) || 0,
            profileImage: user.profile_image,
        };
        res.json(userProfile);
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update user profile
app.put("/api/profile", authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, email, county, subCounty, ward } = req.body;
        await query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, county = $4, sub_county = $5, ward = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [firstName, lastName, email, county, subCounty, ward, req.user.userId]);
        res.json({ message: "Profile updated successfully" });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// ==================== CONSIGNMENT ROUTES ====================
// Get consignments (with filters)
app.get("/api/consignments", authenticateToken, async (req, res) => {
    try {
        const { status, farmer_id } = req.query;
        let queryText = `
      SELECT c.*, 
             u.first_name || ' ' || u.last_name as farmer_name,
             u.county as farmer_county,
             u.phone as farmer_phone
      FROM consignments c
      JOIN users u ON c.farmer_id = u.id
      WHERE 1=1
    `;
        const queryParams = [];
        if (status) {
            queryParams.push(status);
            queryText += ` AND c.status = $${queryParams.length}`;
        }
        if (farmer_id) {
            queryParams.push(farmer_id);
            queryText += ` AND c.farmer_id = $${queryParams.length}`;
        }
        queryText += " ORDER BY c.created_at DESC";
        const result = await query(queryText, queryParams);
        const consignments = result.rows.map((row) => ({
            id: row.id,
            farmerId: row.farmer_id,
            title: row.title,
            description: row.description,
            category: row.category,
            quantity: row.quantity,
            unit: row.unit,
            bidPricePerUnit: parseFloat(row.bid_price_per_unit),
            finalPricePerUnit: row.final_price_per_unit
                ? parseFloat(row.final_price_per_unit)
                : null,
            images: row.images || [],
            location: row.location,
            harvestDate: row.harvest_date,
            expiryDate: row.expiry_date,
            status: row.status,
            adminNotes: row.admin_notes,
            driverId: row.driver_id,
            warehouseId: row.warehouse_id,
            createdAt: row.created_at,
            farmer: {
                name: row.farmer_name,
                county: row.farmer_county,
                phone: row.farmer_phone,
            },
        }));
        res.json(consignments);
    }
    catch (error) {
        console.error("Get consignments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Create new consignment
app.post("/api/consignments", authenticateToken, requireRole(["FARMER"]), async (req, res) => {
    try {
        const { title, description, category, quantity, unit, bidPricePerUnit, images, location, harvestDate, expiryDate, } = req.body;
        const consignmentId = uuidv4();
        await query(`
      INSERT INTO consignments (
        id, farmer_id, title, description, category, quantity, unit,
        bid_price_per_unit, images, location, harvest_date, expiry_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
            consignmentId,
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
        ]);
        res.status(201).json({
            message: "Consignment created successfully",
            id: consignmentId,
        });
    }
    catch (error) {
        console.error("Create consignment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update consignment (admin only)
app.patch("/api/consignments/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, finalPricePerUnit, adminNotes, driverId } = req.body;
        let updateFields = [];
        let queryParams = [];
        let paramCount = 0;
        if (status) {
            paramCount++;
            updateFields.push(`status = $${paramCount}`);
            queryParams.push(status);
        }
        if (finalPricePerUnit) {
            paramCount++;
            updateFields.push(`final_price_per_unit = $${paramCount}`);
            queryParams.push(finalPricePerUnit);
        }
        if (adminNotes) {
            paramCount++;
            updateFields.push(`admin_notes = $${paramCount}`);
            queryParams.push(adminNotes);
        }
        if (driverId) {
            paramCount++;
            updateFields.push(`driver_id = $${paramCount}`);
            queryParams.push(driverId);
        }
        paramCount++;
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        queryParams.push(id);
        const updateQuery = `
      UPDATE consignments 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
    `;
        await query(updateQuery, queryParams);
        // Create notification for farmer
        if (status) {
            const consignmentResult = await query("SELECT farmer_id, title FROM consignments WHERE id = $1", [id]);
            const consignment = consignmentResult.rows[0];
            if (consignment) {
                await query(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES ($1, $2, $3, $4)
        `, [
                    consignment.farmer_id,
                    "Consignment Update",
                    `Your consignment "${consignment.title}" status has been updated to ${status}`,
                    "CONSIGNMENT_UPDATE",
                ]);
            }
        }
        res.json({ message: "Consignment updated successfully" });
    }
    catch (error) {
        console.error("Update consignment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// ==================== MARKETPLACE/PRODUCTS ROUTES ====================
// Get marketplace products
app.get("/api/products", async (req, res) => {
    try {
        const { category, search } = req.query;
        let queryText = `
      SELECT p.*, c.location, c.farmer_id,
             u.first_name || ' ' || u.last_name as farmer_name
      FROM products p
      JOIN consignments c ON p.consignment_id = c.id
      JOIN users u ON c.farmer_id = u.id
      WHERE p.is_active = true AND p.stock_quantity > 0
    `;
        const queryParams = [];
        if (category) {
            queryParams.push(category);
            queryText += ` AND p.category = $${queryParams.length}`;
        }
        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`;
        }
        queryText += " ORDER BY p.created_at DESC";
        const result = await query(queryText, queryParams);
        const products = result.rows.map((row) => ({
            id: row.id,
            consignmentId: row.consignment_id,
            name: row.name,
            description: row.description,
            category: row.category,
            quantity: row.quantity,
            unit: row.unit,
            pricePerUnit: parseFloat(row.price_per_unit),
            images: row.images || [],
            stockQuantity: row.stock_quantity,
            location: row.location,
            farmer: {
                id: row.farmer_id,
                name: row.farmer_name,
            },
        }));
        res.json(products);
    }
    catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get single product
app.get("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`
      SELECT p.*, c.location, c.farmer_id, c.harvest_date, c.expiry_date,
             u.first_name || ' ' || u.last_name as farmer_name,
             u.county as farmer_county
      FROM products p
      JOIN consignments c ON p.consignment_id = c.id
      JOIN users u ON c.farmer_id = u.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        const row = result.rows[0];
        const product = {
            id: row.id,
            consignmentId: row.consignment_id,
            name: row.name,
            description: row.description,
            category: row.category,
            quantity: row.quantity,
            unit: row.unit,
            pricePerUnit: parseFloat(row.price_per_unit),
            images: row.images || [],
            stockQuantity: row.stock_quantity,
            location: row.location,
            harvestDate: row.harvest_date,
            expiryDate: row.expiry_date,
            farmer: {
                id: row.farmer_id,
                name: row.farmer_name,
                county: row.farmer_county,
            },
        };
        res.json(product);
    }
    catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Continue with more routes...
// This is a partial implementation. The full file would be quite long.
// Let me create the remaining critical routes in a separate section.
module.exports = app;
// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
        console.log(`🗄️  Database: PostgreSQL`);
        console.log(`💳 M-Pesa: ${process.env.MPESA_BASE_URL ? "Production" : "Sandbox"} mode`);
    });
}
