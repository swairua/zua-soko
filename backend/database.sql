-- Zuasoko Database Schema
-- Run this in PostgreSQL to create the database structure

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('FARMER', 'CUSTOMER', 'ADMIN', 'DRIVER')) NOT NULL,
    county VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consignments table
CREATE TABLE consignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    bid_price_per_unit DECIMAL(10,2) NOT NULL,
    final_price_per_unit DECIMAL(10,2),
    images TEXT[], -- Array of image URLs
    location VARCHAR(255),
    harvest_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING',
    admin_notes TEXT,
    driver_id UUID REFERENCES users(id),
    warehouse_id UUID,
    marketplace_product_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (marketplace)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consignment_id UUID REFERENCES consignments(id),
    warehouse_id UUID,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    description TEXT,
    images TEXT[],
    stock_quantity DECIMAL(10,2) NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT true,
    tags TEXT[],
    farmer_county VARCHAR(255),
    farmer_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carts table
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    delivery_address TEXT NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('CREDIT', 'DEBIT')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference VARCHAR(255),
    mpesa_transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity DECIMAL(10,2),
    current_stock DECIMAL(10,2) DEFAULT 0.00,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_consignments_farmer_id ON consignments(farmer_id);
CREATE INDEX idx_consignments_status ON consignments(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Insert sample data
INSERT INTO users (id, first_name, last_name, phone, password_hash, role, county, verified) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin', 'User', '+254712345678', '$2a$10$example.hash.for.password123', 'ADMIN', 'Nairobi', true),
('22222222-2222-2222-2222-222222222222', 'John', 'Farmer', '+254734567890', '$2a$10$example.hash.for.password123', 'FARMER', 'Nakuru', true),
('33333333-3333-3333-3333-333333333333', 'Jane', 'Customer', '+254756789012', '$2a$10$example.hash.for.password123', 'CUSTOMER', 'Nairobi', true),
('44444444-4444-4444-4444-444444444444', 'Mike', 'Driver', '+254778901234', '$2a$10$example.hash.for.password123', 'DRIVER', 'Kiambu', true);

INSERT INTO warehouses (id, name, location, capacity, current_stock, manager_id) VALUES
('99999999-9999-9999-9999-999999999999', 'Nairobi Central Warehouse', 'Industrial Area, Nairobi', 10000.00, 0.00, '44444444-4444-4444-4444-444444444444');

INSERT INTO wallets (user_id, balance) VALUES
('22222222-2222-2222-2222-222222222222', 1500.00);

INSERT INTO consignments (id, farmer_id, title, description, category, quantity, unit, bid_price_per_unit, final_price_per_unit, images, location, harvest_date, expiry_date, status, warehouse_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Fresh Tomatoes', 'High quality Roma tomatoes', 'Vegetables', 500.00, 'kg', 80.00, 85.00, ARRAY['https://images.unsplash.com/photo-1592841200221-a6898f307baa'], 'Nakuru', '2024-01-15', '2024-01-22', 'DELIVERED', '99999999-9999-9999-9999-999999999999'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Organic Carrots', 'Fresh organic carrots from highland farm', 'Vegetables', 300.00, 'kg', 60.00, NULL, ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'], 'Nakuru', '2024-01-16', '2024-01-30', 'PENDING', NULL);

INSERT INTO products (id, consignment_id, warehouse_id, name, category, quantity, unit, price_per_unit, description, images, stock_quantity, is_featured, farmer_county, farmer_name) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', 'Fresh Tomatoes', 'Vegetables', 500.00, 'kg', 85.00, 'High quality Roma tomatoes', ARRAY['https://images.unsplash.com/photo-1592841200221-a6898f307baa'], 500.00, true, 'Nakuru', 'John Farmer'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, '99999999-9999-9999-9999-999999999999', 'Fresh Spinach', 'Vegetables', 100.00, 'kg', 120.00, 'Organic spinach leaves', ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb'], 100.00, false, 'Warehouse', 'Warehouse Stock');
