// Builder.io configuration for live deployment
// This configuration bypasses traditional deployment settings

const builderConfig = {
  // Your Builder.io organization settings
  apiKey: process.env.VITE_BUILDER_PUBLIC_API_KEY || "your-api-key-here",

  // Models available in Builder.io
  models: [
    {
      name: "page",
      description: "Full page content managed by Builder.io",
      fields: [
        {
          name: "title",
          type: "string",
          required: true,
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "image",
          type: "file",
          allowedFileTypes: ["jpeg", "jpg", "png", "svg"],
        },
      ],
    },
    {
      name: "section",
      description: "Reusable content sections",
      fields: [
        {
          name: "section",
          type: "string",
          enum: [
            "homepage-hero",
            "homepage-features",
            "marketplace-banner",
            "footer-content",
          ],
        },
      ],
    },
  ],

  // Deployment settings that bypass Vercel
  deployment: {
    // Use Builder.io's hosting instead of Vercel
    useBuilderHosting: true,

    // Custom domain configuration
    customDomain: process.env.BUILDER_CUSTOM_DOMAIN,

    // API endpoints that should remain active
    apiRoutes: [
      "/api/auth/*",
      "/api/marketplace/*",
      "/api/status",
      "/api/health",
    ],

    // Static asset handling
    staticAssets: {
      directory: "./frontend/dist",
      maxAge: "1 year",
    },

    // Environment variables for Builder.io hosting
    environment: {
      VITE_BUILDER_PUBLIC_API_KEY: process.env.VITE_BUILDER_PUBLIC_API_KEY,
      VITE_API_URL: process.env.VITE_API_URL || "/api",
      VITE_APP_NAME:
        process.env.VITE_APP_NAME || "Zuasoko Agricultural Platform",
    },
  },

  // Preview configuration
  preview: {
    // Enable preview mode for editors
    enabled: true,

    // Preview URL structure
    urlPattern: "/builder/*",

    // Preview authentication
    requireAuth: false,
  },

  // Custom components configuration
  components: {
    // Auto-register components from your app
    autoRegister: true,

    // Custom component directories
    directories: ["./frontend/src/components", "./frontend/src/pages"],

    // Component customization options
    customization: {
      allowInlineEditing: true,
      enablePreview: true,
      showComponentOutlines: true,
    },
  },

  // Integration settings
  integrations: {
    // Database integration
    database: {
      enabled: true,
      connectionString: process.env.DATABASE_URL,
      models: ["users", "products", "orders"],
    },

    // API integration
    api: {
      baseUrl: process.env.VITE_API_URL || "/api",
      timeout: 10000,
      retryAttempts: 3,
    },

    // Analytics integration
    analytics: {
      enabled: true,
      trackPageViews: true,
      trackComponentInteractions: true,
    },
  },
};

module.exports = builderConfig;
