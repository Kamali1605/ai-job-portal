import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any hostname (useful for profile pictures etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ensure environment variable is available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  },
};

export default nextConfig;
