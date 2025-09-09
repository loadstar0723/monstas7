import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 10 } // 10초 캐시
      }
    )

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Binance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    )
  }
}