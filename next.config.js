/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins];
    }
    return config;
  },
  images: {
    domains: ["cdn.builder.io", "images.unsplash.com", "localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
        port: "",
        pathname: "/api/v1/image/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    return [
      {
        source: '/api/placeholder/:path*',
        destination: 'https://via.placeholder.com/:path*',
      },
      {
        source: '/:path*',      // <== THIS ensures any unknown route goes to /
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig;
