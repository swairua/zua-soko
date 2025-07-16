// Simple database connection test
const handler = require("./api/index.js");

// Mock request/response for health check
const mockReq = {
  url: "/api/health",
  method: "GET",
  headers: {},
  body: {},
};

const mockRes = {
  json: (data) => {
    console.log("✅ Health check response:", JSON.stringify(data, null, 2));
    process.exit(0);
  },
  status: (code) => ({
    json: (data) => {
      console.log(
        `❌ Health check failed with status ${code}:`,
        JSON.stringify(data, null, 2),
      );
      process.exit(1);
    },
    end: () => {
      console.log(`❌ Health check failed with status ${code}`);
      process.exit(1);
    },
  }),
  setHeader: () => {},
  end: () => {
    console.log("✅ Health check completed");
    process.exit(0);
  },
};

console.log("🔄 Testing database connection...");
handler.default(mockReq, mockRes).catch((error) => {
  console.error("❌ Health check error:", error.message);
  process.exit(1);
});
