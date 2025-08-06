// Utility for handling fetch errors with retry logic

interface FetchWithRetryOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: FetchWithRetryOptions = {},
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, timeout = 10000 } = retryOptions;

  // Add timeout to fetch options
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // If response is ok, return it
      if (response.ok) {
        return response;
      }

      // If it's a server error (5xx) or network error, retry
      if (response.status >= 500 && attempt < retries) {
        console.warn(
          `Fetch attempt ${attempt + 1} failed with status ${response.status}, retrying...`,
        );
        await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      // For client errors (4xx), don't retry
      return response;
    } catch (error) {
      lastError = error as Error;

      // If it's the last attempt, throw the error
      if (attempt === retries) {
        clearTimeout(timeoutId);

        // Provide more helpful error messages
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new Error(`Request timeout after ${timeout}ms`);
          }
          if (error.message.includes("Failed to fetch")) {
            throw new Error(
              "Network error: Unable to reach server. Please check your connection.",
            );
          }
        }

        throw error;
      }

      console.warn(
        `Fetch attempt ${attempt + 1} failed:`,
        error.message,
        "Retrying...",
      );
      await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error("All fetch attempts failed");
}

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Axios interceptor to use fetch with retry
export function setupAxiosRetry() {
  // This would be used if we want to add retry logic to axios as well
  console.log("Fetch retry utility is available for manual use");
}

// Error classification helper
export function isNetworkError(error: any): boolean {
  return (
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("Network request failed") ||
    error?.name === "NetworkError"
  );
}

export function isTimeoutError(error: any): boolean {
  return (
    error?.code === "TIMEOUT" ||
    error?.name === "AbortError" ||
    error?.message?.includes("timeout")
  );
}

// Usage example:
// try {
//   const response = await fetchWithRetry('/api/data', {
//     method: 'GET',
//     headers: { 'Authorization': 'Bearer token' }
//   }, {
//     retries: 3,
//     retryDelay: 1000,
//     timeout: 5000
//   });
//   const data = await response.json();
// } catch (error) {
//   console.error('Fetch failed after retries:', error);
// }
