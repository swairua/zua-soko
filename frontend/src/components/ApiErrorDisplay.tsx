import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';

interface ErrorDetails {
  title: string;
  details: string;
  errorDetails: any;
}

export const ApiErrorDisplay: React.FC = () => {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleApiError = (event: CustomEvent) => {
      const { title, details, errorDetails } = event.detail;
      
      setErrors(prev => [
        {
          title,
          details,
          errorDetails,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 4) // Keep only last 5 errors
      ]);
    };

    window.addEventListener('api-error-details', handleApiError as EventListener);
    
    return () => {
      window.removeEventListener('api-error-details', handleApiError as EventListener);
    };
  }, []);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearErrors = () => {
    setErrors([]);
    setExpandedErrors(new Set());
  };

  const retryLastRequest = () => {
    window.location.reload();
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-sm font-medium text-red-800">
                API Error Details ({errors.length})
              </h3>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={retryLastRequest}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Retry"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={clearErrors}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Clear errors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {errors.map((error, index) => (
              <div key={index} className="border border-red-200 rounded bg-white">
                <div
                  className="p-3 cursor-pointer hover:bg-red-50"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-800">
                        {error.title}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        {error.errorDetails?.request?.method} {error.errorDetails?.request?.url}
                      </div>
                      <div className="text-xs text-red-500">
                        Status: {error.errorDetails?.response?.status || 'Network Error'}
                      </div>
                    </div>
                    {expandedErrors.has(index) ? (
                      <ChevronUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                {expandedErrors.has(index) && (
                  <div className="px-3 pb-3">
                    <div className="bg-gray-50 rounded p-3 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Full Error Details:</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(error.errorDetails, null, 2))}
                          className="flex items-center text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-gray-600">
                        <div>
                          <strong>URL:</strong> {error.errorDetails?.request?.url}
                        </div>
                        <div>
                          <strong>Method:</strong> {error.errorDetails?.request?.method}
                        </div>
                        <div>
                          <strong>Status:</strong> {error.errorDetails?.response?.status} {error.errorDetails?.response?.statusText}
                        </div>
                        <div>
                          <strong>Error Code:</strong> {error.errorDetails?.network?.code}
                        </div>
                        <div>
                          <strong>Error Message:</strong> {error.errorDetails?.network?.message}
                        </div>
                        <div>
                          <strong>Network Error:</strong> {error.errorDetails?.network?.isNetworkError ? 'Yes' : 'No'}
                        </div>
                        
                        {error.errorDetails?.response?.data && (
                          <div>
                            <strong>Response Data:</strong>
                            <pre className="mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
                              {typeof error.errorDetails.response.data === 'object' 
                                ? JSON.stringify(error.errorDetails.response.data, null, 2)
                                : error.errorDetails.response.data}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Troubleshooting:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        {error.errorDetails?.network?.isNetworkError && (
                          <li>• Check if backend server is running</li>
                        )}
                        {error.errorDetails?.response?.status === 404 && (
                          <li>• API endpoint might not exist or be incorrectly defined</li>
                        )}
                        {error.errorDetails?.response?.status === 500 && (
                          <li>• Server internal error - check backend logs</li>
                        )}
                        {error.errorDetails?.response?.status === 502 && (
                          <li>• Server temporarily unavailable - try again later</li>
                        )}
                        <li>• Check browser console for more details</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiErrorDisplay;
