import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product photo uploads go through the createProduct/updateProduct
      // Server Actions; the default 1mb limit is too small for real photos.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
