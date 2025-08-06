#!/bin/bash

echo "🚨 IMMEDIATE 403 ERROR FIX"
echo "========================="
echo ""

# Check if flyctl is available
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Please install it first."
    echo "   Visit: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

echo "🔧 Step 1: Setting consistent JWT secret..."
flyctl secrets set JWT_SECRET="zuasoko-production-secret-2025"

echo ""
echo "🔧 Step 2: Ensuring production environment..."
flyctl secrets set NODE_ENV="production"

echo ""
echo "🔧 Step 3: Deploying fixes..."
flyctl deploy

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🔄 What happens next:"
echo "1. All users with old tokens will be automatically logged out"
echo "2. Users will see: 'Authentication system updated. Please login again.'"
echo "3. After login, dashboard will work without 403 errors"
echo ""
echo "🧪 Test the fix:"
echo "1. Visit: https://your-app.fly.dev"
echo "2. Clear browser storage if needed"
echo "3. Login with: +254712345678 / password123"
echo "4. Dashboard should load successfully"
echo ""
echo "🐛 Still having issues? Check logs:"
echo "   flyctl logs --follow"
echo ""
echo "📊 Check status:"
echo "   curl https://your-app.fly.dev/api/status"
echo "   (Should show environment: 'production')"
