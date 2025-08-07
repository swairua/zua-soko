import React from 'react';
import { apiService } from '../services/api';
import { Bug, Zap, AlertTriangle, Server } from 'lucide-react';

export const ApiErrorTester: React.FC = () => {
  const testError404 = async () => {
    try {
      await apiService.get('/nonexistent-endpoint');
    } catch (error) {
      console.log('404 error triggered for testing');
    }
  };

  const testError500 = async () => {
    try {
      await apiService.post('/test-500-error', {});
    } catch (error) {
      console.log('500 error triggered for testing');
    }
  };

  const testNetworkError = async () => {
    try {
      const wrongApi = apiService;
      wrongApi.defaults.baseURL = 'http://localhost:9999';
      await wrongApi.get('/api/status');
    } catch (error) {
      console.log('Network error triggered for testing');
    }
  };

  const testAuthError = async () => {
    try {
      // Clear token and try to access protected endpoint
      localStorage.removeItem('authToken');
      await apiService.get('/admin/users');
    } catch (error) {
      console.log('Auth error triggered for testing');
    }
  };

  return (
    <div className="fixed top-4 left-4 z-40 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
        <Bug className="h-4 w-4 mr-2" />
        API Error Tester
      </h3>
      <div className="space-y-2">
        <button
          onClick={testError404}
          className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm flex items-center"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Test 404 Error
        </button>
        <button
          onClick={testError500}
          className="w-full bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm flex items-center"
        >
          <Server className="h-4 w-4 mr-2" />
          Test 500 Error
        </button>
        <button
          onClick={testNetworkError}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm flex items-center"
        >
          <Zap className="h-4 w-4 mr-2" />
          Test Network Error
        </button>
        <button
          onClick={testAuthError}
          className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded text-sm flex items-center"
        >
          <Bug className="h-4 w-4 mr-2" />
          Test Auth Error
        </button>
      </div>
    </div>
  );
};

export default ApiErrorTester;
