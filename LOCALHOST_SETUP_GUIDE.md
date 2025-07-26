# Zuasoko Agricultural Platform - Local Setup Guide

## Prerequisites

Before setting up the application locally, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 12 or higher 
- **npm**: Usually comes with Node.js
- **Git**: For cloning the repository

## Quick Start Summary

1. Clone repository
2. Install PostgreSQL and create database
3. Set environment variables
4. Install dependencies
5. Run database setup
6. Start backend server
7. Start frontend development server

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/zuasoko-platform.git
cd zuasoko-platform
```

## Step 2: PostgreSQL Database Setup

### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Create Database and User

Connect to PostgreSQL:
```bash
sudo -u postgres psql
```

Create database and user:
```sql
CREATE DATABASE zuasoko_db;
CREATE USER zuasoko_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;
\q
```

### Test Database Connection

```bash
psql -h localhost -U zuasoko_user -d zuasoko_db
```

## Step 3: Environment Configuration

Create environment files:

### Backend Environment (.env in root directory)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zuasoko_db
DB_USER=zuasoko_user
DB_PASSWORD=your_secure_password
DB_SSL=false

# Server Configuration
PORT=5002
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# M-Pesa Configuration (for testing)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=sandbox

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# Admin Default Credentials
DEFAULT_ADMIN_EMAIL=admin@zuasoko.com
DEFAULT_ADMIN_PHONE=+254712345678
DEFAULT_ADMIN_PASSWORD=admin123
```

### Frontend Environment (frontend/.env.local)

```bash
# API Configuration
VITE_API_URL=http://localhost:5002/api
VITE_API_BASE_URL=http://localhost:5002

# Environment
VITE_NODE_ENV=development

# Features
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG=true

# M-Pesa (for frontend integration)
VITE_MPESA_SHORTCODE=174379
```

## Step 4: Install Dependencies

### Backend Dependencies

```bash
# Install backend dependencies
npm install

# Install additional required packages
npm install argon2 dotenv
```

### Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Return to root directory
cd ..
```

## Step 5: Database Initialization

### Option A: Using the Database Initialization Script

```bash
# Run database setup and seeding
node backend/src/database/db.js
```

### Option B: Manual Database Setup

```bash
# Connect to your database
psql -h localhost -U zuasoko_user -d zuasoko_db

# Run the schema file
\i backend/src/database/schema.sql

# Exit psql
\q
```

### Verify Database Setup

```bash
# Check tables were created
psql -h localhost -U zuasoko_user -d zuasoko_db -c "\dt"
```

You should see tables like:
- users
- farmer_categories_list
- farmer_categories
- products
- consignments
- orders
- wallets
- etc.

## Step 6: Start the Backend Server

```bash
# Start the backend API server
npm run dev

# Or alternatively
node server.js
```

The backend server will start on `http://localhost:5002`

You should see output like:
```
✅ Connected to PostgreSQL database
🔄 Initializing database schema...
✅ Database schema initialized successfully
🔄 Initializing demo data...
��� Demo data initialized successfully
📋 Demo credentials:
   Admin: +254712345678 / password123
   Farmer: +254734567890 / password123
   Customer: +254756789012 / password123
   Driver: +254778901234 / password123
🚀 Server running on port 5002
```

## Step 7: Start the Frontend Development Server

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or another available port)

## Step 8: Verify Installation

### Test API Endpoints

```bash
# Check server status
curl http://localhost:5002/

# Test login
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+254712345678", "password": "password123"}'

# Test products endpoint
curl http://localhost:5002/api/products
```

### Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Zuasoko platform homepage
3. Try logging in with the demo credentials:
   - **Admin**: Phone: `+254712345678`, Password: `password123`
   - **Farmer**: Phone: `+254734567890`, Password: `password123`
   - **Customer**: Phone: `+254756789012`, Password: `password123`
   - **Driver**: Phone: `+254778901234`, Password: `password123`

## Development Workflow

### Backend Development

The backend server automatically restarts when you make changes to the code (if using nodemon):

```bash
# Install nodemon globally for auto-restart
npm install -g nodemon

# Start with auto-restart
nodemon server.js
```

### Frontend Development

The frontend development server has hot module replacement enabled, so changes are reflected immediately.

### Database Changes

When you modify the database schema:

1. Update `backend/src/database/schema.sql`
2. Either recreate the database or run migration scripts
3. Restart the backend server

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -h localhost -U postgres -l
```

**2. Port Already in Use**
```bash
# Find process using port 5002
lsof -i :5002

# Kill the process
kill -9 <PID>
```

**3. Module Not Found Errors**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**4. Environment Variables Not Loaded**
- Ensure `.env` file is in the root directory
- Check file has correct variable names
- Restart the server after changes

### Database Issues

**Reset Database:**
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Drop and recreate database
DROP DATABASE IF EXISTS zuasoko_db;
CREATE DATABASE zuasoko_db;
GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;
\q

# Re-run initialization
node backend/src/database/db.js
```

**Check Demo Data:**
```sql
-- Connect to database
psql -h localhost -U zuasoko_user -d zuasoko_db

-- Check users
SELECT id, first_name, last_name, phone, role FROM users;

-- Check products
SELECT id, name, category, price_per_unit FROM products;

-- Check farmer categories
SELECT id, name, description FROM farmer_categories_list;
```

## Development Tips

### Useful Commands

```bash
# Backend logs
tail -f logs/app.log

# Database queries
psql -h localhost -U zuasoko_user -d zuasoko_db

# Frontend build
cd frontend && npm run build

# Type checking
cd frontend && npm run type-check

# Linting
cd frontend && npm run lint
```

### Project Structure

```
zuasoko-platform/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js          # Database configuration
│   │   │   └── schema.sql     # Database schema
│   │   ├── middleware/        # Express middleware
│   │   └── routes/           # API routes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
├── server.js                # Main server file
├── .env                     # Environment variables
└── LOCALHOST_SETUP_GUIDE.md # This file
```

## Production Considerations

When deploying to production:

1. Use stronger JWT secrets
2. Enable SSL for database connections
3. Set up proper logging
4. Use environment-specific variables
5. Enable CORS only for your domain
6. Set up database backups
7. Use PM2 or similar for process management

## Support

For issues with local setup:

1. Check this guide first
2. Review error logs in console
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly
5. Check database connectivity

## Demo User Accounts

The system initializes with these demo accounts:

| Role     | Phone           | Email                | Password    |
|----------|----------------|----------------------|-------------|
| Admin    | +254712345678  | admin@zuasoko.com    | password123 |
| Farmer   | +254734567890  | farmer@zuasoko.com   | password123 |
| Customer | +254756789012  | customer@zuasoko.com | password123 |
| Driver   | +254778901234  | driver@zuasoko.com   | password123 |

## Next Steps

After successful setup:

1. Explore the admin dashboard
2. Test farmer registration and consignment submission
3. Browse the marketplace as a customer
4. Test the driver dashboard functionality
5. Modify the code to suit your needs

Happy coding! 🚀
