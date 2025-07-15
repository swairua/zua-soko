import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo cart storage for when database is unavailable
let demoCart: any = null;

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    let cart;

    try {
      // Try to fetch from database
      cart = await prisma.cart.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              produce: {
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
              },
            },
          },
        },
      });

      // Create cart if it doesn't exist
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            customerId,
            totalItems: 0,
            totalAmount: 0,
          },
          include: {
            items: {
              include: {
                produce: {
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
                },
              },
            },
          },
        });
      }
    } catch (dbError) {
      console.log("Database not available, using demo cart");
      // Return demo cart
      if (!demoCart) {
        demoCart = {
          id: "demo-cart-1",
          customerId,
          totalItems: 0,
          totalAmount: 0,
          items: [],
        };
      }
      cart = demoCart;
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, produceId, quantity } = body;

    if (!customerId || !produceId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let produce;

    try {
      // Try to fetch from database
      produce = await prisma.produce.findUnique({
        where: { id: produceId },
      });
    } catch (dbError) {
      console.log("Database not available, using demo mode for cart");
      // For demo mode, just return success with a simple response
      return NextResponse.json({
        id: "demo-cart-1",
        customerId,
        totalItems: quantity,
        totalAmount: quantity * 100, // Demo price
        items: [
          {
            id: "demo-item-1",
            produceId,
            quantity,
            pricePerUnit: 100,
            totalPrice: quantity * 100,
          },
        ],
      });
    }

    if (!produce) {
      return NextResponse.json({ error: "Produce not found" }, { status: 404 });
    }

    // Check if produce is available and has enough stock
    if (!produce.isAvailable || produce.stockQuantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock or produce not available" },
        { status: 400 },
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          customerId,
          totalItems: 0,
          totalAmount: 0,
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_produceId: {
          cartId: cart.id,
          produceId,
        },
      },
    });

    const totalPrice = quantity * produce.pricePerUnit;

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = newQuantity * produce.pricePerUnit;

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
        },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          produceId,
          quantity,
          pricePerUnit: produce.pricePerUnit,
          totalPrice,
        },
      });
    }

    // Update cart totals
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalItems,
        totalAmount,
      },
    });

    // Get updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            produce: {
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
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
