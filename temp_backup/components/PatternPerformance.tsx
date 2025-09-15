'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaTachometerAlt, FaChartLine, FaCheckCircle, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaMedal, FaHistory
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'

interface PatternPerformanceProps {
  symbol: string
}

export default function PatternPerformance({ symbol }: PatternPerformanceProps) {
  const [timeRange, setTimeRange] = useState('1M')

  // 패턴별 성능 데이터
  const patternPerformance = [
    { pattern: '머리어깨형', winRate: 88, avgReturn: 12.5, frequency: 5, trades: 45 },
    { pattern: '삼각형', winRate: 75, avgReturn: 8.3, frequency: 12, trades: 108 },
    { pattern: '깃발형', winRate: 82, avgReturn: 15.2, frequency: 8, trades: 72 },
    { pattern: '이중천정', winRate: 85, avgReturn: 10.8, frequency: 6, trades: 54 },
    { pattern: '해머', winRate: 79, avgReturn: 6.5, frequency: 15, trades: 135 },
    { pattern: '도지', winRate: 65, avgReturn: 3.2, frequency: 20, trades: 180 },
    { pattern: '장악형', winRate: 83, avgReturn: 9.7, frequency: 10, trades: 90 }
  ]

  // 시간별 성능 추이
  const performanceTrend = [
    { month: '1월', winRate: 72, trades: 45, profit: 8500 },
    { month: '2월', winRate: 78, trades: 52, profit: 12300 },
    { month: '3월', winRate: 85, trades: 61, profit: 18900 },
    { month: '4월', winRate: 81, trades: 48, profit: 15600 },
    { month: '5월', winRate: 88, trades: 55, profit: 22100 },
    { month: '6월', winRate: 83, trades: 50, profit: 19800 }
  ]

  // 시간대별 성능
  const timeframePerformance = [
    { timeframe: '1분', winRate: 68, avgHold: '5분', trades: 320 },
    { timeframe: '5분', winRate: 72, avgHold: '25분', trades: 180 },
    { timeframe: '15분', winRate: 78, avgHold: '1.5시간', trades: 120 },
    { timeframe: '1시간', winRate: 85, avgHold: '6시간', trades: 45 },
    { timeframe: '4시간', winRate: 88, avgHold: '1일', trades: 20 },
    { timeframe: '1일', winRate: 91, avgHold: '5일', trades: 8 }
  ]

  // 레이더 차트용 데이터
  const radarData = patternPerformance.slice(0, 6).map(item => ({
    pattern: item.pattern,
    winRate: item.winRate,
    avgReturn: item.avgReturn * 5,
    frequency: item.frequency * 4,
    reliability: (item.winRate + item.avgReturn * 2) / 3
  }))

  // 파이 차트 데이터
  const pieData = [
    { name: '성공', value: 68, color: '#10b981' },
    { name: '실패', value: 32, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaTachometerAlt className="text-orange-400" />
          패턴 성능 분석
        </h3>
        <div className="flex gap-2">
          {['1W', '1M', '3M', '6M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 종합 성과 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">전체 승률</span>
            <FaMedal className="text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">82.4%</div>
          <div className="text-sm text-green-400 mt-1">+3.2% vs 지난달</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">평균 수익률</span>
            <FaArrowUp className="text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">+9.8%</div>
          <div className="text-sm text-gray-400 mt-1">거래당 평균</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">총 거래 횟수</span>
            <FaHistory className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">693</div>
          <div className="text-sm text-gray-400 mt-1">{timeRange} 기준</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">누적 수익</span>
            <FaChartLine className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">$97.4K</div>
          <div className="text-sm text-green-400 mt-1">+42.5% ROI</div>
        </motion.div>
      </div>

      {/* 패턴별 성능 막대 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">패턴별 성공률</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={patternPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="pattern" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="winRate" radius={[8, 8, 0, 0]}>
              {patternPerformance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.winRate > 80 ? '#10b981' :
                  entry.winRate > 70 ? '#f59e0b' : '#ef4444'
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 레이더 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">패턴 종합 평가</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="pattern" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="승률" dataKey="winRate" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Radar name="수익률" dataKey="avgReturn" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
              <Radar name="빈도" dataKey="frequency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 수익 추이 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">월별 수익 추이</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar yAxisId="left" dataKey="profit" fill="#8b5cf6" opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시간대별 성능 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">시간대별 성능 분석</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400">시간대</th>
                <th className="text-center py-3 text-gray-400">승률</th>
                <th className="text-center py-3 text-gray-400">평균 보유시간</th>
                <th className="text-center py-3 text-gray-400">거래 횟수</th>
                <th className="text-center py-3 text-gray-400">추천도</th>
              </tr>
            </thead>
            <tbody>
              {timeframePerformance.map((item, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 text-white font-medium">{item.timeframe}</td>
                  <td className="py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.winRate > 80 ? 'bg-green-500/20 text-green-400' :
                      item.winRate > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.winRate}%
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-300">{item.avgHold}</td>
                  <td className="py-3 text-center text-gray-300">{item.trades}</td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaCheckCircle
                          key={i}
                          className={`text-xs ${
                            i < Math.round(item.winRate / 20) ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 성능 개선 팁 */}
      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl p-6 border border-orange-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-400" />
          성능 최적화 제안
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h5 className="text-orange-400 font-semibold mb-2">고성능 패턴</h5>
            <ul className="space-y-1">
              <li>• 머리어깨형: 88% 승률, 장기 시간대에서 효과적</li>
              <li>• 이중천정/바닥: 85% 승률, 명확한 신호 제공</li>
              <li>• 깃발형: 높은 수익률, 단기 트레이딩 적합</li>
            </ul>
          </div>
          <div>
            <h5 className="text-red-400 font-semibold mb-2">주의사항</h5>
            <ul className="space-y-1">
              <li>• 1분봉: 노이즈 많음, 승률 낮음</li>
              <li>• 도지: 단독 사용 시 신뢰도 낮음</li>
              <li>• 거래량 확인: 패턴 확정의 핵심</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}