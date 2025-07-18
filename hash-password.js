const crypto = require("crypto");

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// Calculate hashes for the passwords the user is trying
console.log('Hash for "password123":', hashPassword("password123"));
console.log('Hash for "admin123":', hashPassword("admin123"));
console.log('Hash for "farmer123":', hashPassword("farmer123"));
console.log('Hash for "customer123":', hashPassword("customer123"));
