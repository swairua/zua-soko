// Test script to debug admin API endpoints
const app = require('./api/index.js');
const port = 5004;

// Start the server
app.listen(port, () => {
  console.log(`🚀 Test API server running on port ${port}`);
  console.log(`📋 Test endpoints:`);
  console.log(`   POST http://localhost:${port}/api/auth/login`);
  console.log(`   GET  http://localhost:${port}/api/admin/users`);
  console.log(`🔐 Admin credentials: phone="admin", password="admin"`);
});
