// WebSocket 연결 관리 유틸리티

import { FOOTPRINT_CONFIG } from '../config/constants'

export class FootprintWebSocket {
  private ws: WebSocket | null = null
  private symbol: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = FOOTPRINT_CONFIG.MAX_RECONNECT_ATTEMPTS
  private reconnectTimeout: NodeJS.Timeout | null = null
  private onMessageCallback: ((data: any) => void) | null = null
  private onStatusCallback: ((connected: boolean) => void) | null = null

  constructor(symbol: string) {
    this.symbol = symbol
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      const streamName = this.symbol.toLowerCase()
      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}@aggTrade`)
      
      this.ws.onopen = () => {
        console.log(`풋프린트 WebSocket 연결됨: ${this.symbol}`)
        this.reconnectAttempts = 0
        this.onStatusCallback?.(true)
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessageCallback?.(data)
        } catch (error) {
          console.error('메시지 처리 오류:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket 오류:', error)
        this.onStatusCallback?.(false)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket 연결 종료')
        this.onStatusCallback?.(false)
        this.handleReconnect()
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      this.onStatusCallback?.(false)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(FOOTPRINT_CONFIG.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts), FOOTPRINT_CONFIG.MAX_RECONNECT_DELAY)
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
        this.connect()
      }, delay)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback
  }

  onStatus(callback: (connected: boolean) => void) {
    this.onStatusCallback = callback
  }

  changeSymbol(newSymbol: string) {
    this.symbol = newSymbol
    this.disconnect()
    this.connect()
  }
}