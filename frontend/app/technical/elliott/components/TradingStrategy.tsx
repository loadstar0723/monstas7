'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaBullseye, FaShieldAlt, FaCoins, 
  FaClock, FaExclamationTriangle, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaTachometerAlt
} from 'react-icons/fa'
import { PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface TradingStrategyProps {
  currentPrice: number
  waveData: any
  symbol: string
}

export default function TradingStrategy({ currentPrice, waveData, symbol }: TradingStrategyProps) {
  const [strategy, setStrategy] = useState({
    direction: 'LONG',
    entryPrice: 0,
    stopLoss: 0,
    takeProfit1: 0,
    takeProfit2: 0,
    takeProfit3: 0,
    riskRewardRatio: 0,
    positionSize: 0,
    leverage: 1,
    confidence: 0
  })

  // 전략 계산
  useEffect(() => {
    const calculateStrategy = () => {
      const isLong = waveData.currentWave === '3' || waveData.currentWave === '5' || waveData.currentWave === 'C'
      const direction = isLong ? 'LONG' : 'SHORT'
      
      // 진입가 계산
      const entryPrice = currentPrice
      
      // 손절가 계산 (파동 무효화 레벨 기준)
      const stopLoss = isLong 
        ? currentPrice * 0.97  // 3% 손절
        : currentPrice * 1.03
      
      // 목표가 계산 (피보나치 확장)
      const takeProfit1 = isLong
        ? currentPrice * 1.05  // 5% 수익
        : currentPrice * 0.95
      
      const takeProfit2 = isLong
        ? currentPrice * 1.10  // 10% 수익
        : currentPrice * 0.90
        
      const takeProfit3 = isLong
        ? currentPrice * 1.15  // 15% 수익
        : currentPrice * 0.85
      
      // 리스크 리워드 계산
      const risk = Math.abs(entryPrice - stopLoss)
      const reward = Math.abs(takeProfit2 - entryPrice)
      const riskRewardRatio = reward / risk
      
      // 포지션 크기 계산 (자본금의 3-5%)
      const capitalPercentage = waveData.confidence > 70 ? 0.05 : 0.03
      const positionSize = 10000 * capitalPercentage // 가정: 총 자본 $10,000
      
      // 레버리지 추천
      const leverage = waveData.confidence > 80 ? 3 : 
                      waveData.confidence > 60 ? 2 : 1
      
      setStrategy({
        direction,
        entryPrice,
        stopLoss,
        takeProfit1,
        takeProfit2,
        takeProfit3,
        riskRewardRatio,
        positionSize,
        leverage,
        confidence: waveData.confidence
      })
    }
    
    calculateStrategy()
  }, [currentPrice, waveData])

  // 리스크 평가 데이터
  const riskData = [
    { subject: '시장 변동성', value: 65 },
    { subject: '파동 신뢰도', value: waveData.confidence },
    { subject: '거래량', value: 75 },
    { subject: '모멘텀', value: 80 },
    { subject: '센티먼트', value: 70 },
  ]

  // 포지션 배분 데이터
  const positionData = [
    { name: '진입 1차', value: 40, color: '#10b981' },
    { name: '진입 2차', value: 35, color: '#3b82f6' },
    { name: '진입 3차', value: 25, color: '#8b5cf6' },
  ]

  // 시간대별 전략 데이터
  const timeframeData = [
    { timeframe: '1시간', win: 65, loss: 35 },
    { timeframe: '4시간', win: 72, loss: 28 },
    { timeframe: '1일', win: 78, loss: 22 },
    { timeframe: '1주', win: 82, loss: 18 },
  ]

  return (
    <div className="space-y-6">
      {/* 메인 전략 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaBullseye className="text-purple-500" />
          실시간 트레이딩 전략
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 포지션 방향 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">포지션 방향</span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                strategy.direction === 'LONG' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {strategy.direction === 'LONG' ? <FaArrowUp /> : <FaArrowDown />}
                <span className="font-bold">{strategy.direction}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">진입가</span>
                <span className="text-white font-medium">
                  ${strategy.entryPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">현재가</span>
                <span className="text-blue-400 font-medium">
                  ${currentPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 손절 & 익절 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 mb-3">손절 & 익절 레벨</div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-400">손절가</span>
                <span className="text-red-400 font-medium">
                  ${strategy.stopLoss.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">TP1 (5%)</span>
                <span className="text-green-400 font-medium">
                  ${strategy.takeProfit1.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">TP2 (10%)</span>
                <span className="text-green-400 font-medium">
                  ${strategy.takeProfit2.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">TP3 (15%)</span>
                <span className="text-green-400 font-medium">
                  ${strategy.takeProfit3.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 리스크 관리 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 mb-3">리스크 관리</div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">R:R 비율</span>
                <span className={`font-medium ${
                  strategy.riskRewardRatio > 2 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  1:{strategy.riskRewardRatio.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">포지션 크기</span>
                <span className="text-white font-medium">
                  ${strategy.positionSize.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">권장 레버리지</span>
                <span className="text-purple-400 font-medium">
                  {strategy.leverage}x
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">신뢰도</span>
                <span className={`font-medium ${
                  strategy.confidence > 70 ? 'text-green-400' : 
                  strategy.confidence > 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {strategy.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 리스크 평가 레이더 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-blue-500" />
            리스크 평가
          </h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={riskData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Radar 
                name="Risk" 
                dataKey="value" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-blue-300 text-xs">
              종합 리스크: <span className="font-bold">중간</span>
            </p>
          </div>
        </motion.div>

        {/* 포지션 배분 파이 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCoins className="text-yellow-500" />
            포지션 배분
          </h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={positionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {positionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-1">
            {positionData.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-400">{item.name}</span>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 시간대별 승률 바 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaClock className="text-green-500" />
            시간대별 승률
          </h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeframeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timeframe" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="win" fill="#10b981" />
              <Bar dataKey="loss" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
            <p className="text-green-300 text-xs">
              최적 시간대: <span className="font-bold">1일봉</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* 실행 권장사항 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          실행 권장사항
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 font-bold mb-3">진입 전략</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-gray-300">
                  현재 Wave {waveData.currentWave} 진행 중 - {waveData.completionRate}% 완성
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-gray-300">
                  분할 진입: 40% → 35% → 25% 순서로 포지션 구축
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-gray-300">
                  피보나치 되돌림 레벨에서 추가 매수 고려
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-yellow-400 font-bold mb-3">주의사항</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span className="text-gray-300">
                  무효화 레벨: ${waveData.invalidationLevel.toLocaleString()}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span className="text-gray-300">
                  파동 카운팅 변경 시 즉시 포지션 재평가
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span className="text-gray-300">
                  최대 손실: 자본금의 2% 이내로 제한
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm mb-1">예상 수익 (TP2 기준)</div>
              <div className="text-2xl font-bold text-green-400">
                +${((strategy.takeProfit2 - strategy.entryPrice) * (strategy.positionSize / strategy.entryPrice)).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">최대 손실 (SL 기준)</div>
              <div className="text-2xl font-bold text-red-400">
                -${((strategy.entryPrice - strategy.stopLoss) * (strategy.positionSize / strategy.entryPrice)).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">승률 기반 기댓값</div>
              <div className="text-2xl font-bold text-purple-400">
                +${(((strategy.takeProfit2 - strategy.entryPrice) * 0.72 - (strategy.entryPrice - strategy.stopLoss) * 0.28) * (strategy.positionSize / strategy.entryPrice)).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 경고 메시지 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-900/20 rounded-xl p-4 border border-red-700/30"
      >
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl mt-1" />
          <div>
            <div className="font-bold text-red-400 mb-1">리스크 경고</div>
            <p className="text-gray-300 text-sm">
              모든 트레이딩은 손실 위험이 있습니다. 이 전략은 참고용이며, 
              실제 트레이딩 전 충분한 백테스팅과 리스크 관리가 필요합니다.
              절대 감당할 수 없는 금액으로 트레이딩하지 마세요.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}