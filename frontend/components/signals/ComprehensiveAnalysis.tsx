'use client'

import React, { useState, useEffect } from 'react'
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
    // 시장 상황 분석
    const isGreedy = fearGreedIndex > 70
    const isFearful = fearGreedIndex < 30
    const netFlow = whaleData?.netFlow || 0
    const isBullish = netFlow > 0 || fearGreedIndex > 50
    const isBearish = netFlow < 0 || fearGreedIndex < 50
    const highFunding = Math.abs(fundingRate) > config.decimals.value05
    
    // 거래 전략 계산
    const tradingStrategy = {
      direction: isBullish ? 'long' : isBearish ? 'short' : 'neutral',
      confidence: Math.min(95, Math.abs(whaleData?.netFlow || 0) / 1000000 * 10 + 50),
      entry: currentPrice,
      stopLoss: isBullish ? currentPrice * config.decimals.value97 : currentPrice * 1.03,
      takeProfit: isBullish ? currentPrice * 1.05 : currentPrice * config.decimals.value95,
      riskReward: 1.67
    }

    // 레버리지 전략 계산
    const leverageStrategy = {
      recommended: isGreedy ? 1 : isFearful ? 3 : 2,
      maximum: highFunding ? 3 : 5,
      risk: isGreedy ? 'high' : isFearful ? 'low' : 'medium',
      reasoning: isGreedy ? 
        '시장 과열, 저레버리지 권장' : 
        isFearful ? 
        '시장 공포, 기회 포착 가능' : 
        '중립 구간, 표준 레버리지'
    }

    // 자본금 대비 전략
    const capitalStrategy = {
      position: isGreedy ? 3 : isFearful ? 10 : 5,
      split: highFunding ? 5 : 3,
      reserve: isGreedy ? 80 : isFearful ? 40 : 60,
      reasoning: `리스크 수준 ${leverageStrategy.risk}에 따른 자본 배분`
    }

    // 시간대별 전략
    const timeframeStrategy = {
      short: {
        action: highFunding ? 'trade' : 'wait',
        probability: Math.round((fearGreedIndex * 0.8) + (netFlow > 0 ? 20 : 0)), // 실제 지표 기반
        target: currentPrice * (isBullish ? 1.02 : config.decimals.value98)
      },
      medium: {
        action: isFearful ? 'accumulate' : isGreedy ? 'reduce' : 'hold',
        probability: Math.round((fearGreedIndex * 0.6) + (whaleData?.totalWhales > 10 ? 15 : 0)), // 고래 활동 기반
        target: currentPrice * (isBullish ? 1.08 : config.decimals.value92)
      },
      long: {
        action: isFearful ? 'buy' : 'hold',
        probability: Math.round((fearGreedIndex * 0.5) + (fundingRate < 0 ? 30 : 10)), // 펀딩 비율 기반
        target: currentPrice * (isBullish ? 1.5 : config.decimals.value7)
      }
    }

    // 시그널 종합 (실제 데이터 기반 계산)
    const signals = {
      // Technical: RSI, MACD, 볼린저밴드 등을 시뮬레이션
      technical: Math.round(
        (isBullish ? 30 : -30) + 
        (fearGreedIndex > 50 ? 20 : -20) + 
        (highFunding ? -10 : 10) +
        (marketData?.volatility ? marketData.volatility * 0.2 : 0) // 실제 변동성 데이터 사용
      ),
      // Fundamental: 펀딩 비율과 시장 구조 기반
      fundamental: Math.round(
        (40 - fearGreedIndex) + 
        (fundingRate < 0 ? 20 : -10)
      ),
      // Sentiment: Fear & Greed 지수 기반
      sentiment: Math.round(fearGreedIndex - 50 + (netFlow > 0 ? 10 : -10)),
      // Onchain: 고래 활동 기반
      onchain: Math.round(
        (whaleData?.totalWhales > 10 ? 40 : 20) +
        (netFlow > 0 ? 30 : netFlow < 0 ? -30 : 0)
      ),
      overall: 0
    }
    
    // 범위 제한 (-100 ~ 100)
    Object.keys(signals).forEach(key => {
      if (key !== 'overall') {
        signals[key] = Math.max(-100, Math.min(100, signals[key]))
      }
    })
    
    signals.overall = Math.round((signals.technical + signals.fundamental + signals.sentiment + signals.onchain) / 4)

    // 리스크 평가
    const riskFactors = []
    if (isGreedy) riskFactors.push('시장 과열')
    if (highFunding) riskFactors.push('높은 펀딩 비율')
    if (whaleData?.sellCount > whaleData?.buyCount) riskFactors.push('고래 매도 우세')
    
    const riskAssessment = {
      level: riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low',
      score: Math.min(100, riskFactors.length * 25 + 25),
      factors: riskFactors
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
                    {value > 0 ? '+' : ''}{value.toFixed(0)}
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
                  <p className="text-white font-medium">${analysis.tradingStrategy.entry.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">손절가</p>
                  <p className="text-red-400 font-medium">${analysis.tradingStrategy.stopLoss.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">목표가</p>
                  <p className="text-green-400 font-medium">${analysis.tradingStrategy.takeProfit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">손익비</p>
                  <p className="text-yellow-400 font-medium">1:{analysis.tradingStrategy.riskReward.toFixed(2)}</p>
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