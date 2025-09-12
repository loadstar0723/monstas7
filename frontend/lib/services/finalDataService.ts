/**
 * 최종 데이터 서비스 아키텍처
 * Binance WebSocket (실시간) + CryptoCompare Free (뉴스/소셜)
 * 
 * 월 비용: $0 (완전 무료)
 * API 한도: CryptoCompare 100,000/월 (충분)
 */

import NodeCache from 'node-cache'

// 메모리 캐시
const priceCache = new NodeCache({ stdTTL: 30 })    // 가격: 30초
const newsCache = new NodeCache({ stdTTL: 3600 })   // 뉴스: 1시간
const socialCache = new NodeCache({ stdTTL: 1800 }) // 소셜: 30분

/**
 * 1. Binance WebSocket - 실시간 가격 (무료, 무제한)
 */
export class BinanceRealtimeService {
  private connections = new Map<string, WebSocket>()
  private subscribers = new Map<string, Set<(data: any) => void>>()

  subscribe(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@ticker`
    
    if (!this.subscribers.has(stream)) {
      this.subscribers.set(stream, new Set())
      this.connect(stream)
    }
    
    this.subscribers.get(stream)!.add(callback)
  }

  private connect(stream: string) {
    if (this.connections.has(stream)) return
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const callbacks = this.subscribers.get(stream) || new Set()
      
      // 모든 구독자에게 전달
      callbacks.forEach(cb => cb({
        symbol: stream.split('@')[0].toUpperCase(),
        price: parseFloat(data.c),
        change24h: parseFloat(data.P),
        volume24h: parseFloat(data.v),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        timestamp: Date.now()
      }))
      
      // 캐시 업데이트
      const symbol = stream.split('@')[0].toUpperCase()
      priceCache.set(symbol, {
        price: parseFloat(data.c),
        change24h: parseFloat(data.P),
        volume24h: parseFloat(data.v)
      })
    }
    
    ws.onerror = () => {
      console.error(`WebSocket error: ${stream}`)
      setTimeout(() => {
        this.connections.delete(stream)
        if (this.subscribers.get(stream)?.size > 0) {
          this.connect(stream)
        }
      }, 5000)
    }
    
    ws.onclose = () => {
      this.connections.delete(stream)
    }
    
    this.connections.set(stream, ws)
  }

  unsubscribe(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@ticker`
    this.subscribers.get(stream)?.delete(callback)
    
    if (this.subscribers.get(stream)?.size === 0) {
      this.connections.get(stream)?.close()
      this.connections.delete(stream)
      this.subscribers.delete(stream)
    }
  }

  // 캐시된 가격 즉시 반환
  getCachedPrice(symbol: string) {
    return priceCache.get(symbol)
  }
}

/**
 * 2. CryptoCompare Free - 뉴스/소셜 (월 100,000 호출)
 */
export class CryptoCompareService {
  private apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || ''
  private baseUrl = 'https://min-api.cryptocompare.com'
  private callCount = 0
  private monthlyLimit = 100000

  // 뉴스 데이터 (캐시 1시간)
  async getNews(categories: string[] = []): Promise<any[]> {
    const cacheKey = `news_${categories.join('_')}`
    const cached = newsCache.get(cacheKey)
    if (cached) return cached as any[]
    
    if (this.callCount >= this.monthlyLimit) {
      console.warn('CryptoCompare 월 한도 도달')
      return []
    }
    
    try {
      const params = new URLSearchParams({
        lang: 'EN',
        api_key: this.apiKey
      })
      
      if (categories.length > 0) {
        params.append('categories', categories.join(','))
      }
      
      const response = await fetch(`${this.baseUrl}/data/v2/news/?${params}`)
      const data = await response.json()
      
      this.callCount++
      newsCache.set(cacheKey, data.Data || [])
      
      return data.Data || []
    } catch (error) {
      console.error('뉴스 로드 실패:', error)
      return []
    }
  }

  // 소셜 통계 (캐시 30분)
  async getSocialStats(coinId: string): Promise<any> {
    const cacheKey = `social_${coinId}`
    const cached = socialCache.get(cacheKey)
    if (cached) return cached
    
    if (this.callCount >= this.monthlyLimit) {
      console.warn('CryptoCompare 월 한도 도달')
      return null
    }
    
    try {
      const response = await fetch(
        `${this.baseUrl}/data/social/coin/latest?coinId=${coinId}&api_key=${this.apiKey}`
      )
      const data = await response.json()
      
      this.callCount++
      socialCache.set(cacheKey, data.Data)
      
      return data.Data
    } catch (error) {
      console.error('소셜 데이터 로드 실패:', error)
      return null
    }
  }

  // 공포 탐욕 지수 (Alternative.me 무료)
  async getFearGreedIndex(): Promise<any> {
    const cached = socialCache.get('feargreed')
    if (cached) return cached
    
    try {
      const response = await fetch('https://api.alternative.me/fng/')
      const data = await response.json()
      
      socialCache.set('feargreed', data.data[0], 3600) // 1시간 캐싱
      return data.data[0]
    } catch (error) {
      console.error('Fear & Greed 로드 실패:', error)
      return null
    }
  }

  // 월 사용량 확인
  getUsageStats() {
    return {
      used: this.callCount,
      limit: this.monthlyLimit,
      remaining: this.monthlyLimit - this.callCount,
      percentage: (this.callCount / this.monthlyLimit) * 100
    }
  }
}

/**
 * 3. 통합 데이터 서비스
 */
export class FinalDataService {
  private binance = new BinanceRealtimeService()
  private cryptoCompare = new CryptoCompareService()

  // === 실시간 가격 (Binance WebSocket) ===
  
  subscribeToPrice(symbol: string, callback: (data: any) => void) {
    this.binance.subscribe(symbol, callback)
  }
  
  unsubscribeFromPrice(symbol: string, callback: (data: any) => void) {
    this.binance.unsubscribe(symbol, callback)
  }
  
  getPrice(symbol: string) {
    return this.binance.getCachedPrice(symbol)
  }

  // === 뉴스/소셜 (CryptoCompare) ===
  
  async getNews(categories?: string[]) {
    return this.cryptoCompare.getNews(categories)
  }
  
  async getSocialStats(symbol: string) {
    const coinIdMap: Record<string, string> = {
      'BTC': '1182',
      'ETH': '7605',
      'BNB': '187805',
      'SOL': '251992',
      'XRP': '5031',
      'ADA': '321992',
      'DOGE': '74676',
      'AVAX': '361247'
    }
    
    const coinId = coinIdMap[symbol.replace('USDT', '')] || '1182'
    return this.cryptoCompare.getSocialStats(coinId)
  }
  
  async getFearGreedIndex() {
    return this.cryptoCompare.getFearGreedIndex()
  }

  // === 사용량 통계 ===
  
  getStats() {
    return {
      cryptoCompare: this.cryptoCompare.getUsageStats(),
      cache: {
        price: priceCache.getStats(),
        news: newsCache.getStats(),
        social: socialCache.getStats()
      }
    }
  }
}

// 싱글톤 인스턴스
export const dataService = new FinalDataService()

/**
 * 사용 예시:
 * 
 * // 1. 실시간 가격 (Binance WebSocket - 무료)
 * dataService.subscribeToPrice('BTCUSDT', (data) => {
 *   console.log('BTC 가격:', data.price)
 * })
 * 
 * // 2. 뉴스 (CryptoCompare - 캐싱)
 * const news = await dataService.getNews(['BTC', 'Analysis'])
 * 
 * // 3. 소셜 데이터 (CryptoCompare - 캐싱)
 * const social = await dataService.getSocialStats('BTC')
 * 
 * // 4. 공포 탐욕 지수 (Alternative.me - 무료)
 * const fearGreed = await dataService.getFearGreedIndex()
 * 
 * // 5. 사용량 확인
 * const stats = dataService.getStats()
 * console.log('CryptoCompare 남은 호출:', stats.cryptoCompare.remaining)
 */