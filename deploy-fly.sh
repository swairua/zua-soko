#!/bin/bash

# Zuasoko Fly.io Deployment Script
echo "🚀 Deploying Zuasoko to Fly.io..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please login first:"
    echo "   fly auth login"
    exit 1
fi

echo "✅ Fly CLI ready"

# Set environment variables
echo "🔧 Setting environment variables..."

fly secrets set NODE_ENV="production" 2>/dev/null || echo "NODE_ENV already set"
fly secrets set DATABASE_URL="postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" 2>/dev/null || echo "DATABASE_URL already set"
fly secrets set JWT_SECRET="zuasoko-production-secret-2024-secure-key" 2>/dev/null || echo "JWT_SECRET already set"

echo "✅ Environment variables set"

# Deploy the application
echo "🚀 Deploying application..."
fly deploy --ha=false

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your app is available at:"
    fly info --json | grep hostname | cut -d'"' -f4 | sed 's/^/   https:\/\//'
    echo ""
    echo "📊 Test these endpoints:"
    APP_URL="https://$(fly info --json | grep hostname | cut -d'"' -f4)"
    echo "   ${APP_URL}/health"
    echo "   ${APP_URL}/api/status"
    echo "   ${APP_URL}/admin.html"
    echo ""
    echo "🔍 Check logs with: fly logs"
else
    echo "❌ Deployment failed!"
    echo "🔍 Check logs with: fly logs"
    exit 1
fi
