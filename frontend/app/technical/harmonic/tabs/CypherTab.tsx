'use client'

import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'
import { 
  FaLock, FaCheckCircle, FaKey
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface CypherTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function CypherTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: CypherTabProps) {
  const cypherPatterns = detectedPatterns.filter(p => p.name === '사이퍼 패턴')
  const currentCypher = cypherPatterns.find(p => p.completion > 90) || cypherPatterns[0]

  const keyLevels = currentCypher ? [
    { name: 'X', value: currentCypher.points.X.price, color: '#8b5cf6' },
    { name: 'A', value: currentCypher.points.A.price, color: '#3b82f6' },
    { name: 'B', value: currentCypher.points.B.price, color: '#10b981' },
    { name: 'C', value: currentCypher.points.C.price, color: '#f59e0b' },
    { name: 'D', value: currentCypher.points.D.price, color: '#ef4444' }
  ] : []

  return (
    <div className="space-y-6">
      {/* 사이퍼 패턴 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl p-6 border border-indigo-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🔐</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">사이퍼 패턴 (Cypher Pattern)</h2>
            <p className="text-gray-300 mb-4">
              Darren Oglesbee가 발견한 고급 패턴으로, C 포인트가 A를 넘어서는 것이 특징입니다.
              0.786 XC 되돌림이 핵심이며, 높은 승률과 명확한 진입 규칙을 가지고 있습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-indigo-400 mb-1">XAB 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-indigo-400 mb-1">ABC 비율</div>
                <div className="text-xl font-bold text-white">1.13-1.414</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-indigo-400 mb-1">BCD 비율</div>
                <div className="text-xl font-bold text-white">1.272-2.0</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-indigo-400 mb-1">XAD 비율</div>
                <div className="text-xl font-bold text-white">0.786</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 키 레벨 차트 */}
      {currentCypher && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaKey className="text-indigo-400" />
            사이퍼 패턴 키 레벨
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keyLevels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value">
                {keyLevels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {keyLevels.map((level, index) => (
              <div key={index} className="text-center p-2 bg-gray-900/50 rounded">
                <div className="text-xs text-gray-400">{level.name} Point</div>
                <div className="text-sm font-bold" style={{ color: level.color }}>
                  ${level.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 사이퍼 전략 가이드 */}
      <div className="bg-gradient-to-r from-indigo-600/10 to-green-600/10 rounded-xl p-6 border border-indigo-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaLock className="text-indigo-400" />
          사이퍼 패턴 마스터 전략
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-indigo-400 font-semibold mb-3">🔑 핵심 특징</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-indigo-400 mt-0.5" />
                <span>C가 A를 넘어서는 확장</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-indigo-400 mt-0.5" />
                <span>0.786 XC 되돌림 진입</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-indigo-400 mt-0.5" />
                <span>높은 승률 (70%)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-indigo-400 mt-0.5" />
                <span>명확한 규칙</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-3">📈 진입 전략</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 0.786 XC 레벨 대기</li>
              <li>• AB=CD 패턴 확인</li>
              <li>• RSI 다이버전스</li>
              <li>• 거래량 확인</li>
              <li>• 3단계 분할 진입</li>
            </ul>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-3">🎯 수익 실현</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• TP1: 0.382 CD</li>
              <li>• TP2: 0.618 CD</li>
              <li>• TP3: 1.0 CD</li>
              <li>• 평균 R:R = 1:2.5</li>
              <li>• 단계별 익절</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            <span className="text-indigo-400 font-semibold">💡 Pro Tip:</span> 사이퍼 패턴은 AB=CD 패턴과 
            결합할 때 가장 높은 정확도를 보입니다. 항상 두 패턴을 함께 확인하세요.
          </p>
        </div>
      </div>
    </div>
  )
}