import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const interval = searchParams.get('interval') || '15m'
    const limit = searchParams.get('limit') || '500'

    console.log(`📡 Binance API 프록시: ${symbol} ${interval} ${limit}개`)

    // Binance API 호출
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )

    if (!response.ok) {
      throw new Error(`Binance API 에러: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Binance 데이터 수신: ${data.length}개 캔들`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Binance API 프록시 에러:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Binance' },
      { status: 500 }
    )
  }
}
