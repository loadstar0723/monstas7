import { useState, useEffect, useRef, useCallback } from 'react'
import WebSocketManager from '@/lib/websocketManager'

interface OrderLevel {
  price: number
  amount: number
  total: number
  timestamp?: number
  lifespan?: number
  cancelled?: boolean
  suspicious?: boolean
}

interface OrderbookData {
  bids: OrderLevel[]
  asks: OrderLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
  timestamp: number
}

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
  symbol: string
}

interface OrderUpdate {
  symbol: string
  bidPrice: number
  bidQty: number
  askPrice: number
  askQty: number
  time: number
}

export function useSpoofingWebSocket(symbol: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null)
  const [tradeData, setTradeData] = useState<TradeData[]>([])
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([])
  
  const wsManager = useRef<WebSocketManager>()
  const orderLifetimeMap = useRef<Map<string, { price: number, amount: number, timestamp: number }>>(new Map())
  const cancellationBuffer = useRef<{ price: number, amount: number, timestamp: number, cancelled: boolean }[]>([])
  
  // WebSocket 연결
  useEffect(() => {
    if (!symbol) return
    
    wsManager.current = WebSocketManager.getInstance()
    
    // 오더북 스트림 연결
    const depthUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
    wsManager.current.connect(
      `spoofing-depth-${symbol}`,
      depthUrl,
      (data) => {
        if (data.e === 'depthUpdate' || data.bids) {
          processOrderbookUpdate(data)
        }
      },
      (error) => {
        console.error('Orderbook WebSocket error:', error)
        setIsConnected(false)
      },
      () => {
        setIsConnected(true)
      },
      () => {
        setIsConnected(false)
      }
    )
    
    // 거래 스트림 연결
    const tradeUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    wsManager.current.connect(
      `spoofing-trade-${symbol}`,
      tradeUrl,
      (data) => {
        if (data.e === 'trade') {
          const trade: TradeData = {
            price: parseFloat(data.p),
            quantity: parseFloat(data.q),
            time: data.T,
            isBuyerMaker: data.m,
            symbol: data.s
          }
          setTradeData(prev => [...prev.slice(-99), trade])
        }
      }
    )
    
    // bookTicker 스트림 (최우선 호가 업데이트)
    const tickerUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@bookTicker`
    wsManager.current.connect(
      `spoofing-ticker-${symbol}`,
      tickerUrl,
      (data) => {
        const update: OrderUpdate = {
          symbol: data.s,
          bidPrice: parseFloat(data.b),
          bidQty: parseFloat(data.B),
          askPrice: parseFloat(data.a),
          askQty: parseFloat(data.A),
          time: Date.now()
        }
        setOrderUpdates(prev => [...prev.slice(-99), update])
      }
    )
    
    // 초기 오더북 로드
    loadInitialOrderbook(symbol)
    
    return () => {
      // 연결 해제
      if (wsManager.current) {
        wsManager.current.disconnect(`spoofing-depth-${symbol}`)
        wsManager.current.disconnect(`spoofing-trade-${symbol}`)
        wsManager.current.disconnect(`spoofing-ticker-${symbol}`)
      }
      orderLifetimeMap.current.clear()
      cancellationBuffer.current = []
    }
  }, [symbol])
  
  // 오더북 업데이트 처리
  const processOrderbookUpdate = useCallback((data: any) => {
    const timestamp = Date.now()
    
    // 기존 주문과 비교하여 생존 시간 계산
    const processLevels = (levels: any[], type: 'bid' | 'ask') => {
      return levels.map(level => {
        const price = parseFloat(level[0])
        const amount = parseFloat(level[1])
        const key = `${type}-${price}`
        
        // 주문 생존 시간 추적
        const existing = orderLifetimeMap.current.get(key)
        let lifespan = 0
        let suspicious = false
        
        if (existing) {
          if (amount === 0) {
            // 주문 취소됨
            lifespan = timestamp - existing.timestamp
            orderLifetimeMap.current.delete(key)
            
            // 취소 버퍼에 추가
            cancellationBuffer.current.push({
              price,
              amount: existing.amount,
              timestamp,
              cancelled: true
            })
            
            // 1초 이내 취소는 스푸핑 의심
            if (lifespan < 1000) {
              suspicious = true
            }
          } else if (Math.abs(amount - existing.amount) > 0.01) {
            // 주문 수량 변경
            lifespan = timestamp - existing.timestamp
            orderLifetimeMap.current.set(key, { price, amount, timestamp })
          } else {
            // 주문 유지
            lifespan = timestamp - existing.timestamp
          }
        } else if (amount > 0) {
          // 새 주문
          orderLifetimeMap.current.set(key, { price, amount, timestamp })
        }
        
        return {
          price,
          amount,
          total: price * amount,
          timestamp,
          lifespan,
          cancelled: amount === 0,
          suspicious
        }
      }).filter(level => level.amount > 0) // 0인 주문 제거
    }
    
    const bids = data.bids ? processLevels(data.bids, 'bid') : []
    const asks = data.asks ? processLevels(data.asks, 'ask') : []
    
    // 스프레드 계산
    const bestBid = bids[0]?.price || 0
    const bestAsk = asks[0]?.price || 0
    const spread = bestAsk - bestBid
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0
    
    const orderbook: OrderbookData = {
      bids,
      asks,
      lastUpdateId: data.u || 0,
      spread,
      spreadPercent,
      bestBid,
      bestAsk,
      timestamp
    }
    
    setOrderbookData(orderbook)
    
    // 오래된 취소 기록 정리 (최근 1분만 유지)
    cancellationBuffer.current = cancellationBuffer.current.filter(
      item => timestamp - item.timestamp < 60000
    )
  }, [])
  
  // 초기 오더북 로드
  const loadInitialOrderbook = async (symbol: string) => {
    try {
      const response = await fetch(`/api/binance/depth?symbol=${symbol}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        processOrderbookUpdate(data)
      }
    } catch (error) {
      console.error('Failed to load initial orderbook:', error)
    }
  }
  
  // 재연결
  const reconnect = useCallback(() => {
    if (wsManager.current && symbol) {
      wsManager.current.disconnect(`spoofing-depth-${symbol}`)
      wsManager.current.disconnect(`spoofing-trade-${symbol}`)
      wsManager.current.disconnect(`spoofing-ticker-${symbol}`)
      
      // 약간의 지연 후 재연결
      setTimeout(() => {
        loadInitialOrderbook(symbol)
      }, 500)
    }
  }, [symbol])
  
  // 취소율 계산
  const getCancellationRate = useCallback(() => {
    const totalOrders = orderLifetimeMap.current.size + cancellationBuffer.current.length
    const cancelledOrders = cancellationBuffer.current.length
    
    if (totalOrders === 0) return 0
    return (cancelledOrders / totalOrders) * 100
  }, [])
  
  // 플래시 오더 감지
  const getFlashOrders = useCallback((timeWindow: number = 1000) => {
    return cancellationBuffer.current.filter(item => {
      const lifespan = item.timestamp - (orderLifetimeMap.current.get(`bid-${item.price}`)?.timestamp || item.timestamp)
      return lifespan < timeWindow
    })
  }, [])
  
  return {
    isConnected,
    orderbookData,
    tradeData,
    orderUpdates,
    reconnect,
    getCancellationRate,
    getFlashOrders,
    orderLifetimeMap: orderLifetimeMap.current,
    cancellationBuffer: cancellationBuffer.current
  }
}