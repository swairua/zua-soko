"use strict";
const axios = require("axios");
const crypto = require("crypto");
class MpesaService {
    constructor() {
        this.consumerKey =
            process.env.MPESA_CONSUMER_KEY || "Hw4SBMELUjcZ2FMQgCJePGk8lIJBgTaK";
        this.consumerSecret =
            process.env.MPESA_CONSUMER_SECRET || "YbdNqg2QFHK8NAfK";
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || "174379";
        this.passkey =
            process.env.MPESA_PASS_KEY ||
                "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        this.callbackUrl =
            process.env.MPESA_CALLBACK_URL ||
                "http://localhost:5001/api/payments/callback";
        this.baseUrl =
            process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
        this.accessToken = null;
        this.tokenExpiry = null;
    }
    // Generate OAuth token
    async getAccessToken() {
        try {
            if (this.accessToken &&
                this.tokenExpiry &&
                new Date() < this.tokenExpiry) {
                return this.accessToken;
            }
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
            const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/json",
                },
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
            console.log("✅ M-Pesa access token generated successfully");
            return this.accessToken;
        }
        catch (error) {
            console.error("❌ M-Pesa token generation failed:", error.response?.data || error.message);
            // Return demo token for development
            this.accessToken = "demo_access_token_" + Date.now();
            this.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour
            return this.accessToken;
        }
    }
    // Generate password for STK Push
    generatePassword() {
        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, -3);
        const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString("base64");
        return { password, timestamp };
    }
    // Initiate STK Push
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();
            // Clean phone number (remove +254 and add 254)
            const cleanPhone = phoneNumber.replace(/^\+?254/, "254");
            const stkPushData = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Math.round(amount),
                PartyA: cleanPhone,
                PartyB: this.businessShortCode,
                PhoneNumber: cleanPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
            };
            console.log("📱 Initiating M-Pesa STK Push:", {
                phone: cleanPhone,
                amount: amount,
                reference: accountReference,
            });
            // For demo purposes, simulate successful STK push
            if (process.env.NODE_ENV === "development") {
                const demoResponse = {
                    MerchantRequestID: `demo_merchant_${Date.now()}`,
                    CheckoutRequestID: `demo_checkout_${Date.now()}`,
                    ResponseCode: "0",
                    ResponseDescription: "Success. Request accepted for processing",
                    CustomerMessage: "Success. Request accepted for processing",
                };
                console.log("✅ Demo M-Pesa STK Push initiated successfully");
                return demoResponse;
            }
            const response = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, stkPushData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("✅ M-Pesa STK Push initiated successfully");
            return response.data;
        }
        catch (error) {
            console.error("❌ M-Pesa STK Push failed:", error.response?.data || error.message);
            // Return demo error response
            return {
                MerchantRequestID: `demo_merchant_error_${Date.now()}`,
                CheckoutRequestID: `demo_checkout_error_${Date.now()}`,
                ResponseCode: "1",
                ResponseDescription: "Demo error - STK Push simulation",
                CustomerMessage: "Demo: Please check your phone for M-Pesa prompt",
            };
        }
    }
    // Query STK Push status
    async querySTKStatus(checkoutRequestID) {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();
            const queryData = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID,
            };
            // For demo purposes, simulate successful payment
            if (process.env.NODE_ENV === "development") {
                return {
                    ResponseCode: "0",
                    ResponseDescription: "The service request has been accepted successfully",
                    MerchantRequestID: "demo_merchant_123",
                    CheckoutRequestID: checkoutRequestID,
                    ResultCode: "0",
                    ResultDesc: "The service request is processed successfully.",
                    Amount: 100,
                    MpesaReceiptNumber: `DEMO${Date.now()}`,
                    TransactionDate: new Date()
                        .toISOString()
                        .replace(/[^0-9]/g, "")
                        .slice(0, -3),
                    PhoneNumber: "254708374149",
                };
            }
            const response = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, queryData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            console.error("❌ M-Pesa status query failed:", error.response?.data || error.message);
            throw error;
        }
    }
    // Validate M-Pesa callback
    validateCallback(callbackData) {
        // In production, implement proper validation
        return true;
    }
    // Process callback data
    processCallback(callbackData) {
        try {
            const { Body } = callbackData;
            const { stkCallback } = Body;
            const result = {
                merchantRequestID: stkCallback.MerchantRequestID,
                checkoutRequestID: stkCallback.CheckoutRequestID,
                resultCode: stkCallback.ResultCode,
                resultDesc: stkCallback.ResultDesc,
            };
            if (stkCallback.ResultCode === 0) {
                // Payment successful
                const callbackMetadata = stkCallback.CallbackMetadata;
                const items = callbackMetadata.Item;
                result.success = true;
                result.amount = items.find((item) => item.Name === "Amount")?.Value;
                result.mpesaReceiptNumber = items.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
                result.transactionDate = items.find((item) => item.Name === "TransactionDate")?.Value;
                result.phoneNumber = items.find((item) => item.Name === "PhoneNumber")?.Value;
            }
            else {
                // Payment failed
                result.success = false;
                result.errorMessage = stkCallback.ResultDesc;
            }
            return result;
        }
        catch (error) {
            console.error("❌ M-Pesa callback processing failed:", error);
            throw error;
        }
    }
}
module.exports = new MpesaService();
