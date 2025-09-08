import { NextResponse } from 'next/server'

// 실제 프로덕션에서는 데이터베이스나 환경변수에서 가져와야 함
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'

  try {
    // 실제로는 PostgreSQL이나 Redis에서 실시간으로 가져와야 함
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`
    )
    const binanceData = await response.json()

    // 실제 설정값은 DB에서 관리해야 함
    // 여기서는 Binance 데이터를 기반으로 동적 계산
    const price = parseFloat(binanceData.lastPrice)
    const volume = parseFloat(binanceData.volume)
    const priceChange = parseFloat(binanceData.priceChangePercent)

    // 동적으로 계산되는 설정값들
    const config = {
      symbol,
      tradingLevels: {
        strongResistance: price * 1.15, // DB에서 관리
        weakResistance: price * 1.05,
        currentPrice: price,
        weakSupport: price * 0.95,
        strongSupport: price * 0.85,
      },
      entryStrategy: {
        stopLossRatio: 0.97, // DB에서 관리
        takeProfitRatio: 1.05,
        positionSizes: {
          highRisk: 3, // %
          mediumRisk: 5,
          lowRisk: 10,
        }
      },
      thresholds: {
        largeTransaction: symbol === 'BTC' ? 10000 : 
                         symbol === 'ETH' ? 5000 : 
                         symbol === 'BNB' ? 3000 : 1000,
        alertThreshold: symbol === 'BTC' ? 100000 : 50000,
        rsiOverbought: 70,
        rsiOversold: 30,
        signalStrengthBullish: 65,
        signalStrengthBearish: 35,
      },
      estimations: {
        exchangeFlowRatio: 0.7, // 실제로는 온체인 데이터 기반
      },
      riskLevels: {
        critical: 80,
        high: 60,
        medium: 40,
        low: 20,
      }
    }

    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}