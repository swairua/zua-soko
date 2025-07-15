import { NextRequest, NextResponse } from "next/server";

// M-Pesa callback endpoint to handle payment confirmations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("M-Pesa Callback received:", body);

    // Extract callback data
    const { Body } = body;

    if (!Body || !Body.stkCallback) {
      return NextResponse.json(
        { message: "Invalid callback format" },
        { status: 400 },
      );
    }

    const stkCallback = Body.stkCallback;
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Process the callback
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];

      let amount = 0;
      let mpesaReceiptNumber = "";
      let phoneNumber = "";
      let transactionDate = "";

      // Extract metadata
      metadata.forEach((item: any) => {
        switch (item.Name) {
          case "Amount":
            amount = item.Value;
            break;
          case "MpesaReceiptNumber":
            mpesaReceiptNumber = item.Value;
            break;
          case "PhoneNumber":
            phoneNumber = item.Value;
            break;
          case "TransactionDate":
            transactionDate = item.Value;
            break;
        }
      });

      // In production, update payment status in database
      const paymentUpdate = {
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
        status: "COMPLETED",
        amount,
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        updatedAt: new Date().toISOString(),
      };

      console.log("Payment successful:", paymentUpdate);

      // If this is an activation fee, activate the farmer account
      if (amount === 300) {
        // In production, find and activate the farmer account
        console.log(`Activating farmer account for phone: ${phoneNumber}`);

        // Update user status to ACTIVE in database
        // await updateUserStatus(phoneNumber, 'ACTIVE');
      }
    } else {
      // Payment failed
      console.log(
        `Payment failed - Code: ${ResultCode}, Description: ${ResultDesc}`,
      );

      // In production, update payment status in database
      const paymentUpdate = {
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
        status: "FAILED",
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        updatedAt: new Date().toISOString(),
      };

      console.log("Payment failed:", paymentUpdate);
    }

    // M-Pesa expects a specific response format
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  } catch (error) {
    console.error("M-Pesa callback error:", error);

    // Even on error, return success to M-Pesa to prevent retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  }
}

// Helper function to update user activation status
async function updateUserStatus(phoneNumber: string, status: string) {
  try {
    // In production, update the user status in database
    console.log(`Updating user ${phoneNumber} status to ${status}`);

    // Example database update:
    // await db.user.update({
    //   where: { phone: phoneNumber },
    //   data: { status: status }
    // });
  } catch (error) {
    console.error("Error updating user status:", error);
  }
}
