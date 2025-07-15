import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo products for when database is unavailable
const demoProducts = [
  {
    id: "prod-1",
    name: "Organic Tomatoes",
    category: "Vegetables",
    description: "Fresh organic tomatoes, Grade A quality",
    price: 130,
    unit: "kg",
    stockQuantity: 85,
    images: ["/api/placeholder/300/200?text=Tomatoes"],
    isApproved: true,
    isAvailable: true,
    isFeatured: true,
    tags: ["organic", "fresh", "grade-a"],
    farmer: {
      id: "farmer-1",
      county: "Kiambu",
      user: {
        firstName: "Jane",
        lastName: "Wanjiku",
      },
    },
    createdAt: new Date("2024-01-16T10:30:00Z"),
    updatedAt: new Date("2024-01-16T10:30:00Z"),
  },
  {
    id: "prod-2",
    name: "Fresh Spinach",
    category: "Leafy Greens",
    description: "Freshly harvested spinach bunches",
    price: 50,
    unit: "bunch",
    stockQuantity: 20,
    images: ["/api/placeholder/300/200?text=Spinach"],
    isApproved: true,
    isAvailable: true,
    isFeatured: false,
    tags: ["fresh", "leafy", "green"],
    farmer: {
      id: "farmer-2",
      county: "Nyeri",
      user: {
        firstName: "Peter",
        lastName: "Mwangi",
      },
    },
    createdAt: new Date("2024-01-16T09:15:00Z"),
    updatedAt: new Date("2024-01-16T09:15:00Z"),
  },
  {
    id: "prod-3",
    name: "Purple Carrots",
    category: "Root Vegetables",
    description: "Premium purple carrots, sweet and crunchy",
    price: 85,
    unit: "kg",
    stockQuantity: 45,
    images: ["/api/placeholder/300/200?text=Carrots"],
    isApproved: true,
    isAvailable: true,
    isFeatured: true,
    tags: ["purple", "premium", "sweet"],
    farmer: {
      id: "farmer-3",
      county: "Meru",
      user: {
        firstName: "Mary",
        lastName: "Njeri",
      },
    },
    createdAt: new Date("2024-01-15T14:20:00Z"),
    updatedAt: new Date("2024-01-15T14:20:00Z"),
  },
  {
    id: "prod-4",
    name: "French Beans",
    category: "Vegetables",
    description: "Fresh green beans from highland farms",
    price: 120,
    unit: "kg",
    stockQuantity: 30,
    images: ["/api/placeholder/300/200?text=Beans"],
    isApproved: true,
    isAvailable: true,
    isFeatured: false,
    tags: ["fresh", "highland", "green"],
    farmer: {
      id: "farmer-4",
      county: "Nyandarua",
      user: {
        firstName: "Samuel",
        lastName: "Kimani",
      },
    },
    createdAt: new Date("2024-01-14T16:45:00Z"),
    updatedAt: new Date("2024-01-14T16:45:00Z"),
  },
  {
    id: "prod-5",
    name: "Baby Potatoes",
    category: "Root Vegetables",
    description: "Small tender potatoes, perfect for roasting",
    price: 60,
    unit: "kg",
    stockQuantity: 150,
    images: ["/api/placeholder/300/200?text=Potatoes"],
    isApproved: true,
    isAvailable: true,
    isFeatured: false,
    tags: ["baby", "tender", "roasting"],
    farmer: {
      id: "farmer-5",
      county: "Nakuru",
      user: {
        firstName: "Grace",
        lastName: "Wanjiku",
      },
    },
    createdAt: new Date("2024-01-16T11:20:00Z"),
    updatedAt: new Date("2024-01-16T11:20:00Z"),
  },
];

// GET /api/marketplace/products - Get all approved products for public marketplace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const county = searchParams.get("county");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: any = {
      isApproved: true,
      isAvailable: true,
      stockQuantity: {
        gt: 0,
      },
    };

    if (category) {
      where.category = category;
    }

    if (county) {
      where.farmer = {
        county,
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    let products;

    try {
      // Try to fetch from database
      products = await prisma.produce.findMany({
        where,
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      });
    } catch (dbError) {
      console.log("Database not available, using demo products");
      // Fallback to demo products and apply client-side filtering
      products = demoProducts.filter((product) => {
        if (category && product.category !== category) return false;
        if (county && product.farmer.county !== county) return false;
        if (featured === "true" && !product.isFeatured) return false;
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(searchLower);
          const matchesDescription = product.description
            .toLowerCase()
            .includes(searchLower);
          const matchesTags = product.tags.some((tag) =>
            tag.toLowerCase().includes(searchLower),
          );
          if (!matchesName && !matchesDescription && !matchesTags) return false;
        }
        return true;
      });

      // Sort demo products (featured first, then by date)
      products.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Marketplace products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
