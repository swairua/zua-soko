const axios = require('axios');

async function testLogin() {
  try {
    console.log("🌱 Seeding admin user...");
    
    // First seed the admin user
    const seedResponse = await axios.post('http://localhost:5003/api/debug/seed-admin');
    console.log("✅ Seed response:", seedResponse.data);
    
    console.log("\n🔐 Testing login...");
    
    // Test admin login
    const adminLogin = await axios.post('http://localhost:5003/api/auth/login', {
      phone: '+254712345678',
      password: 'password123'
    });
    console.log("✅ Admin login successful:", adminLogin.data.user);
    
    // Test farmer login
    const farmerLogin = await axios.post('http://localhost:5003/api/auth/login', {
      phone: '+254734567890', 
      password: 'password123'
    });
    console.log("✅ Farmer login successful:", farmerLogin.data.user);
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testLogin();
