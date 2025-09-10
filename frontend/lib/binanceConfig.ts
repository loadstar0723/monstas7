// Binance API 설정 (환경 변수에서 로드)
export const BINANCE_CONFIG = {
  // WebSocket 엔드포인트
  WS_BASE: 'wss://stream.binance.com:9443/ws',
  WS_COMBINED: 'wss://stream.binance.com:9443/stream',
  
  // REST API 엔드포인트
  REST_BASE: 'https://api.binance.com',
  BASE_URL: 'https://api.binance.com/api/v3', // 컴포넌트에서 사용하는 BASE_URL 추가
  FUTURES_BASE: 'https://fapi.binance.com',
  API_VERSION: '/api/v3',
  
  // API 키 (환경 변수에서 로드)
  API_KEY: process.env.NEXT_PUBLIC_BINANCE_API_KEY || '',
  SECRET_KEY: process.env.BINANCE_SECRET_KEY || '', // 서버 사이드에서만 사용
  
  // 테스트넷 설정
  USE_TESTNET: process.env.BINANCE_TESTNET === 'true' ? true : false,
  
  // 기본 심볼
  DEFAULT_SYMBOLS: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'],
  
  // WebSocket 스트림 타입
  STREAM_TYPES: {
    TRADE: '@trade',           // 실시간 거래
    KLINE: '@kline_',          // 캔들스틱
    TICKER: '@ticker',         // 24시간 티커
    DEPTH: '@depth',           // 오더북
    AGG_TRADE: '@aggTrade',    // 집계 거래
    BOOK_TICKER: '@bookTicker' // 베스트 bid/ask
  },
  
  // 캔들스틱 인터벌
  KLINE_INTERVALS: {
    '1m': '1m',
    '3m': '3m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '2h': '2h',
    '4h': '4h',
    '6h': '6h',
    '8h': '8h',
    '12h': '12h',
    '1d': '1d',
    '3d': '3d',
    '1w': '1w',
    '1M': '1M'
  }
}

// Binance REST API 헬퍼 함수
export const binanceAPI = {
  // 현재 가격 조회
  getCurrentPrice: async (symbol: string) => {
    const response = await fetch(
      `${BINANCE_CONFIG.REST_BASE}${BINANCE_CONFIG.API_VERSION}/ticker/price?symbol=${symbol}`
    )
    return response.json()
  },
  
  // 24시간 티커 정보
  get24hrTicker: async (symbol: string) => {
    try {
      // 프록시 API 라우트 사용 (CORS 우회) - 올바른 경로 사용
      const response = await fetch(
        `/api/binance/ticker?symbol=${symbol}`
      )
      if (!response.ok) {
        // 404면 직접 Binance API 호출 시도
        if (response.status === 404) {
          const directResponse = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
          )
          if (directResponse.ok) {
            const data = await directResponse.json()
            return { data, error: null }
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      // Content-Type 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format')
      }
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error(`Error fetching 24hr ticker for ${symbol}:`, error)
      // 기본값 반환
      return { 
        data: {
          symbol,
          lastPrice: '0',
          priceChangePercent: '0',
          volume: '0',
          highPrice: '0',
          lowPrice: '0'
        }, 
        error 
      }
    }
  },
  
  // K라인 (캔들스틱) 데이터
  getKlines: async (params: { symbol: string, interval: string, limit?: number }) => {
    try {
      const { symbol, interval, limit = 100 } = params
      // 프록시 API 라우트 사용 (CORS 우회)
      const response = await fetch(
        `/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      // Content-Type 확인
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format')
      }
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error(`Error fetching klines for ${params.symbol}:`, error)
      return { data: null, error }
    }
  },
  
  // 오더북 데이터
  getOrderBook: async (symbol: string, limit: number = 20) => {
    const response = await fetch(
      `${BINANCE_CONFIG.REST_BASE}${BINANCE_CONFIG.API_VERSION}/depth?symbol=${symbol}&limit=${limit}`
    )
    return response.json()
  },
  
  // 최근 거래 내역
  getRecentTrades: async (symbol: string, limit: number = 50) => {
    const response = await fetch(
      `${BINANCE_CONFIG.REST_BASE}${BINANCE_CONFIG.API_VERSION}/trades?symbol=${symbol}&limit=${limit}`
    )
    return response.json()
  },
  
  // 거래소 정보
  getExchangeInfo: async () => {
    const response = await fetch(
      `${BINANCE_CONFIG.REST_BASE}${BINANCE_CONFIG.API_VERSION}/exchangeInfo`
    )
    return response.json()
  }
}

// WebSocket 연결 헬퍼
export const createBinanceWebSocket = (streams: string[]) => {
  const streamUrl = streams.join('/')
  return new WebSocket(`${BINANCE_CONFIG.WS_COMBINED}?streams=${streamUrl}`)
}