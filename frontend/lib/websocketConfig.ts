// WebSocket 설정 - 프로덕션 환경 대응
export const getWebSocketUrl = (stream: string): string => {
  // Binance WebSocket 엔드포인트
  const wsEndpoint = 'wss://stream.binance.com:9443/ws'
  
  // 프로덕션 환경에서는 직접 Binance WebSocket 사용
  return `${wsEndpoint}/${stream}`
}

// WebSocket 연결 옵션
export const wsOptions = {
  // 재연결 설정
  reconnect: true,
  reconnectInterval: 1000,
  reconnectAttempts: 5,
  
  // 타임아웃 설정  
  connectionTimeout: 10000,
  
  // 프로덕션 환경 헤더
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}

// WebSocket 스트림 타입
export const getStreamName = (symbol: string, type: 'trade' | 'kline' | 'ticker', interval?: string): string => {
  const symbolLower = symbol.toLowerCase()
  
  switch (type) {
    case 'trade':
      return `${symbolLower}@trade`
    case 'kline':
      return `${symbolLower}@kline_${interval || '1m'}`
    case 'ticker':
      return `${symbolLower}@ticker`
    default:
      return `${symbolLower}@ticker`
  }
}