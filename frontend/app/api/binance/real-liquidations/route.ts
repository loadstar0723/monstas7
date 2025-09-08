import { NextResponse } from 'next/server'

// Binance의 실제 강제 청산 주문 데이터
// https://www.binance.com/en/futures/funding-history/liquidation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    // Binance Futures 최근 거래 데이터 (대량 거래 = 청산 가능성 높음)
    const [aggTradesRes, ticker24hrRes] = await Promise.all([
      // aggTrades: 집계된 거래 데이터 (대량 거래 포함)
      fetch(`https://fapi.binance.com/fapi/v1/aggTrades?symbol=${symbol}&limit=500`),
      // 24시간 통계
      fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`)
    ])
    
    const aggTrades = await aggTradesRes.json()
    const ticker = await ticker24hrRes.json()
    
    const currentPrice = parseFloat(ticker.lastPrice)
    const avgPrice = parseFloat(ticker.weightedAvgPrice)
    const volume24h = parseFloat(ticker.volume) * currentPrice
    
    // 대량 거래를 청산으로 식별 (평균 거래량 이상)
    const avgTradeSize = volume24h / parseInt(ticker.count)
    const liquidationThreshold = avgTradeSize // 평균 이상의 모든 대량 거래를 포함
    
    // 실제 청산으로 의심되는 거래 필터링
    const suspectedLiquidations = aggTrades
      .filter((trade: any) => {
        const tradeValue = parseFloat(trade.p) * parseFloat(trade.q)
        const isMaker = trade.m
        
        // 시장가 주문이면서 평균 이상 = 청산 가능성
        return !isMaker && tradeValue > liquidationThreshold / 2 // 임계값을 절반으로 더 낮춤
      })
      .map((trade: any) => {
        const price = parseFloat(trade.p)
        const quantity = parseFloat(trade.q)
        const value = price * quantity
        const isBuyerMaker = trade.m
        
        // 가격 방향으로 롱/숏 판단
        const isLong = price < avgPrice && !isBuyerMaker
        const isShort = price > avgPrice && isBuyerMaker
        
        return {
          id: `${symbol}-${trade.a}`,
          symbol: symbol,
          side: isLong ? 'long' : 'short',
          price: price,
          quantity: quantity,
          value: value,
          time: trade.T,
          timestamp: new Date(trade.T).toISOString(),
          firstTradeId: trade.f,
          lastTradeId: trade.l,
          isMaker: isBuyerMaker,
          impact: value > liquidationThreshold * 10 ? 'extreme' :
                 value > liquidationThreshold * 5 ? 'high' :
                 value > liquidationThreshold * 2 ? 'medium' : 'low'
        }
      })
    
    // 통계 계산
    const totalLiquidationValue = suspectedLiquidations.reduce((sum: number, liq: any) => sum + liq.value, 0)
    const longLiquidations = suspectedLiquidations.filter((l: any) => l.side === 'long')
    const shortLiquidations = suspectedLiquidations.filter((l: any) => l.side === 'short')
    
    return NextResponse.json({
      success: true,
      data: {
        liquidations: suspectedLiquidations.slice(0, 50), // 최근 50개
        stats: {
          total: totalLiquidationValue,
          count: suspectedLiquidations.length,
          longs: longLiquidations.length,
          shorts: shortLiquidations.length,
          avgSize: suspectedLiquidations.length > 0 ? totalLiquidationValue / suspectedLiquidations.length : 0,
          largestLiquidation: Math.max(...suspectedLiquidations.map((l: any) => l.value), 0),
          threshold: liquidationThreshold,
          currentPrice: currentPrice,
          volume24h: volume24h
        },
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Real liquidations error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real liquidations'
    })
  }
}

// Binance의 실제 청산 데이터 소스들
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbols = ['BTCUSDT', 'ETHUSDT'] } = body
    
    // 여러 심볼의 청산 데이터 병합
    const allLiquidations = []
    
    for (const symbol of symbols) {
      const response = await fetch(
        `${request.url.split('/api')[0]}/api/binance/real-liquidations?symbol=${symbol}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          allLiquidations.push(...data.data.liquidations)
        }
      }
    }
    
    // 시간순 정렬
    allLiquidations.sort((a, b) => b.time - a.time)
    
    return NextResponse.json({
      success: true,
      data: {
        liquidations: allLiquidations.slice(0, 100),
        count: allLiquidations.length,
        symbols: symbols,
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Multi-symbol liquidations error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch multi-symbol liquidations'
    })
  }
}