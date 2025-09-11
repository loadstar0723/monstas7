'use client'

import React, { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { config } from '@/lib/config'
import { 
  FaChartLine, FaBalanceScale, FaWallet, FaClock, 
  FaRocket, FaShieldAlt, FaExclamationTriangle, FaCheckCircle,
  FaCoins, FaPercentage, FaChartBar, FaTachometerAlt
} from 'react-icons/fa'

interface AnalysisProps {
  symbol: string
  currentPrice: number
  marketData?: any
  whaleData?: any
  fearGreedIndex?: number
  fundingRate?: number
}

export default function ComprehensiveAnalysis({ 
  symbol, 
  currentPrice, 
  marketData,
  whaleData,
  fearGreedIndex = 50,
  fundingRate = config.decimals.value01
}: AnalysisProps) {
  const [analysis, setAnalysis] = useState({
    // 거래 전략
    tradingStrategy: {
      direction: 'neutral',
      confidence: 0,
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      riskReward: 0
    },
    // 레버리지 전략
    leverageStrategy: {
      recommended: 1,
      maximum: 3,
      risk: 'medium',
      reasoning: ''
    },
    // 자본금 대비 전략
    capitalStrategy: {
      position: 5, // 전체 자본의 %
      split: 3, // 분할 진입 횟수
      reserve: 60, // 예비 자금 %
      reasoning: ''
    },
    // 시간대별 전략
    timeframeStrategy: {
      short: { // 1-24시간
        action: 'wait',
        probability: 50,
        target: 0
      },
      medium: { // 1-7일
        action: 'accumulate',
        probability: 60,
        target: 0
      },
      long: { // 1개월+
        action: 'hold',
        probability: 70,
        target: 0
      }
    },
    // 시그널 종합
    signals: {
      technical: 0, // -100 ~ 100
      fundamental: 0,
      sentiment: 0,
      onchain: 0,
      overall: 0
    },
    // 리스크 평가
    riskAssessment: {
      level: 'medium',
      score: 50,
      factors: []
    }
  })

  useEffect(() => {
    calculateAnalysis()
  }, [currentPrice, marketData, whaleData, fearGreedIndex, fundingRate])

  const calculateAnalysis = () => {
    // currentPrice가 없으면 계산하지 않음
    if (!currentPrice || currentPrice <= 0) {
      return
    }
    
    // 시장 상황 분석
    const isGreedy = fearGreedIndex > 70
    const isFearful = fearGreedIndex < 30
    const netFlow = whaleData?.netFlow || 0
    const isBullish = netFlow > 0 || fearGreedIndex > 50
    const isBearish = netFlow < 0 || fearGreedIndex < 50
    const highFunding = Math.abs(fundingRate) > 0.05
    
    // 거래 전략 계산 (실제 시장 데이터 기반)
    const volatility = marketData?.volatility || 0.02 // 변동성 기본값 2%
    const stopLossPercent = Math.max(1, Math.min(5, volatility * 100)) // 1-5% 범위
    
    // 시장 상황에 따른 동적 리스크/리워드 비율
    const marketStrength = Math.abs(netFlow) / Math.max(1000, currentPrice * 100)
    const riskRewardRatio = 1.5 + (marketStrength * 0.5) + (isBullish ? 0.5 : 0) + (fearGreedIndex > 60 ? 0.3 : 0)
    const takeProfitPercent = stopLossPercent * Math.min(3, Math.max(1.2, riskRewardRatio))
    
    // 신뢰도 계산 - 여러 요소 종합
    const flowConfidence = Math.min(30, Math.abs(netFlow) / 100000 * 5) // 최대 30점
    const fearGreedConfidence = fearGreedIndex > 70 || fearGreedIndex < 30 ? 20 : 10 // 극단적 심리 가중치
    const volumeConfidence = marketData?.volume24h ? Math.min(20, marketData.volume24h / (currentPrice * 100000) * 10) : 5
    const volatilityConfidence = volatility < 0.03 ? 15 : volatility < 0.05 ? 10 : 5
    const fundingConfidence = Math.abs(fundingRate) > 0.01 ? 15 : 5
    
    const totalConfidence = Math.min(95, Math.max(20, 
      flowConfidence + fearGreedConfidence + volumeConfidence + volatilityConfidence + fundingConfidence
    ))
    
    const tradingStrategy = {
      direction: isBullish ? 'long' : isBearish ? 'short' : 'neutral',
      confidence: Math.round(totalConfidence), // 정수로 반올림
      entry: currentPrice || 0,
      stopLoss: isBullish 
        ? currentPrice * (1 - stopLossPercent / 100) 
        : currentPrice * (1 + stopLossPercent / 100),
      takeProfit: isBullish 
        ? currentPrice * (1 + takeProfitPercent / 100)
        : currentPrice * (1 - takeProfitPercent / 100),
      riskReward: takeProfitPercent / stopLossPercent
    }

    // 레버리지 전략 계산 (실제 위험도 기반)
    const riskScore = (fearGreedIndex / 100) * 0.5 + Math.abs(fundingRate) * 10 + volatility * 100
    const safeRiskScore = isNaN(riskScore) ? 1 : Math.max(0, riskScore)
    const recommendedLeverage = Math.max(1, Math.min(5, 5 - Math.floor(safeRiskScore)))
    const maxLeverage = Math.max(recommendedLeverage, Math.min(10, 10 - Math.floor(safeRiskScore * 0.5)))
    
    const leverageStrategy = {
      recommended: recommendedLeverage,
      maximum: maxLeverage,
      risk: safeRiskScore > 3 ? 'high' : safeRiskScore > 1.5 ? 'medium' : 'low',
      reasoning: `위험 점수 ${safeFixed(safeRiskScore, 1)}, 변동성 ${(volatility * 100).toFixed(2)}%`
    }

    // 자본금 대비 전략 (켓리 방식 기반 + 시장 상황 조정)
    const winProbability = tradingStrategy.confidence / 100
    const kellyFraction = (winProbability * tradingStrategy.riskReward - (1 - winProbability)) / tradingStrategy.riskReward
    const rawKellyPercent = kellyFraction * 100
    const kellyPercent = isNaN(rawKellyPercent) || rawKellyPercent <= 0 ? 5 : Math.min(30, Math.max(1, rawKellyPercent))
    
    // 시장 상황에 따른 조정
    const marketAdjustment = fearGreedIndex > 75 ? 0.5 : fearGreedIndex < 25 ? 0.5 : 1 // 극단적 심리에서는 보수적
    const volatilityAdjustment = volatility > 0.05 ? 0.5 : volatility > 0.03 ? 0.75 : 1 // 높은 변동성에서는 보수적
    const adjustedKelly = kellyPercent * marketAdjustment * volatilityAdjustment
    const finalKelly = Math.max(2, adjustedKelly) // 최소 2% 보장
    
    const capitalStrategy = {
      position: Math.round(Math.max(2, Math.min(15, finalKelly / 2))), // 보수적 켈리 (50%), 2-15% 범위
      split: Math.max(2, Math.min(5, Math.ceil(volatility * 100))),
      reserve: Math.max(40, Math.min(80, 100 - finalKelly)),
      reasoning: `켈리 ${safeFixed(kellyPercent, 1)}% → 조정 ${safeFixed(finalKelly, 1)}% (시장 ${safeFixed(marketAdjustment, 1)}x, 변동성 ${safeFixed(volatilityAdjustment, 1)}x)`
    }

    // 시간대별 전략 (실제 시장 지표 기반)
    const shortTermVolatility = volatility * 100 // 단기 변동성
    const mediumTermTrend = (whaleData?.netFlow || 0) / Math.max(1, currentPrice * 1000) // 중기 추세
    const longTermOutlook = (100 - fearGreedIndex) / 100 // 장기 전망 (공포일수록 기회)
    
    // 단기 전략 (1-24시간) - 펀딩률과 변동성 기반
    const shortTermAction = Math.abs(fundingRate) > 0.01 || volatility > 0.03 ? 'trade' : 
                            volatility < 0.01 ? 'wait' : 'observe'
    const shortTermProbCalc = 50 + (Math.abs(fundingRate) * 1000) + (volatility > 0.03 ? 20 : -10) + (netFlow > 0 ? 10 : -10)
    const shortTermProb = isNaN(shortTermProbCalc) ? 50 : Math.min(90, Math.max(20, shortTermProbCalc))
    const shortTermTargetMultiplier = Math.max(0.005, Math.min(0.03, shortTermVolatility / 100))
    const shortTermTarget = currentPrice * (1 + (isBullish ? 1 : -1) * shortTermTargetMultiplier)
    
    // 중기 전략 (1-7일) - 신뢰도와 추세 기반
    const mediumTermAction = tradingStrategy.confidence > 70 ? 'position' : 
                             tradingStrategy.confidence < 40 ? 'exit' : 
                             Math.abs(netFlow) > 50000 ? 'adjust' : 'hold'
    const mediumTermProb = tradingStrategy.confidence
    const mediumTermTarget = tradingStrategy.takeProfit
    
    // 장기 전략 (1개월+) - 시장 사이클과 누적 플로우 기반
    const accumulationPhase = fearGreedIndex < 40 && netFlow > 0
    const distributionPhase = fearGreedIndex > 70 && netFlow < 0
    const longTermAction = accumulationPhase ? 'accumulate' : 
                          distributionPhase ? 'distribute' : 
                          fearGreedIndex < 25 ? 'buy' : 
                          fearGreedIndex > 80 ? 'sell' : 'hold'
    const longTermProb = Math.min(85, Math.max(30, 
      accumulationPhase ? 70 : distributionPhase ? 30 : 50 + (100 - fearGreedIndex) / 2
    ))
    const longTermGrowth = accumulationPhase ? 1.3 : distributionPhase ? 0.8 : 1.1
    const longTermTarget = currentPrice * longTermGrowth * (1 + Math.abs(mediumTermTrend))
    
    const timeframeStrategy = {
      short: {
        action: shortTermAction,
        probability: Math.round(shortTermProb),
        target: Math.round(shortTermTarget / 100) * 100 // 100단위 반올림
      },
      medium: {
        action: mediumTermAction,
        probability: Math.round(mediumTermProb),
        target: Math.round(mediumTermTarget / 100) * 100
      },
      long: {
        action: longTermAction,
        probability: Math.round(longTermProb),
        target: Math.round(longTermTarget / 100) * 100
      }
    }

    // 시그널 종합 (실제 API 데이터와 지표 기반)
    // 기술적 지표: 변동성과 가격 변화율 기반
    const priceChange = marketData?.priceChange24h || 0
    const technicalScore = isNaN(volatility) || volatility === 0 ? 0 : (priceChange / Math.max(1, volatility * 100)) * 50
    
    // 펀더멘털: 펀딩 비율과 거래량 기반
    const volume24h = marketData?.volume24h || 0
    const avgVolume = currentPrice * 1000 // 예상 평균 거래량
    const volumeScore = volume24h > 0 ? ((volume24h / avgVolume) - 1) * 20 : 0
    const fundingScore = fundingRate * -500 // 펀딩률이 높으면 부정적
    const fundamentalScore = volumeScore + fundingScore + (volume24h > avgVolume * 2 ? 20 : volume24h < avgVolume * 0.5 ? -20 : 0)
    
    // 센티먼트: Fear & Greed와 실제 시장 심리
    const fearGreedScore = (fearGreedIndex - 50) * 1.2 // 중립 50 기준
    const flowSentiment = netFlow > 100000 ? 15 : netFlow < -100000 ? -15 : (netFlow / 10000)
    const sentimentScore = fearGreedScore + flowSentiment
    
    // 온체인: 고래 데이터 기반 (더 민감하게 조정)
    const whaleActivityScore = Math.abs(netFlow) > 0 
      ? Math.sign(netFlow) * Math.min(50, Math.sqrt(Math.abs(netFlow)) / 10)
      : 0
    const accumulationScore = (whaleData?.accumulationScore || 50) - 50 // 50 기준 조정
    const onchainScore = whaleActivityScore + accumulationScore * 0.5
    
    const signals = {
      technical: isNaN(technicalScore) ? 0 : Math.max(-100, Math.min(100, technicalScore)),
      fundamental: isNaN(fundamentalScore) ? 0 : Math.max(-100, Math.min(100, fundamentalScore)),
      sentiment: isNaN(sentimentScore) ? 0 : Math.max(-100, Math.min(100, sentimentScore)),
      onchain: isNaN(onchainScore) ? 0 : Math.max(-100, Math.min(100, onchainScore)),
      overall: 0
    }
    
    // overall 계산
    const validScores = [signals.technical, signals.fundamental, signals.sentiment, signals.onchain]
      .filter(score => !isNaN(score))
    
    signals.overall = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0

    // 리스크 평가 (정량적 지표 기반)
    const riskFactors = []
    let baseRiskScore = 20 // 기본 리스크 점수
    
    // 변동성 리스크 (0-25점)
    const safeVolatility = isNaN(volatility) ? 0.02 : volatility
    const volatilityRisk = Math.min(25, safeVolatility * 500)
    if (safeVolatility > 0.02) {
      riskFactors.push(`높은 변동성 (${(safeVolatility * 100).toFixed(2)}%)`)
    }
    baseRiskScore += isNaN(volatilityRisk) ? 0 : volatilityRisk
    
    // 펀딩 리스크 (0-20점)
    const safeFundingRate = isNaN(fundingRate) ? 0 : fundingRate
    const fundingRisk = Math.min(20, Math.abs(safeFundingRate) * 2000)
    if (Math.abs(safeFundingRate) > 0.01) {
      riskFactors.push(`펀딩 비율 ${(safeFundingRate * 100).toFixed(3)}%`)
    }
    baseRiskScore += isNaN(fundingRisk) ? 0 : fundingRisk
    
    // 고래 리스크 (0-20점)
    const safeNetFlow = isNaN(netFlow) ? 0 : netFlow
    const whaleRisk = safeNetFlow < 0 ? Math.min(20, Math.abs(safeNetFlow) / 50000) : 0
    if (safeNetFlow < -100000) {
      riskFactors.push(`고래 매도 $${Math.abs(safeNetFlow).toLocaleString()}`)
    }
    baseRiskScore += isNaN(whaleRisk) ? 0 : whaleRisk
    
    // 심리 리스크 (0-20점)
    const safeFearGreed = isNaN(fearGreedIndex) ? 50 : fearGreedIndex
    const sentimentRisk = Math.abs(safeFearGreed - 50) * 0.4
    if (safeFearGreed > 75 || safeFearGreed < 25) {
      riskFactors.push(`극단적 심리 (${safeFearGreed})`)
    }
    baseRiskScore += isNaN(sentimentRisk) ? 0 : sentimentRisk
    
    // 레버리지 리스크 (0-15점)
    const currentLeverage = isNaN(recommendedLeverage) ? 2 : recommendedLeverage
    const leverageRisk = currentLeverage > 3 ? 15 : currentLeverage > 2 ? 10 : 5
    if (currentLeverage > 3) {
      riskFactors.push(`높은 레버리지 권장 (${currentLeverage}x)`)
    }
    baseRiskScore += isNaN(leverageRisk) ? 5 : leverageRisk
    
    const totalRiskScore = Math.round(Math.min(100, Math.max(0, isNaN(baseRiskScore) ? 30 : baseRiskScore)))
    
    const riskAssessment = {
      level: totalRiskScore > 70 ? 'high' : totalRiskScore > 40 ? 'medium' : 'low',
      score: totalRiskScore,
      factors: riskFactors.length > 0 ? riskFactors : ['정상 시장 상황']
    }

    setAnalysis({
      tradingStrategy,
      leverageStrategy,
      capitalStrategy,
      timeframeStrategy,
      signals,
      riskAssessment
    })
  }

  const getActionColor = (action: string) => {
    switch(action) {
      case 'buy':
      case 'long':
      case 'accumulate':
        return 'text-green-400'
      case 'sell':
      case 'short':
      case 'reduce':
        return 'text-red-400'
      case 'hold':
      case 'wait':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'low': return 'text-green-400 bg-green-900/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30'
      case 'high': return 'text-red-400 bg-red-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* 종합 시그널 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur rounded-xl p-6 border border-blue-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            종합 시그널 분석
          </h3>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">분석 대상:</span>
            <span className="text-lg font-bold text-yellow-400">{symbol}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analysis.signals).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-gray-400 mb-1 capitalize">{key}</p>
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className={`text-lg font-bold ${
                    value > 30 ? 'text-green-400' :
                    value < -30 ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {value > 0 ? '+' : ''}{safeFixed(value, 0)}
                  </div>
                </div>
                <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${Math.abs(value) * 2.01} 201`}
                    strokeLinecap="round"
                    className={
                      value > 30 ? 'text-green-400' :
                      value < -30 ? 'text-red-400' :
                      'text-yellow-400'
                    }
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 거래 전략 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaRocket className="text-purple-400" />
            거래 전략
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">방향</span>
              <span className={`font-bold ${getActionColor(analysis.tradingStrategy.direction)}`}>
                {analysis.tradingStrategy.direction.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">신뢰도</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${analysis.tradingStrategy.confidence}%` }}
                  />
                </div>
                <span className="text-sm text-white">{analysis.tradingStrategy.confidence}%</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">진입가</p>
                  <p className="text-white font-medium">${(analysis.tradingStrategy.entry || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">손절가</p>
                  <p className="text-red-400 font-medium">${(analysis.tradingStrategy.stopLoss || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">목표가</p>
                  <p className="text-green-400 font-medium">${(analysis.tradingStrategy.takeProfit || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">손익비</p>
                  <p className="text-yellow-400 font-medium">1:{(analysis.tradingStrategy.riskReward || 1).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 레버리지 전략 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaBalanceScale className="text-cyan-400" />
            레버리지 전략
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">권장 레버리지</span>
              <span className="text-2xl font-bold text-cyan-400">{analysis.leverageStrategy.recommended}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">최대 레버리지</span>
              <span className="text-lg font-medium text-yellow-400">{analysis.leverageStrategy.maximum}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">리스크 수준</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.leverageStrategy.risk)}`}>
                {analysis.leverageStrategy.risk.toUpperCase()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-1">분석 근거</p>
              <p className="text-sm text-white">{analysis.leverageStrategy.reasoning}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 자본금 대비 전략 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaWallet className="text-green-400" />
          자본금 대비 전략
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">포지션 크기</p>
            <p className="text-2xl font-bold text-white">{analysis.capitalStrategy.position}%</p>
            <p className="text-xs text-gray-500 mt-1">전체 자본 대비</p>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <FaChartBar className="text-3xl text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">분할 진입</p>
            <p className="text-2xl font-bold text-white">{analysis.capitalStrategy.split}회</p>
            <p className="text-xs text-gray-500 mt-1">단계별 진입</p>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <FaShieldAlt className="text-3xl text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">예비 자금</p>
            <p className="text-2xl font-bold text-white">{analysis.capitalStrategy.reserve}%</p>
            <p className="text-xs text-gray-500 mt-1">리스크 대비</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 {analysis.capitalStrategy.reasoning}
          </p>
        </div>
      </motion.div>

      {/* 시간대별 전략 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaClock className="text-orange-400" />
          시간대별 전략
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'short', label: '단기 (1-24시간)', icon: <FaTachometerAlt /> },
            { key: 'medium', label: '중기 (1-7일)', icon: <FaChartLine /> },
            { key: 'long', label: '장기 (1개월+)', icon: <FaRocket /> }
          ].map(timeframe => {
            const strategy = analysis.timeframeStrategy[timeframe.key as keyof typeof analysis.timeframeStrategy]
            return (
              <div key={timeframe.key} className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400">{timeframe.icon}</span>
                  <h4 className="text-sm font-semibold text-white">{timeframe.label}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">액션</span>
                    <span className={`text-sm font-bold ${getActionColor(strategy.action)}`}>
                      {strategy.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">확률</span>
                    <span className="text-sm text-white">{strategy.probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">목표가</span>
                    <span className="text-sm text-cyan-400">${strategy.target.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* 리스크 평가 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400" />
          리스크 평가
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full font-bold ${getRiskColor(analysis.riskAssessment.level)}`}>
              리스크: {analysis.riskAssessment.level.toUpperCase()}
            </div>
            <div className="text-white">
              <span className="text-gray-400 mr-2">점수:</span>
              <span className="text-xl font-bold">{analysis.riskAssessment.score}/100</span>
            </div>
          </div>
        </div>
        
        {analysis.riskAssessment.factors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">리스크 요인:</p>
            {analysis.riskAssessment.factors.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <FaExclamationTriangle className="text-yellow-400 text-xs" />
                <span className="text-gray-300">{factor}</span>
              </div>
            ))}
          </div>
        )}
        
        {analysis.riskAssessment.factors.length === 0 && (
          <div className="flex items-center gap-2 text-green-400">
            <FaCheckCircle />
            <span>현재 특별한 리스크 요인이 감지되지 않았습니다</span>
          </div>
        )}
      </motion.div>

      {/* 실행 권장사항 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-lg font-bold text-white mb-4">
          📌 실행 권장사항
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-300">
              ✅ 현재 시장: <span className="text-white font-medium">
                {fearGreedIndex > 70 ? '극도의 탐욕' : 
                 fearGreedIndex > 50 ? '탐욕' :
                 fearGreedIndex > 30 ? '중립' :
                 fearGreedIndex > 10 ? '공포' : '극도의 공포'}
              </span>
            </p>
            <p className="text-gray-300">
              ✅ 추천 포지션: <span className={`font-medium ${getActionColor(analysis.tradingStrategy.direction)}`}>
                {analysis.tradingStrategy.direction === 'long' ? '롱 포지션' :
                 analysis.tradingStrategy.direction === 'short' ? '숏 포지션' : '관망'}
              </span>
            </p>
            <p className="text-gray-300">
              ✅ 최적 레버리지: <span className="text-cyan-400 font-medium">
                {analysis.leverageStrategy.recommended}x
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-300">
              ⚠️ 최대 투자금: <span className="text-yellow-400 font-medium">
                전체 자본의 {analysis.capitalStrategy.position}%
              </span>
            </p>
            <p className="text-gray-300">
              ⚠️ 분할 진입: <span className="text-blue-400 font-medium">
                {analysis.capitalStrategy.split}회 나누어 진입
              </span>
            </p>
            <p className="text-gray-300">
              ⚠️ 예비 자금: <span className="text-green-400 font-medium">
                최소 {analysis.capitalStrategy.reserve}% 보유
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}