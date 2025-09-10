/** @type {import('next').NextConfig} */
const nextConfig = {
  // 서버 설정
  poweredByHeader: false,
  generateEtags: false,
  
  // 이미지 최적화
  images: {
    domains: ['localhost', '13.209.84.93'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 성능 최적화
  compress: true,
  
  // 번들 분석 (필요시 활성화)
  // analyzeBundle: process.env.ANALYZE === 'true',
  
  // 실험적 기능 (클라이언트 사이드 에러 방지)
  experimental: {
    optimizeCss: false,  // CSS 최적화 비활성화
    scrollRestoration: true,
    optimizePackageImports: ['recharts', 'framer-motion', 'react-icons'],
  },
  
  // Webpack 설정
  webpack: (config, { dev, isServer }) => {
    // 개발 환경에서 청크 로딩 최적화
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      }
      // 청크 파일명에 타임스탬프 추가하여 캐시 문제 방지
      config.output.filename = 'static/chunks/[name].[contenthash].js'
      config.output.chunkFilename = 'static/chunks/[name].[contenthash].js'
    }
    return config
  },
  
  // React Strict Mode 비활성화 (프로덕션 에러 방지)
  reactStrictMode: false,
  
  // ESLint와 TypeScript 에러 무시 (프로덕션 빌드용)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
    ]
  },
  
  // 리다이렉트
  async redirects() {
    return []
  },
  
  // 리라이트
  async rewrites() {
    return []
  }
};

export default nextConfig;