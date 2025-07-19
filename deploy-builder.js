#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting Builder.io deployment...");

// Configuration
const config = {
  builderApiKey: process.env.VITE_BUILDER_PUBLIC_API_KEY,
  buildDir: "./frontend/dist",
  apiUrl: process.env.VITE_API_URL || "/api",
  customDomain: process.env.BUILDER_CUSTOM_DOMAIN,
};

// Validate configuration
if (!config.builderApiKey || config.builderApiKey === "your-api-key-here") {
  console.error("❌ Error: VITE_BUILDER_PUBLIC_API_KEY not set");
  console.log("Get your API key from: https://builder.io/account/organization");
  process.exit(1);
}

async function deployToBuilder() {
  try {
    console.log("📦 Building frontend application...");

    // Install dependencies
    console.log("📥 Installing dependencies...");
    execSync("npm install", { cwd: "./frontend", stdio: "inherit" });

    // Build the application
    console.log("🔨 Building production bundle...");
    execSync("npm run build:prod", { cwd: "./frontend", stdio: "inherit" });

    // Verify build output
    if (!fs.existsSync(config.buildDir)) {
      throw new Error(`Build directory not found: ${config.buildDir}`);
    }

    console.log("✅ Frontend build complete");

    // Create Builder.io deployment manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      version: require("./package.json").version,
      apiKey: config.builderApiKey,
      customDomain: config.customDomain,
      apiRoutes: [
        "/api/auth/login",
        "/api/auth/register",
        "/api/marketplace/products",
        "/api/marketplace/categories",
        "/api/marketplace/counties",
        "/api/status",
        "/api/health",
      ],
      environment: {
        VITE_BUILDER_PUBLIC_API_KEY: config.builderApiKey,
        VITE_API_URL: config.apiUrl,
        VITE_APP_NAME: "Zuasoko Agricultural Platform",
        VITE_NODE_ENV: "production",
      },
    };

    // Write deployment manifest
    fs.writeFileSync(
      path.join(config.buildDir, "builder-manifest.json"),
      JSON.stringify(manifest, null, 2),
    );

    console.log("📄 Created deployment manifest");

    // Create Builder.io configuration file
    const builderConfig = {
      apiKey: config.builderApiKey,
      models: ["page", "section"],
      routes: [
        {
          path: "/",
          component: "HomePage",
        },
        {
          path: "/marketplace",
          component: "MarketplacePage",
        },
        {
          path: "/builder/*",
          component: "BuilderPage",
        },
      ],
      customComponents: ["HeroSection", "FeatureCard", "DatabaseStatus"],
    };

    fs.writeFileSync(
      path.join(config.buildDir, "builder.config.json"),
      JSON.stringify(builderConfig, null, 2),
    );

    console.log("⚙️ Created Builder.io configuration");

    // Copy API configuration
    if (fs.existsSync("./api")) {
      console.log("📋 Copying API configuration...");

      // Create api directory in build
      const apiBuildDir = path.join(config.buildDir, "api");
      if (!fs.existsSync(apiBuildDir)) {
        fs.mkdirSync(apiBuildDir, { recursive: true });
      }

      // Copy API files
      const apiFiles = ["index.js", "package.json"];
      apiFiles.forEach((file) => {
        const srcPath = path.join("./api", file);
        const destPath = path.join(apiBuildDir, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`  ✅ Copied ${file}`);
        }
      });
    }

    console.log("🎉 Builder.io deployment prepared successfully!");
    console.log("");
    console.log("📋 Next steps:");
    console.log(
      "1. Upload the contents of ./frontend/dist to Builder.io hosting",
    );
    console.log("2. Configure your custom domain in Builder.io dashboard");
    console.log("3. Set up API routes in Builder.io edge functions");
    console.log("4. Test your deployment at your Builder.io URL");
    console.log("");
    console.log("🌐 Builder.io Dashboard: https://builder.io/content");
    console.log(`🔑 API Key: ${config.builderApiKey.substring(0, 8)}...`);

    if (config.customDomain) {
      console.log(`🏷️ Custom Domain: ${config.customDomain}`);
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

// Run deployment
deployToBuilder();
