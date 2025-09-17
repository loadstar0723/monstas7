// Go Trading Engine ARIMA 통합 훅
import { useState, useEffect, useCallback } from 'react'
import { goTradingEngine } from '@/lib/services/goTradingEngineService'

interface ARIMAParams {
  p: number  // AR 차수
  d: number  // 차분 차수
  i: number  // MA 차수
}

interface TimeSeriesData {
  timestamp: string
  value: number
  trend: number
  seasonal: number
  residual: number
}

interface ACFPACFData {
  lag: number
  acf: number
  pacf: number
  confidence: number
}

interface ForecastData {
  timestamp: string
  forecast: number
  lower: number
  upper: number
  confidence: number
}

interface DiagnosticResult {
  ljungBox: {
    statistic: number
    pValue: number
    passed: boolean
  }
  adf: {
    statistic: number
    pValue: number
    isStationary: boolean
  }
  residuals: {
    mean: number
    std: number
    skewness: number
    kurtosis: number
  }
}

interface UseGoARIMAOptions {
  symbol: string
  period?: string
  autoFit?: boolean
}

export function useGoARIMA({ symbol, period = '1h', autoFit = true }: UseGoARIMAOptions) {
  const [params, setParams] = useState<ARIMAParams>({ p: 1, d: 1, i: 1 })
  const [decomposition, setDecomposition] = useState<TimeSeriesData[]>([])
  const [acfData, setACFData] = useState<ACFPACFData[]>([])
  const [pacfData, setPACFData] = useState<ACFPACFData[]>([])
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 시계열 분해 가져오기
  const fetchDecomposition = useCallback(async () => {
    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/arima/decomposition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, period })
      })

      if (!response.ok) throw new Error('Failed to fetch decomposition')
      const data = await response.json()
      setDecomposition(data.decomposition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decomposition failed')
    }
  }, [symbol, period])

  // ACF/PACF 분석
  const fetchACFPACF = useCallback(async () => {
    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/arima/acfpacf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, period, maxLag: 40 })
      })

      if (!response.ok) throw new Error('Failed to fetch ACF/PACF')
      const data = await response.json()
      setACFData(data.acf)
      setPACFData(data.pacf)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ACF/PACF analysis failed')
    }
  }, [symbol, period])

  // Auto ARIMA 실행
  const runAutoARIMA = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/arima/auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          period,
          maxP: 5,
          maxD: 2,
          maxQ: 5,
          seasonal: false
        })
      })

      if (!response.ok) throw new Error('Auto ARIMA failed')
      const data = await response.json()

      setParams(data.bestParams)
      setForecast(data.forecast)

      return data.bestParams
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto ARIMA failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [symbol, period])

  // 예측 생성
  const generateForecast = useCallback(async (steps: number = 24) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/arima/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          period,
          params,
          steps,
          confidence: 0.95
        })
      })

      if (!response.ok) throw new Error('Forecast generation failed')
      const data = await response.json()

      setForecast(data.forecast)
      return data.forecast
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Forecast failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [symbol, period, params])

  // 모델 진단
  const runDiagnostics = useCallback(async () => {
    try {
      const response = await fetch(`${goTradingEngine.baseUrl}/api/arima/diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          period,
          params
        })
      })

      if (!response.ok) throw new Error('Diagnostics failed')
      const data = await response.json()

      setDiagnostics(data.diagnostics)
      return data.diagnostics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnostics failed')
      return null
    }
  }, [symbol, period, params])

  // WebSocket 실시간 업데이트
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await goTradingEngine.connectWebSocket()

        // ARIMA 실시간 업데이트 구독
        goTradingEngine.subscribe('arima_update', (data: any) => {
          if (data.symbol === symbol) {
            // 새 데이터로 예측 업데이트
            if (data.forecast) {
              setForecast(data.forecast)
            }
            // 모델 파라미터 업데이트
            if (data.params) {
              setParams(data.params)
            }
          }
        })

        // 초기 데이터 로드
        await fetchDecomposition()
        await fetchACFPACF()

        // Auto ARIMA 실행
        if (autoFit) {
          await runAutoARIMA()
        }
      } catch (err) {
        console.error('WebSocket connection failed:', err)
        setError('실시간 연결 실패')
      }
    }

    connectWebSocket()

    return () => {
      goTradingEngine.unsubscribe('arima_update')
    }
  }, [symbol, period, autoFit, fetchDecomposition, fetchACFPACF, runAutoARIMA])

  return {
    params,
    setParams,
    decomposition,
    acfData,
    pacfData,
    forecast,
    diagnostics,
    isLoading,
    error,
    runAutoARIMA,
    generateForecast,
    runDiagnostics,
    fetchDecomposition,
    fetchACFPACF
  }
}