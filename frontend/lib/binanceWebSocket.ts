// Binance WebSocket 관리자
type WebSocketCallback = (data: any) => void

class BinanceWebSocketManager {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private callbacks: Map<string, WebSocketCallback> = new Map()
  private subscribedSymbols: Set<string> = new Set()
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }
  
  private connect() {
    try {
      // Binance WebSocket 스트림 URL
      const streams = Array.from(this.subscribedSymbols).map(s => `${s.toLowerCase()}@ticker`).join('/')
      const wsUrl = streams ? `wss://stream.binance.com:9443/stream?streams=${streams}` : 'wss://stream.binance.com:9443/ws'
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        
        // 구독 재설정
        if (this.subscribedSymbols.size > 0 && !streams) {
          this.subscribeToSymbols(Array.from(this.subscribedSymbols))
        }
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // 스트림 데이터 처리
          if (data.stream && data.data) {
            const symbol = data.data.s // 심볼
            const callback = this.callbacks.get(symbol)
            if (callback) {
              callback({
                symbol: symbol,
                price: parseFloat(data.data.c), // 현재 가격
                change: parseFloat(data.data.P), // 변화율
                volume: parseFloat(data.data.q), // 거래량
                high: parseFloat(data.data.h), // 고가
                low: parseFloat(data.data.l) // 저가
              })
            }
          } else if (data.s) {
            // 단일 ticker 데이터
            const callback = this.callbacks.get(data.s)
            if (callback) {
              callback({
                symbol: data.s,
                price: parseFloat(data.c),
                change: parseFloat(data.P),
                volume: parseFloat(data.q),
                high: parseFloat(data.h),
                low: parseFloat(data.l)
              })
            }
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 에러:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket 에러:', error)
      }
      
      this.ws.onclose = () => {
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      this.attemptReconnect()
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      this.reconnectTimer = setTimeout(() => {
        this.connect()
      }, 3000 * this.reconnectAttempts)
    }
  }
  
  private subscribeToSymbols(symbols: string[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: symbols.map(s => `${s.toLowerCase()}@ticker`),
        id: Date.now()
      }
      this.ws.send(JSON.stringify(subscribeMsg))
    }
  }
  
  public subscribe(symbol: string, callback: WebSocketCallback) {
    this.callbacks.set(symbol, callback)
    
    if (!this.subscribedSymbols.has(symbol)) {
      this.subscribedSymbols.add(symbol)
      
      // WebSocket이 연결되어 있으면 즉시 구독
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.subscribeToSymbols([symbol])
      } else {
        // 재연결
        this.connect()
      }
    }
  }
  
  public unsubscribe(symbol: string) {
    this.callbacks.delete(symbol)
    this.subscribedSymbols.delete(symbol)
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const unsubscribeMsg = {
        method: 'UNSUBSCRIBE',
        params: [`${symbol.toLowerCase()}@ticker`],
        id: Date.now()
      }
      this.ws.send(JSON.stringify(unsubscribeMsg))
    }
  }
  
  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.callbacks.clear()
    this.subscribedSymbols.clear()
  }
}

// 싱글톤 인스턴스
let instance: BinanceWebSocketManager | null = null

export const getBinanceWebSocket = () => {
  if (!instance && typeof window !== 'undefined') {
    instance = new BinanceWebSocketManager()
  }
  return instance
}