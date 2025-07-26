const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const http = require("http");

// Load environment variables
require('dotenv').config();

console.log("🔍 Zuasoko Platform - System Verification");
console.log("=========================================\n");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "zuasoko_db",
  user: process.env.DB_USER || "zuasoko_user",
  password: process.env.DB_PASSWORD || "password",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
};

async function verifySystem() {
  const results = {
    environment: false,
    database: false,
    tables: false,
    data: false,
    api: false,
    frontend: false,
  };

  try {
    // 1. Verify Environment Variables
    console.log("1️⃣ Checking Environment Variables...");
    const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
    
    if (missingEnvVars.length === 0) {
      console.log("   ✅ All required environment variables are set");
      results.environment = true;
    } else {
      console.log("   ❌ Missing environment variables:", missingEnvVars.join(', '));
      console.log("   💡 Copy .env.localhost to .env and fill in the values");
    }

    // 2. Verify Database Connection
    console.log("\n2️⃣ Testing Database Connection...");
    const pool = new Pool(dbConfig);
    
    try {
      const testResult = await pool.query("SELECT NOW() as current_time, version() as db_version");
      console.log("   ✅ Database connection successful");
      console.log(`   📅 Database time: ${testResult.rows[0].current_time}`);
      console.log(`   🗄️ PostgreSQL version: ${testResult.rows[0].db_version.split(',')[0]}`);
      results.database = true;

      // 3. Verify Database Tables
      console.log("\n3️⃣ Checking Database Tables...");
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      const expectedTables = [
        'users', 'farmer_categories_list', 'farmer_categories', 
        'products', 'consignments', 'orders', 'wallets', 
        'warehouses', 'notifications'
      ];

      const existingTables = tablesResult.rows.map(row => row.table_name);
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));

      if (missingTables.length === 0) {
        console.log("   ✅ All required tables exist");
        console.log(`   📋 Found ${existingTables.length} tables:`, existingTables.join(', '));
        results.tables = true;
      } else {
        console.log("   ❌ Missing tables:", missingTables.join(', '));
        console.log("   💡 Run 'npm run localhost:setup' to create missing tables");
      }

      // 4. Verify Sample Data
      console.log("\n4️⃣ Checking Sample Data...");
      const userCount = await pool.query("SELECT COUNT(*) FROM users");
      const productCount = await pool.query("SELECT COUNT(*) FROM products");
      const categoryCount = await pool.query("SELECT COUNT(*) FROM farmer_categories_list");

      console.log(`   👥 Users: ${userCount.rows[0].count}`);
      console.log(`   📦 Products: ${productCount.rows[0].count}`);
      console.log(`   📂 Categories: ${categoryCount.rows[0].count}`);

      if (parseInt(userCount.rows[0].count) > 0) {
        console.log("   ✅ Demo data exists");
        results.data = true;

        // Show demo credentials
        const demoUsers = await pool.query(`
          SELECT first_name, last_name, role, phone 
          FROM users 
          WHERE phone IN ('+254712345678', '+254734567890', '+254756789012', '+254778901234')
          ORDER BY role
        `);

        console.log("   🔑 Demo credentials:");
        demoUsers.rows.forEach((user) => {
          console.log(`      ${user.role}: ${user.phone} / password123`);
        });
      } else {
        console.log("   ❌ No demo data found");
        console.log("   💡 Run 'npm run localhost:setup' to create demo data");
      }

      await pool.end();
    } catch (dbError) {
      console.log(`   ❌ Database connection failed: ${dbError.message}`);
      console.log("   💡 Check if PostgreSQL is running and credentials are correct");
    }

    // 5. Verify Backend API (if running)
    console.log("\n5️⃣ Testing Backend API...");
    try {
      const apiResult = await testHttpEndpoint('http://localhost:5002/');
      if (apiResult) {
        console.log("   ✅ Backend API is running on port 5002");
        results.api = true;

        // Test login endpoint
        try {
          const loginResult = await testApiLogin();
          if (loginResult) {
            console.log("   ✅ Login endpoint working");
          } else {
            console.log("   ⚠️ Login endpoint has issues");
          }
        } catch (loginError) {
          console.log("   ⚠️ Could not test login endpoint");
        }
      } else {
        console.log("   ❌ Backend API not running");
        console.log("   💡 Start with 'npm run backend:dev' or 'node server.js'");
      }
    } catch (apiError) {
      console.log("   ❌ Could not connect to backend API");
      console.log("   💡 Start the backend server first");
    }

    // 6. Verify Frontend (if running)
    console.log("\n6️⃣ Testing Frontend Application...");
    try {
      const frontendResult = await testHttpEndpoint('http://localhost:5173/');
      if (frontendResult) {
        console.log("   ✅ Frontend application is running on port 5173");
        results.frontend = true;
      } else {
        console.log("   ❌ Frontend application not running");
        console.log("   💡 Start with 'cd frontend && npm run dev'");
      }
    } catch (frontendError) {
      console.log("   ❌ Could not connect to frontend application");
      console.log("   💡 Start the frontend development server");
    }

    // 7. File System Checks
    console.log("\n7️⃣ Checking Project Structure...");
    const criticalFiles = [
      'server.js',
      'backend/src/database/schema.sql',
      'backend/src/database/db.js',
      'frontend/package.json',
      'frontend/src/main.tsx',
    ];

    let allFilesExist = true;
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} missing`);
        allFilesExist = false;
      }
    });

    if (allFilesExist) {
      console.log("   ✅ All critical files present");
    }

    // Summary
    console.log("\n📊 Verification Summary");
    console.log("=======================");
    console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`);
    console.log(`Database Connection:   ${results.database ? '✅' : '❌'}`);
    console.log(`Database Tables:       ${results.tables ? '✅' : '❌'}`);
    console.log(`Sample Data:           ${results.data ? '✅' : '❌'}`);
    console.log(`Backend API:           ${results.api ? '✅' : '❌'}`);
    console.log(`Frontend App:          ${results.frontend ? '✅' : '❌'}`);

    const successCount = Object.values(results).filter(Boolean).length;
    const totalChecks = Object.keys(results).length;

    console.log(`\n🎯 Overall Score: ${successCount}/${totalChecks} checks passed\n`);

    if (successCount === totalChecks) {
      console.log("🎉 System is fully operational!");
      console.log("🚀 You can access the application at http://localhost:5173");
    } else {
      console.log("⚠️ Some components need attention. Follow the suggestions above.");
      
      if (!results.environment) {
        console.log("\n🔧 Quick Fix - Environment Setup:");
        console.log("   cp .env.localhost .env");
        console.log("   # Edit .env with your database credentials");
      }
      
      if (!results.database || !results.tables || !results.data) {
        console.log("\n🔧 Quick Fix - Database Setup:");
        console.log("   npm run localhost:setup");
      }
      
      if (!results.api) {
        console.log("\n🔧 Quick Fix - Start Backend:");
        console.log("   npm run backend:dev");
      }
      
      if (!results.frontend) {
        console.log("\n🔧 Quick Fix - Start Frontend:");
        console.log("   cd frontend && npm run dev");
      }
    }

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

async function testHttpEndpoint(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      resolve(response.statusCode === 200);
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.setTimeout(3000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function testApiLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      phone: '+254712345678',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = http.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.success === true);
        } catch {
          resolve(false);
        }
      });
    });

    request.on('error', () => {
      resolve(false);
    });

    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });

    request.write(postData);
    request.end();
  });
}

// Run verification
if (require.main === module) {
  verifySystem();
}

module.exports = { verifySystem };
