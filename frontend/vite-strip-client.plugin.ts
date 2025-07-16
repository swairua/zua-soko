import { Plugin } from "vite";

// Plugin to completely strip Vite client code in production
export function stripViteClientPlugin(): Plugin {
  return {
    name: "strip-vite-client",
    apply: "build", // Only apply during build
    enforce: "pre",
    config(config, { command }) {
      if (command === "build") {
        // Disable client injection completely
        config.build = config.build || {};
        config.build.rollupOptions = config.build.rollupOptions || {};
        config.build.rollupOptions.external =
          config.build.rollupOptions.external || [];

        // Add Vite client modules to external to prevent bundling
        const external = Array.isArray(config.build.rollupOptions.external)
          ? config.build.rollupOptions.external
          : [];

        external.push(
          "/@vite/client",
          "/vite/client",
          "@vite/client",
          "vite/client",
        );

        config.build.rollupOptions.external = external;
      }
    },
    generateBundle(options, bundle) {
      // Remove any chunks that contain Vite client code
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.code) {
          // Remove any references to Vite client
          if (
            chunk.code.includes("@vite/client") ||
            chunk.code.includes("vite/client") ||
            chunk.code.includes("import.meta.hot") ||
            chunk.code.includes("__vite_plugin_react_preamble_installed__")
          ) {
            console.log(`Removing Vite client references from ${fileName}`);
            chunk.code = chunk.code
              .replace(/import\s+[^;]*@vite\/client[^;]*;?/g, "")
              .replace(/import\s+[^;]*vite\/client[^;]*;?/g, "")
              .replace(/import\.meta\.hot[^;]*;?/g, "")
              .replace(/__vite_plugin_react_preamble_installed__[^;]*;?/g, "");
          }
        }
      });
    },
    transformIndexHtml: {
      enforce: "post",
      transform(html, context) {
        if (context.bundle) {
          // Remove any Vite client script tags
          return html
            .replace(/<script[^>]*\/@vite\/client[^>]*><\/script>/g, "")
            .replace(/<script[^>]*vite\/client[^>]*><\/script>/g, "");
        }
        return html;
      },
    },
  };
}
