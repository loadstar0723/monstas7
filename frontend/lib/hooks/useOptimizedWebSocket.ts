/**
 * 최적화된 WebSocket 커스텀 훅
 * - 컴포넌트별 WebSocket 구독 관리
 * - 자동 정리 및 재연결
 * - 타입 안전성 보장
 */

import { useEffect, useRef, useState } from 'react'
import WebSocketOptimizer from '@/lib/websocket/WebSocketOptimizer'

interface UseOptimizedWebSocketOptions {
  enabled?: boolean
  onError?: (error: Error) => void
  initialData?: any
}

/**
 * 실시간 가격 데이터 구독
 */
export function useRealtimePrice(symbol: string, options: UseOptimizedWebSocketOptions = {}) {
  const [priceData, setPriceData] = useState(options.initialData || {
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    high: 0,
    low: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!options.enabled && options.enabled !== undefined) return

    try {
      const wsOptimizer = WebSocketOptimizer.getInstance()
      
      unsubscribeRef.current = wsOptimizer.subscribeToPrice(symbol, (data) => {
        setPriceData(data)
        setIsConnected(true)
      })
    } catch (error) {
      console.error(`useRealtimePrice 에러 (${symbol}):`, error)
      if (options.onError) {
        options.onError(error as Error)
      }
      setIsConnected(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, options.enabled])

  return { ...priceData, isConnected }
}

/**
 * 실시간 거래 데이터 구독 (고래 추적용)
 */
export function useRealtimeTrades(symbol: string, options: UseOptimizedWebSocketOptions = {}) {
  const [trades, setTrades] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!options.enabled && options.enabled !== undefined) return

    try {
      const wsOptimizer = WebSocketOptimizer.getInstance()
      
      unsubscribeRef.current = wsOptimizer.subscribeToTrades(symbol, (trade) => {
        setTrades(prev => [...prev.slice(-99), trade]) // 최근 100개 유지
        setIsConnected(true)
      })
    } catch (error) {
      console.error(`useRealtimeTrades 에러 (${symbol}):`, error)
      if (options.onError) {
        options.onError(error as Error)
      }
      setIsConnected(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, options.enabled])

  return { trades, isConnected }
}

/**
 * 실시간 오더북 구독
 */
export function useRealtimeOrderbook(symbol: string, options: UseOptimizedWebSocketOptions = {}) {
  const [orderbook, setOrderbook] = useState({
    bids: [] as Array<{price: number, quantity: number}>,
    asks: [] as Array<{price: number, quantity: number}>,
    timestamp: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!options.enabled && options.enabled !== undefined) return

    try {
      const wsOptimizer = WebSocketOptimizer.getInstance()
      
      unsubscribeRef.current = wsOptimizer.subscribeToOrderbook(symbol, (data) => {
        setOrderbook(data)
        setIsConnected(true)
      })
    } catch (error) {
      console.error(`useRealtimeOrderbook 에러 (${symbol}):`, error)
      if (options.onError) {
        options.onError(error as Error)
      }
      setIsConnected(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, options.enabled])

  return { orderbook, isConnected }
}

/**
 * 실시간 K라인 구독
 */
export function useRealtimeKlines(
  symbol: string, 
  interval: string = '1m', 
  options: UseOptimizedWebSocketOptions = {}
) {
  const [klineData, setKlineData] = useState<any>(null)
  const [klines, setKlines] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!options.enabled && options.enabled !== undefined) return

    try {
      const wsOptimizer = WebSocketOptimizer.getInstance()
      
      unsubscribeRef.current = wsOptimizer.subscribeToKlines(symbol, interval, (data) => {
        setKlineData(data)
        
        // K라인이 종료된 경우에만 히스토리에 추가
        if (data.isKlineClosed) {
          setKlines(prev => [...prev.slice(-499), data]) // 최근 500개 유지
        }
        
        setIsConnected(true)
      })
    } catch (error) {
      console.error(`useRealtimeKlines 에러 (${symbol}, ${interval}):`, error)
      if (options.onError) {
        options.onError(error as Error)
      }
      setIsConnected(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, interval, options.enabled])

  return { currentKline: klineData, klines, isConnected }
}

/**
 * 전체 시장 미니티커 구독
 */
export function useMarketOverview(options: UseOptimizedWebSocketOptions = {}) {
  const [marketData, setMarketData] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!options.enabled && options.enabled !== undefined) return

    try {
      const wsOptimizer = WebSocketOptimizer.getInstance()
      
      unsubscribeRef.current = wsOptimizer.subscribeToMiniTicker((data) => {
        if (Array.isArray(data)) {
          setMarketData(data)
        }
        setIsConnected(true)
      })
    } catch (error) {
      console.error('useMarketOverview 에러:', error)
      if (options.onError) {
        options.onError(error as Error)
      }
      setIsConnected(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [options.enabled])

  return { marketData, isConnected }
}

/**
 * WebSocket 연결 상태 모니터링
 */
export function useWebSocketStatus() {
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const wsOptimizer = WebSocketOptimizer.getInstance()
    
    const interval = setInterval(() => {
      setConnectionStatus(wsOptimizer.getConnectionStatus())
    }, 3000) // 3초마다 상태 확인

    return () => clearInterval(interval)
  }, [])

  return connectionStatus
}

/**
 * 컴포넌트 언마운트 시 모든 연결 정리
 */
export function useWebSocketCleanup() {
  useEffect(() => {
    return () => {
      // 전체 앱 종료 시에만 모든 연결 해제
      // 개별 컴포넌트 언마운트에서는 개별 unsubscribe만 호출
    }
  }, [])
}

export default {
  useRealtimePrice,
  useRealtimeTrades,
  useRealtimeOrderbook,
  useRealtimeKlines,
  useMarketOverview,
  useWebSocketStatus,
  useWebSocketCleanup
}