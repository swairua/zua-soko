// Test Database Connection Script
const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Testing connection to Neon database...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Test if products table exists
    try {
      const result = await client.query('SELECT COUNT(*) FROM products');
      console.log(`✅ Products table found with ${result.rows[0].count} items`);
    } catch (error) {
      console.log('ℹ️  Products table not found - will be created automatically on first API call');
    }
    
    // Test creating products table (your app will do this automatically)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price_per_unit DECIMAL(10,2) NOT NULL,
          unit VARCHAR(20) DEFAULT 'kg',
          description TEXT,
          stock_quantity INTEGER DEFAULT 0,
          quantity INTEGER DEFAULT 0,
          images JSON DEFAULT '[]',
          farmer_name VARCHAR(255) DEFAULT 'Local Farmer',
          farmer_county VARCHAR(100) DEFAULT 'Kenya',
          is_featured BOOLEAN DEFAULT false,
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Products table ready');
      
      // Add sample products if none exist
      const countResult = await client.query('SELECT COUNT(*) FROM products');
      if (parseInt(countResult.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, quantity, images, farmer_name, farmer_county, is_featured) VALUES
          ('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 'Vegetables', 85.00, 'kg', 500, 500, '["https://images.unsplash.com/photo-1546470427-e212b9d56085"]', 'John Farmer', 'Nakuru', true),
          ('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients and vitamins.', 'Root Vegetables', 80.00, 'kg', 300, 300, '["https://images.unsplash.com/photo-1518977676601-b53f82aba655"]', 'Mary Farm', 'Meru', false),
          ('Fresh Spinach', 'Organic spinach leaves, perfect for healthy meals.', 'Leafy Greens', 120.00, 'kg', 150, 150, '["https://images.unsplash.com/photo-1576045057995-568f588f82fb"]', 'Grace Farm', 'Nyeri', false),
          ('Green Beans', 'Tender green beans, freshly harvested and ready for pickup.', 'Vegetables', 95.00, 'kg', 200, 200, '["https://images.unsplash.com/photo-1628773822503-930a7eaecf80"]', 'John Farmer', 'Nakuru', true)
        `);
        console.log('✅ Sample products added to marketplace');
      }
      
      // Show current products
      const productsResult = await client.query('SELECT id, name, price_per_unit, farmer_name FROM products LIMIT 5');
      console.log('\n📦 Current products in your marketplace:');
      productsResult.rows.forEach(product => {
        console.log(`   ${product.id}. ${product.name} - KES ${product.price_per_unit} (${product.farmer_name})`);
      });
      
    } catch (error) {
      console.log('❌ Error setting up tables:', error.message);
    }
    
    client.release();
    
    console.log('\n🎉 Database setup complete!');
    console.log('🚀 Your Neon database is ready for Vercel deployment');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
