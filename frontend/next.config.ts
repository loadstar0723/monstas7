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
  // Cross-origin 요청 허용
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // 개발 서버 cross-origin 허용 (Replit 환경 포함)
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  
  // Cross-origin 개발 요청 허용
  allowedDevOrigins: ['*'],
};

export default nextConfig;
