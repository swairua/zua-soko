#!/usr/bin/env node

const fs = require("fs");

console.log("🧹 Verifying clean project structure...");

const conflictingFiles = [
  "next.config.js",
  "next-env.d.ts",
  "tsconfig.json",
  "postcss.config.js",
  "tailwind.config.js",
  "app/layout.tsx",
  "app/page.tsx",
  "pages/index.js",
  "nuxt.config.js",
];

const conflictingDirs = [
  "app",
  "pages",
  "components",
  "lib",
  "contexts",
  "public",
];

let conflicts = 0;

console.log("\n📁 Checking for conflicting files:");
conflictingFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8").trim();
    if (content.length > 0) {
      console.log(`❌ ${file} (has content)`);
      conflicts++;
    } else {
      console.log(`✅ ${file} (empty)`);
    }
  } else {
    console.log(`✅ ${file} (not found)`);
  }
});

console.log("\n📂 Checking for conflicting directories:");
conflictingDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => {
      const path = `${dir}/${f}`;
      try {
        return (
          fs.statSync(path).isFile() &&
          fs.readFileSync(path, "utf8").trim().length > 0
        );
      } catch {
        return false;
      }
    });
    if (files.length > 0) {
      console.log(`❌ ${dir}/ (${files.length} files with content)`);
      conflicts++;
    } else {
      console.log(`✅ ${dir}/ (empty or no content files)`);
    }
  } else {
    console.log(`✅ ${dir}/ (not found)`);
  }
});

console.log("\n📋 Required files:");
const required = ["vercel.json", "vercel-build.js", "frontend/", "api/"];
required.forEach((item) => {
  const exists = fs.existsSync(item);
  console.log(`${exists ? "✅" : "❌"} ${item}`);
  if (!exists) conflicts++;
});

console.log(
  `\n${conflicts === 0 ? "✅" : "❌"} Clean check: ${conflicts} conflicts found`,
);

if (conflicts === 0) {
  console.log("\n🎉 Project is clean for Vercel deployment!");
} else {
  console.log("\n⚠️  Please resolve conflicts before deploying to Vercel");
}
