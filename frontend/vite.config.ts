import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Plugin to rename index.production.html to index.html
const renameIndexPlugin = () => {
  return {
    name: 'rename-index',
    writeBundle(options, bundle) {
      const fs = require('fs');
      const path = require('path');
      const prodFile = path.join(options.dir, 'index.production.html');
      const indexFile = path.join(options.dir, 'index.html');

      if (fs.existsSync(prodFile)) {
        fs.renameSync(prodFile, indexFile);
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
      ...(isProduction ? [renameIndexPlugin()] : []),
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
        input: path.resolve(__dirname, isProduction ? "index.production.html" : "index.html"),
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
      },
      target: "esnext",
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
