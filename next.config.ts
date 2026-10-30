import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 180,
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
    cpus: 2,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://firebrick-gnat-591688.hostingersite.com/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "https://firebrick-gnat-591688.hostingersite.com/uploads/:path*",
      },
    ];
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
