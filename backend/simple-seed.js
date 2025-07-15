const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting simple database seed...");

  try {
    // Create demo users with hashed passwords
    const hashedPassword = await argon2.hash("password123");

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        phone: "+254712345678",
        email: "admin@zuasoko.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    // Create admin profile
    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        canApproveDrivers: true,
        canManageUsers: true,
        canViewAnalytics: true,
      },
    });

    // Create farmer user
    const farmerUser = await prisma.user.create({
      data: {
        phone: "+254734567890",
        email: "farmer@zuasoko.com",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Wanjiku",
        role: "FARMER",
        status: "ACTIVE",
      },
    });

    // Create farmer profile
    const farmer = await prisma.farmer.create({
      data: {
        userId: farmerUser.id,
        farmName: "Green Valley Farm",
        county: "Kiambu",
        subCounty: "Limuru",
        farmSize: 5.0,
        kraPin: "A123456789X",
        latitude: -1.0369,
        longitude: 36.8167,
        subscriptionPaid: true,
        subscriptionDate: new Date(),
      },
    });

    // Create customer user
    const customerUser = await prisma.user.create({
      data: {
        phone: "+254756789012",
        email: "customer@zuasoko.com",
        password: hashedPassword,
        firstName: "Mary",
        lastName: "Wangari",
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    // Create customer profile
    const customer = await prisma.customer.create({
      data: {
        userId: customerUser.id,
        county: "Nairobi",
        latitude: -1.2921,
        longitude: 36.8219,
        loyaltyPoints: 0,
      },
    });

    // Create some sample products
    const products = [
      {
        farmerId: farmer.id,
        name: "Organic Tomatoes",
        category: "Vegetables",
        quantity: 100,
        unit: "kg",
        pricePerUnit: 130,
        description: "Fresh organic tomatoes, Grade A quality.",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1546470427-e26264be0b07?w=300&h=200&fit=crop",
        ]),
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        stockQuantity: 85,
        minStockLevel: 10,
        isAvailable: true,
        isApproved: true,
        isFeatured: true,
        tags: JSON.stringify(["organic", "fresh", "grade-a"]),
        latitude: -1.0369,
        longitude: 36.8167,
      },
      {
        farmerId: farmer.id,
        name: "Fresh Spinach",
        category: "Leafy Greens",
        quantity: 50,
        unit: "bunch",
        pricePerUnit: 50,
        description: "Freshly harvested spinach bunches.",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop",
        ]),
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        stockQuantity: 30,
        minStockLevel: 5,
        isAvailable: true,
        isApproved: true,
        isFeatured: false,
        tags: JSON.stringify(["fresh", "leafy", "green"]),
        latitude: -1.0369,
        longitude: 36.8167,
      },
      {
        farmerId: farmer.id,
        name: "Sweet Potatoes",
        category: "Root Vegetables",
        quantity: 80,
        unit: "kg",
        pricePerUnit: 90,
        description: "Sweet and nutritious orange-fleshed sweet potatoes.",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=200&fit=crop",
        ]),
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        stockQuantity: 65,
        minStockLevel: 10,
        isAvailable: true,
        isApproved: true,
        isFeatured: true,
        tags: JSON.stringify(["sweet", "nutritious"]),
        latitude: -1.0369,
        longitude: 36.8167,
      },
    ];

    for (const product of products) {
      await prisma.produce.create({ data: product });
    }

    // Create customer cart
    await prisma.cart.create({
      data: {
        customerId: customer.id,
        totalItems: 0,
        totalAmount: 0,
      },
    });

    console.log("✅ Database seeded successfully!");
    console.log("Demo users created:");
    console.log("- Admin: +254712345678 / password123");
    console.log("- Farmer: +254734567890 / password123");
    console.log("- Customer: +254756789012 / password123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
