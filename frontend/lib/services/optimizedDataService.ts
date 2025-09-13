/**
 * 최적화된 데이터 서비스
 * Binance WebSocket + 스마트 캐싱 + Rate Limiting
 */

import NodeCache from 'node-cache'

// 메모리 캐시 (TTL 30초)
const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 })

// Rate Limiter
class RateLimiter {
  private requests: number[] = []
  private limit: number
  private window: number

  constructor(limit: number = 10, windowMs: number = 1000) {
    this.limit = limit
    this.window = windowMs
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(t => now - t < this.window)
    
    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0]
      const waitTime = this.window - (now - oldestRequest) + 10
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.requests.push(now)
  }
}

// WebSocket 연결 풀
class WebSocketPool {
  private connections: Map<string, WebSocket> = new Map()
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map()

  subscribe(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@ticker`
    
    // 구독자 추가
    if (!this.subscribers.has(stream)) {
      this.subscribers.set(stream, new Set())
    }
    this.subscribers.get(stream)!.add(callback)
    
    // 연결이 없으면 생성
    if (!this.connections.has(stream)) {
      this.connect(stream)
    }
  }

  private connect(stream: string) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`)
    
    ws.onopen = () => {
      // 재연결 타이머 제거
      if (this.reconnectTimers.has(stream)) {
        clearTimeout(this.reconnectTimers.get(stream)!)
        this.reconnectTimers.delete(stream)
      }
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const callbacks = this.subscribers.get(stream) || new Set()
      callbacks.forEach(cb => cb(data))
      
      // 캐시 업데이트
      const symbol = stream.split('@')[0].toUpperCase()
      cache.set(`price_${symbol}`, {
        price: parseFloat(data.c),
        change24h: parseFloat(data.P),
        volume24h: parseFloat(data.v),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        timestamp: Date.now()
      })
    }
    
    ws.onerror = () => {
      console.error(`WebSocket error: ${stream}`)
      this.scheduleReconnect(stream)
    }
    
    ws.onclose = () => {
      this.connections.delete(stream)
      this.scheduleReconnect(stream)
    }
    
    this.connections.set(stream, ws)
  }

  private scheduleReconnect(stream: string) {
    // 이미 재연결 예정이면 스킵
    if (this.reconnectTimers.has(stream)) return
    
    const timer = setTimeout(() => {
      if (this.subscribers.get(stream)?.size > 0) {
        this.connect(stream)
      }
      this.reconnectTimers.delete(stream)
    }, 5000)
    
    this.reconnectTimers.set(stream, timer)
  }

  unsubscribe(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@ticker`
    this.subscribers.get(stream)?.delete(callback)
    
    // 구독자가 없으면 연결 종료
    if (this.subscribers.get(stream)?.size === 0) {
      this.connections.get(stream)?.close()
      this.connections.delete(stream)
      this.subscribers.delete(stream)
    }
  }
}

// API 호출 최적화
class BinanceAPI {
  private rateLimiter = new RateLimiter(10, 1000) // 초당 10 요청
  private baseUrl = 'https://api.binance.com/api/v3'

  async getPrice(symbol: string): Promise<any> {
    // 캐시 확인
    const cached = cache.get(`price_${symbol}`)
    if (cached) return cached
    
    // Rate limiting
    await this.rateLimiter.waitIfNeeded()
    
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`)
      const data = await response.json()
      
      const result = {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        timestamp: Date.now()
      }
      
      // 캐시 저장
      cache.set(`price_${symbol}`, result)
      return result
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error)
      return null
    }
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<any> {
    const cacheKey = `orderbook_${symbol}_${limit}`
    const cached = cache.get(cacheKey)
    if (cached) return cached
    
    await this.rateLimiter.waitIfNeeded()
    
    try {
      const response = await fetch(`${this.baseUrl}/depth?symbol=${symbol}&limit=${limit}`)
      const data = await response.json()
      
      cache.set(cacheKey, data, 10) // 10초 캐싱
      return data
    } catch (error) {
      console.error(`Failed to fetch orderbook for ${symbol}:`, error)
      return null
    }
  }

  async getKlines(symbol: string, interval: string = '1m', limit: number = 100): Promise<any> {
    const cacheKey = `klines_${symbol}_${interval}_${limit}`
    const cached = cache.get(cacheKey)
    if (cached) return cached
    
    await this.rateLimiter.waitIfNeeded()
    
    try {
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )
      const data = await response.json()
      
      cache.set(cacheKey, data, 60) // 1분 캐싱
      return data
    } catch (error) {
      console.error(`Failed to fetch klines for ${symbol}:`, error)
      return null
    }
  }
}

// 뉴스/소셜 데이터 (CryptoCompare Free - 하루 10회만)
class SocialDataService {
  private rateLimiter = new RateLimiter(1, 10000) // 10초에 1회
  private apiKey = process.env.CRYPTOCOMPARE_API_KEY || ''
  
  async getNews(): Promise<any> {
    const cached = cache.get('news')
    if (cached) return cached
    
    await this.rateLimiter.waitIfNeeded()
    
    try {
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${this.apiKey}`
      )
      const data = await response.json()
      
      cache.set('news', data.Data, 3600) // 1시간 캐싱
      return data.Data
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return []
    }
  }
  
  async getFearGreedIndex(): Promise<any> {
    const cached = cache.get('feargreed')
    if (cached) return cached
    
    try {
      const response = await fetch('https://api.alternative.me/fng/')
      const data = await response.json()
      
      cache.set('feargreed', data.data[0], 3600) // 1시간 캐싱
      return data.data[0]
    } catch (error) {
      console.error('Failed to fetch fear greed index:', error)
      return null
    }
  }
}

// 통합 서비스
export class OptimizedDataService {
  private wsPool = new WebSocketPool()
  private api = new BinanceAPI()
  private social = new SocialDataService()
  
  // WebSocket 실시간 구독
  subscribeToPrice(symbol: string, callback: (data: any) => void) {
    this.wsPool.subscribe(symbol, callback)
  }
  
  unsubscribeFromPrice(symbol: string, callback: (data: any) => void) {
    this.wsPool.unsubscribe(symbol, callback)
  }
  
  // API 호출 (캐싱 + Rate Limiting)
  async getPrice(symbol: string) {
    return this.api.getPrice(symbol)
  }
  
  async getOrderBook(symbol: string, limit?: number) {
    return this.api.getOrderBook(symbol, limit)
  }
  
  async getKlines(symbol: string, interval?: string, limit?: number) {
    return this.api.getKlines(symbol, interval, limit)
  }
  
  // 뉴스/소셜
  async getNews() {
    return this.social.getNews()
  }
  
  async getFearGreedIndex() {
    return this.social.getFearGreedIndex()
  }
  
  // 캐시 통계
  getCacheStats() {
    return {
      keys: cache.keys(),
      stats: cache.getStats()
    }
  }
}

// 싱글톤 인스턴스
export const dataService = new OptimizedDataService()

/**
 * 사용 예시:
 * 
 * // WebSocket 실시간 구독
 * dataService.subscribeToPrice('BTCUSDT', (data) => {
 *   * })
 * 
 * // API 호출 (자동 캐싱)
 * const price = await dataService.getPrice('BTCUSDT')
 * const orderbook = await dataService.getOrderBook('BTCUSDT')
 * 
 * // 뉴스 (하루 10회만)
 * const news = await dataService.getNews()
 */