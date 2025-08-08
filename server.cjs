const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5004;

// Force production environment on Fly.dev
if (process.env.FLY_APP_NAME || process.env.FLY_REGION) {
  process.env.NODE_ENV = 'production';
  console.log("🚀 Detected Fly.dev deployment - forcing production mode");
}

// Set NODE_ENV to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`📡 ${req.method} ${req.path}`, {
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query
    });
  }
  next();
});

// Set default JWT secret for production if not provided
const JWT_SECRET = process.env.JWT_SECRET || "zuasoko-production-secret-2025";

// Environment validation
console.log("🔧 Environment Check:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT:", PORT);
console.log("  FLY_APP_NAME:", process.env.FLY_APP_NAME || "Not set");
console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("  JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Using default");

if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL: DATABASE_URL environment variable is not set!");
  console.error("   Please set your Neon database URL in fly.toml or Fly.dev secrets");
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

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

// Authentication middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Basic API endpoints for compatibility
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  
  // Admin login
  if (phone === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { userId: 'admin-1', role: 'ADMIN', phone: '+254700000000' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      token,
      user: {
        id: 'admin-1',
        role: 'ADMIN',
        phone: '+254700000000',
        name: 'Admin User'
      }
    });
  }
  
  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// Serve static files
app.use(express.static('.'));

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
