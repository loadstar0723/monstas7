import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API 라우트가 정상적으로 작동합니다',
    timestamp: new Date().toISOString()
  })
}