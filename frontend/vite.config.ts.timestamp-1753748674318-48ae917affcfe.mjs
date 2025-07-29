// vite.config.ts
import { defineConfig } from "file:///app/code/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/app/code/frontend";
var vite_config_default = defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  return {
    plugins: [
      react({
        ...isProduction ? {
          jsxRuntime: "classic",
          jsxFactory: "React.createElement",
          jsxFragment: "React.Fragment"
        } : {
          jsxRuntime: "automatic"
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@/shared": path.resolve(__vite_injected_original_dirname, "../shared/src")
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        input: {
          main: isProduction ? path.resolve(__vite_injected_original_dirname, "index.production.html") : path.resolve(__vite_injected_original_dirname, "index.html")
        },
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"]
          }
        },
        external: isProduction ? ["/@vite/client", "@vite/client", "vite/client", "/vite/client"] : []
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false
    },
    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "0.1.0"
      ),
      "process.env.NODE_ENV": JSON.stringify(mode)
    },
    server: {
      port: 3e3,
      host: true,
      allowedHosts: ["zua-soko.onrender.com", "localhost"],
      ...mode === "development" ? {
        proxy: {
          "/api": {
            target: "http://localhost:5002",
            changeOrigin: true,
            secure: false
          }
        }
      } : {}
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAgLi4uKGlzUHJvZHVjdGlvblxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBqc3hSdW50aW1lOiBcImNsYXNzaWNcIixcbiAgICAgICAgICAgICAganN4RmFjdG9yeTogXCJSZWFjdC5jcmVhdGVFbGVtZW50XCIsXG4gICAgICAgICAgICAgIGpzeEZyYWdtZW50OiBcIlJlYWN0LkZyYWdtZW50XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIGpzeFJ1bnRpbWU6IFwiYXV0b21hdGljXCIsXG4gICAgICAgICAgICB9KSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICAgIFwiQC9zaGFyZWRcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9zaGFyZWQvc3JjXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICBtYWluOiBpc1Byb2R1Y3Rpb25cbiAgICAgICAgICAgID8gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC5wcm9kdWN0aW9uLmh0bWxcIilcbiAgICAgICAgICAgIDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC5odG1sXCIpXG4gICAgICAgIH0sXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XVwiLFxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgdmVuZG9yOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgICAgICAgICAgIHJvdXRlcjogW1wicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICAgIHVpOiBbXCJsdWNpZGUtcmVhY3RcIiwgXCJyZWFjdC1ob3QtdG9hc3RcIl0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgZXh0ZXJuYWw6IGlzUHJvZHVjdGlvblxuICAgICAgICAgID8gW1wiL0B2aXRlL2NsaWVudFwiLCBcIkB2aXRlL2NsaWVudFwiLCBcInZpdGUvY2xpZW50XCIsIFwiL3ZpdGUvY2xpZW50XCJdXG4gICAgICAgICAgOiBbXSxcbiAgICAgIH0sXG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBtaW5pZnk6IGlzUHJvZHVjdGlvbiA/IFwiZXNidWlsZFwiIDogZmFsc2UsXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fQVBQX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24gfHwgXCIwLjEuMFwiLFxuICAgICAgKSxcbiAgICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogSlNPTi5zdHJpbmdpZnkobW9kZSksXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgYWxsb3dlZEhvc3RzOiBbXCJ6dWEtc29rby5vbnJlbmRlci5jb21cIiwgXCJsb2NhbGhvc3RcIl0sXG4gICAgICAuLi4obW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiXG4gICAgICAgID8ge1xuICAgICAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAyXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fSksXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3TyxTQUFTLG9CQUFvQjtBQUNyUSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxRQUNKLEdBQUksZUFDQTtBQUFBLFVBQ0UsWUFBWTtBQUFBLFVBQ1osWUFBWTtBQUFBLFVBQ1osYUFBYTtBQUFBLFFBQ2YsSUFDQTtBQUFBLFVBQ0UsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxNQUNOLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsWUFBWSxLQUFLLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ3JEO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0wsTUFBTSxlQUNGLEtBQUssUUFBUSxrQ0FBVyx1QkFBdUIsSUFDL0MsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUMxQztBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsY0FBYztBQUFBLFlBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFlBQzdCLFFBQVEsQ0FBQyxrQkFBa0I7QUFBQSxZQUMzQixJQUFJLENBQUMsZ0JBQWdCLGlCQUFpQjtBQUFBLFVBQ3hDO0FBQUEsUUFDRjtBQUFBLFFBQ0EsVUFBVSxlQUNOLENBQUMsaUJBQWlCLGdCQUFnQixlQUFlLGNBQWMsSUFDL0QsQ0FBQztBQUFBLE1BQ1A7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLFFBQVEsZUFBZSxZQUFZO0FBQUEsSUFDckM7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGlCQUFpQixLQUFLO0FBQUEsUUFDcEIsUUFBUSxJQUFJLHVCQUF1QjtBQUFBLE1BQ3JDO0FBQUEsTUFDQSx3QkFBd0IsS0FBSyxVQUFVLElBQUk7QUFBQSxJQUM3QztBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sY0FBYyxDQUFDLHlCQUF5QixXQUFXO0FBQUEsTUFDbkQsR0FBSSxTQUFTLGdCQUNUO0FBQUEsUUFDRSxPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUEsWUFDUixjQUFjO0FBQUEsWUFDZCxRQUFRO0FBQUEsVUFDVjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
