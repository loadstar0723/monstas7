import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'

  try {
    // 실제로는 Glassnode, CryptoQuant, Etherscan 등의 API에서 가져와야 함
    // 여기서는 Binance 데이터를 기반으로 추정
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`
    )
    const binanceData = await response.json()

    const volume = parseFloat(binanceData.volume)
    const count = parseFloat(binanceData.count)
    const priceChange = parseFloat(binanceData.priceChangePercent)

    // 실제 온체인 데이터를 가져올 때까지 동적 계산
    const activeAddresses = Math.floor(volume / 10) // 실제로는 온체인 API
    const transactionCount = count * 100 // 실제로는 온체인 API
    const largeHolders = Math.floor(volume / 100000) // 실제로는 온체인 API
    const networkActivity = Math.min(100, Math.abs(priceChange) * 10 + 50) // 실제로는 온체인 API

    // 변화율은 실제 히스토리 데이터와 비교해야 함
    const activeAddressChange = priceChange * 0.5 // 실제로는 24시간 전 데이터와 비교
    const transactionCountChange = -priceChange * 0.2 // 실제로는 24시간 전 데이터와 비교
    const largeHoldersChange = Math.floor(priceChange) // 실제로는 24시간 전 데이터와 비교

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
        // 실제로는 온체인 데이터 제공업체 API에서 가져와야 함
        // 임시로 거래량 기반 계산 (실제 온체인 API 연동 필요)
        top10: Math.min(45, 30 + Math.min(volume / 10000000, 15)), 
        top11to50: Math.min(30, 20 + Math.min(count / 1000000, 10)),
        top51to100: Math.min(20, 15 + Math.abs(priceChange) / 20),
        others: 0, // 나머지 계산
      },
      timestamp: new Date().toISOString()
    }

    // 홀더 분포 나머지 계산
    const totalPercent = onchainData.holderDistribution.top10 + 
                        onchainData.holderDistribution.top11to50 + 
                        onchainData.holderDistribution.top51to100
    onchainData.holderDistribution.others = Math.max(0, 100 - totalPercent)

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