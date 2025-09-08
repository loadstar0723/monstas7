import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    
    // Binance에서 실시간 데이터 가져오기
    const [tickerRes, depthRes, statsRes] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
      fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=100`),
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`)
    ])

    const ticker = await tickerRes.json()
    const depth = await depthRes.json()
    const klines = await statsRes.json()
    
    const currentPrice = parseFloat(ticker.lastPrice)
    const volume24h = parseFloat(ticker.volume) * currentPrice
    const priceChange = parseFloat(ticker.priceChangePercent)
    const highPrice = parseFloat(ticker.highPrice)
    const lowPrice = parseFloat(ticker.lowPrice)
    
    // 변동성 계산 (24시간 데이터 기반)
    const prices = klines.map((k: any) => parseFloat(k[4])) // close prices
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    const variance = prices.reduce((sum: number, price: number) => 
      sum + Math.pow(price - avgPrice, 2), 0) / prices.length
    const volatility = Math.sqrt(variance) / avgPrice * 100
    
    // 오더북 분석으로 유동성 집중 구간 찾기
    const bids = depth.bids.map((b: any) => ({
      price: parseFloat(b[0]),
      quantity: parseFloat(b[1]),
      total: parseFloat(b[0]) * parseFloat(b[1])
    }))
    
    const asks = depth.asks.map((a: any) => ({
      price: parseFloat(a[0]), 
      quantity: parseFloat(a[1]),
      total: parseFloat(a[0]) * parseFloat(a[1])
    }))
    
    // 주요 지지/저항선 찾기 (유동성이 집중된 구간)
    const findLiquidityCluster = (orders: any[], isSupport: boolean) => {
      // 큰 주문들 찾기 (평균의 3배 이상)
      const avgSize = orders.reduce((sum, o) => sum + o.total, 0) / orders.length
      const largeOrders = orders.filter(o => o.total > avgSize * 3)
      
      if (largeOrders.length === 0) {
        // 큰 주문이 없으면 누적 볼륨이 가장 큰 구간 찾기
        let maxVolume = 0
        let clusterPrice = isSupport ? currentPrice * 0.95 : currentPrice * 1.05
        
        // 가격대별로 그룹화
        const priceStep = currentPrice * 0.001 // 0.1% 단위
        const clusters: { [key: number]: number } = {}
        
        orders.forEach(order => {
          const key = Math.round(order.price / priceStep) * priceStep
          clusters[key] = (clusters[key] || 0) + order.total
        })
        
        // 가장 큰 클러스터 찾기
        Object.entries(clusters).forEach(([price, volume]) => {
          if (volume > maxVolume) {
            maxVolume = volume
            clusterPrice = parseFloat(price)
          }
        })
        
        return clusterPrice
      }
      
      // 큰 주문들의 가중 평균 가격
      const totalValue = largeOrders.reduce((sum, o) => sum + o.total, 0)
      const weightedPrice = largeOrders.reduce((sum, o) => 
        sum + (o.price * o.total), 0) / totalValue
      
      return weightedPrice
    }
    
    // 레버리지 기반 청산 레벨 계산
    const calculateLiquidationLevels = () => {
      const levels = []
      const leverages = [2, 3, 5, 10, 20, 50, 100] // 일반적인 레버리지
      
      leverages.forEach(lev => {
        // 롱 청산가 = 진입가 * (1 - 1/레버리지)
        // 숏 청산가 = 진입가 * (1 + 1/레버리지)
        const liquidationPercent = 100 / lev
        
        // 최근 고점/저점을 진입 포인트로 가정
        const longEntry = highPrice // 고점에서 롱 진입
        const shortEntry = lowPrice // 저점에서 숏 진입
        
        const longLiquidation = longEntry * (1 - liquidationPercent / 100)
        const shortLiquidation = shortEntry * (1 + liquidationPercent / 100)
        
        // 현재가 근처의 청산 레벨만 포함
        if (Math.abs(longLiquidation - currentPrice) / currentPrice < 0.15) {
          levels.push({
            type: 'long',
            leverage: lev,
            entryPrice: longEntry,
            liquidationPrice: longLiquidation,
            distance: ((currentPrice - longLiquidation) / currentPrice * 100),
            risk: lev > 10 ? 'high' : lev > 5 ? 'medium' : 'low'
          })
        }
        
        if (Math.abs(shortLiquidation - currentPrice) / currentPrice < 0.15) {
          levels.push({
            type: 'short',
            leverage: lev,
            entryPrice: shortEntry,
            liquidationPrice: shortLiquidation,
            distance: ((shortLiquidation - currentPrice) / currentPrice * 100),
            risk: lev > 10 ? 'high' : lev > 5 ? 'medium' : 'low'
          })
        }
      })
      
      return levels
    }
    
    // 청산 클러스터 계산
    const liquidationLevels = calculateLiquidationLevels()
    
    // 롱/숏 청산 클러스터 찾기
    const longLiquidations = liquidationLevels.filter(l => l.type === 'long')
    const shortLiquidations = liquidationLevels.filter(l => l.type === 'short')
    
    // 가장 가까운 주요 청산 레벨
    const nearestLongCluster = longLiquidations
      .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))[0]
    const nearestShortCluster = shortLiquidations
      .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))[0]
    
    // 오더북 기반 실제 지지/저항
    const supportLevel = findLiquidityCluster(bids, true)
    const resistanceLevel = findLiquidityCluster(asks, false)
    
    // 종합 청산 위험 구간
    const clusters = {
      downside: {
        price: nearestLongCluster?.liquidationPrice || supportLevel,
        leverage: nearestLongCluster?.leverage || 0,
        distance: nearestLongCluster?.distance || ((currentPrice - supportLevel) / currentPrice * 100),
        volume: bids.filter(b => 
          Math.abs(b.price - (nearestLongCluster?.liquidationPrice || supportLevel)) / currentPrice < 0.01
        ).reduce((sum, b) => sum + b.total, 0),
        description: nearestLongCluster 
          ? `${nearestLongCluster.leverage}x 레버리지 롱 청산`
          : '주요 지지선',
        risk: nearestLongCluster?.risk || 'medium'
      },
      upside: {
        price: nearestShortCluster?.liquidationPrice || resistanceLevel,
        leverage: nearestShortCluster?.leverage || 0,
        distance: nearestShortCluster?.distance || ((resistanceLevel - currentPrice) / currentPrice * 100),
        volume: asks.filter(a => 
          Math.abs(a.price - (nearestShortCluster?.liquidationPrice || resistanceLevel)) / currentPrice < 0.01
        ).reduce((sum, a) => sum + a.total, 0),
        description: nearestShortCluster
          ? `${nearestShortCluster.leverage}x 레버리지 숏 청산`
          : '주요 저항선',
        risk: nearestShortCluster?.risk || 'medium'
      },
      critical: {
        longCascade: currentPrice * (1 - volatility / 100 * 2), // 변동성의 2배 하락
        shortCascade: currentPrice * (1 + volatility / 100 * 2), // 변동성의 2배 상승
        cascadeRisk: volatility > 5 ? 'high' : volatility > 3 ? 'medium' : 'low'
      }
    }
    
    // 추가 분석 데이터
    const analysis = {
      currentPrice,
      volatility,
      volume24h,
      priceChange,
      supportLevel,
      resistanceLevel,
      liquidationLevels: liquidationLevels.sort((a, b) => 
        Math.abs(a.distance) - Math.abs(b.distance)
      ).slice(0, 10), // 가장 가까운 10개
      marketCondition: volatility > 5 ? 'extreme' : 
                      volatility > 3 ? 'volatile' : 
                      volatility > 1.5 ? 'normal' : 'calm'
    }
    
    return NextResponse.json({
      success: true,
      data: {
        clusters,
        analysis,
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Liquidation clusters error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate liquidation clusters'
    })
  }
}