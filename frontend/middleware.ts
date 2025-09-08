import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 모든 요청 통과 - 인증 완전 비활성화
  return NextResponse.next()
}

// 미들웨어 매처 설정 - 정적 파일과 API는 제외
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}