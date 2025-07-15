#!/bin/bash

# Production Database Setup Script for Zuasoko
# This script sets up PostgreSQL database with proper user and permissions

set -e

echo "🚀 Setting up Zuasoko Production Database..."

# Default values
DB_NAME="zuasoko_db"
DB_USER="zuasoko_user"
DB_PASSWORD="zuasoko_password123"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    echo "CentOS/RHEL: sudo yum install postgresql postgresql-server"
    exit 1
fi

# Check if PostgreSQL service is running
if ! systemctl is-active --quiet postgresql 2>/dev/null && ! brew services list | grep postgresql | grep started &>/dev/null; then
    echo "🔄 Starting PostgreSQL service..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        brew services start postgresql
    fi
fi

echo "📝 Creating database and user..."

# Create database and user using psql
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo "📋 Setting up .env file..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
fi

# Update DATABASE_URL in .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME\"|" .env
else
    # Linux
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME\"|" .env
fi

echo "🔧 Installing dependencies..."
npm install

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with sample data..."
npx prisma db seed

echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Database Details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "🔗 Connection URL: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "🚀 You can now start the application with: npm run dev"
