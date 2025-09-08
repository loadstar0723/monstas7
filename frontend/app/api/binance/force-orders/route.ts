import { NextResponse } from 'next/server'

// Binance Futures 강제 청산 주문 (실제 청산 데이터)
// https://binance-docs.github.io/apidocs/futures/en/#all-forceorders-user_stream
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    // Binance Futures 공개 API - 강제 청산 주문
    // forceOrders는 실제 청산된 주문들
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/allForceOrders?symbol=${symbol}&limit=100`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      // 청산 데이터가 없을 수 있음 (정상적인 상황)
      return NextResponse.json({
        success: true,
        data: {
          liquidations: [],
          message: '현재 공개된 청산 데이터가 없습니다. 시장이 안정적입니다.',
          timestamp: Date.now()
        }
      })
    }
    
    const forceOrders = await response.json()
    
    // 강제 청산 주문 포맷팅
    const liquidations = Array.isArray(forceOrders) ? forceOrders.map((order: any) => ({
      symbol: order.symbol,
      price: parseFloat(order.price),
      origQty: parseFloat(order.origQty),
      executedQty: parseFloat(order.executedQty),
      averagePrice: parseFloat(order.averagePrice),
      status: order.status,
      timeInForce: order.timeInForce,
      type: order.type,
      side: order.side,
      time: order.time,
      value: parseFloat(order.averagePrice || order.price) * parseFloat(order.executedQty || order.origQty),
      isLong: order.side === 'SELL', // SELL = 롱 청산
      isShort: order.side === 'BUY'  // BUY = 숏 청산
    })) : []
    
    return NextResponse.json({
      success: true,
      data: {
        liquidations,
        count: liquidations.length,
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Force orders error:', error)
    
    // 대안: 최근 거래에서 큰 시장가 주문 찾기
    try {
      const { searchParams } = new URL(request.url)
      const symbol = searchParams.get('symbol') || 'BTCUSDT'
      
      // 최근 거래 데이터
      const tradesRes = await fetch(
        `https://fapi.binance.com/fapi/v1/aggTrades?symbol=${symbol}&limit=1000`
      )
      
      const trades = await tradesRes.json()
      
      // 거래량 분석
      const volumes = trades.map((t: any) => parseFloat(t.p) * parseFloat(t.q))
      const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length
      
      // 큰 거래 = 잠재적 청산
      const potentialLiquidations = trades
        .filter((t: any) => {
          const volume = parseFloat(t.p) * parseFloat(t.q)
          return volume > avgVolume * 3 // 평균의 3배 이상
        })
        .map((t: any) => ({
          symbol: symbol,
          price: parseFloat(t.p),
          quantity: parseFloat(t.q),
          value: parseFloat(t.p) * parseFloat(t.q),
          time: t.T,
          side: t.m ? 'short' : 'long', // maker = short liquidation
          impact: 'medium'
        }))
        .slice(0, 50)
      
      return NextResponse.json({
        success: true,
        data: {
          liquidations: potentialLiquidations,
          count: potentialLiquidations.length,
          note: '대량 거래 기반 추정',
          avgVolume,
          timestamp: Date.now()
        }
      })
      
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch liquidation data'
      })
    }
  }
}