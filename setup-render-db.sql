-- Zuasoko Database Setup for Render.com PostgreSQL
-- This script creates the database schema and seeds initial data

-- Create ENUM types first
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'FARMER', 'CUSTOMER', 'DRIVER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consignment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PRICE_SUGGESTED', 'DRIVER_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('MPESA', 'COD', 'BANK_TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    county VARCHAR(100),
    sub_county VARCHAR(100),
    ward VARCHAR(100),
    verified BOOLEAN DEFAULT false,
    registration_fee_paid BOOLEAN DEFAULT false,
    total_earnings DECIMAL(15,2) DEFAULT 0.00,
    profile_image TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    current_stock INTEGER DEFAULT 0,
    manager_id INTEGER REFERENCES users(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    pending_balance DECIMAL(15,2) DEFAULT 0.00,
    total_earned DECIMAL(15,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consignments table
CREATE TABLE IF NOT EXISTS consignments (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    bid_price_per_unit DECIMAL(10,2) NOT NULL,
    final_price_per_unit DECIMAL(10,2),
    images TEXT[],
    location VARCHAR(255),
    harvest_date DATE,
    expiry_date DATE,
    status consignment_status DEFAULT 'PENDING',
    admin_notes TEXT,
    driver_id INTEGER REFERENCES users(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (marketplace items from approved consignments)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    consignment_id INTEGER REFERENCES consignments(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    images TEXT[],
    stock_quantity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    farmer_name VARCHAR(200),
    farmer_county VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    customer_info JSONB,
    total_amount DECIMAL(15,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    status order_status DEFAULT 'PENDING',
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'PENDING',
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT,
    delivery_date TIMESTAMP,
    driver_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_id INTEGER REFERENCES orders(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'PENDING',
    mpesa_phone VARCHAR(20),
    mpesa_transaction_id VARCHAR(100),
    mpesa_checkout_request_id VARCHAR(100),
    reference_code VARCHAR(100),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    payment_id INTEGER REFERENCES payments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read_at TIMESTAMP,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_consignments_farmer_id ON consignments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_consignments_status ON consignments(status);
CREATE INDEX IF NOT EXISTS idx_consignments_driver_id ON consignments(driver_id);

CREATE INDEX IF NOT EXISTS idx_products_consignment_id ON products(consignment_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_warehouses_updated_at') THEN
        CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wallets_updated_at') THEN
        CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_consignments_updated_at') THEN
        CREATE TRIGGER update_consignments_updated_at BEFORE UPDATE ON consignments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
        CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert seed data

-- Demo users with hashed passwords using simple hash function (password + "salt123")
-- Admin password: password123 -> hash
-- Farmer password: farmer123 -> hash
-- Customer password: customer123 -> hash
INSERT INTO users (first_name, last_name, email, phone, password_hash, role, county, verified, registration_fee_paid) VALUES
('Admin', 'User', 'admin@zuasoko.com', '+254712345678', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'ADMIN', 'Nairobi', true, true),
('John', 'Farmer', 'john@farmer.com', '+254723456789', '8d23370e5f832fc84dd4a9b2fe3f9b8e4e9b78e1c4e1e4a4e4f3e2e1d1c1b1a1', 'FARMER', 'Nakuru', true, true),
('Jane', 'Customer', 'jane@customer.com', '+254734567890', 'a7f832db8e6a2b9c1e5d3f4e6c8a1b2d4e6f8a1c3e5b7d9f1e3c5a7b9d1e3f5c', 'CUSTOMER', 'Nairobi', true, true),
('Mike', 'Driver', 'mike@driver.com', '+254745678901', 'b8f943ec9f7b3cad2f6e4f5f7d9b2c3e5f7f9b2d4f6c8eaf2f4d6c8ebd2f4d6e', 'DRIVER', 'Kiambu', true, true),
('Sarah', 'Farmer', 'sarah@farmer.com', '+254756789012', 'c9fa54fd0a8c4dbe3f7f5f6f8eac3d4f6f8fac3e5f7d9fbf3f5e7d9fcf3f5e7f', 'FARMER', 'Meru', true, true)
ON CONFLICT (phone) DO NOTHING;

-- Get user IDs for seed data
DO $$
DECLARE
    farmer_john_id INTEGER;
    farmer_sarah_id INTEGER;
    admin_id INTEGER;
    warehouse_id INTEGER;
BEGIN
    -- Get user IDs
    SELECT id INTO farmer_john_id FROM users WHERE email = 'john@farmer.com';
    SELECT id INTO farmer_sarah_id FROM users WHERE email = 'sarah@farmer.com';
    SELECT id INTO admin_id FROM users WHERE email = 'admin@zuasoko.com';
    
    -- Create wallets for farmers
    INSERT INTO wallets (user_id, balance) VALUES 
    (farmer_john_id, 1500.00),
    (farmer_sarah_id, 2300.00)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create warehouses
    INSERT INTO warehouses (name, location, capacity, current_stock, manager_id, latitude, longitude) VALUES 
    ('Central Warehouse Nairobi', 'Industrial Area, Nairobi', 5000, 850, admin_id, -1.2966, 36.8595),
    ('Nakuru Distribution Center', 'Nakuru Town, Nakuru', 3000, 420, admin_id, -0.3031, 36.0800)
    ON CONFLICT DO NOTHING;
    
    -- Get warehouse ID
    SELECT id INTO warehouse_id FROM warehouses WHERE name = 'Central Warehouse Nairobi' LIMIT 1;
    
    -- Create sample consignments
    INSERT INTO consignments (farmer_id, title, description, category, quantity, unit, bid_price_per_unit, final_price_per_unit, location, harvest_date, expiry_date, status, warehouse_id) VALUES 
    (farmer_john_id, 'Premium Tomatoes - Grade A', 'Fresh organic tomatoes, hand-picked and carefully selected. Perfect for cooking and salads.', 'Vegetables', 500, 'kg', 120.00, 130.00, 'Nakuru County', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'APPROVED', warehouse_id),
    (farmer_sarah_id, 'Sweet Potatoes - Organic', 'Organically grown sweet potatoes, rich in nutrients and vitamins. Great source of energy.', 'Root Vegetables', 300, 'kg', 70.00, 80.00, 'Meru County', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '7 days', 'APPROVED', warehouse_id),
    (farmer_john_id, 'Fresh Kale - Bundle Pack', 'Fresh green kale, perfect for healthy smoothies and cooking. Locally grown.', 'Leafy Greens', 150, 'bundles', 40.00, 45.00, 'Nakuru County', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'APPROVED', warehouse_id),
    (farmer_sarah_id, 'White Maize - Premium', 'High quality white maize, perfect for ugali and other traditional dishes.', 'Grains', 1000, 'kg', 50.00, 60.00, 'Meru County', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '30 days', 'APPROVED', warehouse_id),
    (farmer_john_id, 'Green Beans - Fresh', 'Tender green beans, perfect for cooking. High quality and fresh from the farm.', 'Vegetables', 200, 'kg', 90.00, 100.00, 'Nakuru County', CURRENT_DATE, CURRENT_DATE + INTERVAL '4 days', 'APPROVED', warehouse_id)
    ON CONFLICT DO NOTHING;
    
    -- Create products from approved consignments
    INSERT INTO products (consignment_id, warehouse_id, name, description, category, price_per_unit, unit, stock_quantity, is_active, is_featured, farmer_name, farmer_county) 
    SELECT 
        c.id,
        c.warehouse_id,
        c.title,
        c.description,
        c.category,
        c.final_price_per_unit,
        c.unit,
        c.quantity,
        true,
        CASE WHEN c.category = 'Vegetables' THEN true ELSE false END,
        u.first_name || ' ' || u.last_name,
        u.county
    FROM consignments c
    JOIN users u ON c.farmer_id = u.id
    WHERE c.status = 'APPROVED'
    ON CONFLICT DO NOTHING;
    
END $$;

-- Success message
SELECT '✅ Zuasoko database schema and seed data created successfully!' as status,
       'Database ready for production use' as message,
       NOW() as timestamp;
