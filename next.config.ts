import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (Dokploy).
  output: "standalone",
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
