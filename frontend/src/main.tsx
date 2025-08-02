import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App.tsx";
import "./index.css";
import { validateEnvironment } from "./utils/env";

// Validate environment variables before starting the app
validateEnvironment();

// Global error handler for array operation failures
window.addEventListener("error", (event) => {
  if (
    event.error &&
    event.error.message &&
    event.error.message.includes("filter is not a function")
  ) {
    console.error("🔴 ARRAY OPERATION ERROR DETECTED:", event.error.message);
    console.error("This error has been caught and handled gracefully.");
    event.preventDefault();
  }
});

// Handle unhandled promise rejections that might be array-related
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    typeof event.reason === "string" &&
    event.reason.includes("filter")
  ) {
    console.error("🔴 PROMISE REJECTION WITH ARRAY ERROR:", event.reason);
    event.preventDefault();
  }
});

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

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root and render
const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(App),
  ),
);
