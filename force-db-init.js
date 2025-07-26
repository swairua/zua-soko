// Simple script to force database initialization
console.log("🚀 Force database initialization...");

try {
  const { initializeDatabase } = require('./backend/src/database/db.js');
  
  (async () => {
    try {
      console.log("📦 Starting database initialization...");
      await initializeDatabase();
      console.log("✅ Database initialization complete!");
      process.exit(0);
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      process.exit(1);
    }
  })();
} catch (error) {
  console.error("❌ Error loading database module:", error);
  process.exit(1);
}
