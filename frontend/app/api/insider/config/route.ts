import { NextResponse } from 'next/server'

// 실제 프로덕션에서는 데이터베이스나 환경변수에서 가져와야 함
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'

  try {
    // 기본 가격 설정 (실제로는 DB에서 가져와야 함)
    const defaultPrices: Record<string, number> = {
      BTC: 98000,
      ETH: 3500,
      BNB: 700,
      SOL: 240,
      XRP: 2.5,
      ADA: 1.2,
      AVAX: 45,
      DOT: 10,
      MATIC: 1.5,
      LINK: 20
    }
    
    const price = defaultPrices[symbol] || 100
    const volume = price * 1000000 // 임시 볼륨
    const priceChange = 2.5 // 임시 변화율

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