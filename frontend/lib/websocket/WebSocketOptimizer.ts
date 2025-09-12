/**
 * WebSocket 최적화 관리자
 * - 싱글톤 패턴으로 중복 연결 방지
 * - 자동 재연결 및 에러 처리
 * - 연결 풀링으로 성능 최적화
 */

interface WebSocketConnection {
  ws: WebSocket
  subscribers: Set<(data: any) => void>
  lastHeartbeat: number
  reconnectAttempts: number
}

class WebSocketOptimizer {
  private static instance: WebSocketOptimizer
  private connections: Map<string, WebSocketConnection> = new Map()
  private readonly MAX_RECONNECT_ATTEMPTS = 5
  private readonly HEARTBEAT_INTERVAL = 30000 // 30초
  private readonly CONNECTION_TIMEOUT = 10000 // 10초

  static getInstance(): WebSocketOptimizer {
    if (!WebSocketOptimizer.instance) {
      WebSocketOptimizer.instance = new WebSocketOptimizer()
    }
    return WebSocketOptimizer.instance
  }

  /**
   * 심볼별 실시간 가격 구독
   */
  subscribeToPrice(symbol: string, callback: (data: any) => void): () => void {
    const streamName = `${symbol.toLowerCase()}@ticker`
    return this.subscribe(streamName, callback, 'price')
  }

  /**
   * 심볼별 실시간 거래 구독 (고래 추적용)
   */
  subscribeToTrades(symbol: string, callback: (data: any) => void): () => void {
    const streamName = `${symbol.toLowerCase()}@trade`
    return this.subscribe(streamName, callback, 'trade')
  }

  /**
   * 심볼별 실시간 오더북 구독
   */
  subscribeToOrderbook(symbol: string, callback: (data: any) => void): () => void {
    const streamName = `${symbol.toLowerCase()}@depth@100ms`
    return this.subscribe(streamName, callback, 'orderbook')
  }

  /**
   * K라인 실시간 구독
   */
  subscribeToKlines(symbol: string, interval: string, callback: (data: any) => void): () => void {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`
    return this.subscribe(streamName, callback, 'kline')
  }

  /**
   * 24시간 미니티커 구독 (전체 시장)
   */
  subscribeToMiniTicker(callback: (data: any) => void): () => void {
    return this.subscribe('!miniTicker@arr@3000ms', callback, 'miniTicker')
  }

  private subscribe(streamName: string, callback: (data: any) => void, type: string): () => void {
    let connection = this.connections.get(streamName)

    if (!connection) {
      connection = this.createConnection(streamName, type)
      this.connections.set(streamName, connection)
    }

    connection.subscribers.add(callback)

    // 구독 해제 함수 반환
    return () => {
      const conn = this.connections.get(streamName)
      if (conn) {
        conn.subscribers.delete(callback)
        // 구독자가 없으면 연결 종료
        if (conn.subscribers.size === 0) {
          this.closeConnection(streamName)
        }
      }
    }
  }

  private createConnection(streamName: string, type: string): WebSocketConnection {
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`
    const ws = new WebSocket(wsUrl)
    
    const connection: WebSocketConnection = {
      ws,
      subscribers: new Set(),
      lastHeartbeat: Date.now(),
      reconnectAttempts: 0
    }

    ws.onopen = () => {
      console.log(`WebSocket 연결됨: ${streamName}`)
      connection.reconnectAttempts = 0
      connection.lastHeartbeat = Date.now()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        connection.lastHeartbeat = Date.now()
        
        // 구독자들에게 데이터 전달
        connection.subscribers.forEach(callback => {
          callback(this.formatData(data, type))
        })
      } catch (error) {
        console.error('WebSocket 데이터 파싱 오류:', error)
      }
    }

    ws.onerror = (event) => {
      // WebSocket 에러는 주로 연결 종료 시 발생하므로 warn 레벨로 로깅
      if (ws.readyState === WebSocket.CLOSED) {
        // 정상적인 종료 과정에서의 에러는 디버그 레벨로
        console.debug(`WebSocket 연결 종료됨 (${streamName})`)
      } else if (ws.readyState === WebSocket.CLOSING) {
        console.debug(`WebSocket 연결 종료 중 (${streamName})`)
      } else {
        // 실제 연결 문제인 경우만 경고로 표시
        console.warn(`WebSocket 연결 문제 (${streamName}): 재연결 시도 중...`)
        
        // 재연결 시도 정보 추가
        if (connection.reconnectAttempts > 0) {
          console.info(`→ 재연결 시도: ${connection.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`)
        }
      }
    }

    ws.onclose = (event) => {
      console.log(`WebSocket 연결 종료 (${streamName}):`, event.code, event.reason)
      
      // 정상 종료가 아니고 재연결 시도가 남아있으면 재연결
      if (event.code !== 1000 && connection.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          this.reconnect(streamName, type)
        }, Math.pow(2, connection.reconnectAttempts) * 1000) // 지수 백오프
      }
    }

    // 하트비트 체크
    this.setupHeartbeat(streamName)

    return connection
  }

  private reconnect(streamName: string, type: string) {
    const connection = this.connections.get(streamName)
    if (!connection) return

    connection.reconnectAttempts++
    console.log(`재연결 시도 ${connection.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}: ${streamName}`)

    // 기존 WebSocket 정리
    if (connection.ws) {
      connection.ws.close()
    }

    // 새 연결 생성
    const newConnection = this.createConnection(streamName, type)
    newConnection.subscribers = connection.subscribers
    this.connections.set(streamName, newConnection)
  }

  private setupHeartbeat(streamName: string) {
    setInterval(() => {
      const connection = this.connections.get(streamName)
      if (!connection) return

      const now = Date.now()
      if (now - connection.lastHeartbeat > this.HEARTBEAT_INTERVAL * 2) {
        console.warn(`하트비트 타임아웃: ${streamName}`)
        this.reconnect(streamName, 'heartbeat')
      }
    }, this.HEARTBEAT_INTERVAL)
  }

  private formatData(data: any, type: string): any {
    switch (type) {
      case 'price':
        return {
          symbol: data.s,
          price: parseFloat(data.c),
          change: parseFloat(data.P),
          changePercent: parseFloat(data.P),
          volume: parseFloat(data.v),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          timestamp: data.E
        }
      
      case 'trade':
        return {
          symbol: data.s,
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          timestamp: data.T,
          isBuyerMaker: data.m,
          tradeId: data.t
        }
      
      case 'orderbook':
        return {
          symbol: data.s,
          bids: data.b?.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty)
          })) || [],
          asks: data.a?.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty)
          })) || [],
          timestamp: data.E
        }
      
      case 'kline':
        const kline = data.k
        return {
          symbol: kline.s,
          openTime: kline.t,
          closeTime: kline.T,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
          interval: kline.i,
          isKlineClosed: kline.x
        }
      
      case 'miniTicker':
        if (Array.isArray(data)) {
          return data.map(ticker => ({
            symbol: ticker.s,
            price: parseFloat(ticker.c),
            change: parseFloat(ticker.P)
          }))
        }
        return data
      
      default:
        return data
    }
  }

  private closeConnection(streamName: string) {
    const connection = this.connections.get(streamName)
    if (connection) {
      connection.ws.close(1000)
      this.connections.delete(streamName)
      console.log(`WebSocket 연결 해제: ${streamName}`)
    }
  }

  /**
   * 모든 연결 종료
   */
  closeAllConnections() {
    this.connections.forEach((connection, streamName) => {
      connection.ws.close(1000)
    })
    this.connections.clear()
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus(): { [key: string]: string } {
    const status: { [key: string]: string } = {}
    this.connections.forEach((connection, streamName) => {
      status[streamName] = this.getReadyStateString(connection.ws.readyState)
    })
    return status
  }

  private getReadyStateString(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING'
      case WebSocket.OPEN: return 'OPEN'
      case WebSocket.CLOSING: return 'CLOSING'
      case WebSocket.CLOSED: return 'CLOSED'
      default: return 'UNKNOWN'
    }
  }
}

export default WebSocketOptimizer