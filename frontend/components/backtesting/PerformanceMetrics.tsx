'use client'

import { motion } from 'framer-motion'

interface Metrics {
  totalTrades: number
  winRate: number
  avgProfit: number
  maxProfit: number
  maxLoss: number
  sharpeRatio: number
  maxDrawdown: number
}

interface PerformanceMetricsProps {
  metrics: Metrics
  coin: { symbol: string; name: string; icon: string }
  strategy: string
}

export default function PerformanceMetrics({ metrics, coin, strategy }: PerformanceMetricsProps) {
  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'winRate':
        return value >= 60 ? 'text-green-400' : value >= 40 ? 'text-yellow-400' : 'text-red-400'
      case 'profit':
        return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'
      case 'sharpe':
        return value >= 1.5 ? 'text-green-400' : value >= 0.5 ? 'text-yellow-400' : 'text-red-400'
      case 'drawdown':
        return value <= 10 ? 'text-green-400' : value <= 20 ? 'text-yellow-400' : 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRiskLevel = () => {
    const riskScore = 
      (metrics.maxDrawdown > 20 ? 3 : metrics.maxDrawdown > 10 ? 2 : 1) +
      (metrics.sharpeRatio < 0.5 ? 3 : metrics.sharpeRatio < 1 ? 2 : 1) +
      (metrics.winRate < 40 ? 3 : metrics.winRate < 50 ? 2 : 1)
    
    if (riskScore >= 7) return { level: '높음', color: 'text-red-400', bg: 'bg-red-900/20' }
    if (riskScore >= 5) return { level: '중간', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
    return { level: '낮음', color: 'text-green-400', bg: 'bg-green-900/20' }
  }

  const getRecommendation = () => {
    if (metrics.winRate >= 60 && metrics.sharpeRatio >= 1.5) {
      return '매우 우수한 전략입니다. 실전 적용을 권장합니다.'
    } else if (metrics.winRate >= 50 && metrics.sharpeRatio >= 1) {
      return '양호한 전략입니다. 리스크 관리와 함께 사용하세요.'
    } else if (metrics.winRate >= 40) {
      return '개선이 필요한 전략입니다. 파라미터 조정을 고려하세요.'
    } else {
      return '위험한 전략입니다. 다른 전략을 검토해보세요.'
    }
  }

  const risk = getRiskLevel()

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">📊</span>
          백테스트 성과 지표
        </h3>
        <div className={`px-3 py-1 ${risk.bg} rounded-full flex items-center gap-2`}>
          <div className={`w-2 h-2 ${risk.color.replace('text', 'bg')} rounded-full animate-pulse`}></div>
          <span className={`text-sm font-medium ${risk.color}`}>리스크: {risk.level}</span>
        </div>
      </div>

      {/* 주요 지표 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">📈</span>
            <span className="text-xs text-gray-400">총 거래 횟수</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.totalTrades}
            <span className="text-xs text-gray-400 ml-1">회</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">🎯</span>
            <span className="text-xs text-gray-400">승률</span>
          </div>
          <div className={`text-2xl font-bold ${getMetricColor('winRate', metrics.winRate)}`}>
            {metrics.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            승: {Math.round(metrics.totalTrades * metrics.winRate / 100)} / 
            패: {Math.round(metrics.totalTrades * (100 - metrics.winRate) / 100)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400">💰</span>
            <span className="text-xs text-gray-400">평균 수익률</span>
          </div>
          <div className={`text-2xl font-bold ${getMetricColor('profit', metrics.avgProfit)}`}>
            {metrics.avgProfit >= 0 ? '+' : ''}{metrics.avgProfit.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            거래당 평균
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">⚡</span>
            <span className="text-xs text-gray-400">샤프 비율</span>
          </div>
          <div className={`text-2xl font-bold ${getMetricColor('sharpe', metrics.sharpeRatio)}`}>
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            위험 대비 수익
          </div>
        </motion.div>
      </div>

      {/* 상세 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">수익/손실 분석</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">최대 수익</span>
              <span className="text-sm font-bold text-green-400">
                +{metrics.maxProfit.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">최대 손실</span>
              <span className="text-sm font-bold text-red-400">
                {metrics.maxLoss.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">손익비</span>
              <span className="text-sm font-bold text-blue-400">
                1:{Math.abs(metrics.maxProfit / metrics.maxLoss).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">최대 낙폭 (MDD)</span>
              <span className={`text-sm font-bold ${getMetricColor('drawdown', metrics.maxDrawdown)}`}>
                -{metrics.maxDrawdown.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">예상 성과</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">월 예상 수익</span>
              <span className="text-sm font-bold text-white">
                {(metrics.avgProfit * metrics.totalTrades / 12).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">연 예상 수익</span>
              <span className="text-sm font-bold text-white">
                {(metrics.avgProfit * metrics.totalTrades).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">켈리 기준</span>
              <span className="text-sm font-bold text-purple-400">
                {Math.max(0, ((metrics.winRate / 100) - (1 - metrics.winRate / 100)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">권장 포지션</span>
              <span className="text-sm font-bold text-yellow-400">
                {Math.min(25, Math.max(5, metrics.winRate / 4)).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI 분석 및 추천 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
        <h4 className="text-sm font-semibold text-purple-400 mb-2">🤖 AI 분석 결과</h4>
        <p className="text-sm text-gray-300">
          {coin.name}에 대한 {strategy.replace('-', ' ')} 전략 백테스트 결과, {getRecommendation()}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded">
            신뢰도: {Math.min(95, 50 + metrics.winRate * 0.5 + metrics.sharpeRatio * 10).toFixed(0)}%
          </span>
          <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded">
            최적 레버리지: {Math.max(1, Math.min(3, metrics.sharpeRatio)).toFixed(0)}x
          </span>
          <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded">
            추천 자본: {Math.min(30, Math.max(5, metrics.winRate / 3)).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  )
}