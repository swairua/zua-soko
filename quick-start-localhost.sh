#!/bin/bash

# Zuasoko Platform - Localhost Quick Start Script
# This script helps you set up the platform for local development

set -e  # Exit on any error

echo "🌾 Zuasoko Platform - Localhost Quick Start"
echo "=========================================="
echo ""

# Color codes for output
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

# Check if Node.js is installed
check_nodejs() {
    print_info "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        if node -e "process.exit(parseInt(process.version.slice(1)) >= 18 ? 0 : 1)"; then
            print_status "Node.js version is compatible (18+)"
        else
            print_error "Node.js version 18 or higher is required"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if PostgreSQL is installed and running
check_postgresql() {
    print_info "Checking PostgreSQL installation..."
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL is installed"
        
        # Check if PostgreSQL is running
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            print_status "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Starting PostgreSQL..."
            # Try to start PostgreSQL (works on most systems)
            if command -v systemctl &> /dev/null; then
                sudo systemctl start postgresql || print_error "Could not start PostgreSQL. Please start it manually."
            elif command -v brew &> /dev/null; then
                brew services start postgresql || print_error "Could not start PostgreSQL. Please start it manually."
            else
                print_warning "Please start PostgreSQL manually"
            fi
        fi
    else
        print_error "PostgreSQL is not installed. Please install PostgreSQL 12+ from https://postgresql.org/"
        exit 1
    fi
}

# Create database and user
setup_database() {
    print_info "Setting up database..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_info "Creating .env file from template..."
        cp .env.localhost .env
        print_warning "Please edit .env file with your database credentials"
        
        # Prompt for database password
        echo ""
        read -p "Enter password for PostgreSQL user 'zuasoko_user' (or press Enter for 'password'): " DB_PASSWORD
        DB_PASSWORD=${DB_PASSWORD:-password}
        
        # Update .env file with the password
        sed -i.bak "s/your_secure_password/$DB_PASSWORD/g" .env
        print_status ".env file created and updated"
    else
        print_status ".env file already exists"
    fi
    
    # Create database and user
    print_info "Creating database and user..."
    
    # Load database password from .env
    export $(grep -v '^#' .env | xargs)
    
    # Create user and database (will prompt for PostgreSQL superuser password)
    echo "Creating PostgreSQL user and database..."
    echo "You may be prompted for the PostgreSQL superuser password."
    
    psql -h localhost -U postgres -c "CREATE USER zuasoko_user WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || print_warning "User may already exist"
    psql -h localhost -U postgres -c "CREATE DATABASE zuasoko_db OWNER zuasoko_user;" 2>/dev/null || print_warning "Database may already exist"
    psql -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;" 2>/dev/null || true
    
    print_status "Database setup complete"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    npm install
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_status "All dependencies installed"
}

# Initialize database with schema and data
initialize_database() {
    print_info "Initializing database with schema and demo data..."
    node setup-localhost-db.js
    print_status "Database initialization complete"
}

# Verify installation
verify_installation() {
    print_info "Verifying installation..."
    node verify-localhost-system.js
}

# Start development servers
start_servers() {
    echo ""
    print_info "Setup complete! Here's how to start the application:"
    echo ""
    echo "🔧 To start both servers at once:"
    echo "   npm run localhost:dev"
    echo ""
    echo "🔧 To start servers separately:"
    echo "   Terminal 1: npm run backend:dev    # Backend on http://localhost:5002"
    echo "   Terminal 2: npm run frontend:dev   # Frontend on http://localhost:5173"
    echo ""
    echo "🔑 Demo credentials:"
    echo "   Admin:    +254712345678 / password123"
    echo "   Farmer:   +254734567890 / password123"
    echo "   Customer: +254756789012 / password123"
    echo "   Driver:   +254778901234 / password123"
    echo ""
    
    read -p "Do you want to start the development servers now? (y/N): " START_NOW
    if [[ $START_NOW =~ ^[Yy]$ ]]; then
        print_info "Starting development servers..."
        npm run localhost:dev
    else
        print_info "You can start the servers later with: npm run localhost:dev"
    fi
}

# Main setup process
main() {
    echo "This script will:"
    echo "  1. Check system requirements"
    echo "  2. Set up PostgreSQL database"
    echo "  3. Install Node.js dependencies"
    echo "  4. Initialize database with demo data"
    echo "  5. Verify the installation"
    echo ""
    
    read -p "Continue with setup? (Y/n): " CONTINUE
    if [[ $CONTINUE =~ ^[Nn]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    echo ""
    print_info "Starting setup process..."
    
    # Run setup steps
    check_nodejs
    check_postgresql
    setup_database
    install_dependencies
    initialize_database
    verify_installation
    start_servers
    
    echo ""
    print_status "🎉 Zuasoko Platform setup complete!"
    print_info "Visit http://localhost:5173 to access the application"
}

# Run main function
main "$@"
