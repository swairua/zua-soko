#!/bin/bash

# Migration Script: In-Memory to Real Database
# This script safely migrates from in-memory simulation to PostgreSQL

echo "🔄 Migrating Zuasoko from In-Memory to Real Database"
echo "=================================================="

# Backup current server
echo "📋 Creating backup of current server..."
cp backend/src/server.js backend/src/server.js.inmemory.backup

# Replace with database-integrated server
echo "🔄 Updating server with database integration..."
cp backend/src/server.js.new backend/src/server.js

# Create environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your database credentials"
else
    echo "ℹ️  Environment file already exists"
fi

echo "✅ Migration completed!"
echo ""
echo "🗄️  Database Setup Required:"
echo "1. Install PostgreSQL if not already installed"
echo "2. Create database: CREATE DATABASE zuasoko_db;"
echo "3. Create user: CREATE USER zuasoko_user WITH PASSWORD 'your_password';"
echo "4. Grant privileges: GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;"
echo "5. Update backend/.env with your database credentials"
echo ""
echo "🚀 To start the new database-integrated server:"
echo "   cd backend && npm start"
echo ""
echo "📝 The server will automatically:"
echo "   - Initialize database schema"
echo "   - Create demo users"
echo "   - Set up all tables and relationships"
