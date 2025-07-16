// vite.config.ts
import { defineConfig } from "file:///app/code/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/app/code/frontend";
var vite_config_default = defineConfig(({ command, mode }) => {
  const isProduction = mode === "production" || command === "build";
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@/shared": path.resolve(__vite_injected_original_dirname, "../shared/src")
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      // Completely disable sourcemaps in production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"]
          }
        },
        external: isProduction ? ["/@vite/client"] : []
        // Exclude Vite client in production
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      cssMinify: isProduction,
      // Aggressive production optimizations
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : void 0
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__: JSON.stringify(!isProduction),
      // Completely disable Vite features in production
      "import.meta.hot": isProduction ? "undefined" : "import.meta.hot",
      __VITE_IS_MODERN_BROWSER: "true"
    },
    esbuild: {
      target: "esnext",
      platform: "browser",
      drop: isProduction ? ["console", "debugger"] : [],
      pure: isProduction ? ["console.log", "console.warn", "console.error"] : []
    }
  };
  if (!isProduction) {
    config.server = {
      port: 3e3,
      host: true,
      hmr: {
        port: 3001,
        clientPort: 3001
      },
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false
        }
      }
    };
  }
  if (isProduction) {
    config.clearScreen = false;
    config.logLevel = "error";
    config.build.reportCompressedSize = false;
    config.build.chunkSizeWarningLimit = 1e3;
  }
  return config;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIiB8fCBjb21tYW5kID09PSBcImJ1aWxkXCI7XG5cbiAgY29uc3QgY29uZmlnOiBhbnkgPSB7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICBcIkAvc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vc2hhcmVkL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiBcImRpc3RcIixcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsIC8vIENvbXBsZXRlbHkgZGlzYWJsZSBzb3VyY2VtYXBzIGluIHByb2R1Y3Rpb25cbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICB2ZW5kb3I6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgICAgICAgICAgcm91dGVyOiBbXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgICAgdWk6IFtcImx1Y2lkZS1yZWFjdFwiLCBcInJlYWN0LWhvdC10b2FzdFwiXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBleHRlcm5hbDogaXNQcm9kdWN0aW9uID8gW1wiL0B2aXRlL2NsaWVudFwiXSA6IFtdLCAvLyBFeGNsdWRlIFZpdGUgY2xpZW50IGluIHByb2R1Y3Rpb25cbiAgICAgIH0sXG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBtaW5pZnk6IGlzUHJvZHVjdGlvbiA/IFwiZXNidWlsZFwiIDogZmFsc2UsXG4gICAgICBjc3NNaW5pZnk6IGlzUHJvZHVjdGlvbixcbiAgICAgIC8vIEFnZ3Jlc3NpdmUgcHJvZHVjdGlvbiBvcHRpbWl6YXRpb25zXG4gICAgICB0ZXJzZXJPcHRpb25zOiBpc1Byb2R1Y3Rpb25cbiAgICAgICAgPyB7XG4gICAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fQVBQX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXG4gICAgICBcInByb2Nlc3MuZW52Lk5PREVfRU5WXCI6IEpTT04uc3RyaW5naWZ5KG1vZGUpLFxuICAgICAgX19ERVZfXzogSlNPTi5zdHJpbmdpZnkoIWlzUHJvZHVjdGlvbiksXG4gICAgICAvLyBDb21wbGV0ZWx5IGRpc2FibGUgVml0ZSBmZWF0dXJlcyBpbiBwcm9kdWN0aW9uXG4gICAgICBcImltcG9ydC5tZXRhLmhvdFwiOiBpc1Byb2R1Y3Rpb24gPyBcInVuZGVmaW5lZFwiIDogXCJpbXBvcnQubWV0YS5ob3RcIixcbiAgICAgIF9fVklURV9JU19NT0RFUk5fQlJPV1NFUjogXCJ0cnVlXCIsXG4gICAgfSxcbiAgICBlc2J1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBwbGF0Zm9ybTogXCJicm93c2VyXCIsXG4gICAgICBkcm9wOiBpc1Byb2R1Y3Rpb24gPyBbXCJjb25zb2xlXCIsIFwiZGVidWdnZXJcIl0gOiBbXSxcbiAgICAgIHB1cmU6IGlzUHJvZHVjdGlvblxuICAgICAgICA/IFtcImNvbnNvbGUubG9nXCIsIFwiY29uc29sZS53YXJuXCIsIFwiY29uc29sZS5lcnJvclwiXVxuICAgICAgICA6IFtdLFxuICAgIH0sXG4gIH07XG5cbiAgLy8gT25seSBhZGQgc2VydmVyIGNvbmZpZyBpbiBkZXZlbG9wbWVudFxuICBpZiAoIWlzUHJvZHVjdGlvbikge1xuICAgIGNvbmZpZy5zZXJ2ZXIgPSB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIGhtcjoge1xuICAgICAgICBwb3J0OiAzMDAxLFxuICAgICAgICBjbGllbnRQb3J0OiAzMDAxLFxuICAgICAgfSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMVwiLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUHJvZHVjdGlvbi1zcGVjaWZpYyBzZXR0aW5nc1xuICBpZiAoaXNQcm9kdWN0aW9uKSB7XG4gICAgLy8gQ29tcGxldGVseSBkaXNhYmxlIGFueSBkZXZlbG9wbWVudCBmZWF0dXJlc1xuICAgIGNvbmZpZy5jbGVhclNjcmVlbiA9IGZhbHNlO1xuICAgIGNvbmZpZy5sb2dMZXZlbCA9IFwiZXJyb3JcIjtcbiAgICBjb25maWcuYnVpbGQucmVwb3J0Q29tcHJlc3NlZFNpemUgPSBmYWxzZTtcbiAgICBjb25maWcuYnVpbGQuY2h1bmtTaXplV2FybmluZ0xpbWl0ID0gMTAwMDtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd08sU0FBUyxvQkFBb0I7QUFDclEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0sZUFBZSxTQUFTLGdCQUFnQixZQUFZO0FBRTFELFFBQU0sU0FBYztBQUFBLElBQ2xCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsWUFBWSxLQUFLLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ3JEO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFlBQzNCLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsVUFDeEM7QUFBQSxRQUNGO0FBQUEsUUFDQSxVQUFVLGVBQWUsQ0FBQyxlQUFlLElBQUksQ0FBQztBQUFBO0FBQUEsTUFDaEQ7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLFFBQVEsZUFBZSxZQUFZO0FBQUEsTUFDbkMsV0FBVztBQUFBO0FBQUEsTUFFWCxlQUFlLGVBQ1g7QUFBQSxRQUNFLFVBQVU7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLGVBQWU7QUFBQSxRQUNqQjtBQUFBLE1BQ0YsSUFDQTtBQUFBLElBQ047QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGlCQUFpQixLQUFLLFVBQVUsUUFBUSxJQUFJLG1CQUFtQjtBQUFBLE1BQy9ELHdCQUF3QixLQUFLLFVBQVUsSUFBSTtBQUFBLE1BQzNDLFNBQVMsS0FBSyxVQUFVLENBQUMsWUFBWTtBQUFBO0FBQUEsTUFFckMsbUJBQW1CLGVBQWUsY0FBYztBQUFBLE1BQ2hELDBCQUEwQjtBQUFBLElBQzVCO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxRQUFRO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixNQUFNLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsTUFDaEQsTUFBTSxlQUNGLENBQUMsZUFBZSxnQkFBZ0IsZUFBZSxJQUMvQyxDQUFDO0FBQUEsSUFDUDtBQUFBLEVBQ0Y7QUFHQSxNQUFJLENBQUMsY0FBYztBQUNqQixXQUFPLFNBQVM7QUFBQSxNQUNkLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxRQUNILE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxNQUNkO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUdBLE1BQUksY0FBYztBQUVoQixXQUFPLGNBQWM7QUFDckIsV0FBTyxXQUFXO0FBQ2xCLFdBQU8sTUFBTSx1QkFBdUI7QUFDcEMsV0FBTyxNQUFNLHdCQUF3QjtBQUFBLEVBQ3ZDO0FBRUEsU0FBTztBQUNULENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
