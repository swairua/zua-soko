#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Building static site for Vercel...");

try {
  // Change to frontend directory and build
  process.chdir("frontend");

  console.log("📦 Installing frontend dependencies...");
  execSync("npm install", { stdio: "inherit" });

  console.log("🔨 Building frontend...");
  execSync("npm run build:prod", { stdio: "inherit" });

  // Copy dist contents to root for Vercel
  console.log("📋 Copying build files to root...");
  const distPath = path.join(process.cwd(), "dist");
  const rootPath = path.join(process.cwd(), "..");

  if (fs.existsSync(distPath)) {
    // Copy all files from dist to root
    const files = fs.readdirSync(distPath);
    files.forEach((file) => {
      const srcPath = path.join(distPath, file);
      const destPath = path.join(rootPath, file);

      if (fs.statSync(srcPath).isDirectory()) {
        // Copy directory recursively
        execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: "inherit" });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
    });

    console.log("✅ Build files copied to root");
  }

  // Install API dependencies in root for Vercel functions
  process.chdir("..");
  console.log("📦 Installing API dependencies...");
  execSync("cd api && npm install", { stdio: "inherit" });

  console.log("✅ Static site build completed!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
