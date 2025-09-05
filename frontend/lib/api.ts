/**
 * API 클라이언트
 * FastAPI 백엔드와 통신
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class APIClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // AI 예측
  async getAIPrediction(symbol: string, timeframe: string = '1h') {
    return this.request('/api/v1/ai/predict', {
      method: 'POST',
      body: JSON.stringify({ symbol, timeframe }),
    })
  }

  // 배치 예측
  async getBatchPredictions(symbols: string[]) {
    return this.request(`/api/v1/ai/predictions/batch?symbols=${symbols.join(',')}`)
  }

  // 시장 분석
  async getMarketAnalysis(symbol: string) {
    return this.request(`/api/v1/market/analysis/${symbol}`)
  }

  // 백테스팅
  async runBacktest(params: {
    strategy: string
    symbol: string
    start_date: string
    end_date: string
    initial_capital: number
  }) {
    return this.request('/api/v1/backtest', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // 포트폴리오 최적화
  async optimizePortfolio(riskLevel: string = 'moderate') {
    return this.request(`/api/v1/portfolio/optimize?risk_level=${riskLevel}`)
  }

  // 뉴스 감정 분석
  async getNewsSentiment() {
    return this.request('/api/v1/news/sentiment')
  }

  // WebSocket 연결
  connectWebSocket(onMessage: (data: any) => void) {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') {
      return null
    }

    const wsURL = this.baseURL.replace('http', 'ws') + '/ws'
    
    try {
      const ws = new WebSocket(wsURL)
      let reconnectAttempts = 0
      const maxReconnectAttempts = 5

      ws.onopen = () => {
        console.log('WebSocket connected to:', wsURL)
        reconnectAttempts = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError)
        }
      }

      ws.onerror = (error) => {
        console.warn('WebSocket connection error to:', wsURL)
        // WebSocket 에러 객체는 보안상 상세 정보를 제공하지 않음
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason)
        
        // 정상 종료가 아니고 재연결 시도 횟수가 남아있을 때만 재연결
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // 지수 백오프
          console.log(`Reconnecting WebSocket in ${delay}ms... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
          
          setTimeout(() => {
            this.connectWebSocket(onMessage)
          }, delay)
        }
      }

      return ws
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      return null
    }
  }
}

export const apiClient = new APIClient()