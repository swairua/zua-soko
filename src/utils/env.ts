// Comprehensive environment variable management and validation

export interface EnvironmentConfig {
  apiUrl: string;
  appName: string;
  frontendUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  debugMode: boolean;
}

// Required environment variables
const REQUIRED_VARS = [
  'VITE_API_URL'
] as const;

// Optional environment variables with defaults
const OPTIONAL_VARS = {
  VITE_APP_NAME: 'Zuasoko',
  VITE_FRONTEND_URL: '',
  VITE_DEBUG: 'false',
  VITE_DEV_MODE: 'false'
} as const;

/**
 * Validates that all required environment variables are present
 * Throws an error in production if any are missing
 */
export const validateEnvironment = (): void => {
  const missing = REQUIRED_VARS.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    
    console.group('❌ ENVIRONMENT VALIDATION FAILED');
    console.error('Missing variables:', missing);
    console.error('Available env vars:', Object.keys(import.meta.env));
    console.error('Mode:', import.meta.env.MODE);
    console.groupEnd();
    
    if (import.meta.env.PROD) {
      // In production, this should cause the app to fail fast
      throw new Error(errorMessage);
    } else {
      // In development, log warning but continue
      console.warn('⚠️', errorMessage);
      console.warn('App will continue in development mode with fallback values');
    }
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

/**
 * Gets the current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Ensure environment is validated first
  validateEnvironment();
  
  const config: EnvironmentConfig = {
    apiUrl: getApiUrl(),
    appName: getAppName(),
    frontendUrl: getFrontendUrl(),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    debugMode: getDebugMode()
  };
  
  // Log configuration in development
  if (import.meta.env.DEV) {
    console.group('🔧 Environment Configuration');
    console.log('Config:', config);
    console.log('Raw env vars:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
      MODE: import.meta.env.MODE
    });
    console.groupEnd();
  }
  
  return config;
};

/**
 * Gets the API URL with fallback logic
 */
export const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Check if we're running in a cloud environment (not localhost)
  const isCloudEnvironment = typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  // If running in cloud environment, always use relative API paths
  if (isCloudEnvironment) {
    console.log('🌐 Cloud environment detected, using relative API path');
    return '/api';
  }

  if (apiUrl) {
    return apiUrl;
  }

  // Fallback logic based on environment
  if (import.meta.env.PROD) {
    return '/api'; // Relative to current domain in production
  } else {
    return 'http://localhost:5004/api'; // Default development API (updated port)
  }
};

/**
 * Gets the app name
 */
export const getAppName = (): string => {
  return import.meta.env.VITE_APP_NAME || OPTIONAL_VARS.VITE_APP_NAME;
};

/**
 * Gets the frontend URL
 */
export const getFrontendUrl = (): string => {
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
  
  if (frontendUrl) {
    return frontendUrl;
  }
  
  // Auto-detect frontend URL
  if (import.meta.env.PROD) {
    return window.location.origin;
  } else {
    return 'http://localhost:3000';
  }
};

/**
 * Gets debug mode setting
 */
export const getDebugMode = (): boolean => {
  const debug = import.meta.env.VITE_DEBUG;
  return debug === 'true' || import.meta.env.DEV;
};

/**
 * Gets all environment variables with the VITE_ prefix
 */
export const getViteEnvironmentVars = (): Record<string, string> => {
  const viteVars: Record<string, string> = {};
  
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      viteVars[key] = import.meta.env[key];
    }
  });
  
  return viteVars;
};

/**
 * Development helper to log all environment information
 */
export const logEnvironmentInfo = (): void => {
  if (!import.meta.env.DEV) return;
  
  console.group('🌍 Environment Information');
  console.log('Mode:', import.meta.env.MODE);
  console.log('Is Development:', import.meta.env.DEV);
  console.log('Is Production:', import.meta.env.PROD);
  console.log('Config:', getEnvironmentConfig());
  console.log('All VITE_ vars:', getViteEnvironmentVars());
  console.groupEnd();
};

// Auto-validate and log in development
if (import.meta.env.DEV) {
  logEnvironmentInfo();
}
