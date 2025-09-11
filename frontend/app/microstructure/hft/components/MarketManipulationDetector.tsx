'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { ExclamationTriangleIcon, ShieldCheckIcon, BellAlertIcon } from '@heroicons/react/24/outline'

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

interface HFTPattern {
  timestamp: number
  type: string
  confidence: number
  impact: string
}

interface MarketManipulationDetectorProps {
  trades: TradeData[]
  orderbook: any
  patterns: HFTPattern[]
}

export default function MarketManipulationDetector({ trades, orderbook, patterns }: MarketManipulationDetectorProps) {
  // 조작 탐지 분석
  const manipulationSignals = useMemo(() => {
    const signals = []
    const now = Date.now()
    
    // 스푸핑 탐지 (큰 주문이 빠르게 취소됨)
    if (orderbook && orderbook.bids && orderbook.asks) {
      const largeBids = orderbook.bids.filter((b: any) => b.amount > orderbook.bids.reduce((sum: number, bid: any) => sum + bid.amount, 0) / orderbook.bids.length * 3)
      const largeAsks = orderbook.asks.filter((a: any) => a.amount > orderbook.asks.reduce((sum: number, ask: any) => sum + ask.amount, 0) / orderbook.asks.length * 3)
      
      if (largeBids.length > 0 || largeAsks.length > 0) {
        signals.push({
          type: 'spoofing',
          severity: 'HIGH',
          confidence: 75,
          description: '대량 호가가 감지되었습니다. 스푸핑 가능성이 있습니다.',
          action: '대량 호가 근처에서 거래를 피하세요',
          timestamp: now
        })
      }
    }
    
    // 레이어링 탐지 (여러 가격대에 분산된 주문)
    if (orderbook && orderbook.bids && orderbook.asks) {
      const bidPrices = orderbook.bids.map((b: any) => b.price)
      const askPrices = orderbook.asks.map((a: any) => a.price)
      const bidSpread = Math.max(...bidPrices) - Math.min(...bidPrices)
      const askSpread = Math.max(...askPrices) - Math.min(...askPrices)
      
      if (bidSpread < 0.001 || askSpread < 0.001) {
        signals.push({
          type: 'layering',
          severity: 'MEDIUM',
          confidence: 60,
          description: '가격대가 밀집된 주문이 감지되었습니다',
          action: '주문 레이어링 패턴 주의',
          timestamp: now
        })
      }
    }
    
    // 워시 트레이딩 탐지 (같은 가격대에서 반복 거래)
    const recentTrades = trades.slice(0, 50)
    const priceFrequency: Record<string, number> = {}
    recentTrades.forEach(t => {
      const priceKey = safePrice(t.price, 2)
      priceFrequency[priceKey] = (priceFrequency[priceKey] || 0) + 1
    })
    
    const suspiciousPrices = Object.entries(priceFrequency).filter(([_, count]) => count > 10)
    if (suspiciousPrices.length > 0) {
      signals.push({
        type: 'wash_trading',
        severity: 'MEDIUM',
        confidence: 65,
        description: '동일 가격대에서 반복적인 거래가 감지되었습니다',
        action: '거래량 조작 가능성 주의',
        timestamp: now
      })
    }
    
    // 펌프 앤 덤프 탐지
    const priceChange = recentTrades.length > 1
      ? (recentTrades[0].price - recentTrades[recentTrades.length - 1].price) / recentTrades[recentTrades.length - 1].price * 100
      : 0
    const volumeSpike = recentTrades.reduce((sum, t) => sum + t.quantity, 0)
    
    if (Math.abs(priceChange) > 2 && volumeSpike > trades.slice(50, 100).reduce((sum, t) => sum + t.quantity, 0) * 2) {
      signals.push({
        type: 'pump_dump',
        severity: 'HIGH',
        confidence: 70,
        description: `급격한 가격 변동 (${safePrice(priceChange, 2)}%) 과 거래량 급증`,
        action: 'FOMO 주의, 신중한 진입 필요',
        timestamp: now
      })
    }
    
    // 플래시 크래시 경고
    if (priceChange < -3) {
      signals.push({
        type: 'flash_crash',
        severity: 'CRITICAL',
        confidence: 85,
        description: '급격한 가격 하락이 감지되었습니다',
        action: '즉시 포지션 확인 및 손절 고려',
        timestamp: now
      })
    }
    
    // 모멘텀 이그니션 탐지
    const buyMomentum = recentTrades.filter(t => !t.isBuyerMaker).length
    const sellMomentum = recentTrades.filter(t => t.isBuyerMaker).length
    
    if (buyMomentum > sellMomentum * 3 || sellMomentum > buyMomentum * 3) {
      signals.push({
        type: 'momentum_ignition',
        severity: 'MEDIUM',
        confidence: 55,
        description: '인위적 모멘텀 생성 가능성',
        action: '추세 반전 주의',
        timestamp: now
      })
    }
    
    return signals
  }, [trades, orderbook])
  
  // 위험도 점수 계산
  const riskScore = useMemo(() => {
    let score = 0
    manipulationSignals.forEach(signal => {
      if (signal.severity === 'CRITICAL') score += 40
      else if (signal.severity === 'HIGH') score += 25
      else if (signal.severity === 'MEDIUM') score += 15
      else score += 5
    })
    return Math.min(score, 100)
  }, [manipulationSignals])
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-900/30 border-red-500/50 text-red-400'
      case 'HIGH': return 'bg-orange-900/30 border-orange-500/50 text-orange-400'
      case 'MEDIUM': return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400'
      case 'LOW': return 'bg-blue-900/30 border-blue-500/50 text-blue-400'
      default: return 'bg-gray-900/30 border-gray-500/50 text-gray-400'
    }
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spoofing': return '🎭'
      case 'layering': return '📚'
      case 'wash_trading': return '🔄'
      case 'pump_dump': return '🎢'
      case 'flash_crash': return '⚡'
      case 'momentum_ignition': return '🔥'
      default: return '⚠️'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">🚨 시장 조작 탐지 시스템</h2>
        <div className="flex items-center gap-2">
          {riskScore < 30 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-lg border border-green-500/30">
              <ShieldCheckIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">안전</span>
            </div>
          )}
          {riskScore >= 30 && riskScore < 60 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">주의</span>
            </div>
          )}
          {riskScore >= 60 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-900/30 rounded-lg border border-red-500/30">
              <BellAlertIcon className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">위험</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 위험도 게이지 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">시장 조작 위험도</span>
          <span className="text-2xl font-bold text-white">{riskScore}%</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div className="w-1/3 bg-gradient-to-r from-green-600 to-green-500"></div>
            <div className="w-1/3 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <div className="w-1/3 bg-gradient-to-r from-orange-500 to-red-600"></div>
          </div>
          <div className="relative">
            <div 
              className="absolute top-0 h-4 w-1 bg-white shadow-lg transition-all duration-500"
              style={{ left: `${riskScore}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 탐지된 신호 목록 */}
      <div className="space-y-3">
        {manipulationSignals.length > 0 ? (
          manipulationSignals.map((signal, i) => (
            <div key={i} className={`rounded-lg p-4 border ${getSeverityColor(signal.severity)}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(signal.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">
                      {signal.type.replace('_', ' ')}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-black/30">
                        {signal.severity}
                      </span>
                      <span className="text-xs">
                        신뢰도: {signal.confidence}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mb-2 opacity-90">{signal.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-black/30">
                      💡 {signal.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <ShieldCheckIcon className="h-12 w-12 mx-auto mb-3 text-green-400" />
            <p className="text-sm">현재 시장 조작 신호가 감지되지 않았습니다</p>
          </div>
        )}
      </div>
      
      {/* 조작 패턴 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-700">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">스푸핑</p>
          <p className="text-lg font-bold text-white">
            {manipulationSignals.filter(s => s.type === 'spoofing').length}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">워시 트레이딩</p>
          <p className="text-lg font-bold text-white">
            {manipulationSignals.filter(s => s.type === 'wash_trading').length}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">펌프&덤프</p>
          <p className="text-lg font-bold text-white">
            {manipulationSignals.filter(s => s.type === 'pump_dump').length}
          </p>
        </div>
      </div>
    </div>
  )
}