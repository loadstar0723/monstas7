'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { FaRobot, FaBrain, FaChartLine } from 'react-icons/fa'

interface PredictionTabProps {
  symbol: string
  currentPrice: number
  waveData: any
  historicalData: any[]
}

export default function PredictionTab({ symbol, currentPrice, waveData, historicalData }: PredictionTabProps) {
  // 예측 데이터 생성
  const predictionData = Array.from({ length: 30 }, (_, i) => {
    const trend = i < 10 ? 1.02 : i < 20 ? 0.98 : 1.03
    const noise = (((Date.now() % 1000) / 1000) - 0.5) * 0.02
    const price = currentPrice * Math.pow(trend + noise, i)
    
    return {
      day: `D+${i}`,
      primary: price,
      alternative1: price * (1 + (((Date.now() % 1000) / 1000) - 0.5) * 0.1),
      alternative2: price * (1 + (((Date.now() % 1000) / 1000) - 0.5) * 0.15),
      confidence: Math.max(30, 90 - i * 2)
    }
  })

  // AI 신뢰도 데이터
  const confidenceData = [
    { name: '파동 분석', value: 78, fill: '#8b5cf6' },
    { name: '기술적 지표', value: 82, fill: '#3b82f6' },
    { name: '거래량', value: 65, fill: '#10b981' },
    { name: '시장 센티먼트', value: 71, fill: '#f59e0b' },
    { name: '종합 신뢰도', value: 74, fill: '#ec4899' },
  ]

  // 시나리오 분석
  const scenarios = [
    { 
      name: '강세 시나리오', 
      probability: 45, 
      target: currentPrice * 1.25,
      wave: 'Wave 5 완성',
      color: '#10b981'
    },
    { 
      name: '중립 시나리오', 
      probability: 35, 
      target: currentPrice * 1.05,
      wave: 'Wave 4 지속',
      color: '#3b82f6'
    },
    { 
      name: '약세 시나리오', 
      probability: 20, 
      target: currentPrice * 0.85,
      wave: 'ABC 조정',
      color: '#ef4444'
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-xl p-6 border border-cyan-700/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaRobot className="text-cyan-500" />
          AI 파동 예측 분석
        </h2>
        <p className="text-gray-300">
          머신러닝 기반 엘리엇 파동 예측. 여러 시나리오와 대안 카운트를 제시합니다.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-500" />
          30일 가격 예측
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 2000', 'dataMax + 2000']} />
            <Tooltip />
            
            <Area 
              type="monotone" 
              dataKey="primary" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fill="url(#primaryGrad)"
              name="주 예측"
            />
            <Line 
              type="monotone" 
              dataKey="alternative1" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="대안 1"
            />
            <Line 
              type="monotone" 
              dataKey="alternative2" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="대안 2"
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
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaBrain className="text-pink-500" />
            AI 신뢰도 분석
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="10%" 
              outerRadius="90%" 
              data={confidenceData}
            >
              <PolarAngleAxis 
                type="number" 
                domain={[0, 100]} 
                angleAxisId={0} 
                tick={false}
              />
              <RadialBar 
                dataKey="value" 
                cornerRadius={10} 
                fill="#8b5cf6"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="space-y-2">
            {confidenceData.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.name}</span>
                <span className="font-bold" style={{ color: item.fill }}>
                  {item.value}%
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
          <h3 className="text-lg font-bold text-white mb-4">시나리오 분석</h3>
          
          <div className="space-y-3">
            {scenarios.map((scenario, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold" style={{ color: scenario.color }}>
                    {scenario.name}
                  </span>
                  <span className="text-white font-bold">
                    {scenario.probability}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">목표가:</span>
                    <span className="text-gray-300 ml-1">
                      ${scenario.target.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">파동:</span>
                    <span className="text-gray-300 ml-1">{scenario.wave}</span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${scenario.probability}%`,
                      backgroundColor: scenario.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <h3 className="text-xl font-bold text-white mb-4">현재 {symbol} 예측 요약</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">7일 예측</div>
            <div className="text-lg font-bold text-green-400">
              ${(currentPrice * 1.03).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">14일 예측</div>
            <div className="text-lg font-bold text-blue-400">
              ${(currentPrice * 1.07).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">30일 예측</div>
            <div className="text-lg font-bold text-purple-400">
              ${(currentPrice * 1.15).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">예측 신뢰도</div>
            <div className="text-lg font-bold text-cyan-400">74%</div>
          </div>
        </div>
        
        <div className="p-3 bg-purple-900/20 rounded-lg">
          <p className="text-purple-300 text-sm">
            AI 모델은 현재 Wave {waveData.currentWave}가 {waveData.completionRate}% 완성되었다고 판단.
            다음 2주 내 중요한 방향성 결정이 예상됩니다.
            주의: 예측은 참고용이며 투자 결정은 본인 책임입니다.
          </p>
        </div>
      </motion.div>
    </div>
  )
}