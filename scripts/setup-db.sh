#!/bin/bash

# Zuasoko Database Setup Script
echo "🌱 Setting up Zuasoko Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set."
    echo "Please set DATABASE_URL in your .env file"
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🏗️  Pushing database schema..."
npx prisma db push

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
npx prisma db seed

echo "✅ Database setup completed successfully!"
echo ""
echo "🎯 Default login credentials:"
echo "Admin: +254712345678 / admin123"
echo "Farmer: +254734567890 / farmer123"
echo "Customer: +254756789012 / customer123"
echo "Driver: +254778901234 / driver123"
echo "Agent: +254723456789 / agent123"
echo ""
echo "🚀 You can now start the development server with: npm run dev"
