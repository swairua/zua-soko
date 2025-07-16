# Vercel Deployment Setup

## Quick Deploy to Vercel

1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Environment Variables**: Add these in Vercel dashboard (optional):
   - `DATABASE_URL`: PostgreSQL connection string (optional - app works without)
   - `JWT_SECRET`: Secret key for JWT tokens (defaults to "demo-secret")
   - `NODE_ENV`: Set to "production"

3. **Deploy**: Vercel will automatically detect the configuration and deploy

## Features

✅ **Works without database** - Uses demo endpoints and fallback data
✅ **Simple authentication** - Uses built-in crypto for hashing (not production-ready)
✅ **Serverless API** - All API endpoints work as Vercel functions
✅ **Demo mode** - Try login with any phone/password combination

## Demo Endpoints

- `GET /api/health` - Health check
- `POST /api/demo/login` - Demo login (accepts any credentials)
- `GET /api/demo/products` - Demo product listing

## Real Endpoints (require database)

- `POST /api/auth/login` - Real user login
- `POST /api/auth/register` - User registration
- `GET /api/products` - Real product listing

## Local Development

1. Install dependencies: `npm install`
2. Start frontend: `npm start`
3. Start API server (optional): `npm run dev:api`

The app will work with demo data even without the API server running.

## Database Setup (Optional)

If you want full functionality, set up a PostgreSQL database and add the `DATABASE_URL` environment variable. The app includes SQL schema files in the `backend/` directory.

## Security Note

⚠️ This setup uses simple SHA-256 hashing for passwords, which is NOT production-ready. It's designed for demo purposes only.
