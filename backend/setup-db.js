const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Zuasoko database...\n");

try {
  // Remove existing database if it exists
  const dbPath = path.join(__dirname, "prisma", "dev.db");
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("✅ Removed existing database");
  }

  // Generate Prisma client
  console.log("📦 Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: __dirname });

  // Push database schema
  console.log("🏗️  Creating database schema...");
  execSync("npx prisma db push", { stdio: "inherit", cwd: __dirname });

  // Run seed
  console.log("🌱 Seeding database with sample data...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", cwd: __dirname });

  console.log("\n✅ Database setup complete!");
  console.log("\n🎉 You can now start the backend server with: npm run dev");
} catch (error) {
  console.error("\n❌ Database setup failed:", error.message);
  process.exit(1);
}
