import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  
  return new NextResponse(null, { status: 200, headers })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const limit = searchParams.get('limit') || '20'
    
    // Binance API 호출
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`
    )
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json(data, { headers })
  } catch (error: any) {
    console.error('Binance depth API error:', error)
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    // Rate limit 에러 또는 개발 환경에서는 시뮬레이션 데이터 생성
    if (process.env.NODE_ENV === 'development' || error.message?.includes('429') || error.message?.includes('banned')) {
      const symbol = searchParams.get('symbol') || 'BTCUSDT'
      const limit = parseInt(searchParams.get('limit') || '20')
      
      console.log(`Generating simulated order book data for ${symbol}`)
      
      // 기본 가격 설정
      const basePrices: Record<string, number> = {
        'BTCUSDT': 98000,
        'ETHUSDT': 3500,
        'BNBUSDT': 700,
        'SOLUSDT': 200,
        'XRPUSDT': 0.6,
        'ADAUSDT': 0.6,
        'DOGEUSDT': 0.1,
        'AVAXUSDT': 40,
        'MATICUSDT': 0.9,
        'DOTUSDT': 8
      }
      
      const basePrice = basePrices[symbol] || 100
      const spread = basePrice * 0.0001 // 0.01% spread
      
      // 시뮬레이션 오더북 생성
      const bids = []
      const asks = []
      
      for (let i = 0; i < limit; i++) {
        // Bid 가격은 현재 가격보다 낮게
        const bidPrice = basePrice - spread - (i * basePrice * 0.0001)
        // 가격이 중심에 가까울수록 더 많은 볼륨
        const distanceFromCenter = Math.abs(i - limit/2) / (limit/2)
        const bidVolume = (Math.random() * 50 + 10) * (1 - distanceFromCenter * 0.8)
        bids.push([bidPrice.toFixed(2), bidVolume.toFixed(8)])
        
        // Ask 가격은 현재 가격보다 높게
        const askPrice = basePrice + spread + (i * basePrice * 0.0001)
        const askVolume = (Math.random() * 50 + 10) * (1 - distanceFromCenter * 0.8)
        asks.push([askPrice.toFixed(2), askVolume.toFixed(8)])
      }
      
      return NextResponse.json({
        lastUpdateId: Date.now(),
        bids,
        asks
      }, { headers })
    }
    
    // 에러 시 빈 오더북 반환 (200 상태로)
    return NextResponse.json({ 
      bids: [],
      asks: [],
      lastUpdateId: Date.now()
    }, { status: 200, headers })
  }
}