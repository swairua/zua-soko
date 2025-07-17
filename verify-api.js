// Simple verification script to test the API handler
const handler = require("./api/index.js");

// Mock request for login test
const mockLoginReq = {
  url: "/api/auth/login",
  method: "POST",
  body: {
    phone: "+254712345678",
    password: "password123",
  },
  headers: {
    "content-type": "application/json",
  },
};

// Mock response
let responseData = null;
let responseStatus = null;

const mockRes = {
  setHeader: (name, value) => {
    console.log(`Header: ${name} = ${value}`);
  },
  status: (code) => {
    responseStatus = code;
    return {
      json: (data) => {
        responseData = data;
        console.log(`Response Status: ${code}`);
        console.log("Response Data:", JSON.stringify(data, null, 2));
        return mockRes;
      },
      end: () => {
        console.log(`Response Status: ${code} (ended)`);
        return mockRes;
      },
    };
  },
  json: (data) => {
    responseData = data;
    console.log("Response Data:", JSON.stringify(data, null, 2));
    return mockRes;
  },
};

async function testAPI() {
  console.log("🧪 Testing API Handler...");
  console.log("================================");

  try {
    console.log("🔄 Testing login endpoint...");
    await handler.default(mockLoginReq, mockRes);

    if (responseStatus === 200 && responseData && responseData.success) {
      console.log("✅ API test PASSED!");
      console.log("✅ Login endpoint working correctly");
      console.log("✅ Token generated:", responseData.token ? "Yes" : "No");
      console.log("✅ User data returned:", responseData.user ? "Yes" : "No");
    } else {
      console.log("❌ API test FAILED!");
      console.log("Status:", responseStatus);
      console.log("Data:", responseData);
    }
  } catch (error) {
    console.error("❌ API test ERROR:", error.message);
    console.error("Stack:", error.stack);
  }

  console.log("================================");
}

testAPI();
