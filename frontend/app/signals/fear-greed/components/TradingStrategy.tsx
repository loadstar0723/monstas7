'use client'

import { motion } from 'framer-motion'
import { FearGreedData } from '../hooks/useFearGreedData'
import { 
  FaChartLine, FaDollarSign, FaExclamationTriangle, 
  FaCheckCircle, FaTimesCircle, FaBalanceScale 
} from 'react-icons/fa'

interface TradingStrategyProps {
  coin: string
  fearGreedData: FearGreedData | null
}

export default function TradingStrategy({ coin, fearGreedData }: TradingStrategyProps) {
  const value = fearGreedData?.value || 50
  const price = fearGreedData?.coinPrice || 0

  // 전략 계산
  const getStrategy = () => {
    if (value <= 20) {
      return {
        type: '적극적 매수 전략',
        position: 'LONG',
        entry: [
          { price: price * 0.98, portion: '30%', description: '첫 진입' },
          { price: price * 0.95, portion: '40%', description: '추가 매수' },
          { price: price * 0.92, portion: '30%', description: '마지막 매수' }
        ],
        stopLoss: price * 0.88,
        targets: [
          { price: price * 1.10, portion: '30%', gain: '+10%' },
          { price: price * 1.20, portion: '40%', gain: '+20%' },
          { price: price * 1.35, portion: '30%', gain: '+35%' }
        ],
        leverage: '현물 또는 2x 이하',
        timeframe: '중장기 (1-3개월)',
        confidence: 85
      }
    } else if (value <= 35) {
      return {
        type: '신중한 매수 전략',
        position: 'LONG',
        entry: [
          { price: price * 0.99, portion: '25%', description: '테스트 진입' },
          { price: price * 0.96, portion: '50%', description: '본 진입' },
          { price: price * 0.93, portion: '25%', description: '추가 매수' }
        ],
        stopLoss: price * 0.90,
        targets: [
          { price: price * 1.07, portion: '40%', gain: '+7%' },
          { price: price * 1.15, portion: '40%', gain: '+15%' },
          { price: price * 1.25, portion: '20%', gain: '+25%' }
        ],
        leverage: '현물 권장',
        timeframe: '중기 (2-4주)',
        confidence: 70
      }
    } else if (value <= 65) {
      return {
        type: '중립 관망 전략',
        position: 'NEUTRAL',
        entry: [
          { price: price * 0.95, portion: '50%', description: '하락 시 매수' },
          { price: price * 1.05, portion: '50%', description: '상승 시 추격' }
        ],
        stopLoss: price * 0.93,
        targets: [
          { price: price * 1.05, portion: '50%', gain: '+5%' },
          { price: price * 1.10, portion: '50%', gain: '+10%' }
        ],
        leverage: '사용 금지',
        timeframe: '단기 (1-2주)',
        confidence: 50
      }
    } else if (value <= 80) {
      return {
        type: '차익 실현 전략',
        position: 'SHORT 준비',
        entry: [
          { price: price * 1.01, portion: '30%', description: '일부 매도' },
          { price: price * 1.03, portion: '40%', description: '추가 매도' },
          { price: price * 1.05, portion: '30%', description: '최종 매도' }
        ],
        stopLoss: price * 1.08,
        targets: [
          { price: price * 0.95, portion: '30%', gain: '-5%' },
          { price: price * 0.90, portion: '40%', gain: '-10%' },
          { price: price * 0.85, portion: '30%', gain: '-15%' }
        ],
        leverage: '숏 포지션 고려',
        timeframe: '단기 (3-7일)',
        confidence: 70
      }
    } else {
      return {
        type: '적극적 매도 전략',
        position: 'SHORT',
        entry: [
          { price: price * 1.00, portion: '50%', description: '즉시 매도' },
          { price: price * 1.02, portion: '30%', description: '반등 시 매도' },
          { price: price * 0.98, portion: '20%', description: '하락 시 매도' }
        ],
        stopLoss: price * 1.10,
        targets: [
          { price: price * 0.92, portion: '30%', gain: '-8%' },
          { price: price * 0.85, portion: '40%', gain: '-15%' },
          { price: price * 0.75, portion: '30%', gain: '-25%' }
        ],
        leverage: '숏 포지션 적극 활용',
        timeframe: '단기 (1-2주)',
        confidence: 85
      }
    }
  }

  const strategy = getStrategy()
  
  const getPositionColor = (position: string) => {
    if (position === 'LONG') return 'text-green-400'
    if (position === 'SHORT') return 'text-red-400'
    return 'text-yellow-400'
  }

  const getPositionBg = (position: string) => {
    if (position === 'LONG') return 'from-green-900/20 to-green-800/10'
    if (position === 'SHORT') return 'from-red-900/20 to-red-800/10'
    return 'from-yellow-900/20 to-yellow-800/10'
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">트레이딩 전략</h2>
        <div className={`px-3 py-1 rounded-lg font-bold ${getPositionColor(strategy.position)} bg-gray-900/50`}>
          {strategy.position}
        </div>
      </div>

      {/* 전략 개요 */}
      <motion.div
        className={`bg-gradient-to-r ${getPositionBg(strategy.position)} rounded-xl p-4 mb-6 border border-gray-700`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{strategy.type}</h3>
            <p className="text-sm text-gray-400">시간대: {strategy.timeframe}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">신뢰도</p>
            <p className="text-2xl font-bold text-white">{strategy.confidence}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <FaBalanceScale className="text-yellow-400" />
          <span className="text-gray-300">레버리지: {strategy.leverage}</span>
        </div>
      </motion.div>

      {/* 진입 전략 */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          진입 전략
        </h4>
        <div className="space-y-2">
          {strategy.entry.map((entry, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 rounded-lg p-3 flex justify-between items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-400">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    ${entry.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400">{entry.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-400">{entry.portion}</p>
                <p className="text-xs text-gray-400">비중</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 목표가 */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
          <FaDollarSign className="text-green-400" />
          목표가
        </h4>
        <div className="space-y-2">
          {strategy.targets.map((target, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 rounded-lg p-3 flex justify-between items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    ${target.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-green-400">{target.gain}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-400">{target.portion}</p>
                <p className="text-xs text-gray-400">실현</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 손절가 */}
      <motion.div
        className="bg-red-900/20 rounded-lg p-4 border border-red-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className="text-sm font-medium text-gray-300">손절가</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">
              ${strategy.stopLoss.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-red-400">
              {((strategy.stopLoss - price) / price * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* 리스크/리워드 */}
      <motion.div
        className="mt-6 grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">리스크</p>
          <p className="text-lg font-bold text-red-400">
            {Math.abs((strategy.stopLoss - price) / price * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">리워드</p>
          <p className="text-lg font-bold text-green-400">
            {Math.abs((strategy.targets[1].price - price) / price * 100).toFixed(1)}%
          </p>
        </div>
      </motion.div>
    </div>
  )
}