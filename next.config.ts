import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// In development, default to local backend (http://localhost:5000) unless explicitly configured.
// In production, default to Hostinger backend.
const backendBase = (
  process.env.BACKEND_PROXY_URL ||
  process.env.BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "") ||
  (isDev ? "http://localhost:5000" : "https://firebrick-gnat-591688.hostingersite.com")
).replace(/\/+$/, "");

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
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
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
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "firebrick-gnat-591688.hostingersite.com",
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
