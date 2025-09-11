import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 실제 프로덕션에서는 데이터베이스나 환경변수에서 가져와야 함
    const config = {
      stopLossRatio: 0.95,
      takeProfitRatio: 1.05,
      riskRewardRatio: 2,
      maxLeverage: 5,
      defaultLeverage: 2,
      positionSizeRatio: 0.1, // 전체 자본의 10%
      emergencyStopLoss: 0.9, // 긴급 손절 -10%
      trailingStopRatio: 0.03, // 트레일링 스탑 3%
      fees: {
        maker: 0.001, // 0.1%
        taker: 0.002  // 0.2%
      },
      indicators: {
        rsi: {
          overbought: 70,
          oversold: 30,
          period: 14
        },
        macd: {
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9
        },
        stochastic: {
          kPeriod: 14,
          dPeriod: 3,
          smooth: 3,
          overbought: 80,
          oversold: 20
        },
        roc: {
          period: 12,
          signalThreshold: 10
        },
        momentum: {
          period: 10,
          signalThreshold: 5
        }
      }
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Trading config error:', error)
    return NextResponse.json(
      { error: 'Failed to load trading config' },
      { status: 500 }
    )
  }
}