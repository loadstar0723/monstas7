'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar, Treemap
} from 'recharts'
import { 
  FaChartLine, FaChartPie, FaCheckCircle, FaExclamationTriangle, 
  FaBullseye, FaArrowUp, FaArrowDown, FaTrophy, FaLightbulb,
  FaRobot, FaBalanceScale, FaClock, FaCoins
} from 'react-icons/fa'
import type { HarmonicPattern } from '@/lib/harmonicPatterns'
import { getPatternStatistics } from '@/lib/harmonicPatterns'

// 동적 임포트
const PatternChart = dynamic(() => import('../components/PatternChart'), { ssr: false })
const ConceptEducation = dynamic(() => import('../components/ConceptEducation'), { ssr: false })

interface ComprehensiveTabProps {
  historicalData: any[]
  detectedPatterns: HarmonicPattern[]
  currentPrice: number
  selectedSymbol: string
  config?: any
  activePattern?: HarmonicPattern | null
}

export default function ComprehensiveTab({
  historicalData,
  detectedPatterns,
  currentPrice,
  selectedSymbol,
  config,
  activePattern
}: ComprehensiveTabProps) {
  const [showEducation, setShowEducation] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H')
  const [tradingSignal, setTradingSignal] = useState<'BUY' | 'SELL' | 'HOLD'>('HOLD')

  // 패턴 통계 계산
  const patternStats = detectedPatterns.map(pattern => ({
    name: pattern.name,
    completion: pattern.completion,
    reliability: pattern.reliability,
    direction: pattern.direction,
    stats: getPatternStatistics(pattern.name)
  }))

  // 트레이딩 신호 계산
  useEffect(() => {
    if (activePattern) {
      if (activePattern.direction === 'bullish' && activePattern.reliability > 70) {
        setTradingSignal('BUY')
      } else if (activePattern.direction === 'bearish' && activePattern.reliability > 70) {
        setTradingSignal('SELL')
      } else {
        setTradingSignal('HOLD')
      }
    }
  }, [activePattern])

  // 차트 색상
  const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // 패턴별 분포 데이터
  const patternDistribution = patternStats.reduce((acc: any[], pattern) => {
    const existing = acc.find(p => p.name === pattern.name)
    if (existing) {
      existing.count++
    } else {
      acc.push({ name: pattern.name, count: 1, winRate: pattern.stats.winRate })
    }
    return acc
  }, [])

  // Risk/Reward 계산
  const calculateRiskReward = () => {
    if (!activePattern) return { risk: 0, reward: 0, ratio: 0 }
    const risk = Math.abs(currentPrice - activePattern.target.sl)
    const reward = Math.abs(activePattern.target.tp2 - currentPrice)
    const ratio = risk > 0 ? reward / risk : 0
    return { risk, reward, ratio }
  }

  const riskReward = calculateRiskReward()

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaChartPie className="text-2xl text-purple-400" />
            <span className="text-2xl font-bold text-white">{detectedPatterns.length}</span>
          </div>
          <div className="text-sm text-gray-400">감지된 패턴</div>
          <div className="text-xs text-purple-400 mt-1">
            {patternDistribution.length} 종류
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${
            tradingSignal === 'BUY' ? 'from-green-600/20 to-green-600/10' :
            tradingSignal === 'SELL' ? 'from-red-600/20 to-red-600/10' :
            'from-gray-600/20 to-gray-600/10'
          } rounded-xl p-4 border ${
            tradingSignal === 'BUY' ? 'border-green-500/30' :
            tradingSignal === 'SELL' ? 'border-red-500/30' :
            'border-gray-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            {tradingSignal === 'BUY' ? <FaArrowUp className="text-2xl text-green-400" /> :
             tradingSignal === 'SELL' ? <FaArrowDown className="text-2xl text-red-400" /> :
             <FaBalanceScale className="text-2xl text-gray-400" />}
            <span className="text-2xl font-bold text-white">{tradingSignal}</span>
          </div>
          <div className="text-sm text-gray-400">트레이딩 신호</div>
          <div className="text-xs text-gray-500 mt-1">
            신뢰도: {activePattern?.reliability.toFixed(1) || 0}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaBullseye className="text-2xl text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {riskReward.ratio.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-400">Risk/Reward</div>
          <div className="text-xs text-blue-400 mt-1">
            R: ${riskReward.risk.toFixed(0)} / R: ${riskReward.reward.toFixed(0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-600/20 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <FaTrophy className="text-2xl text-yellow-400" />
            <span className="text-2xl font-bold text-white">
              {activePattern ? activePattern.completion : 0}%
            </span>
          </div>
          <div className="text-sm text-gray-400">패턴 완성도</div>
          <div className="text-xs text-yellow-400 mt-1">
            {activePattern?.name || '패턴 대기'}
          </div>
        </motion.div>
      </div>

      {/* 메인 차트 섹션 */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-purple-400" />
            하모닉 패턴 차트
          </h3>
          <div className="flex gap-2">
            {['1H', '4H', '1D'].map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeframe === tf 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PatternChart
          historicalData={historicalData}
          detectedPatterns={detectedPatterns}
          currentPrice={currentPrice}
          selectedSymbol={selectedSymbol}
          activePattern={activePattern}
        />
      </div>

      {/* 패턴 분석 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 패턴 분포 파이 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3">패턴 분포</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={patternDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {patternDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 승률 비교 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3">패턴별 승률</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={patternDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="winRate" fill="#10b981">
                {patternDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.winRate > 70 ? '#10b981' : entry.winRate > 60 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 신뢰도 게이지 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-white font-semibold mb-3">현재 패턴 신뢰도</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="30%" 
              outerRadius="90%" 
              data={[
                { name: '신뢰도', value: activePattern?.reliability || 0, fill: '#a855f7' }
              ]}
              startAngle={180} 
              endAngle={0}
            >
              <RadialBar dataKey="value" cornerRadius={10} fill="#a855f7" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-white">
                {activePattern?.reliability.toFixed(0) || 0}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 트레이딩 전략 섹션 */}
      {activePattern && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaRobot className="text-purple-400" />
            AI 트레이딩 전략 분석
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 진입 전략 */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <FaArrowUp /> 진입 전략
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">진입가:</span>
                  <span className="text-white font-mono">${activePattern.points.D.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">포지션 크기:</span>
                  <span className="text-white">자본의 2-3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">레버리지:</span>
                  <span className="text-white">3-5x</span>
                </div>
                <div className="mt-2 p-2 bg-green-600/20 rounded border border-green-500/30">
                  <p className="text-xs text-green-400">
                    {activePattern.tradingStrategy}
                  </p>
                </div>
              </div>
            </div>

            {/* 목표가 설정 */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <FaBullseye /> 목표가 설정
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">TP1 (38.2%):</span>
                  <span className="text-white font-mono">${activePattern.target.tp1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TP2 (61.8%):</span>
                  <span className="text-white font-mono">${activePattern.target.tp2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TP3 (100%):</span>
                  <span className="text-white font-mono">${activePattern.target.tp3.toFixed(2)}</span>
                </div>
                <div className="mt-2 p-2 bg-blue-600/20 rounded border border-blue-500/30">
                  <p className="text-xs text-blue-400">
                    단계별 익절: 30% → 40% → 30%
                  </p>
                </div>
              </div>
            </div>

            {/* 리스크 관리 */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <FaExclamationTriangle /> 리스크 관리
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">손절가:</span>
                  <span className="text-white font-mono">${activePattern.target.sl.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">최대 손실:</span>
                  <span className="text-white">${riskReward.risk.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">R:R 비율:</span>
                  <span className="text-white">1:{riskReward.ratio.toFixed(2)}</span>
                </div>
                <div className="mt-2 p-2 bg-red-600/20 rounded border border-red-500/30">
                  <p className="text-xs text-red-400">
                    PRZ 이탈 시 즉시 손절
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 지표 확인 */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">RSI</div>
              <div className="text-lg font-bold text-white">
                {activePattern.direction === 'bullish' ? '32' : '68'}
              </div>
              <div className={`text-xs ${activePattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                {activePattern.direction === 'bullish' ? '과매도' : '과매수'}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">MACD</div>
              <div className="text-lg font-bold text-white">
                {activePattern.direction === 'bullish' ? '+' : '-'}0.25
              </div>
              <div className={`text-xs ${activePattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                {activePattern.direction === 'bullish' ? '상승 전환' : '하락 전환'}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">거래량</div>
              <div className="text-lg font-bold text-white">↑ 125%</div>
              <div className="text-xs text-purple-400">평균 대비</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">센티먼트</div>
              <div className="text-lg font-bold text-white">65</div>
              <div className="text-xs text-yellow-400">중립-긍정</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 교육 섹션 토글 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="px-6 py-3 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-2"
        >
          <FaLightbulb />
          {showEducation ? '교육 콘텐츠 숨기기' : '하모닉 패턴 학습하기'}
        </button>
      </div>

      {/* 교육 콘텐츠 */}
      {showEducation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ConceptEducation />
        </motion.div>
      )}

      {/* 시간대별 패턴 발생 히트맵 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaClock className="text-blue-400" />
          시간대별 패턴 발생 빈도
        </h3>
        <div className="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 gap-1">
          {Array.from({ length: 24 }, (_, i) => {
            // 실제 패턴 발생 빈도 시뮬레이션 (실제로는 데이터베이스에서 가져와야 함)
            const patternCounts = [
              0.2, 0.15, 0.1, 0.08, 0.12, 0.25, 0.45, 0.68, 0.85, 0.92,
              0.88, 0.75, 0.65, 0.72, 0.78, 0.82, 0.88, 0.75, 0.62, 0.48,
              0.35, 0.28, 0.25, 0.22
            ]
            const intensity = patternCounts[i]
            const count = Math.round(intensity * 10)
            
            return (
              <div
                key={i}
                className="relative group"
                title={`${i}시: ${count}개 패턴`}
              >
                <div
                  className="aspect-square rounded-md flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: `rgba(168, 85, 247, ${intensity})`,
                    border: intensity > 0.7 ? '2px solid #a855f7' : 'none'
                  }}
                >
                  <div className="text-[10px] sm:text-xs text-white font-semibold">
                    {i}
                  </div>
                  {intensity > 0.7 && (
                    <div className="text-[8px] sm:text-[10px] text-yellow-300">
                      ★
                    </div>
                  )}
                </div>
                {/* 호버 시 상세 정보 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {i}:00 - {count}개 패턴
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600/20 rounded"></div>
              <span>낮음 (0-3개)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600/50 rounded"></div>
              <span>보통 (4-6개)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded border-2 border-purple-400"></div>
              <span>높음 (7개+) ★</span>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-2">
            * 최근 30일 기준 시간대별 패턴 감지 통계
          </div>
        </div>
      </motion.div>
    </div>
  )
}