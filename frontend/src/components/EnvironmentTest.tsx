import React from 'react';
import { getEnvironmentConfig, getViteEnvironmentVars, logEnvironmentInfo } from '../utils/env';

/**
 * Development component for testing environment configuration
 * Only rendered in development mode
 */
export const EnvironmentTest: React.FC = () => {
  if (import.meta.env.PROD) {
    return null; // Don't render in production
  }

  const config = getEnvironmentConfig();
  const viteVars = getViteEnvironmentVars();

  const handleLogEnvironment = () => {
    logEnvironmentInfo();
  };

  const handleTestApiConnection = async () => {
    try {
      const response = await fetch(config.apiUrl + '/health');
      const data = await response.json();
      console.log('✅ API Connection Test Success:', data);
      alert('API connection successful! Check console for details.');
    } catch (error) {
      console.error('❌ API Connection Test Failed:', error);
      alert('API connection failed! Check console for details.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-sm font-bold mb-2">🔧 Environment Test Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Mode:</strong> {import.meta.env.MODE}
        </div>
        <div>
          <strong>API URL:</strong> 
          <br />
          <code className="bg-gray-800 px-1 rounded text-green-400">
            {config.apiUrl}
          </code>
        </div>
        <div>
          <strong>App Name:</strong> {config.appName}
        </div>
        <div>
          <strong>Debug Mode:</strong> {config.debugMode ? '✅' : '❌'}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <button
          onClick={handleLogEnvironment}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Log Environment Info
        </button>
        <button
          onClick={handleTestApiConnection}
          className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Test API Connection
        </button>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-gray-300">
          Show All VITE_ Variables
        </summary>
        <div className="mt-1 text-xs">
          {Object.entries(viteVars).map(([key, value]) => (
            <div key={key} className="truncate">
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default EnvironmentTest;
