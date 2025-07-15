-- Zuasoko Database Migration SQL
-- This file contains the complete database schema for the Zuasoko platform

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('FARMER', 'CUSTOMER', 'DRIVER', 'FARMER_AGENT', 'ADMIN');
CREATE TYPE "DriverStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- Users table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Farmers table
CREATE TABLE "farmers" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "farmName" TEXT,
    "county" TEXT NOT NULL,
    "subCounty" TEXT,
    "farmSize" DOUBLE PRECISION,
    "kraPin" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "subscriptionPaid" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionDate" TIMESTAMP(3),
    "farmerAgentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Customers table
CREATE TABLE "customers" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "county" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Drivers table
CREATE TABLE "drivers" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleRegNo" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Farmer Agents table
CREATE TABLE "farmer_agents" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "assignedCounty" TEXT NOT NULL,
    "onboardingQuota" INTEGER NOT NULL DEFAULT 50,
    "farmersOnboarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Admins table
CREATE TABLE "admins" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "canApproveDrivers" BOOLEAN NOT NULL DEFAULT true,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT true,
    "canViewAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Produce table
CREATE TABLE "produce" (
    "id" SERIAL PRIMARY KEY,
    "farmerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "harvestDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "stockQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStockLevel" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "tags" TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Orders table
CREATE TABLE "orders" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL,
    "farmerId" INTEGER,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" DOUBLE PRECISION,
    "deliveryLng" DOUBLE PRECISION,
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Order Items table
CREATE TABLE "order_items" (
    "id" SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "produceId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE "payments" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "paymentMethod" TEXT NOT NULL,
    "mpesaCode" TEXT,
    "phoneNumber" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "externalRef" TEXT,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Deliveries table
CREATE TABLE "deliveries" (
    "id" SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "driverId" INTEGER,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "pickupTime" TIMESTAMP(3),
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" DOUBLE PRECISION NOT NULL,
    "deliveryLng" DOUBLE PRECISION NOT NULL,
    "deliveryTime" TIMESTAMP(3),
    "estimatedDistance" DOUBLE PRECISION,
    "estimatedDuration" INTEGER,
    "isPickedUp" BOOLEAN NOT NULL DEFAULT false,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Reviews table
CREATE TABLE "reviews" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE "notifications" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Weather Alerts table
CREATE TABLE "weather_alerts" (
    "id" SERIAL PRIMARY KEY,
    "county" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Market Prices table
CREATE TABLE "market_prices" (
    "id" SERIAL PRIMARY KEY,
    "produce" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "marketName" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Carts table
CREATE TABLE "carts" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Cart Items table
CREATE TABLE "cart_items" (
    "id" SERIAL PRIMARY KEY,
    "cartId" INTEGER NOT NULL,
    "produceId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Wishlists table
CREATE TABLE "wishlists" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL,
    "produceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE "inventory" (
    "id" SERIAL PRIMARY KEY,
    "produceId" INTEGER NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservedStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockAlert" BOOLEAN NOT NULL DEFAULT false,
    "outOfStock" BOOLEAN NOT NULL DEFAULT false,
    "lastRestocked" TIMESTAMP(3),
    "lastSold" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "farmers_userId_key" ON "farmers"("userId");
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");
CREATE UNIQUE INDEX "drivers_vehicleRegNo_key" ON "drivers"("vehicleRegNo");
CREATE UNIQUE INDEX "drivers_idNumber_key" ON "drivers"("idNumber");
CREATE UNIQUE INDEX "farmer_agents_userId_key" ON "farmer_agents"("userId");
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");
CREATE UNIQUE INDEX "produce_slug_key" ON "produce"("slug");
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");
CREATE UNIQUE INDEX "deliveries_orderId_key" ON "deliveries"("orderId");
CREATE UNIQUE INDEX "carts_customerId_key" ON "carts"("customerId");
CREATE UNIQUE INDEX "cart_items_cartId_produceId_key" ON "cart_items"("cartId", "produceId");
CREATE UNIQUE INDEX "wishlists_customerId_produceId_key" ON "wishlists"("customerId", "produceId");
CREATE UNIQUE INDEX "inventory_produceId_key" ON "inventory"("produceId");

-- Add foreign key constraints
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_farmerAgentId_fkey" FOREIGN KEY ("farmerAgentId") REFERENCES "farmer_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farmer_agents" ADD CONSTRAINT "farmer_agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "produce" ADD CONSTRAINT "produce_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
