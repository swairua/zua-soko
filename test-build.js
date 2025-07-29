#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing production build process...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('frontend/dist')) {
    fs.rmSync('frontend/dist', { recursive: true });
  }
  if (fs.existsSync('index.html')) {
    fs.unlinkSync('index.html');
  }

  // Run the build command
  console.log('🏗️ Running build command...');
  execSync('cd frontend && npm run build:prod', { stdio: 'inherit' });

  // Check if dist folder was created
  if (!fs.existsSync('frontend/dist')) {
    throw new Error('❌ dist folder was not created');
  }

  // Check if index.html exists in dist
  if (!fs.existsSync('frontend/dist/index.html')) {
    throw new Error('❌ index.html was not generated in dist folder');
  }

  // List dist contents
  console.log('📁 Contents of frontend/dist:');
  const distContents = fs.readdirSync('frontend/dist');
  distContents.forEach(file => {
    console.log(`   - ${file}`);
  });

  // Copy files to root
  console.log('📋 Copying files to root...');
  execSync('cp -r frontend/dist/* ./', { stdio: 'inherit' });

  // Verify root index.html
  if (!fs.existsSync('index.html')) {
    throw new Error('❌ index.html was not copied to root');
  }

  console.log('✅ Build test successful!');
  console.log('🎉 Your build process is working correctly for Vercel deployment');

} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
}
