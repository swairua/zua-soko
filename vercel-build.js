#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Vercel build process...");
console.log("📍 Current working directory:", process.cwd());
console.log(
  "📁 Directory contents:",
  fs.readdirSync(".").slice(0, 10).join(", "),
  "...",
);

try {
  // Ensure we're in the right directory
  const rootDir = process.cwd();
  const frontendPath = path.join(rootDir, "frontend");
  const apiPath = path.join(rootDir, "api");

  console.log("🔍 Checking directories...");
  console.log("  Root:", rootDir);
  console.log("  Frontend exists:", fs.existsSync(frontendPath));
  console.log("  API exists:", fs.existsSync(apiPath));

  if (!fs.existsSync(frontendPath)) {
    throw new Error(
      "Frontend directory not found. Available directories: " +
        fs
          .readdirSync(".")
          .filter((d) => fs.statSync(d).isDirectory())
          .join(", "),
    );
  }

  // Install API dependencies with absolute paths
  console.log("📦 Installing API dependencies...");
  execSync("npm install --production", {
    cwd: apiPath,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  // Install frontend dependencies with absolute paths
  console.log("📦 Installing frontend dependencies...");
  execSync("npm install", {
    cwd: frontendPath,
    stdio: "inherit",
  });

  // Build the frontend with absolute paths
  console.log("🔨 Building frontend...");
  execSync("npm run build:prod", {
    cwd: frontendPath,
    stdio: "inherit",
  });

  // Fix HTML filename
  const distPath = path.join(frontendPath, "dist");
  const prodHtmlPath = path.join(distPath, "index.production.html");
  const indexHtmlPath = path.join(distPath, "index.html");

  if (fs.existsSync(prodHtmlPath)) {
    console.log("🔧 Renaming production HTML file...");
    fs.copyFileSync(prodHtmlPath, indexHtmlPath);
    fs.unlinkSync(prodHtmlPath);
    console.log("✅ HTML file renamed successfully");
  }

  // Verify build output
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log("✅ Build output verified:", files.join(", "));

    // Ensure index.html exists
    if (!files.includes("index.html")) {
      throw new Error("index.html not found in build output");
    }
  } else {
    throw new Error("Build output directory not found at: " + distPath);
  }

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  console.error("🏠 Working directory:", process.cwd());
  if (fs.existsSync(".")) {
    console.error(
      "📁 Available files/dirs:",
      fs.readdirSync(".").slice(0, 20).join(", "),
    );
  }
  process.exit(1);
}
