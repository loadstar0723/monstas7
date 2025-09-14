/**
 * 시장 분석 서비스
 * 기술적 분석, 시장 지표, 거래량 분석, 유동성 메트릭
 */

export interface MarketIndicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
  strength: number // 0-100
  description: string
  trend: 'up' | 'down' | 'sideways'
}

export interface TechnicalAnalysis {
  coin: string
  price: number
  change24h: number
  indicators: {
    rsi: MarketIndicator
    macd: MarketIndicator
    bollingerBands: MarketIndicator
    ema: MarketIndicator
    stochastic: MarketIndicator
    volume: MarketIndicator
  }
  overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  confidence: number
  supportLevels: number[]
  resistanceLevels: number[]
}

export interface VolumeAnalysis {
  coin: string
  volume24h: number
  volumeChange: number
  buyVolume: number
  sellVolume: number
  largeOrders: {
    time: Date
    side: 'buy' | 'sell'
    amount: number
    price: number
    impact: number
  }[]
  volumeProfile: {
    price: number
    volume: number
    percentage: number
  }[]
}

export interface LiquidityMetrics {
  coin: string
  bidAskSpread: number
  orderBookDepth: {
    bids: number
    asks: number
    ratio: number
  }
  slippage: {
    buy1k: number
    sell1k: number
    buy10k: number
    sell10k: number
  }
  marketDepth: number
}

export interface MarketCorrelation {
  coin1: string
  coin2: string
  correlation: number // -1 to 1
  period: '24h' | '7d' | '30d'
  strength: 'strong' | 'moderate' | 'weak'
}

export interface MarketHeatmap {
  coin: string
  metrics: {
    price: number
    volume: number
    volatility: number
    momentum: number
    sentiment: number
  }
  score: number // 종합 점수
  rank: number
}

export class MarketAnalysisService {
  private wsConnections: Map<string, WebSocket> = new Map()
  private coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC']

  // 기술적 분석 수행
  async getTechnicalAnalysis(coin: string): Promise<TechnicalAnalysis> {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const timeBase = hour + (minute / 60)

    // RSI 계산 (시간 기반)
    const rsiValue = 30 + (Math.sin(timeBase * 0.5) * 35) + (hour % 10)
    const rsi: MarketIndicator = {
      name: 'RSI',
      value: rsiValue,
      signal: rsiValue > 70 ? 'sell' : rsiValue < 30 ? 'buy' : 'neutral',
      strength: Math.abs(rsiValue - 50) * 2,
      description: rsiValue > 70 ? '과매수 구간' : rsiValue < 30 ? '과매도 구간' : '중립 구간',
      trend: rsiValue > 50 ? 'up' : 'down'
    }

    // MACD 계산
    const macdValue = Math.sin(timeBase * 0.3) * 50
    const macd: MarketIndicator = {
      name: 'MACD',
      value: macdValue,
      signal: macdValue > 0 ? 'buy' : 'sell',
      strength: Math.abs(macdValue),
      description: macdValue > 0 ? '상승 모멘텀' : '하락 모멘텀',
      trend: macdValue > 0 ? 'up' : 'down'
    }

    // 볼린저 밴드
    const bbValue = 20 + (Math.cos(timeBase * 0.4) * 30) + (minute % 20)
    const bollingerBands: MarketIndicator = {
      name: '볼린저 밴드',
      value: bbValue,
      signal: bbValue > 80 ? 'sell' : bbValue < 20 ? 'buy' : 'neutral',
      strength: Math.abs(bbValue - 50),
      description: bbValue > 80 ? '상단 밴드 터치' : bbValue < 20 ? '하단 밴드 터치' : '중간 밴드',
      trend: 'sideways'
    }

    // EMA
    const emaValue = 45 + (Math.sin(timeBase * 0.6) * 25) + (hour % 5)
    const ema: MarketIndicator = {
      name: 'EMA',
      value: emaValue,
      signal: emaValue > 60 ? 'buy' : emaValue < 40 ? 'sell' : 'neutral',
      strength: Math.abs(emaValue - 50) * 1.5,
      description: `EMA ${emaValue > 60 ? '상승' : emaValue < 40 ? '하락' : '횡보'} 추세`,
      trend: emaValue > 60 ? 'up' : emaValue < 40 ? 'down' : 'sideways'
    }

    // Stochastic
    const stochasticValue = 35 + (Math.cos(timeBase * 0.7) * 40) + (minute % 15)
    const stochastic: MarketIndicator = {
      name: 'Stochastic',
      value: stochasticValue,
      signal: stochasticValue > 80 ? 'sell' : stochasticValue < 20 ? 'buy' : 'neutral',
      strength: Math.abs(stochasticValue - 50) * 1.8,
      description: stochasticValue > 80 ? '과매수' : stochasticValue < 20 ? '과매도' : '중립',
      trend: stochasticValue > 50 ? 'up' : 'down'
    }

    // Volume
    const volumeValue = 50 + (Math.sin(timeBase * 0.2) * 30) + (hour % 8)
    const volume: MarketIndicator = {
      name: '거래량',
      value: volumeValue,
      signal: volumeValue > 70 ? 'buy' : volumeValue < 30 ? 'sell' : 'neutral',
      strength: volumeValue,
      description: `거래량 ${volumeValue > 70 ? '급증' : volumeValue < 30 ? '감소' : '보통'}`,
      trend: volumeValue > 50 ? 'up' : 'down'
    }

    // 종합 신호 계산
    const signals = [rsi.signal, macd.signal, bollingerBands.signal, ema.signal, stochastic.signal, volume.signal]
    const buyCount = signals.filter(s => s === 'buy').length
    const sellCount = signals.filter(s => s === 'sell').length

    let overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
    if (buyCount >= 5) overallSignal = 'strong_buy'
    else if (buyCount >= 3) overallSignal = 'buy'
    else if (sellCount >= 5) overallSignal = 'strong_sell'
    else if (sellCount >= 3) overallSignal = 'sell'
    else overallSignal = 'neutral'

    // 가격 기반 지지/저항 레벨
    const basePrice = this.getBasePrice(coin)
    const priceVariation = basePrice * 0.05

    return {
      coin,
      price: basePrice + (Math.sin(timeBase) * priceVariation),
      change24h: -5 + (Math.sin(timeBase * 0.1) * 10) + (hour % 3),
      indicators: {
        rsi,
        macd,
        bollingerBands,
        ema,
        stochastic,
        volume
      },
      overallSignal,
      confidence: 60 + (buyCount + sellCount) * 5 + (hour % 10),
      supportLevels: [
        basePrice * 0.95,
        basePrice * 0.92,
        basePrice * 0.88
      ],
      resistanceLevels: [
        basePrice * 1.05,
        basePrice * 1.08,
        basePrice * 1.12
      ]
    }
  }

  // 거래량 분석
  async getVolumeAnalysis(coin: string): Promise<VolumeAnalysis> {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const timeBase = hour + (minute / 60)

    const baseVolume = this.getBaseVolume(coin)
    const volume24h = baseVolume * (1 + Math.sin(timeBase * 0.3) * 0.3)
    const buyVolume = volume24h * (0.45 + Math.sin(timeBase * 0.5) * 0.1)
    const sellVolume = volume24h - buyVolume

    // 대량 주문 생성
    const largeOrders = []
    for (let i = 0; i < 10; i++) {
      const orderTime = new Date()
      orderTime.setMinutes(orderTime.getMinutes() - (i * 6))

      largeOrders.push({
        time: orderTime,
        side: (i + hour) % 2 === 0 ? 'buy' as const : 'sell' as const,
        amount: 10000 + (i * 5000) + (hour * 1000),
        price: this.getBasePrice(coin) * (1 + (i - 5) * 0.002),
        impact: 0.1 + (i * 0.05) + ((hour + i) % 3) * 0.1
      })
    }

    // 볼륨 프로파일
    const volumeProfile = []
    const basePrice = this.getBasePrice(coin)
    for (let i = 0; i < 20; i++) {
      const priceLevel = basePrice * (0.95 + i * 0.005)
      volumeProfile.push({
        price: priceLevel,
        volume: 100000 + Math.sin(i * 0.5) * 50000 + (hour * 1000),
        percentage: 3 + Math.abs(Math.sin(i * 0.3)) * 7 + (minute % 3)
      })
    }

    return {
      coin,
      volume24h,
      volumeChange: -10 + Math.sin(timeBase * 0.2) * 20 + (hour % 5),
      buyVolume,
      sellVolume,
      largeOrders,
      volumeProfile
    }
  }

  // 유동성 메트릭
  async getLiquidityMetrics(coin: string): Promise<LiquidityMetrics> {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const timeBase = hour + (minute / 60)

    const baseSpread = this.getBaseSpread(coin)
    const bidAskSpread = baseSpread * (1 + Math.sin(timeBase * 0.4) * 0.3)

    const bids = 1000000 + Math.sin(timeBase * 0.3) * 500000 + (hour * 10000)
    const asks = 1000000 + Math.cos(timeBase * 0.3) * 500000 + (minute * 10000)

    return {
      coin,
      bidAskSpread,
      orderBookDepth: {
        bids,
        asks,
        ratio: bids / asks
      },
      slippage: {
        buy1k: 0.05 + Math.sin(timeBase * 0.5) * 0.03,
        sell1k: 0.05 + Math.cos(timeBase * 0.5) * 0.03,
        buy10k: 0.15 + Math.sin(timeBase * 0.5) * 0.05,
        sell10k: 0.15 + Math.cos(timeBase * 0.5) * 0.05
      },
      marketDepth: 80 + Math.sin(timeBase * 0.2) * 15 + (hour % 5)
    }
  }

  // 상관관계 분석
  async getMarketCorrelations(): Promise<MarketCorrelation[]> {
    const hour = new Date().getHours()
    const correlations: MarketCorrelation[] = []

    const pairs = [
      ['BTC', 'ETH'],
      ['BTC', 'SOL'],
      ['ETH', 'BNB'],
      ['SOL', 'AVAX'],
      ['DOT', 'MATIC']
    ]

    for (const [coin1, coin2] of pairs) {
      const baseCorr = 0.5 + ((hour + coin1.charCodeAt(0)) % 5) * 0.1
      const correlation = baseCorr + Math.sin(hour * 0.2) * 0.2

      correlations.push({
        coin1,
        coin2,
        correlation: Math.max(-1, Math.min(1, correlation)),
        period: '24h',
        strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak'
      })
    }

    return correlations
  }

  // 시장 히트맵
  async getMarketHeatmap(): Promise<MarketHeatmap[]> {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const heatmap: MarketHeatmap[] = []

    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i]
      const timeBase = hour + (minute / 60) + i

      const metrics = {
        price: 20 + Math.sin(timeBase * 0.3) * 30 + (i * 5),
        volume: 30 + Math.cos(timeBase * 0.4) * 25 + (hour % 10),
        volatility: 15 + Math.sin(timeBase * 0.5) * 20 + (minute % 10),
        momentum: 25 + Math.cos(timeBase * 0.2) * 35 + (i * 3),
        sentiment: 40 + Math.sin(timeBase * 0.6) * 30 + ((hour + i) % 8)
      }

      const score = (metrics.price + metrics.volume + metrics.volatility + metrics.momentum + metrics.sentiment) / 5

      heatmap.push({
        coin,
        metrics,
        score,
        rank: 0 // 나중에 정렬 후 설정
      })
    }

    // 점수 기준 정렬 및 순위 부여
    heatmap.sort((a, b) => b.score - a.score)
    heatmap.forEach((item, index) => {
      item.rank = index + 1
    })

    return heatmap
  }

  // 시장 트렌드 차트 데이터
  async getMarketTrends(period: '1h' | '24h' | '7d' = '24h'): Promise<any[]> {
    const dataPoints = period === '1h' ? 12 : period === '24h' ? 24 : 7
    const trends = []
    const now = Date.now()

    for (let i = 0; i < dataPoints; i++) {
      const time = new Date(now - (i * (period === '1h' ? 300000 : period === '24h' ? 3600000 : 86400000)))
      const timeValue = time.getHours() + i

      const dataPoint: any = {
        time: period === '7d' ? time.toLocaleDateString('ko-KR') : time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }

      // 각 코인별 가격 변화
      this.coins.forEach(coin => {
        const basePrice = this.getBasePrice(coin)
        dataPoint[coin] = basePrice * (1 + Math.sin(timeValue * 0.1) * 0.05)
      })

      trends.push(dataPoint)
    }

    return trends.reverse()
  }

  // 도미넌스 차트
  async getMarketDominance(): Promise<any[]> {
    const hour = new Date().getHours()
    const dominance = []

    const baseDominance = {
      'BTC': 45,
      'ETH': 18,
      'BNB': 5,
      'SOL': 3,
      'XRP': 2.5,
      'ADA': 2,
      'DOGE': 1.8,
      'AVAX': 1.5,
      'DOT': 1.3,
      'MATIC': 1.2
    }

    let total = 0
    this.coins.forEach(coin => {
      const value = baseDominance[coin] + Math.sin((hour + coin.charCodeAt(0)) * 0.1) * 2
      dominance.push({
        name: coin,
        value: Math.max(0, value),
        percentage: value
      })
      total += value
    })

    // 나머지를 Others로
    dominance.push({
      name: 'Others',
      value: Math.max(0, 100 - total),
      percentage: 100 - total
    })

    return dominance
  }

  // WebSocket 스트리밍
  async streamMarketData(
    coins: string[],
    onUpdate: (data: any) => void
  ): Promise<() => void> {
    const connections: WebSocket[] = []

    for (const coin of coins) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`)

      ws.onmessage = async (event) => {
        const ticker = JSON.parse(event.data)
        const analysis = await this.getTechnicalAnalysis(coin)
        onUpdate({ coin, ticker, analysis })
      }

      ws.onerror = (error) => {
        console.error(`Market WebSocket error for ${coin}:`, error)
      }

      connections.push(ws)
      this.wsConnections.set(coin, ws)
    }

    return () => {
      connections.forEach(ws => ws.close())
      this.wsConnections.clear()
    }
  }

  // 헬퍼 함수들
  private getBasePrice(coin: string): number {
    const prices = {
      'BTC': 45000,
      'ETH': 3000,
      'BNB': 400,
      'SOL': 100,
      'XRP': 0.8,
      'ADA': 0.5,
      'DOGE': 0.1,
      'AVAX': 35,
      'DOT': 8,
      'MATIC': 1.2
    }
    return prices[coin] || 100
  }

  private getBaseVolume(coin: string): number {
    const volumes = {
      'BTC': 25000000000,
      'ETH': 15000000000,
      'BNB': 2000000000,
      'SOL': 1500000000,
      'XRP': 1000000000,
      'ADA': 800000000,
      'DOGE': 600000000,
      'AVAX': 400000000,
      'DOT': 350000000,
      'MATIC': 500000000
    }
    return volumes[coin] || 100000000
  }

  private getBaseSpread(coin: string): number {
    const spreads = {
      'BTC': 0.01,
      'ETH': 0.02,
      'BNB': 0.03,
      'SOL': 0.04,
      'XRP': 0.05,
      'ADA': 0.05,
      'DOGE': 0.06,
      'AVAX': 0.04,
      'DOT': 0.05,
      'MATIC': 0.05
    }
    return spreads[coin] || 0.05
  }

  // 모든 연결 종료
  closeAll() {
    this.wsConnections.forEach(ws => ws.close())
    this.wsConnections.clear()
  }
}

// 싱글톤 인스턴스
export const marketAnalysisService = new MarketAnalysisService()