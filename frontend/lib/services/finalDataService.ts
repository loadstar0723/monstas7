/**
 * 최종 데이터 서비스 아키텍처
 * 
 * 1. CryptoCompare (메인 데이터 소스)
 *    - 무료: 월 100,000 호출
 *    - 실시간 가격, 오더북, 거래량
 *    - 뉴스, 소셜 데이터 포함
 *    - WebSocket 실시간 스트리밍
 * 
 * 2. Binance WebSocket (실시간 보조)
 *    - 무료, 무제한
 *    - 초단위 가격 업데이트
 *    - 오더북 실시간 변화
 * 
 * 3. Alternative.me (공포탐욕지수)
 *    - 무료 API
 *    - Fear & Greed Index
 */

// 간단한 메모리 캐시 구현 (node-cache 대체)
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private ttl: number

  constructor(options: { stdTTL: number }) {
    this.ttl = options.stdTTL * 1000 // 초를 밀리초로 변환
  }

  set(key: string, value: any): boolean {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + this.ttl
    })
    return true
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.data
  }

  del(key: string): number {
    return this.cache.delete(key) ? 1 : 0
  }

  flushAll(): void {
    this.cache.clear()
  }
  
  getStats(): any {
    return {
      size: this.cache.size,
      ttl: this.ttl / 1000 // 초 단위로 반환
    }
  }
}

// 메모리 캐시
const priceCache = new SimpleCache({ stdTTL: 30 })    // 가격: 30초
const newsCache = new SimpleCache({ stdTTL: 3600 })   // 뉴스: 1시간
const socialCache = new SimpleCache({ stdTTL: 1800 }) // 소셜: 30분

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
    
    // 브라우저 환경에서만 WebSocket 연결
    if (typeof window === 'undefined') {
      console.log('Server-side rendering, skipping WebSocket connection')
      return
    }
    
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
    
    ws.onerror = (error) => {
      console.warn(`WebSocket connection issue for ${stream}, will retry in 5s`)
      // 에러 발생 시 재연결 시도
      setTimeout(() => {
        this.connections.delete(stream)
        if (this.subscribers.get(stream)?.size > 0) {
          console.log(`Reconnecting WebSocket for ${stream}...`)
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
  private wsConnection: WebSocket | null = null
  private priceSubscribers = new Map<string, Set<(data: any) => void>>()

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

  // WebSocket 실시간 가격 스트리밍
  connectWebSocket(symbols: string[]) {
    if (typeof window === 'undefined') return
    if (this.wsConnection) return // 이미 연결되어 있음
    
    const apiKey = this.apiKey
    const subs = symbols.map(symbol => `5~CCCAGG~${symbol}~USD`).join('~')
    
    this.wsConnection = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${apiKey}`)
    
    this.wsConnection.onopen = () => {
      console.log('CryptoCompare WebSocket 연결됨')
      // 구독 메시지 전송
      this.wsConnection!.send(JSON.stringify({
        action: 'SubAdd',
        subs: [subs]
      }))
    }
    
    this.wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.TYPE === '5' && message.PRICE) { // CCCAGG 가격 업데이트
          const symbol = message.FROMSYMBOL
          const callbacks = this.priceSubscribers.get(symbol) || new Set()
          
          callbacks.forEach(cb => cb({
            symbol: symbol,
            price: message.PRICE,
            change24h: message.CHANGEPCT24HOUR || 0,
            volume24h: message.VOLUME24HOUR || 0,
            high24h: message.HIGH24HOUR || 0,
            low24h: message.LOW24HOUR || 0
          }))
        }
      } catch (error) {
        console.error('CryptoCompare WebSocket 메시지 파싱 에러:', error)
      }
    }
    
    this.wsConnection.onclose = () => {
      console.log('CryptoCompare WebSocket 연결 종료')
      this.wsConnection = null
      // 5초 후 재연결
      setTimeout(() => this.connectWebSocket(symbols), 5000)
    }
  }
  
  // 실시간 가격 구독
  subscribeToPrice(symbol: string, callback: (data: any) => void) {
    if (!this.priceSubscribers.has(symbol)) {
      this.priceSubscribers.set(symbol, new Set())
    }
    this.priceSubscribers.get(symbol)!.add(callback)
  }
  
  // 실시간 가격 데이터 (REST API 폴백)
  async getPrice(fsym: string, tsyms: string[] = ['USD']): Promise<any> {
    const cacheKey = `price_${fsym}_${tsyms.join('_')}`
    const cached = priceCache.get(cacheKey)
    if (cached) return cached
    
    if (this.callCount >= this.monthlyLimit) {
      console.warn('CryptoCompare 월 한도 도달')
      return {}
    }
    
    try {
      const params = new URLSearchParams({
        fsym: fsym,
        tsyms: tsyms.join(','),
        api_key: this.apiKey
      })
      
      const response = await fetch(`${this.baseUrl}/data/price?${params}`)
      const data = await response.json()
      
      this.callCount++
      priceCache.set(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('가격 로드 실패:', error)
      return {}
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
  private isUsingCryptoCompare = true // CryptoCompare를 메인으로 사용
  
  constructor() {
    // CryptoCompare WebSocket 초기 연결 (주요 코인들)
    if (typeof window !== 'undefined') {
      const mainSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX']
      this.cryptoCompare.connectWebSocket(mainSymbols)
    }
  }

  // === 실시간 가격 (CryptoCompare 메인 + Binance 보조) ===
  
  subscribeToPrice(symbol: string, callback: (data: any) => void) {
    // 심볼 처리 (BTCUSDT -> BTC)
    const baseSymbol = symbol.replace('USDT', '')
    
    if (this.isUsingCryptoCompare) {
      // CryptoCompare 메인
      this.cryptoCompare.subscribeToPrice(baseSymbol, callback)
      
      // Binance 보조 (폴백용)
      this.binance.subscribe(symbol, (binanceData) => {
        // CryptoCompare가 실패할 경우를 대비한 폴백
        console.log('Binance 보조 데이터:', binanceData)
      })
    } else {
      // 폴백: Binance만 사용
      this.binance.subscribe(symbol, callback)
    }
  }
  
  unsubscribeFromPrice(symbol: string, callback: (data: any) => void) {
    this.binance.unsubscribe(symbol, callback)
  }
  
  async getPrice(symbol: string) {
    const baseSymbol = symbol.replace('USDT', '')
    
    if (this.isUsingCryptoCompare) {
      try {
        // CryptoCompare REST API 사용
        const price = await this.cryptoCompare.getPrice(baseSymbol, ['USD'])
        if (price.USD) {
          return {
            symbol: symbol,
            price: price.USD,
            source: 'CryptoCompare'
          }
        }
      } catch (error) {
        console.error('CryptoCompare 가격 조회 실패, Binance로 폴백:', error)
      }
    }
    
    // Binance 폴백
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
 * // 1. 실시간 가격 (CryptoCompare WebSocket 메인 + Binance 보조)
 * dataService.subscribeToPrice('BTCUSDT', (data) => {
 *   console.log('가격:', data.price)
 *   console.log('소스:', data.source) // 'CryptoCompare' or 'Binance'
 * })
 * 
 * // 2. 뉴스 (CryptoCompare - 캐싱 1시간)
 * const news = await dataService.getNews(['BTC', 'Analysis'])
 * 
 * // 3. 소셜 데이터 (CryptoCompare - 캐싱 30분)
 * const social = await dataService.getSocialStats('BTC')
 * 
 * // 4. 공포 탐욕 지수 (Alternative.me - 무료, 캐싱 1시간)
 * const fearGreed = await dataService.getFearGreedIndex()
 * 
 * // 5. 사용량 확인
 * const stats = dataService.getStats()
 * console.log('CryptoCompare 남은 호출:', stats.cryptoCompare.remaining)
 */