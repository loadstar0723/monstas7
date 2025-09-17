// WebSocket 연결 관리자 - 자동 폴백 기능 포함
import { alternativeDataService } from './services/alternativeDataService';

class WebSocketManagerWithFallback {
  private static instance: WebSocketManagerWithFallback
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private useFallback: boolean = false

  private constructor() {}

  static getInstance(): WebSocketManagerWithFallback {
    if (!WebSocketManagerWithFallback.instance) {
      WebSocketManagerWithFallback.instance = new WebSocketManagerWithFallback()
    }
    return WebSocketManagerWithFallback.instance
  }

  connect(
    key: string,
    url: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onConnect?: (ws: WebSocket) => void,
    symbols?: string[] // 폴백용 심볼 리스트
  ): WebSocket | null {
    // Binance WebSocket URL인 경우 폴백 모드 체크
    if (url.includes('binance.com') && this.useFallback && symbols) {
      console.log('Using CryptoCompare WebSocket as fallback');
      const fallbackWs = alternativeDataService.connectWebSocket(symbols, onMessage);
      if (fallbackWs) {
        this.connections.set(key, fallbackWs);
        return fallbackWs;
      }
    }

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

    try {
      // 새 연결 생성
      const ws = new WebSocket(url)

      ws.onopen = () => {
        this.reconnectAttempts.set(key, 0)
        this.useFallback = false // 성공하면 폴백 해제
        console.log(`WebSocket ${key} connected successfully`);
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

        // Binance 연결 실패 시 폴백 모드 활성화
        if (url.includes('binance.com')) {
          console.log('Binance WebSocket failed, activating fallback mode');
          this.useFallback = true;

          // 폴백 WebSocket 시도
          if (symbols) {
            const fallbackWs = alternativeDataService.connectWebSocket(symbols, onMessage);
            if (fallbackWs) {
              this.connections.set(key + '_fallback', fallbackWs);
            }
          }
        }

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
            this.connect(key, url, onMessage, onError, onOpen, onClose, onConnect, symbols)
          }, delay)
        } else if (url.includes('binance.com')) {
          // 최대 재연결 시도 후 폴백 모드 영구 활성화
          this.useFallback = true;
          console.log('Permanently switching to fallback data source');
        }
      }

      this.connections.set(key, ws)
      return ws
    } catch (error) {
      console.error(`Failed to create WebSocket for ${key}:`, error);

      // 즉시 폴백 사용
      if (url.includes('binance.com') && symbols) {
        this.useFallback = true;
        const fallbackWs = alternativeDataService.connectWebSocket(symbols, onMessage);
        if (fallbackWs) {
          this.connections.set(key + '_fallback', fallbackWs);
          return fallbackWs;
        }
      }

      return null;
    }
  }

  disconnect(key: string) {
    // 메인 연결 종료
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
    }

    // 폴백 연결도 종료
    const fallbackWs = this.connections.get(key + '_fallback')
    if (fallbackWs) {
      fallbackWs.close(1000, 'Normal closure')
      this.connections.delete(key + '_fallback')
    }

    // 약간의 지연 후 재연결 카운터 초기화
    setTimeout(() => {
      this.reconnectAttempts.delete(key)
    }, 100)
  }

  disconnectAll() {
    this.connections.forEach((ws, key) => {
      ws.close(1000, 'Normal closure')
    })
    this.connections.clear()
    this.reconnectAttempts.clear()
    this.useFallback = false
  }

  // 폴백 모드 상태 확인
  isUsingFallback(): boolean {
    return this.useFallback;
  }

  // 폴백 모드 수동 설정
  setFallbackMode(enabled: boolean) {
    this.useFallback = enabled;
    console.log(`Fallback mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export default WebSocketManagerWithFallback