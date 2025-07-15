import React, { useEffect, useState } from "react";

interface HMRHealthCheckProps {
  show?: boolean;
}

export default function HMRHealthCheck({ show = false }: HMRHealthCheckProps) {
  const [hmrStatus, setHmrStatus] = useState<
    "connected" | "disconnected" | "error"
  >("connected");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!show || process.env.NODE_ENV !== "development") return;

    // Check HMR connection status
    const checkHMR = () => {
      try {
        // Test if HMR is working by checking for Vite client
        if (window.__vite_plugin_react_preamble_installed__) {
          setHmrStatus("connected");
          setLastUpdate(new Date());
        } else {
          setHmrStatus("disconnected");
        }
      } catch (error) {
        console.warn("HMR health check error:", error);
        setHmrStatus("error");
      }
    };

    checkHMR();
    const interval = setInterval(checkHMR, 5000);

    // Listen for HMR events
    const handleViteUpdate = () => {
      setHmrStatus("connected");
      setLastUpdate(new Date());
    };

    // Only add listener if we're in development
    if (import.meta.hot) {
      import.meta.hot.on("vite:beforeUpdate", handleViteUpdate);
    }

    return () => {
      clearInterval(interval);
    };
  }, [show]);

  if (!show || process.env.NODE_ENV !== "development") {
    return null;
  }

  const getStatusColor = () => {
    switch (hmrStatus) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (hmrStatus) {
      case "connected":
        return "🟢 HMR Connected";
      case "disconnected":
        return "🟡 HMR Disconnected";
      case "error":
        return "🔴 HMR Error";
      default:
        return "⚪ HMR Unknown";
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className={`font-medium ${getStatusColor()}`}>{getStatusText()}</div>
      <div className="text-gray-500 text-xs mt-1">
        Last: {lastUpdate.toLocaleTimeString()}
      </div>
      {hmrStatus === "error" && (
        <div className="text-xs text-red-600 mt-1">
          Check browser console for errors
        </div>
      )}
    </div>
  );
}

// Global type declaration for Vite HMR
declare global {
  interface Window {
    __vite_plugin_react_preamble_installed__?: boolean;
  }
}
