# 🏠 Localhost Quick Reference

## ⚡ One Command Setup

```bash
npm run dev:localhost
```

**This starts everything you need:**
- Frontend: http://localhost:3000
- API: http://localhost:5004
- Live Database: Connected

## 🔑 Login Credentials

```
Admin:    +254712345678 / password123
Farmer:   +254734567890 / password123  
Customer: +254745678901 / customer123
```

## 📍 Important URLs

- **App**: http://localhost:3000
- **API Health**: http://localhost:5004/api/health
- **Products**: http://localhost:5004/api/marketplace/products

## 🛠️ Alternative Commands

```bash
# Individual servers
npm run localhost    # API server only
npm run dev         # Frontend only

# Full development
npm run dev:localhost   # Both servers (recommended)
```

## 💾 What You Get

✅ **Live Neon Database** (same as production)  
✅ **All production features** working locally  
✅ **Demo data fallbacks** if database fails  
✅ **Hot reload** for fast development  
✅ **Debug logging** for troubleshooting  

## 🚨 Troubleshooting

**Port conflicts:**
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:5004 | xargs kill -9
```

**Can't connect:**
- Demo credentials always work
- Fallback systems prevent errors
- Check console for detailed logs

**Perfect for development!** 🎉
