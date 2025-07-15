import { NextRequest, NextResponse } from "next/server";

interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  description: string;
  type: "ACTIVATION_FEE" | "ORDER_PAYMENT";
}

// Mock M-Pesa STK Push implementation
// In production, integrate with actual M-Pesa Daraja API
export async function POST(request: NextRequest) {
  try {
    const body: StkPushRequest = await request.json();
    const { phoneNumber, amount, description, type } = body;

    // Validate input
    if (!phoneNumber || !amount || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate phone number format
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    // Format phone number to international format
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("0")) {
      formattedPhone = "254" + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith("+254")) {
      formattedPhone = phoneNumber.substring(1);
    }

    // Generate transaction ID
    const transactionId = `MP${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // In production, this would integrate with M-Pesa Daraja API
    // For demo purposes, we'll simulate the STK push process
    const stkPushData = {
      BusinessShortCode: process.env.MPESA_SHORTCODE || "174379",
      Password: generateMpesaPassword(),
      Timestamp: generateTimestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE || "174379",
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      AccountReference: `ZUASOKO-${type}`,
      TransactionDesc: description,
    };

    // Log the transaction attempt
    console.log(
      `STK Push initiated for ${formattedPhone}, Amount: ${amount}, Type: ${type}`,
    );

    // Store payment record (in production, save to database)
    const paymentRecord = {
      id: transactionId,
      phoneNumber: formattedPhone,
      amount,
      description,
      type,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      mpesaRequestId: `REQ_${transactionId}`,
    };

    // Simulate processing delay
    setTimeout(
      () => {
        // In demo mode, randomly succeed or fail for testing
        const shouldSucceed = Math.random() > 0.2; // 80% success rate
        simulatePaymentCompletion(transactionId, shouldSucceed);
      },
      10000 + Math.random() * 20000,
    ); // 10-30 seconds

    return NextResponse.json({
      success: true,
      message: "STK push sent successfully",
      transactionId,
      mpesaRequestId: paymentRecord.mpesaRequestId,
    });
  } catch (error) {
    console.error("STK Push error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function generateMpesaPassword(): string {
  const shortcode = process.env.MPESA_SHORTCODE || "174379";
  const passkey =
    process.env.MPESA_PASSKEY ||
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const timestamp = generateTimestamp();

  // In production, use proper base64 encoding
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Demo function to simulate payment completion
function simulatePaymentCompletion(transactionId: string, success: boolean) {
  // In production, this would be handled by M-Pesa callback
  const completionData = {
    transactionId,
    status: success ? "COMPLETED" : "FAILED",
    mpesaReceiptNumber: success
      ? `P${Date.now()}${Math.random().toString(36).substr(2, 6)}`
      : null,
    amount: success ? 300 : null,
    message: success
      ? "Payment completed successfully"
      : "Payment failed or was cancelled",
    completedAt: new Date().toISOString(),
  };

  // Store completion status (in production, update database)
  console.log(
    `Payment ${transactionId} ${success ? "completed" : "failed"}:`,
    completionData,
  );

  // Update global payment status for polling
  if (typeof global !== "undefined") {
    if (!(global as any).paymentStatuses) {
      (global as any).paymentStatuses = new Map();
    }
    (global as any).paymentStatuses.set(transactionId, completionData);
  }
}
