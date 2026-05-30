import type { NextConfig } from "next";
import path from "path";
import { getStorageImageHostnames } from "./src/lib/image-url";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Pin Turbopack root to this project. Next.js otherwise resolves CSS imports
  // (e.g. @import "tailwindcss") from the parent directory when lockfiles exist
  // above the project (e.g. ~/package-lock.json).
  turbopack: {
    root: path.resolve(__dirname),
  },
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
  images: {
    remotePatterns: getStorageImageHostnames().map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
    // Catalog images use CDN + unoptimized; payment proofs use /api/r2 + optimizer.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/api/admin/email-preview",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
