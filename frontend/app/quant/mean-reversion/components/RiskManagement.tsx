'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface Coin {
  symbol: string
  name: string
  color: string
}

interface MarketData {
  price: number
  high24h: number
  low24h: number
  zScore: number
  rsi: number
}

interface RiskManagementProps {
  coin: Coin
  marketData: MarketData | null
}

export default function RiskManagement({ coin, marketData }: RiskManagementProps) {
  const [capital, setCapital] = useState(10000)
  const [leverage, setLeverage] = useState(1)
  const [positionSize, setPositionSize] = useState(1000)
  const [riskHistory, setRiskHistory] = useState<any[]>([])
  const [animatedRiskScore, setAnimatedRiskScore] = useState(0)
  const [riskFactors, setRiskFactors] = useState<any[]>([])

  const calculateRisk = () => {
    if (!marketData) return null

    const volatility = ((marketData.high24h - marketData.low24h) / marketData.price) * 100
    const riskScore = 
      (Math.abs(marketData.zScore) > 2 ? 30 : 0) +
      (marketData.rsi > 70 || marketData.rsi < 30 ? 20 : 0) +
      (volatility > 10 ? 30 : volatility > 5 ? 15 : 0) +
      (leverage > 3 ? 20 : leverage > 1 ? 10 : 0)

    return {
      score: riskScore,
      level: riskScore >= 70 ? '고위험' : riskScore >= 40 ? '중간' : '저위험',
      color: riskScore >= 70 ? 'red' : riskScore >= 40 ? 'yellow' : 'green',
      volatility
    }
  }

  const risk = calculateRisk()

  // 리스크 점수 애니메이션
  useEffect(() => {
    if (risk) {
      const interval = setInterval(() => {
        setAnimatedRiskScore(prev => {
          const diff = risk.score - prev
          if (Math.abs(diff) < 1) return risk.score
          return prev + diff * 0.1
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [risk?.score])

  // 리스크 히스토리 업데이트
  useEffect(() => {
    if (!risk) return

    const intervalId = setInterval(() => {
      setRiskHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          score: risk.score + (Math.random() - 0.5) * 10,
          volatility: risk.volatility + (Math.random() - 0.5) * 2
        }
        return [...prev, newPoint].slice(-30)
      })
    }, 5000)

    return () => clearInterval(intervalId)
  }, [risk])

  // 리스크 요인 분석
  useEffect(() => {
    if (!marketData) return

    const factors = [
      { 
        factor: '변동성', 
        value: Math.min(100, ((marketData.high24h - marketData.low24h) / marketData.price) * 1000),
        fullMark: 100
      },
      { 
        factor: 'Z-Score', 
        value: Math.min(100, Math.abs(marketData.zScore) * 33),
        fullMark: 100
      },
      { 
        factor: 'RSI', 
        value: marketData.rsi > 70 || marketData.rsi < 30 ? 80 : 40,
        fullMark: 100
      },
      { 
        factor: '레버리지', 
        value: leverage * 20,
        fullMark: 100
      },
      { 
        factor: '포지션크기', 
        value: (positionSize / capital) * 100,
        fullMark: 100
      }
    ]
    setRiskFactors(factors)
  }, [marketData, leverage, positionSize, capital])

  const recommendedPositionSize = capital * (risk?.score ? Math.max(0.02, 0.1 - risk.score / 1000) : 0.05)
  const stopLossAmount = positionSize * 0.03
  const maxLossAmount = positionSize * leverage * 0.03

  // 파이 차트 데이터
  const riskDistribution = [
    { name: '안전자본', value: capital - positionSize, color: '#10B981' },
    { name: '투자자본', value: positionSize, color: '#8B5CF6' },
    { name: '리스크자본', value: maxLossAmount, color: '#EF4444' }
  ]

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-white mb-6">리스크 관리</h3>

      {/* 리스크 점수 애니메이션 */}
      {risk && (
        <motion.div 
          className="mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">현재 리스크 수준</span>
            <motion.span 
              className={`font-bold text-${risk.color}-400 text-xl`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {risk.level}
            </motion.span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div 
              className={`h-4 rounded-full bg-gradient-to-r ${
                risk.color === 'red' ? 'from-red-500 to-red-400' :
                risk.color === 'yellow' ? 'from-yellow-500 to-yellow-400' :
                'from-green-500 to-green-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${animatedRiskScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>저위험</span>
            <span>중간</span>
            <span>고위험</span>
          </div>
        </motion.div>
      )}

      {/* 리스크 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 리스크 히스토리 차트 */}
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">리스크 점수 추이</h4>
          <div className="h-48">
            {riskHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 10 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={coin.color || '#8B5CF6'}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volatility" 
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터 수집 중...
              </div>
            )}
          </div>
        </div>

        {/* 리스크 요인 레이더 차트 */}
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">리스크 요인 분석</h4>
          <div className="h-48">
            {riskFactors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskFactors}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="factor" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <Radar 
                    name="리스크" 
                    dataKey="value" 
                    stroke={coin.color || '#8B5CF6'}
                    fill={coin.color || '#8B5CF6'}
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                분석 중...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 자본 배분 파이 차트 */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">자본 배분 현황</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 포지션 계산기 */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">포지션 계산기</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">총 자본금</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full bg-gray-800 text-white rounded px-3 py-1.5 mt-1 border border-gray-700 focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">레버리지</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 5, 10].map(lev => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`px-3 py-1 rounded text-sm ${
                    leverage === lev 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">포지션 크기</label>
            <div className="flex gap-2 items-center mt-1">
              <input
                type="range"
                min={capital * 0.01}
                max={capital * 0.3}
                value={positionSize}
                onChange={(e) => setPositionSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-medium w-20 text-right">
                ${safeFixed(positionSize, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 리스크 계산 결과 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-3 border border-blue-700/30">
          <div className="text-blue-400 text-sm mb-1">권장 포지션</div>
          <div className="text-white font-bold">${safeFixed(recommendedPositionSize, 0)}</div>
          <div className="text-xs text-gray-500">
            자본의 {((recommendedPositionSize / capital) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-3 border border-purple-700/30">
          <div className="text-purple-400 text-sm mb-1">실제 포지션</div>
          <div className="text-white font-bold">${(positionSize * leverage).toFixed(0)}</div>
          <div className="text-xs text-gray-500">
            레버리지 {leverage}x 적용
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-3 border border-green-700/30">
          <div className="text-green-400 text-sm mb-1">예상 손실 (-3%)</div>
          <div className="text-white font-bold">-${safeFixed(stopLossAmount, 0)}</div>
          <div className="text-xs text-gray-500">
            자본의 {((stopLossAmount / capital) * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-lg p-3 border border-red-700/30">
          <div className="text-red-400 text-sm mb-1">최대 손실</div>
          <div className="text-white font-bold">-${safeFixed(maxLossAmount, 0)}</div>
          <div className="text-xs text-gray-500">
            자본의 {((maxLossAmount / capital) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 리스크 관리 원칙 */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-700/30">
        <h4 className="text-yellow-400 font-medium mb-2">평균회귀 리스크 관리 원칙</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>1회 거래 리스크는 총 자본의 2-3% 이내</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>변동성 높을 때 포지션 축소</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>Z-Score 극단값에서만 진입</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>손절선 반드시 설정 (-3%)</span>
          </li>
        </ul>
      </div>
    </motion.div>
  )
}