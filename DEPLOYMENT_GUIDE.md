# Zuasoko Agricultural Platform - Deployment Guide

This guide will help you deploy the Zuasoko agricultural marketplace platform on your local server for subsequent hosting to the production domain: **https://app.zuasoko.com**

## 📋 Prerequisites

Before starting the deployment, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **NPM** (v8.0.0 or higher) 
- **PostgreSQL** (v12.0 or higher)
- **Git** (for cloning the repository)

### Check Prerequisites
```bash
node --version    # Should show v18.0.0+
npm --version     # Should show v8.0.0+
psql --version    # Should show PostgreSQL 12+
git --version     # Should show Git version
```

## 🌐 Production Domain Configuration

The application is configured to run on the production domain: **https://app.zuasoko.com**

### Key Production Features:
- **PWA (Progressive Web App)** with offline functionality
- **Android APK download** available at `/downloads/zuasoko-app.apk`
- **Service Worker** for offline caching and push notifications
- **M-Pesa integration** for payments
- **Responsive design** optimized for mobile devices
- **SEO optimization** with proper meta tags and Open Graph support

## 🚀 Quick Start Deployment

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd zuasoko-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Database Setup

#### Option A: PostgreSQL (Recommended)
1. **Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE zuasoko_db;
CREATE USER zuasoko_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zuasoko_db TO zuasoko_user;
\q
```

2. **Set Database URL:**
```bash
# Create .env file in root directory
echo "DATABASE_URL=postgresql://zuasoko_user:your_secure_password@localhost:5432/zuasoko_db" > .env
echo "JWT_SECRET=your_super_secure_jwt_secret_key_here" >> .env
echo "NODE_ENV=production" >> .env
```

#### Option B: Use Neon (Cloud PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your .env file

### 4. Initialize Database
```bash
# The application will auto-initialize tables and seed admin user on first run
npm start
```

### 5. Build Frontend
```bash
# Build production frontend
cd frontend && npm run build && cd ..

# Copy built files to serve from root
cp -r frontend/dist/* .
```

### 6. Start Production Server
```bash
# Start the production server
npm start
```

The application will be available at: **http://localhost:5003**

## �� Configuration

### Environment Variables (.env)
Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters

# Server Configuration
NODE_ENV=production
PORT=5003

# M-Pesa Configuration (Optional - configure via admin panel)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_business_shortcode
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### M-Pesa Integration Setup
1. Visit [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account and new app
3. Get your Consumer Key, Consumer Secret, and Passkey
4. Configure credentials via Admin Panel at `/admin/mpesa-settings`

## 👥 Default User Accounts

The system creates default accounts on first run:

### Admin Account
- **Phone:** +254712345678
- **Password:** password123
- **Role:** ADMIN
- **Access:** Full system administration

### Farmer Account  
- **Phone:** +254734567890
- **Password:** password123
- **Role:** FARMER
- **Access:** Consignment management (requires KES 300 registration fee)

## 📊 System Features Verification

### 1. Dashboard Drill-Down Navigation
All dashboard cards are clickable and navigate to detailed views:

#### Admin Dashboard
- **Total Users** → User Management
- **Pending Approvals** → User Management (filtered)
- **Active Consignments** → Consignment Management
- **Monthly Revenue** → Analytics

#### Farmer Dashboard
- **Total Consignments** → Consignments Tab
- **Pending Consignments** → Consignments Tab (filtered)
- **Completed Consignments** → Consignments Tab (filtered)  
- **Total Earnings** → Wallet Tab

#### Customer Dashboard
- **Total Orders** → Order History
- **Pending Orders** → Order History (filtered)
- **Completed Orders** → Order History (filtered)
- **Total Spent** → Profile/Payment History

#### Driver Dashboard
- **Deliveries Today** → Assignments (filtered)
- **Total Earnings** → Earnings Page
- **Average Rating** → Profile
- **Pending Pickups** → Assignments (filtered)

### 2. Image Upload Functionality
- ✅ **Consignment Forms:** Multi-image upload with preview
- ✅ **File Validation:** Size, type, and count limits
- ✅ **Base64 Storage:** Secure database storage
- ✅ **Preview & Remove:** Real-time image management

### 3. Payment System (KES 300 Registration)
- ✅ **Farmer Registration:** Automatic account creation
- ✅ **Payment Requirement:** KES 300 fee before consignment posting
- ✅ **STK Push Integration:** M-Pesa payment processing
- ✅ **Access Control:** Feature restriction until payment

### 4. M-Pesa Integration
- ✅ **Admin Configuration:** Secure credential management
- ✅ **STK Push Payments:** Registration fees and withdrawals
- ✅ **Environment Support:** Sandbox and production modes
- ✅ **Transaction Tracking:** Payment status monitoring

## 🔐 Security Configuration

### 1. JWT Secret
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Database Security
- Use strong passwords for database users
- Restrict database access to application server only
- Enable SSL for database connections in production

### 3. Environment Variables
- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets regularly

## 🌐 Production Deployment Options

### Option 1: Traditional VPS/Dedicated Server
1. **Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - 2GB+ RAM
   - 20GB+ storage
   - Node.js 18+ and PostgreSQL 12+

2. **Process Manager (PM2):**
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "zuasoko-app"

# Save PM2 configuration
pm2 save
pm2 startup
```

3. **Reverse Proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Cloud Platforms

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### Heroku Deployment
```bash
# Install Heroku CLI and login
heroku login

# Create new app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`
3. Add environment variables
4. Deploy

## 📱 Mobile Access

The platform is fully responsive and works on:
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Android Chrome)
- **Progressive Web App** (installable on mobile devices)

### PWA Installation
Users can install the app on their mobile devices:
1. Open the website in mobile browser
2. Look for "Add to Home Screen" prompt
3. Install as native-like app

## 🔍 Testing the Deployment

### 1. Basic Functionality Test
```bash
# Test server health
curl http://localhost:5003/api/status

# Test database connection
curl http://localhost:5003/api/health
```

### 2. User Authentication Test
1. Navigate to `/auth/login`
2. Use default admin credentials
3. Verify dashboard access and navigation

### 3. Feature Testing Checklist
- [ ] User registration and login
- [ ] Dashboard metric drill-downs
- [ ] Image upload in consignment forms
- [ ] Payment flow for farmer registration
- [ ] M-Pesa configuration (admin)
- [ ] STK withdrawal functionality
- [ ] All CRUD operations

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
psql -U postgres -l
```

#### 2. Port Already in Use
```bash
# Find process using port 5003
lsof -i :5003

# Kill process
kill -9 <PID>
```

#### 3. Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear frontend cache
cd frontend
rm -rf node_modules package-lock.json .vite
npm install
npm run build
```

#### 4. M-Pesa Integration Issues
- Verify credentials in admin panel
- Check sandbox vs production environment
- Validate phone number format (+254XXXXXXXXX)
- Ensure callback URL is accessible

## 📞 Support

### Technical Support
- **Documentation:** Check `/README.md` for additional details
- **Logs:** Monitor server logs for error messages
- **Database:** Use PostgreSQL logs for database issues

### M-Pesa Support
- **Safaricom Developer Portal:** [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- **API Documentation:** Available on developer portal
- **Test Credentials:** Use sandbox environment for testing

## 🔄 Updates and Maintenance

### Regular Maintenance
1. **Database Backups:**
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

2. **Log Rotation:**
```bash
# Setup logrotate for application logs
sudo nano /etc/logrotate.d/zuasoko
```

3. **Security Updates:**
```bash
# Update Node.js dependencies
npm audit fix

# Update system packages
sudo apt update && sudo apt upgrade
```

### Performance Monitoring
- Monitor CPU and memory usage
- Track database performance
- Monitor API response times
- Check error rates and logs

---

## 🎉 Deployment Complete!

Your Zuasoko Agricultural Platform is now ready for production use. The platform includes:

- ✅ **Complete user management** with role-based access
- ✅ **Farmer consignment system** with image uploads
- ✅ **Payment integration** with M-Pesa STK Push
- ✅ **Admin management tools** with comprehensive analytics
- ✅ **Responsive design** for all devices
- ✅ **Secure authentication** and data protection

**Default Access URLs:**
- **Main Application:** http://localhost:5003
- **Admin Dashboard:** http://localhost:5003/admin/dashboard  
- **Farmer Dashboard:** http://localhost:5003/farmer/dashboard
- **Customer Portal:** http://localhost:5003/customer/dashboard

For any issues or customization needs, refer to the troubleshooting section or check the application logs.
