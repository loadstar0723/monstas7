import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const interval = searchParams.get('interval') || '1h'
  const limit = searchParams.get('limit') || '24'

  try {
    // Binance API로 직접 요청
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch from Binance API' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching klines:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch klines data' },
      { status: 500 }
    )
  }
}
