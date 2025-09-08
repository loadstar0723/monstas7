import { NextResponse } from 'next/server'

// Binance Futures 청산 데이터 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const limit = searchParams.get('limit') || '100'

    // Binance Futures 최근 청산 데이터
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/forceOrders?symbol=${symbol}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      // 데이터가 없을 경우 빈 배열 반환
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No liquidation data available'
      })
    }

    const data = await response.json()

    // 청산 데이터 포맷팅
    const formattedData = Array.isArray(data) ? data.map((order: any) => ({
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      price: parseFloat(order.price),
      quantity: parseFloat(order.origQty),
      value: parseFloat(order.price) * parseFloat(order.origQty),
      time: order.time,
      status: order.status
    })) : []

    return NextResponse.json({
      success: true,
      data: formattedData,
      stats: {
        total: formattedData.length,
        totalValue: formattedData.reduce((sum: number, item: any) => sum + item.value, 0),
        longs: formattedData.filter((item: any) => item.side === 'BUY').length,
        shorts: formattedData.filter((item: any) => item.side === 'SELL').length
      }
    })

  } catch (error) {
    console.error('Liquidation API error:', error)
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Failed to fetch liquidation data'
    })
  }
}

// 24시간 청산 통계
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const symbols = body.symbols || ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
    
    const allLiquidations = []
    
    // 각 심볼별로 청산 데이터 수집
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://fapi.binance.com/fapi/v1/forceOrders?symbol=${symbol}&limit=100`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            allLiquidations.push(...data.map((order: any) => ({
              symbol: order.symbol,
              side: order.side,
              price: parseFloat(order.price),
              quantity: parseFloat(order.origQty),
              value: parseFloat(order.price) * parseFloat(order.origQty),
              time: order.time
            })))
          }
        }
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err)
      }
    }

    // 24시간 내 청산만 필터링
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000
    const recentLiquidations = allLiquidations.filter(liq => liq.time > dayAgo)

    // 통계 계산
    const stats = {
      totalCount: recentLiquidations.length,
      totalValue: recentLiquidations.reduce((sum, liq) => sum + liq.value, 0),
      longCount: recentLiquidations.filter(liq => liq.side === 'BUY').length,
      shortCount: recentLiquidations.filter(liq => liq.side === 'SELL').length,
      largestLiquidation: recentLiquidations.reduce((max, liq) => 
        liq.value > (max?.value || 0) ? liq : max, null as any
      ),
      avgLiquidationSize: recentLiquidations.length > 0 
        ? recentLiquidations.reduce((sum, liq) => sum + liq.value, 0) / recentLiquidations.length
        : 0
    }

    return NextResponse.json({
      success: true,
      data: recentLiquidations,
      stats
    })

  } catch (error) {
    console.error('Liquidation stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch liquidation stats'
    })
  }
}