'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ChartData } from '@/components/technical/types'

interface UseChartDataProps {
  symbol: string
  interval?: string
  limit?: number
}

export function useChartData({ 
  symbol, 
  interval = '1m', 
  limit = 500 
}: UseChartDataProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      // Binance Klines API 호출
      const response = await fetch(
        `/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )

      if (!response.ok) {
        // 프록시 실패 시 직접 Binance API 호출
        const directResponse = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        )
        
        if (directResponse.ok) {
          const klineData = await directResponse.json()
          const processedData = processKlineData(klineData)
          setChartData(processedData)
        } else {
          throw new Error('Failed to fetch chart data')
        }
      } else {
        const result = await response.json()
        const klineData = result.data || result
        const processedData = processKlineData(klineData)
        setChartData(processedData)
      }
    } catch (err) {
      console.error('Chart data fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data')
    } finally {
      setLoading(false)
    }
  }, [symbol, interval, limit])

  // Kline 데이터 처리 함수
  const processKlineData = (klineData: any[]): ChartData[] => {
    if (!Array.isArray(klineData)) return []

    return klineData.map((candle: any[]) => ({
      time: new Date(candle[0]).toISOString(),
      value: parseFloat(candle[4]), // close price
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }))
  }

  // symbol 변경 시 데이터 재로드
  useEffect(() => {
    fetchChartData()
  }, [symbol, interval, limit])

  return {
    chartData,
    loading,
    error,
    refetch: fetchChartData
  }
}

// 실시간 차트 업데이트 훅
export function useRealtimeChart(
  symbol: string,
  initialData: ChartData[] = [],
  maxDataPoints: number = 500
) {
  const [data, setData] = useState<ChartData[]>(initialData)
  
  const updateChart = useCallback((newPoint: ChartData) => {
    setData(prev => {
      const updated = [...prev, newPoint]
      // 최대 데이터 포인트 유지
      if (updated.length > maxDataPoints) {
        return updated.slice(-maxDataPoints)
      }
      return updated
    })
  }, [maxDataPoints])

  const updateLastPoint = useCallback((updatedPoint: Partial<ChartData>) => {
    setData(prev => {
      if (prev.length === 0) return prev
      
      const updated = [...prev]
      const lastIndex = updated.length - 1
      updated[lastIndex] = {
        ...updated[lastIndex],
        ...updatedPoint
      }
      return updated
    })
  }, [])

  const reset = useCallback(() => {
    setData([])
  }, [])

  return {
    data,
    updateChart,
    updateLastPoint,
    reset,
    setData
  }
}

// 여러 시간대 차트 데이터 훅
export function useMultiTimeframeData(symbol: string) {
  const [timeframes, setTimeframes] = useState<{
    '1m': ChartData[]
    '5m': ChartData[]
    '15m': ChartData[]
    '1h': ChartData[]
    '4h': ChartData[]
    '1d': ChartData[]
  }>({
    '1m': [],
    '5m': [],
    '15m': [],
    '1h': [],
    '4h': [],
    '1d': []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) return

    const fetchAllTimeframes = async () => {
      setLoading(true)
      
      const intervals = ['1m', '5m', '15m', '1h', '4h', '1d']
      const promises = intervals.map(async (interval) => {
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
          )
          const data = await response.json()
          return { interval, data }
        } catch (err) {
          console.error(`Failed to fetch ${interval} data:`, err)
          return { interval, data: [] }
        }
      })

      const results = await Promise.all(promises)
      
      const newTimeframes: any = {}
      results.forEach(({ interval, data }) => {
        newTimeframes[interval] = data.map((candle: any[]) => ({
          time: new Date(candle[0]).toISOString(),
          value: parseFloat(candle[4]),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }))
      })
      
      setTimeframes(newTimeframes)
      setLoading(false)
    }

    fetchAllTimeframes()
  }, [symbol])

  return { timeframes, loading }
}