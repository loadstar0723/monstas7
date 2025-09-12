/**
 * 통합 시세 데이터 서비스
 * CoinGecko Pro를 메인으로, Binance WebSocket을 실시간용으로 사용
 */

import { apiRateLimiter } from '@/lib/apiRateLimiter'

interface MarketDataProvider {
  getPrice(symbol: string): Promise<number>
  getPrices(symbols: string[]): Promise<Record<string, number>>
  getOHLCV(symbol: string, days: number): Promise<any[]>
  getMarketData(symbol: string): Promise<any>
  getTickers(): Promise<any[]>
}

class CoinGeckoProvider implements MarketDataProvider {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private cacheTTL = 30000 // 30초 캐싱

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || ''
    this.baseUrl = 'https://pro-api.coingecko.com/api/v3'
  }

  private async fetchWithCache(endpoint: string, params: Record<string, any> = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }

    const queryParams = new URLSearchParams({
      ...params,
      x_cg_pro_api_key: this.apiKey
    })

    const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`)
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
    
    return data
  }

  async getPrice(symbol: string): Promise<number> {
    const coinId = this.symbolToCoinId(symbol)
    const data = await this.fetchWithCache('/simple/price', {
      ids: coinId,
      vs_currencies: 'usd'
    })
    return data[coinId]?.usd || 0
  }

  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const coinIds = symbols.map(s => this.symbolToCoinId(s))
    const data = await this.fetchWithCache('/simple/price', {
      ids: coinIds.join(','),
      vs_currencies: 'usd'
    })
    
    const result: Record<string, number> = {}
    symbols.forEach((symbol, i) => {
      result[symbol] = data[coinIds[i]]?.usd || 0
    })
    
    return result
  }

  async getOHLCV(symbol: string, days: number = 1): Promise<any[]> {
    const coinId = this.symbolToCoinId(symbol)
    const data = await this.fetchWithCache(`/coins/${coinId}/ohlc`, {
      vs_currency: 'usd',
      days: days
    })
    
    return data.map((candle: number[]) => ({
      time: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4]
    }))
  }

  async getMarketData(symbol: string): Promise<any> {
    const coinId = this.symbolToCoinId(symbol)
    const data = await this.fetchWithCache(`/coins/${coinId}`, {
      localization: false,
      tickers: true,
      market_data: true,
      community_data: false,
      developer_data: false
    })
    
    return {
      price: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_percentage_24h,
      volume24h: data.market_data.total_volume.usd,
      marketCap: data.market_data.market_cap.usd,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      circulatingSupply: data.market_data.circulating_supply,
      ath: data.market_data.ath.usd,
      athDate: data.market_data.ath_date.usd
    }
  }

  async getTickers(): Promise<any[]> {
    const data = await this.fetchWithCache('/coins/markets', {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: true,
      price_change_percentage: '1h,24h,7d'
    })
    
    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      change7d: coin.price_change_percentage_7d,
      volume: coin.total_volume,
      marketCap: coin.market_cap,
      sparkline: coin.sparkline_in_7d.price
    }))
  }

  private symbolToCoinId(symbol: string): string {
    // 심볼을 CoinGecko coin ID로 변환
    const mapping: Record<string, string> = {
      'BTCUSDT': 'bitcoin',
      'BTC': 'bitcoin',
      'ETHUSDT': 'ethereum',
      'ETH': 'ethereum',
      'BNBUSDT': 'binancecoin',
      'BNB': 'binancecoin',
      'SOLUSDT': 'solana',
      'SOL': 'solana',
      'XRPUSDT': 'ripple',
      'XRP': 'ripple',
      'ADAUSDT': 'cardano',
      'ADA': 'cardano',
      'DOGEUSDT': 'dogecoin',
      'DOGE': 'dogecoin',
      'AVAXUSDT': 'avalanche-2',
      'AVAX': 'avalanche-2',
      'MATICUSDT': 'matic-network',
      'MATIC': 'matic-network',
      'DOTUSDT': 'polkadot',
      'DOT': 'polkadot'
    }
    
    return mapping[symbol] || mapping[symbol.replace('USDT', '')] || symbol.toLowerCase()
  }
}

// Binance WebSocket은 실시간 데이터용으로만 사용
class BinanceWebSocketService {
  private ws: WebSocket | null = null
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  
  connect(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    const stream = `${symbol.toLowerCase()}@ticker`
    this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const callbacks = this.subscribers.get(symbol) || new Set()
      callbacks.forEach(cb => cb(data))
    }
    
    this.ws.onerror = () => {
      // 에러 시 자동 재연결
      setTimeout(() => this.connect(symbol), 5000)
    }
  }
  
  subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
    }
    this.subscribers.get(symbol)!.add(callback)
    this.connect(symbol)
  }
  
  unsubscribe(symbol: string, callback: (data: any) => void) {
    this.subscribers.get(symbol)?.delete(callback)
  }
}

// 통합 서비스
export class MarketDataService {
  private provider: MarketDataProvider
  private wsService: BinanceWebSocketService
  
  constructor() {
    this.provider = new CoinGeckoProvider()
    this.wsService = new BinanceWebSocketService()
  }
  
  // 기본 가격 조회 (CoinGecko)
  async getPrice(symbol: string): Promise<number> {
    return this.provider.getPrice(symbol)
  }
  
  // 여러 심볼 가격 조회 (CoinGecko)
  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    return this.provider.getPrices(symbols)
  }
  
  // OHLCV 데이터 (CoinGecko)
  async getOHLCV(symbol: string, days: number = 1): Promise<any[]> {
    return this.provider.getOHLCV(symbol, days)
  }
  
  // 상세 시장 데이터 (CoinGecko)
  async getMarketData(symbol: string): Promise<any> {
    return this.provider.getMarketData(symbol)
  }
  
  // 티커 목록 (CoinGecko)
  async getTickers(): Promise<any[]> {
    return this.provider.getTickers()
  }
  
  // 실시간 가격 구독 (Binance WebSocket)
  subscribeToRealtime(symbol: string, callback: (data: any) => void) {
    this.wsService.subscribe(symbol, callback)
  }
  
  // 실시간 구독 해제
  unsubscribeFromRealtime(symbol: string, callback: (data: any) => void) {
    this.wsService.unsubscribe(symbol, callback)
  }
}

// 싱글톤 인스턴스
export const marketDataService = new MarketDataService()