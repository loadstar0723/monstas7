/**
 * 하이브리드 데이터 서비스
 * Polygon.io (메인) + CoinDesk (뉴스/소셜) 조합
 */

interface MarketDataService {
  // Polygon.io - 무제한 실시간 데이터
  getPrice(symbol: string): Promise<number>
  getOrderBook(symbol: string): Promise<any>
  getOHLCV(symbol: string): Promise<any[]>
  getTrades(symbol: string): Promise<any[]>
  subscribeWebSocket(symbol: string, callback: Function): void
}

interface SocialDataService {
  // CoinDesk Free - 뉴스/소셜 (10,000 calls/월)
  getNews(symbol?: string): Promise<any[]>
  getSocialStats(symbol: string): Promise<any>
  getSentiment(symbol: string): Promise<any>
  getTrending(): Promise<any[]>
}

export class HybridDataService {
  private polygonKey: string
  private coindeskKey: string
  
  constructor() {
    this.polygonKey = process.env.POLYGON_API_KEY || ''
    this.coindeskKey = process.env.COINDESK_API_KEY || '' // Free tier
  }
  
  // ===== Polygon.io 무제한 호출 =====
  
  async getRealtimePrice(symbol: string): Promise<any> {
    const ticker = this.convertToPolygonSymbol(symbol)
    const url = `https://api.polygon.io/v2/last/crypto/${ticker}?apiKey=${this.polygonKey}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    return {
      symbol,
      price: data.last.price,
      volume: data.last.size,
      timestamp: data.last.timestamp
    }
  }
  
  async getOrderBook(symbol: string): Promise<any> {
    const ticker = this.convertToPolygonSymbol(symbol)
    const url = `https://api.polygon.io/v2/snapshot/level2/${ticker}/book?apiKey=${this.polygonKey}`
    
    const response = await fetch(url)
    return response.json()
  }
  
  async getHistoricalData(symbol: string, from: string, to: string): Promise<any> {
    const ticker = this.convertToPolygonSymbol(symbol)
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/${from}/${to}?apiKey=${this.polygonKey}`
    
    const response = await fetch(url)
    return response.json()
  }
  
  // WebSocket 실시간 스트리밍
  connectWebSocket(symbols: string[]): WebSocket {
    const ws = new WebSocket('wss://socket.polygon.io/crypto')
    
    ws.onopen = () => {
      // 인증
      ws.send(JSON.stringify({
        action: 'auth',
        params: this.polygonKey
      }))
      
      // 구독
      const tickers = symbols.map(s => this.convertToPolygonSymbol(s))
      ws.send(JSON.stringify({
        action: 'subscribe',
        params: tickers.join(',')
      }))
    }
    
    return ws
  }
  
  // ===== CoinDesk Free 뉴스/소셜 (캐싱 필수) =====
  
  private newsCache = new Map<string, { data: any, timestamp: number }>()
  private CACHE_TTL = 30 * 60 * 1000 // 30분 캐싱
  
  async getNews(category: string = 'all'): Promise<any[]> {
    // 캐시 확인
    const cached = this.newsCache.get(category)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    
    const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${this.coindeskKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      // 캐시 저장
      this.newsCache.set(category, {
        data: data.Data,
        timestamp: Date.now()
      })
      
      return data.Data
    } catch (error) {
      console.error('News fetch failed:', error)
      return []
    }
  }
  
  async getSocialStats(symbol: string): Promise<any> {
    // CoinDesk social stats (캐싱 적용)
    const coinId = this.symbolToCoinId(symbol)
    const url = `https://min-api.cryptocompare.com/data/social/coin/latest?coinId=${coinId}&api_key=${this.coindeskKey}`
    
    const response = await fetch(url)
    return response.json()
  }
  
  async getSentiment(symbol: string): Promise<any> {
    // 뉴스 기반 센티먼트 분석
    const news = await this.getNews()
    const relatedNews = news.filter(n => 
      n.title.toLowerCase().includes(symbol.toLowerCase()) ||
      n.body.toLowerCase().includes(symbol.toLowerCase())
    )
    
    // 간단한 센티먼트 계산
    let positive = 0
    let negative = 0
    let neutral = 0
    
    const positiveWords = ['bullish', 'surge', 'rally', 'gain', 'up', 'high', 'moon']
    const negativeWords = ['bearish', 'crash', 'drop', 'fall', 'down', 'low', 'dump']
    
    relatedNews.forEach(article => {
      const text = (article.title + ' ' + article.body).toLowerCase()
      const posCount = positiveWords.filter(w => text.includes(w)).length
      const negCount = negativeWords.filter(w => text.includes(w)).length
      
      if (posCount > negCount) positive++
      else if (negCount > posCount) negative++
      else neutral++
    })
    
    const total = positive + negative + neutral
    
    return {
      symbol,
      sentiment: {
        positive: total > 0 ? (positive / total) * 100 : 0,
        negative: total > 0 ? (negative / total) * 100 : 0,
        neutral: total > 0 ? (neutral / total) * 100 : 0
      },
      newsCount: total,
      lastUpdate: new Date()
    }
  }
  
  // ===== 무료 보조 서비스 =====
  
  async getFearGreedIndex(): Promise<any> {
    // Alternative.me 무료 API
    const response = await fetch('https://api.alternative.me/fng/')
    return response.json()
  }
  
  async getOnChainData(address: string): Promise<any> {
    // Etherscan 무료 API
    const etherscanKey = process.env.ETHERSCAN_API_KEY || ''
    const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=${etherscanKey}`
    
    const response = await fetch(url)
    return response.json()
  }
  
  // ===== 헬퍼 함수 =====
  
  private convertToPolygonSymbol(symbol: string): string {
    // BTCUSDT -> X:BTCUSD
    const base = symbol.replace('USDT', '').replace('BUSD', '')
    return `X:${base}USD`
  }
  
  private symbolToCoinId(symbol: string): number {
    // CoinDesk coin ID 매핑
    const mapping: Record<string, number> = {
      'BTC': 1182,
      'ETH': 7605,
      'BNB': 187805,
      // ... 더 추가
    }
    return mapping[symbol.replace('USDT', '')] || 1182
  }
}

// 싱글톤 인스턴스
export const dataService = new HybridDataService()

// 사용 예시
/*
// 가격 데이터 (Polygon.io - 무제한)
const price = await dataService.getRealtimePrice('BTCUSDT')
const orderbook = await dataService.getOrderBook('BTCUSDT')

// 뉴스/소셜 (CoinDesk - 캐싱)
const news = await dataService.getNews()
const sentiment = await dataService.getSentiment('BTC')

// WebSocket 실시간
const ws = dataService.connectWebSocket(['BTCUSDT', 'ETHUSDT'])
ws.onmessage = (event) => {
  )
}
*/