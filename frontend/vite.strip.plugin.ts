import { Plugin } from "vite";

export function aggressiveStripViteClient(): Plugin {
  return {
    name: "aggressive-strip-vite-client",
    apply: "build",
    config(config, { command }) {
      if (command === "build") {
        // Force exclude vite client
        config.build = config.build || {};
        config.build.rollupOptions = config.build.rollupOptions || {};
        config.build.rollupOptions.external = [
          ...(config.build.rollupOptions.external || []),
          "@vite/client",
          "vite/client",
          "/@vite/client",
          "/vite/client",
        ];
      }
    },
    resolveId(id) {
      // Block any vite client imports
      if (id.includes("@vite/client") || id.includes("vite/client")) {
        return { id: "virtual:empty", external: false };
      }
    },
    load(id) {
      // Return empty module for blocked vite client
      if (id === "virtual:empty") {
        return "export default {};";
      }
    },
    generateBundle(options, bundle) {
      // Aggressively strip vite client code from all chunks
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk") {
          // More comprehensive replacement
          let { code } = chunk;

          // Remove all vite client related code
          code = code.replace(/@vite\/client/g, '"VITE_CLIENT_REMOVED"');
          code = code.replace(/vite\/client/g, '"VITE_CLIENT_REMOVED"');
          code = code.replace(/import\.meta\.hot/g, "undefined");
          code = code.replace(/import\.meta\.env\.DEV/g, "false");
          code = code.replace(/import\.meta\.env\.PROD/g, "true");

          // Remove HMR context references
          code = code.replace(/createHotContext/g, "(() => ({}))");
          code = code.replace(/HMRContext/g, "null");

          // Remove WebSocket connections for HMR
          code = code.replace(/new WebSocket\([^)]*vite[^)]*\)/g, "null");
          code = code.replace(/new WebSocket\([^)]*hmr[^)]*\)/g, "null");

          chunk.code = code;
        }
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // Remove any script tags that reference vite client
        return html
          .replace(/<script[^>]*\/@vite\/client[^>]*><\/script>/g, "")
          .replace(/<script[^>]*@vite\/client[^>]*><\/script>/g, "")
          .replace(/<script[^>]*vite\/client[^>]*><\/script>/g, "");
      },
    },
  };
}
