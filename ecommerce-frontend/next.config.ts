import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5207";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: apiBase,
  },
};

export default nextConfig;
