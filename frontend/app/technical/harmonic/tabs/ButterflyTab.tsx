'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ScatterChart, Scatter
} from 'recharts'
import { 
  FaChartLine, FaCheckCircle, FaExclamationTriangle, 
  FaBullseye, FaInfoCircle, FaLightbulb
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface ButterflyTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function ButterflyTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: ButterflyTabProps) {
  const butterflyPatterns = detectedPatterns.filter(p => p.name === '버터플라이 패턴')
  const currentButterfly = butterflyPatterns.find(p => p.completion > 90) || butterflyPatterns[0]

  const extensionLevels = [
    { level: '1.27', price: currentButterfly ? currentButterfly.points.X.price * 1.27 : 0 },
    { level: '1.414', price: currentButterfly ? currentButterfly.points.X.price * 1.414 : 0 },
    { level: '1.618', price: currentButterfly ? currentButterfly.points.X.price * 1.618 : 0 }
  ]

  return (
    <div className="space-y-6">
      {/* 버터플라이 패턴 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🦋</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">버터플라이 패턴 (Butterfly Pattern)</h2>
            <p className="text-gray-300 mb-4">
              Bryce Gilmore가 발견한 확장 패턴으로, D 포인트가 X를 넘어서는 것이 특징입니다.
              강한 반전 신호를 제공하며 큰 수익 잠재력을 가지고 있습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">XAB 비율</div>
                <div className="text-xl font-bold text-white">0.786</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">ABC 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.886</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">BCD 비율</div>
                <div className="text-xl font-bold text-white">1.618-2.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">XAD 비율</div>
                <div className="text-xl font-bold text-white">1.27-1.618</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 확장 레벨 차트 */}
      {currentButterfly && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3">확장 레벨 분석</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData.slice(-50)}>
              <defs>
                <linearGradient id="colorButterfly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="close" stroke="#a855f7" fill="url(#colorButterfly)" />
              {extensionLevels.map((level, index) => (
                <line key={index} x1="0" y1={level.price} x2="100%" y2={level.price} stroke="#f59e0b" strokeDasharray="5 5" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-4">
            {extensionLevels.map((level, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-400">{level.level} XA</div>
                <div className="text-sm font-bold text-yellow-400">${level.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 트레이딩 전략 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-600/10 to-red-600/10 rounded-xl p-6 border border-yellow-500/30"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          버터플라이 패턴 고급 전략
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-yellow-400 font-semibold mb-3">⚡ 확장 패턴 특징</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-yellow-400 mt-0.5" />
                <span>D 포인트가 X를 넘어서는 확장</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-yellow-400 mt-0.5" />
                <span>트렌드 끝에서 자주 발생</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-yellow-400 mt-0.5" />
                <span>강력한 반전 신호 제공</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-yellow-400 mt-0.5" />
                <span>큰 수익 잠재력 (20-30%)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-semibold mb-3">🎯 진입 전략</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaBullseye className="text-red-400 mt-0.5" />
                <span>1.27 XA에서 1차 진입 (30%)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaBullseye className="text-red-400 mt-0.5" />
                <span>1.414 XA에서 2차 진입 (40%)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaBullseye className="text-red-400 mt-0.5" />
                <span>1.618 XA에서 3차 진입 (30%)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaBullseye className="text-red-400 mt-0.5" />
                <span>적극적 포지션 관리 필수</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            <span className="text-yellow-400 font-semibold">⚠️ 중요:</span> 버터플라이 패턴은 확장 패턴이므로 리스크가 높습니다.
            반드시 단계적 진입과 엄격한 손절 설정이 필요합니다.
          </p>
        </div>
      </motion.div>
    </div>
  )
}