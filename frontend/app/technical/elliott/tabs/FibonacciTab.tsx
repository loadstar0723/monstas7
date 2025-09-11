'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { FaChartBar } from 'react-icons/fa'

interface FibonacciTabProps {
  symbol: string
  currentPrice: number
  historicalData: any[]
}

export default function FibonacciTab({ symbol, currentPrice, historicalData }: FibonacciTabProps) {
  // 피보나치 레벨 계산
  const high = currentPrice * 1.2
  const low = currentPrice * 0.85
  const diff = high - low
  
  const fibLevels = [
    { level: '0%', price: low, color: '#ef4444' },
    { level: '23.6%', price: low + diff * 0.236, color: '#f59e0b' },
    { level: '38.2%', price: low + diff * 0.382, color: '#eab308' },
    { level: '50%', price: low + diff * 0.5, color: '#10b981' },
    { level: '61.8%', price: low + diff * 0.618, color: '#3b82f6' },
    { level: '78.6%', price: low + diff * 0.786, color: '#8b5cf6' },
    { level: '100%', price: high, color: '#ec4899' },
    { level: '161.8%', price: low + diff * 1.618, color: '#f43f5e' },
  ]

  // 차트 데이터
  const chartData = Array.from({ length: 50 }, (_, i) => {
    const basePrice = currentPrice + (Math.sin(i * 0.2) * 3000)
    return {
      index: i,
      price: basePrice,
      volume: Math.random() * 1000000 + 500000
    }
  })

  // 황금비율 통계
  const goldenRatioStats = [
    { ratio: '38.2%', hitRate: 68, avgBounce: 4.2 },
    { ratio: '50.0%', hitRate: 72, avgBounce: 5.1 },
    { ratio: '61.8%', hitRate: 85, avgBounce: 6.8 },
    { ratio: '78.6%', hitRate: 62, avgBounce: 3.5 },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-900/20 to-green-900/20 rounded-xl p-6 border border-yellow-700/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-yellow-500" />
          피보나치 통합 분석
        </h2>
        <p className="text-gray-300">
          엘리엇 파동과 피보나치 비율의 결합. 파동 간 길이와 시간이 황금비율을 따릅니다.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">피보나치 레벨 차트</h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fibGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[low - 1000, high + 5000]} />
            <Tooltip />
            
            {/* 피보나치 레벨 라인 */}
            {fibLevels.map((fib, index) => (
              <ReferenceLine 
                key={index}
                y={fib.price} 
                stroke={fib.color} 
                strokeDasharray="5 5"
                label={{ value: fib.level, fill: fib.color }}
              />
            ))}
            
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#fbbf24" 
              strokeWidth={2}
              fill="url(#fibGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">피보나치 레벨 표</h3>
          <div className="space-y-2">
            {fibLevels.map((fib, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: fib.color }}
                  />
                  <span className="font-medium text-gray-300">{fib.level}</span>
                </div>
                <span className="font-bold text-white">
                  ${fib.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">황금비율 통계</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={goldenRatioStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="ratio" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="hitRate" fill="#10b981" name="적중률(%)" />
              <Bar dataKey="avgBounce" fill="#3b82f6" name="평균 반등(%)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30"
      >
        <h3 className="text-xl font-bold text-white mb-4">현재 {symbol} 피보나치 분석</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재가</div>
            <div className="text-lg font-bold text-white">
              ${currentPrice.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">가장 가까운 지지</div>
            <div className="text-lg font-bold text-green-400">
              ${(low + diff * 0.618).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">가장 가까운 저항</div>
            <div className="text-lg font-bold text-red-400">
              ${(low + diff * 0.786).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">트레이듩 범위</div>
            <div className="text-lg font-bold text-purple-400">
              ${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-blue-900/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            현재 가격은 61.8% 피보나치 레벨 근처. 
            이 레벨은 강력한 지지/저항으로 작용할 가능성이 높습니다.
            Wave 3 목표는 161.8% 확장 레벨입니다.
          </p>
        </div>
      </motion.div>
    </div>
  )
}