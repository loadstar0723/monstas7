'use client'

import { CoinData, MomentumData } from '../MomentumModule'

interface MomentumOverviewProps {
  coinData: CoinData | null
  momentumData: MomentumData | null
}

export default function MomentumOverview({ coinData, momentumData }: MomentumOverviewProps) {
  const getTrendColor = (trend: MomentumData['trend'] | undefined) => {
    if (!trend) return 'text-gray-400'
    switch (trend) {
      case 'strong_bullish': return 'text-green-400'
      case 'bullish': return 'text-green-500'
      case 'neutral': return 'text-yellow-500'
      case 'bearish': return 'text-orange-500'
      case 'strong_bearish': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getTrendText = (trend: MomentumData['trend'] | undefined) => {
    if (!trend) return '분석 중...'
    switch (trend) {
      case 'strong_bullish': return '강한 상승 모멘텀'
      case 'bullish': return '상승 모멘텀'
      case 'neutral': return '중립'
      case 'bearish': return '하락 모멘텀'
      case 'strong_bearish': return '강한 하락 모멘텀'
      default: return '분석 중...'
    }
  }

  const getActionRecommendation = (trend: MomentumData['trend'] | undefined) => {
    if (!trend) return '데이터 수집 중...'
    switch (trend) {
      case 'strong_bullish': return '적극 매수 고려'
      case 'bullish': return '매수 포지션 유지'
      case 'neutral': return '관망 또는 분할 매수'
      case 'bearish': return '매도 고려 또는 숏 포지션'
      case 'strong_bearish': return '적극 매도 또는 공매도'
      default: return '분석 중...'
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">모멘텀 개요</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">실시간 분석</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 모멘텀 점수 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">모멘텀 스코어</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">
              {momentumData?.safeFixed(momentumScore, 0) || '0'}
            </span>
            <span className="text-gray-500 text-lg mb-1">/100</span>
          </div>
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${momentumData?.momentumScore || 0}%`,
                backgroundColor: momentumData?.momentumScore > 70 ? '#10b981' : 
                                momentumData?.momentumScore > 30 ? '#eab308' : '#ef4444'
              }}
            />
          </div>
        </div>

        {/* 현재 트렌드 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">현재 트렌드</p>
          <p className={`text-2xl font-bold ${getTrendColor(momentumData?.trend)}`}>
            {getTrendText(momentumData?.trend)}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {getActionRecommendation(momentumData?.trend)}
          </p>
        </div>

        {/* 주요 지표 요약 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">주요 지표</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">RSI</span>
              <span className={`text-sm font-medium ${
                momentumData?.rsi > 70 ? 'text-red-400' : 
                momentumData?.rsi < 30 ? 'text-green-400' : 'text-gray-300'
              }`}>
                {momentumData?.safeFixed(rsi, 1) || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">MACD</span>
              <span className={`text-sm font-medium ${
                momentumData?.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {momentumData?.macd.histogram > 0 ? '상승' : '하락'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Stochastic</span>
              <span className="text-sm font-medium text-gray-300">
                {momentumData?.safeFixed(stochastic.k, 1) || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 모멘텀 트레이딩 설명 */}
      <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
        <h3 className="text-sm font-semibold text-purple-400 mb-2">모멘텀 트레이딩이란?</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          모멘텀 트레이딩은 가격이 특정 방향으로 움직이는 추세가 계속될 것이라는 가정하에 거래하는 전략입니다. 
          RSI, MACD, Stochastic 등의 기술적 지표를 활용하여 시장의 과매수/과매도 상태를 파악하고, 
          추세의 강도와 방향을 분석하여 최적의 진입/청산 시점을 포착합니다.
        </p>
      </div>
    </div>
  )
}