/**
 * 마이그레이션 헬퍼
 * 기존 Binance API 코드를 새로운 최적화 서비스로 쉽게 교체
 */

import { dataService } from './finalDataService'

/**
 * 기존 Binance API 호출을 대체하는 래퍼 함수들
 */

// 기존: fetch('/api/binance/ticker?symbol=BTCUSDT')
// 새로운: getBinancePrice('BTCUSDT')
export async function getBinancePrice(symbol: string) {
  // 캐시된 가격 먼저 확인
  const cached = dataService.getPrice(symbol)
  if (cached) return cached
  
  // 캐시가 없으면 Binance API 직접 호출 (폴백)
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
    const data = await response.json()
    return {
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.volume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice)
    }
  } catch (error) {
    console.error('Price fetch failed:', error)
    return null
  }
}

// 기존: fetch('/api/binance/klines?symbol=BTCUSDT&interval=1m')
// 새로운: getBinanceKlines('BTCUSDT', '1m')
export async function getBinanceKlines(symbol: string, interval: string = '1m', limit: number = 100) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )
    return await response.json()
  } catch (error) {
    console.error('Klines fetch failed:', error)
    return []
  }
}

// 기존: fetch('/api/binance/depth?symbol=BTCUSDT')
// 새로운: getBinanceOrderBook('BTCUSDT')
export async function getBinanceOrderBook(symbol: string, limit: number = 20) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`
    )
    return await response.json()
  } catch (error) {
    console.error('OrderBook fetch failed:', error)
    return { bids: [], asks: [] }
  }
}

// 기존: new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker')
// 새로운: subscribeToPrice('BTCUSDT', callback)
export function subscribeToPrice(symbol: string, callback: (data: any) => void) {
  dataService.subscribeToPrice(symbol, callback)
}

export function unsubscribeFromPrice(symbol: string, callback: (data: any) => void) {
  dataService.unsubscribeFromPrice(symbol, callback)
}

// 뉴스 데이터 (새로운 기능)
export async function getMarketNews(categories?: string[]) {
  return dataService.getNews(categories)
}

// 공포 탐욕 지수 (새로운 기능)
export async function getFearGreedIndex() {
  return dataService.getFearGreedIndex()
}

// 소셜 통계 (새로운 기능)
export async function getSocialStats(symbol: string) {
  return dataService.getSocialStats(symbol)
}

/**
 * 마이그레이션 가이드:
 * 
 * 1. API 호출 교체:
 *    // 기존
 *    const res = await fetch('/api/binance/ticker?symbol=BTCUSDT')
 *    const data = await res.json()
 *    
 *    // 새로운
 *    const data = await getBinancePrice('BTCUSDT')
 * 
 * 2. WebSocket 교체:
 *    // 기존
 *    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker')
 *    ws.onmessage = (e) => { ... }
 *    
 *    // 새로운
 *    subscribeToPrice('BTCUSDT', (data) => { ... })
 * 
 * 3. 추가 기능 활용:
 *    const news = await getMarketNews(['BTC'])
 *    const fearGreed = await getFearGreedIndex()
 *    const social = await getSocialStats('BTC')
 */