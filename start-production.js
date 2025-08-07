#!/usr/bin/env node

// Production start script for Zuasoko
console.log('🚀 Starting Zuasoko in production mode...');

// Set environment variables for production
process.env.NODE_ENV = 'production';

// Set default port if not provided
if (!process.env.PORT) {
  process.env.PORT = '3000';
}

// Set default database URL if not provided (for development)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
}

console.log(`📊 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);

// Start the server
require('./server.js');
