"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleRedirectPath = exports.validateEmail = exports.validatePhoneNumber = exports.formatPhoneNumber = exports.verifyToken = exports.generateToken = exports.verifyPassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.verifyPassword = verifyPassword;
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, "");
    // If it starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
        cleaned = "254" + cleaned.slice(1);
    }
    // If it doesn't start with 254, add it
    if (!cleaned.startsWith("254")) {
        cleaned = "254" + cleaned;
    }
    return "+" + cleaned;
};
exports.formatPhoneNumber = formatPhoneNumber;
const validatePhoneNumber = (phone) => {
    const formatted = (0, exports.formatPhoneNumber)(phone);
    // Kenyan phone numbers should be 13 characters starting with +254
    return /^\+254\d{9}$/.test(formatted);
};
exports.validatePhoneNumber = validatePhoneNumber;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const getRoleRedirectPath = (role) => {
    switch (role) {
        case "FARMER":
            return "/farmer/dashboard";
        case "CUSTOMER":
            return "/customer/marketplace";
        case "DRIVER":
            return "/driver/dashboard";
        case "FARMER_AGENT":
            return "/agent/dashboard";
        case "ADMIN":
            return "/admin/dashboard";
        default:
            return "/";
    }
};
exports.getRoleRedirectPath = getRoleRedirectPath;
