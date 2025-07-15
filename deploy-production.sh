#!/bin/bash

echo "🚀 Deploying Zuasoko to production..."

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*server.js" || true
pkill -f "npm.*dev" || true

# Create database schema if not exists
echo "🗄️ Setting up database..."
echo "Checking if database tables exist..."

# Test database connection
psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    
    # Check if tables exist
    TABLE_COUNT=$(psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs)
    
    if [ "$TABLE_COUNT" -eq "0" ]; then
        echo "📋 Creating database schema..."
        psql -h localhost -U caeybwbb_user -d caeybwbb_zuasoko_db -f backend/src/database/schema.sql
        if [ $? -eq 0 ]; then
            echo "✅ Database schema created successfully"
        else
            echo "❌ Failed to create database schema"
            exit 1
        fi
    else
        echo "✅ Database tables already exist ($TABLE_COUNT tables found)"
    fi
else
    echo "❌ Database connection failed. Please check your credentials."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

# Start backend server
echo "🚀 Starting backend server..."
cd backend
nohup npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
    echo "🌐 Backend running on: http://localhost:5001"
else
    echo "❌ Failed to start backend server"
    exit 1
fi

# Serve frontend (you'll need to configure your web server)
echo "🌐 Frontend built successfully"
echo "📁 Frontend files available in: frontend/dist/"
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your web server (nginx/apache) to serve frontend/dist/"
echo "2. Set up reverse proxy for backend API (port 5001)"
echo "3. Access your application at: https://appzua.zuasoko.com"
echo ""
echo "📊 Logs:"
echo "  Backend: logs/backend.log"
echo "  Backend PID: logs/backend.pid"
echo ""
echo "🔧 Management commands:"
echo "  Stop backend: kill \$(cat logs/backend.pid)"
echo "  View logs: tail -f logs/backend.log"
