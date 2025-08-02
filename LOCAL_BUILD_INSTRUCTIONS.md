# Local Build Instructions for Vercel Deployment

Since build commands have been removed from `vercel.json`, you need to build the project locally before deploying.

## Prerequisites

1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Git** for version control

## Build Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

**For Production Build:**
Create or update `frontend/.env` with production values:

```env
VITE_API_URL=https://zuasoko.vercel.com/api
VITE_APP_NAME=Zuasoko
VITE_FRONTEND_URL=https://zuasoko.vercel.com
```

### 3. Build Frontend

```bash
cd frontend
npm run build:prod
cd ..
```

This will create:
- `frontend/dist/` directory with built files
- `frontend/dist/index.html` as the main entry point
- Optimized and minified assets

### 4. Verify Build

Check that build completed successfully:

```bash
ls -la frontend/dist/
# Should show: index.html, assets/, and other files
```

### 5. Prepare for Deployment

**Copy built files to root (Vercel expects them there):**
```bash
# Copy all built files to root directory
cp -r frontend/dist/* ./
```

**Verify files are in place:**
```bash
ls -la
# Should show: index.html, assets/, and other built files in root
```

### 6. Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy (Vercel will detect static files + API)
vercel --prod
```

**Option B: Git Push**
```bash
# Commit all files including built assets in root
git add .
git commit -m "Production build ready with static files"
git push origin main
```

**Important:** The built `index.html` and `assets/` folder must be in the project root for Vercel to serve them correctly.

## Important Notes

### Environment Variables in Vercel Dashboard

Make sure these are set in your Vercel project dashboard:

**Required:**
- `VITE_API_URL` = `https://zuasoko.vercel.com/api`
- `DATABASE_URL` = `your-neon-postgresql-url`
- `JWT_SECRET` = `your-jwt-secret`
- `NODE_ENV` = `production`

**Optional:**
- `VITE_APP_NAME` = `Zuasoko`
- `VITE_FRONTEND_URL` = `https://zuasoko.vercel.com`

### Build Output

The `vercel.json` configuration will:
- Serve static files from the build
- Route API calls to `/api/*` → `api/index.js`
- Route all other requests to `index.html` (SPA routing)

### Troubleshooting

**Build Fails:**
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build:prod
```

**Environment Issues:**
```bash
# Check environment validation
cd frontend
npm run dev
# Check browser console for environment info
```

**API Issues:**
```bash
# Test API endpoint
curl -X GET https://zuasoko.vercel.com/api/health
```

## Development Workflow

### Local Development

```bash
# Start frontend dev server
cd frontend
npm run dev
# Runs on http://localhost:3000

# Start backend (if running locally)
npm run start
# API on http://localhost:5002
```

### Production Testing

```bash
# Build and preview locally
cd frontend
npm run build:prod
npm run preview
# Preview production build locally
```

## File Structure After Build

```
project/
├── frontend/
│   ├── dist/                 ← Built files (ready for deployment)
│   │   ├── index.html       ← Main entry point
│   │   ├── assets/          ← CSS, JS, images
│   │   └── ...
│   ├── src/                 ← Source code
│   └── package.json
├── api/
│   └── index.js             ← Vercel API function
├── vercel.json              ← Deployment config (no build commands)
└── ...
```

## Quick Commands Reference

```bash
# Full build process
npm install && cd frontend && npm install && npm run build:prod && cd ..

# Deploy with Vercel CLI
vercel --prod

# Test locally
cd frontend && npm run preview
```

Your app will be available at: **https://zuasoko.vercel.com**
