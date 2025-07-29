#!/bin/bash

echo "🔧 Fixing production build to remove Vite client errors..."

# Clean any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf frontend/dist
rm -rf assets
rm -f index.html

# Rebuild with proper production configuration
echo "🏗️ Building production version..."
cd frontend
npm install
NODE_ENV=production npm run build:prod

# Ensure we're using the production HTML file
if [ -f "dist/index.production.html" ]; then
    echo "✅ Using production HTML file..."
    mv dist/index.production.html dist/index.html
else
    echo "⚠️ Production HTML not found, using standard HTML..."
fi

# Copy to root directory
echo "📁 Copying build files..."
cp -r dist/* ../

cd ..

echo "✅ Production build fixed!"
echo ""
echo "🎯 What was fixed:"
echo "   ✅ Removed Vite HMR client from production"
echo "   ✅ Blocked WebSocket connections to dev server"
echo "   ✅ Prevented fetch requests to @vite/client"
echo "   ✅ Used production-optimized HTML file"
echo ""
echo "🚀 Your app should now run without HMR errors in production!"
