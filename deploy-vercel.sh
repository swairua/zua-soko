#!/bin/bash

echo "🚀 Zuasoko - Vercel Deployment Helper"
echo "====================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend API dependencies
echo "📦 Installing backend API dependencies..."
cd backend/api
npm install
cd ../..

# Check for environment variables
echo "🔍 Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "��️  Warning: No .env.local file found"
    echo "Please create one with your DATABASE_URL and JWT_SECRET"
    echo "See .env.vercel.example for template"
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test API endpoints at your-app.vercel.app/api/health"
echo "3. Verify database connection"
echo "4. Test authentication flow"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
