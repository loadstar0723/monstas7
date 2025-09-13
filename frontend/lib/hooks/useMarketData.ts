'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiRateLimiter } from '../apiRateLimiter'

interface MarketData {
  symbol: string
  price: number
  priceChange24h: number
  priceChangePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdateTime: number
}

interface KlineData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface OrderbookData {
  bids: [string, string][]
  asks: [string, string][]
  lastUpdateId: number
}

export function useMarketData(symbol: string = 'BTCUSDT') {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [klines, setKlines] = useState<KlineData[]>([])
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // 멀티 스트림 WebSocket 연결
      const streams = [
        `${symbol.toLowerCase()}@ticker`,
        `${symbol.toLowerCase()}@kline_1m`,
        `${symbol.toLowerCase()}@depth20@100ms`
      ].join('/')
      
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
      
      ws.onopen = () => {
        reconnectAttemptsRef.current = 0
        setError(null)
        setLoading(false)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const data = message.data
          
          if (!data) return

          // Ticker 데이터 처리
          if (data.e === '24hrTicker') {
            setMarketData({
              symbol: data.s,
              price: parseFloat(data.c),
              priceChange24h: parseFloat(data.p),
              priceChangePercent24h: parseFloat(data.P),
              volume24h: parseFloat(data.v),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              lastUpdateTime: data.E
            })
          }
          
          // Kline 데이터 처리
          else if (data.e === 'kline') {
            const kline = data.k
            const newKline: KlineData = {
              time: kline.t,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v)
            }
            
            setKlines(prev => {
              const updated = [...prev]
              const existingIndex = updated.findIndex(k => k.time === newKline.time)
              
              if (existingIndex >= 0) {
                updated[existingIndex] = newKline
              } else {
                updated.push(newKline)
                // 최대 100개만 유지
                if (updated.length > 100) {
                  updated.shift()
                }
              }
              
              return updated
            })
          }
          
          // Orderbook 데이터 처리
          else if (data.bids && data.asks) {
            setOrderbook({
              bids: data.bids,
              asks: data.asks,
              lastUpdateId: data.lastUpdateId
            })
          }
        } catch (err) {
          console.error('[WebSocket] Parse error:', err)
        }
      }

      ws.onerror = (err) => {
        console.error('[WebSocket] Error:', err)
        setError('WebSocket 연결 오류')
      }

      ws.onclose = () => {
        wsRef.current = null
        
        // 자동 재연결
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          
          `)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        } else {
          setError('WebSocket 연결 실패. REST API로 전환합니다.')
          fallbackToRestAPI()
        }
      }

      wsRef.current = ws
    } catch (err) {
      console.error('[WebSocket] Connection error:', err)
      setError('WebSocket 연결 실패')
      fallbackToRestAPI()
    }
  }, [symbol])

  // REST API 폴백
  const fallbackToRestAPI = useCallback(async () => {
    try {
      // Ticker 데이터 가져오기
      const tickerData = await apiRateLimiter.request(
        `/api/binance/ticker?symbol=${symbol}`,
        async () => {
          const response = await fetch(`/api/binance/ticker?symbol=${symbol}`)
          if (!response.ok) {
            // 직접 Binance API 호출
            const directResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
            if (!directResponse.ok) throw new Error('Failed to fetch ticker')
            return directResponse.json()
          }
          return response.json()
        }
      )

      if (tickerData) {
        setMarketData({
          symbol: tickerData.symbol,
          price: parseFloat(tickerData.lastPrice),
          priceChange24h: parseFloat(tickerData.priceChange),
          priceChangePercent24h: parseFloat(tickerData.priceChangePercent),
          volume24h: parseFloat(tickerData.volume),
          high24h: parseFloat(tickerData.highPrice),
          low24h: parseFloat(tickerData.lowPrice),
          lastUpdateTime: Date.now()
        })
      }

      // Kline 데이터 가져오기
      const klineData = await apiRateLimiter.request(
        `/api/binance/klines?symbol=${symbol}`,
        async () => {
          const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1m&limit=100`)
          if (!response.ok) {
            // 직접 Binance API 호출
            const directResponse = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`)
            if (!directResponse.ok) throw new Error('Failed to fetch klines')
            return directResponse.json()
          }
          return response.json()
        }
      )

      if (klineData && Array.isArray(klineData)) {
        setKlines(klineData.map((k: any[]) => ({
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5])
        })))
      }

      setLoading(false)
    } catch (err) {
      console.error('[REST API] Error:', err)
      setError('데이터를 가져올 수 없습니다')
      setLoading(false)
    }
  }, [symbol])

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    
    // WebSocket 우선 시도
    connectWebSocket()
    
    // 초기 데이터는 REST API로도 가져오기 (빠른 초기 로딩)
    await fallbackToRestAPI()
  }, [connectWebSocket, fallbackToRestAPI])

  // 심볼 변경 시 재연결
  useEffect(() => {
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    // 새로운 연결
    loadInitialData()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [symbol, loadInitialData])

  // 수동 새로고침
  const refresh = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }
    
    loadInitialData()
  }, [loadInitialData])

  return {
    marketData,
    klines,
    orderbook,
    loading,
    error,
    refresh,
    isWebSocketConnected: wsRef.current?.readyState === WebSocket.OPEN
  }
}