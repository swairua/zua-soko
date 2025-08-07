# Zuasoko Agricultural Marketplace

A modern agricultural marketplace platform built with React, TypeScript, and Node.js.

## Features

- 🌾 Farmer product listings and consignment management
- 🛒 Customer marketplace and ordering system
- 🚛 Driver delivery management
- 👥 Admin user and platform management
- 💳 M-Pesa payment integration (planned)
- 📱 Responsive mobile-first design

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

**Backend:**
- Node.js with Express
- PostgreSQL database (Neon)
- JWT authentication
- Vercel serverless functions

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build:prod
```

### Deployment
This project is configured for Vercel deployment with the following structure:
- Frontend: React app served from root
- API: Serverless functions in `/api`
- Database: PostgreSQL (Neon)

## Environment Variables

See `.env.production` for required environment variables in production.

## License

Private commercial project.
