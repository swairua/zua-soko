# Zuasoko - Simplified Deployment Guide

## 🚀 Restructured Project Overview

The project has been restructured for easier deployment:

- ✅ **Single root directory** (no more frontend/ folder)
- ✅ **Unified package.json** with all dependencies
- ✅ **Simplified build process**
- ✅ **Streamlined deployment configuration**

## 📁 Project Structure

```
zuasoko/
├── src/                    # React frontend source files
├── public/                 # Static assets (manifest, icons, etc.)
├── server.js              # Express backend server
├── package.json           # Unified dependencies
├── vite.config.ts         # Frontend build configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── index.html             # Main HTML file
└── dist/                  # Built frontend (generated)
```

## 🔧 Development Commands

### Start Development (Frontend Only)
```bash
npm run dev
```
- Starts Vite dev server on port 5173
- Hot reload for frontend development
- Proxies API calls to backend on port 3001

### Start Backend Server
```bash
npm run dev:server
```
- Starts Express server on port 3001
- Serves API endpoints and connects to Neon database

### Start Full Stack
```bash
npm run dev:fullstack
```
- Starts both backend and frontend simultaneously
- Complete development environment

## 🏗️ Production Build

### Build Frontend
```bash
npm run build
```
- Creates optimized production build in `dist/` folder
- Minified and bundled React application

### Production Build
```bash
npm run build:prod
```
- Production-optimized build with environment-specific settings

## 🚀 Deployment Options

### 1. Vercel (Recommended)
```bash
npm run deploy
```

**Environment Variables Required:**
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `NODE_ENV`: Set to "production"

### 2. Fly.dev
```bash
flyctl deploy
```

**Secrets to set:**
```bash
flyctl secrets set DATABASE_URL="your-neon-url"
flyctl secrets set JWT_SECRET="your-jwt-secret"
flyctl secrets set NODE_ENV="production"
```

### 3. Manual Server Deployment
```bash
# Build the frontend
npm run build:prod

# Start production server
npm start
```

## 🌍 Environment Configuration

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: Live Neon PostgreSQL

### Production
- All services: https://app.zuasoko.com
- Database: Same live Neon PostgreSQL
- Static files served from `dist/`

## 📋 Key Benefits of Restructuring

1. **Simplified Setup**: Single `npm install` command
2. **Unified Dependencies**: No more separate frontend/backend package.json files
3. **Easier Deployment**: Single build process
4. **Cleaner File Structure**: No nested directories
5. **Streamlined CI/CD**: Simplified build and deployment scripts

## 🔍 Verification

After deployment, verify:
- ✅ Frontend loads at your domain
- ✅ API endpoints respond at `/api/status`
- ✅ Database connection works
- ✅ Authentication flows properly
- ✅ All features function correctly

## 🆘 Troubleshooting

### Common Issues:
1. **Port conflicts**: Ensure backend runs on 3001, frontend on 5173
2. **Missing dependencies**: Run `npm install` in root directory
3. **Build errors**: Check TypeScript and import paths
4. **API errors**: Verify environment variables are set correctly

### Quick Fixes:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild frontend
npm run build:prod

# Check server status
curl http://localhost:3001/api/status
```

---

The restructured project is now optimized for easy deployment with minimal configuration and maximum reliability!
