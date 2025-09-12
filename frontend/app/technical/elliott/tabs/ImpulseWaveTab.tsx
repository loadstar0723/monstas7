'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart, ScatterChart, Scatter } from 'recharts'
import { FaChartLine, FaArrowUp, FaInfoCircle } from 'react-icons/fa'

interface ImpulseWaveTabProps {
  symbol: string
  currentPrice: number
  historicalData: any[]
}

export default function ImpulseWaveTab({ symbol, currentPrice, historicalData }: ImpulseWaveTabProps) {
  // 충격파 데이터 생성
  const generateImpulseData = () => {
    const data = []
    const basePrice = currentPrice * 0.85
    
    for (let i = 0; i < 100; i++) {
      let price = basePrice
      let waveLabel = ''
      
      if (i < 15) {
        price = basePrice + (i * 600)
        if (i === 14) waveLabel = '1'
      } else if (i < 25) {
        price = basePrice + 9000 - ((i - 15) * 400)
        if (i === 24) waveLabel = '2'
      } else if (i < 50) {
        price = basePrice + 5000 + ((i - 25) * 800)
        if (i === 49) waveLabel = '3'
      } else if (i < 60) {
        price = basePrice + 25000 - ((i - 50) * 500)
        if (i === 59) waveLabel = '4'
      } else if (i < 80) {
        price = basePrice + 20000 + ((i - 60) * 600)
        if (i === 79) waveLabel = '5'
      } else {
        price = basePrice + 32000 + Math.sin((i - 80) * 0.3) * 1000
      }
      
      data.push({
        index: i,
        price: price,
        waveLabel: waveLabel,
        volume: ((Date.now() % 1000) / 1000) * 1000000 + 500000
      })
    }
    
    return data
  }

  const impulseData = generateImpulseData()

  // Wave 특성 데이터
  const waveCharacteristics = [
    { wave: 'Wave 1', length: 100, extension: '100%', time: '5-10일', character: '시작파' },
    { wave: 'Wave 2', length: -50, extension: '50-61.8%', time: '3-5일', character: '조정파' },
    { wave: 'Wave 3', length: 161.8, extension: '161.8%+', time: '10-20일', character: '주 추진파' },
    { wave: 'Wave 4', length: -38.2, extension: '23.6-38.2%', time: '5-10일', character: '복잡 조정' },
    { wave: 'Wave 5', length: 100, extension: '61.8-100%', time: '5-10일', character: '종료파' },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-500" />
          충격파 분석 (Impulse Wave)
        </h2>
        <p className="text-gray-300">
          5개의 파동으로 구성된 주 추세 방향의 움직임. 1-3-5는 추진파, 2-4는 조정파로 구성됩니다.
        </p>
      </motion.div>

      {/* 메인 차트 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">충격파 패턴 차트</h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={impulseData}>
            <defs>
              <linearGradient id="impulseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
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
              stroke="#9333ea" 
              strokeWidth={3}
              fill="url(#impulseGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* 파동 라벨 표시 */}
        <div className="mt-4 flex justify-around">
          {['1', '2', '3', '4', '5'].map((wave) => (
            <div key={wave} className="text-center">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {wave}
              </div>
              <div className="text-xs text-gray-400 mt-1">Wave {wave}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 파동 특성 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">파동별 특성</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">파동</th>
                <th className="text-center py-2 text-gray-400">길이</th>
                <th className="text-center py-2 text-gray-400">확장</th>
                <th className="text-center py-2 text-gray-400">기간</th>
                <th className="text-left py-2 text-gray-400">특성</th>
              </tr>
            </thead>
            <tbody>
              {waveCharacteristics.map((wave, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 font-bold text-purple-400">{wave.wave}</td>
                  <td className="text-center py-3">
                    <span className={wave.length > 0 ? 'text-green-400' : 'text-red-400'}>
                      {wave.length > 0 ? '+' : ''}{wave.length}%
                    </span>
                  </td>
                  <td className="text-center py-3 text-gray-300">{wave.extension}</td>
                  <td className="text-center py-3 text-gray-300">{wave.time}</td>
                  <td className="py-3 text-gray-300">{wave.character}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 거래 전략 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-green-900/20 rounded-xl p-6 border border-green-700/30">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <FaArrowUp />
            매수 전략
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Wave 2 종료 지점 (38.2-61.8% 되돌림)</li>
            <li>• Wave 4 종료 지점 (23.6-38.2% 되돌림)</li>
            <li>• Wave 1 고점 돌파 시 추가 매수</li>
            <li>• Wave 3 연장 시 추세 추종 매수</li>
          </ul>
        </div>
        
        <div className="bg-red-900/20 rounded-xl p-6 border border-red-700/30">
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <FaInfoCircle />
            주의사항
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Wave 2가 Wave 1 시작점 아래로 하락 시 무효</li>
            <li>• Wave 3가 가장 짧으면 카운팅 재검토</li>
            <li>• Wave 4가 Wave 1 고점과 겹치면 무효</li>
            <li>• Wave 5 다이버전스 주의</li>
          </ul>
        </div>
      </motion.div>

      {/* 실시간 분석 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">현재 {symbol} 충격파 분석</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재 파동</div>
            <div className="text-xl font-bold text-purple-400">Wave 3</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">완성도</div>
            <div className="text-xl font-bold text-blue-400">72%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">다음 목표</div>
            <div className="text-xl font-bold text-green-400">
              ${(currentPrice * 1.15).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">무효화</div>
            <div className="text-xl font-bold text-red-400">
              ${(currentPrice * 0.95).toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}