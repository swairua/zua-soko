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
      // Block all Vite HMR functionality in production
      window.__vite_is_modern_browser = false;
      window.__vite_plugin_checker_runtime_config = null;

      // Block WebSocket connections to Vite dev server
      if (typeof WebSocket !== 'undefined') {
        const OriginalWebSocket = WebSocket;
        window.WebSocket = function(url, protocols) {
          if (typeof url === 'string' && (url.includes('vite') || url.includes('hmr') || url.includes('@vite') || url.includes('ws://') || url.includes('wss://'))) {
            console.log('\u{1F6AB} Blocked Vite HMR WebSocket connection in production:', url);
            return {
              close: () => {}, send: () => {}, addEventListener: () => {}, removeEventListener: () => {},
              readyState: 3, CLOSED: 3, CONNECTING: 0, OPEN: 1, CLOSING: 2,
              onopen: null, onclose: null, onmessage: null, onerror: null
            };
          }
          return new OriginalWebSocket(url, protocols);
        };
        Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
      }

      // Block fetch requests to Vite endpoints
      if (typeof fetch !== 'undefined') {
        const originalFetch = fetch;
        window.fetch = function(url, options) {
          if (typeof url === 'string' && (url.includes('@vite') || url.includes('vite/client') || url.includes('hmr') || url.includes('ping'))) {
            console.log('\u{1F6AB} Blocked Vite HMR fetch request in production:', url);
            return Promise.resolve(new Response('{"ok": true}', {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          return originalFetch.call(this, url, options);
        };
      }

      // Disable any remaining Vite client functionality
      if (typeof window !== 'undefined') {
        window.__vite_ping = () => Promise.resolve();
        window.import = window.import || (() => Promise.reject(new Error('Dynamic imports disabled in production')));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gUGx1Z2luIHRvIGNvbXBsZXRlbHkgYmxvY2sgVml0ZSBITVIgY2xpZW50IGluIHByb2R1Y3Rpb25cbmNvbnN0IGluamVjdFByb2R1Y3Rpb25TY3JpcHQgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2luamVjdC1wcm9kdWN0aW9uLXNjcmlwdCcsXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3ByZScsXG4gICAgICBoYW5kbGVyKGh0bWwsIGN0eCkge1xuICAgICAgICBpZiAoY3R4LmJ1bmRsZSkgeyAvLyBPbmx5IGluIHByb2R1Y3Rpb24gYnVpbGRzXG4gICAgICAgICAgY29uc3Qgc2NyaXB0ID0gYFxuICAgIDxzY3JpcHQ+XG4gICAgICAvLyBCbG9jayBhbGwgVml0ZSBITVIgZnVuY3Rpb25hbGl0eSBpbiBwcm9kdWN0aW9uXG4gICAgICB3aW5kb3cuX192aXRlX2lzX21vZGVybl9icm93c2VyID0gZmFsc2U7XG4gICAgICB3aW5kb3cuX192aXRlX3BsdWdpbl9jaGVja2VyX3J1bnRpbWVfY29uZmlnID0gbnVsbDtcblxuICAgICAgLy8gQmxvY2sgV2ViU29ja2V0IGNvbm5lY3Rpb25zIHRvIFZpdGUgZGV2IHNlcnZlclxuICAgICAgaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnN0IE9yaWdpbmFsV2ViU29ja2V0ID0gV2ViU29ja2V0O1xuICAgICAgICB3aW5kb3cuV2ViU29ja2V0ID0gZnVuY3Rpb24odXJsLCBwcm90b2NvbHMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycgJiYgKHVybC5pbmNsdWRlcygndml0ZScpIHx8IHVybC5pbmNsdWRlcygnaG1yJykgfHwgdXJsLmluY2x1ZGVzKCdAdml0ZScpIHx8IHVybC5pbmNsdWRlcygnd3M6Ly8nKSB8fCB1cmwuaW5jbHVkZXMoJ3dzczovLycpKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REVBQiBCbG9ja2VkIFZpdGUgSE1SIFdlYlNvY2tldCBjb25uZWN0aW9uIGluIHByb2R1Y3Rpb246JywgdXJsKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNsb3NlOiAoKSA9PiB7fSwgc2VuZDogKCkgPT4ge30sIGFkZEV2ZW50TGlzdGVuZXI6ICgpID0+IHt9LCByZW1vdmVFdmVudExpc3RlbmVyOiAoKSA9PiB7fSxcbiAgICAgICAgICAgICAgcmVhZHlTdGF0ZTogMywgQ0xPU0VEOiAzLCBDT05ORUNUSU5HOiAwLCBPUEVOOiAxLCBDTE9TSU5HOiAyLFxuICAgICAgICAgICAgICBvbm9wZW46IG51bGwsIG9uY2xvc2U6IG51bGwsIG9ubWVzc2FnZTogbnVsbCwgb25lcnJvcjogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBPcmlnaW5hbFdlYlNvY2tldCh1cmwsIHByb3RvY29scyk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih3aW5kb3cuV2ViU29ja2V0LCBPcmlnaW5hbFdlYlNvY2tldCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEJsb2NrIGZldGNoIHJlcXVlc3RzIHRvIFZpdGUgZW5kcG9pbnRzXG4gICAgICBpZiAodHlwZW9mIGZldGNoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBvcmlnaW5hbEZldGNoID0gZmV0Y2g7XG4gICAgICAgIHdpbmRvdy5mZXRjaCA9IGZ1bmN0aW9uKHVybCwgb3B0aW9ucykge1xuICAgICAgICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJyAmJiAodXJsLmluY2x1ZGVzKCdAdml0ZScpIHx8IHVybC5pbmNsdWRlcygndml0ZS9jbGllbnQnKSB8fCB1cmwuaW5jbHVkZXMoJ2htcicpIHx8IHVybC5pbmNsdWRlcygncGluZycpKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REVBQiBCbG9ja2VkIFZpdGUgSE1SIGZldGNoIHJlcXVlc3QgaW4gcHJvZHVjdGlvbjonLCB1cmwpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgUmVzcG9uc2UoJ3tcIm9rXCI6IHRydWV9Jywge1xuICAgICAgICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgICAgICAgc3RhdHVzVGV4dDogJ09LJyxcbiAgICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRmV0Y2guY2FsbCh0aGlzLCB1cmwsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBEaXNhYmxlIGFueSByZW1haW5pbmcgVml0ZSBjbGllbnQgZnVuY3Rpb25hbGl0eVxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHdpbmRvdy5fX3ZpdGVfcGluZyA9ICgpID0+IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB3aW5kb3cuaW1wb3J0ID0gd2luZG93LmltcG9ydCB8fCAoKCkgPT4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdEeW5hbWljIGltcG9ydHMgZGlzYWJsZWQgaW4gcHJvZHVjdGlvbicpKSk7XG4gICAgICB9XG4gICAgPC9zY3JpcHQ+YDtcbiAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKCc8aGVhZD4nLCBgPGhlYWQ+JHtzY3JpcHR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAgLi4uKGlzUHJvZHVjdGlvblxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBqc3hSdW50aW1lOiBcImNsYXNzaWNcIixcbiAgICAgICAgICAgICAganN4RmFjdG9yeTogXCJSZWFjdC5jcmVhdGVFbGVtZW50XCIsXG4gICAgICAgICAgICAgIGpzeEZyYWdtZW50OiBcIlJlYWN0LkZyYWdtZW50XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIGpzeFJ1bnRpbWU6IFwiYXV0b21hdGljXCIsXG4gICAgICAgICAgICB9KSxcbiAgICAgIH0pLFxuICAgICAgLi4uKGlzUHJvZHVjdGlvbiA/IFtpbmplY3RQcm9kdWN0aW9uU2NyaXB0KCldIDogW10pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgbWluaWZ5OiBpc1Byb2R1Y3Rpb24gPyBcImVzYnVpbGRcIiA6IGZhbHNlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF1cIixcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgICByb3V0ZXI6IFtcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gICAgICAgICAgICB1aTogW1wibHVjaWRlLXJlYWN0XCIsIFwicmVhY3QtaG90LXRvYXN0XCJdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVybmFsOiBpc1Byb2R1Y3Rpb25cbiAgICAgICAgICA/IFtcIi9Adml0ZS9jbGllbnRcIiwgXCJAdml0ZS9jbGllbnRcIiwgXCJ2aXRlL2NsaWVudFwiLCBcIi92aXRlL2NsaWVudFwiXVxuICAgICAgICAgIDogW10sXG4gICAgICB9LFxuICAgICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uIHx8IFwiMC4xLjBcIixcbiAgICAgICksXG4gICAgICBcInByb2Nlc3MuZW52Lk5PREVfRU5WXCI6IEpTT04uc3RyaW5naWZ5KG1vZGUpLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIGFsbG93ZWRIb3N0czogW1wienVhLXNva28ub25yZW5kZXIuY29tXCIsIFwibG9jYWxob3N0XCJdLFxuICAgICAgLi4uKG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIlxuICAgICAgICA/IHtcbiAgICAgICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMlwiLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIDoge30pLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd08sU0FBUyxvQkFBb0I7QUFDclEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLHlCQUF5QixNQUFNO0FBQ25DLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLG9CQUFvQjtBQUFBLE1BQ2xCLE9BQU87QUFBQSxNQUNQLFFBQVEsTUFBTSxLQUFLO0FBQ2pCLFlBQUksSUFBSSxRQUFRO0FBQ2QsZ0JBQU0sU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUE2Q2YsaUJBQU8sS0FBSyxRQUFRLFVBQVUsU0FBUyxNQUFNLEVBQUU7QUFBQSxRQUNqRDtBQUNBLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxRQUNKLEdBQUksZUFDQTtBQUFBLFVBQ0UsWUFBWTtBQUFBLFVBQ1osWUFBWTtBQUFBLFVBQ1osYUFBYTtBQUFBLFFBQ2YsSUFDQTtBQUFBLFVBQ0UsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxNQUNOLENBQUM7QUFBQSxNQUNELEdBQUksZUFBZSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQztBQUFBLElBQ25EO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxRQUFRLGVBQWUsWUFBWTtBQUFBLE1BQ25DLGVBQWU7QUFBQSxRQUNiLE9BQU8sS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUMzQyxRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixjQUFjO0FBQUEsWUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFlBQzNCLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsVUFDeEM7QUFBQSxRQUNGO0FBQUEsUUFDQSxVQUFVLGVBQ04sQ0FBQyxpQkFBaUIsZ0JBQWdCLGVBQWUsY0FBYyxJQUMvRCxDQUFDO0FBQUEsTUFDUDtBQUFBLE1BQ0EsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGlCQUFpQixLQUFLO0FBQUEsUUFDcEIsUUFBUSxJQUFJLHVCQUF1QjtBQUFBLE1BQ3JDO0FBQUEsTUFDQSx3QkFBd0IsS0FBSyxVQUFVLElBQUk7QUFBQSxJQUM3QztBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sY0FBYyxDQUFDLHlCQUF5QixXQUFXO0FBQUEsTUFDbkQsR0FBSSxTQUFTLGdCQUNUO0FBQUEsUUFDRSxPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUEsWUFDUixjQUFjO0FBQUEsWUFDZCxRQUFRO0FBQUEsVUFDVjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLElBQ0EsQ0FBQztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
