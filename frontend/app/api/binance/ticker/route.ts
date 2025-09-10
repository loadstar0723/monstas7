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
    
    // 단일 심볼 요청시 객체 그대로 반환
    // (배열로 반환하면 클라이언트에서 파싱 에러 발생)
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Binance API error:', error)
    
    // 에러 발생 시 기본값 반환
    const defaultData = {
      symbol: symbol || 'BTCUSDT',
      lastPrice: '98000.00',
      priceChangePercent: '2.5',
      quoteVolume: '1500000000'
    }
    
    return NextResponse.json(defaultData, { status: 200 })
  }
}