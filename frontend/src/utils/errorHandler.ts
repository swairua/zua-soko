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

// Simple global error handler
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (!import.meta.env.PROD) {
      console.error("Unhandled promise rejection:", event.reason);
    }
  });

  // Handle global JavaScript errors
  window.addEventListener("error", (event) => {
    if (!import.meta.env.PROD) {
      console.error("Global error:", event.error);
    }
  });
};
