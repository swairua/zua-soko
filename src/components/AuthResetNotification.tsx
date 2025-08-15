import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCcw, X } from 'lucide-react';

export const AuthResetNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if this is a token refresh redirect
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    
    if (reason === 'token_refresh' || reason === '403_error') {
      setShowNotification(true);
      
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <RefreshCcw className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Authentication Updated
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              We've updated our security system. Please login again to continue using the platform.
            </p>
            <div className="mt-2">
              <div className="flex items-center text-xs text-blue-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Your data is safe and secure
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className="bg-blue-50 rounded-md p-1.5 text-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthResetNotification;
