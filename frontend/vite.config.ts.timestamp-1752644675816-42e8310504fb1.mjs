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
      enforce: "post",
      transform(html) {
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
          input: path.resolve(__vite_injected_original_dirname, "index.production.html")
        } : {},
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS5wcm9kdWN0aW9uLnBsdWdpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9jb2RlL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcHJvZHVjdGlvblN0cmlwUGx1Z2luIH0gZnJvbSBcIi4vdml0ZS5wcm9kdWN0aW9uLnBsdWdpblwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGlzUHJvZHVjdGlvbiA9IG1vZGUgPT09IFwicHJvZHVjdGlvblwiO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCksIC4uLihpc1Byb2R1Y3Rpb24gPyBbcHJvZHVjdGlvblN0cmlwUGx1Z2luKCldIDogW10pXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgXCJAL3NoYXJlZFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL3NoYXJlZC9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAvLyBVc2UgcHJvZHVjdGlvbiBIVE1MIHRlbXBsYXRlXG4gICAgICAgIC4uLihpc1Byb2R1Y3Rpb25cbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgaW5wdXQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiaW5kZXgucHJvZHVjdGlvbi5odG1sXCIpLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge30pLFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgICByb3V0ZXI6IFtcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gICAgICAgICAgICB1aTogW1wibHVjaWRlLXJlYWN0XCIsIFwicmVhY3QtaG90LXRvYXN0XCJdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIENvbXBsZXRlbHkgZXhjbHVkZSBWaXRlIGNsaWVudCBpbiBwcm9kdWN0aW9uXG4gICAgICAgIGV4dGVybmFsOiBpc1Byb2R1Y3Rpb25cbiAgICAgICAgICA/IFtcIi9Adml0ZS9jbGllbnRcIiwgXCJAdml0ZS9jbGllbnRcIiwgXCJ2aXRlL2NsaWVudFwiLCBcIi92aXRlL2NsaWVudFwiXVxuICAgICAgICAgIDogW10sXG4gICAgICB9LFxuICAgICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgICAgbWluaWZ5OiBpc1Byb2R1Y3Rpb24gPyBcImVzYnVpbGRcIiA6IGZhbHNlLFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uIHx8IFwiMC4xLjBcIixcbiAgICAgICksXG4gICAgICBcInByb2Nlc3MuZW52Lk5PREVfRU5WXCI6IEpTT04uc3RyaW5naWZ5KG1vZGUpLFxuICAgICAgLy8gQ29tcGxldGVseSBkaXNhYmxlIEhNUiBpbiBwcm9kdWN0aW9uXG4gICAgICAuLi4oaXNQcm9kdWN0aW9uXG4gICAgICAgID8ge1xuICAgICAgICAgICAgXCJpbXBvcnQubWV0YS5ob3RcIjogXCJ1bmRlZmluZWRcIixcbiAgICAgICAgICAgIFwiaW1wb3J0Lm1ldGEuZW52LkRFVlwiOiBcImZhbHNlXCIsXG4gICAgICAgICAgICBcImltcG9ydC5tZXRhLmVudi5QUk9EXCI6IFwidHJ1ZVwiLFxuICAgICAgICAgICAgX192aXRlX2lzX21vZGVybl9icm93c2VyOiBcInRydWVcIixcbiAgICAgICAgICB9XG4gICAgICAgIDoge30pLFxuICAgIH0sXG4gICAgLy8gT25seSBhZGQgc2VydmVyIGNvbmZpZyBpbiBkZXZlbG9wbWVudFxuICAgIC4uLihpc1Byb2R1Y3Rpb25cbiAgICAgID8ge31cbiAgICAgIDoge1xuICAgICAgICAgIHNlcnZlcjoge1xuICAgICAgICAgICAgcG9ydDogMzAwMCxcbiAgICAgICAgICAgIGhvc3Q6IHRydWUsXG4gICAgICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgICBcIi9hcGlcIjoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjUwMDFcIixcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gIH07XG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5wcm9kdWN0aW9uLnBsdWdpbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5wcm9kdWN0aW9uLnBsdWdpbi50c1wiO2ltcG9ydCB7IFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9kdWN0aW9uU3RyaXBQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInByb2R1Y3Rpb24tc3RyaXBcIixcbiAgICBhcHBseTogXCJidWlsZFwiLFxuICAgIGdlbmVyYXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgLy8gUmVtb3ZlIGFueSBjaHVua3MgdGhhdCBjb250YWluIHZpdGUgY2xpZW50IGNvZGVcbiAgICAgIE9iamVjdC5rZXlzKGJ1bmRsZSkuZm9yRWFjaCgoZmlsZU5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZmlsZU5hbWVdO1xuICAgICAgICBpZiAoY2h1bmsudHlwZSA9PT0gXCJjaHVua1wiKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIGFueSB2aXRlIGNsaWVudCBpbXBvcnRzXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgY2h1bmsuY29kZS5pbmNsdWRlcyhcIkB2aXRlL2NsaWVudFwiKSB8fFxuICAgICAgICAgICAgY2h1bmsuY29kZS5pbmNsdWRlcyhcInZpdGUvY2xpZW50XCIpIHx8XG4gICAgICAgICAgICBjaHVuay5jb2RlLmluY2x1ZGVzKFwiaW1wb3J0Lm1ldGEuaG90XCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjaHVuay5jb2RlID0gY2h1bmsuY29kZVxuICAgICAgICAgICAgICAucmVwbGFjZSgvaW1wb3J0XFxzK1teO10qQHZpdGVcXC9jbGllbnRbXjtdKjs/L2csIFwiXCIpXG4gICAgICAgICAgICAgIC5yZXBsYWNlKC9pbXBvcnRcXHMrW147XSp2aXRlXFwvY2xpZW50W147XSo7Py9nLCBcIlwiKVxuICAgICAgICAgICAgICAucmVwbGFjZSgvaW1wb3J0XFwubWV0YVxcLmhvdFteO10qOz8vZywgXCJcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgZW5mb3JjZTogXCJwb3N0XCIsXG4gICAgICB0cmFuc2Zvcm0oaHRtbCkge1xuICAgICAgICAvLyBSZW1vdmUgYW55IHZpdGUgY2xpZW50IHNjcmlwdCB0YWdzXG4gICAgICAgIHJldHVybiBodG1sXG4gICAgICAgICAgLnJlcGxhY2UoLzxzY3JpcHRbXj5dKkB2aXRlXFwvY2xpZW50W14+XSo+PFxcL3NjcmlwdD4vZywgXCJcIilcbiAgICAgICAgICAucmVwbGFjZSgvPHNjcmlwdFtePl0qdml0ZVxcL2NsaWVudFtePl0qPjxcXC9zY3JpcHQ+L2csIFwiXCIpO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3TyxTQUFTLG9CQUFvQjtBQUNyUSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVOzs7QUNBVixTQUFTLHdCQUFnQztBQUM5QyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxlQUFlLFNBQVMsUUFBUTtBQUU5QixhQUFPLEtBQUssTUFBTSxFQUFFLFFBQVEsQ0FBQyxhQUFhO0FBQ3hDLGNBQU0sUUFBUSxPQUFPLFFBQVE7QUFDN0IsWUFBSSxNQUFNLFNBQVMsU0FBUztBQUUxQixjQUNFLE1BQU0sS0FBSyxTQUFTLGNBQWMsS0FDbEMsTUFBTSxLQUFLLFNBQVMsYUFBYSxLQUNqQyxNQUFNLEtBQUssU0FBUyxpQkFBaUIsR0FDckM7QUFDQSxrQkFBTSxPQUFPLE1BQU0sS0FDaEIsUUFBUSx1Q0FBdUMsRUFBRSxFQUNqRCxRQUFRLHNDQUFzQyxFQUFFLEVBQ2hELFFBQVEsNkJBQTZCLEVBQUU7QUFBQSxVQUM1QztBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxvQkFBb0I7QUFBQSxNQUNsQixTQUFTO0FBQUEsTUFDVCxVQUFVLE1BQU07QUFFZCxlQUFPLEtBQ0osUUFBUSw4Q0FBOEMsRUFBRSxFQUN4RCxRQUFRLDZDQUE2QyxFQUFFO0FBQUEsTUFDNUQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOzs7QURuQ0EsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxlQUFlLFNBQVM7QUFFOUIsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sR0FBRyxHQUFJLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBRTtBQUFBLElBQ3JFLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUNwQyxZQUFZLEtBQUssUUFBUSxrQ0FBVyxlQUFlO0FBQUEsTUFDckQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUE7QUFBQSxRQUViLEdBQUksZUFDQTtBQUFBLFVBQ0UsT0FBTyxLQUFLLFFBQVEsa0NBQVcsdUJBQXVCO0FBQUEsUUFDeEQsSUFDQSxDQUFDO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFlBQzNCLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsVUFDeEM7QUFBQSxRQUNGO0FBQUE7QUFBQSxRQUVBLFVBQVUsZUFDTixDQUFDLGlCQUFpQixnQkFBZ0IsZUFBZSxjQUFjLElBQy9ELENBQUM7QUFBQSxNQUNQO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixRQUFRLGVBQWUsWUFBWTtBQUFBLElBQ3JDO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixpQkFBaUIsS0FBSztBQUFBLFFBQ3BCLFFBQVEsSUFBSSx1QkFBdUI7QUFBQSxNQUNyQztBQUFBLE1BQ0Esd0JBQXdCLEtBQUssVUFBVSxJQUFJO0FBQUE7QUFBQSxNQUUzQyxHQUFJLGVBQ0E7QUFBQSxRQUNFLG1CQUFtQjtBQUFBLFFBQ25CLHVCQUF1QjtBQUFBLFFBQ3ZCLHdCQUF3QjtBQUFBLFFBQ3hCLDBCQUEwQjtBQUFBLE1BQzVCLElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQTtBQUFBLElBRUEsR0FBSSxlQUNBLENBQUMsSUFDRDtBQUFBLE1BQ0UsUUFBUTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFVBQ0wsUUFBUTtBQUFBLFlBQ04sUUFBUTtBQUFBLFlBQ1IsY0FBYztBQUFBLFlBQ2QsUUFBUTtBQUFBLFVBQ1Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNOO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
