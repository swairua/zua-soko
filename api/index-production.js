const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Simple hash function
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Demo users that always work (no database needed)
const DEMO_USERS = {
  "+254712345678": {
    password: "password123",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
  },
  "admin@zuasoko.com": {
    password: "password123",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
  },
  "+254723456789": {
    password: "farmer123",
    role: "FARMER",
    firstName: "John",
    lastName: "Farmer",
    email: "farmer@zuasoko.com",
  },
  "+254734567890": {
    password: "customer123",
    role: "CUSTOMER",
    firstName: "Jane",
    lastName: "Customer",
    email: "customer@zuasoko.com",
  },
};

// Demo products (no database needed)
const DEMO_PRODUCTS = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price_per_unit: 130,
    unit: "kg",
    description: "Organic red tomatoes, Grade A quality",
    stock_quantity: 85,
    is_featured: true,
    farmer_name: "Demo Farmer",
    farmer_county: "Nakuru",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Sweet Potatoes",
    category: "Root Vegetables",
    price_per_unit: 80,
    unit: "kg",
    description: "Fresh sweet potatoes, rich in nutrients",
    stock_quantity: 45,
    is_featured: true,
    farmer_name: "Demo Farmer",
    farmer_county: "Meru",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Fresh Spinach",
    category: "Leafy Greens",
    price_per_unit: 120,
    unit: "kg",
    description: "Organic spinach leaves, freshly harvested",
    stock_quantity: 30,
    is_featured: false,
    farmer_name: "Demo Farmer",
    farmer_county: "Kiambu",
    created_at: new Date().toISOString(),
  },
];

// Super simple, bulletproof API handler
export default async function handler(req, res) {
  try {
    console.log(`🌐 API Request: ${req.method} ${req.url}`);

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const url = req.url || "";
    const { method } = req;

    // =================================================
    // LOGIN ENDPOINT - BULLETPROOF VERSION
    // =================================================
    if (url === "/api/auth/login" && method === "POST") {
      console.log("🚀 LOGIN REQUEST RECEIVED");

      try {
        // Safely parse request body
        let phone, password;

        if (!req.body) {
          console.error("❌ No request body");
          return res.status(400).json({
            error: "Request body required",
            success: false,
          });
        }

        if (typeof req.body === "string") {
          try {
            const parsed = JSON.parse(req.body);
            phone = parsed.phone;
            password = parsed.password;
          } catch (parseError) {
            console.error("❌ JSON parse error:", parseError);
            return res.status(400).json({
              error: "Invalid JSON in request body",
              success: false,
            });
          }
        } else {
          phone = req.body.phone;
          password = req.body.password;
        }

        console.log(
          `📱 Login attempt - Phone: ${phone}, Password length: ${password ? password.length : 0}`,
        );

        if (!phone || !password) {
          console.error("❌ Missing credentials");
          return res.status(400).json({
            error: "Phone and password are required",
            success: false,
          });
        }

        // Check demo users (always works, no database needed)
        const demoUser = DEMO_USERS[phone.trim()];

        if (demoUser && demoUser.password === password) {
          console.log("✅ Demo login successful!");

          const token = jwt.sign(
            {
              userId: `demo-${demoUser.role.toLowerCase()}`,
              phone: phone.trim(),
              role: demoUser.role,
            },
            process.env.JWT_SECRET || "zuasoko-production-secret-2024",
            { expiresIn: "7d" },
          );

          return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
              id: `demo-${demoUser.role.toLowerCase()}`,
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
              email: demoUser.email,
              phone: phone.trim(),
              role: demoUser.role,
              county: "Demo County",
              verified: true,
              registrationFeePaid: true,
            },
          });
        }

        // If not a demo user, return invalid credentials
        console.log("❌ Invalid credentials for:", phone);
        return res.status(401).json({
          error: "Invalid credentials",
          success: false,
          hint: "Try: +254712345678 / password123",
        });
      } catch (loginError) {
        console.error("❌ Login error:", loginError);
        return res.status(500).json({
          error: "Login system error",
          details: loginError.message,
          success: false,
        });
      }
    }

    // =================================================
    // PRODUCTS ENDPOINT
    // =================================================
    if (url === "/api/products" && method === "GET") {
      console.log("📦 Products request");
      return res.status(200).json({
        success: true,
        products: DEMO_PRODUCTS,
      });
    }

    // =================================================
    // MARKETPLACE PRODUCTS ENDPOINT - BULLETPROOF
    // =================================================
    if (url === "/api/marketplace/products" && method === "GET") {
      console.log("🛒 Marketplace products request");
      return res.status(200).json({
        success: true,
        products: DEMO_PRODUCTS.map(product => ({
          ...product,
          pricePerUnit: product.price_per_unit,
          stockQuantity: product.stock_quantity,
          isFeatured: product.is_featured,
          isAvailable: true,
          images: ["https://images.unsplash.com/photo-1546470427-e212b9d56085?w=400"]
        })),
        pagination: {
          page: 1,
          limit: 12,
          total: DEMO_PRODUCTS.length,
          totalPages: 1
        }
      });
    }

    // =================================================
    // DEMO LOGIN ENDPOINT (alternative)
    // =================================================
    if (url === "/api/demo/login" && method === "POST") {
      console.log("🎭 Demo login endpoint");

      const { phone, password } = req.body || {};

      if (phone && password) {
        const token = jwt.sign(
          { userId: "demo-user", phone, role: "CUSTOMER" },
          process.env.JWT_SECRET || "zuasoko-production-secret-2024",
          { expiresIn: "7d" },
        );

        return res.status(200).json({
          success: true,
          message: "Demo login successful",
          token,
          user: {
            id: "demo-user",
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com",
            phone,
            role: "CUSTOMER",
            county: "Demo County",
            verified: true,
            registrationFeePaid: true,
          },
        });
      }

      return res.status(400).json({
        error: "Phone and password required",
        success: false,
      });
    }

    // =================================================
    // DEMO PRODUCTS ENDPOINT
    // =================================================
    if (url === "/api/demo/products" && method === "GET") {
      console.log("📦 Demo products request");
      return res.status(200).json({
        success: true,
        products: DEMO_PRODUCTS,
      });
    }

    // =================================================
    // STATUS ENDPOINT
    // =================================================
    if (url === "/api/status" && method === "GET") {
      return res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        api_version: "bulletproof-1.0",
        available_endpoints: [
          "POST /api/auth/login",
          "GET /api/products",
          "POST /api/demo/login",
          "GET /api/demo/products",
          "GET /api/status",
        ],
      });
    }

    // =================================================
    // DEFAULT RESPONSE
    // =================================================
    console.log("❌ Endpoint not found:", url);
    return res.status(404).json({
      error: "Endpoint not found",
      requested: url,
      method: method,
      available_endpoints: [
        "POST /api/auth/login",
        "GET /api/products",
        "POST /api/demo/login",
        "GET /api/demo/products",
        "GET /api/status",
      ],
      success: false,
    });
  } catch (error) {
    console.error("❌ CRITICAL API ERROR:", error);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      error: "Critical server error",
      message: error.message,
      timestamp: new Date().toISOString(),
      success: false,
    });
  }
}
