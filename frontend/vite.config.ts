import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Plugin to completely block Vite HMR client in production
const injectProductionScript = () => {
  return {
    name: 'inject-production-script',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.bundle) { // Only in production builds
          const script = `
    <script>
      // Block all Vite HMR functionality in production
      window.__vite_is_modern_browser = false;
      window.__vite_plugin_checker_runtime_config = null;

      // Block WebSocket connections to Vite dev server
      if (typeof WebSocket !== 'undefined') {
        const OriginalWebSocket = WebSocket;
        window.WebSocket = function(url, protocols) {
          if (typeof url === 'string' && (url.includes('vite') || url.includes('hmr') || url.includes('@vite') || url.includes('ws://') || url.includes('wss://'))) {
            console.log('🚫 Blocked Vite HMR WebSocket connection in production:', url);
            return {
              close: () => {}, send: () => {}, addEventListener: () => {}, removeEventListener: () => {},
              readyState: 3, CLOSED: 3, CONNECTING: 0, OPEN: 1, CLOSING: 2,
              onopen: null, onclose: null, onmessage: null, onerror: null
            };
          }
          return new OriginalWebSocket(url, protocols);
        };
        Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
      }

      // Block fetch requests to Vite endpoints
      if (typeof fetch !== 'undefined') {
        const originalFetch = fetch;
        window.fetch = function(url, options) {
          if (typeof url === 'string' && (url.includes('@vite') || url.includes('vite/client') || url.includes('hmr') || url.includes('ping'))) {
            console.log('🚫 Blocked Vite HMR fetch request in production:', url);
            return Promise.resolve(new Response('{"ok": true}', {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          return originalFetch.call(this, url, options);
        };
      }

      // Disable any remaining Vite client functionality
      if (typeof window !== 'undefined') {
        window.__vite_ping = () => Promise.resolve();
        window.import = window.import || (() => Promise.reject(new Error('Dynamic imports disabled in production')));
      }
    </script>`;
          return html.replace('<head>', `<head>${script}`);
        }
        return html;
      }
    }
  };
};

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [
      react({
        ...(isProduction
          ? {
              jsxRuntime: "classic",
              jsxFactory: "React.createElement",
              jsxFragment: "React.Fragment",
            }
          : {
              jsxRuntime: "automatic",
            }),
      }),
      ...(isProduction ? [injectProductionScript()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: isProduction ? "esbuild" : false,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"],
          },
        },
        external: isProduction
          ? ["/@vite/client", "@vite/client", "vite/client", "/vite/client"]
          : [],
      },
      target: "esnext",
    },
    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "0.1.0",
      ),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    ...(isProduction ? {
      // Completely disable client injection in production
      optimizeDeps: {
        exclude: ['@vite/client'],
      },
    } : {}),
    server: {
      port: 3000,
      host: true,
      allowedHosts: ["zua-soko.onrender.com", "localhost"],
      ...(mode === "development"
        ? {
            proxy: {
              "/api": {
                target: "http://localhost:5002",
                changeOrigin: true,
                secure: false,
              },
            },
          }
        : {}),
    },
  };
});
