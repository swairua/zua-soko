import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
    ],
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
        ...(isProduction
          ? {
              input: {
                main: path.resolve(__dirname, "index.html"),
              },
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
            }
          : {
              output: {
                manualChunks: {
                  vendor: ["react", "react-dom"],
                  router: ["react-router-dom"],
                  ui: ["lucide-react", "react-hot-toast"],
                },
              },
            }),
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
                target: "https://zua-soko.fly.dev",
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path,
              },
            },
          }
        : {}),
    },
  };
});
