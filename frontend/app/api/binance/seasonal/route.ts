import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const interval = searchParams.get('interval') || '1M'
    const limit = searchParams.get('limit') || '100'

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      console.error(`Binance API HTTP error: ${response.status}`)
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Binance Seasonal API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasonal data from Binance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}