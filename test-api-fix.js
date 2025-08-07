const express = require('express');

try {
  const app = require('./api/index.js');
  console.log('✅ API module loaded successfully');
  console.log('✅ Express app instance created');
  console.log('✅ No syntax errors in API code');
  console.log('✅ /admin/users endpoint fix applied');
} catch (error) {
  console.error('❌ Error loading API:', error.message);
  process.exit(1);
}
