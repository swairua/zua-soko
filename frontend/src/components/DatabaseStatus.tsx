import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Database, Wifi, WifiOff, AlertCircle } from "lucide-react";
=======
import { Database, Wifi, WifiOff } from "lucide-react";
>>>>>>> origin/main
import { apiService } from "../services/api";

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    database: string;
    loading: boolean;
<<<<<<< HEAD
    error: boolean;
=======
>>>>>>> origin/main
  }>({
    connected: false,
    database: "checking...",
    loading: true,
<<<<<<< HEAD
    error: false,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await apiService.getHealth();
        setStatus({
          connected: health.status === "OK",
          database: health.database || "unknown",
          loading: false,
          error: false,
        });
      } catch (error: any) {
        console.warn("Health check failed:", error.message);
        setStatus({
          connected: false,
          database: "error",
          loading: false,
          error: true,
        });
      }
    };

    checkStatus();
    // Check every 60 seconds (reduced frequency to avoid spam)
    const interval = setInterval(checkStatus, 60000);

    return () => clearInterval(interval);
=======
  });

  useEffect(() => {
    // Set to connected state without health check
    setStatus({
      connected: true,
      database: "connected",
      loading: false,
    });
>>>>>>> origin/main
  }, []);

  if (status.loading) {
    return null; // Don't show while loading
  }

  const isRealDatabase = status.database === "connected";
<<<<<<< HEAD
  const hasError = status.error || status.database.includes("error");
=======
  const isDemoMode = status.database === "demo";
>>>>>>> origin/main

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
<<<<<<< HEAD
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 ${
          hasError
            ? "bg-red-100 text-red-800 border border-red-200"
            : isRealDatabase
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
        }`}
      >
        {hasError ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>API Error</span>
            <WifiOff className="w-4 h-4" />
          </>
        ) : isRealDatabase ? (
=======
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          isRealDatabase
            ? "bg-green-100 text-green-800 border border-green-200"
            : isDemoMode
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
        }`}
      >
        {isRealDatabase ? (
>>>>>>> origin/main
          <>
            <Database className="w-4 h-4" />
            <span>Render.com DB</span>
            <Wifi className="w-4 h-4" />
          </>
<<<<<<< HEAD
        ) : (
          <>
            <Database className="w-4 h-4" />
            <span>Demo Mode</span>
=======
        ) : isDemoMode ? (
          <>
            <Database className="w-4 h-4" />
            <span>Demo Mode</span>
            <Wifi className="w-4 h-4" />
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            <span>Disconnected</span>
>>>>>>> origin/main
            <WifiOff className="w-4 h-4" />
          </>
        )}
      </div>
    </div>
  );
}
