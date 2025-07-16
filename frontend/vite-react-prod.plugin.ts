import { Plugin } from "vite";

// Production-only React plugin that doesn't inject any dev code
export function reactProdPlugin(): Plugin {
  return {
    name: "react-prod-only",
    apply: "build",
    config(config) {
      // Ensure production mode
      config.mode = "production";
      config.define = config.define || {};
      config.define["process.env.NODE_ENV"] = '"production"';
      config.define["import.meta.hot"] = "undefined";
      config.define["import.meta.env.DEV"] = "false";
      config.define["import.meta.env.PROD"] = "true";
    },
    transform(code, id) {
      // Remove any React development-only code
      if (id.includes("react") || code.includes("React")) {
        let transformedCode = code
          // Remove React development warnings
          .replace(
            /if\s*\(\s*process\.env\.NODE_ENV\s*[!=]==?\s*['"]production['"]\s*\)[^}]*}/g,
            "",
          )
          .replace(
            /process\.env\.NODE_ENV\s*[!=]==?\s*['"]production['"]/g,
            "false",
          )
          // Remove React DevTools
          .replace(/__REACT_DEVTOOLS_GLOBAL_HOOK__[^;]*;?/g, "")
          // Remove any HMR-related React code
          .replace(/if\s*\(\s*import\.meta\.hot\s*\)[^}]*}/g, "")
          .replace(/import\.meta\.hot[^;]*;?/g, "");

        if (transformedCode !== code) {
          console.log(`🧹 Cleaned React dev code from: ${id}`);
          return transformedCode;
        }
      }
      return null;
    },
  };
}
