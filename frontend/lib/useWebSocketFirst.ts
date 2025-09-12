// WebSocket을 우선적으로 사용하는 훅
import { useEffect, useRef, useState } from 'react'

interface WebSocketConfig {
  symbol: string
  onData: (data: any) => void
  onError?: (error: any) => void
  autoReconnect?: boolean
  maxReconnectAttempts?: number
}

export function useWebSocketFirst({
  symbol,
  onData,
  onError,
  autoReconnect = true,
  maxReconnectAttempts = 5
}: WebSocketConfig) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        // Binance WebSocket 스트림
        const streams = [
          `${symbol.toLowerCase()}@ticker`,     // 24시간 티커
          `${symbol.toLowerCase()}@kline_1m`,   // 1분 캔들
          `${symbol.toLowerCase()}@depth20`      // 오더북 깊이
        ]
        
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
        
        const ws = new WebSocket(wsUrl)
        
        ws.onopen = () => {
          console.log('WebSocket 연결 성공:', symbol)
          setIsConnected(true)
          reconnectAttemptsRef.current = 0
        }
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            onData(message.data)
          } catch (error) {
            console.error('WebSocket 메시지 파싱 에러:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket 에러:', error)
          if (onError) onError(error)
          setIsConnected(false)
        }
        
        ws.onclose = () => {
          console.log('WebSocket 연결 종료')
          setIsConnected(false)
          wsRef.current = null
          
          // 자동 재연결
          if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
            console.log(`재연결 시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts}, ${delay}ms 후...`)
            reconnectTimeout = setTimeout(connect, delay)
          }
        }
        
        wsRef.current = ws
      } catch (error) {
        console.error('WebSocket 생성 실패:', error)
        if (onError) onError(error)
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimeout)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [symbol])

  return { isConnected, reconnect: () => reconnectAttemptsRef.current = 0 }
}

// REST API 폴백 함수
export async function fetchWithFallback(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Cache-Control': 'max-age=5' // 5초 캐시
      }
    })
    
    if (response.status === 429) {
      console.warn('레이트 리밋 도달, WebSocket 데이터 사용')
      throw new Error('RATE_LIMIT')
    }
    
    return response
  } catch (error: any) {
    if (error.message === 'RATE_LIMIT') {
      // WebSocket 데이터로 대체
      return null
    }
    throw error
  }
}