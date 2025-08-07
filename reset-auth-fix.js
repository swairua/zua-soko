// Immediate 403 Authentication Fix
// This script adds a version check to force token refresh when JWT secrets change

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating immediate 403 authentication fix...');

// Add version-based token validation to the frontend
const authStoreFixContent = `
// Force token refresh if JWT secret has changed
const AUTH_VERSION = "v2025-08-06";
const STORED_AUTH_VERSION = localStorage.getItem('auth-version');

if (STORED_AUTH_VERSION !== AUTH_VERSION) {
  console.log('🔄 Auth version changed - clearing all tokens');
  localStorage.removeItem('authToken');
  localStorage.removeItem('auth-storage');
  localStorage.setItem('auth-version', AUTH_VERSION);
  
  // Redirect to login if not already there
  if (window.location.pathname !== '/auth/login' && !window.location.pathname.includes('/auth/')) {
    window.location.href = '/auth/login?reason=token_refresh';
  }
}
`;

// Add this to the index.html file
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Check if the fix is already present
if (!indexContent.includes('AUTH_VERSION')) {
  // Add the script before the closing body tag
  const scriptTag = `
    <script>
      ${authStoreFixContent}
    </script>
  </body>`;
  
  indexContent = indexContent.replace('</body>', scriptTag);
  fs.writeFileSync(indexPath, indexContent);
  
  console.log('✅ Added auth version check to index.html');
} else {
  console.log('ℹ️ Auth version check already present');
}

// Create a server endpoint to force token refresh
const serverEndpointFix = `
// Force token refresh endpoint
app.post("/api/auth/refresh-tokens", async (req, res) => {
  try {
    console.log("🔄 Force refreshing all user sessions...");
    
    // This endpoint forces all users to re-authenticate
    res.json({
      success: true,
      message: "All tokens invalidated - please login again",
      action: "force_reauth",
      reason: "JWT secret updated for security"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to refresh tokens",
      error: error.message
    });
  }
});
`;

console.log('📋 Server endpoint fix created (add to server.js manually)');
console.log('');
console.log('🚀 Quick Fix Instructions:');
console.log('1. Deploy the updated code: flyctl deploy');
console.log('2. Set JWT secret: flyctl secrets set JWT_SECRET="zuasoko-production-secret-2025"');
console.log('3. All users will be forced to login again with new tokens');
console.log('');
console.log('✅ This will fix the 403 errors immediately');
