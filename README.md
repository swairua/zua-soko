# Zuasoko - Agricultural Marketplace

Zuasoko is a comprehensive agricultural marketplace platform that connects farmers directly with buyers, providing a transparent and efficient trading environment.

## Features

- **User Authentication**: Secure login/registration for farmers, buyers, and admins
- **Product Marketplace**: Browse and search agricultural products by category and location
- **Admin Dashboard**: Comprehensive management tools for platform administration
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Real-time Data**: Live product listings and market information

## Tech Stack

### Frontend
- **React 18.2.0** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/swairua/zua-soko.git
   cd zua-soko
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other configuration.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

### Available Scripts

- `npm run dev` - Start development server (frontend only)
- `npm run dev:server` - Start backend server
- `npm run dev:frontend` - Start frontend development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run start:minimal` - Start minimal static server
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
zua-soko/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── api/               # Additional API configurations
├── backend/           # Backend specific files
├── database/          # Database scripts and migrations
├── scripts/           # Utility scripts
├── server.js          # Main Express server
├── minimal-server.js  # Minimal static server
└── package.json       # Root package.json
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/zuasoko

# Security
JWT_SECRET=your_super_secure_secret_key

# Server
NODE_ENV=development
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000/api
```

## Database Setup

1. Create a PostgreSQL database named `zuasoko`
2. Update the `DATABASE_URL` in your `.env` file
3. The application will automatically create the necessary tables on first run

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Minimal Static Deployment
```bash
npm run build
npm run start:minimal
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/marketplace/products` - Get marketplace products with filters
- `GET /api/marketplace/categories` - Get product categories
- `GET /api/marketplace/counties` - Get available counties

### System
- `GET /api/status` - Server health check

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
