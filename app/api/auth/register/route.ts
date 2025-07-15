import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  formatPhoneNumber,
  validatePhoneNumber,
  validateEmail,
} from "@/lib/auth";
import { UserRole, AccountStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
      // Role-specific fields
      county,
      farmName,
      farmSize,
      kraPin,
      licenseNumber,
      vehicleType,
      vehicleRegNo,
      idNumber,
      assignedCounty,
    } = body;

    // Validate required fields
    if (!phone || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: formattedPhone }, ...(email ? [{ email }] : [])],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this phone number or email" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine account status based on role
    let accountStatus: AccountStatus = AccountStatus.PENDING_PAYMENT;
    if (role === UserRole.CUSTOMER || role === UserRole.DRIVER) {
      accountStatus = AccountStatus.ACTIVE;
    }

    // Create user with role-specific profile
    const userData: any = {
      email: email || null,
      phone: formattedPhone,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      status: accountStatus,
    };

    // Add role-specific profile data
    switch (role) {
      case UserRole.FARMER:
        if (!county) {
          return NextResponse.json(
            { error: "County is required for farmers" },
            { status: 400 },
          );
        }
        userData.farmer = {
          create: {
            farmName: farmName || null,
            county,
            farmSize: farmSize ? parseFloat(farmSize) : null,
            kraPin: kraPin || null,
          },
        };
        break;

      case UserRole.CUSTOMER:
        userData.customer = {
          create: {
            county: county || null,
          },
        };
        break;

      case UserRole.DRIVER:
        if (!licenseNumber || !vehicleType || !vehicleRegNo || !idNumber) {
          return NextResponse.json(
            { error: "Driver details are required" },
            { status: 400 },
          );
        }

        // Check for duplicate driver details
        const existingDriver = await prisma.driver.findFirst({
          where: {
            OR: [{ licenseNumber }, { vehicleRegNo }, { idNumber }],
          },
        });

        if (existingDriver) {
          return NextResponse.json(
            { error: "Driver with these details already exists" },
            { status: 400 },
          );
        }

        userData.driver = {
          create: {
            licenseNumber,
            vehicleType,
            vehicleRegNo,
            idNumber,
          },
        };
        break;

      case UserRole.FARMER_AGENT:
        if (!assignedCounty) {
          return NextResponse.json(
            { error: "Assigned county is required for farmer agents" },
            { status: 400 },
          );
        }
        userData.farmerAgent = {
          create: {
            assignedCounty,
          },
        };
        break;

      case UserRole.ADMIN:
        userData.admin = {
          create: {},
        };
        break;
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        farmer: true,
        customer: true,
        driver: true,
        farmerAgent: true,
        admin: true,
      },
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userResponse,
        requiresPayment: role === UserRole.FARMER,
        requiresApproval: role === UserRole.DRIVER,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
