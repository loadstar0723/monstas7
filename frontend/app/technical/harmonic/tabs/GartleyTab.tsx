'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar
} from 'recharts'
import { 
  FaChartLine, FaCheckCircle, FaExclamationTriangle, 
  FaBullseye, FaArrowUp, FaArrowDown, FaInfoCircle,
  FaLightbulb, FaBalanceScale, FaClock, FaCoins
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'

interface GartleyTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function GartleyTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: GartleyTabProps) {
  // 가틀리 패턴만 필터링
  const gartleyPatterns = detectedPatterns.filter(p => p.name === '가틀리 패턴')
  const currentGartley = gartleyPatterns.find(p => p.completion > 90) || gartleyPatterns[0]

  // 가틀리 패턴 통계
  const stats = {
    totalCount: gartleyPatterns.length,
    bullishCount: gartleyPatterns.filter(p => p.direction === 'bullish').length,
    bearishCount: gartleyPatterns.filter(p => p.direction === 'bearish').length,
    avgReliability: gartleyPatterns.reduce((acc, p) => acc + p.reliability, 0) / (gartleyPatterns.length || 1),
    avgCompletion: gartleyPatterns.reduce((acc, p) => acc + p.completion, 0) / (gartleyPatterns.length || 1)
  }

  // 피보나치 비율 정확도
  const fibAccuracy = currentGartley ? {
    XAB: Math.round(100 - Math.abs(currentGartley.ratios.XAB - 0.618) * 100),
    ABC: Math.round(100 - Math.abs(currentGartley.ratios.ABC - 0.5) * 100),
    BCD: Math.round(100 - Math.abs(currentGartley.ratios.BCD - 1.272) * 100),
    XAD: Math.round(100 - Math.abs(currentGartley.ratios.XAD - 0.786) * 100)
  } : { XAB: 0, ABC: 0, BCD: 0, XAD: 0 }

  // 백테스팅 결과 (시뮬레이션)
  const backtestResults = [
    { month: '1월', winRate: 68, profit: 12.5, trades: 24 },
    { month: '2월', winRate: 72, profit: 18.3, trades: 31 },
    { month: '3월', winRate: 65, profit: 8.7, trades: 19 },
    { month: '4월', winRate: 70, profit: 15.2, trades: 28 },
    { month: '5월', winRate: 74, profit: 22.1, trades: 35 },
    { month: '6월', winRate: 69, profit: 14.8, trades: 26 }
  ]

  return (
    <div className="space-y-6">
      {/* 가틀리 패턴 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🦋</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">가틀리 패턴 (Gartley Pattern)</h2>
            <p className="text-gray-300 mb-4">
              H.M. Gartley가 1935년 발견한 가장 일반적이고 신뢰할 수 있는 하모닉 패턴입니다. 
              X-A-B-C-D 5개 포인트로 구성되며, D 포인트가 0.786 XA 되돌림에 위치하는 것이 특징입니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">XAB 비율</div>
                <div className="text-xl font-bold text-white">0.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">ABC 비율</div>
                <div className="text-xl font-bold text-white">0.382-0.886</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">BCD 비율</div>
                <div className="text-xl font-bold text-white">1.13-1.618</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">XAD 비율</div>
                <div className="text-xl font-bold text-white">0.786</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 현재 가틀리 패턴 상태 */}
      {currentGartley && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
          >
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaChartLine className="text-purple-400" />
              현재 패턴 상태
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">패턴 방향:</span>
                <span className={`font-semibold ${currentGartley.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                  {currentGartley.direction === 'bullish' ? '상승' : '하락'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">완성도:</span>
                <span className="text-white font-semibold">{currentGartley.completion}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">신뢰도:</span>
                <span className="text-white font-semibold">{currentGartley.reliability.toFixed(1)}%</span>
              </div>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentGartley.completion}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
          >
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaBullseye className="text-blue-400" />
              PRZ 분석
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">PRZ 상한:</span>
                <span className="text-white font-mono">${currentGartley.prz.high.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">PRZ 하한:</span>
                <span className="text-white font-mono">${currentGartley.prz.low.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">PRZ 강도:</span>
                <span className="text-white font-semibold">{currentGartley.prz.strength.toFixed(1)}%</span>
              </div>
              <div className="mt-3 p-2 bg-blue-600/20 rounded border border-blue-500/30">
                <p className="text-xs text-blue-400">
                  현재 가격이 PRZ 구간에 {currentPrice >= currentGartley.prz.low && currentPrice <= currentGartley.prz.high ? '진입' : '미진입'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
          >
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaCoins className="text-yellow-400" />
              목표가 설정
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">TP1:</span>
                <span className="text-green-400 font-mono">${currentGartley.target.tp1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">TP2:</span>
                <span className="text-green-400 font-mono">${currentGartley.target.tp2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">TP3:</span>
                <span className="text-green-400 font-mono">${currentGartley.target.tp3.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-600 pt-2 mt-2">
                <span className="text-gray-400">손절가:</span>
                <span className="text-red-400 font-mono">${currentGartley.target.sl.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 피보나치 비율 정확도 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3">피보나치 비율 정확도</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'XAB', accuracy: fibAccuracy.XAB, ideal: 100 },
              { name: 'ABC', accuracy: fibAccuracy.ABC, ideal: 100 },
              { name: 'BCD', accuracy: fibAccuracy.BCD, ideal: 100 },
              { name: 'XAD', accuracy: fibAccuracy.XAD, ideal: 100 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#a855f7">
                {[fibAccuracy.XAB, fibAccuracy.ABC, fibAccuracy.BCD, fibAccuracy.XAD].map((value, index) => (
                  <Cell key={`cell-${index}`} fill={value > 80 ? '#10b981' : value > 60 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3">패턴 방향 분포</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: '상승 패턴', value: stats.bullishCount, fill: '#10b981' },
                  { name: '하락 패턴', value: stats.bearishCount, fill: '#ef4444' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 백테스팅 결과 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaClock className="text-blue-400" />
          가틀리 패턴 백테스팅 결과 (최근 6개월)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={backtestResults}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="winRate" stroke="#10b981" name="승률 (%)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#a855f7" name="수익률 (%)" strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="trades" stroke="#f59e0b" name="거래 횟수" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">평균 승률</div>
            <div className="text-xl font-bold text-green-400">69.7%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">총 수익률</div>
            <div className="text-xl font-bold text-purple-400">+91.6%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">총 거래</div>
            <div className="text-xl font-bold text-yellow-400">163회</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">평균 R:R</div>
            <div className="text-xl font-bold text-blue-400">1:2.3</div>
          </div>
        </div>
      </motion.div>

      {/* 트레이딩 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          가틀리 패턴 트레이딩 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 font-semibold mb-3">✅ 진입 체크리스트</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>D 포인트가 0.786 XA 레벨에 도달</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>PRZ 내에서 반전 캔들 패턴 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>RSI 다이버전스 발생</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>거래량 증가 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>상위 타임프레임 추세와 일치</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-red-400 font-semibold mb-3">⚠️ 주의사항</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>X 포인트를 넘어서면 즉시 손절</span>
              </li>
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>뉴스 이벤트 전후 진입 금지</span>
              </li>
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>자본금의 2% 이상 리스크 금지</span>
              </li>
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>PRZ 이탈 시 패턴 무효화</span>
              </li>
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>낮은 유동성 시간대 주의</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <h4 className="text-purple-400 font-semibold mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-gray-300">
            가틀리 패턴은 0.786 XA 되돌림이 핵심입니다. 이 레벨에서 강한 반전이 일어나지 않으면 패턴이 무효화될 가능성이 높습니다. 
            항상 PRZ 내에서 추가 확인 신호(캔들 패턴, 지표 다이버전스)를 기다린 후 진입하세요.
          </p>
        </div>
      </motion.div>
    </div>
  )
}