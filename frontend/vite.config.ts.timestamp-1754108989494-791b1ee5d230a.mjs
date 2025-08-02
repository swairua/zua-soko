// vite.config.ts
import { defineConfig } from "file:///app/code/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/app/code/frontend";
var injectProductionScript = () => {
  return {
    name: "inject-production-script",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (ctx.bundle) {
          const script = `
    <script>
      // Production optimizations - Block Vite HMR client
      if (typeof WebSocket !== 'undefined') {
        const OriginalWebSocket = WebSocket;
        WebSocket = function(url, protocols) {
          if (typeof url === 'string' && (url.includes('vite') || url.includes('hmr') || url.includes('@vite'))) {
            console.log('Blocked HMR WebSocket connection:', url);
            return {
              close: () => {}, send: () => {}, addEventListener: () => {}, removeEventListener: () => {},
              readyState: 3, CLOSED: 3, CONNECTING: 0, OPEN: 1, CLOSING: 2
            };
          }
          return new OriginalWebSocket(url, protocols);
        };
      }
      if (typeof fetch !== 'undefined') {
        const originalFetch = fetch;
        fetch = function(url, options) {
          if (typeof url === 'string' && (url.includes('@vite') || url.includes('vite/client') || url.includes('hmr'))) {
            console.log('Blocked HMR fetch request:', url);
            return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          return originalFetch.call(this, url, options);
        };
      }
    </script>`;
          return html.replace("<head>", `<head>${script}`);
        }
        return html;
      }
    }
  };
};
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
      }),
      ...isProduction ? [injectProductionScript()] : []
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: isProduction ? "esbuild" : false,
      rollupOptions: {
        input: path.resolve(__vite_injected_original_dirname, "index.html"),
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
      target: "esnext"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gUGx1Z2luIHRvIGluamVjdCBITVIgYmxvY2tpbmcgc2NyaXB0IGluIHByb2R1Y3Rpb25cbmNvbnN0IGluamVjdFByb2R1Y3Rpb25TY3JpcHQgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2luamVjdC1wcm9kdWN0aW9uLXNjcmlwdCcsXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3ByZScsXG4gICAgICBoYW5kbGVyKGh0bWwsIGN0eCkge1xuICAgICAgICBpZiAoY3R4LmJ1bmRsZSkgeyAvLyBPbmx5IGluIHByb2R1Y3Rpb24gYnVpbGRzXG4gICAgICAgICAgY29uc3Qgc2NyaXB0ID0gYFxuICAgIDxzY3JpcHQ+XG4gICAgICAvLyBQcm9kdWN0aW9uIG9wdGltaXphdGlvbnMgLSBCbG9jayBWaXRlIEhNUiBjbGllbnRcbiAgICAgIGlmICh0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBPcmlnaW5hbFdlYlNvY2tldCA9IFdlYlNvY2tldDtcbiAgICAgICAgV2ViU29ja2V0ID0gZnVuY3Rpb24odXJsLCBwcm90b2NvbHMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycgJiYgKHVybC5pbmNsdWRlcygndml0ZScpIHx8IHVybC5pbmNsdWRlcygnaG1yJykgfHwgdXJsLmluY2x1ZGVzKCdAdml0ZScpKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jsb2NrZWQgSE1SIFdlYlNvY2tldCBjb25uZWN0aW9uOicsIHVybCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjbG9zZTogKCkgPT4ge30sIHNlbmQ6ICgpID0+IHt9LCBhZGRFdmVudExpc3RlbmVyOiAoKSA9PiB7fSwgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogKCkgPT4ge30sXG4gICAgICAgICAgICAgIHJlYWR5U3RhdGU6IDMsIENMT1NFRDogMywgQ09OTkVDVElORzogMCwgT1BFTjogMSwgQ0xPU0lORzogMlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBPcmlnaW5hbFdlYlNvY2tldCh1cmwsIHByb3RvY29scyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGZldGNoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBvcmlnaW5hbEZldGNoID0gZmV0Y2g7XG4gICAgICAgIGZldGNoID0gZnVuY3Rpb24odXJsLCBvcHRpb25zKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnICYmICh1cmwuaW5jbHVkZXMoJ0B2aXRlJykgfHwgdXJsLmluY2x1ZGVzKCd2aXRlL2NsaWVudCcpIHx8IHVybC5pbmNsdWRlcygnaG1yJykpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQmxvY2tlZCBITVIgZmV0Y2ggcmVxdWVzdDonLCB1cmwpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgUmVzcG9uc2UoJ3t9JywgeyBzdGF0dXM6IDIwMCwgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxGZXRjaC5jYWxsKHRoaXMsIHVybCwgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgPC9zY3JpcHQ+YDtcbiAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKCc8aGVhZD4nLCBgPGhlYWQ+JHtzY3JpcHR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAgLi4uKGlzUHJvZHVjdGlvblxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBqc3hSdW50aW1lOiBcImNsYXNzaWNcIixcbiAgICAgICAgICAgICAganN4RmFjdG9yeTogXCJSZWFjdC5jcmVhdGVFbGVtZW50XCIsXG4gICAgICAgICAgICAgIGpzeEZyYWdtZW50OiBcIlJlYWN0LkZyYWdtZW50XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIGpzeFJ1bnRpbWU6IFwiYXV0b21hdGljXCIsXG4gICAgICAgICAgICB9KSxcbiAgICAgIH0pLFxuICAgICAgLi4uKGlzUHJvZHVjdGlvbiA/IFtpbmplY3RQcm9kdWN0aW9uU2NyaXB0KCldIDogW10pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgbWluaWZ5OiBpc1Byb2R1Y3Rpb24gPyBcImVzYnVpbGRcIiA6IGZhbHNlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF1cIixcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgICByb3V0ZXI6IFtcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gICAgICAgICAgICB1aTogW1wibHVjaWRlLXJlYWN0XCIsIFwicmVhY3QtaG90LXRvYXN0XCJdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVybmFsOiBpc1Byb2R1Y3Rpb25cbiAgICAgICAgICA/IFtcIi9Adml0ZS9jbGllbnRcIiwgXCJAdml0ZS9jbGllbnRcIiwgXCJ2aXRlL2NsaWVudFwiLCBcIi92aXRlL2NsaWVudFwiXVxuICAgICAgICAgIDogW10sXG4gICAgICB9LFxuICAgICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uIHx8IFwiMC4xLjBcIixcbiAgICAgICksXG4gICAgICBcInByb2Nlc3MuZW52Lk5PREVfRU5WXCI6IEpTT04uc3RyaW5naWZ5KG1vZGUpLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIGFsbG93ZWRIb3N0czogW1wienVhLXNva28ub25yZW5kZXIuY29tXCIsIFwibG9jYWxob3N0XCJdLFxuICAgICAgLi4uKG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIlxuICAgICAgICA/IHtcbiAgICAgICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMlwiLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIDoge30pLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd08sU0FBUyxvQkFBb0I7QUFDclEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLHlCQUF5QixNQUFNO0FBQ25DLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLG9CQUFvQjtBQUFBLE1BQ2xCLE9BQU87QUFBQSxNQUNQLFFBQVEsTUFBTSxLQUFLO0FBQ2pCLFlBQUksSUFBSSxRQUFRO0FBQ2QsZ0JBQU0sU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUEyQmYsaUJBQU8sS0FBSyxRQUFRLFVBQVUsU0FBUyxNQUFNLEVBQUU7QUFBQSxRQUNqRDtBQUNBLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxRQUNKLEdBQUksZUFDQTtBQUFBLFVBQ0UsWUFBWTtBQUFBLFVBQ1osWUFBWTtBQUFBLFVBQ1osYUFBYTtBQUFBLFFBQ2YsSUFDQTtBQUFBLFVBQ0UsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxNQUNOLENBQUM7QUFBQSxNQUNELEdBQUksZUFBZSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQztBQUFBLElBQ25EO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxRQUFRLGVBQWUsWUFBWTtBQUFBLE1BQ25DLGVBQWU7QUFBQSxRQUNiLE9BQU8sS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUMzQyxRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixjQUFjO0FBQUEsWUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFlBQzNCLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsVUFDeEM7QUFBQSxRQUNGO0FBQUEsUUFDQSxVQUFVLGVBQ04sQ0FBQyxpQkFBaUIsZ0JBQWdCLGVBQWUsY0FBYyxJQUMvRCxDQUFDO0FBQUEsTUFDUDtBQUFBLE1BQ0EsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGlCQUFpQixLQUFLO0FBQUEsUUFDcEIsUUFBUSxJQUFJLHVCQUF1QjtBQUFBLE1BQ3JDO0FBQUEsTUFDQSx3QkFBd0IsS0FBSyxVQUFVLElBQUk7QUFBQSxJQUM3QztBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sY0FBYyxDQUFDLHlCQUF5QixXQUFXO0FBQUEsTUFDbkQsR0FBSSxTQUFTLGdCQUNUO0FBQUEsUUFDRSxPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUEsWUFDUixjQUFjO0FBQUEsWUFDZCxRQUFRO0FBQUEsVUFDVjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
