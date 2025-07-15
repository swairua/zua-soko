import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } },
) {
  try {
    const { transactionId } = params;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    // In production, check database for payment status
    // For demo purposes, check the global status map
    let paymentStatus = null;

    if (typeof global !== "undefined" && (global as any).paymentStatuses) {
      paymentStatus = (global as any).paymentStatuses.get(transactionId);
    }

    if (!paymentStatus) {
      // Payment still pending or not found
      return NextResponse.json({
        transactionId,
        status: "PENDING",
        message: "Payment is still being processed",
      });
    }

    // If payment is completed, also update user status
    if (
      paymentStatus.status === "COMPLETED" &&
      paymentStatus.type === "ACTIVATION_FEE"
    ) {
      // In production, update user account status in database
      console.log(`Activating farmer account for transaction ${transactionId}`);
    }

    return NextResponse.json({
      transactionId,
      status: paymentStatus.status,
      message: paymentStatus.message,
      mpesaReceiptNumber: paymentStatus.mpesaReceiptNumber,
      amount: paymentStatus.amount,
      completedAt: paymentStatus.completedAt,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
