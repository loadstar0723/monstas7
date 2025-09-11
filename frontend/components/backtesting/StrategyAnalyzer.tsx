'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface Strategy {
  value: string
  label: string
  description: string
  performance?: any
}

interface StrategyAnalyzerProps {
  strategies: Strategy[]
  selectedStrategy: string
  onStrategyChange: (strategy: string) => void
}

export default function StrategyAnalyzer({ strategies, selectedStrategy, onStrategyChange }: StrategyAnalyzerProps) {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(selectedStrategy)

  // 전략별 상세 설정
  const strategyDetails = {
    'trend-following': {
      indicators: ['SMA 20', 'SMA 50', 'EMA 12', 'EMA 26'],
      parameters: {
        'Short MA': 20,
        'Long MA': 50,
        'Stop Loss': '2%',
        'Take Profit': '5%'
      },
      pros: ['시장 추세 활용', '명확한 진입/청산 신호', '큰 수익 가능성'],
      cons: ['횡보장 약세', '늦은 진입 가능성', '급변동 취약']
    },
    'mean-reversion': {
      indicators: ['RSI', 'Bollinger Bands', 'StochRSI'],
      parameters: {
        'RSI Period': 14,
        'Oversold': 30,
        'Overbought': 70,
        'BB Period': 20
      },
      pros: ['횡보장 유리', '높은 승률', '명확한 타이밍'],
      cons: ['강한 추세 시 손실', '제한된 수익', '빈번한 거래']
    },
    'breakout': {
      indicators: ['Volume', 'ATR', 'Support/Resistance'],
      parameters: {
        'Volume Threshold': '150%',
        'ATR Period': 14,
        'Lookback': 20,
        'Confirmation': '2 candles'
      },
      pros: ['큰 수익 기회', '명확한 신호', '추세 초기 진입'],
      cons: ['가짜 돌파 위험', '낮은 빈도', '높은 변동성']
    },
    'grid-trading': {
      indicators: ['Price Levels', 'Range Detection'],
      parameters: {
        'Grid Size': '1%',
        'Grid Count': 10,
        'Range': '5%',
        'Order Size': '10%'
      },
      pros: ['자동화 용이', '횡보장 수익', '리스크 분산'],
      cons: ['추세장 약세', '자본 효율 낮음', '복잡한 관리']
    },
    'momentum': {
      indicators: ['MACD', 'ADX', 'Volume'],
      parameters: {
        'MACD Fast': 12,
        'MACD Slow': 26,
        'Signal': 9,
        'ADX Threshold': 25
      },
      pros: ['강한 움직임 포착', '다양한 시장 대응', '높은 수익률'],
      cons: ['늦은 신호', '노이즈 민감', '빈번한 조정']
    }
  }

  const getStrategyIcon = (strategy: string) => {
    const icons: Record<string, string> = {
      'trend-following': '📈',
      'mean-reversion': '🔄',
      'breakout': '🚀',
      'grid-trading': '⚡',
      'momentum': '💨'
    }
    return icons[strategy] || '📊'
  }

  const getPerformanceColor = (value: number) => {
    if (value > 10) return 'text-green-400'
    if (value > 0) return 'text-green-300'
    if (value > -10) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-purple-400">🎯</span>
          전략 분석 및 비교
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategies.map((strategy, index) => {
            const details = strategyDetails[strategy.value as keyof typeof strategyDetails]
            const isSelected = selectedStrategy === strategy.value
            const isExpanded = expandedStrategy === strategy.value

            return (
              <motion.div
                key={strategy.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800/50 rounded-lg border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => {
                  onStrategyChange(strategy.value)
                  setExpandedStrategy(isExpanded ? null : strategy.value)
                }}
              >
                <div className="p-4">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStrategyIcon(strategy.value)}</span>
                      <div>
                        <h4 className="font-semibold text-white">{strategy.label}</h4>
                        <p className="text-xs text-gray-400">{strategy.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                        선택됨
                      </span>
                    )}
                  </div>

                  {/* 간단한 성과 지표 */}
                  {strategy.performance && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">예상 수익</div>
                        <div className={`text-sm font-bold ${getPerformanceColor(strategy.performance.totalReturn || 0)}`}>
                          {strategy.performance.totalReturn ? `${safeFixed(strategy.performance.totalReturn, 1)}%` : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">승률</div>
                        <div className="text-sm font-bold text-blue-400">
                          {strategy.performance.winRate ? `${safeFixed(strategy.performance.winRate, 0)}%` : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">샤프비율</div>
                        <div className="text-sm font-bold text-purple-400">
                          {strategy.performance.sharpeRatio ? safeFixed(strategy.performance.sharpeRatio, 2) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 확장 내용 */}
                  {isExpanded && details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 border-t border-gray-700"
                    >
                      {/* 사용 지표 */}
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-400 mb-2">사용 지표</h5>
                        <div className="flex flex-wrap gap-1">
                          {details.indicators.map(indicator => (
                            <span key={indicator} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 파라미터 */}
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-400 mb-2">주요 파라미터</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(details.parameters).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500">{key}:</span>
                              <span className="text-gray-300 font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 장단점 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h5 className="text-xs font-semibold text-green-400 mb-1">장점</h5>
                          <ul className="space-y-1">
                            {details.pros.map((pro, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                                <span className="text-green-400">+</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-red-400 mb-1">단점</h5>
                          <ul className="space-y-1">
                            {details.cons.map((con, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                                <span className="text-red-400">-</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 전략 추천 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/30">
        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span>💡</span>
          AI 전략 추천
        </h4>
        <p className="text-sm text-gray-300 mb-3">
          현재 시장 상황과 선택한 코인의 특성을 고려한 최적 전략입니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">변동성 기준</div>
            <div className="text-sm font-semibold text-white">
              {selectedStrategy === 'mean-reversion' ? '평균 회귀' : '추세 추종'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">시장 단계</div>
            <div className="text-sm font-semibold text-white">
              {selectedStrategy === 'breakout' ? '돌파 전략' : '그리드 트레이딩'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">리스크 수준</div>
            <div className="text-sm font-semibold text-white">
              {selectedStrategy === 'momentum' ? '모멘텀' : '추세 추종'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}