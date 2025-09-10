'use client'

import { useMemo } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface HFTPattern {
  timestamp: number
  type: string
  confidence: number
  impact: string
}

interface TradingStrategyProps {
  patterns: HFTPattern[]
  currentPrice: number
  priceChange24h: number
  volume24h: number
}

export default function TradingStrategy({ patterns, currentPrice, priceChange24h, volume24h }: TradingStrategyProps) {
  // 트레이딩 전략 생성
  const strategies = useMemo(() => {
    const strategies = []
    const dominantPattern = patterns[0]?.type || 'none'
    const patternConfidence = patterns[0]?.confidence || 0
    const highImpactPatterns = patterns.filter(p => p.impact === 'high').length
    
    // 기본 시장 상태 분석
    const marketCondition = {
      trend: priceChange24h > 2 ? 'bullish' : priceChange24h < -2 ? 'bearish' : 'neutral',
      volatility: Math.abs(priceChange24h) > 5 ? 'high' : Math.abs(priceChange24h) > 2 ? 'medium' : 'low',
      volume: volume24h > 1000000 ? 'high' : volume24h > 500000 ? 'medium' : 'low',
      hftActivity: highImpactPatterns > 3 ? 'high' : highImpactPatterns > 1 ? 'medium' : 'low'
    }
    
    // 진입 전략
    if (marketCondition.hftActivity === 'low' && marketCondition.volatility === 'low') {
      strategies.push({
        type: 'entry',
        name: '안전 진입 전략',
        description: 'HFT 활동이 적고 변동성이 낮아 진입에 유리',
        actions: [
          '지정가 주문으로 원하는 가격에 진입',
          '포지션 크기를 평소보다 늘려도 안전',
          'VWAP 근처에서 진입 고려'
        ],
        confidence: 85,
        risk: 'LOW'
      })
    } else if (marketCondition.hftActivity === 'high') {
      strategies.push({
        type: 'entry',
        name: '신중 진입 전략',
        description: 'HFT 활동이 많아 슬리피지 주의 필요',
        actions: [
          '작은 크기로 여러 번 나누어 진입',
          '시장가 주문 피하고 지정가 사용',
          'HFT 활동이 줄어들 때까지 대기'
        ],
        confidence: 60,
        risk: 'MEDIUM'
      })
    }
    
    // 청산 전략
    if (dominantPattern === 'momentum' && patternConfidence > 70) {
      strategies.push({
        type: 'exit',
        name: '모멘텀 청산 전략',
        description: '강한 모멘텀 패턴 감지, 추세 반전 전 청산',
        actions: [
          '목표가에 도달하면 부분 청산',
          '추세 약화 신호 시 전량 청산',
          '트레일링 스톱 설정으로 이익 보호'
        ],
        confidence: 75,
        risk: 'MEDIUM'
      })
    }
    
    // 리스크 관리 전략
    if (dominantPattern === 'spoofing' || marketCondition.volatility === 'high') {
      strategies.push({
        type: 'risk',
        name: '리스크 회피 전략',
        description: '시장 조작 또는 높은 변동성 감지',
        actions: [
          '신규 포지션 진입 중단',
          '기존 포지션 축소 또는 청산',
          '손절매 라인 타이트하게 조정'
        ],
        confidence: 90,
        risk: 'HIGH'
      })
    }
    
    // 차익거래 전략
    if (dominantPattern === 'arbitrage' && patternConfidence > 60) {
      strategies.push({
        type: 'arbitrage',
        name: '차익거래 기회',
        description: '거래소 간 가격 차이 활용 가능',
        actions: [
          '타 거래소 가격 실시간 확인',
          '수수료 고려한 순수익 계산',
          '빠른 실행으로 기회 포착'
        ],
        confidence: 70,
        risk: 'LOW'
      })
    }
    
    // 스캘핑 전략
    if (dominantPattern === 'scalping' && marketCondition.volume === 'high') {
      strategies.push({
        type: 'scalping',
        name: '스캘핑 전략',
        description: '높은 거래량으로 스캘핑 유리',
        actions: [
          '0.1-0.3% 수익 목표 설정',
          '빠른 진입과 청산 반복',
          '수수료 대비 수익률 계산 필수'
        ],
        confidence: 65,
        risk: 'MEDIUM'
      })
    }
    
    return strategies
  }, [patterns, currentPrice, priceChange24h, volume24h])
  
  // 실행 권장사항
  const recommendations = useMemo(() => {
    const recs = []
    const now = new Date().getHours()
    
    // 시간대별 권장사항
    if (now >= 9 && now <= 11) {
      recs.push({
        icon: ClockIcon,
        title: '아시아 세션',
        description: '거래량이 증가하는 시간, 모멘텀 전략 유리'
      })
    } else if (now >= 14 && now <= 16) {
      recs.push({
        icon: ClockIcon,
        title: '유럽 세션',
        description: '변동성 증가 예상, 리스크 관리 강화'
      })
    } else if (now >= 21 && now <= 23) {
      recs.push({
        icon: ClockIcon,
        title: '미국 세션',
        description: '최대 거래량 시간대, HFT 활동 주의'
      })
    }
    
    // 패턴별 권장사항
    if (patterns.filter(p => p.type === 'market_making').length > 3) {
      recs.push({
        icon: CheckCircleIcon,
        title: '마켓 메이킹 활발',
        description: '스프레드 활용 전략 고려'
      })
    }
    
    if (patterns.filter(p => p.impact === 'high').length > 2) {
      recs.push({
        icon: XCircleIcon,
        title: '높은 HFT 활동',
        description: '대량 주문 피하고 소량 분할 실행'
      })
    }
    
    return recs
  }, [patterns])
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'border-red-500/30 bg-red-900/20'
      case 'MEDIUM': return 'border-yellow-500/30 bg-yellow-900/20'
      case 'LOW': return 'border-green-500/30 bg-green-900/20'
      default: return 'border-gray-500/30 bg-gray-900/20'
    }
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entry': return '🎯'
      case 'exit': return '🏁'
      case 'risk': return '🛡️'
      case 'arbitrage': return '🔄'
      case 'scalping': return '⚡'
      default: return '📊'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">📈 트레이딩 전략 제안</h2>
      
      {/* 전략 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {strategies.map((strategy, i) => (
          <div key={i} className={`rounded-lg p-4 border ${getRiskColor(strategy.risk)}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getTypeIcon(strategy.type)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{strategy.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    strategy.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    strategy.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {strategy.risk} RISK
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">{strategy.description}</p>
                
                <div className="space-y-1">
                  {strategy.actions.map((action, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-green-400 text-xs mt-0.5">✓</span>
                      <p className="text-gray-300 text-xs">{action}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">신뢰도</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${strategy.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-purple-400">{strategy.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 실행 권장사항 */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💡 실시간 권장사항</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <rec.icon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">{rec.title}</p>
                <p className="text-gray-400 text-xs">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 퀵 액션 버튼 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors text-sm font-medium">
          롱 진입
        </button>
        <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium">
          숏 진입
        </button>
        <button className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors text-sm font-medium">
          포지션 청산
        </button>
        <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm font-medium">
          자동 실행
        </button>
      </div>
      
      {/* 주의사항 */}
      <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
        <p className="text-yellow-400 text-sm">
          ⚠️ 이 전략은 참고용이며, 실제 거래는 본인의 판단과 책임 하에 진행하세요. 
          HFT 봇과의 경쟁보다는 그들의 패턴을 이해하고 활용하는 것이 중요합니다.
        </p>
      </div>
    </div>
  )
}