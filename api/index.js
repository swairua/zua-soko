const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', success: true });
});

// Ultra-simple marketplace products endpoint
app.get('/api/marketplace/products', (req, res) => {
  res.json({
    success: true,
    products: [
      {
        id: 1,
        name: "Fresh Tomatoes",
        category: "Vegetables",
        price_per_unit: 85,
        unit: "kg",
        description: "Organic red tomatoes",
        stock_quantity: 500,
        images: ["https://images.unsplash.com/photo-1546470427-e212b9d56085"],
        farmer_name: "John Farmer",
        farmer_county: "Nakuru",
        is_featured: true
      },
      {
        id: 2,
        name: "Sweet Potatoes",
        category: "Root Vegetables",
        price_per_unit: 80,
        unit: "kg",
        description: "Fresh sweet potatoes", 
        stock_quantity: 300,
        images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655"],
        farmer_name: "Mary Farm",
        farmer_county: "Meru",
        is_featured: false
      }
    ],
    pagination: {
      page: 1,
      limit: 12,
      total: 2,
      totalPages: 1
    }
  });
});

// Simple admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'zuasoko-production-secret-2024';
    const decoded = jwt.verify(token, jwtSecret);
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Simple admin users endpoint
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    users: [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Kamau',
        full_name: 'John Kamau',
        email: 'john@example.com',
        phone: '0712345678',
        role: 'FARMER',
        status: 'approved',
        county: 'Nakuru',
        verified: true,
        registration_fee_paid: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        first_name: 'Mary',
        last_name: 'Wanjiku',
        full_name: 'Mary Wanjiku',
        email: 'mary@example.com',
        phone: '0723456789',
        role: 'CUSTOMER',
        status: 'approved',
        county: 'Nairobi',
        verified: true,
        registration_fee_paid: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        first_name: 'Peter',
        last_name: 'Mwangi',
        full_name: 'Peter Mwangi',
        email: 'peter@example.com',
        phone: '0734567890',
        role: 'FARMER',
        status: 'pending',
        county: 'Kisumu',
        verified: false,
        registration_fee_paid: false,
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Simple admin user approval
app.post('/api/admin/users/:id/approve', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `User ${id} approved successfully (demo mode)`,
    user: { id: id, status: 'approved', verified: true }
  });
});

// Categories endpoint
app.get('/api/marketplace/categories', (req, res) => {
  res.json({
    success: true,
    categories: ['Vegetables', 'Root Vegetables', 'Leafy Greens']
  });
});

// Counties endpoint  
app.get('/api/marketplace/counties', (req, res) => {
  res.json({
    success: true,
    counties: ['Nairobi', 'Nakuru', 'Meru', 'Nyeri', 'Kisumu', 'Mombasa', 'Eldoret', 'Thika']
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  
  // Admin login
  if (phone === 'admin' && password === 'admin') {
    const adminToken = jwt.sign(
      { userId: 'admin-1', role: 'ADMIN', phone: '+254700000000' },
      process.env.JWT_SECRET || 'zuasoko-production-secret-2024',
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: 'admin-1',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+254700000000',
        role: 'ADMIN',
        county: 'System'
      },
      token: adminToken
    });
  }
  
  res.status(401).json({
    success: false,
    message: 'Invalid phone number or password'
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Export for Vercel
module.exports = app;
