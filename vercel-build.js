#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Vercel build process...");

try {
  // Install API dependencies first
  console.log("📦 Installing API dependencies...");
  execSync("cd api && npm install", { stdio: "inherit" });

  // Install frontend dependencies
  console.log("📦 Installing frontend dependencies...");
  execSync("cd frontend && npm install", { stdio: "inherit" });

  // Build the frontend
  console.log("🔨 Building frontend...");
  execSync("cd frontend && npm run build:prod", { stdio: "inherit" });

  // Fix HTML filename for Vercel
  const prodHtmlPath = path.join(
    __dirname,
    "frontend",
    "dist",
    "index.production.html",
  );
  const indexHtmlPath = path.join(__dirname, "frontend", "dist", "index.html");

  if (fs.existsSync(prodHtmlPath)) {
    console.log("🔧 Renaming production HTML file...");
    fs.copyFileSync(prodHtmlPath, indexHtmlPath);
    fs.unlinkSync(prodHtmlPath);
  }

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
