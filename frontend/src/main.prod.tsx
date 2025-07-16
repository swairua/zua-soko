import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App.tsx";
import "./index.css";

// Disable all development features
if (import.meta.env.PROD) {
  // Disable React DevTools
  if (typeof window !== "undefined") {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: true,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    };
  }
}

// Create a client with production-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 10 * 60 * 1000, // 10 minutes in production
      cacheTime: 15 * 60 * 1000, // 15 minutes in production
    },
    mutations: {
      retry: 1,
    },
  },
});

// Production-safe render without StrictMode
const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById("root")!);

  if (import.meta.env.PROD) {
    // Production render - no StrictMode to avoid double renders
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
  } else {
    // Development render with StrictMode
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  }
};

renderApp();
