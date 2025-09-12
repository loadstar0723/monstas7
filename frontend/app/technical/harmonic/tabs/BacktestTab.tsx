'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Treemap, Sankey
} from 'recharts'
import { 
  FaChartLine, FaTrophy, FaHistory, FaCoins,
  FaCheckCircle, FaTimesCircle, FaBalanceScale,
  FaChartPie, FaChartBar, FaPercentage
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface BacktestTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function BacktestTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: BacktestTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  
  // 백테스팅 통계 (시뮬레이션 데이터)
  const backtestStats = {
    totalTrades: 486,
    winningTrades: 334,
    losingTrades: 152,
    winRate: 68.7,
    totalProfit: 156.8,
    maxDrawdown: -12.4,
    sharpeRatio: 1.85,
    avgWinTrade: 3.2,
    avgLossTrade: -1.4,
    profitFactor: 2.29
  }

  // 패턴별 성과
  const patternPerformance = [
    { name: '가틀리', winRate: 68, avgProfit: 2.3, trades: 142, color: '#a855f7' },
    { name: '배트', winRate: 72, avgProfit: 2.1, trades: 98, color: '#3b82f6' },
    { name: '버터플라이', winRate: 65, avgProfit: 3.5, trades: 67, color: '#ec4899' },
    { name: '크랩', winRate: 78, avgProfit: 3.8, trades: 45, color: '#ef4444' },
    { name: '샤크', winRate: 63, avgProfit: 2.0, trades: 89, color: '#06b6d4' },
    { name: '사이퍼', winRate: 70, avgProfit: 2.5, trades: 45, color: '#8b5cf6' }
  ]

  // 월별 수익률
  const monthlyReturns = [
    { month: '1월', profit: 12.5, trades: 68, winRate: 66 },
    { month: '2월', profit: 18.3, trades: 82, winRate: 71 },
    { month: '3월', profit: -5.2, trades: 71, winRate: 58 },
    { month: '4월', profit: 22.7, trades: 95, winRate: 74 },
    { month: '5월', profit: 31.2, trades: 103, winRate: 76 },
    { month: '6월', profit: 15.8, trades: 67, winRate: 69 }
  ]

  // 누적 수익 곡선
  const equityCurve = monthlyReturns.reduce((acc, month, index) => {
    const prevEquity = index > 0 ? acc[index - 1].equity : 100
    acc.push({
      month: month.month,
      equity: prevEquity + (prevEquity * month.profit / 100),
      drawdown: month.profit < 0 ? month.profit : 0
    })
    return acc
  }, [] as any[])

  return (
    <div className="space-y-6">
      {/* 백테스팅 개요 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-xl p-6 border border-green-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaHistory className="text-green-400" />
            백테스팅 결과 분석
          </h2>
          <div className="flex gap-2">
            {['1M', '3M', '6M', '1Y', 'ALL'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === period 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* 핵심 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">총 거래</div>
            <div className="text-2xl font-bold text-white">{backtestStats.totalTrades}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">승률</div>
            <div className="text-2xl font-bold text-green-400">{backtestStats.winRate}%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">총 수익률</div>
            <div className="text-2xl font-bold text-purple-400">+{backtestStats.totalProfit}%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">최대 손실</div>
            <div className="text-2xl font-bold text-red-400">{backtestStats.maxDrawdown}%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">샤프 비율</div>
            <div className="text-2xl font-bold text-blue-400">{backtestStats.sharpeRatio}</div>
          </div>
        </div>
      </motion.div>

      {/* 차트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 누적 수익 곡선 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            누적 수익 곡선
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="equity" stroke="#10b981" fill="url(#colorEquity)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 패턴별 승률 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            패턴별 성과
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patternPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="winRate">
                {patternPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 승/패 분포 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaChartPie className="text-purple-400" />
            거래 결과 분포
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: '승리', value: backtestStats.winningTrades, fill: '#10b981' },
                  { name: '패배', value: backtestStats.losingTrades, fill: '#ef4444' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 월별 수익률 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            월별 수익률
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="profit" fill="#a855f7">
                {monthlyReturns.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 상세 통계 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaBalanceScale className="text-blue-400" />
          리스크/리워드 분석
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-2">평균 수익 거래</div>
            <div className="text-xl font-bold text-green-400">+{backtestStats.avgWinTrade}%</div>
            <div className="text-xs text-gray-500 mt-1">{backtestStats.winningTrades}회</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-2">평균 손실 거래</div>
            <div className="text-xl font-bold text-red-400">{backtestStats.avgLossTrade}%</div>
            <div className="text-xs text-gray-500 mt-1">{backtestStats.losingTrades}회</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-2">수익 팩터</div>
            <div className="text-xl font-bold text-purple-400">{backtestStats.profitFactor}</div>
            <div className="text-xs text-gray-500 mt-1">목표: &gt;2.0</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-2">평균 R:R</div>
            <div className="text-xl font-bold text-blue-400">1:2.3</div>
            <div className="text-xs text-gray-500 mt-1">리스크 대비 수익</div>
          </div>
        </div>
      </motion.div>

      {/* 트레이딩 인사이트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-400" />
          백테스팅 인사이트
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 font-semibold mb-3">✅ 성공 요인</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>크랩 패턴이 가장 높은 승률 (78%) 기록</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>PRZ 내 진입 시 승률 15% 상승</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>RSI 다이버전스 확인 시 정확도 증가</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>단계별 익절이 수익률 극대화</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-semibold mb-3">⚠️ 개선 필요</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaTimesCircle className="text-red-400 mt-0.5" />
                <span>변동성 높은 시장에서 성과 저조</span>
              </li>
              <li className="flex items-start gap-2">
                <FaTimesCircle className="text-red-400 mt-0.5" />
                <span>뉴스 이벤트 전후 패턴 신뢰도 하락</span>
              </li>
              <li className="flex items-start gap-2">
                <FaTimesCircle className="text-red-400 mt-0.5" />
                <span>과도한 레버리지 사용 시 손실 확대</span>
              </li>
              <li className="flex items-start gap-2">
                <FaTimesCircle className="text-red-400 mt-0.5" />
                <span>낮은 유동성 시간대 진입 주의</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            <span className="text-purple-400 font-semibold">💡 최적 전략:</span> 크랩과 배트 패턴에 집중하고, 
            PRZ 내에서 추가 확인 신호를 기다린 후 진입하면 승률을 70% 이상 유지할 수 있습니다.
          </p>
        </div>
      </motion.div>
    </div>
  )
}