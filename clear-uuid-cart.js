// Clear all cart storage that might contain UUID data
console.log("🗑️ Clearing all cart storage to remove UUID contamination...");

try {
  // Clear localStorage entries
  const keys = ['cart-storage', 'cart', 'cartItems', 'cart-data'];
  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Removing localStorage: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage entries
  keys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.log(`🗑️ Removing sessionStorage: ${key}`);
      sessionStorage.removeItem(key);
    }
  });

  console.log("✅ Cart storage cleared successfully");
  console.log("🔄 Please refresh the page to see the clean cart state");
  
} catch (error) {
  console.error("❌ Error clearing cart storage:", error);
}
