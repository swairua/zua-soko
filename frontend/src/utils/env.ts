// Environment variable validation for production readiness

export const validateEnvironment = () => {
  const requiredVars = ['VITE_API_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    if (import.meta.env.PROD) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};

export const getAppName = () => {
  return import.meta.env.VITE_APP_NAME || 'Zuasoko';
};

// Log environment info in development
if (import.meta.env.DEV) {
  console.log('🔧 Environment Variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });
}
