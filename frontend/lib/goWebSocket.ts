// Go WebSocket 서버 연결 클라이언트
export class GoWebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(url: string = 'ws://localhost:8080/ws') {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('Connected to Go WebSocket server')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.notifyListeners(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket connection closed')
          this.handleReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      
      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set())
    }
    this.listeners.get(symbol)!.add(callback)

    // Go 서버에 구독 메시지 전송
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }))
    }
  }

  unsubscribe(symbol: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(symbol)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(symbol)
        
        // Go 서버에 구독 해제 메시지 전송
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            symbol: symbol
          }))
        }
      }
    }
  }

  private notifyListeners(data: any) {
    const callbacks = this.listeners.get(data.symbol)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// 싱글톤 인스턴스
export const goWebSocket = new GoWebSocketClient()