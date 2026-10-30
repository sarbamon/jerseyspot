import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 180,
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
    cpus: 2,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;
