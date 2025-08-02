#!/bin/bash

# Environment Setup Script for Zuasoko Development
# This script helps set up environment variables for local development

set -e

echo "🚀 Setting up Zuasoko development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Create frontend .env file if it doesn't exist
if [[ ! -f "frontend/.env" ]]; then
    if [[ -f "frontend/.env.example" ]]; then
        print_info "Creating frontend/.env from template..."
        cp frontend/.env.example frontend/.env
        print_status "Created frontend/.env"
    else
        print_info "Creating frontend/.env with default values..."
        cat > frontend/.env << EOF
# Development Environment Variables for Vite
VITE_API_URL=http://localhost:5002/api
VITE_APP_NAME=Zuasoko (Dev)
VITE_FRONTEND_URL=http://localhost:3000
VITE_DEBUG=true
VITE_DEV_MODE=true
EOF
        print_status "Created frontend/.env with defaults"
    fi
else
    print_warning "frontend/.env already exists, skipping creation"
fi

# Create root .env file if it doesn't exist
if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
        print_info "Creating .env from template..."
        cp .env.example .env
        print_status "Created .env"
        print_warning "Please update .env with your actual database credentials"
    else
        print_info "Creating .env with default values..."
        cat > .env << EOF
# Development Environment Variables
DATABASE_URL=postgresql://username:password@localhost:5432/zuasoko_dev
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=development
API_BASE_URL=http://localhost:5002
EOF
        print_status "Created .env with defaults"
        print_warning "Please update .env with your actual database credentials"
    fi
else
    print_warning ".env already exists, skipping creation"
fi

# Install dependencies if needed
print_info "Checking dependencies..."

if [[ ! -d "node_modules" ]]; then
    print_info "Installing root dependencies..."
    npm install
    print_status "Root dependencies installed"
fi

if [[ ! -d "frontend/node_modules" ]]; then
    print_info "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    print_status "Frontend dependencies installed"
fi

# Validate environment setup
print_info "Validating environment setup..."

# Check if required files exist
required_files=("frontend/.env" "frontend/src/utils/env.ts" "frontend/src/types/environment.ts")
for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        print_status "$file exists"
    else
        print_error "$file is missing"
    fi
done

# Test environment validation
print_info "Testing environment validation..."
cd frontend
if npm run type-check >/dev/null 2>&1; then
    print_status "TypeScript validation passed"
else
    print_warning "TypeScript validation failed - check your configuration"
fi
cd ..

print_info "Environment setup complete! 🎉"
echo
print_info "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Update frontend/.env if needed"
echo "3. Start development servers:"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Backend: npm run start (or your backend start command)"
echo
print_info "For more information, see ENVIRONMENT_SETUP.md"
