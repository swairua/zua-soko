#!/bin/bash

echo "🚀 Deploying Zuasoko to Fly.dev with proper configuration..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   Visit: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.dev. Please run: flyctl auth login"
    exit 1
fi

echo "📋 Setting up environment variables..."

# Set DATABASE_URL (you need to replace this with your actual Neon URL)
echo "Setting DATABASE_URL..."
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Set JWT_SECRET
echo "Setting JWT_SECRET..."
flyctl secrets set JWT_SECRET="zuasoko-production-jwt-secret-$(date +%s)"

# Set NODE_ENV
echo "Setting NODE_ENV..."
flyctl secrets set NODE_ENV="production"

echo "🔧 Building and deploying application..."
flyctl deploy

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your app URL to test"
echo "2. Check API status at: https://your-app.fly.dev/api/status"
echo "3. Login with: +254712345678 / password123"
echo ""
echo "🐛 If you still see API errors:"
echo "1. Check logs: flyctl logs"
echo "2. Check secrets: flyctl secrets list"
echo "3. Check status: curl https://your-app.fly.dev/api/status"
