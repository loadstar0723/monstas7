import { useState, useEffect, useRef, useCallback } from 'react'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface OrderbookData {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
}

interface PriceData {
  price: number
  change: number
}

interface WebSocketMessage {
  e: string // event type
  E: number // event time
  s: string // symbol
  U: number // first update id
  u: number // final update id
  b: string[][] // bids
  a: string[][] // asks
}

interface TickerMessage {
  e: string // event type '24hrTicker'
  s: string // symbol
  c: string // last price
  P: string // price change percent
  p: string // price change
  w: string // weighted average price
  o: string // open price
  h: string // high price
  l: string // low price
  v: string // volume
  q: string // quote volume
}

export function useOrderbookWebSocket(symbol: string, depth: number = 20) {
  const [isConnected, setIsConnected] = useState(false)
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null)
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const orderbookRef = useRef<OrderbookData | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  
  // 오더북 처리 함수
  const processOrderbook = useCallback((bids: string[][], asks: string[][]) => {
    const processedBids: OrderbookLevel[] = bids.slice(0, depth).map(([price, amount]) => ({
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(price) * parseFloat(amount)
    }))
    
    const processedAsks: OrderbookLevel[] = asks.slice(0, depth).map(([price, amount]) => ({
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(price) * parseFloat(amount)
    }))
    
    // 스프레드 계산
    const bestBid = processedBids[0]?.price || 0
    const bestAsk = processedAsks[0]?.price || 0
    const spread = bestAsk - bestBid
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0
    
    return {
      bids: processedBids,
      asks: processedAsks,
      lastUpdateId: Date.now(),
      spread,
      spreadPercent,
      bestBid,
      bestAsk
    }
  }, [depth])
  
  // 초기 오더북 스냅샷 가져오기
  const fetchOrderbookSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`/api/binance/orderbook?symbol=${symbol}&limit=${depth}`)
      if (!response.ok) throw new Error('Failed to fetch orderbook')
      
      const data = await response.json()
      const processed = processOrderbook(
        data.bids.map((b: any) => [b.price.toString(), b.amount.toString()]),
        data.asks.map((a: any) => [a.price.toString(), a.amount.toString()])
      )
      
      orderbookRef.current = processed
      setOrderbookData(processed)
    } catch (error) {
      console.error('Error fetching orderbook snapshot:', error)
    }
  }, [symbol, depth, processOrderbook])
  
  // WebSocket 연결
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      // Binance WebSocket 스트림 (오더북 + 티커)
      const streams = [
        `${symbol.toLowerCase()}@depth20@100ms`, // 오더북 업데이트 (100ms)
        `${symbol.toLowerCase()}@ticker` // 가격 티커
      ]
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log(`Orderbook WebSocket connected successfully for ${symbol}`)
        console.log('WebSocket URL:', wsUrl)
        setIsConnected(true)
        reconnectCountRef.current = 0
        // 연결 후 스냅샷 가져오기
        fetchOrderbookSnapshot()
      }
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const data = message.data
          
          if (data.e === 'depthUpdate') {
            // 오더북 업데이트
            const wsData = data as WebSocketMessage
            const processed = processOrderbook(wsData.b, wsData.a)
            orderbookRef.current = processed
            setOrderbookData(processed)
          } else if (data.e === '24hrTicker') {
            // 가격 업데이트
            const ticker = data as TickerMessage
            setPriceData({
              price: parseFloat(ticker.c),
              change: parseFloat(ticker.P)
            })
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
        }
      }
      
      ws.onerror = (event: Event) => {
        console.error('Orderbook WebSocket error occurred')
        console.error('WebSocket readyState:', ws.readyState)
        console.error('WebSocket url:', ws.url)
        if (event instanceof ErrorEvent) {
          console.error('Error message:', event.message)
        }
        setIsConnected(false)
      }
      
      ws.onclose = (event: CloseEvent) => {
        console.log(`Orderbook WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`)
        console.log('Clean close:', event.wasClean)
        setIsConnected(false)
        wsRef.current = null
        
        // 재연결 로직 (정상 종료가 아닌 경우에만)
        if (!event.wasClean && reconnectCountRef.current < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000)
          console.log(`Reconnecting in ${timeout}ms... (attempt ${reconnectCountRef.current + 1}/5)`)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++
            connect()
          }, timeout)
        }
      }
    } catch (error) {
      console.error('Error connecting to orderbook WebSocket:', error)
      setIsConnected(false)
    }
  }, [symbol, fetchOrderbookSnapshot, processOrderbook])
  
  // 연결 해제
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000) // 정상 종료
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])
  
  // 재연결
  const reconnect = useCallback(() => {
    disconnect()
    reconnectCountRef.current = 0
    setTimeout(() => connect(), 100)
  }, [connect, disconnect])
  
  // 심볼 변경 시 재연결
  useEffect(() => {
    disconnect()
    // 잠시 대기 후 새 연결
    const timeout = setTimeout(() => connect(), 100)
    
    return () => {
      clearTimeout(timeout)
      disconnect()
    }
  }, [symbol, connect, disconnect])
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])
  
  return {
    isConnected,
    orderbookData,
    priceData,
    reconnect
  }
}