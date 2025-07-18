import React, { useState, useEffect } from "react";
import { Database, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { apiService } from "../services/api";

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    database: string;
    loading: boolean;
    error: boolean;
  }>({
    connected: false,
    database: "checking...",
    loading: true,
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
  }, []);

  if (status.loading) {
    return null; // Don't show while loading
  }

  const isRealDatabase = status.database === "connected";
  const hasError = status.error || status.database.includes("error");

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
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
          <>
            <Database className="w-4 h-4" />
            <span>Render.com DB</span>
            <Wifi className="w-4 h-4" />
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            <span>Demo Mode</span>
            <WifiOff className="w-4 h-4" />
          </>
        )}
      </div>
    </div>
  );
}
