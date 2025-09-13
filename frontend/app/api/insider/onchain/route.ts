import { NextResponse } from 'next/server'

// Prisma 임포트를 조건적으로 처리
let prisma: any = null
try {
  prisma = require('@/lib/prisma').default
} catch (e) {
  }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'

  try {
    // Binance API에서 실시간 거래량 데이터 가져오기
    const binanceSymbol = `${symbol}USDT`
    const ticker24hrResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`
    )
    
    let volume = 0
    let count = 0
    let priceChange = 0
    
    if (ticker24hrResponse.ok) {
      const ticker24hrData = await ticker24hrResponse.json()
      volume = parseFloat(ticker24hrData.volume) * parseFloat(ticker24hrData.lastPrice)
      count = parseInt(ticker24hrData.count)
      priceChange = parseFloat(ticker24hrData.priceChangePercent)
    }

    // 거래량 기반으로 온체인 메트릭 추정 (실제 온체인 API 연동 전까지)
    const activeAddresses = Math.max(1000, Math.floor(count / 10))
    const transactionCount = count
    const largeHolders = Math.max(100, Math.floor(volume / 1000000))
    const networkActivity = Math.min(100, Math.max(10, (count / 1000) + Math.abs(priceChange) * 2))

    // 변화율 계산 (가격 변화와 연동)
    const activeAddressChange = priceChange > 0 ? Math.abs(priceChange) * 2.5 : -Math.abs(priceChange) * 1.5
    const transactionCountChange = priceChange > 0 ? Math.abs(priceChange) * 1.2 : -Math.abs(priceChange) * 0.8
    const largeHoldersChange = priceChange > 0 ? Math.floor(Math.abs(priceChange) / 2) : -Math.floor(Math.abs(priceChange) / 3)

    // DB에서 과거 데이터 가져오기 (있으면)
    let historicalData = null
    if (prisma) {
      try {
        historicalData = await prisma.onchainMetrics.findFirst({
          where: { 
            symbol,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 전
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      } catch (dbError) {
        }
    }

    const onchainData = {
      symbol,
      metrics: {
        activeAddresses: {
          value: activeAddresses,
          change24h: activeAddressChange,
          changePercent: activeAddressChange > 0,
        },
        transactionCount: {
          value: transactionCount,
          change24h: transactionCountChange,
          changePercent: transactionCountChange > 0,
        },
        largeHolders: {
          value: largeHolders,
          change24h: largeHoldersChange,
          changeAbsolute: true, // 절대값 변화
        },
        networkActivity: {
          value: networkActivity,
          level: networkActivity > 70 ? '높음' : 
                 networkActivity > 40 ? '보통' : '낮음',
        }
      },
      holderDistribution: {
        // 거래량과 변동성 기반으로 홀더 분포 추정
        // 높은 거래량 = 더 분산된 분포
        top10: Math.max(25, Math.min(60, 50 - (volume / 50000000))),
        top11to50: Math.max(15, Math.min(30, 25 + (count / 2000000))),
        top51to100: Math.max(10, Math.min(20, 15 + Math.abs(priceChange) / 10)),
        others: 0, // 나머지 계산
      },
      // 거래소별 보유량 (실제 API 연동 전까지 거래량 기반 추정)
      exchangeBalances: {
        binance: Math.floor(volume * 0.35),
        coinbase: Math.floor(volume * 0.20),
        kraken: Math.floor(volume * 0.10),
        bitfinex: Math.floor(volume * 0.08),
        others: Math.floor(volume * 0.27)
      },
      timestamp: new Date().toISOString()
    }

    // 홀더 분포 나머지 계산
    const totalPercent = onchainData.holderDistribution.top10 + 
                        onchainData.holderDistribution.top11to50 + 
                        onchainData.holderDistribution.top51to100
    onchainData.holderDistribution.others = Math.max(0, 100 - totalPercent)

    // 현재 데이터를 DB에 저장 (다음 비교를 위해)
    if (prisma) {
      try {
        await prisma.onchainMetrics.create({
          data: {
            symbol,
            activeAddresses,
            transactionCount,
            largeHolders,
            networkActivity,
            volume,
            priceChange,
          }
        })
      } catch (dbError) {
        }
    }

    return NextResponse.json({
      success: true,
      data: onchainData
    })
  } catch (error) {
    console.error('Error fetching onchain data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onchain data' },
      { status: 500 }
    )
  }
}