const { Pool } = require('pg');
const axios = require('axios');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    "postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

// Test database connection
const testDatabase = async () => {
  try {
    console.log('🔗 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connected successfully');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].version.split(' ')[0]}`);
    
    // Test basic tables
    const tables = ['users', 'products', 'orders', 'categories', 'counties'];
    for (const table of tables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   Table ${table}: ${count.rows[0].count} records`);
      } catch (error) {
        console.log(`   Table ${table}: ❌ ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Test API endpoints
const testAPI = async (baseUrl = 'http://localhost:5004') => {
  try {
    console.log(`\n🔗 Testing API endpoints on ${baseUrl}...`);
    
    const endpoints = [
      { path: '/api/health', method: 'GET', description: 'Health check' },
      { path: '/api/marketplace/products', method: 'GET', description: 'Marketplace products' },
      { path: '/api/marketplace/categories', method: 'GET', description: 'Product categories' },
      { path: '/api/marketplace/counties', method: 'GET', description: 'Counties list' }
    ];
    
    let passedTests = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${baseUrl}${endpoint.path}`,
          timeout: 10000
        });
        
        if (response.status === 200) {
          console.log(`   ✅ ${endpoint.description}: ${response.status}`);
          passedTests++;
        } else {
          console.log(`   ⚠️ ${endpoint.description}: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.description}: ${error.response?.status || error.message}`);
      }
    }
    
    console.log(`\n📊 API Tests: ${passedTests}/${endpoints.length} passed`);
    return passedTests === endpoints.length;
    
  } catch (error) {
    console.error('❌ API testing failed:', error.message);
    return false;
  }
};

// Test authentication with demo users
const testAuthentication = async (baseUrl = 'http://localhost:5004') => {
  try {
    console.log(`\n🔐 Testing authentication on ${baseUrl}...`);
    
    const demoUsers = [
      { phone: '+254712345678', password: 'password123', role: 'ADMIN' },
      { phone: '+254723456789', password: 'farmer123', role: 'FARMER' },
      { phone: '+254734567890', password: 'farmer123', role: 'FARMER' },
      { phone: '+254767890123', password: 'customer123', role: 'CUSTOMER' }
    ];
    
    let successfulLogins = 0;
    
    for (const user of demoUsers) {
      try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
          phone: user.phone,
          password: user.password
        }, { timeout: 10000 });
        
        if (response.data.success && response.data.token) {
          console.log(`   ✅ ${user.role} login successful (${user.phone})`);
          successfulLogins++;
        } else {
          console.log(`   ❌ ${user.role} login failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ ${user.role} login error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(`\n📊 Auth Tests: ${successfulLogins}/${demoUsers.length} successful`);
    return successfulLogins > 0; // At least one login should work
    
  } catch (error) {
    console.error('❌ Authentication testing failed:', error.message);
    return false;
  }
};

// Main verification function
const verifyDeployment = async () => {
  console.log('🚀 Zuasoko Deployment Verification');
  console.log('='.repeat(50));
  console.log(`📅 Time: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  
  const results = {
    database: false,
    api: false,
    auth: false
  };
  
  // Test database
  results.database = await testDatabase();
  
  // Test API (try both local and production if possible)
  results.api = await testAPI();
  
  // Test authentication
  results.auth = await testAuthentication();
  
  // Summary
  console.log('\n🎯 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Database Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Deployment is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review and fix issues before deployment.');
  }
  
  console.log('='.repeat(50));
  
  return allPassed;
};

// Clean up and exit
const cleanup = async () => {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

// Run verification if called directly
if (require.main === module) {
  verifyDeployment()
    .then(success => {
      cleanup().then(() => {
        process.exit(success ? 0 : 1);
      });
    })
    .catch(error => {
      console.error('Verification failed:', error);
      cleanup().then(() => {
        process.exit(1);
      });
    });
}

module.exports = { verifyDeployment, testDatabase, testAPI, testAuthentication };
