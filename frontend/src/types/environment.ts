// TypeScript types for environment configuration

export interface EnvironmentConfig {
  apiUrl: string;
  appName: string;
  frontendUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  debugMode: boolean;
}

export interface OptionalEnvironmentConfig {
  mapboxToken?: string;
  sentryDsn?: string;
  analyticsId?: string;
  stripePublicKey?: string;
  enableMockData?: boolean;
  enableDebugPanel?: boolean;
  showPerformanceMetrics?: boolean;
}

export interface FullEnvironmentConfig extends EnvironmentConfig, OptionalEnvironmentConfig {}

// Environment variable validation types
export type RequiredEnvVar = 'VITE_API_URL';

export type OptionalEnvVar = 
  | 'VITE_APP_NAME'
  | 'VITE_FRONTEND_URL'
  | 'VITE_DEBUG'
  | 'VITE_DEV_MODE'
  | 'VITE_MAPBOX_TOKEN'
  | 'VITE_SENTRY_DSN'
  | 'VITE_ANALYTICS_ID'
  | 'VITE_STRIPE_PUBLIC_KEY'
  | 'VITE_ENABLE_MOCK_DATA'
  | 'VITE_ENABLE_DEBUG_PANEL'
  | 'VITE_SHOW_PERFORMANCE_METRICS';

export type AllEnvVar = RequiredEnvVar | OptionalEnvVar;

// API configuration types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  debugMode: boolean;
  environment: 'development' | 'production';
}

// Development tools types
export interface DevelopmentTools {
  showDebugInfo: boolean;
  enableMocking: boolean;
  logApiCalls: boolean;
  showPerformanceMetrics: boolean;
}

// Error types for environment validation
export class EnvironmentValidationError extends Error {
  constructor(
    message: string,
    public missingVars: string[],
    public environment: string
  ) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

export interface EnvironmentValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
  config: EnvironmentConfig;
}
