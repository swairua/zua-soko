# Fix API Errors on Fly.dev - Zuasoko

## 🐛 Problem
Your app shows "API Error" because environment variables are missing on Fly.dev.

## ✅ Quick Fix Commands

Run these commands in your terminal (where you have flyctl installed):

### 1. Set Database URL
```bash
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 2. Set JWT Secret
```bash
flyctl secrets set JWT_SECRET="zuasoko-production-jwt-secret-$(date +%s)"
```

### 3. Deploy the fixes
```bash
flyctl deploy
```

## 🔍 Verify the Fix

### Check API Status
Visit: `https://your-app-url.fly.dev/api/status`

You should see:
```json
{
  "status": "OK",
  "database": "connected",
  "config": {
    "has_database_url": true,
    "has_jwt_secret": true
  }
}
```

### Test Login
- Use: `+254712345678` / `password123` (Admin)
- Or: `+254734567890` / `password123` (Farmer)

## 🐛 If Still Not Working

### Check Logs
```bash
flyctl logs
```

### Check Secrets
```bash
flyctl secrets list
```

### Check App Status
```bash
flyctl status
```

## 🔧 Alternative: Deploy from Scratch

If the above doesn't work, you can redeploy:

```bash
# Delete current app (optional)
flyctl apps destroy zua-soko

# Create new app
flyctl launch --name zua-soko

# Set secrets and deploy
flyctl secrets set DATABASE_URL="your-neon-url"
flyctl secrets set JWT_SECRET="your-secret"
flyctl deploy
```

## 📋 Expected Result

After fixing:
- ✅ No more "API Error" notifications
- ✅ Login works properly  
- ✅ Dashboards load correctly
- ✅ Database operations work
- ✅ App is fully functional on Fly.dev

## 🆘 Need Help?

1. Check the server logs for specific errors
2. Verify your Neon database is accessible
3. Ensure Fly.dev app has proper environment variables set
