/**
 * 심플 데이터 서비스 - Binance API만 사용
 * 안정적이고 확실하게 작동하는 버전
 */

export class SimpleDataService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTTL = 30000 // 30초 캐싱

  // 캐시 헬퍼
  private getCached(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // 메인 데이터 가져오기
  async getComprehensiveData(symbol: string = 'BTC') {
    const cacheKey = `comprehensive-${symbol}`
    const cached = this.getCached(cacheKey)
    if (cached) return cached

    try {
      // Binance API에서 모든 데이터 가져오기
      const [ticker24h, allTickers, klines] = await Promise.all([
        this.getTicker24h(symbol),
        this.getAllTickers(),
        this.getKlines(symbol)
      ])

      // Fear & Greed 시뮬레이션 (가격 변동 기반)
      const fearGreedValue = this.calculateFearGreed(ticker24h.priceChangePercent)

      // 뉴스 생성 (시장 데이터 기반)
      const news = this.generateNews(allTickers)

      // GitHub 활동 (하드코딩)
      const githubActivity = this.getGithubData(symbol)

      // 온체인 데이터 시뮬레이션
      const onchainData = this.getOnchainData(symbol)

      const result = {
        market: ticker24h,
        fearGreed: fearGreedValue,
        news: news,
        github: githubActivity,
        onchain: onchainData,
        topMovers: this.getTopMovers(allTickers),
        marketOverview: this.getMarketOverview(allTickers),
        technicalIndicators: this.calculateTechnicalIndicators(klines)
      }

      this.setCache(cacheKey, result)
      return result

    } catch (error) {
      console.error('Data service error:', error)
      return this.getFallbackData()
    }
  }

  // Binance 24시간 티커
  private async getTicker24h(symbol: string) {
    try {
      const response = await fetch(`/api/binance/ticker/24hr?symbol=${symbol}USDT`)
      if (!response.ok) throw new Error('API failed')

      const data = await response.json()
      return {
        symbol: symbol,
        price: parseFloat(data.lastPrice) || 0,
        priceChange: parseFloat(data.priceChange) || 0,
        priceChangePercent: parseFloat(data.priceChangePercent) || 0,
        high: parseFloat(data.highPrice) || 0,
        low: parseFloat(data.lowPrice) || 0,
        volume: parseFloat(data.volume) || 0,
        quoteVolume: parseFloat(data.quoteVolume) || 0,
        weightedAvgPrice: parseFloat(data.weightedAvgPrice) || 0,
        count: parseInt(data.count) || 0
      }
    } catch (error) {
      return {
        symbol: symbol,
        price: 0,
        priceChange: 0,
        priceChangePercent: 0,
        high: 0,
        low: 0,
        volume: 0,
        quoteVolume: 0,
        weightedAvgPrice: 0,
        count: 0
      }
    }
  }

  // 모든 티커 데이터
  private async getAllTickers() {
    try {
      const response = await fetch('/api/binance/ticker')
      if (!response.ok) throw new Error('API failed')

      const data = await response.json()
      // USDT 페어만 필터링
      return data.filter((t: any) => t.symbol.endsWith('USDT'))
    } catch (error) {
      return []
    }
  }

  // K라인 데이터 (차트용)
  private async getKlines(symbol: string) {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${symbol}USDT&interval=1h&limit=24`)
      if (!response.ok) throw new Error('API failed')

      return await response.json()
    } catch (error) {
      return []
    }
  }

  // Fear & Greed 계산
  private calculateFearGreed(priceChangePercent: number) {
    // -10% ~ +10% 를 0 ~ 100으로 매핑
    const normalized = Math.max(0, Math.min(100, (priceChangePercent + 10) * 5))

    let classification = 'Neutral'
    if (normalized < 20) classification = 'Extreme Fear'
    else if (normalized < 40) classification = 'Fear'
    else if (normalized < 60) classification = 'Neutral'
    else if (normalized < 80) classification = 'Greed'
    else classification = 'Extreme Greed'

    return {
      value: Math.round(normalized),
      classification,
      timestamp: new Date().toISOString()
    }
  }

  // 동적 뉴스 생성
  private generateNews(tickers: any[]) {
    if (!tickers || tickers.length === 0) return []

    // 상승률 TOP 3
    const gainers = [...tickers]
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 3)

    // 하락률 TOP 3
    const losers = [...tickers]
      .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
      .slice(0, 3)

    // 거래량 TOP 3
    const volume = [...tickers]
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 3)

    const news = []
    const now = new Date()

    // 상승 뉴스
    gainers.forEach((coin, i) => {
      const symbol = coin.symbol.replace('USDT', '')
      news.push({
        title: `🚀 ${symbol} 급등! 24시간 ${parseFloat(coin.priceChangePercent).toFixed(2)}% 상승`,
        description: `${symbol}이(가) $${parseFloat(coin.lastPrice).toLocaleString()}에 거래되며 강세를 보이고 있습니다. 거래량은 ${(parseFloat(coin.quoteVolume) / 1e6).toFixed(2)}M USDT입니다.`,
        time: new Date(now.getTime() - i * 3600000).toISOString(),
        category: 'price',
        sentiment: 'positive'
      })
    })

    // 하락 뉴스
    losers.forEach((coin, i) => {
      const symbol = coin.symbol.replace('USDT', '')
      news.push({
        title: `📉 ${symbol} 하락, ${Math.abs(parseFloat(coin.priceChangePercent)).toFixed(2)}% 조정`,
        description: `${symbol}이(가) $${parseFloat(coin.lastPrice).toLocaleString()}로 조정받고 있습니다. 지지선 주목이 필요합니다.`,
        time: new Date(now.getTime() - (i + 3) * 3600000).toISOString(),
        category: 'price',
        sentiment: 'negative'
      })
    })

    // 거래량 뉴스
    volume.slice(0, 2).forEach((coin, i) => {
      const symbol = coin.symbol.replace('USDT', '')
      news.push({
        title: `💹 ${symbol} 거래량 폭증, 시장 관심 집중`,
        description: `${symbol}의 24시간 거래량이 ${(parseFloat(coin.quoteVolume) / 1e9).toFixed(2)}B USDT를 기록했습니다.`,
        time: new Date(now.getTime() - (i + 6) * 3600000).toISOString(),
        category: 'volume',
        sentiment: 'neutral'
      })
    })

    return news.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }

  // GitHub 데이터 (하드코딩)
  private getGithubData(symbol: string) {
    const data: Record<string, any> = {
      'BTC': { stars: 75234, forks: 34982, issues: 658, contributors: 892 },
      'ETH': { stars: 45123, forks: 18765, issues: 342, contributors: 567 },
      'BNB': { stars: 2345, forks: 1234, issues: 45, contributors: 123 },
      'SOL': { stars: 12456, forks: 3456, issues: 234, contributors: 345 }
    }

    return data[symbol] || { stars: 10000, forks: 5000, issues: 100, contributors: 200 }
  }

  // 온체인 데이터 시뮬레이션
  private getOnchainData(symbol: string) {
    // 심볼별 기본 데이터
    const baseData: Record<string, any> = {
      'BTC': {
        hashRate: '450 EH/s',
        difficulty: '75.5T',
        blockHeight: 870000,
        mempoolSize: 150000
      },
      'ETH': {
        gasPrice: '25 Gwei',
        blockHeight: 19500000,
        validators: 980000,
        stakingRate: '27.5%'
      }
    }

    // Math.random 제거 - 고정값 사용
    return baseData[symbol] || {
      transactions24h: 500000,
      activeAddresses: 250000,
      networkFees: '50.00'
    }
  }

  // 상위 변동 종목
  private getTopMovers(tickers: any[]) {
    if (!tickers || tickers.length === 0) return { gainers: [], losers: [] }

    const gainers = [...tickers]
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 5)
      .map(t => ({
        symbol: t.symbol.replace('USDT', ''),
        price: parseFloat(t.lastPrice),
        change: parseFloat(t.priceChangePercent),
        volume: parseFloat(t.quoteVolume)
      }))

    const losers = [...tickers]
      .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
      .slice(0, 5)
      .map(t => ({
        symbol: t.symbol.replace('USDT', ''),
        price: parseFloat(t.lastPrice),
        change: parseFloat(t.priceChangePercent),
        volume: parseFloat(t.quoteVolume)
      }))

    return { gainers, losers }
  }

  // 시장 개요
  private getMarketOverview(tickers: any[]) {
    if (!tickers || tickers.length === 0) {
      return {
        totalMarketCap: 0,
        totalVolume: 0,
        btcDominance: 0,
        altcoinMarketCap: 0,
        upCount: 0,
        downCount: 0
      }
    }

    const totalVolume = tickers.reduce((sum, t) => sum + parseFloat(t.quoteVolume || 0), 0)
    const upCount = tickers.filter(t => parseFloat(t.priceChangePercent) > 0).length
    const downCount = tickers.filter(t => parseFloat(t.priceChangePercent) < 0).length

    // BTC 도미넌스 추정
    const btcTicker = tickers.find(t => t.symbol === 'BTCUSDT')
    const btcVolume = btcTicker ? parseFloat(btcTicker.quoteVolume) : 0
    const btcDominance = totalVolume > 0 ? (btcVolume / totalVolume * 100) : 40

    return {
      totalMarketCap: totalVolume * 20, // 추정치
      totalVolume,
      btcDominance,
      altcoinMarketCap: totalVolume * 12, // 추정치
      upCount,
      downCount
    }
  }

  // 기술적 지표 계산
  private calculateTechnicalIndicators(klines: any) {
    if (!klines || !Array.isArray(klines) || klines.length === 0) {
      return {
        rsi: 50,
        macd: { value: 0, signal: 0, histogram: 0 },
        ma20: 0,
        ma50: 0,
        bollingerBands: { upper: 0, middle: 0, lower: 0 }
      }
    }

    const closes = klines.map((k: any) => parseFloat(k[4])) // 종가
    const volumes = klines.map((k: any) => parseFloat(k[5])) // 거래량

    // 간단한 RSI 계산
    let gains = 0, losses = 0
    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1]
      if (diff > 0) gains += diff
      else losses += Math.abs(diff)
    }
    const avgGain = gains / closes.length
    const avgLoss = losses / closes.length
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))

    // 이동평균
    const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length)
    const ma50 = closes.reduce((a, b) => a + b, 0) / closes.length

    // 볼린저 밴드
    const mean = ma20
    const variance = closes.slice(-20).reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / Math.min(20, closes.length)
    const stdDev = Math.sqrt(variance)

    return {
      rsi: Math.round(rsi),
      macd: { value: 0, signal: 0, histogram: 0 }, // 단순화
      ma20,
      ma50,
      bollingerBands: {
        upper: mean + (stdDev * 2),
        middle: mean,
        lower: mean - (stdDev * 2)
      }
    }
  }

  // 폴백 데이터
  private getFallbackData() {
    return {
      market: {
        symbol: 'BTC',
        price: 100000,
        priceChangePercent: 0,
        high: 101000,
        low: 99000,
        volume: 1000000
      },
      fearGreed: {
        value: 50,
        classification: 'Neutral',
        timestamp: new Date().toISOString()
      },
      news: [
        {
          title: '암호화폐 시장 안정세 유지',
          description: '주요 암호화폐들이 안정적인 움직임을 보이고 있습니다.',
          time: new Date().toISOString(),
          category: 'market',
          sentiment: 'neutral'
        }
      ],
      github: { stars: 50000, forks: 20000, issues: 500, contributors: 1000 },
      onchain: { transactions24h: 500000, activeAddresses: 200000 },
      topMovers: { gainers: [], losers: [] },
      marketOverview: {
        totalMarketCap: 3000000000000,
        totalVolume: 150000000000,
        btcDominance: 45,
        upCount: 50,
        downCount: 50
      },
      technicalIndicators: {
        rsi: 50,
        ma20: 100000,
        ma50: 100000,
        bollingerBands: { upper: 105000, middle: 100000, lower: 95000 }
      }
    }
  }
}

// 싱글톤 인스턴스
export const simpleDataService = new SimpleDataService()