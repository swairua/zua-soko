# 🚀 Zuasoko - Local Development Setup

## Prerequisites

Before running the application locally, ensure you have:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **PostgreSQL** database (optional - can use Neon cloud DB)
- **Git** for version control

## 📁 Project Structure

```
zuasoko/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend (alternative)
├── server.js          # Main unified server file
├── package.json       # Root dependencies
└── README.md         # Project documentation
```

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd zuasoko
```

### 2. Install Dependencies

#### Root Level Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

Create environment files:

#### Root `.env` file:
```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=5003

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# M-Pesa Configuration (Optional)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
```

#### Frontend `.env` file (frontend/.env):
```env
VITE_API_URL=http://localhost:5003/api
VITE_APP_ENV=development
```

### 4. Database Setup

The application will auto-initialize the database with:
- Required tables (users, products, orders)
- Sample admin user (admin@zuasoko.com / password123)
- Sample products with images

## 🚀 Running the Application

### Option 1: Unified Server (Recommended)
```bash
# Start the unified server (serves both frontend and backend)
npm start
```

This will:
- Start the backend server on port 5003
- Serve the frontend build from the root directory
- Auto-initialize the database

### Option 2: Development Mode (Separate Frontend/Backend)
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend development server
cd frontend
npm run dev
```

### Option 3: Production Mode
```bash
# Build frontend and start production server
npm run build
npm run start:production
```

## 📱 Accessing the Application

### Default URLs:
- **Frontend**: http://localhost:5003
- **API**: http://localhost:5003/api
- **Health Check**: http://localhost:5003/api/status

### Default Admin Login:
- **Email**: admin@zuasoko.com
- **Password**: password123

## 🎯 Available Scripts

### Root Level:
```bash
npm start              # Start unified server
npm run server         # Start backend only
npm run build          # Build frontend
npm run dev            # Development mode
npm test               # Run tests
```

### Frontend:
```bash
cd frontend
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

## 🔧 Development Tools

### Admin Panel Access:
1. Login with admin credentials
2. Navigate to `/admin/dashboard`
3. Access:
   - User Management
   - Product Management
   - Analytics
   - Settings

### API Endpoints:
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Products**: `/api/products`, `/api/marketplace/products`
- **Admin**: `/api/admin/*`

## 🐛 Troubleshooting

### Common Issues:

#### 1. Port Already in Use:
```bash
# Kill process on port 5003
lsof -ti:5003 | xargs kill -9

# Or change port in .env
PORT=3001
```

#### 2. Database Connection Issues:
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify connection string format

#### 3. Frontend Build Issues:
```bash
# Clear cache and reinstall
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

#### 4. API Calls Failing:
- Check VITE_API_URL in frontend/.env
- Ensure backend server is running
- Check browser console for CORS errors

### Logs & Debugging:
```bash
# View server logs
npm start

# Check API health
curl http://localhost:5003/api/status

# View database status
curl http://localhost:5003/health
```

## 🌍 Environment Modes

### Development:
- Hot reload enabled
- Detailed error messages
- Debug logging

### Production:
- Optimized builds
- Error boundaries
- Performance monitoring

## 📞 Support

For development issues:
1. Check this README
2. Review console logs
3. Check API endpoints list at `/api/status`
4. Verify environment variables

## 🎨 Logo Integration

The application now uses the uploaded logo in:
- **Navbar**: Top-left corner with "Zuasoko" text
- **Footer**: Bottom left with white background
- **Responsive**: Scales properly on all screen sizes

The logo is served from Builder.io CDN for optimal performance and availability.
