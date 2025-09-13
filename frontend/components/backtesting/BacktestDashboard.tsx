'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// 동적 임포트로 성능 최적화
const StrategyAnalyzer = dynamic(() => import('./StrategyAnalyzer'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800 rounded-lg" />,
  ssr: false
})

const PerformanceMetrics = dynamic(() => import('./PerformanceMetrics'), {
  loading: () => <div className="animate-pulse h-48 bg-gray-800 rounded-lg" />,
  ssr: false
})

const BacktestChart = dynamic(() => import('./BacktestChart'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />,
  ssr: false
})

const HistoricalAnalysis = dynamic(() => import('./HistoricalAnalysis'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800 rounded-lg" />,
  ssr: false
})

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface BacktestDashboardProps {
  coin: Coin
  onError: (error: string | null) => void
  onLoadingChange: (loading: boolean) => void
}

interface BacktestData {
  historicalPrices: any[]
  metrics: any
  strategies: any[]
  analysis: any
}

export default function BacktestDashboard({ coin, onError, onLoadingChange }: BacktestDashboardProps) {
  const [backtestData, setBacktestData] = useState<BacktestData | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState('trend-following')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [refreshKey, setRefreshKey] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  // 기간 옵션
  const periodOptions = [
    { value: '7d', label: '7일' },
    { value: '30d', label: '30일' },
    { value: '90d', label: '90일' },
    { value: '180d', label: '180일' },
    { value: '1y', label: '1년' }
  ]

  // 전략 옵션
  const strategyOptions = [
    { value: 'trend-following', label: '추세 추종', description: 'MA 크로스오버 기반' },
    { value: 'mean-reversion', label: '평균 회귀', description: 'RSI 과매수/과매도' },
    { value: 'breakout', label: '돌파 전략', description: '레지스턴스 돌파' },
    { value: 'grid-trading', label: '그리드 트레이딩', description: '일정 간격 매매' },
    { value: 'momentum', label: '모멘텀', description: 'MACD 기반' }
  ]

  // 백테스트 데이터 로드
  useEffect(() => {
    const loadBacktestData = async () => {
      onLoadingChange(true)
      try {
        // 과거 데이터 가져오기 (Binance API)
        const endTime = Date.now()
        const periodDays = parseInt(selectedPeriod.replace(/[^\d]/g, '')) || 30
        const startTime = endTime - (periodDays * 24 * 60 * 60 * 1000)
        
        const interval = periodDays <= 7 ? '1h' : periodDays <= 30 ? '4h' : '1d'
        
        const response = await fetch(`/api/binance/klines?symbol=${coin.symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`)
        
        if (!response.ok) {
          throw new Error('백테스트 데이터를 불러올 수 없습니다.')
        }

        const klines = await response.json()
        
        // 백테스트 실행 (실제 계산)
        const processedData = processBacktestData(klines, selectedStrategy)
        
        // processedData가 undefined인 경우 처리
        if (!processedData) {
          setBacktestData({
            historicalPrices: klines,
            metrics: {
              totalTrades: 0,
              winRate: 0,
              avgProfit: 0,
              maxProfit: 0,
              maxLoss: 0,
              sharpeRatio: 0,
              maxDrawdown: 0
            },
            strategies: [],
            analysis: {
              bestEntry: 0,
              bestExit: 0,
              riskLevel: 'low'
            }
          })
        } else {
          setBacktestData({
            historicalPrices: klines,
            metrics: processedData.metrics,
            strategies: processedData.strategies,
            analysis: processedData.analysis
          })
        }
        
        onError(null)
      } catch (error) {
        console.error('백테스트 데이터 로드 실패:', error)
        onError('백테스트 데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        onLoadingChange(false)
      }
    }

    loadBacktestData()
  }, [coin, selectedStrategy, selectedPeriod, refreshKey])

  // WebSocket 연결 (실시간 업데이트)
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return

    const connectWebSocket = () => {
      try {
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.symbol.toLowerCase()}@kline_1m`)
        
        ws.onopen = () => {
          }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.k && data.k.x) {
              // 캔들 완성 시 백테스트 업데이트
              setRefreshKey(prev => prev + 1)
            }
          } catch (e) {
            console.error('WebSocket 메시지 파싱 에러:', e)
          }
        }

        ws.onerror = (error) => {
          // 5초 후 재연결 시도
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              connectWebSocket()
            }
          }, 5000)
        }

        ws.onclose = () => {
          wsRef.current = null
        }

        wsRef.current = ws
      } catch (error) {
        console.error('WebSocket 생성 실패:', error)
      }
    }

    // 컴포넌트 마운트 후 약간의 딜레이를 두고 연결
    const timer = setTimeout(() => {
      connectWebSocket()
    }, 1000)

    return () => {
      clearTimeout(timer)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [coin])

  // 백테스트 데이터 처리 함수
  const processBacktestData = (klines: any[], strategy: string) => {
    // 실제 백테스팅 로직 구현
    if (!Array.isArray(klines)) {
      return {
        metrics: {
          totalTrades: 0,
          winRate: 0,
          avgProfit: 0,
          maxProfit: 0,
          maxLoss: 0,
          sharpeRatio: 0,
          maxDrawdown: 0
        },
        strategies: [],
        analysis: {
          bestEntry: 0,
          bestExit: 0,
          riskLevel: 'low'
        }
      }
    }
    const prices = klines.map(k => parseFloat(k[4])) // 종가
    const volumes = klines.map(k => parseFloat(k[5]))
    
    // 간단한 백테스트 메트릭 계산 (실제 구현 필요)
    const trades = simulateTrades(prices, strategy)
    const metrics = calculateMetrics(trades, prices)
    
    return {
      metrics: {
        totalTrades: trades.length,
        winRate: (trades.filter(t => t.profit > 0).length / trades.length) * 100,
        avgProfit: trades.reduce((acc, t) => acc + t.profit, 0) / trades.length,
        maxProfit: Math.max(...trades.map(t => t.profit)),
        maxLoss: Math.min(...trades.map(t => t.profit)),
        sharpeRatio: calculateSharpeRatio(trades),
        maxDrawdown: calculateMaxDrawdown(prices)
      },
      strategies: strategyOptions.map(s => ({
        ...s,
        performance: s.value === strategy ? metrics : null
      })),
      analysis: {
        bestEntry: findBestEntry(prices),
        bestExit: findBestExit(prices),
        riskLevel: calculateRiskLevel(prices)
      }
    }
  }

  // 트레이드 시뮬레이션 (간단한 예시)
  const simulateTrades = (prices: number[], strategy: string) => {
    const trades = []
    let position = null
    
    for (let i = 20; i < prices.length; i++) {
      const sma20 = prices.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20
      const sma50 = prices.slice(Math.max(0, i - 50), i).reduce((a, b) => a + b, 0) / Math.min(50, i)
      
      if (strategy === 'trend-following') {
        if (!position && prices[i] > sma20 && sma20 > sma50) {
          position = { entry: prices[i], entryIndex: i }
        } else if (position && prices[i] < sma20) {
          trades.push({
            entry: position.entry,
            exit: prices[i],
            profit: ((prices[i] - position.entry) / position.entry) * 100,
            duration: i - position.entryIndex
          })
          position = null
        }
      }
    }
    
    return trades
  }

  const calculateMetrics = (trades: any[], prices: number[]) => {
    if (trades.length === 0) return {}
    return {
      totalReturn: trades.reduce((acc, t) => acc + t.profit, 0),
      avgDuration: trades.reduce((acc, t) => acc + t.duration, 0) / trades.length
    }
  }

  const calculateSharpeRatio = (trades: any[]) => {
    if (trades.length === 0) return 0
    const returns = trades.map(t => t.profit)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length)
    return stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(252) // 연간화
  }

  const calculateMaxDrawdown = (prices: number[]) => {
    let maxDrawdown = 0
    let peak = prices[0]
    
    for (const price of prices) {
      if (price > peak) peak = price
      const drawdown = ((peak - price) / peak) * 100
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    }
    
    return maxDrawdown
  }

  const findBestEntry = (prices: number[]) => Math.min(...prices)
  const findBestExit = (prices: number[]) => Math.max(...prices)
  const calculateRiskLevel = (prices: number[]) => {
    const volatility = calculateVolatility(prices)
    return volatility > 5 ? 'high' : volatility > 2 ? 'medium' : 'low'
  }

  const calculateVolatility = (prices: number[]) => {
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push(((prices[i] - prices[i - 1]) / prices[i - 1]) * 100)
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    return Math.sqrt(returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length)
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 전략 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">백테스트 전략</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {strategyOptions.map(strategy => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label} - {strategy.description}
                </option>
              ))}
            </select>
          </div>

          {/* 기간 선택 */}
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-400 mb-2">분석 기간</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {periodOptions.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* 새로고침 버튼 */}
          <div className="flex items-end">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all flex items-center gap-2"
            >
              <span>🔄</span>
              재실행
            </button>
          </div>
        </div>
      </div>

      {/* 성과 메트릭 */}
      {backtestData && (
        <PerformanceMetrics
          metrics={backtestData.metrics}
          coin={coin}
          strategy={selectedStrategy}
        />
      )}

      {/* 백테스트 차트 */}
      {backtestData && (
        <BacktestChart
          data={backtestData.historicalPrices}
          coin={coin}
          strategy={selectedStrategy}
        />
      )}

      {/* 전략 분석 */}
      {backtestData && (
        <StrategyAnalyzer
          strategies={backtestData.strategies}
          selectedStrategy={selectedStrategy}
          onStrategyChange={setSelectedStrategy}
        />
      )}

      {/* 과거 데이터 분석 */}
      {backtestData && (
        <HistoricalAnalysis
          analysis={backtestData.analysis}
          coin={coin}
          period={selectedPeriod}
        />
      )}
    </div>
  )
}