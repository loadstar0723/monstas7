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
    const wsURL = this.baseURL.replace('http', 'ws') + '/ws'
    const ws = new WebSocket(wsURL)

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      // 자동 재연결
      setTimeout(() => {
        this.connectWebSocket(onMessage)
      }, 5000)
    }

    return ws
  }
}

export const apiClient = new APIClient()