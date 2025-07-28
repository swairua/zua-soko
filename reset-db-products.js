const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'zuasoko_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: false
});

async function resetProducts() {
  const client = await pool.connect();
  try {
    console.log('🔄 Resetting products table with integer IDs...');
    
    // Drop and recreate products table to ensure SERIAL ID
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        consignment_id VARCHAR(255),
        warehouse_id VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INTEGER DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'kg',
        price_per_unit DECIMAL(10,2) NOT NULL,
        description TEXT,
        images JSON DEFAULT '[]',
        stock_quantity INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,
        is_approved BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        tags TEXT[],
        farmer_county VARCHAR(100),
        farmer_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert products with SERIAL IDs (1, 2, 3, 4)
    await client.query(`
      INSERT INTO products (name, description, category, quantity, unit, price_per_unit, images, stock_quantity, is_featured, is_available, is_approved, is_active, farmer_name, farmer_county)
      VALUES
        ('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 'Vegetables', 500, 'kg', 85.00, '["https://images.unsplash.com/photo-1546470427-e212b9d56085"]', 500, true, true, true, true, 'John Farmer', 'Nakuru'),
        ('Green Beans', 'Tender green beans, freshly harvested and ready for pickup.', 'Vegetables', 200, 'kg', 95.00, '["https://images.unsplash.com/photo-1628773822503-930a7eaecf80"]', 200, true, true, true, true, 'John Farmer', 'Nakuru'),
        ('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients and vitamins.', 'Root Vegetables', 300, 'kg', 80.00, '["https://images.unsplash.com/photo-1518977676601-b53f82aba655"]', 300, false, true, true, true, 'Mary Farm', 'Meru'),
        ('Fresh Spinach', 'Organic spinach leaves, perfect for healthy meals.', 'Leafy Greens', 150, 'kg', 120.00, '["https://images.unsplash.com/photo-1576045057995-568f588f82fb"]', 150, false, true, true, true, 'Grace Farm', 'Nyeri')
    `);
    
    // Verify the results
    const result = await client.query('SELECT id, name, price_per_unit, stock_quantity FROM products ORDER BY id');
    console.log('✅ Products reset successfully with integer IDs:');
    console.log(result.rows);
    
    console.log('🎉 Database reset complete! Products now have proper SERIAL integer IDs (1, 2, 3, 4)');
    
  } catch (error) {
    console.error('❌ Error resetting products:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetProducts();
