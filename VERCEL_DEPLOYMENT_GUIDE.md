# 🚀 Complete Vercel Deployment Guide for Zuasoko

## Overview
This guide will help you deploy your Zuasoko marketplace application (farmers-customers platform) to Vercel with full functionality.

## 📋 Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your Zuasoko code repository

---

## 🗄️ Phase 1: Database Setup (Choose One Option)

### Option A: Neon (Recommended - Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Choose region closest to your users
4. Copy the connection string (starts with `postgresql://`)

### Option B: Supabase (Alternative)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from variables

---

## 🛠�� Phase 2: Prepare Your Code

### 1. Verify Project Structure
Your project should have this structure:
```
zuasoko/
├── frontend/          # React frontend
├── api/              # Vercel serverless functions
├── backend/          # Database schema and seeds
├── vercel.json       # Vercel configuration
└── package.json      # Root package.json
```

### 2. Update Environment Variables
Create a `.env.example` file in your root directory:

```env
# Database (Required for full functionality)
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Application
NODE_ENV=production
API_BASE_URL=https://your-vercel-app.vercel.app
```

---

## 🚀 Phase 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your Zuasoko repository
   - Click "Import"

2. **Configure Project**:
   - **Framework Preset**: Select "Other" or "Vite"
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build:prod && mv dist/index.production.html dist/index.html && cp -r dist/* ../`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

3. **Environment Variables** (Click "Environment Variables"):
   ```
   DATABASE_URL = your_database_connection_string
   JWT_SECRET = your_jwt_secret_key_here
   NODE_ENV = production
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: zuasoko (or your preferred name)
# - Directory: ./ (current directory)
```

---

## �� Phase 4: Configure Your Deployed App

### 1. Initialize Database
After successful deployment, your database needs to be initialized:

**Option A: Manual SQL Execution**
- Connect to your database using the connection string
- Run the SQL commands from `backend/src/database/schema.sql`
- Run the seeding commands to create demo data

**Option B: API Endpoint (If available)**
- Visit: `https://your-app.vercel.app/api/status`
- This should trigger database initialization automatically

### 2. Test Your Deployment

Visit your deployed app and test:
1. **Homepage**: Should load the marketplace
2. **Login**: Try demo credentials:
   - Phone: `+254712345678`
   - Password: `password123`
3. **Products**: Should show real products from database
4. **Cart**: Add items and test cart functionality

---

## 📱 Phase 5: Final Configuration

### 1. Custom Domain (Optional)
In Vercel dashboard:
- Go to your project → Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### 2. Environment-Specific Settings

**Production Environment Variables**:
```env
DATABASE_URL=your_production_database_url
JWT_SECRET=a_very_secure_32_character_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-domain.vercel.app
```

### 3. Performance Optimizations

In your `vercel.json`, you can add:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build:prod && cp -r dist/* ../",
  "outputDirectory": ".",
  "installCommand": "npm install && cd frontend && npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `frontend/package.json`
   - Verify TypeScript compilation with `npm run type-check`

2. **API Functions Not Working**:
   - Ensure all files in `api/` directory export default functions
   - Check Vercel function logs in dashboard

3. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correctly set
   - Check if your database allows connections from Vercel IPs

4. **Authentication Not Working**:
   - Ensure `JWT_SECRET` is set
   - Check that API endpoints are accessible

### Debug Commands:
```bash
# Check deployment logs
vercel logs

# Local development with Vercel functions
vercel dev
```

---

## 📊 Monitoring Your App

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Check function logs in Vercel dashboard
3. **Performance**: Use Vercel Speed Insights

---

## 🔒 Security Checklist

- [ ] Database connection string is secure
- [ ] JWT_SECRET is properly set (32+ characters)
- [ ] Environment variables are not exposed in frontend
- [ ] API endpoints have proper validation
- [ ] CORS is configured correctly

---

## 🎉 Success!

Your Zuasoko marketplace should now be live at:
`https://your-project-name.vercel.app`

### What's Working:
✅ User registration and authentication
✅ Product marketplace browsing
✅ Shopping cart functionality  
✅ Farmer-customer connections
✅ Real-time product updates
✅ Mobile-responsive design

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review deployment logs in Vercel dashboard
3. Test locally with `vercel dev`

Good luck with your deployment! 🚀
