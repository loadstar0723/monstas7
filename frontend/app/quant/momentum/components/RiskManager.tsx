'use client'

import { MomentumData, CoinData } from '../MomentumModule'
import { useState, useEffect } from 'react'

interface RiskManagerProps {
  momentumData: MomentumData | null
  coinData: CoinData | null
}

export default function RiskManager({ momentumData, coinData }: RiskManagerProps) {
  const [maxDrawdown, setMaxDrawdown] = useState(15)
  const [currentDrawdown, setCurrentDrawdown] = useState(0)
  const [sharpeRatio, setSharpeRatio] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [riskScore, setRiskScore] = useState(50)

  useEffect(() => {
    if (!momentumData || !coinData) return

    // 현재 드로우다운 계산 (시뮬레이션)
    const highPrice = coinData.high24h
    const currentPrice = coinData.price
    const drawdown = ((highPrice - currentPrice) / highPrice) * 100
    setCurrentDrawdown(Math.max(0, drawdown))

    // 샤프 비율 계산 (단순화)
    const returns = coinData.change24h / 100
    const volatility = Math.abs(coinData.change24h) / 100 * 2 // 근사치
    const riskFreeRate = 0.02 / 365 // 일일 무위험 수익률
    const sharpe = volatility > 0 ? (returns - riskFreeRate) / volatility : 0
    setSharpeRatio(sharpe)

    // 승률 계산 (모멘텀 기반 추정)
    const estimatedWinRate = 50 + (momentumData.momentumScore - 50) * 0.5
    setWinRate(Math.max(30, Math.min(70, estimatedWinRate)))

    // 리스크 스코어 계산
    let risk = 50
    
    // RSI 기반 리스크
    if (momentumData.rsi > 80) risk += 20
    else if (momentumData.rsi > 70) risk += 10
    else if (momentumData.rsi < 20) risk += 15
    else if (momentumData.rsi < 30) risk += 5
    
    // 변동성 기반 리스크
    if (Math.abs(coinData.change24h) > 10) risk += 15
    else if (Math.abs(coinData.change24h) > 5) risk += 10
    
    // 드로우다운 기반 리스크
    if (currentDrawdown > 10) risk += 15
    else if (currentDrawdown > 5) risk += 10
    
    setRiskScore(Math.min(100, risk))
  }, [momentumData, coinData])

  const getRiskLevel = (score: number) => {
    if (score > 80) return { text: '매우 높음', color: 'text-red-400', bg: 'bg-red-900/20' }
    if (score > 60) return { text: '높음', color: 'text-orange-400', bg: 'bg-orange-900/20' }
    if (score > 40) return { text: '보통', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
    return { text: '낮음', color: 'text-green-400', bg: 'bg-green-900/20' }
  }

  const getRecommendation = () => {
    if (riskScore > 80) return '리스크가 매우 높습니다. 포지션 축소를 권장합니다.'
    if (riskScore > 60) return '리스크가 높은 편입니다. 신중한 접근이 필요합니다.'
    if (riskScore > 40) return '적정 리스크 수준입니다. 계획대로 진행하세요.'
    return '리스크가 낮은 상태입니다. 포지션 확대를 고려할 수 있습니다.'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">리스크 관리</h2>

      {/* 리스크 스코어 */}
      <div className={`mb-6 p-4 rounded-lg border ${getRiskLevel(riskScore).bg} ${
        riskScore > 60 ? 'border-red-800/30' : 
        riskScore > 40 ? 'border-yellow-800/30' : 'border-green-800/30'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-400">종합 리스크 스코어</p>
            <p className={`text-2xl font-bold ${getRiskLevel(riskScore).color}`}>
              {riskScore.toFixed(0)}/100
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full ${getRiskLevel(riskScore).bg} ${getRiskLevel(riskScore).color}`}>
            {getRiskLevel(riskScore).text}
          </div>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              riskScore > 80 ? 'bg-red-500' :
              riskScore > 60 ? 'bg-orange-500' :
              riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
        <p className="text-sm text-gray-300 mt-3">{getRecommendation()}</p>
      </div>

      {/* 리스크 지표들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 현재 드로우다운 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">현재 드로우다운</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-2xl font-bold ${
              currentDrawdown > 10 ? 'text-red-400' : 
              currentDrawdown > 5 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {currentDrawdown.toFixed(1)}%
            </span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                currentDrawdown > 10 ? 'bg-red-500' : 
                currentDrawdown > 5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, currentDrawdown * 5)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">최대 허용: {maxDrawdown}%</p>
        </div>

        {/* 샤프 비율 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">샤프 비율</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-2xl font-bold ${
              sharpeRatio > 1 ? 'text-green-400' :
              sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {sharpeRatio.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {sharpeRatio > 1 ? '우수한 위험조정 수익' :
             sharpeRatio > 0 ? '양호한 수익률' : '리스크 대비 수익 부족'}
          </p>
        </div>

        {/* 예상 승률 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">예상 승률</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-2xl font-bold ${
              winRate > 60 ? 'text-green-400' :
              winRate > 45 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {winRate.toFixed(0)}%
            </span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* 변동성 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">24시간 변동성</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-2xl font-bold ${
              Math.abs(coinData?.change24h || 0) > 10 ? 'text-red-400' :
              Math.abs(coinData?.change24h || 0) > 5 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {Math.abs(coinData?.change24h || 0).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {Math.abs(coinData?.change24h || 0) > 10 ? '매우 높은 변동성' :
             Math.abs(coinData?.change24h || 0) > 5 ? '높은 변동성' : '정상 범위'}
          </p>
        </div>
      </div>

      {/* 리스크 관리 규칙 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">포지션 관리 규칙</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• 단일 포지션 최대 {100 / (riskScore / 10)}% 이하</li>
            <li>• 총 노출도 자본의 {100 - riskScore / 2}% 이하</li>
            <li>• 손절선 {3 + riskScore / 20}% 설정</li>
            <li>• 분할 매수 {Math.ceil(riskScore / 25)}회 권장</li>
          </ul>
        </div>

        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">현재 시장 리스크</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li className={momentumData?.rsi > 70 || momentumData?.rsi < 30 ? 'text-yellow-300' : ''}>
              • RSI {momentumData?.rsi > 70 ? '과매수' : momentumData?.rsi < 30 ? '과매도' : '정상'} 구간
            </li>
            <li className={Math.abs(coinData?.change24h || 0) > 5 ? 'text-yellow-300' : ''}>
              • 변동성 {Math.abs(coinData?.change24h || 0) > 5 ? '높음' : '정상'}
            </li>
            <li>• 모멘텀 {momentumData?.trend === 'strong_bullish' || momentumData?.trend === 'strong_bearish' ? '극단적' : '정상'}</li>
            <li>• 거래량 {coinData?.volume24h ? '활발' : '보통'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}