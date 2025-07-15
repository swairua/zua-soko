import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";

export type UserRole =
  | "FARMER"
  | "CUSTOMER"
  | "DRIVER"
  | "FARMER_AGENT"
  | "ADMIN";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email?: string;
    phone: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);

      // In a real implementation, you'd fetch user from database here
      // For now, we'll use the token data directly
      req.user = {
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        phone: decoded.phone,
      };

      next();
    } catch (tokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Convenience middleware for specific roles
export const requireAdmin = authorize(["ADMIN"]);
export const requireFarmer = authorize(["FARMER"]);
export const requireCustomer = authorize(["CUSTOMER"]);
export const requireDriver = authorize(["DRIVER"]);
export const requireFarmerOrAdmin = authorize(["FARMER", "ADMIN"]);
export const requireCustomerOrAdmin = authorize(["CUSTOMER", "ADMIN"]);
