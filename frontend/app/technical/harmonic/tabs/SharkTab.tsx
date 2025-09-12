'use client'

import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { 
  FaChartLine, FaBolt, FaExclamationTriangle
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface SharkTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function SharkTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: SharkTabProps) {
  const sharkPatterns = detectedPatterns.filter(p => p.name === '샤크 패턴')
  const currentShark = sharkPatterns.find(p => p.completion > 90) || sharkPatterns[0]

  return (
    <div className="space-y-6">
      {/* 샤크 패턴 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl p-6 border border-cyan-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🦈</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">샤크 패턴 (Shark Pattern)</h2>
            <p className="text-gray-300 mb-4">
              Scott Carney가 2011년 발견한 신규 패턴으로, C 포인트가 AB를 넘어서는 것이 특징입니다.
              빠른 진입과 청산이 필요한 급격한 가격 움직임을 보입니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-cyan-400 mb-1">XAB 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-cyan-400 mb-1">ABC 비율</div>
                <div className="text-xl font-bold text-white">1.13-1.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-cyan-400 mb-1">BCD 비율</div>
                <div className="text-xl font-bold text-white">1.618-2.24</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-cyan-400 mb-1">XAD 비율</div>
                <div className="text-xl font-bold text-white">0.886-1.13</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 샤크 패턴 차트 */}
      {currentShark && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaBolt className="text-yellow-400" />
            급격한 움직임 패턴
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData.slice(-50)}>
              <defs>
                <linearGradient id="colorShark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="close" stroke="#06b6d4" fill="url(#colorShark)" />
              <ReferenceLine y={currentShark.points.C.price} stroke="#f59e0b" strokeDasharray="5 5" label="C Point (확장)" />
              <ReferenceLine y={currentShark.points.D.price} stroke="#ef4444" strokeDasharray="5 5" label="D Point (진입)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-cyan-600/20 rounded-lg border border-cyan-500/30">
            <p className="text-sm text-cyan-400">
              <FaExclamationTriangle className="inline mr-2" />
              샤크 패턴은 5-0 패턴과 유사하며, 빠른 수익 실현이 중요합니다.
            </p>
          </div>
        </motion.div>
      )}

      {/* 빠른 트레이딩 전략 */}
      <div className="bg-gradient-to-r from-cyan-600/10 to-green-600/10 rounded-xl p-6 border border-cyan-500/30">
        <h3 className="text-lg font-bold text-white mb-4">⚡ 샤크 패턴 스피드 트레이딩</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-3">빠른 진입</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 0.886 XC 레벨 주목</li>
              <li>• C 포인트 확장 확인</li>
              <li>• 빠른 반전 신호 포착</li>
              <li>• 1-2% 포지션으로 진입</li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-400 font-semibold mb-3">빠른 청산</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• TP1: 10-15% 수익</li>
              <li>• TP2: 20% 수익</li>
              <li>• 홀딩 기간: 1-3일</li>
              <li>• 트레일링 스탑 필수</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}