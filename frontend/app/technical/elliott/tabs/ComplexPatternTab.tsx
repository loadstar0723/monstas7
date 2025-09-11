'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { FaChartArea } from 'react-icons/fa'

interface ComplexPatternTabProps {
  symbol: string
  currentPrice: number
  historicalData: any[]
}

export default function ComplexPatternTab({ symbol, currentPrice, historicalData }: ComplexPatternTabProps) {
  // 복합 패턴 데이터
  const complexData = Array.from({ length: 100 }, (_, i) => ({
    index: i,
    wxy: currentPrice + Math.sin(i * 0.1) * 2000 - Math.cos(i * 0.05) * 1500,
    wxyxz: currentPrice + Math.sin(i * 0.08) * 2500 - Math.cos(i * 0.04) * 2000 + Math.sin(i * 0.02) * 1000,
    triangle: currentPrice + (50 - Math.abs(i - 50)) * 100,
  }))

  const patternComplexity = [
    { pattern: 'W-X-Y', complexity: 75, occurrence: 60 },
    { pattern: 'W-X-Y-X-Z', complexity: 90, occurrence: 25 },
    { pattern: 'Triple Three', complexity: 95, occurrence: 10 },
    { pattern: 'Triple Combo', complexity: 98, occurrence: 5 },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-700/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartArea className="text-indigo-500" />
          복합 패턴 분석 (Complex Patterns)
        </h2>
        <p className="text-gray-300">
          W-X-Y, W-X-Y-X-Z 등 복잡한 조정 구조. 여러 조정파가 결합된 형태로 나타납니다.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">복합 패턴 차트</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complexData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip />
              <Line type="monotone" dataKey="wxy" stroke="#8b5cf6" strokeWidth={2} name="W-X-Y" />
              <Line type="monotone" dataKey="wxyxz" stroke="#3b82f6" strokeWidth={2} name="W-X-Y-X-Z" />
              <Line type="monotone" dataKey="triangle" stroke="#10b981" strokeWidth={2} name="Triangle" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">패턴 복잡도</h3>
          <div className="space-y-3">
            {patternComplexity.map((item, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-purple-400">{item.pattern}</span>
                  <span className="text-sm text-gray-400">발생률: {item.occurrence}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${item.complexity}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">복잡도: {item.complexity}%</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">현재 {symbol} 복합 패턴 분석</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재 패턴</div>
            <div className="text-lg font-bold text-indigo-400">W-X-Y</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재 단계</div>
            <div className="text-lg font-bold text-purple-400">Y Wave</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">완성도</div>
            <div className="text-lg font-bold text-blue-400">65%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">예상 종료</div>
            <div className="text-lg font-bold text-green-400">
              ${(currentPrice * 0.88).toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}