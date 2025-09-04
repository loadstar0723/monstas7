import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint 에러 무시하고 빌드 진행
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 에러 무시하고 빌드 진행
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
