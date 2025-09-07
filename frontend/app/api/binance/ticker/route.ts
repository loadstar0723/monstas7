import { NextRequest, NextResponse } from 'next/server'

const BINANCE_API_BASE = 'https://api.binance.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 5 }
    })
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Binance ticker proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    )
  }
}