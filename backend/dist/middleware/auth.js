"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCustomerOrAdmin = exports.requireFarmerOrAdmin = exports.requireDriver = exports.requireCustomer = exports.requireFarmer = exports.requireAdmin = exports.authorize = exports.authenticate = void 0;
const auth_1 = require("../lib/auth");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            const decoded = (0, auth_1.verifyToken)(token);
            // In a real implementation, you'd fetch user from database here
            // For now, we'll use the token data directly
            req.user = {
                id: decoded.userId,
                role: decoded.role,
                email: decoded.email,
                phone: decoded.phone,
            };
            next();
        }
        catch (tokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
};
exports.authorize = authorize;
// Convenience middleware for specific roles
exports.requireAdmin = (0, exports.authorize)(["ADMIN"]);
exports.requireFarmer = (0, exports.authorize)(["FARMER"]);
exports.requireCustomer = (0, exports.authorize)(["CUSTOMER"]);
exports.requireDriver = (0, exports.authorize)(["DRIVER"]);
exports.requireFarmerOrAdmin = (0, exports.authorize)(["FARMER", "ADMIN"]);
exports.requireCustomerOrAdmin = (0, exports.authorize)(["CUSTOMER", "ADMIN"]);
