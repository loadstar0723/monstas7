/**
 * 실시간 가격 훅 - 모든 페이지에서 공통 사용
 * Binance WebSocket을 최적화된 데이터 서비스로 교체
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { dataService } from '@/lib/services/finalDataService'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

interface UseRealtimePriceOptions {
  onPriceUpdate?: (data: PriceData) => void
  onTradeUpdate?: (trade: any) => void
}

export function useRealtimePrice(symbol: string, options: UseRealtimePriceOptions = {}) {
  const [priceData, setPriceData] = useState<PriceData>({
    symbol,
    price: 0,
    change24h: 0,
    volume24h: 0,
    high24h: 0,
    low24h: 0,
    timestamp: Date.now()
  })
  
  const [isConnected, setIsConnected] = useState(false)
  const callbackRef = useRef<(data: any) => void>()
  
  // WebSocket 콜백 함수
  callbackRef.current = useCallback((data: any) => {
    const newPriceData: PriceData = {
      symbol: data.symbol,
      price: data.price,
      change24h: data.change24h,
      volume24h: data.volume24h,
      high24h: data.high24h,
      low24h: data.low24h,
      timestamp: data.timestamp
    }
    
    setPriceData(newPriceData)
    setIsConnected(true)
    
    // 외부 콜백 호출
    if (options.onPriceUpdate) {
      options.onPriceUpdate(newPriceData)
    }
    
    // 거래 데이터 콜백 (고래 추적 등에서 사용)
    if (options.onTradeUpdate) {
      options.onTradeUpdate(data)
    }
  }, [options.onPriceUpdate, options.onTradeUpdate])
  
  useEffect(() => {
    // 캐시된 데이터 먼저 로드
    const cached = dataService.getPrice(symbol)
    if (cached) {
      setPriceData(prev => ({
        ...prev,
        price: cached.price || prev.price,
        change24h: cached.change24h || prev.change24h,
        volume24h: cached.volume24h || prev.volume24h
      }))
    }
    
    // WebSocket 구독
    const callback = (data: any) => callbackRef.current?.(data)
    dataService.subscribeToPrice(symbol, callback)
    
    // 연결 상태 확인
    setTimeout(() => setIsConnected(true), 1000)
    
    // 클린업
    return () => {
      dataService.unsubscribeFromPrice(symbol, callback)
      setIsConnected(false)
    }
  }, [symbol])
  
  return {
    ...priceData,
    isConnected
  }
}

// 여러 심볼 동시 추적
export function useMultipleRealtimePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [isConnected, setIsConnected] = useState(false)
  const callbacksRef = useRef<Map<string, (data: any) => void>>(new Map())
  
  useEffect(() => {
    // 각 심볼별로 구독
    symbols.forEach(symbol => {
      const callback = (data: any) => {
        setPrices(prev => ({
          ...prev,
          [symbol]: {
            symbol: data.symbol,
            price: data.price,
            change24h: data.change24h,
            volume24h: data.volume24h,
            high24h: data.high24h,
            low24h: data.low24h,
            timestamp: data.timestamp
          }
        }))
      }
      
      callbacksRef.current.set(symbol, callback)
      dataService.subscribeToPrice(symbol, callback)
    })
    
    setIsConnected(true)
    
    // 클린업
    return () => {
      symbols.forEach(symbol => {
        const callback = callbacksRef.current.get(symbol)
        if (callback) {
          dataService.unsubscribeFromPrice(symbol, callback)
        }
      })
      callbacksRef.current.clear()
      setIsConnected(false)
    }
  }, [symbols.join(',')])
  
  return {
    prices,
    isConnected
  }
}

// 캔들 데이터 가져오기
export async function fetchKlines(symbol: string, interval: string = '1m', limit: number = 100) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )
    
    if (!response.ok) {
      throw new Error(`Klines fetch failed: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Klines fetch error:', error)
    // 폴백: 빈 배열 반환
    return []
  }
}

// 오더북 데이터 가져오기
export async function fetchOrderBook(symbol: string, limit: number = 20) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`
    )
    
    if (!response.ok) {
      throw new Error(`OrderBook fetch failed: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('OrderBook fetch error:', error)
    // 폴백: 빈 오더북 반환
    return { bids: [], asks: [] }
  }
}

// 24시간 티커 통계
export async function fetch24hrTicker(symbol: string) {
  try {
    const response = await fetch(
      `/api/binance/ticker?symbol=${symbol}`
    )
    
    if (!response.ok) {
      console.warn(`API 응답 실패: ${response.status}, 기본값 사용`)
      // 기본값 반환
      return {
        price: 0,
        change24h: 0,
        volume24h: 0,
        high24h: 0,
        low24h: 0,
        count: 0
      }
    }
    
    const data = await response.json()
    
    // 데이터 파싱 (null/undefined 체크)
    return {
      price: parseFloat(data.lastPrice || data.price || '0'),
      change24h: parseFloat(data.priceChangePercent || '0'),
      volume24h: parseFloat(data.volume || data.quoteVolume || '0'),
      high24h: parseFloat(data.highPrice || '0'),
      low24h: parseFloat(data.lowPrice || '0'),
      count: parseInt(data.count || '0')
    }
  } catch (error) {
    console.error('Ticker fetch error:', error)
    // 폴백: 기본값 반환
    return {
      price: 0,
      change24h: 0,
      volume24h: 0,
      high24h: 0,
      low24h: 0,
      count: 0
    }
  }
}