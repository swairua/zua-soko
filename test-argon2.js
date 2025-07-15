const argon2 = require("argon2");

async function testArgon2() {
  try {
    console.log("🧪 Testing Argon2 password hashing...");

    const password = "password123";
    console.log(`📝 Original password: ${password}`);

    // Hash the password
    const hashedPassword = await argon2.hash(password);
    console.log(`🔒 Hashed password: ${hashedPassword}`);

    // Verify the password
    const isValid = await argon2.verify(hashedPassword, password);
    console.log(`✅ Password verification: ${isValid}`);

    // Test with wrong password
    const isInvalid = await argon2.verify(hashedPassword, "wrongpassword");
    console.log(`❌ Wrong password verification: ${isInvalid}`);

    if (isValid && !isInvalid) {
      console.log("🎉 Argon2 is working correctly!");
      process.exit(0);
    } else {
      console.log("💥 Argon2 test failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Error testing Argon2:", error);
    process.exit(1);
  }
}

testArgon2();
