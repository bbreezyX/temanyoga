import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-38c629e713a54e8e9ed0a762c8f2666d.r2.dev",
      },
    ],
  },
};

export default nextConfig;
