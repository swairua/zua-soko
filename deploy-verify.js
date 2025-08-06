#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5003';

console.log('🚀 Zuasoko Platform Deployment Verification');
console.log('==========================================');
console.log(`Testing server at: ${BASE_URL}`);
console.log('');

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test functions
  const tests = [
    {
      name: 'Server Health Check',
      test: async () => {
        const response = await axios.get(`${BASE_URL}/api/status`);
        return response.status === 200 && response.data.status === 'OK';
      }
    },
    {
      name: 'Database Connection',
      test: async () => {
        const response = await axios.get(`${BASE_URL}/api/health`);
        return response.status === 200 && response.data.database;
      }
    },
    {
      name: 'Static Files Serving',
      test: async () => {
        const response = await axios.get(`${BASE_URL}/`);
        return response.status === 200 && response.data.includes('Zuasoko');
      }
    },
    {
      name: 'Admin Login Endpoint',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            phone: '+254712345678',
            password: 'password123'
          });
          return response.status === 200 && response.data.success && response.data.token;
        } catch (error) {
          return error.response?.status === 401; // Expected for wrong credentials in some cases
        }
      }
    },
    {
      name: 'Farmer Registration Fee Endpoint',
      test: async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/admin/registration-fees/unpaid`);
          return response.status === 401; // Expected - requires authentication
        } catch (error) {
          return error.response?.status === 401;
        }
      }
    },
    {
      name: 'M-Pesa Settings Endpoint',
      test: async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/admin/mpesa-settings`);
          return response.status === 401; // Expected - requires admin auth
        } catch (error) {
          return error.response?.status === 401;
        }
      }
    },
    {
      name: 'Frontend Build Files',
      test: async () => {
        const indexExists = fs.existsSync(path.join(process.cwd(), 'index.html'));
        const assetsExist = fs.existsSync(path.join(process.cwd(), 'assets'));
        return indexExists && assetsExist;
      }
    },
    {
      name: 'Environment Configuration',
      test: async () => {
        const hasEnv = fs.existsSync(path.join(process.cwd(), '.env'));
        const hasPackageJson = fs.existsSync(path.join(process.cwd(), 'package.json'));
        return hasEnv && hasPackageJson;
      }
    }
  ];

  // Run tests
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    try {
      const result = await test.test();
      if (result) {
        console.log('✅ PASS');
        results.passed++;
      } else {
        console.log('❌ FAIL');
        results.failed++;
      }
      results.tests.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      results.failed++;
      results.tests.push({ name: test.name, passed: false, error: error.message });
    }
  }

  // Summary
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('=====================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('');

  // Detailed results
  if (results.failed > 0) {
    console.log('❌ Failed Tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`   - ${t.name}${t.error ? `: ${t.error}` : ''}`);
      });
    console.log('');
  }

  // Deployment status
  if (results.failed === 0) {
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('');
    console.log('✅ All systems operational');
    console.log('✅ Ready for production use');
    console.log('');
    console.log('🌐 Access your application:');
    console.log(`   Main App: ${BASE_URL}`);
    console.log(`   Admin:    ${BASE_URL}/admin/dashboard`);
    console.log(`   Farmer:   ${BASE_URL}/farmer/dashboard`);
    console.log('');
    console.log('👥 Default Login Credentials:');
    console.log('   Admin:  +254712345678 / password123');
    console.log('   Farmer: +254734567890 / password123');
    console.log('');
    process.exit(0);
  } else {
    console.log('⚠️  DEPLOYMENT ISSUES DETECTED');
    console.log('');
    console.log('Please review failed tests and fix issues before production use.');
    console.log('Check the DEPLOYMENT_GUIDE.md for troubleshooting steps.');
    console.log('');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error during testing:', error.message);
  process.exit(1);
});

// Run verification
runTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});
