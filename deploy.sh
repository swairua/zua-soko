#!/bin/bash

# Zuasoko Vercel Deployment Script
echo "🚀 Starting Zuasoko deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
    print_success "Vercel CLI installed successfully"
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in..."
    vercel login
    if [ $? -ne 0 ]; then
        print_error "Failed to authenticate with Vercel"
        exit 1
    fi
fi

print_success "Authenticated with Vercel"

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if required files exist
required_files=("package.json" "vercel.json" "frontend/package.json" "api/index.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files present"

# Check TypeScript compilation
print_status "Checking TypeScript compilation..."
cd frontend
if npm run type-check; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed. Please fix errors before deploying."
    exit 1
fi
cd ..

# Build test (optional but recommended)
print_status "Testing build process..."
cd frontend
if npm run build:prod; then
    print_success "Build test successful"
    # Clean up test build
    rm -rf dist
else
    print_warning "Build test failed, but continuing with deployment..."
fi
cd ..

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "🎉 Deployment successful!"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌟 ZUASOKO MARKETPLACE DEPLOYED SUCCESSFULLY! 🌟"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📱 Your marketplace is now live and ready for farmers and customers!"
    echo ""
    echo "🔗 Next steps:"
    echo "   1. Visit your deployment URL to test the application"
    echo "   2. Set up your database environment variables in Vercel dashboard"
    echo "   3. Test user registration and product browsing"
    echo "   4. Configure your custom domain (optional)"
    echo ""
    echo "📚 For detailed setup instructions, see: VERCEL_DEPLOYMENT_GUIDE.md"
    echo ""
    echo "���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi
