#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Vercel build process...");
console.log("📍 Current working directory:", process.cwd());
console.log("📁 Directory contents:", fs.readdirSync(".").join(", "));

try {
  // Check if required directories exist
  const frontendPath = path.join(process.cwd(), "frontend");
  const apiPath = path.join(process.cwd(), "api");

  console.log("🔍 Checking directories...");
  console.log("  Frontend exists:", fs.existsSync(frontendPath));
  console.log("  API exists:", fs.existsSync(apiPath));

  if (!fs.existsSync(frontendPath)) {
    throw new Error("Frontend directory not found at: " + frontendPath);
  }

  if (!fs.existsSync(apiPath)) {
    throw new Error("API directory not found at: " + apiPath);
  }

  // Install API dependencies first
  console.log("📦 Installing API dependencies...");
  process.chdir(apiPath);
  execSync("npm install --production", { stdio: "inherit" });

  // Go back to root
  process.chdir("..");

  // Install frontend dependencies
  console.log("📦 Installing frontend dependencies...");
  process.chdir(frontendPath);
  execSync("npm install", { stdio: "inherit" });

  // Build the frontend
  console.log("🔨 Building frontend...");
  execSync("npm run build:prod", { stdio: "inherit" });

  // Go back to root
  process.chdir("..");

  // Fix HTML filename for Vercel
  const prodHtmlPath = path.join(frontendPath, "dist", "index.production.html");
  const indexHtmlPath = path.join(frontendPath, "dist", "index.html");

  if (fs.existsSync(prodHtmlPath)) {
    console.log("🔧 Renaming production HTML file...");
    fs.copyFileSync(prodHtmlPath, indexHtmlPath);
    fs.unlinkSync(prodHtmlPath);
  }

  // Verify build output
  const distPath = path.join(frontendPath, "dist");
  if (fs.existsSync(distPath)) {
    console.log(
      "✅ Build output verified:",
      fs.readdirSync(distPath).join(", "),
    );
  } else {
    throw new Error("Build output directory not found");
  }

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  console.error("📍 Current directory when error occurred:", process.cwd());
  process.exit(1);
}
