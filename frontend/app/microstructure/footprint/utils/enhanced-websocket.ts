// 향상된 WebSocket 연결 관리자 - 성능 최적화 및 에러 처리 강화
import { FOOTPRINT_CONFIG } from '../config/constants'

interface WebSocketConfig {
  symbol: string
  onMessage: (data: any) => void
  onStatus: (connected: boolean) => void
  onError?: (error: Error) => void
  onReconnect?: (attempt: number) => void
}

export class EnhancedFootprintWebSocket {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private messageQueue: any[] = []
  private isReconnecting = false
  private lastPong = Date.now()
  private connectionStartTime = 0
  private messageCount = 0
  
  constructor(config: WebSocketConfig) {
    this.config = config
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      try {
        const streamName = this.config.symbol.toLowerCase()
        // 다중 스트림 지원을 위한 URL 구성
        const streams = [`${streamName}@aggTrade`, `${streamName}@depth20`, `${streamName}@ticker`]
        const url = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
        
        this.ws = new WebSocket(url)
        this.connectionStartTime = Date.now()
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          this.isReconnecting = false
          this.config.onStatus(true)
          this.startHeartbeat()
          this.processQueuedMessages()
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.messageCount++
            
            // 스트림별 데이터 처리
            if (data.stream && data.data) {
              const streamType = data.stream.split('@')[1]
              this.config.onMessage({
                type: streamType,
                data: data.data,
                timestamp: Date.now()
              })
            }
          } catch (error) {
            console.error('[WebSocket] 메시지 파싱 오류:', error)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('[WebSocket] 오류:', error)
          this.config.onError?.(new Error('WebSocket connection error'))
          this.config.onStatus(false)
          reject(error)
        }
        
        this.ws.onclose = (event) => {
          this.stopHeartbeat()
          this.config.onStatus(false)
          
          // 정상 종료가 아닌 경우 재연결
          if (event.code !== 1000 && !this.isReconnecting) {
            this.handleReconnect()
          }
        }

        // 연결 타임아웃 처리
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close()
            reject(new Error('Connection timeout'))
          }
        }, 10000)
        
      } catch (error) {
        console.error('[WebSocket] 연결 실패:', error)
        this.config.onStatus(false)
        reject(error)
      }
    })
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Binance는 pong frame을 자동으로 보내므로 별도 ping 불필요
        // 대신 연결 상태를 주기적으로 체크
        const now = Date.now()
        if (now - this.lastPong > 60000) { // 1분 이상 응답 없음
          this.ws.close()
        }
      }
    }, 30000) // 30초마다 체크
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private handleReconnect() {
    if (this.isReconnecting) return
    
    this.isReconnecting = true
    
    if (this.reconnectAttempts >= FOOTPRINT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.error('[WebSocket] 최대 재연결 시도 횟수 초과')
      this.config.onError?.(new Error('Max reconnection attempts reached'))
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      FOOTPRINT_CONFIG.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1),
      FOOTPRINT_CONFIG.MAX_RECONNECT_DELAY
    )
    
    `)
    this.config.onReconnect?.(this.reconnectAttempts)
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        console.error('[WebSocket] 재연결 실패:', error)
        this.handleReconnect()
      }
    }, delay)
  }

  private processQueuedMessages() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // 연결이 끊어진 경우 큐에 저장
      this.messageQueue.push(message)
      }
  }

  disconnect() {
    this.isReconnecting = false
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close(1000, 'Normal closure')
      this.ws = null
    }
    
    this.messageQueue = []
  }

  changeSymbol(newSymbol: string) {
    const oldSymbol = this.config.symbol
    this.config.symbol = newSymbol
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      // 기존 스트림 구독 해제
      const unsubscribe = {
        method: 'UNSUBSCRIBE',
        params: [
          `${oldSymbol.toLowerCase()}@aggTrade`,
          `${oldSymbol.toLowerCase()}@depth20`,
          `${oldSymbol.toLowerCase()}@ticker`
        ],
        id: Date.now()
      }
      this.send(unsubscribe)
      
      // 새 스트림 구독
      const subscribe = {
        method: 'SUBSCRIBE',
        params: [
          `${newSymbol.toLowerCase()}@aggTrade`,
          `${newSymbol.toLowerCase()}@depth20`,
          `${newSymbol.toLowerCase()}@ticker`
        ],
        id: Date.now() + 1
      }
      this.send(subscribe)
    } else {
      // 연결이 끊어진 경우 재연결
      this.disconnect()
      this.connect()
    }
  }

  getStats() {
    const uptime = this.connectionStartTime ? Date.now() - this.connectionStartTime : 0
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      uptime,
      messageCount: this.messageCount,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    }
  }

  // 스트림 관리 메서드
  subscribeToStream(stream: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now()
      })
    }
  }

  unsubscribeFromStream(stream: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        method: 'UNSUBSCRIBE',
        params: [stream],
        id: Date.now()
      })
    }
  }
}