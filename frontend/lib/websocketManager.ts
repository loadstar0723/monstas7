// WebSocket 연결 관리자 - 싱글톤 패턴
class WebSocketManager {
  private static instance: WebSocketManager
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  
  private constructor() {}
  
  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }
  
  connect(
    key: string, 
    url: string, 
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onConnect?: (ws: WebSocket) => void
  ): WebSocket {
    // 이미 연결이 있으면 재사용
    const existing = this.connections.get(key)
    if (existing && existing.readyState === WebSocket.OPEN) {
      return existing
    }
    
    // 새 연결 생성
    const ws = new WebSocket(url)
    
    ws.onopen = () => {
      console.log(`WebSocket ${key} connected`)
      this.reconnectAttempts.set(key, 0)
      onOpen?.()
      onConnect?.(ws)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error(`WebSocket ${key} parse error:`, error)
      }
    }
    
    ws.onerror = (error) => {
      console.error(`WebSocket ${key} error:`, error)
      onError?.(error)
    }
    
    ws.onclose = () => {
      console.log(`WebSocket ${key} closed`)
      this.connections.delete(key)
      onClose?.()
      
      // 자동 재연결
      const attempts = this.reconnectAttempts.get(key) || 0
      if (attempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000)
        setTimeout(() => {
          console.log(`Reconnecting WebSocket ${key} (attempt ${attempts + 1})`)
          this.reconnectAttempts.set(key, attempts + 1)
          this.connect(key, url, onMessage, onError, onOpen, onClose, onConnect)
        }, delay)
      }
    }
    
    this.connections.set(key, ws)
    return ws
  }
  
  disconnect(key: string) {
    const ws = this.connections.get(key)
    if (ws) {
      ws.close(1000, 'Normal closure')
      this.connections.delete(key)
      this.reconnectAttempts.delete(key)
    }
  }
  
  disconnectAll() {
    this.connections.forEach((ws, key) => {
      ws.close(1000, 'Normal closure')
    })
    this.connections.clear()
    this.reconnectAttempts.clear()
  }
}

export default WebSocketManager