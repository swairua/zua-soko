# Deployment Guide

This document outlines the deployment process for the Zuasoko agricultural marketplace platform.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Vercel account (for Vercel deployment)

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=your_super_secure_jwt_secret_key

# Server Configuration
NODE_ENV=production
PORT=3000

# Frontend Configuration
VITE_API_URL=/api
```

### 2. Database Setup

Ensure your PostgreSQL database is accessible and the `DATABASE_URL` is correctly configured.

## Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   npm run deploy
   ```

4. **Deploy Preview**
   ```bash
   npm run deploy-preview
   ```

### Option 2: Manual Server Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm run start
   ```

### Option 3: Static Deployment

For static-only deployment (without backend API):

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Minimal Server**
   ```bash
   npm run start:minimal
   ```

## Deployment Scripts

The following npm scripts are available for deployment:

- `npm run build` - Build the frontend for production
- `npm run start` - Start the full production server
- `npm run start:minimal` - Start minimal static server
- `npm run deploy` - Deploy to Vercel production
- `npm run deploy-preview` - Deploy to Vercel preview
- `npm run vercel-build` - Vercel build command

## Environment-Specific Configuration

### Development
- Frontend runs on port 3000
- API endpoints available at `/api/*`
- Hot reload enabled

### Production
- Unified server serves both frontend and API
- Optimized builds with minification
- SSL/HTTPS recommended

## Database Migration

The application automatically creates necessary database tables on first run. Ensure your database user has the required permissions.

## Health Checks

After deployment, verify the application is running:

1. **Frontend**: Access your deployment URL
2. **API Health**: GET `/api/status`
3. **Database**: Check `/api/status` for database connectivity

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check database server accessibility
   - Ensure database user has proper permissions

2. **Environment Variable Issues**
   - Verify all required environment variables are set
   - Check for typos in variable names
   - Ensure JWT_SECRET is sufficiently secure

3. **Build Failures**
   - Clear node_modules and reinstall: `npm run setup`
   - Check for TypeScript errors: `npm run type-check`

### Logs

Monitor application logs for debugging:
- Server logs will show database connection status
- API request/response information
- Error details for troubleshooting

## Security Considerations

- Use strong JWT secrets in production
- Enable HTTPS for all production deployments
- Regularly update dependencies
- Implement proper CORS policies
- Use environment variables for all sensitive data

## Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement database connection pooling
- Monitor application performance metrics

## Backup and Recovery

- Regular database backups
- Environment variable backup
- Code repository backups
- Deployment configuration backup

For additional support or questions, refer to the main README.md or contact the development team.
