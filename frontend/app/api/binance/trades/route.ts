import { NextRequest, NextResponse } from 'next/server'

const BINANCE_API_BASE = 'https://api.binance.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const limit = searchParams.get('limit') || '500'
    
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/aggTrades?symbol=${symbol}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 10 }
    })
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Binance trades proxy error:', error)
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    // 에러 시 빈 배열 반환 (200 상태로)
    return NextResponse.json([], { status: 200, headers })
  }
}