'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartLine, FaExclamationTriangle, FaShieldAlt, FaRocket, FaBalanceScale, FaCalculator } from 'react-icons/fa'
import { config } from '@/lib/config'

interface LeverageRecommendation {
  level: 'conservative' | 'moderate' | 'aggressive' | 'extreme'
  multiplier: string
  riskScore: number
  description: string
  maxPosition: string
  stopLoss: string
  color: string
  bgColor: string
  icon: JSX.Element
}

interface LeverageStrategyProps {
  symbol?: string
  volatility?: number
  trend?: 'bullish' | 'bearish' | 'neutral'
  signalStrength?: number
  marketCondition?: string
}

export default function LeverageStrategy({ 
  symbol = 'BTC',
  volatility = 25,
  trend = 'neutral',
  signalStrength = 65,
  marketCondition = 'normal'
}: LeverageStrategyProps) {
  const [selectedLeverage, setSelectedLeverage] = useState<number>(1)
  const [positionSize, setPositionSize] = useState<number>(1000)
  const [calculatedRisk, setCalculatedRisk] = useState<any>(null)

  // 시장 상황에 따른 레버리지 추천
  const getLeverageRecommendations = (): LeverageRecommendation[] => {
    const baseRecommendations: LeverageRecommendation[] = [
      {
        level: 'conservative',
        multiplier: '1-3x',
        riskScore: 20,
        description: '안정적 수익 추구',
        maxPosition: '계좌의 ${config.percentage.value10}',
        stopLoss: '2-${config.percentage.value3}',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: <FaShieldAlt className="text-green-600" />
      },
      {
        level: 'moderate',
        multiplier: '5-10x',
        riskScore: 45,
        description: '균형잡힌 리스크/수익',
        maxPosition: '계좌의 ${config.percentage.value5}',
        stopLoss: '1-${config.percentage.value2}',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <FaBalanceScale className="text-blue-600" />
      },
      {
        level: 'aggressive',
        multiplier: '15-25x',
        riskScore: 70,
        description: '고수익 고위험',
        maxPosition: '계좌의 ${config.percentage.value2}',
        stopLoss: 'config.decimals.value5-${config.percentage.value1}',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: <FaRocket className="text-orange-600" />
      },
      {
        level: 'extreme',
        multiplier: '50-125x',
        riskScore: 90,
        description: '극도의 위험',
        maxPosition: '계좌의 ${config.percentage.value1}',
        stopLoss: 'config.decimals.value2-0.${config.percentage.value5}',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <FaExclamationTriangle className="text-red-600" />
      }
    ]

    // 변동성에 따른 조정
    if (volatility > 40) {
      baseRecommendations[0].multiplier = '1-2x'
      baseRecommendations[1].multiplier = '3-5x'
      baseRecommendations[2].multiplier = '10-15x'
      baseRecommendations[3].multiplier = '25-50x'
    }

    return baseRecommendations
  }

  // 최적 레버리지 계산
  const calculateOptimalLeverage = () => {
    let optimal = 10 // 기본값

    // 변동성 기반 조정
    if (volatility < 20) optimal = 15
    else if (volatility < 30) optimal = 10
    else if (volatility < 50) optimal = 5
    else optimal = 3

    // 트렌드 기반 조정
    if (trend === 'bullish') optimal *= 1.2
    else if (trend === 'bearish') optimal *= config.decimals.value8

    // 신호 강도 기반 조정
    optimal *= (signalStrength / 100)

    return Math.round(optimal)
  }

  // 리스크 계산
  const calculateRisk = () => {
    const leverage = selectedLeverage
    const actualPosition = positionSize * leverage
    const liquidationDistance = 100 / leverage
    const estimatedPnL = {
      profit1: actualPosition * config.decimals.value01, // ${config.percentage.value1} 상승
      profit5: actualPosition * config.decimals.value05, // ${config.percentage.value5} 상승
      loss1: actualPosition * -config.decimals.value01, // ${config.percentage.value1} 하락
      loss5: actualPosition * -config.decimals.value05, // ${config.percentage.value5} 하락
    }

    setCalculatedRisk({
      actualPosition,
      liquidationDistance,
      estimatedPnL,
      margin: positionSize,
      maintenanceMargin: positionSize * config.decimals.value5
    })
  }

  useEffect(() => {
    calculateRisk()
  }, [selectedLeverage, positionSize])

  const recommendations = getLeverageRecommendations()
  const optimalLeverage = calculateOptimalLeverage()

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          레버리지 전략 추천
        </h3>
        <div className="text-sm text-gray-400">
          현재 변동성: <span className={`font-bold ${volatility > 40 ? 'text-red-400' : volatility > 25 ? 'text-yellow-400' : 'text-green-400'}`}>
            {safeFixed(volatility, 1)}%
          </span>
        </div>
      </div>

      {/* AI 추천 레버리지 */}
      <div className="bg-purple-900/30 rounded-lg p-4 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-300 font-semibold">AI 최적 레버리지</span>
          <span className="text-2xl font-bold text-purple-400">{optimalLeverage}x</span>
        </div>
        <div className="text-sm text-gray-400">
          시장 상황과 신호 강도를 고려한 최적값
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-500">트렌드</div>
            <div className={`font-semibold ${
              trend === 'bullish' ? 'text-green-400' : 
              trend === 'bearish' ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              {trend === 'bullish' ? '상승' : trend === 'bearish' ? '하락' : '중립'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-500">신호강도</div>
            <div className={`font-semibold ${
              signalStrength > 70 ? 'text-green-400' : 
              signalStrength > 40 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {signalStrength}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-500">시장상태</div>
            <div className="font-semibold text-blue-400">
              {marketCondition === 'volatile' ? '변동성' : '정상'}
            </div>
          </div>
        </div>
      </div>

      {/* 레버리지 레벨별 추천 */}
      <div className="space-y-3 mb-6">
        {recommendations.map((rec) => (
          <div key={rec.level} className={`${rec.bgColor} border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {rec.icon}
                <div>
                  <div className={`font-semibold ${rec.color}`}>
                    {rec.level === 'conservative' ? '안전형' :
                     rec.level === 'moderate' ? '균형형' :
                     rec.level === 'aggressive' ? '공격형' : '극한형'}
                  </div>
                  <div className="text-xs text-gray-600">{rec.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${rec.color}`}>{rec.multiplier}</div>
                <div className="text-xs text-gray-600">레버리지</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div>
                <span className="text-gray-600">최대 포지션:</span>
                <span className="ml-1 font-semibold text-gray-800">{rec.maxPosition}</span>
              </div>
              <div>
                <span className="text-gray-600">손절선:</span>
                <span className="ml-1 font-semibold text-gray-800">{rec.stopLoss}</span>
              </div>
              <div>
                <span className="text-gray-600">위험도:</span>
                <span className={`ml-1 font-semibold ${rec.color}`}>{rec.riskScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 레버리지 계산기 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <FaCalculator className="text-purple-400" />
          <h4 className="font-semibold text-white">레버리지 계산기</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">투자금액 (USDT)</label>
            <input
              type="number"
              value={positionSize}
              onChange={(e) => setPositionSize(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">레버리지</label>
            <select
              value={selectedLeverage}
              onChange={(e) => setSelectedLeverage(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
            >
              {[1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 125].map(lev => (
                <option key={lev} value={lev}>{lev}x</option>
              ))}
            </select>
          </div>
        </div>

        {calculatedRisk && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">실제 포지션 크기:</span>
              <span className="text-white font-semibold">
                ${calculatedRisk.actualPosition.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">청산까지 거리:</span>
              <span className={`font-semibold ${
                calculatedRisk.liquidationDistance < 5 ? 'text-red-400' : 
                calculatedRisk.liquidationDistance < 10 ? 'text-yellow-400' : 
                'text-green-400'
              }`}>
                {safeFixed(calculatedRisk.liquidationDistance, 2)}%
              </span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="text-gray-400 mb-1">예상 손익</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-green-400">
                  +${config.percentage.value1}: ${safeFixed(calculatedRisk.estimatedPnL.profit1, 2)}
                </div>
                <div className="text-red-400">
                  -${config.percentage.value1}: ${Math.abs(calculatedRisk.estimatedPnL.loss1).toFixed(2)}
                </div>
                <div className="text-green-400">
                  +${config.percentage.value5}: ${safeFixed(calculatedRisk.estimatedPnL.profit5, 2)}
                </div>
                <div className="text-red-400">
                  -${config.percentage.value5}: ${Math.abs(calculatedRisk.estimatedPnL.loss5).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 경고 메시지 */}
      <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <FaExclamationTriangle className="text-red-400 mt-1" />
          <div className="text-xs text-red-300">
            <div className="font-semibold mb-1">레버리지 거래 주의사항</div>
            <ul className="space-y-config.decimals.value5 list-disc list-inside text-red-200">
              <li>레버리지는 손실도 같은 비율로 증폭시킵니다</li>
              <li>반드시 손절선을 설정하고 리스크 관리를 철저히 하세요</li>
              <li>초보자는 낮은 레버리지(1-3x)부터 시작하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}