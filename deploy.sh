#!/bin/bash

# Zuasoko Quick Deployment Script
# This script sets up the Zuasoko platform with real database integration

set -e

echo "🚀 Zuasoko Platform Deployment Script"
echo "======================================"

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
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if PostgreSQL is installed
check_postgresql() {
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL is installed"
        return 0
    else
        print_error "PostgreSQL is not installed"
        print_info "Please install PostgreSQL first:"
        print_info "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        print_info "CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
        print_info "macOS: brew install postgresql"
        exit 1
    fi
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_status "Node.js $(node -v) is installed"
            return 0
        else
            print_error "Node.js version 18 or higher is required. Current: $(node -v)"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_info "Setting up PostgreSQL database..."
    
    # Check if database exists
    DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='zuasoko_db';" 2>/dev/null || echo "")
    
    if [ "$DB_EXISTS" = "1" ]; then
        print_warning "Database 'zuasoko_db' already exists"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo -u postgres psql -c "DROP DATABASE IF EXISTS zuasoko_db;"
            sudo -u postgres psql -c "DROP USER IF EXISTS zuasoko_user;"
        else
            print_info "Skipping database recreation"
            return 0
        fi
    fi
    
    # Create database and user
    print_info "Creating database and user..."
    sudo -u postgres psql -c "CREATE DATABASE zuasoko_db;"
    sudo -u postgres psql -c "CREATE USER zuasoko_user WITH ENCRYPTED PASSWORD 'zuasoko_secure_2024';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;"
    sudo -u postgres psql -c "ALTER USER zuasoko_user CREATEDB;"
    
    print_status "Database setup completed"
}

# Setup backend
setup_backend() {
    print_info "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install
    
    # Setup environment file
    if [ ! -f .env ]; then
        print_info "Creating environment configuration..."
        cp .env.example .env
        
        # Generate JWT secret
        JWT_SECRET=$(openssl rand -hex 64)
        sed -i "s/your_super_secret_jwt_key_here_make_it_long_and_random/$JWT_SECRET/g" .env
        sed -i "s/your_password_here/zuasoko_secure_2024/g" .env
        
        print_status "Environment file created"
        print_warning "Please review and update .env file with your M-Pesa credentials"
    else
        print_info ".env file already exists"
    fi
    
    # Replace server file
    if [ -f src/server.js.new ]; then
        print_info "Updating server with database integration..."
        cp src/server.js src/server.js.backup
        cp src/server.js.new src/server.js
        print_status "Server updated with real database integration"
    else
        print_error "New server file not found. Please check the deployment files."
        exit 1
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    
    # Setup environment file
    if [ ! -f .env ]; then
        print_info "Creating frontend environment configuration..."
        cp .env.example .env || echo "VITE_API_URL=/api" > .env
        print_status "Frontend environment file created"
    else
        print_info "Frontend .env file already exists"
    fi
    
    cd ..
}

# Start services
start_services() {
    print_info "Starting services..."
    
    # Start PostgreSQL if not running
    if ! pgrep -x "postgres" > /dev/null; then
        print_info "Starting PostgreSQL..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # Start backend in background
    print_info "Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    print_info "Waiting for backend to initialize..."
    sleep 10
    
    # Check if backend is running
    if curl -s http://localhost:5001/api/admin/users > /dev/null 2>&1; then
        print_error "Backend failed to start properly"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    else
        print_status "Backend server started successfully"
    fi
    
    # Start frontend
    print_info "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
}

# Cleanup function
cleanup() {
    print_info "Cleaning up processes..."
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

# Main deployment process
main() {
    print_info "Starting Zuasoko platform deployment..."
    
    # Pre-flight checks
    check_postgresql
    check_nodejs
    
    # Setup components
    setup_database
    setup_backend
    setup_frontend
    
    # Start services
    start_services
    
    print_status "Deployment completed successfully!"
    echo
    print_info "🎉 Zuasoko Platform is now running:"
    print_info "   Frontend: http://localhost:3000"
    print_info "   Backend:  http://localhost:5001"
    print_info "   Database: PostgreSQL (localhost:5432)"
    echo
    print_info "📱 Demo Credentials:"
    print_info "   Admin:    +254712345678 / password123"
    print_info "   Farmer:   +254734567890 / password123"
    print_info "   Customer: +254756789012 / password123"
    print_info "   Driver:   +254778901234 / password123"
    echo
    print_info "🔧 Configuration files:"
    print_info "   Backend:  backend/.env"
    print_info "   Frontend: frontend/.env"
    echo
    print_warning "Remember to update your M-Pesa credentials in backend/.env"
    print_warning "Press Ctrl+C to stop all services"
    
    # Keep script running
    wait
}

# Run main function
main "$@"
