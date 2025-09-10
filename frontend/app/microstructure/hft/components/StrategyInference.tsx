'use client'

import { useMemo } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface HFTPattern {
  timestamp: number
  type: string
  confidence: number
  volume: number
  impact: string
}

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

interface StrategyInferenceProps {
  patterns: HFTPattern[]
  trades: TradeData[]
  currentPrice: number
}

export default function StrategyInference({ patterns, trades, currentPrice }: StrategyInferenceProps) {
  // 전략 추론
  const inferredStrategies = useMemo(() => {
    const strategies = []
    const recentPatterns = patterns.slice(0, 20)
    const recentTrades = trades.slice(0, 100)
    
    // 마켓 메이킹 전략 분석
    const marketMakingPatterns = recentPatterns.filter(p => p.type === 'market_making')
    if (marketMakingPatterns.length > 3) {
      strategies.push({
        name: '마켓 메이킹 전략',
        type: 'neutral',
        confidence: Math.min(marketMakingPatterns.length * 10, 90),
        description: '양방향 호가 제시로 스프레드 수익 창출',
        action: '스프레드가 넓어질 때 진입 고려',
        risk: 'LOW',
        expectedReturn: '0.1-0.3%',
        timeframe: '초단위'
      })
    }
    
    // 모멘텀 전략 분석
    const momentumPatterns = recentPatterns.filter(p => p.type === 'momentum')
    const buyTrades = recentTrades.filter(t => !t.isBuyerMaker)
    const sellTrades = recentTrades.filter(t => t.isBuyerMaker)
    
    if (momentumPatterns.length > 2 && buyTrades.length > sellTrades.length * 1.5) {
      strategies.push({
        name: '상승 모멘텀 전략',
        type: 'bullish',
        confidence: Math.min(buyTrades.length / sellTrades.length * 30, 85),
        description: '강한 매수세를 따라가는 추세 추종',
        action: '단기 롱 포지션 고려',
        risk: 'MEDIUM',
        expectedReturn: '0.5-2%',
        timeframe: '5-30분'
      })
    } else if (momentumPatterns.length > 2 && sellTrades.length > buyTrades.length * 1.5) {
      strategies.push({
        name: '하락 모멘텀 전략',
        type: 'bearish',
        confidence: Math.min(sellTrades.length / buyTrades.length * 30, 85),
        description: '강한 매도세를 따라가는 추세 추종',
        action: '단기 숏 포지션 고려',
        risk: 'MEDIUM',
        expectedReturn: '0.5-2%',
        timeframe: '5-30분'
      })
    }
    
    // 스캘핑 전략 분석
    const scalpingPatterns = recentPatterns.filter(p => p.type === 'scalping')
    const priceVolatility = recentTrades.length > 0
      ? (Math.max(...recentTrades.map(t => t.price)) - Math.min(...recentTrades.map(t => t.price))) / currentPrice * 100
      : 0
    
    if (scalpingPatterns.length > 2 && priceVolatility < 0.5) {
      strategies.push({
        name: '스캘핑 전략',
        type: 'neutral',
        confidence: Math.min(scalpingPatterns.length * 15, 80),
        description: '작은 가격 변동에서 빈번한 거래',
        action: '타이트한 스프레드에서 빠른 진입/청산',
        risk: 'MEDIUM',
        expectedReturn: '0.05-0.1%',
        timeframe: '초-분 단위'
      })
    }
    
    // 차익거래 전략 분석
    const arbitragePatterns = recentPatterns.filter(p => p.type === 'arbitrage')
    if (arbitragePatterns.length > 1) {
      strategies.push({
        name: '차익거래 전략',
        type: 'neutral',
        confidence: Math.min(arbitragePatterns.length * 20, 75),
        description: '거래소 간 가격 차이 활용',
        action: '타 거래소 가격 확인 후 차익 실현',
        risk: 'LOW',
        expectedReturn: '0.1-0.5%',
        timeframe: '즉시'
      })
    }
    
    // 스푸핑 경고
    const spoofingPatterns = recentPatterns.filter(p => p.type === 'spoofing')
    if (spoofingPatterns.length > 0) {
      strategies.push({
        name: '⚠️ 스푸핑 탐지',
        type: 'warning',
        confidence: Math.min(spoofingPatterns.length * 30, 90),
        description: '시장 조작 가능성 감지',
        action: '거래 중단 또는 매우 신중한 접근',
        risk: 'HIGH',
        expectedReturn: 'N/A',
        timeframe: 'N/A'
      })
    }
    
    return strategies
  }, [patterns, trades, currentPrice])
  
  // 종합 전략 점수
  const strategyScore = useMemo(() => {
    if (inferredStrategies.length === 0) return { score: 50, trend: 'neutral' }
    
    const bullishStrategies = inferredStrategies.filter(s => s.type === 'bullish')
    const bearishStrategies = inferredStrategies.filter(s => s.type === 'bearish')
    const warningStrategies = inferredStrategies.filter(s => s.type === 'warning')
    
    let score = 50
    bullishStrategies.forEach(s => score += s.confidence / 10)
    bearishStrategies.forEach(s => score -= s.confidence / 10)
    warningStrategies.forEach(s => score -= s.confidence / 5)
    
    score = Math.max(0, Math.min(100, score))
    
    return {
      score,
      trend: score > 65 ? 'bullish' : score < 35 ? 'bearish' : 'neutral'
    }
  }, [inferredStrategies])
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
      case 'bearish': return <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      default: return <span className="text-gray-400">•</span>
    }
  }
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">🧠 전략 추론 엔진</h2>
      
      {/* 종합 전략 점수 */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">종합 전략 점수</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            strategyScore.trend === 'bullish' ? 'bg-green-500/20 text-green-400' :
            strategyScore.trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {strategyScore.trend.toUpperCase()}
          </span>
        </div>
        
        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div className="absolute inset-0 flex">
            <div className="w-1/3 bg-gradient-to-r from-red-600 to-red-500"></div>
            <div className="w-1/3 bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
            <div className="w-1/3 bg-gradient-to-r from-green-400 to-green-500"></div>
          </div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500"
            style={{ left: `${strategyScore.score}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          >
            <div className="absolute inset-0 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>매도 신호</span>
          <span>중립</span>
          <span>매수 신호</span>
        </div>
      </div>
      
      {/* 추론된 전략 목록 */}
      <div className="space-y-4">
        {inferredStrategies.map((strategy, i) => (
          <div key={i} className={`rounded-lg p-4 border ${
            strategy.type === 'warning' ? 'bg-red-900/20 border-red-500/30' : 'bg-gray-900/50 border-gray-700/50'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">{getTypeIcon(strategy.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{strategy.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${getRiskColor(strategy.risk)}`}>
                      {strategy.risk} RISK
                    </span>
                    <span className="text-purple-400 text-sm font-medium">
                      {strategy.confidence}% 신뢰도
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">{strategy.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">권장 액션</p>
                    <p className="text-xs text-white">{strategy.action}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">예상 수익</p>
                    <p className="text-xs text-green-400">{strategy.expectedReturn}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">시간대</p>
                    <p className="text-xs text-blue-400">{strategy.timeframe}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 전략 실행 가이드 */}
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
        <h3 className="text-blue-400 font-semibold mb-2">💡 전략 실행 가이드</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• HFT 봇과 경쟁하지 말고 그들의 패턴을 활용하세요</li>
          <li>• 지정가 주문으로 슬리피지를 최소화하세요</li>
          <li>• 대량 주문은 작게 나누어 실행하세요</li>
          <li>• 스푸핑 신호가 보이면 즉시 거래를 중단하세요</li>
        </ul>
      </div>
    </div>
  )
}