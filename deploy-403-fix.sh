#!/bin/bash

echo "🔧 Deploying 403 Authentication Error Fix to Fly.dev..."
echo ""

# Check if flyctl is available
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Please install it first:"
    echo "   https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

echo "📋 Setting up environment variables for production..."

# Set the correct environment variables
flyctl secrets set NODE_ENV="production"
flyctl secrets set JWT_SECRET="zuasoko-production-secret-2025"
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo ""
echo "🚀 Deploying application with authentication fixes..."
flyctl deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Testing the fix..."
echo "1. Visit: https://your-app.fly.dev/api/status"
echo "   Should show: environment: 'production'"
echo ""
echo "2. Clear browser storage and login again:"
echo "   - Open DevTools → Application → Storage → Clear All"
echo "   - Login with: +254712345678 / password123"
echo ""
echo "3. Dashboard should now load without 403 errors"
echo ""
echo "🐛 If still having issues:"
echo "   flyctl logs --follow"
echo ""
echo "📋 What was fixed:"
echo "  ✅ Environment forced to production mode"
echo "  ✅ Consistent JWT secret across all functions"
echo "  ✅ Automatic token clearing on 403 errors"
echo "  ✅ Enhanced authentication debugging"
