const express = require("express");

// Import the API handler
let apiHandler;
try {
  apiHandler = require("./api/index.js");
} catch (err) {
  console.error("Failed to load API handler:", err.message);
  // Create a fallback handler
  apiHandler = {
    default: async (req, res) => {
      res.status(503).json({ error: "API handler not available" });
    },
  };
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.raw({ type: "application/octet-stream" }));

// Set environment variable for database
process.env.DATABASE_URL =
  "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db";

// API routes - handle all /api/* requests
app.all("/api/*", async (req, res) => {
  try {
    console.log(`🔄 API Request: ${req.method} ${req.url}`);

    // Create mock Vercel environment for the handler
    const mockReq = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    };

    const mockRes = {
      json: (data) => {
        console.log(`�� API Response: ${req.method} ${req.url} - Success`);
        return res.json(data);
      },
      status: (code) => ({
        json: (data) => {
          console.log(
            `⚠️ API Response: ${req.method} ${req.url} - Status ${code}`,
          );
          return res.status(code).json(data);
        },
        end: () => {
          console.log(
            `⚠️ API Response: ${req.method} ${req.url} - Status ${code} (end)`,
          );
          return res.status(code).end();
        },
      }),
      setHeader: (name, value) => res.setHeader(name, value),
      end: () => res.end(),
    };

    await apiHandler.default(mockReq, mockRes);
  } catch (error) {
    console.error(`❌ API Error: ${req.method} ${req.url} -`, error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Health check that bypasses the proxy
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: "development",
    server: "combined-dev-server",
  });
});

// Catch-all for non-API routes
app.get("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message:
      "This is the API server. Frontend should be served by Vite on port 3001.",
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Combined API server running on http://localhost:${PORT}`);
  console.log(
    `📊 Database URL configured: ${process.env.DATABASE_URL ? "Yes" : "No"}`,
  );
  console.log("Available endpoints:");
  console.log("  GET  /api/health          (Database health check)");
  console.log("  POST /api/auth/login      (User authentication)");
  console.log("  POST /api/auth/register   (User registration)");
  console.log("  GET  /api/products        (Product listings)");
  console.log("  GET  /api/wallet/balance  (Wallet balance - requires auth)");
  console.log("  POST /api/demo/login      (Demo login)");
  console.log("  GET  /api/demo/products   (Demo products)");
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔚 Shutting down API server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🔚 Shutting down API server...");
  process.exit(0);
});
