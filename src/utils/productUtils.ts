/**
 * Utility functions for product ID validation and cleanup
 */

/**
 * Check if a product ID is valid (should be a positive integer)
 */
export const isValidProductId = (id: string | number): boolean => {
  if (typeof id === 'number') {
    return Number.isInteger(id) && id > 0;
  }
  
  if (typeof id === 'string') {
    // Check if it's a valid integer string
    const num = parseInt(id, 10);
    return /^\d+$/.test(id) && Number.isInteger(num) && num > 0;
  }
  
  return false;
};

/**
 * Check if a product ID is a UUID (old format)
 */
export const isUUID = (id: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

/**
 * Clean up localStorage and sessionStorage from old UUID-based data
 */
export const cleanupOldProductData = (): void => {
  try {
    // List of storage keys that might contain old product data
    const keysToCheck = ['cart-storage', 'recent-products', 'favorite-products', 'viewed-products'];
    
    for (const key of keysToCheck) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          let modified = false;
          
          // Check for cart items with UUID product IDs
          if (parsed.items && Array.isArray(parsed.items)) {
            const originalLength = parsed.items.length;
            parsed.items = parsed.items.filter((item: any) => {
              if (item.productId && isUUID(item.productId)) {
                console.log('🧹 Removing cart item with old UUID:', item.productId);
                return false;
              }
              return true;
            });
            
            if (parsed.items.length !== originalLength) {
              modified = true;
            }
          }
          
          // Check for direct product arrays
          if (Array.isArray(parsed)) {
            const originalLength = parsed.length;
            const filtered = parsed.filter((item: any) => {
              if (item.id && isUUID(item.id)) {
                console.log('🧹 Removing product with old UUID:', item.id);
                return false;
              }
              return true;
            });
            
            if (filtered.length !== originalLength) {
              localStorage.setItem(key, JSON.stringify(filtered));
              console.log(`🧹 Cleaned up ${originalLength - filtered.length} old products from ${key}`);
            }
          } else if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed));
            console.log(`🧹 Cleaned up old product data from ${key}`);
          }
        } catch (error) {
          console.warn(`Failed to parse data from ${key}:`, error);
        }
      }
      
      // Also check sessionStorage
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((item: any) => {
              if (item.id && isUUID(item.id)) {
                return false;
              }
              return true;
            });
            sessionStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch (error) {
          console.warn(`Failed to parse session data from ${key}:`, error);
        }
      }
    }
    
    console.log('✅ Completed cleanup of old product data');
  } catch (error) {
    console.error('❌ Error during product data cleanup:', error);
  }
};

/**
 * Convert old product data to use new integer IDs
 * This is a mapping function for known products
 */
export const getNewProductId = (oldId: string): string | null => {
  // This would need to be populated with actual mappings if we had them
  // For now, we'll just return null for any UUID to force re-fetching
  if (isUUID(oldId)) {
    return null;
  }
  return oldId;
};
