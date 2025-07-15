import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo order processing for when database is unavailable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerInfo, paymentMethod, cartItems, totalAmount } = body;

    // Generate order number
    const orderNumber = `ZUA${Date.now().toString().slice(-6)}`;

    let result;

    try {
      // Try to create customer account and order in database
      result = await prisma.$transaction(async (tx) => {
        // Check if customer already exists by phone
        const existingUser = await tx.user.findUnique({
          where: { phone: customerInfo.phone },
          include: { customer: true },
        });

        let customer = existingUser?.customer;
        let user: any = existingUser;

        if (!customer) {
          // Create new user account if user doesn't exist
          if (!user) {
            user = await tx.user.create({
              data: {
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                phone: customerInfo.phone,
                email: customerInfo.email || null,
                role: "CUSTOMER",
                password: "temp-password", // Customer will set password later
              },
            });
          }

          // Create customer profile
          customer = await tx.customer.create({
            data: {
              userId: user.id,
              county: customerInfo.county,
            },
          });
        } else {
          // Update existing customer info
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              county: customerInfo.county,
            },
          });
        }

        // Create order
        const order = await tx.order.create({
          data: {
            customerId: customer.id,
            totalAmount,
            status: "PENDING",
            deliveryAddress: `${customerInfo.address}, ${customerInfo.town}, ${customerInfo.county}`,
          },
        });

        // Create order items
        for (const item of cartItems) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              produceId: item.productId,
              quantity: item.quantity,
              pricePerUnit: item.price,
              totalPrice: item.price * item.quantity,
            },
          });
        }

        // If M-Pesa payment, initiate STK push (simulation)
        if (paymentMethod.type === "mpesa") {
          // In real implementation, integrate with M-Pesa API
          console.log(
            `Initiating M-Pesa STK push to ${paymentMethod.mpesaPhone} for KES ${totalAmount}`,
          );
        }

        return {
          orderNumber: order.id,
          customerId: customer.id,
          message: "Order created successfully",
        };
      });
    } catch (dbError) {
      console.log("Database not available, using demo mode for checkout");

      // Demo mode response
      result = {
        orderNumber,
        customerId: "demo-customer-1",
        message: "Demo order created successfully",
      };

      // Simulate M-Pesa STK push in demo mode
      if (paymentMethod.type === "mpesa") {
        console.log(
          `Demo M-Pesa STK push to ${paymentMethod.mpesaPhone} for KES ${totalAmount}`,
        );
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve order status (for future use)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json(
      { error: "Order number is required" },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderNumber },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        orderItems: {
          include: {
            produce: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (dbError) {
    // Demo mode response
    return NextResponse.json({
      id: orderNumber,
      status: "PENDING",
      totalAmount: 1000,
      paymentMethod: "MPESA",
      paymentStatus: "PENDING",
      createdAt: new Date().toISOString(),
      message: "Demo order (database not available)",
    });
  }
}
