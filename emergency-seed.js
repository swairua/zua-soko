// Emergency database seeding script for login issues
const crypto = require("crypto");

// Simple hash function matching api/index.js
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// SQL to create tables and seed admin user
const emergencySQL = `
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    county VARCHAR(100),
    verified BOOLEAN DEFAULT false,
    registration_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    farmer_name VARCHAR(200),
    farmer_county VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user with correct password hash for "password123"
INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid) 
VALUES (
    'Admin', 
    'User', 
    'admin@zuasoko.com', 
    '+254712345678', 
    '${hashPassword("password123")}', 
    'ADMIN', 
    'Nairobi', 
    true, 
    true
) ON CONFLICT (phone) 
DO UPDATE SET 
    password_hash = '${hashPassword("password123")}',
    verified = true,
    registration_fee_paid = true;

-- Insert demo products
INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, is_featured, farmer_name, farmer_county) 
VALUES 
('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality', 'Vegetables', 130.00, 'kg', 85, true, 'Demo Farmer', 'Nakuru'),
('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients', 'Root Vegetables', 80.00, 'kg', 45, true, 'Demo Farmer', 'Meru')
ON CONFLICT DO NOTHING;

-- Verify admin user
SELECT 'Admin user created/updated successfully!' as message,
       first_name, last_name, phone, role, verified 
FROM users 
WHERE phone = '+254712345678';
`;

console.log("🚀 EMERGENCY DATABASE SEED");
console.log("================================================");
console.log("📱 Admin Phone: +254712345678");
console.log("🔐 Admin Password: password123");
console.log("🔐 Password Hash:", hashPassword("password123"));
console.log("================================================");
console.log("SQL to execute:");
console.log(emergencySQL);
