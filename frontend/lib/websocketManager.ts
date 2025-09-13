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
    // 기존 연결이 있으면 먼저 정리
    const existing = this.connections.get(key)
    if (existing) {
      if (existing.readyState === WebSocket.OPEN) {
        return existing
      } else if (existing.readyState === WebSocket.CONNECTING) {
        return existing
      } else {
        // 닫히거나 닫히는 중인 연결은 정리
        this.disconnect(key)
      }
    }
    
    // 새 연결 생성
    const ws = new WebSocket(url)
    
    ws.onopen = () => {
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
      this.connections.delete(key)
      onClose?.()
      
      // 자동 재연결
      const attempts = this.reconnectAttempts.get(key) || 0
      if (attempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000)
        setTimeout(() => {
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
      // 재연결 시도 차단을 위해 최대값 설정
      this.reconnectAttempts.set(key, this.maxReconnectAttempts)
      
      // onclose 이벤트 제거하여 재연결 방지
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      ws.onopen = null
      
      // WebSocket 종료
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Normal closure')
      }
      
      this.connections.delete(key)
      
      // 약간의 지연 후 재연결 카운터 초기화
      setTimeout(() => {
        this.reconnectAttempts.delete(key)
      }, 100)
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