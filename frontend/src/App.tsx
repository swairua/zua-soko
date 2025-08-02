import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Import environment test in development
if (import.meta.env.DEV) {
  import("./utils/test-environment");
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Router>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center text-green-600">
                  🌾 Zuasoko Agricultural Platform
                </h1>
                <p className="text-center mt-4 text-gray-600">
                  Environment configuration is complete and validated!
                </p>
                {import.meta.env.DEV && (
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-blue-800">Development Mode</h2>
                    <p className="text-blue-600 mt-2">
                      Check the browser console to see environment validation results.
                    </p>
                    <div className="mt-4 text-sm text-blue-700">
                      <strong>Current Environment:</strong>
                      <ul className="list-disc list-inside mt-2">
                        <li>API URL: {import.meta.env.VITE_API_URL || 'Not configured'}</li>
                        <li>App Name: {import.meta.env.VITE_APP_NAME || 'Default'}</li>
                        <li>Mode: {import.meta.env.MODE}</li>
                        <li>Debug: {import.meta.env.VITE_DEBUG || 'false'}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            } />
            <Route path="*" element={
              <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
                <p className="text-gray-600 mt-2">This is a simplified App for environment testing.</p>
              </div>
            } />
          </Routes>
        </main>
      </Router>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
