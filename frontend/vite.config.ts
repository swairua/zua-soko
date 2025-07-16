import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production" || command === "build";

  const config: any = {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/shared": path.resolve(__dirname, "../shared/src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false, // Completely disable sourcemaps in production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"],
          },
        },
        external: isProduction ? ["/@vite/client"] : [], // Exclude Vite client in production
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      cssMinify: isProduction,
      // Aggressive production optimizations
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
      // Completely disable Vite features in production
      "import.meta.hot": isProduction ? "undefined" : "import.meta.hot",
      __VITE_IS_MODERN_BROWSER: "true",
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
  }

  // Production-specific settings
  if (isProduction) {
    // Completely disable any development features
    config.clearScreen = false;
    config.logLevel = "error";
    config.build.reportCompressedSize = false;
    config.build.chunkSizeWarningLimit = 1000;
  }

  return config;
});
