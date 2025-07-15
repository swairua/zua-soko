# Zuasoko Agricultural Marketplace

A comprehensive full-stack agricultural marketplace platform connecting farmers, customers, drivers, and administrators in Kenya.

## 🌾 Overview

Zuasoko is a complete consignment-based agricultural marketplace that facilitates the entire supply chain from farm to consumer. The platform implements a sophisticated workflow where farmers submit produce for approval, admins manage the approval process, drivers handle transportation, and customers can purchase fresh produce.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + In-Memory Database
- **Authentication**: JWT-based with role-based access control
- **State Management**: React Context API + React Query

## 👥 User Roles & Features

### 🌱 Farmers

- **Consignment Management**: Submit produce with proposed prices for admin approval
- **Wallet System**: Track earnings and withdraw via M-Pesa STK Push
- **Status Tracking**: Monitor consignment approval and payment status
- **Dashboard**: View earnings, active consignments, and performance metrics

### 🛒 Customers

- **Marketplace Shopping**: Browse and purchase from warehouse-stocked products
- **Shopping Cart**: Add/remove items with real-time stock validation
- **Order Management**: Place orders with comprehensive checkout process
- **Account Management**: View order history and track deliveries

### 🚛 Drivers

- **Assignment Management**: Receive and manage transport assignments
- **Warehouse Operations**: Process delivered produce for marketplace listing
- **Status Updates**: Update transport and delivery status in real-time
- **Inventory Management**: Add delivered products to marketplace with pricing

### 🔧 Administrators

- **Consignment Approval**: Review, approve, reject, or suggest price modifications
- **Driver Assignment**: Assign approved consignments to available drivers
- **User Management**: Manage platform users and their permissions
- **Analytics Dashboard**: Comprehensive platform insights and metrics
- **Workflow Oversight**: Monitor entire consignment-to-sale process

## 🔄 Complete Workflow

### 1. Farmer Submission

- Farmer creates consignment with produce details and proposed pricing
- System generates unique consignment ID and sets status to PENDING

### 2. Admin Review

- Admin reviews consignment details and quality
- Options: Approve, Reject, or Suggest alternative pricing
- If price suggested, farmer can accept or decline

### 3. Driver Assignment

- Admin assigns approved consignments to available drivers
- Driver receives notification and pickup instructions
- Farmer wallet is credited upon driver assignment

### 4. Transportation

- Driver collects produce from farmer
- Updates status to IN_TRANSIT during transport
- Marks as DELIVERED upon warehouse arrival

### 5. Warehouse Processing

- Driver processes delivered produce for marketplace
- Sets final market pricing and product attributes
- Adds high-quality images and detailed descriptions

### 6. Customer Purchase

- Products appear in marketplace for customer browsing
- Customers add to cart and complete checkout process
- Orders are processed and fulfilled

## 📱 Mobile-First Design

- Responsive design optimized for mobile devices
- Touch-friendly interfaces and navigation
- Mobile bottom navigation for authenticated users
- Optimized forms and user interactions

## 🔐 Security Features

- JWT-based authentication with secure token management
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection and security headers
- Password hashing with bcrypt

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd zuasoko-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5001) servers.

### Demo Credentials

The application includes demo accounts for testing all user roles:

- **Admin**: `+254712345678` / `password123`
- **Farmer**: `+254734567890` / `password123`
- **Customer**: `+254756789012` / `password123`
- **Driver**: `+254778901234` / `password123`

## 📊 Key Features Implemented

### ✅ Core Functionality

- [x] User authentication and role-based access control
- [x] Farmer consignment submission and management
- [x] Admin approval workflow with price suggestions
- [x] Driver assignment and transport management
- [x] Farmer wallet with M-Pesa withdrawals
- [x] Warehouse inventory management
- [x] Marketplace product catalog
- [x] Shopping cart and checkout process
- [x] Order management system

### ✅ Admin Features

- [x] Comprehensive admin dashboard
- [x] User management with status controls
- [x] Consignment approval workflow
- [x] Analytics and reporting dashboard
- [x] Driver assignment system

### ✅ Mobile Experience

- [x] Responsive design for all screen sizes
- [x] Mobile-optimized navigation
- [x] Touch-friendly interfaces
- [x] Mobile bottom navigation

### ✅ Additional Features

- [x] Real-time status updates
- [x] Comprehensive error handling
- [x] Loading states and feedback
- [x] Form validation
- [x] Currency formatting (KES)

## 🗂️ Project Structure

```
zuasoko-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── pages/          # Page components
│   │   └── ...
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   └── server.js       # Main server file
└── README.md
```

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev
```

### Backend Development

```bash
cd backend
npm run dev
```

### Build for Production

```bash
npm run build
```

## 🌟 Highlights

- **Complete Workflow**: End-to-end consignment-based marketplace
- **Role-Based Design**: Tailored experiences for each user type
- **Mobile-First**: Optimized for Kenyan mobile-first market
- **Real-Time Updates**: Live status tracking throughout workflow
- **Scalable Architecture**: Clean separation of concerns
- **Kenya-Focused**: Currency, regions, and M-Pesa integration ready

## 📈 Future Enhancements

- Real-time notifications with WebSocket
- Advanced analytics and reporting
- Mobile app development
- Payment gateway integration
- Multi-language support
- Advanced search and filtering
- Rating and review system

## 🤝 Contributing

This is a demonstration project showcasing a complete agricultural marketplace implementation. The codebase demonstrates best practices for full-stack development with modern technologies.

## 📄 License

This project is a demonstration application for portfolio purposes.

---

**Built with ❤️ for Kenya's Agricultural Community**

_Empowering farmers, connecting communities, delivering fresh produce._
