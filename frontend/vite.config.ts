import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

<<<<<<< HEAD
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production" || command === "build";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/shared": path.resolve(__dirname, "../shared/src"),
      },
    },
    server: {
      port: 3000,
      host: true,
      hmr: !isProduction
        ? {
            port: 3001,
            clientPort: 3001,
          }
        : false,
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 3000,
      host: true,
      // Disable HMR in preview mode as well
      hmr: false,
    },
    build: {
      outDir: "dist",
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"],
          },
        },
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      // Completely disable dev features in production
      cssMinify: isProduction,
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__: JSON.stringify(!isProduction),
    },
    esbuild: {
      target: "esnext",
      platform: "browser",
      // Remove console logs and debugger in production
      drop: isProduction ? ["console", "debugger"] : [],
    },
  };
});
=======
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      port: 3001,
      clientPort: command === "serve" ? 3001 : undefined,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["lucide-react", "react-hot-toast"],
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  esbuild: {
    target: "esnext",
    platform: "browser",
  },
}));
>>>>>>> origin/main
