# 🌐 Domain Configuration Summary

## Your Root: https://app.zuasoko.com

### 🎯 Quick Configuration

**Frontend URLs:**
```bash
VITE_API_URL=https://app.zuasoko.com/api
VITE_FRONTEND_URL=https://app.zuasoko.com
```

**Node.js Port:**
- **Vercel/Cloud**: Auto-handled (443)
- **VPS/Server**: 3000 or 8000 (with reverse proxy)

### 📍 URL Structure

| Type | URL |
|------|-----|
| **App** | https://app.zuasoko.com |
| **API** | https://app.zuasoko.com/api |
| **Login** | https://app.zuasoko.com/api/auth/login |
| **Products** | https://app.zuasoko.com/api/marketplace/products |

### 🔧 Environment Variables for Production

Copy these to your hosting platform:

```bash
VITE_API_URL=https://app.zuasoko.com/api
VITE_FRONTEND_URL=https://app.zuasoko.com
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=42f0b98c916c35bf6403c66c42592b3049b7a9fcfbb6b7b1e0b4f6e2a7c1e8a9
```

### 🚀 Deployment

1. **Vercel**: Import repo + add environment variables + add custom domain
2. **DNS**: Point `app.zuasoko.com` to your hosting provider
3. **SSL**: Automatic via hosting platform

**Result: Your app runs at https://app.zuasoko.com** ✅
