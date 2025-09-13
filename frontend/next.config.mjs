/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode 비활성화 (WebSocket 이중 연결 방지)
  reactStrictMode: false,
  
  // 서버 설정
  poweredByHeader: false,
  generateEtags: false,
  
  // 이미지 최적화
  images: {
    domains: ['localhost', '13.209.84.93', 'api.dicebear.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 성능 최적화
  compress: true,
  
  // 컴파일러 설정
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // 번들 분석 (필요시 활성화)
  // analyzeBundle: process.env.ANALYZE === 'true',
  
  // 빌드 ID 자동 생성 (캐시 무효화)
  generateBuildId: async () => {
    // 현재 타임스탬프를 빌드 ID로 사용
    return Date.now().toString()
  },
  
  // 실험적 기능
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  },
  
  // Webpack 설정 - ChunkLoadError 해결
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      // 개발 모드에서 청크 로딩 개선
      config.output = {
        ...config.output,
        chunkLoadTimeout: 300000, // 300초 (5분)
        publicPath: 'http://localhost:3002/_next/',
        // 청크 파일명 단순화
        chunkFilename: 'static/chunks/[name].js',
      }
      
      // 청크 분할 비활성화 (개발 모드)
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        runtimeChunk: false,
        minimize: false,
      }
    }
    
    // Script 태그 로딩 에러 방지
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
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
      // JavaScript 파일 캐시 무효화
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
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
      // API CORS 헤더
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  
  // 리다이렉트
  async redirects() {
    return []
  },
  
  // 리라이트 (WebSocket 프록시 개발 환경용)
  async rewrites() {
    return process.env.NODE_ENV === 'development' ? [
      {
        source: '/ws/:path*',
        destination: 'https://stream.binance.com:9443/ws/:path*',
      },
    ] : []
  }
};

export default nextConfig;