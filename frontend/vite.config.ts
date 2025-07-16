import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/shared": path.resolve(__dirname, "../shared/src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"],
          },
        },
        // Completely exclude Vite client in production
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
      // Completely disable HMR in production
      ...(isProduction
        ? {
            "import.meta.hot": "undefined",
            "import.meta.env.DEV": "false",
            __vite_is_modern_browser: "true",
          }
        : {}),
    },
    // Only add server config in development
    ...(isProduction
      ? {}
      : {
          server: {
            port: 3000,
            host: true,
            proxy: {
              "/api": {
                target: "http://localhost:5001",
                changeOrigin: true,
                secure: false,
              },
            },
          },
        }),
  };
});
