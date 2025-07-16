#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying build structure for Vercel...");

const checks = [
  {
    name: "Frontend directory",
    path: "./frontend",
    required: true,
  },
  {
    name: "API directory",
    path: "./api",
    required: true,
  },
  {
    name: "Frontend package.json",
    path: "./frontend/package.json",
    required: true,
  },
  {
    name: "API package.json",
    path: "./api/package.json",
    required: true,
  },
  {
    name: "Vercel config",
    path: "./vercel.json",
    required: true,
  },
  {
    name: "Build script",
    path: "./vercel-build.js",
    required: true,
  },
];

let allGood = true;

checks.forEach((check) => {
  const exists = fs.existsSync(check.path);
  const status = exists ? "✅" : check.required ? "❌" : "⚠️";
  console.log(`${status} ${check.name}: ${check.path}`);

  if (check.required && !exists) {
    allGood = false;
  }
});

if (allGood) {
  console.log("\n✅ All required files present for Vercel deployment");
} else {
  console.log("\n❌ Some required files are missing");
  process.exit(1);
}
