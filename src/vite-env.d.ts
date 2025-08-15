/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Required environment variables
  readonly VITE_API_URL: string;
  
  // Optional environment variables
  readonly VITE_APP_NAME?: string;
  readonly VITE_FRONTEND_URL?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_DEV_MODE?: string;
  
  // Optional external service integrations
  readonly VITE_MAPBOX_TOKEN?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  
  // Feature flags
  readonly VITE_ENABLE_MOCK_DATA?: string;
  readonly VITE_ENABLE_DEBUG_PANEL?: string;
  readonly VITE_SHOW_PERFORMANCE_METRICS?: string;
  
  // Vite built-in environment variables
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type definitions for environment configuration
declare global {
  interface Window {
    // Development tools
    __VITE_ENV_DEBUG__?: () => void;
    __ZUASOKO_CONFIG__?: {
      apiUrl: string;
      appName: string;
      version: string;
      environment: string;
    };
  }
}

export {};
