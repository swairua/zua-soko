import React, { useState } from 'react';
import { apiService } from '../services/api';

export default function ApiDebugTest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, name: string) => {
    try {
      setLoading(true);
      console.log(`🧪 Testing ${name}: ${endpoint}`);
      const response = await apiService.get(endpoint);
      console.log(`✅ ${name} success:`, response);
      setResults(prev => ({ ...prev, [name]: { success: true, data: response.data || response } }));
    } catch (error: any) {
      console.error(`❌ ${name} error:`, error);
      console.error(`❌ ${name} status:`, error.response?.status);
      console.error(`❌ ${name} data:`, JSON.stringify(error.response?.data, null, 2));
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">API Debug Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={() => testEndpoint('/test', 'Basic Test')}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Basic Endpoint (/api/test)
        </button>

        <button
          onClick={() => testEndpoint('/health', 'Health Check')}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Health Endpoint (/api/health)
        </button>

        <button
          onClick={() => testEndpoint('/admin/test', 'Admin Test')}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Admin Auth (/api/admin/test)
        </button>

        <button
          onClick={() => testEndpoint('/admin/users', 'Admin Users')}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Admin Users (/api/admin/users)
        </button>
      </div>

      {loading && <p className="text-blue-500 mt-4">Testing...</p>}

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Results:</h4>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
}
