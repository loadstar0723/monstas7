import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  try {
    let url = 'https://api.binance.com/api/v3/ticker/24hr'
    
    // 특정 심볼이 지정된 경우
    if (symbol) {
      url += `?symbol=${symbol}`
    }
    // symbol이 없으면 모든 티커 반환

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()
    
    // 단일 심볼 요청시 객체를 배열로 감싸서 반환
    if (symbol && !Array.isArray(data)) {
      return NextResponse.json([data])
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Binance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    )
  }
}