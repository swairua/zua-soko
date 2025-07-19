// UNIVERSAL BULLETPROOF API - Works on any platform (Vercel, Fly.io, Render, etc.)
// Zero external dependencies, built-in Node.js modules only

const crypto = require("crypto");

// Simple hash function using only built-in crypto
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// Built-in users that ALWAYS work (no database required)
const BUILT_IN_USERS = {
  "+254712345678": {
    id: "admin-001",
    password: "password123",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
    role: "ADMIN",
    county: "Nairobi",
    verified: true,
    registrationFeePaid: true,
  },
  "admin@zuasoko.com": {
    id: "admin-001",
    password: "password123",
    firstName: "Admin",
    lastName: "User",
    email: "admin@zuasoko.com",
    role: "ADMIN",
    county: "Nairobi",
    verified: true,
    registrationFeePaid: true,
  },
  "+254723456789": {
    id: "farmer-001",
    password: "farmer123",
    firstName: "John",
    lastName: "Farmer",
    email: "farmer@zuasoko.com",
    role: "FARMER",
    county: "Nakuru",
    verified: true,
    registrationFeePaid: true,
  },
  "+254734567890": {
    id: "customer-001",
    password: "customer123",
    firstName: "Jane",
    lastName: "Customer",
    email: "customer@zuasoko.com",
    role: "CUSTOMER",
    county: "Nairobi",
    verified: true,
    registrationFeePaid: true,
  },
};

// Demo products that ALWAYS work
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price_per_unit: 130,
    unit: "kg",
    stock_quantity: 85,
    description:
      "Organic red tomatoes, Grade A quality. Perfect for salads and cooking.",
    is_featured: true,
    farmer_name: "Demo Farmer",
    farmer_county: "Nakuru",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Sweet Potatoes",
    category: "Root Vegetables",
    price_per_unit: 80,
    unit: "kg",
    stock_quantity: 45,
    description:
      "Fresh sweet potatoes, rich in nutrients and perfect for various dishes.",
    is_featured: true,
    farmer_name: "Demo Farmer",
    farmer_county: "Meru",
    created_at: new Date().toISOString(),
  },
];

// Parse request body safely
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    try {
      // If body is already parsed
      if (req.body && typeof req.body === "object") {
        return resolve(req.body);
      }

      // If body is a string
      if (req.body && typeof req.body === "string") {
        try {
          return resolve(JSON.parse(req.body));
        } catch (parseError) {
          return reject(new Error("Invalid JSON in request body"));
        }
      }

      // If we need to read from stream
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });

      req.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve(parsed);
        } catch (parseError) {
          reject(new Error("Invalid JSON in request body"));
        }
      });

      req.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Simple JWT creation (no external library needed)
function createSimpleJWT(payload, secret = "zuasoko-render-secret") {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString("base64")
    .replace(/[=]+$/, "");
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/[=]+$/, "");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/[=]+$/, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Main handler
module.exports = async function universalHandler(req, res) {
  const startTime = Date.now();

  try {
    console.log(`🌐 UNIVERSAL API: ${req.method} ${req.url}`);

    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    res.setHeader("Content-Type", "application/json");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      console.log("✅ CORS preflight handled");
      return res.status(200).end();
    }

    const url = req.url || "";
    const method = req.method || "GET";

    // =================================================
    // UNIVERSAL LOGIN ENDPOINT
    // =================================================
    // Handle both /api/auth/login (direct) and /auth/login (via Vercel rewrite)
    if (
      (url === "/api/auth/login" || url === "/auth/login") &&
      method === "POST"
    ) {
      console.log("🚀 UNIVERSAL LOGIN REQUEST");

      try {
        // Parse request body safely
        const body = await parseRequestBody(req);
        console.log("📝 Request body parsed successfully");

        const { phone, password } = body;

        if (!phone || !password) {
          console.log("❌ Missing credentials");
          return res.status(400).json({
            success: false,
            error: "Phone and password are required",
            code: "MISSING_CREDENTIALS",
          });
        }

        console.log(`📱 Login attempt: ${phone}`);

        // Check built-in users first (always available)
        const builtInUser =
          BUILT_IN_USERS[phone] || BUILT_IN_USERS[phone.trim()];
        if (builtInUser && builtInUser.password === password) {
          console.log("✅ Built-in user login successful");

          const token = createSimpleJWT({
            userId: builtInUser.id,
            phone: phone,
            role: builtInUser.role,
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
          });

          return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
              id: builtInUser.id,
              firstName: builtInUser.firstName,
              lastName: builtInUser.lastName,
              email: builtInUser.email,
              phone: phone,
              role: builtInUser.role,
              county: builtInUser.county,
              verified: builtInUser.verified,
              registrationFeePaid: builtInUser.registrationFeePaid,
            },
          });
        }

        console.log("❌ Invalid credentials");
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
          code: "LOGIN_ERROR",
          details: error.message,
        });
      }
    }

    // =================================================
    // UNIVERSAL PRODUCTS ENDPOINT
    // =================================================
    if (
      (url === "/api/products" ||
        url === "/products" ||
        url === "/marketplace/products" ||
        url === "/api/marketplace/products") &&
      method === "GET"
    ) {
      console.log("🛍️ UNIVERSAL PRODUCTS REQUEST");
      return res.status(200).json({
        success: true,
        products: DEMO_PRODUCTS,
        pagination: {
          page: 1,
          limit: 12,
          total: DEMO_PRODUCTS.length,
          totalPages: 1,
        },
      });
    }

    // =================================================
    // UNIVERSAL STATUS/HEALTH ENDPOINT
    // =================================================
    if (
      (url === "/api/status" ||
        url === "/status" ||
        url === "/api/health" ||
        url === "/health") &&
      method === "GET"
    ) {
      console.log("🏥 UNIVERSAL HEALTH CHECK");
      return res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        database: "demo",
        version: "1.0.0",
      });
    }

    // =================================================
    // UNIVERSAL CATEGORIES ENDPOINT
    // =================================================
    if (
      (url === "/api/marketplace/categories" ||
        url === "/marketplace/categories") &&
      method === "GET"
    ) {
      console.log("📁 UNIVERSAL CATEGORIES REQUEST");
      return res.status(200).json({
        success: true,
        categories: ["Vegetables", "Fruits", "Grains", "Root Vegetables"],
      });
    }

    // =================================================
    // UNIVERSAL COUNTIES ENDPOINT
    // =================================================
    if (
      (url === "/api/marketplace/counties" ||
        url === "/marketplace/counties") &&
      method === "GET"
    ) {
      console.log("🗺️ UNIVERSAL COUNTIES REQUEST");
      return res.status(200).json({
        success: true,
        counties: ["Nairobi", "Nakuru", "Meru", "Kiambu", "Nyeri"],
      });
    }

    // =================================================
    // DEFAULT - ENDPOINT NOT FOUND
    // =================================================
    console.log("❌ Endpoint not found:", url);
    return res.status(404).json({
      success: false,
      error: "Endpoint not found",
      code: "NOT_FOUND",
      url: url,
      method: method,
      availableEndpoints: [
        "POST /auth/login",
        "GET /health",
        "GET /products",
        "GET /marketplace/products",
        "GET /marketplace/categories",
        "GET /marketplace/counties",
      ],
    });
  } catch (error) {
    console.error("❌ UNIVERSAL API ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "UNIVERSAL_ERROR",
      message: error.message,
    });
  }
};

// Also export as default for compatibility
module.exports.default = module.exports;
