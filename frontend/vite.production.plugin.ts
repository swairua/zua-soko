import { Plugin } from "vite";

export function productionStripPlugin(): Plugin {
  return {
    name: "production-strip",
    apply: "build",
    generateBundle(options, bundle) {
      // Remove any chunks that contain vite client code
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk") {
          // Remove any vite client imports
          if (
            chunk.code.includes("@vite/client") ||
            chunk.code.includes("vite/client") ||
            chunk.code.includes("import.meta.hot")
          ) {
            chunk.code = chunk.code
              .replace(/import\s+[^;]*@vite\/client[^;]*;?/g, "")
              .replace(/import\s+[^;]*vite\/client[^;]*;?/g, "")
              .replace(/import\.meta\.hot[^;]*;?/g, "");
          }
        }
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // Remove any vite client script tags
        return html
          .replace(/<script[^>]*@vite\/client[^>]*><\/script>/g, "")
          .replace(/<script[^>]*vite\/client[^>]*><\/script>/g, "");
      },
    },
  };
}
