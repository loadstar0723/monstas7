import { NextResponse } from 'next/server'

// Prisma 임포트를 조건적으로 처리
let prisma: any = null
try {
  prisma = require('@/lib/prisma').default
} catch (e) {
  console.log('Prisma not available, using API only')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'

  try {
    // 실제 Binance API에서 가격 정보 가져오기
    const binanceSymbol = `${symbol}USDT`
    const [tickerResponse, ticker24hrResponse] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`),
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`)
    ])
    
    let price = 100 // 기본값
    let volume = 0
    let priceChange = 0
    
    if (tickerResponse.ok) {
      const tickerData = await tickerResponse.json()
      price = parseFloat(tickerData.price)
    }
    
    if (ticker24hrResponse.ok) {
      const ticker24hrData = await ticker24hrResponse.json()
      volume = parseFloat(ticker24hrData.volume) * price
      priceChange = parseFloat(ticker24hrData.priceChangePercent)
    }

    // DB에서 설정값 가져오기 (없으면 기본값 사용)
    let dbConfig = null
    if (prisma) {
      try {
        dbConfig = await prisma.tradingConfig.findFirst({
          where: { symbol }
        })
      } catch (dbError) {
        console.log('DB config not found, using calculated values')
      }
    }

    // 동적으로 계산되는 설정값들 (DB 값 우선, 없으면 계산)
    const config = {
      symbol,
      tradingLevels: {
        strongResistance: dbConfig?.strongResistanceRatio ? price * dbConfig.strongResistanceRatio : price * 1.15,
        weakResistance: dbConfig?.weakResistanceRatio ? price * dbConfig.weakResistanceRatio : price * 1.05,
        currentPrice: price,
        weakSupport: dbConfig?.weakSupportRatio ? price * dbConfig.weakSupportRatio : price * 0.95,
        strongSupport: dbConfig?.strongSupportRatio ? price * dbConfig.strongSupportRatio : price * 0.85,
      },
      entryStrategy: {
        stopLossRatio: dbConfig?.stopLossRatio || 0.97,
        takeProfitRatio: dbConfig?.takeProfitRatio || 1.05,
        positionSizes: {
          highRisk: dbConfig?.positionSizeHighRisk || 3,
          mediumRisk: dbConfig?.positionSizeMediumRisk || 5,
          lowRisk: dbConfig?.positionSizeLowRisk || 10,
        }
      },
      thresholds: {
        // 거래소별 대규모 거래 기준 (시가총액 대비 계산)
        largeTransaction: Math.max(
          1000,
          symbol === 'BTC' ? volume / 10000 : 
          symbol === 'ETH' ? volume / 20000 : 
          volume / 50000
        ),
        alertThreshold: Math.max(
          10000,
          symbol === 'BTC' ? volume / 1000 : 
          volume / 2000
        ),
        rsiOverbought: dbConfig?.rsiOverbought || 70,
        rsiOversold: dbConfig?.rsiOversold || 30,
        signalStrengthBullish: dbConfig?.signalStrengthBullish || 65,
        signalStrengthBearish: dbConfig?.signalStrengthBearish || 35,
      },
      estimations: {
        exchangeFlowRatio: dbConfig?.exchangeFlowRatio || 0.7,
      },
      riskLevels: {
        critical: dbConfig?.riskCritical || 80,
        high: dbConfig?.riskHigh || 60,
        medium: dbConfig?.riskMedium || 40,
        low: dbConfig?.riskLow || 20,
      },
      // 실제 시장 데이터
      marketData: {
        price,
        volume,
        priceChange,
        timestamp: new Date().toISOString()
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