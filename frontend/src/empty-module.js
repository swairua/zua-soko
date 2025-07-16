// Empty module to replace Vite client in production builds
// This prevents any HMR or development features from loading

// Export empty objects/functions for any expected exports
export default {};
export const HMRContext = undefined;
export const createHotContext = () => undefined;
export const hot = undefined;

// Provide empty implementations for any other potential exports
export function noop() {}
export const __hmr_id = undefined;
export const __vite_ssr_import_meta__ = {};

// Ensure import.meta.hot is undefined
if (typeof globalThis !== "undefined") {
  try {
    Object.defineProperty(globalThis, "import", {
      value: {
        meta: {
          hot: undefined,
          env: {
            DEV: false,
            PROD: true,
          },
        },
      },
      configurable: false,
    });
  } catch (e) {
    // Ignore if already defined
  }
}
