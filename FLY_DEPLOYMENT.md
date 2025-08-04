# Fly.io Deployment Fix

## Issue
The current fly.io deployment is running only the frontend without the backend API server, causing "Network Error" when trying to access admin endpoints.

## Solution
Deploy the unified server that serves both frontend and backend from a single process.

## Deployment Steps

### 1. Update your fly.toml (if it exists)
```toml
[build]

[env]
  NODE_ENV = "production"
  
[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[http_service.concurrency]
  type = "connections"
  hard_limit = 1000
  soft_limit = 1000

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
```

### 2. Set Environment Variables
```bash
fly secrets set DATABASE_URL="postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
fly secrets set NODE_ENV="production"
fly secrets set JWT_SECRET="your-secure-jwt-secret-here"
```

### 3. Deploy the Updated App
```bash
fly deploy
```

## What This Fixes

### Before (Broken)
- Frontend deployed separately
- No backend API server running
- API calls fail with "Network Error"
- Admin dashboard doesn't work

### After (Fixed)
- Unified server serves both frontend AND backend
- All API endpoints available on same domain
- No network errors
- Admin dashboard fully functional

## Verify Deployment

After deployment, check these URLs:

1. **Main App**: `https://your-app.fly.dev/`
2. **API Status**: `https://your-app.fly.dev/api/status`
3. **Health Check**: `https://your-app.fly.dev/health`
4. **Admin Dashboard**: `https://your-app.fly.dev/admin.html`

## Available API Endpoints

The deployed server will have these endpoints:

```
GET  /health                    - Health check
GET  /api/status               - Database status
POST /api/auth/login           - User login
POST /api/auth/register        - User registration
GET  /api/products             - Products list
GET  /api/marketplace/products - Marketplace products
GET  /api/marketplace/categories - Product categories
GET  /api/marketplace/counties - Available counties
GET  /api/admin/users          - Admin: All users
GET  /api/admin/analytics/stats - Admin: Analytics
GET  /api/admin/activity       - Admin: Recent activity
GET  /api/admin/settings       - Admin: Settings
```

## Troubleshooting

### If deployment fails:
1. Check logs: `fly logs`
2. Verify secrets: `fly secrets list`
3. Check app status: `fly status`

### If API still not working:
1. Verify environment variables are set
2. Check database connectivity
3. Ensure NODE_ENV is set to "production"

### Emergency fallback:
If issues persist, you can temporarily access the admin dashboard at:
`https://your-app.fly.dev/admin.html`

This uses direct fetch calls instead of the React app and should work even if the main frontend has issues.
