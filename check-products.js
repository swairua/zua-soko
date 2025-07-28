const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://zuasoko_db_user:OoageAtal4KEnVnXn2axejZJxpy4nXto@dpg-d1rl7vripnbc73cj06j0-a.oregon-postgres.render.com/zuasoko_db",
  ssl: { rejectUnauthorized: false },
});

async function checkProducts() {
  try {
    console.log("🔍 Checking products in database...");
    
    const result = await pool.query("SELECT id, name, category, price_per_unit, stock_quantity FROM products ORDER BY id");
    
    console.log("📦 Products found:", result.rows.length);
    console.table(result.rows);
    
    if (result.rows.length === 0) {
      console.log("🚀 No products found, let's add some...");
      
      await pool.query(`
        INSERT INTO products (name, description, category, price_per_unit, unit, stock_quantity, is_active, images) VALUES
        ('Fresh Tomatoes', 'Organic red tomatoes, Grade A quality. Perfect for salads and cooking.', 'Vegetables', 130.00, 'kg', 85, true, '{"https://images.unsplash.com/photo-1546470427-e212b9d56085"}'),
        ('Sweet Potatoes', 'Fresh sweet potatoes, rich in nutrients and vitamins.', 'Root Vegetables', 80.00, 'kg', 45, true, '{"https://images.unsplash.com/photo-1518977676601-b53f82aba655"}')
        ON CONFLICT DO NOTHING
      `);
      
      console.log("✅ Sample products added");
      
      const newResult = await pool.query("SELECT id, name, category, price_per_unit, stock_quantity FROM products ORDER BY id");
      console.table(newResult.rows);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

checkProducts();
