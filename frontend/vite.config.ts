import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { noViteClientPlugin } from "./vite-no-client.plugin";

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production" || command === "build";

  // Base configuration
  const config: UserConfig = {
    // Forcefully disable client injection by overriding internals
    optimizeDeps: {
      exclude: isProduction ? ["@vite/client", "vite/client"] : [],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/shared": path.resolve(__dirname, "../shared/src"),
        // Redirect Vite client to empty module in production
        ...(isProduction
          ? {
              "@vite/client": path.resolve(__dirname, "src/empty-module.js"),
              "vite/client": path.resolve(__dirname, "src/empty-module.js"),
              "vite/dist/client/env.mjs": path.resolve(
                __dirname,
                "src/empty-module.js",
              ),
            }
          : {}),
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
        // Completely exclude all Vite client modules
        external: isProduction
          ? [
              "/@vite/client",
              "@vite/client",
              "vite/client",
              "/vite/client",
              "vite/dist/client/env.mjs",
              "/vite/dist/client/env.mjs",
            ]
          : [],
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      cssMinify: isProduction,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }
        : undefined,
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__: JSON.stringify(!isProduction),
      // Completely neutralize all Vite/HMR features
      "import.meta.hot": "undefined",
      "import.meta.env.DEV": JSON.stringify(!isProduction),
      "import.meta.env.PROD": JSON.stringify(isProduction),
      __VITE_IS_MODERN_BROWSER: "true",
      // Neutralize HMR context completely
      HMRContext: "undefined",
      createHotContext: "(() => undefined)",
    },
    esbuild: {
      target: "esnext",
      platform: "browser",
      drop: isProduction ? ["console", "debugger"] : [],
      pure: isProduction
        ? ["console.log", "console.warn", "console.error"]
        : [],
    },
  };

  // Add plugins based on environment
  config.plugins = isProduction ? [react(), noViteClientPlugin()] : [react()];

  // Only add server config in development
  if (!isProduction) {
    config.server = {
      port: 3000,
      host: true,
      hmr: {
        port: 3001,
        clientPort: 3001,
      },
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false,
        },
      },
    };
  } else {
    // Production-specific settings that completely disable dev features
    config.clearScreen = false;
    config.logLevel = "error";
    if (config.build) {
      config.build.reportCompressedSize = false;
      config.build.chunkSizeWarningLimit = 1000;
    }

    // Override any potential server config in production
    delete config.server;
  }

  return config;
});
