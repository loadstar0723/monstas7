/**
 * Enhanced WebSocket Manager
 * 자동 재연결, 메시지 큐잉, 에러 핸들링
 */

interface WebSocketConfig {
  url: string
  maxReconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  messageQueueSize?: number
}

interface QueuedMessage {
  data: any
  timestamp: number
  priority: 'high' | 'normal' | 'low'
}

export class EnhancedWebSocketManager {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private isConnecting = false
  private isConnected = false
  private messageQueue: QueuedMessage[] = []
  private listeners: Map<string, Set<Function>> = new Map()
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private connectionPromise: Promise<void> | null = null

  constructor(config: WebSocketConfig) {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectInterval: 2000,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      ...config
    }
  }

  // 연결 시작
  async connect(): Promise<void> {
    if (this.isConnected) return
    if (this.isConnecting) return this.connectionPromise!

    this.isConnecting = true
    this.connectionPromise = this._connect()
    return this.connectionPromise
  }

  private async _connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[WSManager] Connecting to ${this.config.url}`)
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('[WSManager] Connected successfully')
          this.isConnected = true
          this.isConnecting = false
          this.reconnectAttempts = 0

          // 큐에 있던 메시지 전송
          this.flushMessageQueue()

          // 하트비트 시작
          this.startHeartbeat()

          // 연결 성공 이벤트
          this.emit('connected', null)

          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit('message', data)

            // 메시지 타입별 이벤트
            if (data.type) {
              this.emit(data.type, data)
            }
          } catch (error) {
            console.error('[WSManager] Failed to parse message:', error)
            this.emit('error', { type: 'parse_error', error })
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WSManager] WebSocket error:', error)
          this.emit('error', { type: 'connection_error', error })

          if (this.isConnecting) {
            reject(error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('[WSManager] Connection closed:', event.code, event.reason)
          this.isConnected = false
          this.isConnecting = false

          // 하트비트 중지
          this.stopHeartbeat()

          // 연결 종료 이벤트
          this.emit('disconnected', { code: event.code, reason: event.reason })

          // 자동 재연결
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect()
          }
        }

      } catch (error) {
        console.error('[WSManager] Failed to create WebSocket:', error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // 재연결 스케줄링
  private scheduleReconnect() {
    if (this.reconnectTimer) return

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts - 1)

    console.log(`[WSManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(error => {
        console.error('[WSManager] Reconnection failed:', error)
      })
    }, delay)
  }

  // 하트비트
  private startHeartbeat() {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' }, 'high')
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 메시지 전송
  send(data: any, priority: 'high' | 'normal' | 'low' = 'normal'): boolean {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data))
        return true
      } catch (error) {
        console.error('[WSManager] Failed to send message:', error)
        this.queueMessage(data, priority)
        return false
      }
    } else {
      // 연결되지 않은 경우 큐에 추가
      this.queueMessage(data, priority)

      // 연결 시도
      if (!this.isConnecting) {
        this.connect()
      }

      return false
    }
  }

  // 메시지 큐잉
  private queueMessage(data: any, priority: 'high' | 'normal' | 'low') {
    // 큐 크기 제한
    if (this.messageQueue.length >= this.config.messageQueueSize!) {
      // 우선순위가 낮은 메시지 제거
      const lowPriorityIndex = this.messageQueue.findIndex(m => m.priority === 'low')
      if (lowPriorityIndex !== -1) {
        this.messageQueue.splice(lowPriorityIndex, 1)
      } else if (priority !== 'high') {
        // 새 메시지 우선순위가 높지 않으면 무시
        return
      }
    }

    this.messageQueue.push({
      data,
      timestamp: Date.now(),
      priority
    })

    // 우선순위별 정렬
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // 큐 플러시
  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message.data, message.priority)
      }
    }
  }

  // 이벤트 리스너
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[WSManager] Error in event listener for ${event}:`, error)
      }
    })
  }

  // 구독 관리
  subscribe(channel: string, params?: any) {
    this.send({
      type: 'subscribe',
      channel,
      params
    }, 'high')
  }

  unsubscribe(channel: string) {
    this.send({
      type: 'unsubscribe',
      channel
    }, 'high')
  }

  // 연결 종료
  disconnect() {
    console.log('[WSManager] Disconnecting...')

    // 재연결 타이머 취소
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 하트비트 중지
    this.stopHeartbeat()

    // WebSocket 종료
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.isConnected = false
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.messageQueue = []
  }

  // 상태 확인
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      readyState: this.ws?.readyState
    }
  }
}

// Binance WebSocket 전용 관리자
export class BinanceWebSocketManager extends EnhancedWebSocketManager {
  private symbols: Set<string> = new Set()
  private streams: Set<string> = new Set()

  constructor() {
    super({
      url: 'wss://stream.binance.com:9443/ws',
      maxReconnectAttempts: 10,
      reconnectInterval: 1000,
      heartbeatInterval: 60000
    })

    // Binance 특화 이벤트 처리
    this.on('message', (data: any) => {
      if (data.e === 'trade') {
        this.emit('trade', {
          symbol: data.s,
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          time: data.T
        })
      } else if (data.e === '24hrTicker') {
        this.emit('ticker', {
          symbol: data.s,
          price: parseFloat(data.c),
          change: parseFloat(data.P),
          volume: parseFloat(data.v),
          high: parseFloat(data.h),
          low: parseFloat(data.l)
        })
      } else if (data.e === 'depthUpdate') {
        this.emit('orderbook', {
          symbol: data.s,
          bids: data.b.map((b: string[]) => ({ price: parseFloat(b[0]), quantity: parseFloat(b[1]) })),
          asks: data.a.map((a: string[]) => ({ price: parseFloat(a[0]), quantity: parseFloat(a[1]) }))
        })
      }
    })
  }

  // 심볼 구독
  subscribeToSymbol(symbol: string, streams: string[] = ['trade', 'ticker']) {
    this.symbols.add(symbol)

    streams.forEach(stream => {
      const streamName = `${symbol.toLowerCase()}@${stream}`
      if (!this.streams.has(streamName)) {
        this.streams.add(streamName)
        this.subscribe('SUBSCRIBE', [streamName])
      }
    })
  }

  // 심볼 구독 해제
  unsubscribeFromSymbol(symbol: string) {
    this.symbols.delete(symbol)

    // 해당 심볼의 모든 스트림 해제
    const symbolStreams = Array.from(this.streams).filter(s =>
      s.startsWith(symbol.toLowerCase())
    )

    symbolStreams.forEach(stream => {
      this.streams.delete(stream)
      this.subscribe('UNSUBSCRIBE', [stream])
    })
  }

  // 모든 심볼 구독 해제
  unsubscribeAll() {
    if (this.streams.size > 0) {
      this.subscribe('UNSUBSCRIBE', Array.from(this.streams))
      this.streams.clear()
      this.symbols.clear()
    }
  }
}

// 싱글톤 인스턴스
export const binanceWS = new BinanceWebSocketManager()