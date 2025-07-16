#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Vercel build process...");

try {
  // Create temporary backend/api directory if it doesn't exist to prevent the error
  const backendApiPath = path.join(__dirname, "backend", "api");
  if (!fs.existsSync(backendApiPath)) {
    console.log("📁 Creating temporary backend/api directory...");
    fs.mkdirSync(backendApiPath, { recursive: true });

    // Create a minimal package.json to prevent npm install errors
    const tempPackageJson = {
      name: "temp-api",
      version: "1.0.0",
      private: true,
      dependencies: {},
    };
    fs.writeFileSync(
      path.join(backendApiPath, "package.json"),
      JSON.stringify(tempPackageJson, null, 2),
    );
    console.log("✅ Temporary backend/api created");
  }

  // Install root dependencies
  console.log("📦 Installing root dependencies...");
  execSync("npm install", { stdio: "inherit" });

  // Install frontend dependencies
  console.log("📦 Installing frontend dependencies...");
  execSync("cd frontend && npm install", { stdio: "inherit" });

  // Install API dependencies (this will now work with our temp directory)
  console.log("📦 Installing API dependencies...");
  execSync("cd api && npm install", { stdio: "inherit" });

  // Build the frontend
  console.log("🔨 Building frontend...");
  execSync("cd frontend && npm run build:prod", { stdio: "inherit" });

  // Clean up temporary directory
  if (fs.existsSync(backendApiPath)) {
    console.log("🧹 Cleaning up temporary files...");
    fs.rmSync(backendApiPath, { recursive: true, force: true });
  }

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
