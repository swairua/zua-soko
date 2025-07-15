import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/cart/[itemId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    const body = await request.json();
    const { quantity } = body;
    const { itemId } = params;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 },
      );
    }

    // Get cart item with produce details
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        produce: true,
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    // Check stock availability
    if (cartItem.produce.stockQuantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock available" },
        { status: 400 },
      );
    }

    // Update cart item
    const newTotalPrice = quantity * cartItem.produce.pricePerUnit;

    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: newTotalPrice,
      },
    });

    // Update cart totals
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    const totalItems = cartItems.reduce(
      (sum, item) =>
        item.id === itemId ? sum + quantity : sum + item.quantity,
      0,
    );
    const totalAmount = cartItems.reduce(
      (sum, item) =>
        item.id === itemId ? sum + newTotalPrice : sum + item.totalPrice,
      0,
    );

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        totalItems,
        totalAmount,
      },
    });

    return NextResponse.json({ message: "Cart item updated successfully" });
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    const { itemId } = params;

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Update cart totals
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        totalItems,
        totalAmount,
      },
    });

    return NextResponse.json({
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
