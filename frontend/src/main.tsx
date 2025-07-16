import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App.tsx";
import "./index.css";

// Disable development features in production
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

// Create a client with environment-appropriate settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: import.meta.env.PROD ? 2 : 1,
      staleTime: import.meta.env.PROD ? 10 * 60 * 1000 : 5 * 60 * 1000,
      cacheTime: import.meta.env.PROD ? 15 * 60 * 1000 : 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Production-safe render
const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById("root")!);

  if (import.meta.env.PROD) {
    // Production render without StrictMode to avoid double renders and potential HMR issues
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
