const { Client } = require("pg");

// Database connection with live Render.com credentials
const client = new Client({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
});

async function updateProductIds() {
  try {
    console.log("🚀 Connecting to database...");
    await client.connect();
    console.log("✅ Connected to database");

    // First, check what products exist
    const existingProducts = await client.query(`
      SELECT id, name, category, price_per_unit, stock_quantity 
      FROM products 
      ORDER BY id;
    `);
    
    console.log("📦 Current products in database:");
    console.table(existingProducts.rows);

    // Clear existing products first
    console.log("🗑️ Clearing existing products...");
    await client.query("DELETE FROM products;");

    // Reset the sequence to start from 1
    await client.query("ALTER SEQUENCE products_id_seq RESTART WITH 1;");

    console.log("📦 Inserting products with real IDs...");

    // Insert products with real auto-incremented IDs
    await client.query(`
      INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, is_active, images) VALUES
      ('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 'Vegetables', 130.00, 'kg', 85, true, '{"https://images.unsplash.com/photo-1546470427-e212b9d56085"}'),
      ('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients and vitamins.', 'Root Vegetables', 80.00, 'kg', 45, true, '{"https://images.unsplash.com/photo-1518977676601-b53f82aba655"}'),
      ('Fresh Spinach', 'Organic spinach leaves, perfect for healthy meals.', 'Leafy Greens', 120.00, 'kg', 30, true, '{"https://images.unsplash.com/photo-1576045057995-568f588f82fb"}'),
      ('Green Beans', 'Tender green beans, freshly harvested.', 'Vegetables', 100.00, 'kg', 60, true, '{"https://images.unsplash.com/photo-1628773822503-930a7eaecf80"}'),
      ('White Maize', 'High quality white maize, perfect for ugali.', 'Grains', 60.00, 'kg', 200, true, '{"https://images.unsplash.com/photo-1551782450-a2132b4ba21d"}'),
      ('Fresh Carrots', 'Organic carrots, crisp and sweet.', 'Root Vegetables', 90.00, 'kg', 75, true, '{"https://images.unsplash.com/photo-1598170845058-32b9d6a5da37"}'),
      ('Red Onions', 'Quality red onions for cooking.', 'Vegetables', 110.00, 'kg', 50, true, '{"https://images.unsplash.com/photo-1518977676601-b53f82aba655"}'),
      ('Fresh Kale', 'Nutritious kale leaves, locally grown.', 'Leafy Greens', 140.00, 'kg', 25, true, '{"https://images.unsplash.com/photo-1515516969-d4008cc6241a"}');
    `);

    // Verify the new data
    const newProducts = await client.query(`
      SELECT id, name, category, price_per_unit, stock_quantity 
      FROM products 
      ORDER BY id;
    `);
    
    console.log("✅ Updated products with real IDs:");
    console.table(newProducts.rows);

    console.log(`🎉 Successfully updated ${newProducts.rows.length} products with real integer IDs!`);

  } catch (error) {
    console.error("❌ Failed to update product IDs:", error);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

updateProductIds();
