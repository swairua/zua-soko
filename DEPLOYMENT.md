# Zuasoko Deployment Guide

## Overview

This guide will help you deploy the Zuasoko agricultural platform to your local server with a real PostgreSQL database.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- NPM or Yarn package manager

## Database Setup

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# macOS (with Homebrew)
brew install postgresql
```

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE zuasoko_db;
CREATE USER zuasoko_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;
ALTER USER zuasoko_user CREATEDB;

# Exit psql
\q
```

### 3. Test Database Connection

```bash
psql -h localhost -U zuasoko_user -d zuasoko_db
```

## Backend Deployment

### 1. Environment Configuration

Copy the environment template and configure your settings:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configurations:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zuasoko_db
DB_USER=zuasoko_user
DB_PASSWORD=your_secure_password

# JWT Secret (generate a strong random key)
JWT_SECRET=your_super_secret_jwt_key_make_it_very_long_and_random

# M-Pesa Configuration (use your actual Safaricom credentials)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASS_KEY=your_mpesa_passkey
MPESA_CALLBACK_URL=http://your-domain.com/api/payments/callback

# Production Settings
NODE_ENV=production
PORT=5001
FRONTEND_URL=http://your-domain.com
```

### 2. Replace Server File

Replace the old server with the new database-integrated version:

```bash
cd backend/src
cp server.js server.js.backup
cp server.js.new server.js
```

### 3. Install Dependencies and Start

```bash
cd backend
npm install
npm start
```

The server will:

- ✅ Connect to PostgreSQL database
- ✅ Initialize database schema automatically
- ✅ Create demo user accounts
- ✅ Set up all tables and relationships
- ✅ Start serving API endpoints

## Frontend Deployment

### 1. Environment Configuration

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://your-domain.com:5001/api
VITE_APP_NAME=Zuasoko
```

### 2. Build and Deploy

```bash
cd frontend
npm install
npm run build

# Serve the built files with a web server (nginx, apache, etc.)
# Or use a simple static server for testing:
npx serve -s dist -l 3000
```

## Production Deployment Options

### Option 1: Direct Server Deployment

1. Set up reverse proxy (nginx) to handle SSL and route traffic
2. Use PM2 to manage Node.js processes
3. Set up PostgreSQL with proper backup strategy

### Option 2: Docker Deployment

```bash
# Create docker-compose.yml (example provided below)
docker-compose up -d
```

### Option 3: Cloud Deployment

- Deploy to Heroku, DigitalOcean, AWS, etc.
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Update connection strings accordingly

## Database Connection String Examples

### Local Development

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zuasoko_db
DB_USER=zuasoko_user
DB_PASSWORD=your_password
```

### Production with Connection String

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

### Cloud Database Examples

```env
# Heroku Postgres
DATABASE_URL=postgres://user:pass@host:5432/dbname

# AWS RDS
DATABASE_URL=postgresql://username:password@your-db.region.rds.amazonaws.com:5432/zuasoko_db

# Google Cloud SQL
DATABASE_URL=postgresql://username:password@/zuasoko_db?host=/cloudsql/project:region:instance

# DigitalOcean Managed Database
DATABASE_URL=postgresql://username:password@host:25060/zuasoko_db?sslmode=require
```

## Demo Credentials

After deployment, you can log in with these demo accounts:

- **Admin**: +254712345678 / password123
- **Farmer**: +254734567890 / password123
- **Customer**: +254756789012 / password123
- **Driver**: +254778901234 / password123

## Features Available

✅ **Real Database Integration**: All data persisted in PostgreSQL
✅ **M-Pesa STK Push**: Live payment processing
✅ **User Management**: Registration, authentication, profiles
✅ **Consignment Management**: Farmer consignment workflow
✅ **Marketplace**: Product browsing and purchasing
✅ **Order Management**: Complete order lifecycle
✅ **Wallet System**: Farmer earnings and withdrawals
✅ **Driver Assignments**: Delivery management
✅ **Admin Dashboard**: User and system management
✅ **Real-time Notifications**: Database-backed notifications

## Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify connection details in `.env` file
3. Check firewall rules for PostgreSQL port (5432)
4. Review PostgreSQL logs: `/var/log/postgresql/`

### Server Startup Issues

1. Check Node.js version: `node --version` (should be v18+)
2. Verify all environment variables are set
3. Check server logs for specific error messages
4. Ensure PostgreSQL is accessible from Node.js

### M-Pesa Integration Issues

1. Verify Safaricom credentials are correct
2. Check callback URL is accessible from Safaricom servers
3. Test in sandbox mode first before production
4. Monitor payment callback logs

## Backup and Maintenance

### Database Backup

```bash
# Create backup
pg_dump -h localhost -U zuasoko_user zuasoko_db > backup.sql

# Restore backup
psql -h localhost -U zuasoko_user zuasoko_db < backup.sql
```

### Log Monitoring

```bash
# Monitor application logs
tail -f logs/app.log

# Monitor database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Security Considerations

- Use strong passwords for database and JWT secrets
- Enable SSL/TLS for database connections in production
- Set up proper firewall rules
- Regular security updates for OS and dependencies
- Monitor access logs and unusual activities
- Use environment variables for all sensitive data

## Performance Optimization

- Set up database connection pooling (already configured)
- Enable database indexing (already included in schema)
- Use caching for frequently accessed data
- Monitor database performance and optimize queries
- Set up proper logging and monitoring

Your Zuasoko platform is now ready for production deployment! 🚀
