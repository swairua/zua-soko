# Zuasoko - Vercel Deployment Guide

This guide will help you deploy the Zuasoko Agricultural Platform to Vercel with a cloud database.

## 🚀 Quick Start

### 1. Prerequisites

- [Vercel Account](https://vercel.com) (free tier available)
- [GitHub Account](https://github.com)
- [Neon Database Account](https://neon.tech) (recommended for PostgreSQL)

### 2. Database Setup (Neon PostgreSQL)

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create Database**: Create a new PostgreSQL database
3. **Get Connection String**: Copy your connection string (format: `postgresql://username:password@host/database?sslmode=require`)
4. **Run Schema**: Execute the schema from `backend/src/database/schema.sql` in your Neon console

### 3. Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the root directory

3. **Configure Environment Variables**: Add these in Vercel Dashboard → Settings → Environment Variables:

   ```bash
   # Database
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require

   # Security
   JWT_SECRET=your-super-secure-jwt-secret-key-here

   # Application
   FRONTEND_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   ```

4. **Deploy**: Click "Deploy" - Vercel will automatically build and deploy your app

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add FRONTEND_URL
   vercel env add NODE_ENV
   ```

## 📦 Project Structure for Vercel

```
zuasoko-app/
├── frontend/                 # React app (deployed to Vercel)
│   ├── dist/                # Build output
│   ├── src/
│   └── package.json
├── backend/
│   └── api/                 # Serverless functions
│       ├── index.js         # Main API routes
│       ├── wallet.js        # Wallet endpoints
│       ├── orders.js        # Order endpoints
│       └── package.json     # API dependencies
├── vercel.json              # Vercel configuration
└── .env.vercel.example      # Environment template
```

## 🔧 Configuration Files

### vercel.json

The main configuration file that tells Vercel:

- How to build the frontend
- Where to find serverless functions
- How to route requests
- Environment settings

### Key Features:

- **Frontend**: React app served from `frontend/dist`
- **API**: Node.js serverless functions in `backend/api/`
- **Database**: PostgreSQL (Neon recommended)
- **Authentication**: JWT-based with Argon2 password hashing

## 🗄️ Database Options

### Recommended: Neon (PostgreSQL)

- **Pros**: Serverless PostgreSQL, generous free tier, great for development
- **Setup**: [neon.tech](https://neon.tech)
- **Connection**: Standard PostgreSQL connection string

### Alternative: Supabase

- **Pros**: PostgreSQL with additional features, good free tier
- **Setup**: [supabase.com](https://supabase.com)
- **Connection**: Standard PostgreSQL connection string

### Alternative: PlanetScale (MySQL)

- **Pros**: Serverless MySQL, good scaling
- **Setup**: [planetscale.com](https://planetscale.com)
- **Note**: Would require changing SQL syntax in queries

## 🔐 Environment Variables

| Variable       | Description                  | Example                                          |
| -------------- | ---------------------------- | ------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET`   | Secret key for JWT tokens    | `your-super-secure-secret-key`                   |
| `FRONTEND_URL` | Your Vercel app URL          | `https://your-app.vercel.app`                    |
| `NODE_ENV`     | Environment setting          | `production`                                     |

## 🌐 Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   - Update `FRONTEND_URL` to your custom domain

## 📱 Features Enabled

✅ **Frontend**: React app with Vite build
✅ **Backend**: Serverless API functions  
✅ **Database**: PostgreSQL with connection pooling
✅ **Authentication**: JWT with Argon2 password hashing
✅ **Security**: CORS, Helmet, environment variables
✅ **Performance**: Code splitting, compression, caching

## 🔍 Monitoring & Debugging

### Vercel Dashboard

- **Functions**: Monitor serverless function performance
- **Analytics**: View traffic and performance metrics
- **Logs**: Debug API calls and errors

### Database Monitoring

- **Neon Dashboard**: Monitor database performance and queries
- **Connection Pooling**: Optimized for serverless functions

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Verify `DATABASE_URL` format
   - Check Neon database is running
   - Ensure SSL mode is configured

2. **API Function Timeouts**:
   - Serverless functions have 10-second timeout
   - Optimize database queries
   - Consider caching for heavy operations

3. **CORS Issues**:
   - Check `FRONTEND_URL` environment variable
   - Verify Vercel headers configuration

4. **Build Failures**:
   - Check `vercel.json` configuration
   - Verify all dependencies in `package.json`
   - Review build logs in Vercel dashboard

## 📋 Deployment Checklist

- [ ] Database created and schema imported
- [ ] Environment variables configured in Vercel
- [ ] GitHub repository connected to Vercel
- [ ] Domain configured (if using custom domain)
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Check database connections

## 🆘 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Issues**: Create issues in your GitHub repository

---

## 🎉 Success!

Once deployed, your Zuasoko app will be available at:

- **URL**: `https://your-app-name.vercel.app`
- **API**: `https://your-app-name.vercel.app/api`

Your agricultural marketplace is now live and ready to connect farmers with customers! 🌾
