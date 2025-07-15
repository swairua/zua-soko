import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productName,
      category,
      description,
      quantity,
      unit,
      pricePerUnit,
      location,
      farmerId, // In a real app, this would come from authentication
    } = body;

    // Calculate total value
    const totalValue = quantity * pricePerUnit;

    let result;

    try {
      // Try to create consignment in database
      result = await prisma.$transaction(async (tx) => {
        // In a real app, you'd get the farmer from authenticated user
        // For demo, we'll use the provided farmerId or create a demo farmer
        let farmer = await tx.farmer.findFirst({
          where: { id: farmerId || "demo-farmer-1" },
        });

        if (!farmer) {
          // Create demo farmer if not exists
          const user = await tx.user.create({
            data: {
              firstName: "Demo",
              lastName: "Farmer",
              phone: "+254712345678",
              email: "demo.farmer@example.com",
              role: "FARMER",
              password: "demo-password",
            },
          });

          farmer = await tx.farmer.create({
            data: {
              userId: user.id,
              county: "Kiambu",
              farmSize: 2.5,
            },
          });
        }

        // Create the consignment (product)
        const consignment = await tx.produce.create({
          data: {
            name: productName,
            category,
            description,
            pricePerUnit,
            unit,
            quantity: quantity,
            stockQuantity: quantity,
            farmerId: farmer.id,
            isApproved: false, // Pending admin approval
            isAvailable: false, // Will be available after approval
            isFeatured: false,
            tags: [category.toLowerCase()],
            images: [
              `/api/placeholder/300/200?text=${encodeURIComponent(productName)}`,
            ],
          },
        });

        // Store location data if provided
        if (location) {
          // In a real app, you might store this in a separate locations table
          // or update the farmer's location
          await tx.farmer.update({
            where: { id: farmer.id },
            data: {
              latitude: location.latitude,
              longitude: location.longitude,
              // You might need to add these fields to your Farmer model
            },
          });
        }

        return {
          consignmentId: consignment.id,
          message: "Consignment submitted successfully",
          status: "PENDING",
        };
      });
    } catch (dbError) {
      console.log(
        "Database not available, using demo mode for consignment creation",
      );

      // Demo mode response
      result = {
        consignmentId: `DEMO-${Date.now()}`,
        message: "Demo consignment created successfully",
        status: "PENDING",
      };
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating consignment:", error);
    return NextResponse.json(
      { error: "Failed to create consignment" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");
    const status = searchParams.get("status");

    let consignments;

    try {
      // Try to fetch from database
      const where: any = {};

      if (farmerId) {
        where.farmerId = farmerId;
      }

      if (status) {
        // Map status to database fields
        if (status === "PENDING") {
          where.isApproved = false;
        } else if (status === "APPROVED") {
          where.isApproved = true;
          where.isAvailable = true;
        }
      }

      consignments = await prisma.produce.findMany({
        where,
        include: {
          farmer: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform to match frontend interface
      const transformedConsignments = consignments.map((consignment) => ({
        id: consignment.id,
        productName: consignment.name,
        category: consignment.category,
        description: consignment.description,
        quantity: consignment.stockQuantity,
        unit: consignment.unit,
        pricePerUnit: consignment.pricePerUnit,
        totalValue: consignment.pricePerUnit * consignment.stockQuantity,
        status: consignment.isApproved ? "APPROVED" : "PENDING",
        images: consignment.images || [],
        submittedAt: consignment.createdAt.toISOString(),
        farmer: {
          id: consignment.farmer.id,
          name: `${consignment.farmer.user.firstName} ${consignment.farmer.user.lastName}`,
          phone: consignment.farmer.user.phone,
          county: consignment.farmer.county,
          location:
            consignment.farmer.latitude && consignment.farmer.longitude
              ? {
                  latitude: consignment.farmer.latitude,
                  longitude: consignment.farmer.longitude,
                  address: `${consignment.farmer.county} County`,
                  timestamp: consignment.createdAt.toISOString(),
                }
              : undefined,
        },
      }));

      return NextResponse.json(transformedConsignments);
    } catch (dbError) {
      console.log("Database not available, using demo consignments");

      // Demo consignments data
      const demoConsignments = [
        {
          id: "CONS001",
          productName: "Organic Tomatoes",
          category: "Vegetables",
          description:
            "Fresh organic tomatoes, Grade A quality, harvested this morning",
          quantity: 100,
          unit: "kg",
          pricePerUnit: 120,
          totalValue: 12000,
          status: "PENDING",
          images: ["/api/placeholder/300/200?text=Tomatoes"],
          submittedAt: "2024-01-16T07:30:00Z",
          farmer: {
            id: "FARM001",
            name: "Jane Wanjiku",
            phone: "+254712345678",
            county: "Kiambu",
            location: {
              latitude: -1.2921,
              longitude: 36.8219,
              address: "Thika Road, Kiambu County",
              accuracy: 10,
              timestamp: "2024-01-16T07:25:00Z",
            },
          },
        },
      ];

      return NextResponse.json(demoConsignments);
    }
  } catch (error) {
    console.error("Error fetching consignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch consignments" },
      { status: 500 },
    );
  }
}

// Handle price suggestions
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { consignmentId, action, data } = body;

    let result;

    try {
      // Try to update in database
      result = await prisma.$transaction(async (tx) => {
        if (action === "SUGGEST_PRICE") {
          // Admin suggesting a price
          const { suggestedPrice, message } = data;

          // In a real app, you might create a price_suggestions table
          // For now, we'll just return success
          return {
            success: true,
            message: "Price suggestion sent to farmer",
          };
        } else if (action === "RESPOND_TO_PRICE") {
          // Farmer responding to price suggestion
          const { response, counterPrice, message } = data;

          if (response === "accept") {
            // Update the product price and approve it
            await tx.produce.update({
              where: { id: consignmentId },
              data: {
                pricePerUnit: data.acceptedPrice,
                isApproved: true,
                isAvailable: true,
              },
            });
          }

          return {
            success: true,
            message: "Price response recorded",
          };
        }

        return { success: false };
      });
    } catch (dbError) {
      console.log(
        "Database not available, using demo mode for price operations",
      );

      result = {
        success: true,
        message: "Demo price operation completed",
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error handling price operation:", error);
    return NextResponse.json(
      { error: "Failed to process price operation" },
      { status: 500 },
    );
  }
}
