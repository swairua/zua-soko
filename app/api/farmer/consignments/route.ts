import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/farmer/consignments - Get farmer's consignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");

    if (!farmerId) {
      return NextResponse.json(
        { error: "Farmer ID is required" },
        { status: 400 },
      );
    }

    const consignments = await prisma.consignment.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      include: {
        drivers: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(consignments);
  } catch (error) {
    console.error("Get farmer consignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/farmer/consignments - Submit new consignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      farmerId, // TODO: Get from session/auth
      produceName,
      category,
      quantity,
      unit,
      farmerPrice,
      description,
      harvestDate,
      expiryDate,
      collectionAddress,
      qualityNotes,
      images,
    } = body;

    // Validate required fields
    if (
      !produceName ||
      !category ||
      !quantity ||
      !unit ||
      !farmerPrice ||
      !collectionAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // For demo purposes, we'll use a hardcoded farmer ID
    // In production, get this from authentication session
    const demoFarmerId = "farmer-id-from-session";

    const consignment = await prisma.consignment.create({
      data: {
        farmerId: demoFarmerId,
        produceName,
        category,
        quantity: parseFloat(quantity),
        unit,
        farmerPrice: parseFloat(farmerPrice),
        description,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        collectionAddress,
        qualityNotes,
        images: images || [],
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: "admin-user-id", // TODO: Get actual admin user ID
        title: "New Consignment Submitted",
        message: `New ${produceName} consignment from farmer requires approval`,
        type: "CONSIGNMENT_PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Consignment submitted successfully",
        consignment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create consignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
