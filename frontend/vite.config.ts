import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Plugin to inject HMR blocking script in production
const injectProductionScript = () => {
  return {
    name: 'inject-production-script',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.bundle) { // Only in production builds
          const script = `
    <script>
      // Production optimizations - Block Vite HMR client
      if (typeof WebSocket !== 'undefined') {
        const OriginalWebSocket = WebSocket;
        WebSocket = function(url, protocols) {
          if (typeof url === 'string' && (url.includes('vite') || url.includes('hmr') || url.includes('@vite'))) {
            console.log('Blocked HMR WebSocket connection:', url);
            return {
              close: () => {}, send: () => {}, addEventListener: () => {}, removeEventListener: () => {},
              readyState: 3, CLOSED: 3, CONNECTING: 0, OPEN: 1, CLOSING: 2
            };
          }
          return new OriginalWebSocket(url, protocols);
        };
      }
      if (typeof fetch !== 'undefined') {
        const originalFetch = fetch;
        fetch = function(url, options) {
          if (typeof url === 'string' && (url.includes('@vite') || url.includes('vite/client') || url.includes('hmr'))) {
            console.log('Blocked HMR fetch request:', url);
            return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          return originalFetch.call(this, url, options);
        };
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
      minify: isProduction ? "esbuild" : false,
    },
    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "0.1.0",
      ),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
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
