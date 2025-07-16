import React, { useState, useEffect } from "react";
import { Database, Wifi, WifiOff } from "lucide-react";
import { apiService } from "../services/api";

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    database: string;
    loading: boolean;
  }>({
    connected: false,
    database: "checking...",
    loading: true,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await apiService.getHealth();
        setStatus({
          connected: health.status === "OK",
          database: health.database || "unknown",
          loading: false,
        });
      } catch (error) {
        setStatus({
          connected: true, // Consider demo mode as "connected"
          database: "demo",
          loading: false,
        });
      }
    };

    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (status.loading) {
    return null; // Don't show while loading
  }

  const isRealDatabase = status.database === "connected";
  const isDemoMode = status.database === "demo";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          isRealDatabase
            ? "bg-green-100 text-green-800 border border-green-200"
            : isDemoMode
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
        }`}
      >
        {isRealDatabase ? (
          <>
            <Database className="w-4 h-4" />
            <span>Render.com DB</span>
            <Wifi className="w-4 h-4" />
          </>
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
            <WifiOff className="w-4 h-4" />
          </>
        )}
      </div>
    </div>
  );
}
