// vite.config.ts
import { defineConfig } from "file:///app/code/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";

// vite.production.plugin.ts
function productionStripPlugin() {
  return {
    name: "production-strip",
    apply: "build",
    generateBundle(options, bundle) {
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk") {
          if (chunk.code.includes("@vite/client") || chunk.code.includes("vite/client") || chunk.code.includes("import.meta.hot")) {
            chunk.code = chunk.code.replace(/import\s+[^;]*@vite\/client[^;]*;?/g, "").replace(/import\s+[^;]*vite\/client[^;]*;?/g, "").replace(/import\.meta\.hot[^;]*;?/g, "");
          }
        }
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html.replace(/<script[^>]*@vite\/client[^>]*><\/script>/g, "").replace(/<script[^>]*vite\/client[^>]*><\/script>/g, "");
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "/app/code/frontend";
var vite_config_default = defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  return {
    plugins: [react(), ...isProduction ? [productionStripPlugin()] : []],
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
        // Use production HTML template
        ...isProduction ? {
          input: {
            main: path.resolve(__vite_injected_original_dirname, "index.production.html")
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
          }
        } : {
          output: {
            manualChunks: {
              vendor: ["react", "react-dom"],
              router: ["react-router-dom"],
              ui: ["lucide-react", "react-hot-toast"]
            }
          }
        },
        // Completely exclude Vite client in production
        external: isProduction ? ["/@vite/client", "@vite/client", "vite/client", "/vite/client"] : []
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false
    },
    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "0.1.0"
      ),
      "process.env.NODE_ENV": JSON.stringify(mode),
      // Completely disable HMR in production
      ...isProduction ? {
        "import.meta.hot": "undefined",
        "import.meta.env.DEV": "false",
        "import.meta.env.PROD": "true",
        __vite_is_modern_browser: "true"
      } : {}
    },
    // Only add server config in development
    ...isProduction ? {} : {
      server: {
        port: 3e3,
        host: true,
        proxy: {
          "/api": {
            target: "http://localhost:5001",
            changeOrigin: true,
            secure: false
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS5wcm9kdWN0aW9uLnBsdWdpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9jb2RlL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcHJvZHVjdGlvblN0cmlwUGx1Z2luIH0gZnJvbSBcIi4vdml0ZS5wcm9kdWN0aW9uLnBsdWdpblwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGlzUHJvZHVjdGlvbiA9IG1vZGUgPT09IFwicHJvZHVjdGlvblwiO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCksIC4uLihpc1Byb2R1Y3Rpb24gPyBbcHJvZHVjdGlvblN0cmlwUGx1Z2luKCldIDogW10pXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgXCJAL3NoYXJlZFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL3NoYXJlZC9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAvLyBVc2UgcHJvZHVjdGlvbiBIVE1MIHRlbXBsYXRlXG4gICAgICAgIC4uLihpc1Byb2R1Y3Rpb25cbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgICAgICBtYWluOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImluZGV4LnByb2R1Y3Rpb24uaHRtbFwiKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdXCIsXG4gICAgICAgICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgICB2ZW5kb3I6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgICAgICAgICAgICAgICAgcm91dGVyOiBbXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgICAgICAgICAgdWk6IFtcImx1Y2lkZS1yZWFjdFwiLCBcInJlYWN0LWhvdC10b2FzdFwiXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgICAgICAgICByb3V0ZXI6IFtcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gICAgICAgICAgICAgICAgICB1aTogW1wibHVjaWRlLXJlYWN0XCIsIFwicmVhY3QtaG90LXRvYXN0XCJdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgLy8gQ29tcGxldGVseSBleGNsdWRlIFZpdGUgY2xpZW50IGluIHByb2R1Y3Rpb25cbiAgICAgICAgZXh0ZXJuYWw6IGlzUHJvZHVjdGlvblxuICAgICAgICAgID8gW1wiL0B2aXRlL2NsaWVudFwiLCBcIkB2aXRlL2NsaWVudFwiLCBcInZpdGUvY2xpZW50XCIsIFwiL3ZpdGUvY2xpZW50XCJdXG4gICAgICAgICAgOiBbXSxcbiAgICAgIH0sXG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBtaW5pZnk6IGlzUHJvZHVjdGlvbiA/IFwiZXNidWlsZFwiIDogZmFsc2UsXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fQVBQX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24gfHwgXCIwLjEuMFwiLFxuICAgICAgKSxcbiAgICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogSlNPTi5zdHJpbmdpZnkobW9kZSksXG4gICAgICAvLyBDb21wbGV0ZWx5IGRpc2FibGUgSE1SIGluIHByb2R1Y3Rpb25cbiAgICAgIC4uLihpc1Byb2R1Y3Rpb25cbiAgICAgICAgPyB7XG4gICAgICAgICAgICBcImltcG9ydC5tZXRhLmhvdFwiOiBcInVuZGVmaW5lZFwiLFxuICAgICAgICAgICAgXCJpbXBvcnQubWV0YS5lbnYuREVWXCI6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIFwiaW1wb3J0Lm1ldGEuZW52LlBST0RcIjogXCJ0cnVlXCIsXG4gICAgICAgICAgICBfX3ZpdGVfaXNfbW9kZXJuX2Jyb3dzZXI6IFwidHJ1ZVwiLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fSksXG4gICAgfSxcbiAgICAvLyBPbmx5IGFkZCBzZXJ2ZXIgY29uZmlnIGluIGRldmVsb3BtZW50XG4gICAgLi4uKGlzUHJvZHVjdGlvblxuICAgICAgPyB7fVxuICAgICAgOiB7XG4gICAgICAgICAgc2VydmVyOiB7XG4gICAgICAgICAgICBwb3J0OiAzMDAwLFxuICAgICAgICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMVwiLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZC92aXRlLnByb2R1Y3Rpb24ucGx1Z2luLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS9mcm9udGVuZC92aXRlLnByb2R1Y3Rpb24ucGx1Z2luLnRzXCI7aW1wb3J0IHsgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2R1Y3Rpb25TdHJpcFBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwicHJvZHVjdGlvbi1zdHJpcFwiLFxuICAgIGFwcGx5OiBcImJ1aWxkXCIsXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAvLyBSZW1vdmUgYW55IGNodW5rcyB0aGF0IGNvbnRhaW4gdml0ZSBjbGllbnQgY29kZVxuICAgICAgT2JqZWN0LmtleXMoYnVuZGxlKS5mb3JFYWNoKChmaWxlTmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtmaWxlTmFtZV07XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSBcImNodW5rXCIpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgYW55IHZpdGUgY2xpZW50IGltcG9ydHNcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBjaHVuay5jb2RlLmluY2x1ZGVzKFwiQHZpdGUvY2xpZW50XCIpIHx8XG4gICAgICAgICAgICBjaHVuay5jb2RlLmluY2x1ZGVzKFwidml0ZS9jbGllbnRcIikgfHxcbiAgICAgICAgICAgIGNodW5rLmNvZGUuaW5jbHVkZXMoXCJpbXBvcnQubWV0YS5ob3RcIilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNodW5rLmNvZGUgPSBjaHVuay5jb2RlXG4gICAgICAgICAgICAgIC5yZXBsYWNlKC9pbXBvcnRcXHMrW147XSpAdml0ZVxcL2NsaWVudFteO10qOz8vZywgXCJcIilcbiAgICAgICAgICAgICAgLnJlcGxhY2UoL2ltcG9ydFxccytbXjtdKnZpdGVcXC9jbGllbnRbXjtdKjs/L2csIFwiXCIpXG4gICAgICAgICAgICAgIC5yZXBsYWNlKC9pbXBvcnRcXC5tZXRhXFwuaG90W147XSo7Py9nLCBcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogXCJwb3N0XCIsXG4gICAgICBoYW5kbGVyKGh0bWwpIHtcbiAgICAgICAgLy8gUmVtb3ZlIGFueSB2aXRlIGNsaWVudCBzY3JpcHQgdGFnc1xuICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICAgIC5yZXBsYWNlKC88c2NyaXB0W14+XSpAdml0ZVxcL2NsaWVudFtePl0qPjxcXC9zY3JpcHQ+L2csIFwiXCIpXG4gICAgICAgICAgLnJlcGxhY2UoLzxzY3JpcHRbXj5dKnZpdGVcXC9jbGllbnRbXj5dKj48XFwvc2NyaXB0Pi9nLCBcIlwiKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd08sU0FBUyxvQkFBb0I7QUFDclEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTs7O0FDQVYsU0FBUyx3QkFBZ0M7QUFDOUMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsZUFBZSxTQUFTLFFBQVE7QUFFOUIsYUFBTyxLQUFLLE1BQU0sRUFBRSxRQUFRLENBQUMsYUFBYTtBQUN4QyxjQUFNLFFBQVEsT0FBTyxRQUFRO0FBQzdCLFlBQUksTUFBTSxTQUFTLFNBQVM7QUFFMUIsY0FDRSxNQUFNLEtBQUssU0FBUyxjQUFjLEtBQ2xDLE1BQU0sS0FBSyxTQUFTLGFBQWEsS0FDakMsTUFBTSxLQUFLLFNBQVMsaUJBQWlCLEdBQ3JDO0FBQ0Esa0JBQU0sT0FBTyxNQUFNLEtBQ2hCLFFBQVEsdUNBQXVDLEVBQUUsRUFDakQsUUFBUSxzQ0FBc0MsRUFBRSxFQUNoRCxRQUFRLDZCQUE2QixFQUFFO0FBQUEsVUFDNUM7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0Esb0JBQW9CO0FBQUEsTUFDbEIsT0FBTztBQUFBLE1BQ1AsUUFBUSxNQUFNO0FBRVosZUFBTyxLQUNKLFFBQVEsOENBQThDLEVBQUUsRUFDeEQsUUFBUSw2Q0FBNkMsRUFBRTtBQUFBLE1BQzVEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FEbkNBLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLEdBQUcsR0FBSSxlQUFlLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUU7QUFBQSxJQUNyRSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsWUFBWSxLQUFLLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ3JEO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsZUFBZTtBQUFBO0FBQUEsUUFFYixHQUFJLGVBQ0E7QUFBQSxVQUNFLE9BQU87QUFBQSxZQUNMLE1BQU0sS0FBSyxRQUFRLGtDQUFXLHVCQUF1QjtBQUFBLFVBQ3ZEO0FBQUEsVUFDQSxRQUFRO0FBQUEsWUFDTixnQkFBZ0I7QUFBQSxZQUNoQixnQkFBZ0I7QUFBQSxZQUNoQixnQkFBZ0I7QUFBQSxZQUNoQixjQUFjO0FBQUEsY0FDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsY0FDN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLGNBQzNCLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsWUFDeEM7QUFBQSxVQUNGO0FBQUEsUUFDRixJQUNBO0FBQUEsVUFDRSxRQUFRO0FBQUEsWUFDTixjQUFjO0FBQUEsY0FDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsY0FDN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLGNBQzNCLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsWUFDeEM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFSixVQUFVLGVBQ04sQ0FBQyxpQkFBaUIsZ0JBQWdCLGVBQWUsY0FBYyxJQUMvRCxDQUFDO0FBQUEsTUFDUDtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1IsUUFBUSxlQUFlLFlBQVk7QUFBQSxJQUNyQztBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04saUJBQWlCLEtBQUs7QUFBQSxRQUNwQixRQUFRLElBQUksdUJBQXVCO0FBQUEsTUFDckM7QUFBQSxNQUNBLHdCQUF3QixLQUFLLFVBQVUsSUFBSTtBQUFBO0FBQUEsTUFFM0MsR0FBSSxlQUNBO0FBQUEsUUFDRSxtQkFBbUI7QUFBQSxRQUNuQix1QkFBdUI7QUFBQSxRQUN2Qix3QkFBd0I7QUFBQSxRQUN4QiwwQkFBMEI7QUFBQSxNQUM1QixJQUNBLENBQUM7QUFBQSxJQUNQO0FBQUE7QUFBQSxJQUVBLEdBQUksZUFDQSxDQUFDLElBQ0Q7QUFBQSxNQUNFLFFBQVE7QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMLFFBQVE7QUFBQSxZQUNOLFFBQVE7QUFBQSxZQUNSLGNBQWM7QUFBQSxZQUNkLFFBQVE7QUFBQSxVQUNWO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDTjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
