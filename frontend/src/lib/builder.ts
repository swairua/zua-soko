import { builder } from "@builder.io/react";

// Initialize Builder.io with your API key
const BUILDER_API_KEY =
  import.meta.env.VITE_BUILDER_PUBLIC_API_KEY || "your-api-key-here";

if (!BUILDER_API_KEY || BUILDER_API_KEY === "your-api-key-here") {
  console.warn(
    "⚠️ Builder.io API key not found. Please set VITE_BUILDER_PUBLIC_API_KEY in your environment variables. Get your API key from https://builder.io/account/organization",
  );
}

// Initialize Builder
builder.init(BUILDER_API_KEY);

// Configure Builder.io settings
builder.apiVersion = "v3";

// Enable live editing in development
if (import.meta.env.DEV) {
  builder.canTrack = true;
}

export { builder };
export const BUILDER_PUBLIC_API_KEY = BUILDER_API_KEY;
