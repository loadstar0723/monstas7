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
  // CORS 헤더 추가
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')
    
    // symbols 파라미터가 있으면 파싱, 없으면 기본 심볼 사용
    let symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
                   'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT']
    
    if (symbolsParam) {
      try {
        symbols = JSON.parse(symbolsParam)
      } catch (e) {
        console.log('Failed to parse symbols, using defaults')
      }
    }
    
    console.log('Fetching prices for symbols:', symbols)
    
    // Binance API에서 24시간 티커 정보 가져오기 (가격 + 변동률 포함)
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 요청된 심볼만 필터링
    const filtered = data.filter((item: any) => symbols.includes(item.symbol))
    
    // 필요한 정보만 추출
    const prices = filtered.map((item: any) => ({
      symbol: item.symbol,
      lastPrice: item.lastPrice,
      priceChangePercent: item.priceChangePercent,
      price: item.lastPrice, // 호환성을 위해 유지
      highPrice: item.highPrice,
      lowPrice: item.lowPrice,
      volume: item.volume
    }))
    
    console.log('Returning prices:', prices.length, 'items')
    return NextResponse.json(prices, { headers })
  } catch (error: any) {
    console.error('Binance API error:', error.message || error)
    
    // Rate limit 에러 또는 개발 환경에서는 시뮬레이션 데이터 반환
    if (process.env.NODE_ENV === 'development' || error.message?.includes('429')) {
      const { searchParams } = new URL(request.url)
      const symbolsParam = searchParams.get('symbols')
      
      let symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
                     'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT']
      
      if (symbolsParam) {
        try {
          symbols = JSON.parse(symbolsParam)
        } catch (e) {
          console.log('Failed to parse symbols, using defaults')
        }
      }
      
      // 기본 가격 데이터
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
      
      const simulatedPrices = symbols.map(symbol => {
        const basePrice = basePrices[symbol] || 100
        const changePercent = (Math.random() - 0.5) * 10 // -5% ~ +5%
        return {
          symbol,
          lastPrice: String(basePrice),
          priceChangePercent: String(changePercent),
          price: String(basePrice), // 호환성을 위해 유지
          highPrice: String(basePrice * 1.05),
          lowPrice: String(basePrice * 0.95),
          volume: String(Math.random() * 1000000)
        }
      })
      
      console.log('Returning simulated prices for development')
      return NextResponse.json(simulatedPrices, { headers })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500, headers }
    )
  }
}