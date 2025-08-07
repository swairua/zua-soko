const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

async function testAdminAPI() {
  try {
    console.log('🔗 Testing API connection to:', API_BASE);
    
    // Test 1: Check status endpoint
    console.log('\n📊 Testing status endpoint...');
    const statusResponse = await axios.get(`${API_BASE}/status`);
    console.log('✅ Status:', statusResponse.data);
    
    // Test 2: Try admin login
    console.log('\n🔐 Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      phone: 'admin',
      password: 'admin'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;
      
      // Test 3: Try admin analytics endpoint with token
      console.log('\n📈 Testing admin analytics endpoint...');
      const analyticsResponse = await axios.get(`${API_BASE}/admin/analytics/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Analytics data:', analyticsResponse.data);
      
      // Test 4: Try admin activity endpoint with token
      console.log('\n📋 Testing admin activity endpoint...');
      const activityResponse = await axios.get(`${API_BASE}/admin/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Activity data:', activityResponse.data);
      
    } else {
      console.log('❌ Admin login failed - no token received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testAdminAPI();
