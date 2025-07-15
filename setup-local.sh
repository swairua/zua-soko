#!/bin/bash

echo "🚀 Setting up Zuasoko for local development..."

# Create environment files if they don't exist
echo "📝 Creating environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update backend/.env with your database credentials"
else
    echo "✅ backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from template"
else
    echo "✅ frontend/.env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up PostgreSQL database:"
echo "   - Create database: zuasoko_db"
echo "   - Create user: zuasoko_user"
echo "   - Update backend/.env with your database credentials"
echo ""
echo "2. Initialize database schema:"
echo "   - Run: psql -U zuasoko_user -d zuasoko_db -f database/migration.sql"
echo "   - Or use the schema in backend/src/database/schema.sql"
echo ""
echo "3. Start development servers:"
echo "   - Run: npm run dev"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5001"
echo ""
echo "4. Test users (after running the server):"
echo "   - Admin: +254712345678 / password123"
echo "   - Farmer: +254734567890 / password123"
echo "   - Customer: +254756789012 / password123"
echo "   - Driver: +254778901234 / password123"
