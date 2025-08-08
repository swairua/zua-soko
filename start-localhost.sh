#!/bin/bash

# Zuasoko Localhost Quick Start Script
# Runs the complete application locally with live database connections

echo "🚀 Starting Zuasoko Localhost Development Environment..."
echo ""

# Check if .env.localhost exists
if [ ! -f ".env.localhost" ]; then
    echo "❌ .env.localhost file not found!"
    echo "Please make sure .env.localhost exists with the live database configuration."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Environment configured"
echo "📍 API Server: http://localhost:5004"
echo "🌐 Frontend: http://localhost:3000"
echo "💾 Database: LIVE Neon PostgreSQL"
echo ""
echo "🔑 Demo Credentials:"
echo "   Admin: +254712345678 / password123"
echo "   Farmer: +254734567890 / password123"
echo "   Customer: +254745678901 / customer123"
echo ""
echo "🚀 Starting both frontend and API server..."
echo "📝 Use Ctrl+C to stop all servers"
echo ""

# Start both frontend and API server concurrently
npm run dev:localhost
