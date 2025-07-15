import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo user credentials for fallback when database is not available
const demoUsers = [
  {
    id: "admin-1",
    phone: "+254712345678",
    password: "admin123",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    redirectPath: "/admin/dashboard",
  },
  {
    id: "farmer-1",
    phone: "+254734567890",
    password: "farmer123",
    role: "FARMER",
    firstName: "Jane",
    lastName: "Farmer",
    redirectPath: "/farmer/dashboard",
  },
  {
    id: "customer-1",
    phone: "+254756789012",
    password: "customer123",
    role: "CUSTOMER",
    firstName: "Mary",
    lastName: "Customer",
    redirectPath: "/customer/marketplace",
  },
  {
    id: "driver-1",
    phone: "+254778901234",
    password: "driver123",
    role: "DRIVER",
    firstName: "Michael",
    lastName: "Driver",
    redirectPath: "/driver/dashboard",
  },
];

function getRedirectPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "FARMER":
      return "/farmer/dashboard";
    case "CUSTOMER":
      return "/customer/marketplace";
    case "DRIVER":
      return "/driver/dashboard";
    case "AGENT":
      return "/agent/dashboard";
    default:
      return "/";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 },
      );
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s+/g, "");
    if (!normalizedPhone.startsWith("+")) {
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "+254" + normalizedPhone.slice(1);
      } else if (normalizedPhone.startsWith("254")) {
        normalizedPhone = "+" + normalizedPhone;
      } else {
        normalizedPhone = "+254" + normalizedPhone;
      }
    }

    let user = null;
    let isFromDatabase = false;

    try {
      // First try to find user in database
      const dbUser = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });

      if (dbUser && dbUser.password === password) {
        user = {
          id: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role,
          phone: dbUser.phone,
          redirectPath: getRedirectPath(dbUser.role),
        };
        isFromDatabase = true;
      }
    } catch (dbError) {
      console.log("Database not available, using demo users");
      // Continue with demo users - don't log the full error to avoid console spam
    }

    // If not found in database, check demo users
    if (!user) {
      const demoUser = demoUsers.find(
        (u) => u.phone === normalizedPhone && u.password === password,
      );

      if (demoUser) {
        user = demoUser;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 },
      );
    }

    // Successful login
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
      },
      redirectPath: user.redirectPath,
      source: isFromDatabase ? "database" : "demo",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
