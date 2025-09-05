import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'monsta-secret-key'
)

// 보호된 경로 정의
const protectedPaths = [
  '/dashboard',
  '/wallet',
  '/ai',
  '/trading',
  '/settings',
  '/profile'
]

// 역할별 접근 가능 경로
const roleBasedPaths: Record<string, string[]> = {
  'HEADQUARTERS': ['/*'], // 모든 경로 접근 가능
  'DISTRIBUTOR': ['/dashboard', '/wallet', '/ai', '/trading', '/settings', '/profile', '/reports'],
  'AGENT': ['/dashboard', '/wallet', '/ai', '/trading', '/settings', '/profile'],
  'SUBSCRIBER': ['/dashboard', '/wallet', '/settings', '/profile'],
}

// 티어별 접근 가능 경로
const tierBasedPaths: Record<string, string[]> = {
  'Infinity': ['/*'],
  'Master': ['/ai/advanced', '/trading/pro', '/market/advanced'],
  'Signature': ['/ai/predictions', '/trading/auto', '/market/analysis'],
  'Platinum': ['/ai/signals', '/trading/basic', '/market/charts'],
  'Advance': ['/market/overview', '/wallet/portfolio'],
  'Starter': ['/dashboard', '/profile', '/settings']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 정적 파일 및 API 경로는 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/auth/login' ||
    pathname === '/auth/register'
  ) {
    return NextResponse.next()
  }

  // 보호된 경로 체크
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )

  if (isProtectedPath) {
    // 세션 토큰 확인
    const token = request.cookies.get('next-auth.session-token')?.value || 
                  request.cookies.get('__Secure-next-auth.session-token')?.value ||
                  request.cookies.get('session')?.value

    if (!token) {
      // 로그인 페이지로 리다이렉트
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    try {
      // JWT 토큰 검증
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ['HS256']
      })

      const userRole = payload.role as string
      const userTier = payload.subscription as string

      // 역할 기반 접근 제어
      const allowedByRole = roleBasedPaths[userRole]?.some(path => {
        if (path === '/*') return true
        return pathname.startsWith(path)
      })

      // 티어 기반 접근 제어
      const allowedByTier = tierBasedPaths[userTier]?.some(path => {
        if (path === '/*') return true
        return pathname.startsWith(path)
      })

      if (!allowedByRole && !allowedByTier) {
        // 접근 거부 페이지로 리다이렉트
        return NextResponse.redirect(new URL('/auth/access-denied', request.url))
      }

      // 보안 헤더 추가
      const response = NextResponse.next()
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      
      // CSP 헤더
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.binance.com wss://stream.binance.com https://api.coingecko.com http://13.209.84.93:* http://localhost:*"
      )

      return response
    } catch (error) {
      console.error('토큰 검증 실패:', error)
      // 로그인 페이지로 리다이렉트
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}