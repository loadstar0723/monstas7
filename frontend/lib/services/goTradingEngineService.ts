// Go Trading Engine 서비스
class GoTradingEngine {
  public baseUrl: string
  private ws: WebSocket | null = null
  private subscribers: Map<string, Set<Function>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor() {
    // Go 엔진 서버 URL (개발/프로덕션 자동 감지)
    this.baseUrl = process.env.NEXT_PUBLIC_GO_ENGINE_URL || 'http://localhost:8080'
  }

  // WebSocket 연결
  async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 이미 연결되어 있으면 재사용
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve()
          return
        }

        // WebSocket URL 구성
        const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
        this.ws = new WebSocket(`${wsUrl}/ws`)

        this.ws.onopen = () => {
          console.log('Go Trading Engine WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.notifySubscribers(data)
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.handleReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // 재연결 처리
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket().catch(err => {
        console.error('Reconnection failed:', err)
      })
    }, delay)
  }

  // WebSocket 연결 종료
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.subscribers.clear()
  }

  // 이벤트 구독
  subscribe(eventType: string, callback: Function): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }
    this.subscribers.get(eventType)?.add(callback)
  }

  // 이벤트 구독 해제
  unsubscribe(eventType: string, callback?: Function): void {
    if (callback) {
      this.subscribers.get(eventType)?.delete(callback)
    } else {
      this.subscribers.delete(eventType)
    }
  }

  // 구독자에게 알림
  private notifySubscribers(data: any): void {
    const eventType = data.type || data.event || 'default'
    const callbacks = this.subscribers.get(eventType)

    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (err) {
          console.error('Subscriber callback error:', err)
        }
      })
    }

    // 'all' 이벤트 구독자에게도 알림
    const allCallbacks = this.subscribers.get('all')
    if (allCallbacks) {
      allCallbacks.forEach(callback => {
        try {
          callback(data)
        } catch (err) {
          console.error('All subscriber callback error:', err)
        }
      })
    }
  }

  // WebSocket으로 메시지 전송
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  // HTTP API 호출 헬퍼
  async fetch(endpoint: string, options?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  // 헬스 체크
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetch('/health')
      return response.ok
    } catch {
      return false
    }
  }
}

// 싱글톤 인스턴스
export const goTradingEngine = new GoTradingEngine()

// 타입 정의
export interface PredictionData {
  symbol: string
  direction: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  target: number
  stopLoss: number
  timestamp: string
}

export interface MarketData {
  symbol: string
  price: number
  volume: number
  timestamp: string
}

export interface BacktestResult {
  timestamp: string
  actualPrice: number
  predictedPrice: number
  profit: number
  cumulativeProfit: number
  drawdown: number
  signal: string
  confidence: number
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  mse: number
  rmse: number
  mae: number
  sharpeRatio: number
  maxDrawdown: number
}