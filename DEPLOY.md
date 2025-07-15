# Easy Deployment Guide - Vercel + Railway

This guide will help you deploy your Zuasoko app using **Vercel** (frontend) and **Railway** (backend).

## Prerequisites

1. GitHub account
2. Vercel account (free)
3. Railway account (free)

## Step 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Create New Project** → **Deploy from GitHub repo**
4. **Select your repository** (or fork this one)
5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5001
   FRONTEND_URL=https://your-app.vercel.app
   JWT_SECRET=your-super-secret-key-here
   ```
6. **Deploy** - Railway will automatically detect and deploy the backend

## Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Import Project** → Select your repository
4. **Framework Preset:** Vite
5. **Root Directory:** `frontend`
6. **Build Command:** `npm run build`
7. **Output Directory:** `dist`
8. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   ```
9. **Deploy**

## Step 3: Update URLs

1. **Copy your Railway backend URL** (from Railway dashboard)
2. **Update Vercel environment variable:**
   - Go to Vercel → Project → Settings → Environment Variables
   - Update `VITE_API_URL` to your Railway URL
3. **Copy your Vercel frontend URL**
4. **Update Railway environment variable:**
   - Go to Railway → Project → Variables
   - Update `FRONTEND_URL` to your Vercel URL

## Step 4: Redeploy

1. **Redeploy Vercel** (to pick up new environment variables)
2. **Railway will auto-redeploy** when you update environment variables

## Demo Credentials

Once deployed, you can login with:

- **Admin:** `+254712345678` / `password123`
- **Farmer:** `+254734567890` / `password123`
- **Customer:** `+254756789012` / `password123`
- **Driver:** `+254778901234` / `password123`

## Health Check

Your backend health endpoint: `https://your-railway-app.railway.app/health`

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Make sure `FRONTEND_URL` in Railway matches your Vercel URL
   - Check Railway logs for CORS errors

2. **API Not Found:**
   - Verify `VITE_API_URL` in Vercel points to your Railway URL
   - Check Railway deployment logs

3. **Build Errors:**
   - Check Vercel build logs in deployment dashboard
   - Ensure all dependencies are in package.json

### Commands to Check:

```bash
# Test your backend health
curl https://your-railway-app.railway.app/health

# Test your frontend
curl https://your-app.vercel.app
```

## Costs

- **Vercel:** Free for personal projects
- **Railway:** Free tier includes $5/month credits

Both platforms are much more reliable than Fly.io for this type of application!
