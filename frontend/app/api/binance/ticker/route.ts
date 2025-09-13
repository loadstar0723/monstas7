import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    // symbol이 없으면 모든 심볼 데이터 반환
    if (!symbol) {
      // 모든 심볼 데이터를 가져오기
      const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr`
      
      const response = await fetch(binanceUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        console.error('Binance ticker API error:', response.status, response.statusText)
        
        // 재시도
        const retryResponse = await fetch(binanceUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          cache: 'no-store'
        })
        
        if (!retryResponse.ok) {
          return NextResponse.json(
            { error: 'Binance API temporarily unavailable', status: response.status },
            { status: 503 }
          )
        }
        
        const retryData = await retryResponse.json()
        return NextResponse.json(retryData.filter((ticker: any) => ticker.symbol.endsWith('USDT')))
      }

      const data = await response.json()
      // USDT 페어만 필터링
      const usdtPairs = data.filter((ticker: any) => ticker.symbol.endsWith('USDT'))
      
      return NextResponse.json(usdtPairs)
    }
    
    // 특정 심볼 요청 처리
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    
    const response = await fetch(binanceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Binance ticker API error:', response.status, response.statusText)
      
      // 재시도 로직
      const retryResponse = await fetch(binanceUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        cache: 'no-store'
      })
      
      if (!retryResponse.ok) {
        return NextResponse.json(
          { error: 'Binance API temporarily unavailable', status: response.status },
          { status: 503 }
        )
      }
      
      const retryData = await retryResponse.json()
      return NextResponse.json({
        ...retryData,
        price: retryData.lastPrice || retryData.price,
        volume: retryData.volume || retryData.quoteVolume,
        quoteVolume: retryData.quoteVolume || retryData.volume
      })
    }

    const data = await response.json()
    // Binance API 필드 매핑
    const mappedData = {
      ...data,
      price: data.lastPrice || data.price,
      volume: data.volume || data.quoteVolume,
      quoteVolume: data.quoteVolume || data.volume
    }
    
    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('Ticker API route error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}