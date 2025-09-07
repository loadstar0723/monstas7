'use client'

import { motion } from 'framer-motion'
import { FaChartLine, FaExclamationTriangle, FaBullseye, FaCoins } from 'react-icons/fa'

interface TradingPlanBoxProps {
  currentPrice: number
  entryPrice: number
  stopLoss: number
  targets: number[]
  confidence: number
  timeframe?: string
  symbol?: string
}

/**
 * 트레이딩 플랜 박스 컴포넌트
 * 진입가, 손절가, 목표가를 명확하게 표시
 */
export default function TradingPlanBox({
  currentPrice,
  entryPrice,
  stopLoss,
  targets,
  confidence,
  timeframe = '단기',
  symbol = 'BTC'
}: TradingPlanBoxProps) {
  const entryDiff = ((entryPrice - currentPrice) / currentPrice * 100).toFixed(2)
  const stopLossDiff = ((stopLoss - currentPrice) / currentPrice * 100).toFixed(2)
  const riskAmount = Math.abs(entryPrice - stopLoss)
  const riskPercentage = (riskAmount / entryPrice * 100).toFixed(2)

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-400 border-green-400'
    if (confidence >= 60) return 'text-blue-400 border-blue-400'
    if (confidence >= 40) return 'text-yellow-400 border-yellow-400'
    return 'text-red-400 border-red-400'
  }

  const getConfidenceEmoji = () => {
    if (confidence >= 80) return '🚀'
    if (confidence >= 60) return '✅'
    if (confidence >= 40) return '⚠️'
    return '❌'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/30"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-purple-400 text-2xl" />
          <h3 className="text-xl font-bold text-white">트레이딩 플랜</h3>
        </div>
        <div className={`px-3 py-1 rounded-full border ${getConfidenceColor()}`}>
          <span className="text-sm font-bold">{getConfidenceEmoji()} {confidence}% 신뢰도</span>
        </div>
      </div>

      {/* 현재가 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            <span className="text-gray-400">현재가</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">${currentPrice.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{symbol}/USDT</div>
          </div>
        </div>
      </div>

      {/* 진입가 */}
      <div className="bg-green-900/20 rounded-lg p-4 mb-4 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">진입가</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">${entryPrice.toLocaleString()}</div>
            <div className={`text-sm ${Number(entryDiff) < 0 ? 'text-green-400' : 'text-gray-400'}`}>
              {Number(entryDiff) < 0 ? '▼' : '▲'} {Math.abs(Number(entryDiff))}%
            </div>
          </div>
        </div>
      </div>

      {/* 손절가 */}
      <div className="bg-red-900/20 rounded-lg p-4 mb-4 border border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className="text-red-400 font-medium">손절가</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">${stopLoss.toLocaleString()}</div>
            <div className="text-sm text-red-400">
              ▼ {Math.abs(Number(stopLossDiff))}% (리스크: {riskPercentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* 목표가 */}
      <div className="space-y-3 mb-4">
        {targets.map((target, index) => {
          const targetDiff = ((target - entryPrice) / entryPrice * 100).toFixed(2)
          const riskRewardRatio = ((target - entryPrice) / riskAmount).toFixed(2)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBullseye className="text-blue-400" />
                  <span className="text-blue-400 font-medium">목표 {index + 1}</span>
                  {index === 0 && <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">1차</span>}
                  {index === 1 && <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">2차</span>}
                  {index === 2 && <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded">최종</span>}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${target.toLocaleString()}</div>
                  <div className="text-sm text-green-400">
                    ▲ +{targetDiff}% (R:R = 1:{riskRewardRatio})
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 추가 정보 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">시간대</div>
          <div className="text-sm font-bold text-white">{timeframe}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">포지션 크기</div>
          <div className="text-sm font-bold text-yellow-400">자산의 30%</div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-4 flex gap-3">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all">
          지금 진입하기
        </button>
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all">
          알림 설정
        </button>
      </div>
    </motion.div>
  )
}