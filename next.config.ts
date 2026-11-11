import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

function resolveBackendBase(): string {
  let val = (
    process.env.BACKEND_PROXY_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).trim();

  if (!isDev) {
    // In production, fallback to canonical Hostinger backend if unset or pointing to local / frontend domain
    if (
      !val ||
      val.includes("localhost") ||
      val.includes("127.0.0.1") ||
      val.includes("jerseyspot.online")
    ) {
      return "https://firebrick-gnat-591688.hostingersite.com";
    }
  } else {
    // In development, default to local backend
    if (!val) {
      return "http://localhost:5000";
    }
  }

  val = val.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  // Ensure protocol is present
  if (!val.startsWith("http://") && !val.startsWith("https://")) {
    val = (val.includes("localhost") || val.includes("127.0.0.1")) ? `http://${val}` : `https://${val}`;
  }

  return val;
}

const backendBase = resolveBackendBase();

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
