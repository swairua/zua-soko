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
    registrationFeePaid: false,
  },
};

// Built-in products (no database required)
const BUILT_IN_PRODUCTS = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price_per_unit: 130,
    unit: "kg",
    description:
      "Organic red tomatoes, Grade A quality. Perfect for salads and cooking.",
    stock_quantity: 85,
    is_featured: true,
    farmer_name: "John Farmer",
    farmer_county: "Nakuru",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Sweet Potatoes",
    category: "Root Vegetables",
    price_per_unit: 80,
    unit: "kg",
    description: "Fresh sweet potatoes, rich in nutrients and vitamins.",
    stock_quantity: 45,
    is_featured: true,
    farmer_name: "Mary Farmer",
    farmer_county: "Meru",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Fresh Spinach",
    category: "Leafy Greens",
    price_per_unit: 120,
    unit: "kg",
    description: "Organic spinach leaves, perfect for healthy meals.",
    stock_quantity: 30,
    is_featured: false,
    farmer_name: "Peter Farmer",
    farmer_county: "Kiambu",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Green Beans",
    category: "Vegetables",
    price_per_unit: 100,
    unit: "kg",
    description: "Tender green beans, freshly harvested.",
    stock_quantity: 60,
    is_featured: false,
    farmer_name: "John Farmer",
    farmer_county: "Nakuru",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "White Maize",
    category: "Grains",
    price_per_unit: 60,
    unit: "kg",
    description: "High quality white maize, perfect for ugali.",
    stock_quantity: 200,
    is_featured: true,
    farmer_name: "Sarah Farmer",
    farmer_county: "Meru",
    created_at: new Date().toISOString(),
  },
];

// Simple JWT creation (no external library needed)
function createSimpleToken(payload) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  const secret = process.env.JWT_SECRET || "zuasoko-universal-secret-2024";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

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

      // If we need to read the body stream
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          if (body.trim() === "") {
            return resolve({});
          }
          const parsed = JSON.parse(body);
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

// UNIVERSAL API HANDLER - Works on any platform
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
    if (url === "/api/auth/login" && method === "POST") {
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

        // Check built-in users (always works)
        const user = BUILT_IN_USERS[phone.trim()];

        if (!user) {
          console.log("❌ User not found in built-in users");
          return res.status(401).json({
            success: false,
            error: "Invalid credentials",
            code: "USER_NOT_FOUND",
            hint: "Try: +254712345678 / password123",
          });
        }

        if (user.password !== password) {
          console.log("❌ Invalid password");
          return res.status(401).json({
            success: false,
            error: "Invalid credentials",
            code: "INVALID_PASSWORD",
            hint: "Try: +254712345678 / password123",
          });
        }

        // Create token
        const tokenPayload = {
          userId: user.id,
          phone: phone.trim(),
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        };

        const token = createSimpleToken(tokenPayload);

        console.log("✅ UNIVERSAL LOGIN SUCCESS");

        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: phone.trim(),
            role: user.role,
            county: user.county,
            verified: user.verified,
            registrationFeePaid: user.registrationFeePaid,
          },
          source: "universal_api",
          timestamp: new Date().toISOString(),
        });
      } catch (parseError) {
        console.error("❌ Request parsing error:", parseError);
        return res.status(400).json({
          success: false,
          error: "Invalid request format",
          details: parseError.message,
          code: "PARSE_ERROR",
        });
      }
    }

    // =================================================
    // UNIVERSAL PRODUCTS ENDPOINT
    // =================================================
    if (url === "/api/products" && method === "GET") {
      console.log("📦 UNIVERSAL PRODUCTS REQUEST");

      return res.status(200).json({
        success: true,
        products: BUILT_IN_PRODUCTS,
        count: BUILT_IN_PRODUCTS.length,
        source: "universal_api",
        timestamp: new Date().toISOString(),
      });
    }

    // =================================================
    // UNIVERSAL STATUS ENDPOINT
    // =================================================
    if (url === "/api/status" && method === "GET") {
      console.log("🔍 UNIVERSAL STATUS REQUEST");

      const responseTime = Date.now() - startTime;

      return res.status(200).json({
        status: "OK",
        api_type: "universal",
        response_time_ms: responseTime,
        timestamp: new Date().toISOString(),
        platform: process.env.VERCEL
          ? "vercel"
          : process.env.FLY_APP_NAME
            ? "fly.io"
            : process.env.RENDER
              ? "render"
              : "unknown",
        environment: process.env.NODE_ENV || "production",
        available_endpoints: [
          "POST /api/auth/login",
          "GET /api/products",
          "GET /api/status",
        ],
        built_in_users: Object.keys(BUILT_IN_USERS).length,
        built_in_products: BUILT_IN_PRODUCTS.length,
      });
    }

    // =================================================
    // DEMO LOGIN ENDPOINT (alternative)
    // =================================================
    if (url === "/api/demo/login" && method === "POST") {
      console.log("🎭 DEMO LOGIN REQUEST");

      try {
        const body = await parseRequestBody(req);
        const { phone, password } = body;

        if (phone && password) {
          const token = createSimpleToken({
            userId: "demo-user",
            phone,
            role: "CUSTOMER",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          });

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
            source: "demo_endpoint",
          });
        }

        return res.status(400).json({
          success: false,
          error: "Phone and password required",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid request format",
        });
      }
    }

    // =================================================
    // DEFAULT - ENDPOINT NOT FOUND
    // =================================================
    console.log("❌ Endpoint not found:", url);
    return res.status(404).json({
      success: false,
      error: "Endpoint not found",
      requested_url: url,
      requested_method: method,
      available_endpoints: [
        "POST /api/auth/login - Login with built-in users",
        "GET /api/products - Get built-in products",
        "GET /api/status - API status",
        "POST /api/demo/login - Demo login",
      ],
      hint: "Try logging in with +254712345678 / password123",
    });
  } catch (error) {
    console.error("❌ CRITICAL UNIVERSAL API ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString(),
      code: "CRITICAL_ERROR",
    });
  }
};

// Export for different platforms
module.exports.default = module.exports;
module.exports.handler = module.exports;

// For Vercel
if (typeof exports !== "undefined") {
  exports.default = module.exports;
}
