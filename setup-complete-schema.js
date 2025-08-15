const { Pool } = require('pg');

// Database connection using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    "postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

// Create complete database schema
const setupCompleteSchema = async () => {
  try {
    console.log('🏗️ Setting up complete database schema...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? '[SET FROM ENV]' : '[USING DEFAULT]');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', testResult.rows[0].current_time);
    
    // Users table (already exists from seed-live-database.js)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'CUSTOMER',
        county VARCHAR(100),
        verified BOOLEAN DEFAULT false,
        registration_fee_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Products table (already exists from seed-live-database.js)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        farmer_name VARCHAR(255),
        farmer_county VARCHAR(100),
        images JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Consignments table for farmer dashboard
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consignments (
        id VARCHAR(50) PRIMARY KEY,
        farmer_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        final_price_per_unit DECIMAL(10,2),
        notes TEXT,
        location VARCHAR(255),
        harvest_date DATE,
        expiry_date DATE,
        images JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(20) DEFAULT 'PENDING',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Wallets table for farmer earnings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL UNIQUE,
        balance DECIMAL(12,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Transactions table for wallet history
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL, -- CREDIT, DEBIT
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(500) NOT NULL,
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'COMPLETED',
        reference_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Notifications table for user notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Orders table (already exists from main API)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        customer_info JSONB NOT NULL,
        items JSONB NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'pending',
        delivery_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Counties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ All database tables created successfully');

    // Insert sample data for farmer dashboards
    console.log('🌱 Adding sample data for farmer dashboards...');

    // Sample consignments
    const sampleConsignments = [
      {
        id: 'CONS-DEMO-001',
        farmer_id: 'farmer-1',
        product_name: 'Fresh Organic Tomatoes',
        category: 'Vegetables',
        quantity: 500,
        unit: 'kg',
        price_per_unit: 120.00,
        final_price_per_unit: 120.00,
        notes: 'High-quality organic tomatoes from highland farm',
        location: 'Nakuru, Kenya',
        harvest_date: '2024-01-15',
        expiry_date: '2024-01-25',
        images: JSON.stringify(['https://images.unsplash.com/photo-1546470427-e212b9d56085?w=500']),
        status: 'APPROVED',
        admin_notes: 'Excellent quality, approved for marketplace'
      },
      {
        id: 'CONS-DEMO-002',
        farmer_id: 'farmer-2',
        product_name: 'Sweet Orange Potatoes',
        category: 'Root Vegetables',
        quantity: 300,
        unit: 'kg',
        price_per_unit: 85.00,
        notes: 'Fresh sweet potatoes, high in beta-carotene',
        location: 'Meru, Kenya',
        harvest_date: '2024-01-16',
        expiry_date: '2024-01-30',
        images: JSON.stringify(['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500']),
        status: 'PENDING'
      }
    ];

    for (const consignment of sampleConsignments) {
      await pool.query(`
        INSERT INTO consignments (
          id, farmer_id, product_name, category, quantity, unit,
          price_per_unit, final_price_per_unit, notes, location,
          harvest_date, expiry_date, images, status, admin_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          product_name = EXCLUDED.product_name,
          notes = EXCLUDED.notes,
          status = EXCLUDED.status,
          updated_at = NOW()
      `, [
        consignment.id, consignment.farmer_id, consignment.product_name,
        consignment.category, consignment.quantity, consignment.unit,
        consignment.price_per_unit, consignment.final_price_per_unit,
        consignment.notes, consignment.location, consignment.harvest_date,
        consignment.expiry_date, consignment.images, consignment.status,
        consignment.admin_notes
      ]);
    }

    // Sample wallets
    const sampleWallets = [
      { user_id: 'farmer-1', balance: 25750.00 },
      { user_id: 'farmer-2', balance: 18900.00 },
      { user_id: 'admin-1', balance: 5000.00 },
      { user_id: 'customer-1', balance: 1200.00 }
    ];

    for (const wallet of sampleWallets) {
      await pool.query(`
        INSERT INTO wallets (user_id, balance)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET
          balance = EXCLUDED.balance,
          updated_at = NOW()
      `, [wallet.user_id, wallet.balance]);
    }

    // Sample transactions
    const sampleTransactions = [
      {
        id: 'TXN-DEMO-001',
        user_id: 'farmer-1',
        type: 'CREDIT',
        amount: 25000.00,
        description: 'Payment for tomatoes order #ZUA001',
        status: 'COMPLETED'
      },
      {
        id: 'TXN-DEMO-002',
        user_id: 'farmer-1',
        type: 'DEBIT',
        amount: 500.00,
        description: 'Platform service fee',
        status: 'COMPLETED'
      },
      {
        id: 'TXN-DEMO-003',
        user_id: 'farmer-2',
        type: 'CREDIT',
        amount: 19000.00,
        description: 'Payment for sweet potatoes delivery',
        status: 'COMPLETED'
      }
    ];

    for (const transaction of sampleTransactions) {
      await pool.query(`
        INSERT INTO transactions (
          id, user_id, type, amount, description, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        transaction.id, transaction.user_id, transaction.type,
        transaction.amount, transaction.description, transaction.status
      ]);
    }

    // Sample notifications
    const sampleNotifications = [
      {
        user_id: 'farmer-1',
        title: 'Consignment Approved',
        message: 'Your Fresh Organic Tomatoes consignment has been approved and is now live on the marketplace.',
        type: 'success',
        read: false
      },
      {
        user_id: 'farmer-1',
        title: 'Payment Received',
        message: 'You received KSh 25,000 for your tomatoes order. Check your wallet for details.',
        type: 'payment',
        read: false
      },
      {
        user_id: 'farmer-2',
        title: 'New Order Request',
        message: 'A customer has placed an order for 100kg of your sweet potatoes.',
        type: 'order',
        read: true
      },
      {
        user_id: 'farmer-2',
        title: 'Consignment Under Review',
        message: 'Your Sweet Orange Potatoes consignment is currently under admin review.',
        type: 'info',
        read: false
      }
    ];

    for (const notification of sampleNotifications) {
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, read, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        notification.user_id, notification.title, notification.message,
        notification.type, notification.read
      ]);
    }

    console.log('✅ Sample data added successfully');

    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const productCount = await pool.query('SELECT COUNT(*) FROM products WHERE is_active = true');
    const consignmentCount = await pool.query('SELECT COUNT(*) FROM consignments');
    const walletCount = await pool.query('SELECT COUNT(*) FROM wallets');
    const transactionCount = await pool.query('SELECT COUNT(*) FROM transactions');
    const notificationCount = await pool.query('SELECT COUNT(*) FROM notifications');
    
    console.log('\n🎉 Complete database setup finished!');
    console.log('='.repeat(60));
    console.log(`👥 Total Users: ${userCount.rows[0].count}`);
    console.log(`🛒 Active Products: ${productCount.rows[0].count}`); 
    console.log(`📦 Consignments: ${consignmentCount.rows[0].count}`);
    console.log(`💰 Wallets: ${walletCount.rows[0].count}`);
    console.log(`💳 Transactions: ${transactionCount.rows[0].count}`);
    console.log(`🔔 Notifications: ${notificationCount.rows[0].count}`);
    console.log('='.repeat(60));
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: +254712345678 / password123');
    console.log('Farmer (John): +254723456789 / farmer123'); 
    console.log('Farmer (Mary): +254734567890 / farmer123');
    console.log('Customer: +254767890123 / customer123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  setupCompleteSchema();
}

module.exports = { setupCompleteSchema };
