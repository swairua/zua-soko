#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function checkDirectory(dir) {
  const files = fs.readdirSync(dir);
  const issues = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      issues.push(...checkDirectory(filePath));
    } else if (
      file.endsWith(".js") ||
      file.endsWith(".ts") ||
      file.endsWith(".html")
    ) {
      const content = fs.readFileSync(filePath, "utf8");

      // Check for Vite client references
      const vitePatterns = [
        "@vite/client",
        "vite/client",
        "vite/dist/client",
        "import.meta.hot",
        "__vite_plugin_react_preamble_installed__",
        "waitForSuccessfulPing",
        "vite:ws:",
        "__HMR_PORT__",
        "__HMR_PROTOCOL__",
        "HMRContext",
        "createHotContext",
        "Cannot access 'HMRContext' before initialization",
      ];

      for (const pattern of vitePatterns) {
        if (content.includes(pattern)) {
          issues.push(`${filePath}: Contains "${pattern}"`);
        }
      }
    }
  }

  return issues;
}

console.log("🔍 Verifying production build for Vite client code...");

const distPath = path.join(__dirname, "dist");
if (!fs.existsSync(distPath)) {
  console.error("❌ dist/ directory not found. Run build first.");
  process.exit(1);
}

const issues = checkDirectory(distPath);

if (issues.length > 0) {
  console.error("❌ Found Vite client code in production build:");
  issues.forEach((issue) => console.error(`  - ${issue}`));
  process.exit(1);
} else {
  console.log("✅ Production build verified: No Vite client code found");
  console.log("🚀 Build is ready for deployment");
}
