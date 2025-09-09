import { NextResponse } from 'next/server'

// 실제 차익거래 기회 탐색 API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  
  try {
    // 여러 거래소 가격 비교
    const exchanges = [
      { name: 'Binance', endpoint: `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}` },
      { name: 'Bybit', endpoint: `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}` },
      // Upbit은 CORS 이슈로 제외
    ]
    
    const pricePromises = exchanges.map(async (exchange) => {
      try {
        const response = await fetch(exchange.endpoint)
        const data = await response.json()
        
        if (exchange.name === 'Binance') {
          return {
            exchange: exchange.name,
            price: parseFloat(data.price),
            timestamp: Date.now()
          }
        } else if (exchange.name === 'Bybit' && data.result?.list?.[0]) {
          return {
            exchange: exchange.name,
            price: parseFloat(data.result.list[0].lastPrice),
            timestamp: Date.now()
          }
        }
        return null
      } catch (error) {
        console.error(`Error fetching from ${exchange.name}:`, error)
        return null
      }
    })
    
    const prices = (await Promise.all(pricePromises)).filter(p => p !== null)
    
    // 차익거래 기회 계산
    const opportunities = []
    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const buyExchange = prices[i].price < prices[j].price ? prices[i] : prices[j]
        const sellExchange = prices[i].price > prices[j].price ? prices[i] : prices[j]
        const spread = ((sellExchange.price - buyExchange.price) / buyExchange.price) * 100
        
        if (spread > 0.1) { // 0.1% 이상 차이날 때만
          opportunities.push({
            id: `${Date.now()}-${i}-${j}`,
            buyExchange: buyExchange.exchange,
            sellExchange: sellExchange.exchange,
            buyPrice: buyExchange.price,
            sellPrice: sellExchange.price,
            spread: spread,
            profit: spread - 0.2, // 수수료 0.2% 차감
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    
    return NextResponse.json({
      symbol,
      opportunities,
      prices,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Arbitrage API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch arbitrage opportunities' },
      { status: 500 }
    )
  }
}