import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Binance API에서 실시간 24시간 티커 정보 가져오기
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    const data = await response.json()
    
    // 필요한 코인만 필터링
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
                    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT']
    
    const filtered = data.filter((item: any) => symbols.includes(item.symbol))
    
    // 데이터 정제
    const prices = filtered.map((item: any) => ({
      symbol: item.symbol,
      lastPrice: item.lastPrice,
      priceChange: item.priceChange,
      priceChangePercent: item.priceChangePercent,
      highPrice: item.highPrice,
      lowPrice: item.lowPrice,
      volume: item.volume,
      quoteVolume: item.quoteVolume,
      openPrice: item.openPrice,
      prevClosePrice: item.prevClosePrice,
      weightedAvgPrice: item.weightedAvgPrice,
      bidPrice: item.bidPrice,
      askPrice: item.askPrice
    }))
    
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Binance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}