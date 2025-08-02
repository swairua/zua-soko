# Environment Setup Guide for Zuasoko

This guide covers all environment variable configuration for both development and production environments.

## Quick Start

### Development Setup
1. Copy the environment template:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Update the values in `frontend/.env` for your local setup:
   ```env
   VITE_API_URL=http://localhost:5002/api
   VITE_APP_NAME=Zuasoko (Dev)
   VITE_FRONTEND_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   cd frontend && npm run dev
   ```

### Production Setup (Vercel)
Add these environment variables in your Vercel dashboard:

**Required Variables:**
- `VITE_API_URL` = `https://zuasoko.vercel.com/api`
- `DATABASE_URL` = `postgresql://...` (your Neon database URL)
- `JWT_SECRET` = `your-secure-jwt-secret`
- `NODE_ENV` = `production`

**Optional Variables:**
- `VITE_APP_NAME` = `Zuasoko`
- `VITE_FRONTEND_URL` = `https://zuasoko.vercel.com`

## Environment Variables Reference

### Frontend Variables (VITE_*)
All frontend environment variables must start with `VITE_` to be exposed to the client.

#### Required
| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `VITE_API_URL` | API base URL | `http://localhost:5002/api` | `https://zuasoko.vercel.com/api` |

#### Optional
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_APP_NAME` | Application name | `Zuasoko` | `Zuasoko (Dev)` |
| `VITE_FRONTEND_URL` | Frontend URL | Auto-detected | `https://zuasoko.vercel.com` |
| `VITE_DEBUG` | Enable debug mode | `true` in dev | `false` |

### Backend Variables
These are configured at the project root level for the API.

#### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `NODE_ENV` | Node environment | `production` |

#### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | API base URL | Auto-detected |

### External Services (Optional)
| Variable | Description | Used For |
|----------|-------------|----------|
| `VITE_MAPBOX_TOKEN` | Mapbox API token | Maps functionality |
| `VITE_SENTRY_DSN` | Sentry error tracking | Error monitoring |
| `VITE_ANALYTICS_ID` | Analytics tracking ID | Usage analytics |

## Environment Validation

The app automatically validates environment variables on startup:

- **Development**: Shows warnings for missing variables but continues
- **Production**: Throws errors for missing required variables

### Validation Features
- ✅ Checks for required variables
- ✅ Provides helpful error messages
- ✅ Auto-detects environment-specific defaults
- ✅ Logs configuration in development
- ✅ Type-safe environment access

## Development Tools

### Environment Debugging
In development, open browser console to see:
- Current environment configuration
- All VITE_ variables
- API URL being used
- Debug mode status

### Manual Validation
Test environment variables in browser console:
```javascript
// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check all environment
console.log('Environment:', import.meta.env);

// Test validation
import { getEnvironmentConfig } from './src/utils/env';
console.log('Config:', getEnvironmentConfig());
```

## Troubleshooting

### Common Issues

#### 1. "Missing required environment variables" Error
**Cause**: `VITE_API_URL` is not set
**Solution**: Add the variable to your environment (Vercel dashboard or local .env)

#### 2. API calls failing with network errors
**Cause**: Wrong API URL or CORS issues
**Solutions**:
- Check `VITE_API_URL` is correct
- Ensure API server is running (development)
- Verify Vercel deployment is working (production)

#### 3. Environment variables not updating
**Cause**: Vite needs restart after .env changes
**Solution**: Restart the development server (`npm run dev`)

#### 4. Variables not available in browser
**Cause**: Environment variables don't start with `VITE_`
**Solution**: Rename variables to start with `VITE_` prefix

### Debug Commands

```bash
# Check environment in build
npm run build 2>&1 | grep -i env

# Test API connectivity
curl -X GET https://zuasoko.vercel.app/api/health

# Validate local environment
cd frontend && npm run type-check
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Frontend variables are public**: Any `VITE_` variable is bundled into the client and visible to users
2. **Never put secrets in VITE_ variables**: API keys, passwords, private tokens should NOT start with `VITE_`
3. **Backend-only secrets**: Keep `DATABASE_URL`, `JWT_SECRET` etc. at root level, not with `VITE_` prefix
4. **Environment file security**: Never commit `.env` files to git (they're in .gitignore)

## File Structure

```
project/
├── .env.production          # Production environment reference
├── .env.example            # Backend environment template
├── frontend/
│   ├── .env                # Local development (created by you)
│   ├── .env.example        # Frontend environment template
│   └── src/
│       ├── utils/env.ts    # Environment utilities
│       ├── types/environment.ts  # TypeScript types
│       └── vite-env.d.ts   # Vite environment types
└── vercel.json             # Vercel configuration
```

## Next Steps

1. ✅ Copy environment templates
2. ✅ Configure local development variables
3. ✅ Set up Vercel environment variables
4. ✅ Test environment validation
5. ✅ Deploy and verify production environment
