// vite.config.ts
import { defineConfig } from "file:///app/code/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";

// vite-no-client.plugin.ts
function noViteClientPlugin() {
  return {
    name: "no-vite-client",
    apply: "build",
    enforce: "pre",
    config(config, { command }) {
      if (command === "build") {
        config.define = config.define || {};
        config.define["import.meta.hot"] = "undefined";
        config.define["import.meta.env.DEV"] = "false";
        config.define["import.meta.env.PROD"] = "true";
        config.define["__DEV__"] = "false";
        delete config.server;
        config.build = config.build || {};
        config.build.rollupOptions = config.build.rollupOptions || {};
        const external = config.build.rollupOptions.external || [];
        const externalArray = Array.isArray(external) ? external : [];
        externalArray.push(
          "/@vite/client",
          "@vite/client",
          "vite/client",
          "/vite/client",
          "vite/dist/client/env.mjs",
          "/vite/dist/client/env.mjs"
        );
        config.build.rollupOptions.external = externalArray;
        config.build.sourcemap = false;
      }
    },
    configResolved(resolvedConfig) {
      if (resolvedConfig.command === "build") {
        resolvedConfig.env = resolvedConfig.env || {};
        resolvedConfig.env.DEV = false;
        resolvedConfig.env.PROD = true;
        if (resolvedConfig.plugins) {
          resolvedConfig.plugins = resolvedConfig.plugins.filter(
            (plugin) => {
              if (plugin && plugin.name) {
                if (plugin.name.includes("vite:client") || plugin.name.includes("vite:hmr") || plugin.name.includes("vite:ws")) {
                  console.log(
                    `\u{1F6AB} Filtered out Vite dev plugin: ${plugin.name}`
                  );
                  return false;
                }
              }
              return true;
            }
          );
        }
      }
    },
    buildStart() {
      console.log("\u{1F6AB} Vite client injection blocked for production build");
    },
    resolveId(id) {
      if (id.includes("@vite/client") || id.includes("vite/client") || id.includes("vite/dist/client")) {
        console.log(`\u{1F6AB} Blocked Vite client import: ${id}`);
        return { id: "virtual:vite-client-blocked", external: true };
      }
      return null;
    },
    load(id) {
      if (id === "virtual:vite-client-blocked") {
        return "export default {};";
      }
      return null;
    },
    transform(code, id) {
      if (code.includes("@vite/client") || code.includes("vite/client") || code.includes("import.meta.hot") || code.includes("HMRContext")) {
        console.log(`\u{1F9F9} Cleaning Vite client code from: ${id}`);
        let cleanCode = code.replace(/import\s+[^;]*@vite\/client[^;]*;?\n?/g, "").replace(/import\s+[^;]*vite\/client[^;]*;?\n?/g, "").replace(/import\s+[^;]*vite\/dist\/client[^;]*;?\n?/g, "").replace(/import\.meta\.hot[^;]*;?\n?/g, "").replace(/if\s*\(\s*import\.meta\.hot\s*\)[^}]*}/g, "").replace(/__vite_plugin_react_preamble_installed__[^;]*;?\n?/g, "").replace(/createHotContext[^;]*;?\n?/g, "").replace(/HMRContext[^;]*;?\n?/g, "").replace(/const\s+hot\s*=[^;]*;?\n?/g, "").replace(/\/\*\s*@vite-ignore\s*\*\/[^;]*;?\n?/g, "");
        return cleanCode;
      }
      return null;
    },
    generateBundle(options, bundle) {
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.code) {
          const originalCode = chunk.code;
          chunk.code = chunk.code.replace(/@vite\/client/g, "").replace(/vite\/client/g, "").replace(/vite\/dist\/client/g, "").replace(/import\.meta\.hot/g, "undefined").replace(/HMRContext/g, "undefined").replace(/createHotContext/g, "function(){}").replace(/__vite_plugin_react_preamble_installed__/g, "true");
          if (originalCode !== chunk.code) {
            console.log(`\u{1F9F9} Final cleanup of Vite references in: ${fileName}`);
          }
        }
      });
    },
    transformIndexHtml: {
      enforce: "post",
      transform(html, context) {
        let cleanHtml = html.replace(/<script[^>]*@vite\/client[^>]*><\/script>/g, "").replace(/<script[^>]*vite\/client[^>]*><\/script>/g, "").replace(/<script[^>]*vite\/dist\/client[^>]*><\/script>/g, "");
        if (cleanHtml !== html) {
          console.log("\u{1F9F9} Removed Vite client scripts from HTML");
        }
        return cleanHtml;
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "/app/code/frontend";
var vite_config_default = defineConfig(({ command, mode }) => {
  const isProduction = mode === "production" || command === "build";
  const config = {
    // Forcefully disable client injection by overriding internals
    optimizeDeps: {
      exclude: isProduction ? ["@vite/client", "vite/client"] : []
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@/shared": path.resolve(__vite_injected_original_dirname, "../shared/src"),
        // Redirect Vite client to empty module in production
        ...isProduction ? {
          "@vite/client": path.resolve(__vite_injected_original_dirname, "src/empty-module.js"),
          "vite/client": path.resolve(__vite_injected_original_dirname, "src/empty-module.js"),
          "vite/dist/client/env.mjs": path.resolve(
            __vite_injected_original_dirname,
            "src/empty-module.js"
          )
        } : {}
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react", "react-hot-toast"]
          }
        },
        // Completely exclude all Vite client modules
        external: isProduction ? [
          "/@vite/client",
          "@vite/client",
          "vite/client",
          "/vite/client",
          "vite/dist/client/env.mjs",
          "/vite/dist/client/env.mjs"
        ] : []
      },
      target: "esnext",
      minify: isProduction ? "esbuild" : false,
      cssMinify: isProduction,
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
      // Completely neutralize all Vite/HMR features
      "import.meta.hot": "undefined",
      "import.meta.env.DEV": JSON.stringify(!isProduction),
      "import.meta.env.PROD": JSON.stringify(isProduction),
      __VITE_IS_MODERN_BROWSER: "true",
      // Neutralize HMR context completely
      HMRContext: "undefined",
      createHotContext: "(() => undefined)"
    },
    esbuild: {
      target: "esnext",
      platform: "browser",
      drop: isProduction ? ["console", "debugger"] : [],
      pure: isProduction ? ["console.log", "console.warn", "console.error"] : []
    }
  };
  config.plugins = isProduction ? [react(), noViteClientPlugin()] : [react()];
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
  } else {
    config.clearScreen = false;
    config.logLevel = "error";
    if (config.build) {
      config.build.reportCompressedSize = false;
      config.build.chunkSizeWarningLimit = 1e3;
    }
    delete config.server;
  }
  return config;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1uby1jbGllbnQucGx1Z2luLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBub1ZpdGVDbGllbnRQbHVnaW4gfSBmcm9tIFwiLi92aXRlLW5vLWNsaWVudC5wbHVnaW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIiB8fCBjb21tYW5kID09PSBcImJ1aWxkXCI7XG5cbiAgLy8gQmFzZSBjb25maWd1cmF0aW9uXG4gIGNvbnN0IGNvbmZpZzogVXNlckNvbmZpZyA9IHtcbiAgICAvLyBGb3JjZWZ1bGx5IGRpc2FibGUgY2xpZW50IGluamVjdGlvbiBieSBvdmVycmlkaW5nIGludGVybmFsc1xuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogaXNQcm9kdWN0aW9uID8gW1wiQHZpdGUvY2xpZW50XCIsIFwidml0ZS9jbGllbnRcIl0gOiBbXSxcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICBcIkAvc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vc2hhcmVkL3NyY1wiKSxcbiAgICAgICAgLy8gUmVkaXJlY3QgVml0ZSBjbGllbnQgdG8gZW1wdHkgbW9kdWxlIGluIHByb2R1Y3Rpb25cbiAgICAgICAgLi4uKGlzUHJvZHVjdGlvblxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBcIkB2aXRlL2NsaWVudFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9lbXB0eS1tb2R1bGUuanNcIiksXG4gICAgICAgICAgICAgIFwidml0ZS9jbGllbnRcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvZW1wdHktbW9kdWxlLmpzXCIpLFxuICAgICAgICAgICAgICBcInZpdGUvZGlzdC9jbGllbnQvZW52Lm1qc1wiOiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICAgICAgIFwic3JjL2VtcHR5LW1vZHVsZS5qc1wiLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge30pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICB2ZW5kb3I6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgICAgICAgICAgcm91dGVyOiBbXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgICAgdWk6IFtcImx1Y2lkZS1yZWFjdFwiLCBcInJlYWN0LWhvdC10b2FzdFwiXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvLyBDb21wbGV0ZWx5IGV4Y2x1ZGUgYWxsIFZpdGUgY2xpZW50IG1vZHVsZXNcbiAgICAgICAgZXh0ZXJuYWw6IGlzUHJvZHVjdGlvblxuICAgICAgICAgID8gW1xuICAgICAgICAgICAgICBcIi9Adml0ZS9jbGllbnRcIixcbiAgICAgICAgICAgICAgXCJAdml0ZS9jbGllbnRcIixcbiAgICAgICAgICAgICAgXCJ2aXRlL2NsaWVudFwiLFxuICAgICAgICAgICAgICBcIi92aXRlL2NsaWVudFwiLFxuICAgICAgICAgICAgICBcInZpdGUvZGlzdC9jbGllbnQvZW52Lm1qc1wiLFxuICAgICAgICAgICAgICBcIi92aXRlL2Rpc3QvY2xpZW50L2Vudi5tanNcIixcbiAgICAgICAgICAgIF1cbiAgICAgICAgICA6IFtdLFxuICAgICAgfSxcbiAgICAgIHRhcmdldDogXCJlc25leHRcIixcbiAgICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uID8gXCJlc2J1aWxkXCIgOiBmYWxzZSxcbiAgICAgIGNzc01pbmlmeTogaXNQcm9kdWN0aW9uLFxuICAgICAgdGVyc2VyT3B0aW9uczogaXNQcm9kdWN0aW9uXG4gICAgICAgID8ge1xuICAgICAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxuICAgICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIDogdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24pLFxuICAgICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBKU09OLnN0cmluZ2lmeShtb2RlKSxcbiAgICAgIF9fREVWX186IEpTT04uc3RyaW5naWZ5KCFpc1Byb2R1Y3Rpb24pLFxuICAgICAgLy8gQ29tcGxldGVseSBuZXV0cmFsaXplIGFsbCBWaXRlL0hNUiBmZWF0dXJlc1xuICAgICAgXCJpbXBvcnQubWV0YS5ob3RcIjogXCJ1bmRlZmluZWRcIixcbiAgICAgIFwiaW1wb3J0Lm1ldGEuZW52LkRFVlwiOiBKU09OLnN0cmluZ2lmeSghaXNQcm9kdWN0aW9uKSxcbiAgICAgIFwiaW1wb3J0Lm1ldGEuZW52LlBST0RcIjogSlNPTi5zdHJpbmdpZnkoaXNQcm9kdWN0aW9uKSxcbiAgICAgIF9fVklURV9JU19NT0RFUk5fQlJPV1NFUjogXCJ0cnVlXCIsXG4gICAgICAvLyBOZXV0cmFsaXplIEhNUiBjb250ZXh0IGNvbXBsZXRlbHlcbiAgICAgIEhNUkNvbnRleHQ6IFwidW5kZWZpbmVkXCIsXG4gICAgICBjcmVhdGVIb3RDb250ZXh0OiBcIigoKSA9PiB1bmRlZmluZWQpXCIsXG4gICAgfSxcbiAgICBlc2J1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBwbGF0Zm9ybTogXCJicm93c2VyXCIsXG4gICAgICBkcm9wOiBpc1Byb2R1Y3Rpb24gPyBbXCJjb25zb2xlXCIsIFwiZGVidWdnZXJcIl0gOiBbXSxcbiAgICAgIHB1cmU6IGlzUHJvZHVjdGlvblxuICAgICAgICA/IFtcImNvbnNvbGUubG9nXCIsIFwiY29uc29sZS53YXJuXCIsIFwiY29uc29sZS5lcnJvclwiXVxuICAgICAgICA6IFtdLFxuICAgIH0sXG4gIH07XG5cbiAgLy8gQWRkIHBsdWdpbnMgYmFzZWQgb24gZW52aXJvbm1lbnRcbiAgY29uZmlnLnBsdWdpbnMgPSBpc1Byb2R1Y3Rpb24gPyBbcmVhY3QoKSwgbm9WaXRlQ2xpZW50UGx1Z2luKCldIDogW3JlYWN0KCldO1xuXG4gIC8vIE9ubHkgYWRkIHNlcnZlciBjb25maWcgaW4gZGV2ZWxvcG1lbnRcbiAgaWYgKCFpc1Byb2R1Y3Rpb24pIHtcbiAgICBjb25maWcuc2VydmVyID0ge1xuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIGhvc3Q6IHRydWUsXG4gICAgICBobXI6IHtcbiAgICAgICAgcG9ydDogMzAwMSxcbiAgICAgICAgY2xpZW50UG9ydDogMzAwMSxcbiAgICAgIH0sXG4gICAgICBwcm94eToge1xuICAgICAgICBcIi9hcGlcIjoge1xuICAgICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjUwMDFcIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBQcm9kdWN0aW9uLXNwZWNpZmljIHNldHRpbmdzIHRoYXQgY29tcGxldGVseSBkaXNhYmxlIGRldiBmZWF0dXJlc1xuICAgIGNvbmZpZy5jbGVhclNjcmVlbiA9IGZhbHNlO1xuICAgIGNvbmZpZy5sb2dMZXZlbCA9IFwiZXJyb3JcIjtcbiAgICBpZiAoY29uZmlnLmJ1aWxkKSB7XG4gICAgICBjb25maWcuYnVpbGQucmVwb3J0Q29tcHJlc3NlZFNpemUgPSBmYWxzZTtcbiAgICAgIGNvbmZpZy5idWlsZC5jaHVua1NpemVXYXJuaW5nTGltaXQgPSAxMDAwO1xuICAgIH1cblxuICAgIC8vIE92ZXJyaWRlIGFueSBwb3RlbnRpYWwgc2VydmVyIGNvbmZpZyBpbiBwcm9kdWN0aW9uXG4gICAgZGVsZXRlIGNvbmZpZy5zZXJ2ZXI7XG4gIH1cblxuICByZXR1cm4gY29uZmlnO1xufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9hcHAvY29kZS9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9jb2RlL2Zyb250ZW5kL3ZpdGUtbm8tY2xpZW50LnBsdWdpbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvZnJvbnRlbmQvdml0ZS1uby1jbGllbnQucGx1Z2luLnRzXCI7aW1wb3J0IHsgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcblxuLy8gQWdncmVzc2l2ZSBwbHVnaW4gdG8gY29tcGxldGVseSBwcmV2ZW50IFZpdGUgY2xpZW50IGluamVjdGlvblxuZXhwb3J0IGZ1bmN0aW9uIG5vVml0ZUNsaWVudFBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwibm8tdml0ZS1jbGllbnRcIixcbiAgICBhcHBseTogXCJidWlsZFwiLFxuICAgIGVuZm9yY2U6IFwicHJlXCIsXG4gICAgY29uZmlnKGNvbmZpZywgeyBjb21tYW5kIH0pIHtcbiAgICAgIGlmIChjb21tYW5kID09PSBcImJ1aWxkXCIpIHtcbiAgICAgICAgLy8gRm9yY2UgZGlzYWJsZSBhbGwgZGV2ZWxvcG1lbnQgZmVhdHVyZXNcbiAgICAgICAgY29uZmlnLmRlZmluZSA9IGNvbmZpZy5kZWZpbmUgfHwge307XG4gICAgICAgIGNvbmZpZy5kZWZpbmVbXCJpbXBvcnQubWV0YS5ob3RcIl0gPSBcInVuZGVmaW5lZFwiO1xuICAgICAgICBjb25maWcuZGVmaW5lW1wiaW1wb3J0Lm1ldGEuZW52LkRFVlwiXSA9IFwiZmFsc2VcIjtcbiAgICAgICAgY29uZmlnLmRlZmluZVtcImltcG9ydC5tZXRhLmVudi5QUk9EXCJdID0gXCJ0cnVlXCI7XG4gICAgICAgIGNvbmZpZy5kZWZpbmVbXCJfX0RFVl9fXCJdID0gXCJmYWxzZVwiO1xuXG4gICAgICAgIC8vIERpc2FibGUgc2VydmVyIGNvbXBsZXRlbHkgZHVyaW5nIGJ1aWxkXG4gICAgICAgIGRlbGV0ZSBjb25maWcuc2VydmVyO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIGJ1aWxkIHNldHRpbmdzIHRvIGV4Y2x1ZGUgY2xpZW50XG4gICAgICAgIGNvbmZpZy5idWlsZCA9IGNvbmZpZy5idWlsZCB8fCB7fTtcbiAgICAgICAgY29uZmlnLmJ1aWxkLnJvbGx1cE9wdGlvbnMgPSBjb25maWcuYnVpbGQucm9sbHVwT3B0aW9ucyB8fCB7fTtcblxuICAgICAgICAvLyBDb21wbGV0ZWx5IGV4Y2x1ZGUgVml0ZSBjbGllbnQgZnJvbSBidWlsZFxuICAgICAgICBjb25zdCBleHRlcm5hbCA9IGNvbmZpZy5idWlsZC5yb2xsdXBPcHRpb25zLmV4dGVybmFsIHx8IFtdO1xuICAgICAgICBjb25zdCBleHRlcm5hbEFycmF5ID0gQXJyYXkuaXNBcnJheShleHRlcm5hbCkgPyBleHRlcm5hbCA6IFtdO1xuICAgICAgICBleHRlcm5hbEFycmF5LnB1c2goXG4gICAgICAgICAgXCIvQHZpdGUvY2xpZW50XCIsXG4gICAgICAgICAgXCJAdml0ZS9jbGllbnRcIixcbiAgICAgICAgICBcInZpdGUvY2xpZW50XCIsXG4gICAgICAgICAgXCIvdml0ZS9jbGllbnRcIixcbiAgICAgICAgICBcInZpdGUvZGlzdC9jbGllbnQvZW52Lm1qc1wiLFxuICAgICAgICAgIFwiL3ZpdGUvZGlzdC9jbGllbnQvZW52Lm1qc1wiLFxuICAgICAgICApO1xuICAgICAgICBjb25maWcuYnVpbGQucm9sbHVwT3B0aW9ucy5leHRlcm5hbCA9IGV4dGVybmFsQXJyYXk7XG5cbiAgICAgICAgLy8gRGlzYWJsZSBzb3VyY2VtYXAgY29tcGxldGVseSB0byBhdm9pZCBhbnkgZGV2IHJlZmVyZW5jZXNcbiAgICAgICAgY29uZmlnLmJ1aWxkLnNvdXJjZW1hcCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29uZmlnUmVzb2x2ZWQocmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIGlmIChyZXNvbHZlZENvbmZpZy5jb21tYW5kID09PSBcImJ1aWxkXCIpIHtcbiAgICAgICAgLy8gT3ZlcnJpZGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGF0IGNvbmZpZyBsZXZlbFxuICAgICAgICByZXNvbHZlZENvbmZpZy5lbnYgPSByZXNvbHZlZENvbmZpZy5lbnYgfHwge307XG4gICAgICAgIHJlc29sdmVkQ29uZmlnLmVudi5ERVYgPSBmYWxzZTtcbiAgICAgICAgcmVzb2x2ZWRDb25maWcuZW52LlBST0QgPSB0cnVlO1xuXG4gICAgICAgIC8vIEZvcmNlIGRpc2FibGUgYW55IGRldi1yZWxhdGVkIHBsdWdpbnMgdGhhdCBtaWdodCBpbmplY3QgY2xpZW50IGNvZGVcbiAgICAgICAgaWYgKHJlc29sdmVkQ29uZmlnLnBsdWdpbnMpIHtcbiAgICAgICAgICByZXNvbHZlZENvbmZpZy5wbHVnaW5zID0gcmVzb2x2ZWRDb25maWcucGx1Z2lucy5maWx0ZXIoXG4gICAgICAgICAgICAocGx1Z2luOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHBsdWdpbiAmJiBwbHVnaW4ubmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgYW55IFZpdGUgaW50ZXJuYWwgcGx1Z2lucyB0aGF0IGhhbmRsZSBjbGllbnQgaW5qZWN0aW9uXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgcGx1Z2luLm5hbWUuaW5jbHVkZXMoXCJ2aXRlOmNsaWVudFwiKSB8fFxuICAgICAgICAgICAgICAgICAgcGx1Z2luLm5hbWUuaW5jbHVkZXMoXCJ2aXRlOmhtclwiKSB8fFxuICAgICAgICAgICAgICAgICAgcGx1Z2luLm5hbWUuaW5jbHVkZXMoXCJ2aXRlOndzXCIpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFx1RDgzRFx1REVBQiBGaWx0ZXJlZCBvdXQgVml0ZSBkZXYgcGx1Z2luOiAke3BsdWdpbi5uYW1lfWAsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIC8vIExvZyB0aGF0IHdlJ3JlIGJsb2NraW5nIGNsaWVudCBpbmplY3Rpb25cbiAgICAgIGNvbnNvbGUubG9nKFwiXHVEODNEXHVERUFCIFZpdGUgY2xpZW50IGluamVjdGlvbiBibG9ja2VkIGZvciBwcm9kdWN0aW9uIGJ1aWxkXCIpO1xuICAgIH0sXG4gICAgcmVzb2x2ZUlkKGlkKSB7XG4gICAgICAvLyBCbG9jayBhbnkgYXR0ZW1wdCB0byBpbXBvcnQgVml0ZSBjbGllbnQgbW9kdWxlc1xuICAgICAgaWYgKFxuICAgICAgICBpZC5pbmNsdWRlcyhcIkB2aXRlL2NsaWVudFwiKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcyhcInZpdGUvY2xpZW50XCIpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKFwidml0ZS9kaXN0L2NsaWVudFwiKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURFQUIgQmxvY2tlZCBWaXRlIGNsaWVudCBpbXBvcnQ6ICR7aWR9YCk7XG4gICAgICAgIHJldHVybiB7IGlkOiBcInZpcnR1YWw6dml0ZS1jbGllbnQtYmxvY2tlZFwiLCBleHRlcm5hbDogdHJ1ZSB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBsb2FkKGlkKSB7XG4gICAgICAvLyBSZXR1cm4gZW1wdHkgbW9kdWxlIGZvciBibG9ja2VkIGNsaWVudCBpbXBvcnRzXG4gICAgICBpZiAoaWQgPT09IFwidmlydHVhbDp2aXRlLWNsaWVudC1ibG9ja2VkXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiZXhwb3J0IGRlZmF1bHQge307XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgLy8gUmVtb3ZlIGFueSByZW1haW5pbmcgVml0ZSBjbGllbnQgY29kZSBkdXJpbmcgdHJhbnNmb3JtYXRpb25cbiAgICAgIGlmIChcbiAgICAgICAgY29kZS5pbmNsdWRlcyhcIkB2aXRlL2NsaWVudFwiKSB8fFxuICAgICAgICBjb2RlLmluY2x1ZGVzKFwidml0ZS9jbGllbnRcIikgfHxcbiAgICAgICAgY29kZS5pbmNsdWRlcyhcImltcG9ydC5tZXRhLmhvdFwiKSB8fFxuICAgICAgICBjb2RlLmluY2x1ZGVzKFwiSE1SQ29udGV4dFwiKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0VcdURERjkgQ2xlYW5pbmcgVml0ZSBjbGllbnQgY29kZSBmcm9tOiAke2lkfWApO1xuXG4gICAgICAgIGxldCBjbGVhbkNvZGUgPSBjb2RlXG4gICAgICAgICAgLy8gUmVtb3ZlIGltcG9ydCBzdGF0ZW1lbnRzXG4gICAgICAgICAgLnJlcGxhY2UoL2ltcG9ydFxccytbXjtdKkB2aXRlXFwvY2xpZW50W147XSo7P1xcbj8vZywgXCJcIilcbiAgICAgICAgICAucmVwbGFjZSgvaW1wb3J0XFxzK1teO10qdml0ZVxcL2NsaWVudFteO10qOz9cXG4/L2csIFwiXCIpXG4gICAgICAgICAgLnJlcGxhY2UoL2ltcG9ydFxccytbXjtdKnZpdGVcXC9kaXN0XFwvY2xpZW50W147XSo7P1xcbj8vZywgXCJcIilcbiAgICAgICAgICAvLyBSZW1vdmUgSE1SIHJlbGF0ZWQgY29kZVxuICAgICAgICAgIC5yZXBsYWNlKC9pbXBvcnRcXC5tZXRhXFwuaG90W147XSo7P1xcbj8vZywgXCJcIilcbiAgICAgICAgICAucmVwbGFjZSgvaWZcXHMqXFwoXFxzKmltcG9ydFxcLm1ldGFcXC5ob3RcXHMqXFwpW159XSp9L2csIFwiXCIpXG4gICAgICAgICAgLnJlcGxhY2UoL19fdml0ZV9wbHVnaW5fcmVhY3RfcHJlYW1ibGVfaW5zdGFsbGVkX19bXjtdKjs/XFxuPy9nLCBcIlwiKVxuICAgICAgICAgIC8vIFJlbW92ZSBITVIgY29udGV4dCBhbmQgcmVsYXRlZCBmdW5jdGlvbnNcbiAgICAgICAgICAucmVwbGFjZSgvY3JlYXRlSG90Q29udGV4dFteO10qOz9cXG4/L2csIFwiXCIpXG4gICAgICAgICAgLnJlcGxhY2UoL0hNUkNvbnRleHRbXjtdKjs/XFxuPy9nLCBcIlwiKVxuICAgICAgICAgIC5yZXBsYWNlKC9jb25zdFxccytob3RcXHMqPVteO10qOz9cXG4/L2csIFwiXCIpXG4gICAgICAgICAgLy8gUmVtb3ZlIGFueSByZW1haW5pbmcgVml0ZS1zcGVjaWZpYyBjb2RlXG4gICAgICAgICAgLnJlcGxhY2UoL1xcL1xcKlxccypAdml0ZS1pZ25vcmVcXHMqXFwqXFwvW147XSo7P1xcbj8vZywgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIGNsZWFuQ29kZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAvLyBGaW5hbCBjbGVhbnVwIG9mIGFueSByZW1haW5pbmcgVml0ZSBjbGllbnQgcmVmZXJlbmNlc1xuICAgICAgT2JqZWN0LmtleXMoYnVuZGxlKS5mb3JFYWNoKChmaWxlTmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtmaWxlTmFtZV07XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSBcImNodW5rXCIgJiYgY2h1bmsuY29kZSkge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQ29kZSA9IGNodW5rLmNvZGU7XG5cbiAgICAgICAgICAvLyBNb3JlIGFnZ3Jlc3NpdmUgY2xlYW5pbmdcbiAgICAgICAgICBjaHVuay5jb2RlID0gY2h1bmsuY29kZVxuICAgICAgICAgICAgLnJlcGxhY2UoL0B2aXRlXFwvY2xpZW50L2csIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvdml0ZVxcL2NsaWVudC9nLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL3ZpdGVcXC9kaXN0XFwvY2xpZW50L2csIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvaW1wb3J0XFwubWV0YVxcLmhvdC9nLCBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL0hNUkNvbnRleHQvZywgXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9jcmVhdGVIb3RDb250ZXh0L2csIFwiZnVuY3Rpb24oKXt9XCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvX192aXRlX3BsdWdpbl9yZWFjdF9wcmVhbWJsZV9pbnN0YWxsZWRfXy9nLCBcInRydWVcIik7XG5cbiAgICAgICAgICBpZiAob3JpZ2luYWxDb2RlICE9PSBjaHVuay5jb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXHVEODNFXHVEREY5IEZpbmFsIGNsZWFudXAgb2YgVml0ZSByZWZlcmVuY2VzIGluOiAke2ZpbGVOYW1lfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIGVuZm9yY2U6IFwicG9zdFwiLFxuICAgICAgdHJhbnNmb3JtKGh0bWwsIGNvbnRleHQpIHtcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBWaXRlIGNsaWVudCBzY3JpcHQgdGFncyBmcm9tIEhUTUxcbiAgICAgICAgbGV0IGNsZWFuSHRtbCA9IGh0bWxcbiAgICAgICAgICAucmVwbGFjZSgvPHNjcmlwdFtePl0qQHZpdGVcXC9jbGllbnRbXj5dKj48XFwvc2NyaXB0Pi9nLCBcIlwiKVxuICAgICAgICAgIC5yZXBsYWNlKC88c2NyaXB0W14+XSp2aXRlXFwvY2xpZW50W14+XSo+PFxcL3NjcmlwdD4vZywgXCJcIilcbiAgICAgICAgICAucmVwbGFjZSgvPHNjcmlwdFtePl0qdml0ZVxcL2Rpc3RcXC9jbGllbnRbXj5dKj48XFwvc2NyaXB0Pi9nLCBcIlwiKTtcblxuICAgICAgICBpZiAoY2xlYW5IdG1sICE9PSBodG1sKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJcdUQ4M0VcdURERjkgUmVtb3ZlZCBWaXRlIGNsaWVudCBzY3JpcHRzIGZyb20gSFRNTFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjbGVhbkh0bWw7XG4gICAgICB9LFxu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
