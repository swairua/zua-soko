const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import the API handler
const handler = require("./api/index.js");

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: "development",
  });
});

// Route all API requests through the Vercel handler
app.all("/api/*", async (req, res) => {
  try {
    // Create a mock Vercel environment
    const mockReq = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    };

    const mockRes = {
      json: (data) => res.json(data),
      status: (code) => ({
        json: (data) => res.status(code).json(data),
        end: () => res.status(code).end(),
      }),
      setHeader: (name, value) => res.setHeader(name, value),
      end: () => res.end(),
    };

    await handler.default(mockReq, mockRes);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET  /api/health");
  console.log("  POST /api/demo/login      (Demo login - any credentials)");
  console.log("  GET  /api/demo/products   (Demo products)");
  console.log("  POST /api/auth/login      (Real login - requires database)");
  console.log(
    "  POST /api/auth/register   (Real register - requires database)",
  );
  console.log(
    "  GET  /api/products        (Real products - requires database)",
  );
});
