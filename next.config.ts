import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables forbidden() so a wrong role gets a real HTTP 403 (DECISIONS.md D4).
    authInterrupts: true,
  },
};

export default nextConfig;
