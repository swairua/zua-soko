# 🚀 Quick Deploy to Vercel - 5 Minutes

## Option 1: One-Click Deploy (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/zuasoko)

## Option 2: Manual Deploy (5 steps)

### Step 1: Get a Database (2 minutes)
1. Go to [neon.tech](https://neon.tech) (free tier)
2. Create account → New Project
3. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

### Step 2: Deploy to Vercel (1 minute)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import your repository
3. Click "Deploy" (don't change anything)

### Step 3: Add Environment Variables (1 minute)
In Vercel dashboard → Your Project → Settings → Environment Variables:

```
DATABASE_URL = your_connection_string_from_step_1
JWT_SECRET = any_random_32_character_string
NODE_ENV = production
```

### Step 4: Redeploy (30 seconds)
- Go to Deployments tab
- Click "..." on latest deployment → Redeploy

### Step 5: Test Your App (30 seconds)
Visit your app URL and:
- ✅ Homepage loads
- ✅ Products show up
- ✅ Login works (use any phone/password)

## Done! 🎉

Your Zuasoko marketplace is now live with:
- ✅ User authentication
- ✅ Product marketplace
- ✅ Shopping cart
- ✅ Mobile responsive design
- ✅ Real database integration

## Demo Credentials
- Phone: `+254712345678`
- Password: `password123`

## Need Help?
- Check Vercel logs in dashboard
- See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions
- Visit `/api/health` endpoint to check API status

---
*Estimated total time: 5 minutes*
