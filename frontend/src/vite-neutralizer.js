// Runtime Vite client neutralizer - executes before any Vite code can run
// This completely overrides and neutralizes Vite's HMR client functionality

(function () {
  "use strict";

  // Only run in production-like environments (not localhost)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return;
  }

  console.log("🛡️ Vite client neutralizer activated");

  // 1. Override WebSocket to prevent HMR connections
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    const urlStr = url.toString();
    if (
      urlStr.includes("vite") ||
      urlStr.includes("hmr") ||
      urlStr.includes("ws:") ||
      urlStr.includes("3001") ||
      urlStr.includes("24601")
    ) {
      console.log("🚫 Blocked HMR WebSocket:", urlStr);
      // Return a fake WebSocket that never connects
      return {
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        readyState: 3, // CLOSED
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
        url: urlStr,
        protocol: "",
        bufferedAmount: 0,
        extensions: "",
        binaryType: "blob",
        onopen: null,
        onerror: null,
        onclose: null,
        onmessage: null,
      };
    }
    return new OriginalWebSocket(url, protocols);
  };

  // Copy static properties
  Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.CONNECTING = 0;
  window.WebSocket.OPEN = 1;
  window.WebSocket.CLOSING = 2;
  window.WebSocket.CLOSED = 3;

  // 2. Override fetch to prevent HMR ping requests
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    const urlStr = typeof url === "string" ? url : url.toString();
    if (
      urlStr.includes("vite") ||
      urlStr.includes("hmr") ||
      urlStr.includes("@vite")
    ) {
      console.log("🚫 Blocked HMR fetch:", urlStr);
      // Return a successful response to prevent errors
      return Promise.resolve(
        new Response("{}", {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
    return originalFetch.apply(this, args);
  };

  // 3. Neutralize HMR-related globals
  window.__vite_is_modern_browser = true;
  window.__vite_plugin_react_preamble_installed__ = true;

  // 4. Override import.meta if it exists
  if (typeof window.import === "undefined") {
    try {
      Object.defineProperty(window, "import", {
        value: {
          meta: {
            hot: null,
            env: { DEV: false, PROD: true, MODE: "production" },
          },
        },
        configurable: false,
        writable: false,
      });
    } catch (e) {}
  }

  // 5. Block dynamic imports of Vite modules
  const originalImport = window.eval(
    'typeof import !== "undefined" ? import : null',
  );
  if (originalImport && typeof originalImport === "function") {
    window.import = function (specifier) {
      if (
        typeof specifier === "string" &&
        (specifier.includes("@vite") ||
          specifier.includes("vite/") ||
          specifier.includes("hmr") ||
          specifier.includes("client"))
      ) {
        console.log("🚫 Blocked dynamic import:", specifier);
        return Promise.resolve({});
      }
      return originalImport.apply(this, arguments);
    };
  }

  // 6. Override any HMR context creation
  window.createHotContext = () => null;
  window.HMRContext = null;

  // 7. Aggressive error suppression for HMR-related errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("vite") ||
      message.includes("HMR") ||
      message.includes("@vite") ||
      (message.includes("Failed to fetch") &&
        (message.includes("ping") ||
          message.includes("WebSocket") ||
          message.includes("hmr")))
    ) {
      return; // Completely suppress
    }
    return originalConsoleError.apply(this, args);
  };

  console.warn = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("vite") ||
      message.includes("HMR") ||
      message.includes("@vite")
    ) {
      return; // Completely suppress
    }
    return originalConsoleWarn.apply(this, args);
  };

  // 8. Error event suppression
  window.addEventListener(
    "error",
    function (event) {
      if (
        event.error &&
        event.error.message &&
        (event.error.message.includes("vite") ||
          event.error.message.includes("HMR") ||
          event.error.message.includes("@vite") ||
          (event.error.message.includes("Failed to fetch") &&
            (event.error.stack || "").includes("ping")))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    },
    true,
  );

  // 9. Promise rejection suppression
  window.addEventListener(
    "unhandledrejection",
    function (event) {
      if (
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes("vite") ||
          event.reason.message.includes("HMR") ||
          event.reason.message.includes("@vite") ||
          (event.reason.message.includes("Failed to fetch") &&
            (event.reason.stack || "").includes("ping")))
      ) {
        event.preventDefault();
        return false;
      }
    },
    true,
  );

  // 10. Override eval to prevent HMR code execution
  const originalEval = window.eval;
  window.eval = function (code) {
    if (
      typeof code === "string" &&
      (code.includes("HMRContext") ||
        code.includes("@vite") ||
        code.includes("createHotContext") ||
        code.includes("vite/client"))
    ) {
      console.log("��� Blocked eval with HMR code");
      return;
    }
    return originalEval.call(this, code);
  };

  // 11. Function constructor override
  const OriginalFunction = window.Function;
  window.Function = function (...args) {
    const code = args[args.length - 1];
    if (
      typeof code === "string" &&
      (code.includes("HMRContext") ||
        code.includes("@vite") ||
        code.includes("createHotContext"))
    ) {
      console.log("🚫 Blocked Function constructor with HMR code");
      return function () {};
    }
    return OriginalFunction.apply(this, args);
  };
  window.Function.prototype = OriginalFunction.prototype;

  // 12. Module loading interception
  if (window.define && typeof window.define === "function") {
    const originalDefine = window.define;
    window.define = function (id, deps, factory) {
      if (
        typeof id === "string" &&
        (id.includes("vite") || id.includes("hmr") || id.includes("@vite"))
      ) {
        console.log("🚫 Blocked AMD module:", id);
        return;
      }
      return originalDefine.apply(this, arguments);
    };
  }

  console.log("✅ Vite client neutralizer setup complete");
})();
