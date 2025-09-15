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

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        console.warn(`API Error: ${response.status} ${response.statusText} for ${endpoint}`)
        throw new Error(`API Error: ${response.statusText}`)
      }

      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Non-JSON response from ${endpoint}`)
        return {} as T
      }

      // Safely parse JSON
      const text = await response.text()
      if (!text) {
        return {} as T
      }

      try {
        return JSON.parse(text)
      } catch (parseError) {
        console.error(`Failed to parse JSON from ${endpoint}:`, parseError)
        console.error('Response text:', text.substring(0, 200))
        return {} as T
      }
    } catch (error) {
      // Network error or backend not running
      console.warn(`Backend unavailable for ${endpoint}:`, error)
      return {} as T
    }
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

  // 실시간 데이터 연동 메서드들 추가
  
  // 다중 시간대 플랜 생성
  async generateTimeframePlans(symbol: string, currentPrice: number) {
    return this.request('/api/v1/trading/timeframe-plans', {
      method: 'POST',
      body: JSON.stringify({ symbol, currentPrice }),
    })
  }

  // 백테스트 데이터 조회
  async getBacktestResults(symbol: string, pattern: string) {
    return this.request(`/api/v1/backtest/results/${symbol}/${pattern}`)
  }

  // 포트폴리오 데이터 조회
  async getPortfolio(userId: string) {
    return this.request(`/api/v1/portfolio/${userId}`)
  }

  // 포트폴리오 업데이트
  async updatePortfolio(userId: string, portfolio: any) {
    return this.request(`/api/v1/portfolio/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(portfolio),
    })
  }

  // 알림 설정 조회
  async getAlerts(userId: string) {
    return this.request(`/api/v1/alerts/${userId}`)
  }

  // 알림 설정 저장
  async saveAlerts(userId: string, alerts: any[]) {
    return this.request(`/api/v1/alerts/${userId}`, {
      method: 'POST',
      body: JSON.stringify(alerts),
    })
  }

  // AI 상세 분석 조회
  async getDetailedAIAnalysis(symbol: string) {
    return this.request(`/api/v1/ai/detailed-analysis/${symbol}`)
  }

  // AI 분석 새로고침
  async refreshAIAnalysis(symbol: string) {
    return this.request(`/api/v1/ai/analysis/${symbol}/refresh`, {
      method: 'POST',
    })
  }

  // 수익 계산
  async calculateProfit(params: {
    symbol: string
    capital: number
    leverage: number
    entryPrice: number
    stopLoss: number
    targets: number[]
  }) {
    return this.request('/api/v1/trading/calculate-profit', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // 실시간 시장 데이터 조회
  async getMarketData(symbol: string) {
    return this.request(`/api/v1/market/data/${symbol}`)
  }

  // 데이터베이스 쿼리 실행
  async executeQuery(query: string, params: any[] = []) {
    return this.request('/api/v1/db/query', {
      method: 'POST',
      body: JSON.stringify({ query, params }),
    })
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
        // WebSocket 에러 객체는 보안상 상세 정보를 제공하지 않음
      }

      ws.onclose = (event) => {
        // 정상 종료가 아니고 재연결 시도 횟수가 남아있을 때만 재연결
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // 지수 백오프
          
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