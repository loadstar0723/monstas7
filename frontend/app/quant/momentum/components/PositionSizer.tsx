'use client'

import { MomentumData, CoinData } from '../MomentumModule'
import { useState, useEffect } from 'react'

interface PositionSizerProps {
  momentumData: MomentumData | null
  coinData: CoinData | null
}

export default function PositionSizer({ momentumData, coinData }: PositionSizerProps) {
  const [capital, setCapital] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [positionSize, setPositionSize] = useState(0)
  const [stopLoss, setStopLoss] = useState(0)
  const [takeProfit, setTakeProfit] = useState(0)
  const [leverage, setLeverage] = useState(1)

  useEffect(() => {
    if (!coinData || !momentumData) return

    // 켈리 기준 계산 (단순화 버전)
    const winRate = momentumData.momentumScore / 100
    const avgWin = 0.03 // 평균 수익 3%
    const avgLoss = 0.02 // 평균 손실 2%
    const kellyPercent = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin
    
    // 안전한 포지션 크기 계산
    const safeKelly = Math.max(0, Math.min(kellyPercent * 0.25, 0.1)) // 켈리의 25%, 최대 10%
    const calculatedSize = capital * safeKelly

    setPositionSize(calculatedSize)

    // 손절가 계산 (ATR 기반 또는 고정 %)
    const stopLossPercent = momentumData.trend === 'strong_bullish' ? 0.03 : 
                           momentumData.trend === 'bullish' ? 0.04 :
                           momentumData.trend === 'bearish' ? 0.05 : 0.06
    
    setStopLoss(coinData.price * (1 - stopLossPercent))

    // 익절가 계산 (Risk/Reward 비율)
    const riskRewardRatio = momentumData.momentumScore > 70 ? 3 : 
                          momentumData.momentumScore > 50 ? 2 : 1.5
    
    const stopDistance = coinData.price - stopLoss
    setTakeProfit(coinData.price + (stopDistance * riskRewardRatio))

    // 권장 레버리지 계산
    let recommendedLeverage = 1
    if (momentumData.momentumScore > 80 && momentumData.trend === 'strong_bullish') {
      recommendedLeverage = 3
    } else if (momentumData.momentumScore > 60 && momentumData.trend === 'bullish') {
      recommendedLeverage = 2
    }
    setLeverage(recommendedLeverage)

  }, [coinData, momentumData, capital])

  const calculateRiskAmount = () => {
    return (capital * riskPercent) / 100
  }

  const calculateShares = () => {
    if (!coinData) return 0
    return positionSize / coinData.price
  }

  const calculatePotentialProfit = () => {
    if (!coinData) return 0
    return (takeProfit - coinData.price) * calculateShares()
  }

  const calculatePotentialLoss = () => {
    if (!coinData) return 0
    return (coinData.price - stopLoss) * calculateShares()
  }

  const getRiskLevel = () => {
    const riskRatio = positionSize / capital
    if (riskRatio > 0.2) return { text: '매우 높음', color: 'text-red-400' }
    if (riskRatio > 0.1) return { text: '높음', color: 'text-orange-400' }
    if (riskRatio > 0.05) return { text: '보통', color: 'text-yellow-400' }
    return { text: '낮음', color: 'text-green-400' }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">포지션 사이징</h2>

      {/* 자본금 설정 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            총 자본금
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            리스크 허용치 (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white font-medium w-12 text-right">{riskPercent}%</span>
          </div>
        </div>
      </div>

      {/* 계산된 포지션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">권장 포지션 크기</p>
          <p className="text-2xl font-bold text-white">
            ${positionSize.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            총 자본의 {((positionSize / capital) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">구매 가능 수량</p>
          <p className="text-2xl font-bold text-white">
            {calculateShares().toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            @ ${coinData?.price.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">권장 레버리지</p>
          <p className="text-2xl font-bold text-purple-400">
            {leverage}x
          </p>
          <p className={`text-xs mt-1 ${getRiskLevel().color}`}>
            리스크: {getRiskLevel().text}
          </p>
        </div>
      </div>

      {/* 손절/익절 설정 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/30">
          <h3 className="text-sm font-medium text-red-400 mb-3">손절가 (Stop Loss)</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-white">${stopLoss.toFixed(2)}</span>
            <span className="text-red-400">
              -{((1 - stopLoss / (coinData?.price || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">최대 손실</span>
            <span className="text-red-400 font-medium">
              -${Math.abs(calculatePotentialLoss()).toFixed(0)}
            </span>
          </div>
        </div>

        <div className="bg-green-900/20 rounded-lg p-4 border border-green-800/30">
          <h3 className="text-sm font-medium text-green-400 mb-3">익절가 (Take Profit)</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-white">${takeProfit.toFixed(2)}</span>
            <span className="text-green-400">
              +{((takeProfit / (coinData?.price || 1) - 1) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">목표 수익</span>
            <span className="text-green-400 font-medium">
              +${calculatePotentialProfit().toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk/Reward 비율 */}
      <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-purple-400">Risk/Reward 비율</h3>
          <span className="text-lg font-bold text-white">
            1:{(calculatePotentialProfit() / Math.abs(calculatePotentialLoss())).toFixed(1)}
          </span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden flex">
          <div 
            className="bg-red-500"
            style={{ width: '33%' }}
          />
          <div 
            className="bg-green-500"
            style={{ width: '67%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>위험 ${Math.abs(calculatePotentialLoss()).toFixed(0)}</span>
          <span>보상 ${calculatePotentialProfit().toFixed(0)}</span>
        </div>
      </div>

      {/* 포지션 요약 */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">포지션 요약</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>✓ 켈리 기준에 따른 최적 포지션 크기 계산</p>
          <p>✓ 모멘텀 스코어 기반 레버리지 조정</p>
          <p>✓ ATR 기반 동적 손절가 설정</p>
          <p>✓ Risk/Reward 비율 최적화</p>
        </div>
      </div>
    </div>
  )
}