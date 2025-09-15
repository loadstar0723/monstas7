'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaPlay, FaPause, FaStop, FaChartLine, FaDollarSign,
  FaExclamationTriangle, FaCheckCircle, FaHistory
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

interface BacktestResult {
  timestamp: number
  price: number
  position: 'long' | 'short' | 'none'
  pnl: number
  equity: number
  drawdown: number
  signal?: 'buy' | 'sell' | 'close'
}

interface PerformanceMetrics {
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
}

export default function RealtimeBacktest() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [backtestData, setBacktestData] = useState<BacktestResult[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0
  })

  const [speed, setSpeed] = useState(100) // ms per candle
  const [initialCapital] = useState(10000)
  const [positionSize] = useState(0.1) // 10% of capital per trade
  const [stopLoss] = useState(0.02) // 2%
  const [takeProfit] = useState(0.04) // 4%

  // Generate sample price data
  const generatePriceData = () => {
    const data: BacktestResult[] = []
    let price = 50000
    let equity = initialCapital
    let position: 'long' | 'short' | 'none' = 'none'
    let entryPrice = 0
    let highestEquity = initialCapital

    for (let i = 0; i < 1000; i++) {
      // Random price movement
      const change = (Math.random() - 0.5) * 0.02
      price = price * (1 + change)

      // Simple strategy: RSI-based
      const rsi = 50 + Math.sin(i / 20) * 30 + (Math.random() - 0.5) * 20
      let signal: 'buy' | 'sell' | 'close' | undefined

      if (position === 'none') {
        if (rsi < 30) {
          signal = 'buy'
          position = 'long'
          entryPrice = price
        } else if (rsi > 70) {
          signal = 'sell'
          position = 'short'
          entryPrice = price
        }
      } else {
        const pnlPercent = position === 'long' 
          ? (price - entryPrice) / entryPrice
          : (entryPrice - price) / entryPrice

        if (pnlPercent <= -stopLoss || pnlPercent >= takeProfit) {
          signal = 'close'
          const tradeProfit = equity * positionSize * pnlPercent
          equity += tradeProfit
          position = 'none'
        }
      }

      const currentPnl = position !== 'none' 
        ? equity * positionSize * (position === 'long' 
          ? (price - entryPrice) / entryPrice
          : (entryPrice - price) / entryPrice)
        : 0

      highestEquity = Math.max(highestEquity, equity + currentPnl)
      const drawdown = (highestEquity - (equity + currentPnl)) / highestEquity * 100

      data.push({
        timestamp: Date.now() + i * 60000,
        price,
        position,
        pnl: currentPnl,
        equity: equity + currentPnl,
        drawdown,
        signal
      })
    }

    return data
  }

  const [fullData] = useState(generatePriceData())

  useEffect(() => {
    if (isRunning && currentIndex < fullData.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        updateBacktestData()
      }, speed)
      return () => clearTimeout(timer)
    } else if (currentIndex >= fullData.length - 1) {
      setIsRunning(false)
    }
  }, [isRunning, currentIndex, speed, fullData])

  const updateBacktestData = () => {
    const newData = fullData.slice(0, currentIndex + 1)
    setBacktestData(newData)
    calculateMetrics(newData)
  }

  const calculateMetrics = (data: BacktestResult[]) => {
    if (data.length < 2) return

    const trades = data.filter(d => d.signal === 'close')
    const returns = []
    let wins = 0
    let losses = 0
    let totalWin = 0
    let totalLoss = 0
    let largestWin = 0
    let largestLoss = 0

    for (let i = 1; i < data.length; i++) {
      if (data[i].signal === 'close') {
        const tradeReturn = (data[i].equity - data[i-1].equity) / data[i-1].equity
        returns.push(tradeReturn)
        
        if (tradeReturn > 0) {
          wins++
          totalWin += tradeReturn
          largestWin = Math.max(largestWin, tradeReturn)
        } else {
          losses++
          totalLoss += Math.abs(tradeReturn)
          largestLoss = Math.max(largestLoss, Math.abs(tradeReturn))
        }
      }
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    ) || 1

    const lastData = data[data.length - 1]
    const totalReturn = ((lastData.equity - initialCapital) / initialCapital) * 100
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252) // Annualized
    const maxDrawdown = Math.max(...data.map(d => d.drawdown))
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
    const profitFactor = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? Infinity : 0

    setMetrics({
      totalReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      totalTrades: trades.length,
      avgWin: wins > 0 ? totalWin / wins : 0,
      avgLoss: losses > 0 ? totalLoss / losses : 0,
      largestWin: largestWin * 100,
      largestLoss: largestLoss * 100
    })
  }

  const handleStart = () => {
    if (currentIndex >= fullData.length - 1) {
      handleReset()
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentIndex(0)
    setBacktestData([])
    setMetrics({
      totalReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0
    })
  }

  const progress = (currentIndex / (fullData.length - 1)) * 100

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">백테스트 컨트롤</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlay /> 시작
            </button>
            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPause /> 일시정지
            </button>
            <button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaStop /> 초기화
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">진행 상황</label>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {currentIndex} / {fullData.length} ({progress.toFixed(1)}%)
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              백테스트 속도 (ms/캔들)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="500"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white w-12">{speed}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <p className="text-gray-400 text-sm">총 수익률</p>
          <p className={`text-2xl font-bold ${
            metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(2)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <p className="text-gray-400 text-sm">샤프 비율</p>
          <p className="text-2xl font-bold text-white">
            {metrics.sharpeRatio.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <p className="text-gray-400 text-sm">최대 낙폭</p>
          <p className="text-2xl font-bold text-red-400">
            -{metrics.maxDrawdown.toFixed(2)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <p className="text-gray-400 text-sm">승률</p>
          <p className="text-2xl font-bold text-white">
            {metrics.winRate.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <p className="text-gray-400 text-sm">수익 팩터</p>
          <p className="text-2xl font-bold text-white">
            {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">자산 곡선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={backtestData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={() => ''}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, '자산']}
              />
              <ReferenceLine y={initialCapital} stroke="#6B7280" strokeDasharray="5 5" />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Drawdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">낙폭 (Drawdown)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={backtestData}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={() => ''}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => [`-${value.toFixed(2)}%`, '낙폭']}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#EF4444"
                strokeWidth={2}
                fill="url(#drawdownGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Statistics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">거래 통계</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm">총 거래</p>
            <p className="text-white font-semibold">{metrics.totalTrades}회</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">평균 수익</p>
            <p className="text-green-400 font-semibold">
              +{(metrics.avgWin * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">평균 손실</p>
            <p className="text-red-400 font-semibold">
              -{(metrics.avgLoss * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">최대 수익</p>
            <p className="text-green-400 font-semibold">
              +{metrics.largestWin.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Trade Log */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-400" />
          거래 로그
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-normal">시간</th>
                <th className="pb-3 text-gray-400 font-normal">신호</th>
                <th className="pb-3 text-gray-400 font-normal">가격</th>
                <th className="pb-3 text-gray-400 font-normal">포지션</th>
                <th className="pb-3 text-gray-400 font-normal">손익</th>
              </tr>
            </thead>
            <tbody>
              {backtestData
                .filter(d => d.signal)
                .slice(-10)
                .reverse()
                .map((trade, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 text-white">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.signal === 'buy' ? 'bg-green-500/20 text-green-400' :
                        trade.signal === 'sell' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {trade.signal?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-white">
                      ${trade.price.toFixed(2)}
                    </td>
                    <td className="py-3 text-gray-300">
                      {trade.position === 'none' ? '-' : trade.position.toUpperCase()}
                    </td>
                    <td className={`py-3 font-semibold ${
                      trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}