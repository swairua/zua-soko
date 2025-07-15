"use strict";
const { Pool } = require("pg");
require("dotenv").config();
// PostgreSQL connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/zuasoko",
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});
// Test database connection
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log("✅ PostgreSQL connected successfully");
        client.release();
        return true;
    }
    catch (err) {
        console.error("❌ PostgreSQL connection error:", err.message);
        console.log("💡 Make sure PostgreSQL is running and DATABASE_URL is correct");
        return false;
    }
}
// Database helper functions
const db = {
    // Generic query function
    async query(text, params) {
        const start = Date.now();
        try {
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log("🔍 Query executed", {
                text: text.substring(0, 50) + "...",
                duration,
                rows: res.rowCount,
            });
            return res;
        }
        catch (err) {
            console.error("💥 Database query error:", err.message);
            throw err;
        }
    },
    // User operations
    async findUserByPhone(phone) {
        const result = await this.query("SELECT * FROM users WHERE phone = $1", [
            phone,
        ]);
        return result.rows[0];
    },
    async createUser(userData) {
        const { firstName, lastName, email, phone, passwordHash, role, county } = userData;
        const result = await this.query("INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *", [firstName, lastName, email, phone, passwordHash, role, county]);
        return result.rows[0];
    },
    async getAllUsers() {
        const result = await this.query("SELECT id, first_name, last_name, email, phone, role, county, verified, created_at FROM users ORDER BY created_at DESC");
        return result.rows;
    },
    // Consignment operations
    async createConsignment(consignmentData) {
        const { farmerId, title, description, category, quantity, unit, bidPricePerUnit, images, location, harvestDate, expiryDate, } = consignmentData;
        const result = await this.query("INSERT INTO consignments (farmer_id, title, description, category, quantity, unit, bid_price_per_unit, images, location, harvest_date, expiry_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *", [
            farmerId,
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
        ]);
        return result.rows[0];
    },
    async getConsignmentsByFarmer(farmerId) {
        const result = await this.query("SELECT * FROM consignments WHERE farmer_id = $1 ORDER BY created_at DESC", [farmerId]);
        return result.rows;
    },
    async getAllConsignments() {
        const result = await this.query(`
      SELECT c.*, u.first_name, u.last_name, u.county, u.phone 
      FROM consignments c 
      JOIN users u ON c.farmer_id = u.id 
      ORDER BY c.created_at DESC
    `);
        return result.rows;
    },
    async updateConsignment(id, updates) {
        const fields = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = [id, ...Object.values(updates)];
        const result = await this.query(`UPDATE consignments SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, values);
        return result.rows[0];
    },
    // Product operations
    async getAllProducts() {
        const result = await this.query("SELECT * FROM products WHERE is_available = true ORDER BY created_at DESC");
        return result.rows;
    },
    async createProduct(productData) {
        const { consignmentId, warehouseId, name, category, quantity, unit, pricePerUnit, description, images, stockQuantity, farmerCounty, farmerName, } = productData;
        const result = await this.query("INSERT INTO products (consignment_id, warehouse_id, name, category, quantity, unit, price_per_unit, description, images, stock_quantity, farmer_county, farmer_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *", [
            consignmentId,
            warehouseId,
            name,
            category,
            quantity,
            unit,
            pricePerUnit,
            description,
            images,
            stockQuantity,
            farmerCounty,
            farmerName,
        ]);
        return result.rows[0];
    },
    // Wallet operations
    async getWalletByUserId(userId) {
        const result = await this.query("SELECT * FROM wallets WHERE user_id = $1", [userId]);
        return result.rows[0];
    },
    async createWallet(userId) {
        const result = await this.query("INSERT INTO wallets (user_id) VALUES ($1) RETURNING *", [userId]);
        return result.rows[0];
    },
    async updateWalletBalance(walletId, amount) {
        const result = await this.query("UPDATE wallets SET balance = balance + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *", [walletId, amount]);
        return result.rows[0];
    },
    async createWalletTransaction(transactionData) {
        const { walletId, type, amount, description, reference } = transactionData;
        const result = await this.query("INSERT INTO wallet_transactions (wallet_id, type, amount, description, reference) VALUES ($1, $2, $3, $4, $5) RETURNING *", [walletId, type, amount, description, reference]);
        return result.rows[0];
    },
    // Warehouse operations
    async getAllWarehouses() {
        const result = await this.query("SELECT * FROM warehouses ORDER BY name");
        return result.rows;
    },
    // Notification operations
    async createNotification(notificationData) {
        const { userId, title, message, type, data } = notificationData;
        const result = await this.query("INSERT INTO notifications (user_id, title, message, type, data) VALUES ($1, $2, $3, $4, $5) RETURNING *", [userId, title, message, type, JSON.stringify(data)]);
        return result.rows[0];
    },
    async getNotificationsByUser(userId) {
        const result = await this.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        return result.rows;
    },
};
module.exports = { pool, db, testConnection };
