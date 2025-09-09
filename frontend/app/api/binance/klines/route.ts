import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const interval = searchParams.get('interval')
  const limit = searchParams.get('limit') || '100'
  const startTime = searchParams.get('startTime')
  const endTime = searchParams.get('endTime')

  if (!symbol || !interval) {
    return NextResponse.json(
      { error: 'Symbol and interval are required' },
      { status: 400 }
    )
  }

  try {
    let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    
    if (startTime) {
      url += `&startTime=${startTime}`
    }
    
    if (endTime) {
      url += `&endTime=${endTime}`
    }

    const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
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
      { error: 'Failed to fetch klines data' },
      { status: 500 }
    )
  }
}