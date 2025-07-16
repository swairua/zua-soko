// Network error handler utility
export const handleNetworkError = (error: any): string => {
  if (!navigator.onLine) {
    return "No internet connection. Please check your network and try again.";
  }

  if (
    error?.name === "TypeError" &&
    error?.message?.includes("Failed to fetch")
  ) {
    return "Unable to connect to server. The service may be temporarily unavailable.";
  }

  if (
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("Network Error")
  ) {
    return "Network error occurred. Please try again.";
  }

  if (error?.response?.status >= 500) {
    return "Server error occurred. Please try again later.";
  }

  if (error?.response?.status === 404) {
    return "The requested resource was not found.";
  }

  if (error?.response?.status === 401) {
    return "Authentication required. Please log in.";
  }

  if (error?.response?.status === 403) {
    return "Access denied. You do not have permission to access this resource.";
  }

  return error?.message || "An unexpected error occurred.";
};

// Retry utility for failed requests
export const retryFetch = async (
  fetchFunction: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFunction();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      // Don't retry on auth errors or client errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Check if we're in a Vite development environment with HMR issues
export const isHMRError = (error: any): boolean => {
  const errorMessage = error?.message || error?.toString() || "";
  const errorStack = error?.stack || "";
  const errorFilename = error?.filename || "";

  return (
    errorMessage.includes("vite") ||
    errorMessage.includes("HMR") ||
    errorMessage.includes("@vite/client") ||
    errorMessage.includes("waitForSuccessfulPing") ||
    errorMessage.includes("HMR connection suppressed") ||
    errorStack.includes("@vite/client") ||
    errorStack.includes("ping") ||
    errorStack.includes("edge.fullstory.com") ||
    errorStack.includes("24f0659a90184252a93b6fc911098462") ||
    errorStack.includes("fly.dev") ||
    errorFilename.includes("@vite/client") ||
    // Check for WebSocket-related HMR errors
    (errorMessage.includes("Failed to fetch") &&
      (errorStack.includes("ping") ||
        errorStack.includes("WebSocket") ||
        errorStack.includes("messageHandler"))) ||
    // Check for the specific error pattern we're seeing
    (errorMessage.includes("Failed to fetch") &&
      errorStack.includes("eval at messageHandler"))
  );
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections - more aggressive suppression
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      // Ignore HMR-related errors in any environment
      if (isHMRError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        // Completely silent in production, minimal logging in dev
        if (!import.meta.env.PROD) {
          console.debug(
            "HMR error suppressed:",
            event.reason?.message || "Connection issue",
          );
        }
        return false;
      }

      // Only log real errors in development
      if (!import.meta.env.PROD) {
        console.error("Unhandled promise rejection:", event.reason);
      }
    },
    true,
  ); // Use capture phase

  // Handle global JavaScript errors - more aggressive suppression
  window.addEventListener(
    "error",
    (event) => {
      // Ignore HMR-related errors in any environment
      if (
        isHMRError(event.error) ||
        (event.message &&
          isHMRError({ message: event.message, stack: event.error?.stack }))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        // Completely silent in production, minimal logging in dev
        if (!import.meta.env.PROD) {
          console.debug(
            "HMR error suppressed:",
            event.message || event.error?.message || "Connection issue",
          );
        }
        return false;
      }

      // Only log real errors in development
      if (!import.meta.env.PROD) {
        console.error("Global error:", event.error);
      }
    },
    true,
  ); // Use capture phase

  // Specifically handle WebSocket errors that might be related to HMR
  const originalWebSocket = window.WebSocket;
  window.WebSocket = class extends originalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols);

      this.addEventListener("error", (event) => {
        const urlString = url.toString();
        // Suppress HMR WebSocket errors
        if (
          urlString.includes("vite") ||
          urlString.includes("hmr") ||
          urlString.includes("ws") ||
          urlString.includes("fly.dev")
        ) {
          event.preventDefault();
          if (!import.meta.env.PROD) {
            console.warn(
              "WebSocket error (HMR-related, suppressed):",
              urlString,
            );
          }
        }
      });
    }
  };

  // Disable Vite's error overlay in production
  if (
    import.meta.env.PROD &&
    (window as any).__vite_plugin_react_preamble_installed__
  ) {
    delete (window as any).__vite_plugin_react_preamble_installed__;
  }

  // Additional protection for specific error patterns
  // Override console methods to suppress our own suppression messages
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("HMR connection suppressed") ||
      message.includes("eval at messageHandler") ||
      isHMRError({ message, stack: new Error().stack })
    ) {
      return; // Completely suppress
    }
    return originalConsoleError.apply(this, args);
  };

  console.warn = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("HMR connection suppressed") ||
      isHMRError({ message, stack: new Error().stack })
    ) {
      return; // Completely suppress
    }
    return originalConsoleWarn.apply(this, args);
  };
};
