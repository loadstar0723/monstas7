'use client'

import React, { useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
  Brush, Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { 
  FaHistory, FaChartLine, FaCalendar, FaFilter,
  FaDollarSign, FaPercentage, FaExclamationTriangle,
  FaCheckCircle, FaDownload, FaPlay, FaCog
} from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface BacktestResult {
  date: string
  actual: number
  predicted: number
  profit: number
  cumProfit: number
  drawdown: number
  signal: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
}

interface MarketCondition {
  period: string
  type: 'Bull' | 'Bear' | 'Sideways'
  winRate: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
}

export default function BacktestingCenter() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  const [startDate, setStartDate] = useState(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [marketFilter, setMarketFilter] = useState('all')
  const [isRunning, setIsRunning] = useState(false)
  
  // 백테스트 결과 데이터 (실제로는 API에서 가져옴)
  const backtestResults: BacktestResult[] = Array.from({ length: 180 }, (_, i) => {
    const date = new Date(Date.now() - (180 - i) * 24 * 60 * 60 * 1000)
    const actual = 50000 + Math.random() * 20000 + i * 100
    const predicted = actual + (Math.random() - 0.5) * 1000
    const profit = (Math.random() - 0.45) * 1000
    return {
      date: date.toISOString().split('T')[0],
      actual,
      predicted,
      profit,
      cumProfit: i > 0 ? profit : profit,
      drawdown: Math.max(-Math.random() * 10, -15),
      signal: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'SELL' : 'HOLD',
      confidence: 60 + Math.random() * 40
    }
  })

  // 누적 수익 계산
  backtestResults.forEach((result, i) => {
    if (i > 0) {
      result.cumProfit = backtestResults[i - 1].cumProfit + result.profit
    }
  })

  // 시장 상황별 성과
  const marketConditions: MarketCondition[] = [
    {
      period: '2024 Q1 - Bull Market',
      type: 'Bull',
      winRate: 72.5,
      totalReturn: 28.3,
      maxDrawdown: -5.2,
      sharpeRatio: 2.85
    },
    {
      period: '2023 Q4 - Bear Market',
      type: 'Bear',
      winRate: 61.2,
      totalReturn: 12.7,
      maxDrawdown: -12.8,
      sharpeRatio: 1.92
    },
    {
      period: '2023 Q3 - Sideways',
      type: 'Sideways',
      winRate: 68.9,
      totalReturn: 15.4,
      maxDrawdown: -7.5,
      sharpeRatio: 2.31
    }
  ]

  // 거래 통계
  const tradeStats = {
    totalTrades: 342,
    winningTrades: 234,
    losingTrades: 108,
    winRate: 68.4,
    avgWin: 485.20,
    avgLoss: -210.50,
    profitFactor: 2.31,
    maxConsecutiveWins: 12,
    maxConsecutiveLosses: 4,
    avgHoldingPeriod: '2.3 days'
  }

  // 거래 분포
  const tradeDistribution = [
    { profit: '-1000 ~ -500', count: 15, color: '#dc2626' },
    { profit: '-500 ~ -100', count: 38, color: '#f59e0b' },
    { profit: '-100 ~ 0', count: 55, color: '#eab308' },
    { profit: '0 ~ 100', count: 72, color: '#84cc16' },
    { profit: '100 ~ 500', count: 108, color: '#22c55e' },
    { profit: '500 ~ 1000', count: 54, color: '#10b981' }
  ]

  const runBacktest = () => {
    setIsRunning(true)
    // 실제로는 API 호출
    setTimeout(() => {
      setIsRunning(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaHistory className="text-purple-500" />
              백테스팅 센터
            </h3>
            <p className="text-gray-400 mt-1">과거 데이터로 전략 성과를 검증합니다</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* 기간 선택 */}
            <div className="flex gap-2 bg-gray-900/50 rounded-lg p-1">
              {['1M', '3M', '6M', '1Y', '3Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* 백테스트 실행 버튼 */}
            <button
              onClick={runBacktest}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isRunning
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  실행 중...
                </>
              ) : (
                <>
                  <FaPlay />
                  백테스트 실행
                </>
              )}
            </button>
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">시작일</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => date && setStartDate(date)}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-700"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">종료일</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => date && setEndDate(date)}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-700"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">시장 상황</label>
            <select
              value={marketFilter}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setMarketFilter(e.target.value)
                }
              }}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-700"
            >
              <option value="all">전체</option>
              <option value="bull">상승장</option>
              <option value="bear">하락장</option>
              <option value="sideways">횡보장</option>
            </select>
          </div>
        </div>
      </div>

      {/* 주요 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaDollarSign className="text-green-400 text-2xl" />
            <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded">+15.2%</span>
          </div>
          <h4 className="text-gray-400 text-sm">총 수익</h4>
          <p className="text-2xl font-bold text-white">$18,542</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaPercentage className="text-blue-400 text-2xl" />
            <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded">우수</span>
          </div>
          <h4 className="text-gray-400 text-sm">승률</h4>
          <p className="text-2xl font-bold text-white">{tradeStats.winRate}%</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-purple-400 text-2xl" />
            <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded">2.45</span>
          </div>
          <h4 className="text-gray-400 text-sm">Sharpe Ratio</h4>
          <p className="text-2xl font-bold text-white">우수</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaExclamationTriangle className="text-red-400 text-2xl" />
            <span className="text-xs text-red-400 bg-red-400/20 px-2 py-1 rounded">-8.2%</span>
          </div>
          <h4 className="text-gray-400 text-sm">최대 낙폭</h4>
          <p className="text-2xl font-bold text-white">안정적</p>
        </motion.div>
      </div>

      {/* 수익 곡선 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-500" />
          누적 수익 곡선
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={backtestResults}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cumProfit"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#profitGradient)"
              name="누적 수익"
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="drawdown"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="낙폭"
            />
            
            <Scatter
              yAxisId="left"
              dataKey="profit"
              fill="#8b5cf6"
              name="개별 거래"
            />
            
            <Brush
              dataKey="date"
              height={30}
              stroke="#8b5cf6"
              fill="#374151"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 시장 상황별 성과 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시장 상황별 테이블 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaFilter className="text-purple-500" />
            시장 상황별 성과
          </h4>
          <div className="space-y-3">
            {marketConditions.map((condition, index) => (
              <div
                key={index}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-white">{condition.period}</h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    condition.type === 'Bull' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : condition.type === 'Bear'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  }`}>
                    {condition.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">승률:</span>
                    <span className="text-white ml-2 font-medium">{condition.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">수익률:</span>
                    <span className="text-green-400 ml-2 font-medium">+{condition.totalReturn}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">최대 낙폭:</span>
                    <span className="text-red-400 ml-2 font-medium">{condition.maxDrawdown}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sharpe:</span>
                    <span className="text-white ml-2 font-medium">{condition.sharpeRatio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 거래 분포 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            손익 분포
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="profit" stroke="#9ca3af" angle={-45} textAnchor="end" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {tradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 거래 통계 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCog className="text-purple-500" />
          상세 거래 통계
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">총 거래 수</p>
            <p className="text-2xl font-bold text-white">{tradeStats.totalTrades}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">평균 수익</p>
            <p className="text-2xl font-bold text-green-400">${tradeStats.avgWin}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">평균 손실</p>
            <p className="text-2xl font-bold text-red-400">${tradeStats.avgLoss}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Profit Factor</p>
            <p className="text-2xl font-bold text-white">{tradeStats.profitFactor}</p>
          </div>
        </div>

        {/* 추가 통계 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
            <span className="text-gray-400">최대 연속 수익</span>
            <span className="text-green-400 font-medium">{tradeStats.maxConsecutiveWins}회</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
            <span className="text-gray-400">최대 연속 손실</span>
            <span className="text-red-400 font-medium">{tradeStats.maxConsecutiveLosses}회</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
            <span className="text-gray-400">평균 보유 기간</span>
            <span className="text-white font-medium">{tradeStats.avgHoldingPeriod}</span>
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2">
          <FaDownload />
          백테스트 결과 다운로드
        </button>
      </div>
    </div>
  )
}