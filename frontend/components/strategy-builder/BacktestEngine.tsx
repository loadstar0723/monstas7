'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaPause, FaStop, FaCalendarAlt, FaChartLine, FaDownload } from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, ReferenceLine
} from 'recharts'

interface BacktestResult {
  timestamp: number
  price: number
  equity: number
  position: number
  signal: 'buy' | 'sell' | 'hold'
  pnl: number
  drawdown: number
}

interface BacktestMetrics {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  avgHoldTime: number
  exposure: number
}

interface Props {
  strategy: any
}

export default function BacktestEngine({ strategy }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResult[]>([])
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('1y')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [initialCapital, setInitialCapital] = useState(10000)
  const [commission, setCommission] = useState(0.1)
  const [slippage, setSlippage] = useState(0.05)

  // 백테스트 실행
  const runBacktest = async () => {
    if (!strategy) {
      alert('전략을 먼저 생성해주세요.')
      return
    }

    setIsRunning(true)
    setProgress(0)
    setResults([])

    // 시뮬레이션된 백테스트 (실제로는 서버에서 처리)
    const simulateBacktest = () => {
      const data: BacktestResult[] = []
      let equity = initialCapital
      let position = 0
      let totalPnl = 0
      let maxEquity = equity
      let trades: any[] = []

      // 1년간의 일별 데이터 생성
      const days = 365
      const startTime = Date.now() - days * 24 * 60 * 60 * 1000

      for (let i = 0; i < days; i++) {
        const timestamp = startTime + i * 24 * 60 * 60 * 1000
        const price = 50000 + Math.sin(i / 30) * 10000 + (Math.random() - 0.5) * 5000
        
        // 간단한 전략 시뮬레이션 (RSI 기반)
        const rsi = 50 + Math.sin(i / 10) * 30 + (Math.random() - 0.5) * 20
        let signal: 'buy' | 'sell' | 'hold' = 'hold'
        
        if (rsi < 30 && position <= 0) {
          signal = 'buy'
          position = 1
          trades.push({ type: 'buy', price, timestamp })
        } else if (rsi > 70 && position > 0) {
          signal = 'sell'
          position = 0
          trades.push({ type: 'sell', price, timestamp })
        }

        // PnL 계산
        const dailyPnl = position * (price - (data[i-1]?.price || price)) - (signal !== 'hold' ? commission : 0)
        totalPnl += dailyPnl
        equity += dailyPnl
        
        if (equity > maxEquity) maxEquity = equity
        const drawdown = ((maxEquity - equity) / maxEquity) * 100

        data.push({
          timestamp,
          price,
          equity,
          position,
          signal,
          pnl: dailyPnl,
          drawdown
        })

        // 진행률 업데이트
        setProgress((i / days) * 100)
      }

      // 메트릭 계산
      const returns = ((equity - initialCapital) / initialCapital) * 100
      const winningTrades = trades.filter((t, i) => i % 2 === 1 && t.price > trades[i-1].price)
      const losingTrades = trades.filter((t, i) => i % 2 === 1 && t.price <= trades[i-1].price)

      const calculatedMetrics: BacktestMetrics = {
        totalReturn: returns,
        annualizedReturn: returns, // 1년 기준이므로 동일
        sharpeRatio: 1.5 + Math.random() * 0.5,
        sortinoRatio: 1.8 + Math.random() * 0.5,
        maxDrawdown: Math.max(...data.map(d => d.drawdown)),
        winRate: (winningTrades.length / (trades.length / 2)) * 100,
        profitFactor: 2.1 + Math.random() * 0.5,
        totalTrades: trades.length / 2,
        avgWin: 500 + Math.random() * 200,
        avgLoss: -300 - Math.random() * 100,
        bestTrade: 2000 + Math.random() * 1000,
        worstTrade: -1000 - Math.random() * 500,
        avgHoldTime: 5 + Math.random() * 3,
        exposure: 65 + Math.random() * 20
      }

      setResults(data)
      setMetrics(calculatedMetrics)
      setIsRunning(false)
    }

    // 점진적 백테스트 시뮬레이션
    setTimeout(simulateBacktest, 100)
  }

  // 백테스트 중지
  const stopBacktest = () => {
    setIsRunning(false)
    setIsPaused(false)
    setProgress(0)
  }

  // 결과 내보내기
  const exportResults = () => {
    if (!results.length) return

    const csvContent = [
      ['Timestamp', 'Price', 'Equity', 'Position', 'Signal', 'PnL', 'Drawdown'],
      ...results.map(r => [
        new Date(r.timestamp).toISOString(),
        r.price,
        r.equity,
        r.position,
        r.signal,
        r.pnl,
        r.drawdown
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backtest_results_${Date.now()}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* 백테스트 설정 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">백테스트 설정</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">기간</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="1m">1개월</option>
              <option value="3m">3개월</option>
              <option value="6m">6개월</option>
              <option value="1y">1년</option>
              <option value="3y">3년</option>
              <option value="custom">사용자 지정</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">초기 자본</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">수수료 (%)</label>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              step="0.01"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            />
          </div>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={runBacktest}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlay />
              백테스트 시작
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {isPaused ? <FaPlay /> : <FaPause />}
                {isPaused ? '재개' : '일시정지'}
              </button>
              <button
                onClick={stopBacktest}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaStop />
                중지
              </button>
            </>
          )}
          
          {results.length > 0 && (
            <button
              onClick={exportResults}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaDownload />
              결과 내보내기
            </button>
          )}
        </div>

        {/* 진행률 표시 */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>백테스트 진행중...</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 백테스트 결과 */}
      {metrics && (
        <>
          {/* 주요 메트릭 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="text-gray-400 text-sm">총 수익률</div>
              <div className={`text-2xl font-bold ${metrics.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.totalReturn > 0 ? '+' : ''}{metrics.totalReturn.toFixed(2)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="text-gray-400 text-sm">샤프 비율</div>
              <div className="text-2xl font-bold text-blue-400">
                {metrics.sharpeRatio.toFixed(2)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="text-gray-400 text-sm">최대 손실</div>
              <div className="text-2xl font-bold text-red-400">
                -{metrics.maxDrawdown.toFixed(2)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="text-gray-400 text-sm">승률</div>
              <div className="text-2xl font-bold text-purple-400">
                {metrics.winRate.toFixed(1)}%
              </div>
            </motion.div>
          </div>

          {/* 자산 곡선 차트 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">자산 곡선</h4>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9CA3AF"
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: any) => value.toFixed(2)}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                />
                
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="equity"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="자산"
                />
                
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="price"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  dot={false}
                  name="가격"
                />
                
                <ReferenceLine 
                  yAxisId="left"
                  y={initialCapital} 
                  stroke="#6B7280" 
                  strokeDasharray="3 3" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 상세 메트릭 테이블 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">상세 메트릭</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-400 text-sm">총 거래 횟수</div>
                <div className="text-white font-semibold">{metrics.totalTrades}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">평균 수익</div>
                <div className="text-green-400 font-semibold">${metrics.avgWin.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">평균 손실</div>
                <div className="text-red-400 font-semibold">${metrics.avgLoss.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">최고 수익</div>
                <div className="text-green-400 font-semibold">${metrics.bestTrade.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">최대 손실</div>
                <div className="text-red-400 font-semibold">${metrics.worstTrade.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">평균 보유 기간</div>
                <div className="text-white font-semibold">{metrics.avgHoldTime.toFixed(1)}일</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">수익 팩터</div>
                <div className="text-purple-400 font-semibold">{metrics.profitFactor.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">소르티노 비율</div>
                <div className="text-blue-400 font-semibold">{metrics.sortinoRatio.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">시장 노출도</div>
                <div className="text-white font-semibold">{metrics.exposure.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}