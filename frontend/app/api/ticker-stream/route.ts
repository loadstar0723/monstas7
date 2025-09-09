import { NextRequest, NextResponse } from 'next/server'

// 서버에서 Binance WebSocket 데이터를 가져와서 클라이언트에 전달
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    )
  }

  try {
    // Binance REST API에서 실시간 가격 정보 가져오기
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 } // 캐시 비활성화
      }
    )

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()
    
    // WebSocket 형식과 유사하게 데이터 변환
    const formattedData = {
      s: data.symbol,
      c: data.lastPrice,
      P: data.priceChangePercent,
      v: data.volume,
      q: data.quoteVolume,
      h: data.highPrice,
      l: data.lowPrice,
      E: Date.now()
    }
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Ticker API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    )
  }
}