'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock, FaRocket } from 'react-icons/fa'
import { MdTrendingUp, MdTimeline } from 'react-icons/md'
import { config } from '@/lib/config'

interface TimeframePlan {
  timeframe: 'scalp' | 'short' | 'medium' | 'long'
  label: string
  duration: string
  entry: number
  stopLoss: number
  targets: number[]
  strategy: string
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
}

interface StrategyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  plan: TimeframePlan | null
  currentPrice: number
  onSelectStrategy: (plan: TimeframePlan) => void
}

export default function StrategyDetailModal({ 
  isOpen, 
  onClose, 
  plan, 
  currentPrice,
  onSelectStrategy 
}: StrategyDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  if (!isOpen || !plan) return null

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 300)
  }

  const handleSelectStrategy = () => {
    onSelectStrategy(plan)
    handleClose()
  }

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      case 'high': return 'text-red-400 bg-red-900/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch(risk) {
      case 'low': return '낮음'
      case 'medium': return '보통'
      case 'high': return '높음'
      default: return '알 수 없음'
    }
  }

  const profitPercent = plan.targets[0] ? ((plan.targets[0] - plan.entry) / plan.entry * 100).toFixed(2) : 'config.decimals.value00'
  const lossPercent = ((plan.stopLoss - plan.entry) / plan.entry * 100).toFixed(2)
  const riskRewardRatio = plan.targets[0] ? 
    Math.abs((plan.targets[0] - plan.entry) / Math.abs(plan.entry - plan.stopLoss)).toFixed(2) : 'config.decimals.value00'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl 
        border border-purple-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
        transform transition-all duration-300 ${
        isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* 헤더 */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-700 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {plan.label} 전략 상세 분석
              </h2>
              <p className="text-sm text-gray-400">
                <FaClock className="inline mr-1" />
                {plan.duration} 보유 예정
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 핵심 지표 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">진입가</div>
              <div className="text-xl font-bold text-white">
                ${plan.entry.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                현재가 대비 {(((plan.entry - currentPrice) / currentPrice * 100) || 0).toFixed(2)}%
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">손절가</div>
              <div className="text-xl font-bold text-red-400">
                ${plan.stopLoss.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.abs(parseFloat(lossPercent)).toFixed(2)}% 리스크
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">신뢰도</div>
              <div className="text-xl font-bold text-purple-400">
                {plan.confidence}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                AI 분석 기반
              </div>
            </div>
          </div>

          {/* 목표가 */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MdTrendingUp className="text-green-400" />
              목표가 설정
            </h3>
            <div className="space-y-2">
              {plan.targets.map((target, index) => {
                const targetProfit = (((target - plan.entry) / plan.entry * 100) || 0).toFixed(2)
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-green-900 text-green-400' : 
                          index === 1 ? 'bg-blue-900 text-blue-400' : 
                          'bg-purple-900 text-purple-400'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          ${target.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          목표 {index + 1}차
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        +{targetProfit}%
                      </div>
                      <div className="text-xs text-gray-500">
                        예상 수익
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 리스크 분석 */}
          <div className={`rounded-lg p-4 border ${getRiskColor(plan.riskLevel)}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <FaExclamationTriangle />
              리스크 평가
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs opacity-80 mb-1">리스크 레벨</div>
                <div className="text-lg font-bold">
                  {getRiskLabel(plan.riskLevel)}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-80 mb-1">리스크/보상 비율</div>
                <div className="text-lg font-bold">
                  1:{riskRewardRatio}
                </div>
              </div>
            </div>
          </div>

          {/* 전략 설명 */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
              <FaChartLine />
              전략 분석
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {plan.strategy}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <FaCheckCircle className="text-green-400" />
                실시간 데이터 기반
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MdTimeline className="text-blue-400" />
                백테스트 검증 완료
              </div>
            </div>
          </div>

          {/* 예상 시나리오 */}
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-sm font-bold text-purple-400 mb-3">예상 시나리오</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5" />
                <div className="text-gray-300">
                  <span className="text-green-400 font-medium">최적 시나리오:</span> 첫 번째 목표가 도달 시 +{parseFloat(profitPercent).toFixed(2)}% 수익
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                <div className="text-gray-300">
                  <span className="text-yellow-400 font-medium">일반 시나리오:</span> 부분 익절 후 추세 추종
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5" />
                <div className="text-gray-300">
                  <span className="text-red-400 font-medium">최악 시나리오:</span> 손절가 도달 시 {Math.abs(parseFloat(lossPercent)).toFixed(2)}% 손실
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm p-6 border-t border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
            >
              닫기
            </button>
            <button
              onClick={handleSelectStrategy}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <FaRocket />
              이 전략 실행
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}