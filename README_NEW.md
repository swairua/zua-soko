# 🌾 Zuasoko - Agricultural Marketplace Platform

A modern agricultural marketplace connecting farmers, customers, drivers, and administrators.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Installation & Development

```bash
# Clone the repository
git clone <your-repo-url>
cd zuasoko

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
zuasoko/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── customer/      # Customer pages
│   │   ├── farmer/        # Farmer portal pages
│   │   └── driver/        # Driver portal pages
│   ├── store/             # Zustand state management
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── api/                   # Backend API (Express.js)
├── public/                # Static assets
├── dist/                  # Production build output
└── server.js             # Backend server
```

## 🎯 Features

### 👥 **Multi-Role Platform**
- **Admin**: Full platform management and analytics
- **Farmers**: Product listing, consignment management, wallet
- **Customers**: Marketplace browsing, ordering, profile management  
- **Drivers**: Delivery assignments, warehouse management

### 🛒 **Marketplace**
- Product catalog with search and filters
- Shopping cart with real-time inventory
- Secure checkout process
- Order tracking and history

### 📊 **Admin Dashboard**
- User management and approval system
- Analytics and reporting
- Order and consignment oversight
- Driver and delivery management
- Registration fee collection

### 💰 **Financial Features**
- M-Pesa payment integration
- Farmer wallet system
- Registration fee management
- Revenue tracking

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start frontend dev server
npm run dev:server       # Start backend server
npm run dev:fullstack    # Start both frontend and backend

# Building
npm run build            # Build for production
npm run build:prod       # Build with production optimizations
npm run preview          # Preview production build

# Code Quality
npm run type-check       # TypeScript type checking
npm run lint            # ESLint code linting

# Deployment
npm run vercel-build    # Build for Vercel deployment
```

## 🌐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5003/api
VITE_APP_NAME=Zuasoko
VITE_FRONTEND_URL=http://localhost:3000
```

### Backend
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
BACKEND_PORT=5003
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Set Environment Variables in Vercel Dashboard:**
   ```env
   VITE_API_URL=https://zuasoko.vercel.com/api
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build:**
   ```bash
   npm run build:prod
   ```

2. **Deploy `dist/` folder and `api/` folder to your hosting provider**

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Payments**: M-Pesa integration
- **Deployment**: Vercel (Frontend + Serverless Functions)

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Admin users have full access to all routes
- Protected routes for different user roles

## 📱 Responsive Design

- Mobile-first design approach
- Desktop and mobile navigation
- Optimized for all screen sizes
- Touch-friendly interfaces

## 🎨 Design System

- Consistent color palette
- Reusable component library
- Icon system with Lucide React
- Responsive typography

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Marketplace
- `GET /api/marketplace/products` - Get products
- `GET /api/marketplace/categories` - Get categories
- `GET /api/marketplace/counties` - Get counties

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics/stats` - Get platform stats
- `POST /api/admin/users/:id/approve` - Approve user

### Farmer
- `GET /api/consignments` - Get farmer consignments
- `POST /api/consignments` - Create consignment
- `GET /api/wallet` - Get wallet balance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in `/docs`
- Review the deployment guides
- Open an issue on GitHub

---

**🌾 Zuasoko - Connecting Agricultural Communities**
