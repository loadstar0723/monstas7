/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // WebSocket 이중 연결 방지
  swcMinify: true,
  images: {
    domains: ['api.dicebear.com'],
  },
  // CORS 헤더 추가
  async headers() {
    return [
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
  // 프로덕션 환경 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // WebSocket 프록시 설정 (개발 환경용)
  async rewrites() {
    return process.env.NODE_ENV === 'development' ? [
      {
        source: '/ws/:path*',
        destination: 'https://stream.binance.com:9443/ws/:path*',
      },
    ] : []
  },
}

module.exports = nextConfig