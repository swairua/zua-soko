#!/bin/bash

echo "🔧 Fixing 403 Authentication Errors on Fly.dev..."

# Set the correct environment variables
echo "📝 Setting production environment variables..."

flyctl secrets set NODE_ENV="production"
flyctl secrets set JWT_SECRET="zuasoko-production-secret-2025"
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "🚀 Deploying with authentication fix..."
flyctl deploy

echo "✅ Deployment complete!"
echo ""
echo "🔍 Testing authentication fix..."
echo "1. Check API status: curl https://your-app.fly.dev/api/status"
echo "2. Login and test dashboard access"
echo "3. Check logs: flyctl logs"
echo ""
echo "🎯 Expected fix:"
echo "- Status should show environment: 'production'"
echo "- Login should work without 403 errors"
echo "- Dashboard data should load successfully"
