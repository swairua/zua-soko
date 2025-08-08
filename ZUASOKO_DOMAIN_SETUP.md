# 🌐 Zuasoko Domain Setup: app.zuasoko.com

## 🎯 Your Configuration Summary

**Root Domain**: https://app.zuasoko.com  
**API Endpoints**: https://app.zuasoko.com/api  
**Node.js Port**: Auto-handled by hosting platform  

## ⚙️ Environment Configuration

### For Vercel Deployment:

#### Environment Variables to Set:
```bash
# Frontend URLs (Your Custom Domain)
VITE_API_URL=https://app.zuasoko.com/api
VITE_APP_NAME=Zuasoko
VITE_FRONTEND_URL=https://app.zuasoko.com

# Backend Configuration
NODE_ENV=production
APP_URL=https://app.zuasoko.com
APP_DOMAIN=app.zuasoko.com

# Database (Same as current)
DATABASE_URL=postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Security
JWT_SECRET=42f0b98c916c35bf6403c66c42592b3049b7a9fcfbb6b7b1e0b4f6e2a7c1e8a9

# M-Pesa (Your Domain)
MPESA_CALLBACK_URL=https://app.zuasoko.com/api/payments/callback
```

## 🚀 Deployment Steps

### Step 1: Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Import your `swairua/zua-soko` repository
3. Add all environment variables above
4. Deploy

### Step 2: Custom Domain Configuration
1. In Vercel dashboard → Settings → Domains
2. Add custom domain: `app.zuasoko.com`
3. Configure DNS records (Vercel will provide instructions)

### Step 3: DNS Configuration
Add these DNS records in your domain provider:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

Or if using A records:
```
Type: A
Name: app  
Value: 76.76.19.61 (Vercel's IP - check current)
```

## 🌐 URL Structure

### Frontend (User-facing)
- **Homepage**: https://app.zuasoko.com
- **Login**: https://app.zuasoko.com/login
- **Marketplace**: https://app.zuasoko.com/marketplace
- **Farmer Dashboard**: https://app.zuasoko.com/farmer/dashboard
- **Admin Panel**: https://app.zuasoko.com/admin/dashboard

### API Endpoints
- **Health Check**: https://app.zuasoko.com/api/health
- **Login**: https://app.zuasoko.com/api/auth/login
- **Products**: https://app.zuasoko.com/api/marketplace/products
- **Admin Users**: https://app.zuasoko.com/api/admin/users
- **Farmer Consignments**: https://app.zuasoko.com/api/consignments

## 🔧 Port Configuration

### For Cloud Hosting (Vercel/Netlify):
- **Port**: Auto-handled (443 for HTTPS)
- **SSL**: Automatic via hosting platform
- **CDN**: Included in hosting

### For VPS/Server Hosting:
- **Node.js Port**: 3000 or 8000 (internal)
- **Nginx Port**: 80 → 443 (public)
- **Reverse Proxy**: Nginx → Node.js app

## 📱 localhost Development with Your Domain

Update your `.env.localhost` to test with your domain structure:

```bash
# Local Development with Domain Structure
VITE_API_URL=http://localhost:5004/api
VITE_APP_NAME=Zuasoko (Local)
VITE_FRONTEND_URL=http://localhost:3000

# Test endpoints that match production
# http://localhost:5004/api/health
# http://localhost:5004/api/marketplace/products
# http://localhost:5004/api/auth/login
```

## 🔐 Security Configuration

### CORS Origins
```javascript
// In your Node.js server
app.use(cors({
  origin: [
    'https://app.zuasoko.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

### SSL Certificate
- **Vercel**: Automatic SSL via Let's Encrypt
- **Custom Server**: Use Let's Encrypt or CloudFlare

## 🌟 Production URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| **App** | https://app.zuasoko.com | Main application |
| **API** | https://app.zuasoko.com/api | All API endpoints |
| **Health** | https://app.zuasoko.com/api/health | System status |
| **Login** | https://app.zuasoko.com/api/auth/login | Authentication |
| **M-Pesa** | https://app.zuasoko.com/api/payments/callback | Payment webhook |

## 🧪 Testing Your Setup

### 1. Health Check
```bash
curl https://app.zuasoko.com/api/health
```

### 2. Test Login
```bash
curl -X POST https://app.zuasoko.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254734567890","password":"password123"}'
```

### 3. Test Products
```bash
curl https://app.zuasoko.com/api/marketplace/products
```

## 🎯 Final Configuration

**Your Node.js app will run on:**
- **Development**: http://localhost:5004
- **Production**: https://app.zuasoko.com (port handled by platform)

**Your frontend will be served from:**
- **Development**: http://localhost:3000  
- **Production**: https://app.zuasoko.com

**All API calls will go to:**
- **Development**: http://localhost:5004/api/*
- **Production**: https://app.zuasoko.com/api/*

## ✅ Ready for app.zuasoko.com!

Your configuration is set for:
- ✅ **Custom domain**: app.zuasoko.com
- ✅ **Live database**: Same Neon PostgreSQL
- ✅ **API structure**: /api/* endpoints
- ✅ **SSL/Security**: Platform-handled
- ✅ **Demo credentials**: Same as current

Deploy and your app will be live at **https://app.zuasoko.com**! 🚀
