import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/farmer/wallet - Get farmer's wallet information
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

    // Get or create wallet
    let wallet = await prisma.farmerWallet.findUnique({
      where: { farmerId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10, // Last 10 transactions
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.farmerWallet.create({
        data: {
          farmerId,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Get farmer wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/farmer/wallet - Process wallet transaction (withdrawal request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmerId, amount, mpesaPhone, type } = body;

    if (!farmerId || !amount || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const wallet = await prisma.farmerWallet.findUnique({
      where: { farmerId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (type === "WITHDRAWAL_REQUEST") {
      if (wallet.balance < amount) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 },
        );
      }

      if (!mpesaPhone) {
        return NextResponse.json(
          { error: "M-Pesa phone number is required for withdrawal" },
          { status: 400 },
        );
      }

      // Create withdrawal transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "WITHDRAWAL_REQUEST",
          amount: -amount,
          description: `Withdrawal request to ${mpesaPhone}`,
          reference: `WD-${Date.now()}`,
        },
      });

      // Update wallet balance (deduct amount)
      await prisma.farmerWallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance - amount,
          totalWithdrawn: wallet.totalWithdrawn + amount,
          mpesaPhone,
        },
      });

      // Create notification for admin to process withdrawal
      await prisma.notification.create({
        data: {
          userId: "admin-user-id", // TODO: Get actual admin user ID
          title: "Withdrawal Request",
          message: `Farmer requested withdrawal of KES ${amount.toLocaleString()} to ${mpesaPhone}`,
          type: "WITHDRAWAL_REQUEST",
        },
      });

      return NextResponse.json({
        message: "Withdrawal request submitted successfully",
        newBalance: wallet.balance - amount,
      });
    }

    return NextResponse.json(
      { error: "Invalid transaction type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Wallet transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
