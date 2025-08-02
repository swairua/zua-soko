// Environment validation tests
// Note: These tests validate the environment utility functions

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock import.meta.env
const mockEnv = {
  VITE_API_URL: 'https://api.example.com',
  VITE_APP_NAME: 'Test App',
  VITE_FRONTEND_URL: 'https://app.example.com',
  VITE_DEBUG: 'true',
  MODE: 'test',
  DEV: false,
  PROD: false,
  SSR: false
};

// Mock import.meta
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockEnv
    }
  }
});

// Import functions after mocking
import { 
  validateEnvironment, 
  getEnvironmentConfig, 
  getApiUrl, 
  getAppName,
  getFrontendUrl,
  getDebugMode,
  getViteEnvironmentVars
} from '../env';

describe('Environment Utilities', () => {
  beforeEach(() => {
    // Reset console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  describe('validateEnvironment', () => {
    it('should not throw error when required variables are present', () => {
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should warn in development when variables are missing', () => {
      const originalEnv = { ...mockEnv };
      delete (mockEnv as any).VITE_API_URL;
      mockEnv.DEV = true;
      
      expect(() => validateEnvironment()).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
      
      // Restore
      Object.assign(mockEnv, originalEnv);
    });
  });

  describe('getApiUrl', () => {
    it('should return VITE_API_URL when set', () => {
      expect(getApiUrl()).toBe('https://api.example.com');
    });

    it('should return fallback for production when VITE_API_URL is not set', () => {
      const originalUrl = mockEnv.VITE_API_URL;
      delete (mockEnv as any).VITE_API_URL;
      mockEnv.PROD = true;
      
      expect(getApiUrl()).toBe('/api');
      
      // Restore
      mockEnv.VITE_API_URL = originalUrl;
      mockEnv.PROD = false;
    });

    it('should return localhost fallback for development when VITE_API_URL is not set', () => {
      const originalUrl = mockEnv.VITE_API_URL;
      delete (mockEnv as any).VITE_API_URL;
      mockEnv.DEV = true;
      
      expect(getApiUrl()).toBe('http://localhost:5002/api');
      
      // Restore
      mockEnv.VITE_API_URL = originalUrl;
      mockEnv.DEV = false;
    });
  });

  describe('getAppName', () => {
    it('should return VITE_APP_NAME when set', () => {
      expect(getAppName()).toBe('Test App');
    });

    it('should return default when VITE_APP_NAME is not set', () => {
      const originalName = mockEnv.VITE_APP_NAME;
      delete (mockEnv as any).VITE_APP_NAME;
      
      expect(getAppName()).toBe('Zuasoko');
      
      // Restore
      mockEnv.VITE_APP_NAME = originalName;
    });
  });

  describe('getFrontendUrl', () => {
    it('should return VITE_FRONTEND_URL when set', () => {
      expect(getFrontendUrl()).toBe('https://app.example.com');
    });

    it('should return window.location.origin in production when not set', () => {
      const originalUrl = mockEnv.VITE_FRONTEND_URL;
      delete (mockEnv as any).VITE_FRONTEND_URL;
      mockEnv.PROD = true;
      
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://production.example.com' },
        writable: true
      });
      
      expect(getFrontendUrl()).toBe('https://production.example.com');
      
      // Restore
      mockEnv.VITE_FRONTEND_URL = originalUrl;
      mockEnv.PROD = false;
    });
  });

  describe('getDebugMode', () => {
    it('should return true when VITE_DEBUG is "true"', () => {
      expect(getDebugMode()).toBe(true);
    });

    it('should return false when VITE_DEBUG is "false"', () => {
      mockEnv.VITE_DEBUG = 'false';
      expect(getDebugMode()).toBe(false);
    });

    it('should return true in development mode even when VITE_DEBUG is not set', () => {
      delete (mockEnv as any).VITE_DEBUG;
      mockEnv.DEV = true;
      
      expect(getDebugMode()).toBe(true);
      
      // Restore
      mockEnv.VITE_DEBUG = 'true';
      mockEnv.DEV = false;
    });
  });

  describe('getViteEnvironmentVars', () => {
    it('should return only VITE_ prefixed variables', () => {
      const viteVars = getViteEnvironmentVars();
      
      expect(viteVars).toHaveProperty('VITE_API_URL');
      expect(viteVars).toHaveProperty('VITE_APP_NAME');
      expect(viteVars).toHaveProperty('VITE_FRONTEND_URL');
      expect(viteVars).toHaveProperty('VITE_DEBUG');
      
      expect(viteVars).not.toHaveProperty('MODE');
      expect(viteVars).not.toHaveProperty('DEV');
      expect(viteVars).not.toHaveProperty('PROD');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return complete configuration object', () => {
      const config = getEnvironmentConfig();
      
      expect(config).toHaveProperty('apiUrl');
      expect(config).toHaveProperty('appName');
      expect(config).toHaveProperty('frontendUrl');
      expect(config).toHaveProperty('isDevelopment');
      expect(config).toHaveProperty('isProduction');
      expect(config).toHaveProperty('debugMode');
      
      expect(typeof config.apiUrl).toBe('string');
      expect(typeof config.appName).toBe('string');
      expect(typeof config.frontendUrl).toBe('string');
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.isProduction).toBe('boolean');
      expect(typeof config.debugMode).toBe('boolean');
    });
  });
});
