import { Plugin } from "vite";

// Aggressive plugin to completely prevent Vite client injection
export function noViteClientPlugin(): Plugin {
  return {
    name: "no-vite-client",
    apply: "build",
    enforce: "pre",
    config(config, { command }) {
      if (command === "build") {
        // Force disable all development features
        config.define = config.define || {};
        config.define["import.meta.hot"] = "undefined";
        config.define["import.meta.env.DEV"] = "false";
        config.define["import.meta.env.PROD"] = "true";
        config.define["__DEV__"] = "false";

        // Disable server completely during build
        delete config.server;

        // Override build settings to exclude client
        config.build = config.build || {};
        config.build.rollupOptions = config.build.rollupOptions || {};

        // Completely exclude Vite client from build
        const external = config.build.rollupOptions.external || [];
        const externalArray = Array.isArray(external) ? external : [];
        externalArray.push(
          "/@vite/client",
          "@vite/client",
          "vite/client",
          "/vite/client",
          "vite/dist/client/env.mjs",
          "/vite/dist/client/env.mjs",
        );
        config.build.rollupOptions.external = externalArray;

        // Disable sourcemap completely to avoid any dev references
        config.build.sourcemap = false;
      }
    },
    configResolved(resolvedConfig) {
      if (resolvedConfig.command === "build") {
        // Override environment variables at config level
        resolvedConfig.env = resolvedConfig.env || {};
        resolvedConfig.env.DEV = false;
        resolvedConfig.env.PROD = true;

        // Force disable any dev-related plugins that might inject client code
        if (resolvedConfig.plugins) {
          resolvedConfig.plugins = resolvedConfig.plugins.filter(
            (plugin: any) => {
              if (plugin && plugin.name) {
                // Filter out any Vite internal plugins that handle client injection
                if (
                  plugin.name.includes("vite:client") ||
                  plugin.name.includes("vite:hmr") ||
                  plugin.name.includes("vite:ws")
                ) {
                  console.log(
                    `🚫 Filtered out Vite dev plugin: ${plugin.name}`,
                  );
                  return false;
                }
              }
              return true;
            },
          );
        }
      }
    },
    buildStart() {
      // Log that we're blocking client injection
      console.log("🚫 Vite client injection blocked for production build");

      // Override any global Vite client injection mechanisms
      if (typeof global !== "undefined") {
        global.__vite_plugin_react_preamble_installed__ = true;
        global.__vite_is_modern_browser = true;
      }

      if (typeof globalThis !== "undefined") {
        globalThis.__vite_plugin_react_preamble_installed__ = true;
        globalThis.__vite_is_modern_browser = true;
      }
    },
    resolveId(id) {
      // Block any attempt to import Vite client modules
      if (
        id.includes("@vite/client") ||
        id.includes("vite/client") ||
        id.includes("vite/dist/client")
      ) {
        console.log(`🚫 Blocked Vite client import: ${id}`);
        return { id: "virtual:vite-client-blocked", external: true };
      }
      return null;
    },
    load(id) {
      // Return empty module for blocked client imports
      if (id === "virtual:vite-client-blocked") {
        return "export default {};";
      }
      return null;
    },
    transform(code, id) {
      // Remove any remaining Vite client code during transformation
      if (
        code.includes("@vite/client") ||
        code.includes("vite/client") ||
        code.includes("import.meta.hot") ||
        code.includes("HMRContext")
      ) {
        console.log(`🧹 Cleaning Vite client code from: ${id}`);

        let cleanCode = code
          // Remove import statements
          .replace(/import\s+[^;]*@vite\/client[^;]*;?\n?/g, "")
          .replace(/import\s+[^;]*vite\/client[^;]*;?\n?/g, "")
          .replace(/import\s+[^;]*vite\/dist\/client[^;]*;?\n?/g, "")
          // Remove HMR related code
          .replace(/import\.meta\.hot[^;]*;?\n?/g, "")
          .replace(/if\s*\(\s*import\.meta\.hot\s*\)[^}]*}/g, "")
          .replace(/__vite_plugin_react_preamble_installed__[^;]*;?\n?/g, "")
          // Remove HMR context and related functions
          .replace(/createHotContext[^;]*;?\n?/g, "")
          .replace(/HMRContext[^;]*;?\n?/g, "")
          .replace(/const\s+hot\s*=[^;]*;?\n?/g, "")
          // Remove any remaining Vite-specific code
          .replace(/\/\*\s*@vite-ignore\s*\*\/[^;]*;?\n?/g, "");

        return cleanCode;
      }
      return null;
    },
    generateBundle(options, bundle) {
      // Final cleanup of any remaining Vite client references
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.code) {
          const originalCode = chunk.code;

          // More aggressive cleaning
          chunk.code = chunk.code
            .replace(/@vite\/client/g, "")
            .replace(/vite\/client/g, "")
            .replace(/vite\/dist\/client/g, "")
            .replace(/import\.meta\.hot/g, "undefined")
            .replace(/HMRContext/g, "undefined")
            .replace(/createHotContext/g, "function(){}")
            .replace(/__vite_plugin_react_preamble_installed__/g, "true");

          if (originalCode !== chunk.code) {
            console.log(`🧹 Final cleanup of Vite references in: ${fileName}`);
          }
        }
      });
    },
    transformIndexHtml: {
      enforce: "post",
      transform(html, context) {
        // Remove any Vite client script tags from HTML
        let cleanHtml = html
          .replace(/<script[^>]*@vite\/client[^>]*><\/script>/g, "")
          .replace(/<script[^>]*vite\/client[^>]*><\/script>/g, "")
          .replace(/<script[^>]*vite\/dist\/client[^>]*><\/script>/g, "");

        if (cleanHtml !== html) {
          console.log("🧹 Removed Vite client scripts from HTML");
        }

        return cleanHtml;
      },
    },
  };
}
