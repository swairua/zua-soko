// Simple environment validation test
import { validateEnvironment, getEnvironmentConfig } from './env';

/**
 * Test environment configuration and log results
 * This can be run manually to validate the environment setup
 */
export const testEnvironmentConfiguration = () => {
  console.group('🧪 Environment Configuration Test');
  
  try {
    // Test validation
    console.log('1. Testing environment validation...');
    validateEnvironment();
    console.log('✅ Environment validation passed');
    
    // Test configuration
    console.log('2. Testing configuration retrieval...');
    const config = getEnvironmentConfig();
    console.log('✅ Configuration retrieved successfully:', config);
    
    // Test API URL
    console.log('3. Testing API URL...');
    if (config.apiUrl) {
      console.log('✅ API URL is configured:', config.apiUrl);
    } else {
      console.warn('⚠️ API URL is not configured');
    }
    
    // Test environment mode
    console.log('4. Testing environment mode...');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Is Development:', config.isDevelopment);
    console.log('Is Production:', config.isProduction);
    console.log('Debug Mode:', config.debugMode);
    
    console.log('🎉 All environment tests passed!');
    
  } catch (error) {
    console.error('❌ Environment test failed:', error);
  }
  
  console.groupEnd();
  
  return {
    status: 'completed',
    timestamp: new Date().toISOString()
  };
};

// Auto-run in development
if (import.meta.env.DEV) {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testEnvironmentConfiguration();
  }, 1000);
}

export default testEnvironmentConfiguration;
