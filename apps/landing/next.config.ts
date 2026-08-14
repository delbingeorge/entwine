import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Linting is its own turbo task; Next's bundled pass would double-report.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
