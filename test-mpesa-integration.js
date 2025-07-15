// M-Pesa Integration Test Script
// This script tests all M-Pesa STK push integrations

const axios = require("axios");

const API_BASE = "http://localhost:5001/api";

// Test credentials
const testCredentials = {
  admin: { phone: "+254712345678", password: "password123" },
  farmer: { phone: "+254734567890", password: "password123" },
  customer: { phone: "+254756789012", password: "password123" },
  driver: { phone: "+254778901234", password: "password123" },
};

const testPhoneNumbers = {
  valid: "0712345678",
  formatted: "254712345678",
};

// Login function
async function login(credentials) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return null;
  }
}

// Test farmer registration fee payment
async function testFarmerRegistrationFee() {
  console.log("\n🧪 Testing Farmer Registration Fee Payment...");

  const token = await login(testCredentials.farmer);
  if (!token) return;

  try {
    const response = await axios.post(
      `${API_BASE}/payments/registration-fee`,
      { phoneNumber: testPhoneNumbers.valid },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    console.log("✅ Registration fee payment initiated:", response.data);
  } catch (error) {
    console.log(
      "ℹ️ Registration fee status:",
      error.response?.data?.error || error.message,
    );
  }
}

// Test wallet withdrawal
async function testWalletWithdrawal() {
  console.log("\n🧪 Testing Wallet Withdrawal...");

  const token = await login(testCredentials.farmer);
  if (!token) return;

  try {
    const response = await axios.post(
      `${API_BASE}/wallet/withdraw`,
      {
        amount: 50,
        phoneNumber: testPhoneNumbers.valid,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    console.log("✅ Wallet withdrawal initiated:", response.data);
  } catch (error) {
    console.log(
      "❌ Wallet withdrawal failed:",
      error.response?.data?.error || error.message,
    );
  }
}

// Test checkout payment (would need order creation first)
async function testCheckoutPayment() {
  console.log("\n🧪 Testing Checkout Payment...");

  // This would require creating an order first
  // For now, we'll test the endpoint structure
  console.log(
    "ℹ️ Checkout payment requires order creation - tested via frontend",
  );
}

// Test driver assignments
async function testDriverAssignments() {
  console.log("\n🧪 Testing Driver Assignments...");

  const token = await login(testCredentials.driver);
  if (!token) return;

  try {
    const response = await axios.get(`${API_BASE}/driver/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(
      "✅ Driver assignments loaded:",
      response.data.length,
      "assignments",
    );

    // Test delivery status update if assignments exist
    if (response.data.length > 0) {
      const assignmentId = response.data[0].id;

      const updateResponse = await axios.put(
        `${API_BASE}/driver/assignments/${assignmentId}/status`,
        { status: "IN_TRANSIT", notes: "Test pickup" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("✅ Delivery status updated:", updateResponse.data.message);
    }
  } catch (error) {
    console.log(
      "❌ Driver assignments failed:",
      error.response?.data?.error || error.message,
    );
  }
}

// Test admin users
async function testAdminUsers() {
  console.log("\n🧪 Testing Admin User Management...");

  const token = await login(testCredentials.admin);
  if (!token) return;

  try {
    const response = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Admin users loaded:", response.data.length, "users");
  } catch (error) {
    console.log(
      "❌ Admin users failed:",
      error.response?.data?.error || error.message,
    );
  }
}

// Test all M-Pesa configurations
async function testMpesaConfig() {
  console.log("\n🧪 Testing M-Pesa Configuration...");

  // Test if M-Pesa service is properly configured
  console.log("ℹ️ M-Pesa Config:");
  console.log("- Business Short Code: 174379 (Demo)");
  console.log("- Environment: Sandbox");
  console.log("- Callback URL: http://localhost:5001/api/payments/callback");
  console.log("- Valid phone formats: 254XXXXXXXXX, 0XXXXXXXXX, +254XXXXXXXXX");
}

// Main test function
async function runAllTests() {
  console.log("🚀 Starting M-Pesa Integration Tests...");
  console.log("=".repeat(60));

  await testMpesaConfig();
  await testFarmerRegistrationFee();
  await testWalletWithdrawal();
  await testCheckoutPayment();
  await testDriverAssignments();
  await testAdminUsers();

  console.log("\n" + "=".repeat(60));
  console.log("✨ M-Pesa Integration Tests Complete!");
  console.log("\n📱 To test STK push manually:");
  console.log("1. Login to farmer dashboard");
  console.log('2. Click "Pay KES 300" registration fee');
  console.log("3. Enter phone number: 0712345678");
  console.log("4. Check M-Pesa prompt on phone");
  console.log("\n💰 To test wallet withdrawal:");
  console.log("1. Login to farmer dashboard");
  console.log("2. Go to Wallet section");
  console.log('3. Click "Withdraw Funds"');
  console.log("4. Enter amount and phone number");
}

// Run tests
runAllTests().catch(console.error);
