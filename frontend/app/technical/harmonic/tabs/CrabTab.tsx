'use client'

import { motion } from 'framer-motion'
import {
  LineChart, Line, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { 
  FaChartLine, FaCheckCircle, FaTrophy,
  FaBullseye, FaExclamationTriangle
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface CrabTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function CrabTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: CrabTabProps) {
  const crabPatterns = detectedPatterns.filter(p => p.name === '크랩 패턴')
  const currentCrab = crabPatterns.find(p => p.completion > 90) || crabPatterns[0]

  const extremeLevels = currentCrab ? [
    { name: 'X Point', value: currentCrab.points.X.price },
    { name: '1.618 XA', value: currentCrab.points.X.price * 1.618 },
    { name: '2.618 BC', value: currentCrab.points.B.price + (currentCrab.points.C.price - currentCrab.points.B.price) * 2.618 },
    { name: 'D Point', value: currentCrab.points.D.price }
  ] : []

  return (
    <div className="space-y-6">
      {/* 크랩 패턴 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-xl p-6 border border-red-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🦀</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">크랩 패턴 (Crab Pattern)</h2>
            <p className="text-gray-300 mb-4">
              Scott Carney가 2000년 발견한 가장 정확한 하모닉 패턴입니다. 
              1.618 XA 확장이 특징이며, 극단적인 과매수/과매도 구간에서 강력한 반전을 보입니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-red-400 mb-1">XAB 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-red-400 mb-1">ABC 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.886</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-red-400 mb-1">BCD 비율</div>
                <div className="text-xl font-bold text-white">2.618-3.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-red-400 mb-1">XAD 비율</div>
                <div className="text-xl font-bold text-white">1.618</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 극단 레벨 차트 */}
      {currentCrab && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            최고 정확도 패턴 - 극단 레벨 분석
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={extremeLevels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" />
              <ReferenceLine y={currentPrice} stroke="#a855f7" strokeDasharray="5 5" label="현재가" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-red-600/20 rounded-lg border border-red-500/30">
            <p className="text-sm text-red-400">
              <FaExclamationTriangle className="inline mr-2" />
              크랩 패턴은 극단적 확장으로 인해 가장 높은 정확도(78%)를 보이지만, 
              타이트한 손절 설정이 필수입니다.
            </p>
          </div>
        </motion.div>
      )}

      {/* 트레이딩 전략 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <h4 className="text-green-400 font-semibold mb-3">✅ 진입 신호</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• 1.618 XA 도달</li>
            <li>• 극단적 RSI (&lt;20 또는 &gt;80)</li>
            <li>• 거래량 급증</li>
            <li>• 강한 반전 캔들</li>
          </ul>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <h4 className="text-yellow-400 font-semibold mb-3">⚡ 리스크 관리</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• 타이트한 손절 필수</li>
            <li>• 자본금 1-2% 리스크</li>
            <li>• 빠른 부분 익절</li>
            <li>• 브레이크이븐 설정</li>
          </ul>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
          <h4 className="text-purple-400 font-semibold mb-3">🎯 수익 목표</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• TP1: 0.382 AD</li>
            <li>• TP2: 0.618 AD</li>
            <li>• TP3: 1.0 AD</li>
            <li>• 평균 R:R = 1:3.8</li>
          </ul>
        </div>
      </div>
    </div>
  )
}