'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FaWaveSquare, FaArrowDown, FaExclamationCircle } from 'react-icons/fa'

interface CorrectiveWaveTabProps {
  symbol: string
  currentPrice: number
  historicalData: any[]
}

export default function CorrectiveWaveTab({ symbol, currentPrice, historicalData }: CorrectiveWaveTabProps) {
  // 조정파 데이터 생성
  const generateCorrectiveData = () => {
    const data = []
    const basePrice = currentPrice
    
    // Zigzag 패턴 (5-3-5)
    for (let i = 0; i < 60; i++) {
      let price = basePrice
      let pattern = 'zigzag'
      
      if (i < 20) {
        // Wave A (5파동)
        price = basePrice - (i * 400)
        if (i === 19) pattern = 'A'
      } else if (i < 35) {
        // Wave B (3파동)
        price = basePrice - 8000 + ((i - 20) * 300)
        if (i === 34) pattern = 'B'
      } else {
        // Wave C (5파동)
        price = basePrice - 3500 - ((i - 35) * 500)
        if (i === 59) pattern = 'C'
      }
      
      data.push({
        index: i,
        price: price,
        pattern: pattern,
        volume: ((Date.now() % 1000) / 1000) * 800000 + 400000
      })
    }
    
    return data
  }

  const correctiveData = generateCorrectiveData()

  // 조정파 종류 데이터
  const correctiveTypes = [
    { name: 'Zigzag', value: 40, color: '#ef4444' },
    { name: 'Flat', value: 30, color: '#3b82f6' },
    { name: 'Triangle', value: 20, color: '#10b981' },
    { name: 'Complex', value: 10, color: '#f59e0b' },
  ]

  // 패턴별 특성
  const patternFeatures = [
    { type: 'Zigzag (5-3-5)', direction: '급격한 하락', depth: '100-138.2%', frequency: '40%' },
    { type: 'Flat (3-3-5)', direction: '횡보 조정', depth: '90-100%', frequency: '30%' },
    { type: 'Triangle (3-3-3-3-3)', direction: '수렴', depth: '점차 감소', frequency: '20%' },
    { type: 'Complex (W-X-Y)', direction: '복합', depth: '다양', frequency: '10%' },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl p-6 border border-red-700/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaWaveSquare className="text-red-500" />
          조정파 분석 (Corrective Wave)
        </h2>
        <p className="text-gray-300">
          3개의 파동으로 구성된 반대 추세 움직임. A-C는 조정 방향, B는 반등으로 구성됩니다.
        </p>
      </motion.div>

      {/* 메인 차트 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">조정파 패턴 차트 (Zigzag)</h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={correctiveData}>
            <defs>
              <linearGradient id="correctiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 1000', 'dataMax + 1000']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#ef4444" 
              strokeWidth={3}
              fill="url(#correctiveGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* 파동 라벨 */}
        <div className="mt-4 flex justify-around">
          {['A', 'B', 'C'].map((wave) => (
            <div key={wave} className="text-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                {wave}
              </div>
              <div className="text-xs text-gray-400 mt-1">Wave {wave}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 패턴 비율 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">조정파 패턴 비율</h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={correctiveTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {correctiveTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-2 mt-4">
            {correctiveTypes.map((type, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: type.color }} />
                  <span className="text-gray-300">{type.name}</span>
                </div>
                <span className="text-white font-medium">{type.value}%</span>
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
          <h3 className="text-lg font-bold text-white mb-4">패턴별 특성</h3>
          
          <div className="space-y-3">
            {patternFeatures.map((pattern, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                <div className="font-bold text-purple-400 mb-1">{pattern.type}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">방향:</span>
                    <span className="text-gray-300 ml-1">{pattern.direction}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">깊이:</span>
                    <span className="text-gray-300 ml-1">{pattern.depth}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">발생 빈도:</span>
                    <span className="text-gray-300 ml-1">{pattern.frequency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 트레이딩 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-orange-900/20 rounded-xl p-6 border border-orange-700/30">
          <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
            <FaArrowDown />
            매도 전략
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Wave 5 종료 후 조정파 시작 확인</li>
            <li>• Wave B 반등 고점에서 매도</li>
            <li>• Wave A 저점 하향 돌파 시 추가 매도</li>
            <li>• 삼각형 패턴에서는 브레이크아웃 대기</li>
          </ul>
        </div>
        
        <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-700/30">
          <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <FaExclamationCircle />
            중요 포인트
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• 조정파는 충격파보다 예측이 어려움</li>
            <li>• 다양한 변형 패턴 가능성</li>
            <li>• 복합 조정(W-X-Y-Z) 주의</li>
            <li>• 불확실한 경우 관망 추천</li>
          </ul>
        </div>
      </motion.div>

      {/* 현재 분석 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">현재 {symbol} 조정파 분석</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재 패턴</div>
            <div className="text-xl font-bold text-red-400">Zigzag</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재 파동</div>
            <div className="text-xl font-bold text-orange-400">Wave B</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">예상 종료</div>
            <div className="text-xl font-bold text-yellow-400">
              ${(currentPrice * 0.92).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">조정 깊이</div>
            <div className="text-xl font-bold text-blue-400">38.2%</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-300 text-sm">
            현재 Wave B 반등 진행 중. Wave A 고점의 50-61.8% 되돌림 예상.
            Wave C 하락을 대비한 포지션 조절 필요.
          </p>
        </div>
      </motion.div>
    </div>
  )
}