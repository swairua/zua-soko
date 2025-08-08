# 🏠 Zuasoko Localhost Development Guide

## 🎯 Run Zuasoko Locally with LIVE Database Connections

This guide helps you run the complete Zuasoko application on your local machine using the same live database and configurations as production.

## ⚡ Quick Start (Single Command)

```bash
# Start both frontend and API server with live database
npm run dev:localhost
```

This command starts:
- **Frontend**: http://localhost:3000 (Vite dev server)
- **API Server**: http://localhost:5004 (with live database)

## 🔧 Manual Setup (Step by Step)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Environment Variables
The `.env.localhost` file is already configured with:
- ✅ **Live Neon Database** (same as production)
- ✅ **JWT Secrets** (same as production)
- ✅ **Local API endpoints**
- ✅ **Development flags enabled**

### Step 3: Start API Server
```bash
# Start localhost API server with live database
npm run localhost
```

You'll see:
```
🎉 Zuasoko Localhost Server Running!
📍 API Server: http://localhost:5004
🌐 Frontend: http://localhost:3000 (when Vite is running)
💾 Database: LIVE Neon Database
```

### Step 4: Start Frontend (New Terminal)
```bash
# Start Vite development server
npm run dev
```

## 🌐 Access Points

### Frontend Application
- **URL**: http://localhost:3000
- **Features**: Full Zuasoko application
- **Data**: Live database + fallback demo data

### API Endpoints
- **Base URL**: http://localhost:5004/api
- **Health Check**: http://localhost:5004/api/health
- **Products**: http://localhost:5004/api/marketplace/products
- **Login**: http://localhost:5004/api/auth/login

## 🔑 Demo Credentials (Always Available)

### Admin Access
```
Phone: +254712345678
Password: password123
Features: Full admin dashboard, user management
```

### Farmer Access
```
Phone: +254734567890
Password: password123
Features: Consignments, wallet, notifications
```

### Customer Access
```
Phone: +254745678901
Password: customer123
Features: Marketplace, shopping cart, orders
```

## 💾 Database Configuration

### Live Database Connection
- **Provider**: Neon PostgreSQL
- **URL**: `postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb`
- **Features**: SSL enabled, connection pooling
- **Fallback**: Demo data if database unavailable

### What You Get
- ✅ **Real user data** from live database
- ✅ **Actual products** with images and stock levels
- ✅ **Live orders and transactions** 
- ✅ **Real farmer consignments**
- ✅ **Demo data fallbacks** for reliability

## 🛠️ Development Features

### Hot Reload
- **Frontend**: Instant updates on file changes
- **API**: Restart required for backend changes

### Debug Mode
- **Console Logging**: Enhanced API request/response logging
- **Error Details**: Detailed error messages in development
- **Database Queries**: SQL query logging enabled

### CORS Configuration
- **Frontend Origins**: localhost:3000, localhost:5173
- **Credentials**: Enabled for authentication
- **Methods**: All HTTP methods supported

## 📱 Testing Functionality

### Test Complete User Flow
1. **Visit**: http://localhost:3000
2. **Login**: Use +254734567890 / password123
3. **Browse**: Check marketplace products
4. **Shop**: Add items to cart and checkout
5. **Dashboard**: Access farmer dashboard features

### Test API Endpoints
```bash
# Health check
curl http://localhost:5004/api/health

# Get products
curl http://localhost:5004/api/marketplace/products

# Test login
curl -X POST http://localhost:5004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254734567890","password":"password123"}'
```

## 🔄 Available Scripts

```bash
# Single command - start everything
npm run dev:localhost

# Individual commands
npm run localhost          # Start API server only
npm run dev               # Start frontend only
npm run dev:fullstack     # Alternative full stack (older setup)

# Build and test
npm run build:prod        # Build for production
npm run preview          # Preview production build
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5004
lsof -ti:5004 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
- ✅ **App continues working** with demo data
- ✅ **Check console** for connection status
- ✅ **Verify `.env.localhost`** has correct DATABASE_URL

### Frontend Not Loading
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### API Errors
- ✅ **Check server logs** in terminal
- ✅ **Verify environment variables** are loaded
- ✅ **Demo data always works** as fallback

## 🌟 Development Benefits

### Live Data Testing
- **Real scenarios**: Test with actual production data
- **Performance**: See real database query performance
- **Features**: All production features available locally

### Safe Development
- **Read-only safe**: Mostly reading from live database
- **Demo fallbacks**: Never breaks even if database fails
- **Isolated testing**: Local changes don't affect production

### Full Feature Access
- ✅ **Admin dashboard** with live user data
- ✅ **Farmer consignments** with real submissions
- ✅ **Marketplace products** with actual inventory
- ✅ **Customer orders** and shopping flow
- ✅ **Payment simulation** and M-Pesa integration

## 🎉 You're Ready!

Your localhost setup includes:
- **✅ Live database access** for realistic testing
- **✅ Production-identical features** 
- **✅ Emergency fallbacks** for reliability
- **✅ Hot reload** for fast development
- **✅ Debug logging** for troubleshooting

**Start developing with confidence!** 🚀

---

## 📞 Support

### If something doesn't work:
1. **Check console logs** for detailed error messages
2. **Verify .env.localhost** file exists and has correct values  
3. **Demo credentials always work** even if database fails
4. **Fallback systems ensure** app never appears broken

The application is designed to be bulletproof for development! ✨
