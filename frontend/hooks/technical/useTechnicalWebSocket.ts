'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { WebSocketMessage, MarketData } from '@/components/technical/types'

interface UseTechnicalWebSocketProps {
  symbol: string
  enabled?: boolean
  onMessage?: (data: any) => void
  streams?: string[]
}

export function useTechnicalWebSocket({
  symbol,
  enabled = true,
  onMessage,
  streams = ['kline_1m', 'ticker', 'miniTicker', 'depth20']
}: UseTechnicalWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [marketData, setMarketData] = useState<MarketData>({
    symbol,
    price: 0,
    change24h: 0,
    volume24h: 0
  })
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  const maxReconnectAttempts = 5

  const connectWebSocket = useCallback(() => {
    if (!enabled || !symbol) return
    
    // 브라우저 환경 체크
    if (typeof window === 'undefined') return

    try {
      // 기존 연결 종료
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }

      // 스트림 구성 - 기본 스트림 사용
      const defaultStreams = ['miniTicker', 'kline_1m']
      const streamList = defaultStreams.map(stream => 
        `${symbol.toLowerCase()}@${stream}`
      ).join('/')
      
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streamList}`
      console.log('WebSocket 연결 시도:', wsUrl)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log(`WebSocket 연결 성공: ${symbol}`)
        setIsConnected(true)
        setError(null)
        reconnectCountRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // 멀티스트림 데이터 처리
          if (message.stream && message.data) {
            const stream = message.stream
            const data = message.data
            
            // 티커 데이터 처리
            if (stream.includes('@ticker')) {
              setMarketData(prev => ({
                ...prev,
                price: parseFloat(data.c) || prev.price,
                change24h: parseFloat(data.P) || prev.change24h,
                volume24h: parseFloat(data.q) || prev.volume24h,
                high24h: parseFloat(data.h),
                low24h: parseFloat(data.l)
              }))
            }
            
            // 미니 티커 데이터 처리
            if (stream.includes('@miniTicker')) {
              setMarketData(prev => ({
                ...prev,
                price: parseFloat(data.c) || prev.price,
                change24h: ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o) * 100) || prev.change24h,
                volume24h: parseFloat(data.v) || prev.volume24h,
                high24h: parseFloat(data.h) || prev.high24h,
                low24h: parseFloat(data.l) || prev.low24h
              }))
            }
            
            // K라인 데이터 처리
            if (stream.includes('@kline') && data.k) {
              const kline = data.k
              setMarketData(prev => ({
                ...prev,
                price: parseFloat(kline.c) || prev.price
              }))
            }
            
            // 커스텀 메시지 핸들러 호출
            if (onMessage) {
              onMessage(message)
            }
          }
        } catch (err) {
          console.error('WebSocket 메시지 처리 에러:', err)
        }
      }

      ws.onerror = (event) => {
        console.warn('WebSocket 연결 에러 발생 - 재연결을 시도합니다')
        setError('WebSocket 연결 에러 - 재연결 중...')
        setIsConnected(false)
      }

      ws.onclose = () => {
        console.log('WebSocket 연결 종료')
        setIsConnected(false)
        
        // 재연결 로직
        if (enabled && reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000)
          
          console.log(`재연결 시도 ${reconnectCountRef.current}/${maxReconnectAttempts} (${delay}ms 후)`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        }
      }

      wsRef.current = ws
    } catch (err) {
      console.error('WebSocket 연결 실패:', err)
      setError('WebSocket 연결 실패')
      setIsConnected(false)
    }
  }, [symbol, enabled, onMessage, streams])

  // 수동 재연결 함수
  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0
    connectWebSocket()
  }, [connectWebSocket])

  // 연결 종료 함수
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  // symbol 변경 시 재연결
  useEffect(() => {
    if (enabled) {
      // 기존 연결 정리
      disconnect()
      
      // 새 연결 시작 (약간의 지연)
      const timeoutId = setTimeout(() => {
        connectWebSocket()
      }, 500)
      
      return () => {
        clearTimeout(timeoutId)
        disconnect()
      }
    } else {
      disconnect()
    }
  }, [symbol, enabled])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    marketData,
    error,
    reconnect,
    disconnect
  }
}

// 여러 심볼 동시 구독 훅
export function useMultipleWebSocket(symbols: string[]) {
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketData>>({})
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (symbols.length === 0) return

    // 기존 연결 종료
    if (wsRef.current) {
      wsRef.current.close()
    }

    // 모든 심볼에 대한 스트림 구성
    const streams = symbols.flatMap(symbol => [
      `${symbol.toLowerCase()}@ticker`,
      `${symbol.toLowerCase()}@miniTicker`
    ]).join('/')

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('Multi-symbol WebSocket 연결 성공')
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.stream && message.data) {
          const symbolMatch = message.stream.match(/^([^@]+)@/)
          if (symbolMatch) {
            const symbol = symbolMatch[1].toUpperCase()
            const data = message.data
            
            setMarketDataMap(prev => ({
              ...prev,
              [symbol]: {
                symbol,
                price: parseFloat(data.c) || prev[symbol]?.price || 0,
                change24h: parseFloat(data.P) || prev[symbol]?.change24h || 0,
                volume24h: parseFloat(data.q) || prev[symbol]?.volume24h || 0,
                high24h: parseFloat(data.h),
                low24h: parseFloat(data.l)
              }
            }))
          }
        }
      } catch (err) {
        console.error('Multi-symbol WebSocket 에러:', err)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      // 재연결 로직
      setTimeout(() => {
        if (wsRef.current === ws) {
          useMultipleWebSocket(symbols)
        }
      }, 5000)
    }

    wsRef.current = ws

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [symbols.join(',')])

  return { marketDataMap, isConnected }
}