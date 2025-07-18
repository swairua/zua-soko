const { Client } = require("pg");

// Database connection with live Render.com credentials
const client = new Client({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  try {
    console.log("🚀 Connecting to database...");
    await client.connect();
    console.log("✅ Connected to database");

    // Check if products table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log("📦 Creating products table...");

      // Create products table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
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
      `);
      console.log("✅ Products table created");
    } else {
      console.log("✅ Products table already exists");
    }

    // Check if we have any products
    const productCount = await client.query("SELECT COUNT(*) FROM products");
    console.log(
      `📦 Current products in database: ${productCount.rows[0].count}`,
    );

    if (parseInt(productCount.rows[0].count) === 0) {
      console.log("📦 Inserting seed products...");

      await client.query(`
        INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, is_featured, farmer_name, farmer_county, images) VALUES
        ('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 'Vegetables', 130.00, 'kg', 85, true, 'John Farmer', 'Nakuru', '{"https://images.unsplash.com/photo-1546470427-e212b9d56085"}'),
        ('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients and vitamins.', 'Root Vegetables', 80.00, 'kg', 45, true, 'Mary Farmer', 'Meru', '{"https://images.unsplash.com/photo-1518977676601-b53f82aba655"}'),
        ('Fresh Spinach', 'Organic spinach leaves, perfect for healthy meals.', 'Leafy Greens', 120.00, 'kg', 30, false, 'Peter Farmer', 'Kiambu', '{"https://images.unsplash.com/photo-1576045057995-568f588f82fb"}'),
        ('Green Beans', 'Tender green beans, freshly harvested.', 'Vegetables', 100.00, 'kg', 60, false, 'John Farmer', 'Nakuru', '{"https://images.unsplash.com/photo-1628773822503-930a7eaecf80"}'),
        ('White Maize', 'High quality white maize, perfect for ugali.', 'Grains', 60.00, 'kg', 200, true, 'Sarah Farmer', 'Meru', '{"https://images.unsplash.com/photo-1551782450-a2132b4ba21d"}'),
        ('Fresh Carrots', 'Organic carrots, crisp and sweet.', 'Root Vegetables', 90.00, 'kg', 75, false, 'James Farmer', 'Nyeri', '{"https://images.unsplash.com/photo-1598170845058-32b9d6a5da37"}'),
        ('Red Onions', 'Quality red onions for cooking.', 'Vegetables', 110.00, 'kg', 50, false, 'Alice Farmer', 'Kiambu', '{"https://images.unsplash.com/photo-1518977676601-b53f82aba655"}'),
        ('Fresh Kale', 'Nutritious kale leaves, locally grown.', 'Leafy Greens', 140.00, 'kg', 25, true, 'Mary Farmer', 'Meru', '{"https://images.unsplash.com/photo-1515516969-d4008cc6241a"}')
        ON CONFLICT DO NOTHING;
      `);

      const newCount = await client.query("SELECT COUNT(*) FROM products");
      console.log(`✅ Inserted products. Total now: ${newCount.rows[0].count}`);
    }

    // Verify the data
    const sampleProducts = await client.query(
      "SELECT name, category, farmer_county FROM products LIMIT 3",
    );
    console.log("📦 Sample products:");
    sampleProducts.rows.forEach((product) => {
      console.log(
        `  - ${product.name} (${product.category}) from ${product.farmer_county}`,
      );
    });

    console.log("🎉 Database setup complete!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

setupDatabase();
