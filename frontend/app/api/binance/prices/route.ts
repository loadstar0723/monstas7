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
    
    // Binance API에서 실시간 가격 정보 가져오기
    const response = await fetch('https://api.binance.com/api/v3/ticker/price')
    const data = await response.json()
    
    // 요청된 심볼만 필터링
    const filtered = data.filter((item: any) => symbols.includes(item.symbol))
    
    // ticker/price API는 간단한 형식만 제공하므로
    const prices = filtered.map((item: any) => ({
      symbol: item.symbol,
      price: item.price
    }))
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
    return NextResponse.json(prices, { headers })
  } catch (error: any) {
    console.error('Binance API error:', error)
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    
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
      
      const simulatedPrices = symbols.map(symbol => ({
        symbol,
        price: String(basePrices[symbol] || 100)
      }))
      
      console.log('Returning simulated prices for development')
      return NextResponse.json(simulatedPrices, { headers })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500, headers }
    )
  }
}