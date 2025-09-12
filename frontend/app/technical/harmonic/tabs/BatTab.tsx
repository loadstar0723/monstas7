'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { 
  FaChartLine, FaCheckCircle, FaExclamationTriangle, 
  FaBullseye, FaInfoCircle, FaLightbulb
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface BatTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function BatTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: BatTabProps) {
  const batPatterns = detectedPatterns.filter(p => p.name === '배트 패턴')
  const currentBat = batPatterns.find(p => p.completion > 90) || batPatterns[0]

  const radarData = currentBat ? [
    { subject: 'XAB', A: currentBat.ratios.XAB * 100, B: 45, fullMark: 100 },
    { subject: 'ABC', A: currentBat.ratios.ABC * 100, B: 63, fullMark: 100 },
    { subject: 'BCD', A: currentBat.ratios.BCD * 50, B: 60, fullMark: 100 },
    { subject: 'XAD', A: currentBat.ratios.XAD * 100, B: 88.6, fullMark: 100 },
    { subject: 'PRZ', A: currentBat.prz.strength, B: 75, fullMark: 100 }
  ] : []

  return (
    <div className="space-y-6">
      {/* 배트 패턴 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-blue-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🦇</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">배트 패턴 (Bat Pattern)</h2>
            <p className="text-gray-300 mb-4">
              Scott Carney가 2001년 발견한 매우 정확한 하모닉 패턴입니다. 
              0.886 XA 되돌림이 핵심이며, 가틀리보다 깊은 되돌림을 보이는 것이 특징입니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-blue-400 mb-1">XAB 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.5</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-blue-400 mb-1">ABC 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.886</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-blue-400 mb-1">BCD 비율</div>
                <div className="text-xl font-bold text-white">1.618-2.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-blue-400 mb-1">XAD 비율</div>
                <div className="text-xl font-bold text-white">0.886</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 패턴 분석 차트 */}
      {currentBat && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
          >
            <h4 className="text-white font-semibold mb-3">패턴 강도 분석</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="현재 패턴" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="이상적 비율" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
          >
            <h4 className="text-white font-semibold mb-3">트레이딩 시그널</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">진입 신호</span>
                <span className={`font-semibold ${currentBat.completion > 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {currentBat.completion > 95 ? '강함' : '대기'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">리스크 레벨</span>
                <span className="text-yellow-400 font-semibold">중간</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">예상 수익</span>
                <span className="text-green-400 font-semibold">+15-25%</span>
              </div>
              <div className="mt-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-400">
                  0.886 XA 레벨에서 정확한 진입이 중요합니다
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 트레이딩 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/10 to-green-600/10 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          배트 패턴 특별 전략
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">진입 타이밍</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 0.886 XA 정확히 도달</li>
              <li>• PRZ 내 반전 캔들</li>
              <li>• RSI &lt; 30 (상승) / &gt; 70 (하락)</li>
              <li>• 거래량 스파이크</li>
            </ul>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">포지션 관리</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 3단계 분할 진입</li>
              <li>• 손절: X 포인트 너머</li>
              <li>• 부분 익절: 0.382 AD</li>
              <li>• 트레일링 스탑 활용</li>
            </ul>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">성공 팁</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 높은 승률 (72%+)</li>
              <li>• 보수적 진입 필수</li>
              <li>• 상위 TF 확인</li>
              <li>• 뉴스 이벤트 주의</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}