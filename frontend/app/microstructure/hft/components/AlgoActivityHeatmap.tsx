'use client'

import { useMemo } from 'react'

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

interface AlgoActivityHeatmapProps {
  trades: TradeData[]
  patterns: HFTPattern[]
  selectedCoin: string
}

export default function AlgoActivityHeatmap({ trades, patterns, selectedCoin }: AlgoActivityHeatmapProps) {
  // 시간대별 활동 강도 계산
  const heatmapData = useMemo(() => {
    const now = Date.now()
    const timeSlots = 24 // 24시간
    const slotDuration = 3600000 // 1시간 (밀리초)
    
    // 시간대별 데이터 초기화
    const slots = Array(timeSlots).fill(0).map((_, i) => ({
      hour: i,
      tradeCount: 0,
      volume: 0,
      patternCount: 0,
      intensity: 0,
      dominantPattern: '',
      buyRatio: 0
    }))
    
    // 거래 데이터 집계
    trades.forEach(trade => {
      const tradeHour = new Date(trade.time).getHours()
      if (slots[tradeHour]) {
        slots[tradeHour].tradeCount++
        slots[tradeHour].volume += trade.quantity
        if (!trade.isBuyerMaker) {
          slots[tradeHour].buyRatio++
        }
      }
    })
    
    // 패턴 데이터 집계
    patterns.forEach(pattern => {
      const patternHour = new Date(pattern.timestamp).getHours()
      if (slots[patternHour]) {
        slots[patternHour].patternCount++
        if (!slots[patternHour].dominantPattern || pattern.confidence > 80) {
          slots[patternHour].dominantPattern = pattern.type
        }
      }
    })
    
    // 강도 계산 및 정규화
    const maxTrades = Math.max(...slots.map(s => s.tradeCount), 1)
    slots.forEach(slot => {
      slot.intensity = (slot.tradeCount / maxTrades) * 100
      if (slot.tradeCount > 0) {
        slot.buyRatio = (slot.buyRatio / slot.tradeCount) * 100
      }
    })
    
    return slots
  }, [trades, patterns])
  
  // 가격 레벨별 활동 강도
  const priceLevels = useMemo(() => {
    if (trades.length === 0) return []
    
    const prices = trades.map(t => t.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const levels = 20
    
    const priceLevelData = Array(levels).fill(0).map((_, i) => {
      const levelMin = minPrice + (priceRange / levels) * i
      const levelMax = minPrice + (priceRange / levels) * (i + 1)
      const levelTrades = trades.filter(t => t.price >= levelMin && t.price < levelMax)
      
      return {
        level: i,
        price: (levelMin + levelMax) / 2,
        count: levelTrades.length,
        volume: levelTrades.reduce((sum, t) => sum + t.quantity, 0),
        buyRatio: levelTrades.filter(t => !t.isBuyerMaker).length / Math.max(levelTrades.length, 1) * 100
      }
    })
    
    return priceLevelData
  }, [trades])
  
  // 색상 계산 함수
  const getHeatColor = (intensity: number) => {
    if (intensity > 80) return 'bg-red-600'
    if (intensity > 60) return 'bg-orange-600'
    if (intensity > 40) return 'bg-yellow-600'
    if (intensity > 20) return 'bg-green-600'
    return 'bg-gray-700'
  }
  
  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'market_making': return 'text-blue-400'
      case 'arbitrage': return 'text-green-400'
      case 'momentum': return 'text-yellow-400'
      case 'scalping': return 'text-purple-400'
      case 'spoofing': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">🔥 알고리즘 활동 히트맵</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-gray-400">매우 높음</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded"></div>
            <span className="text-gray-400">보통</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-400">낮음</span>
          </div>
        </div>
      </div>
      
      {/* 시간대별 히트맵 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">⏰ 시간대별 활동 강도</h3>
        <div className="grid grid-cols-12 gap-1 mb-2">
          {heatmapData.slice(0, 12).map((slot, i) => (
            <div key={i} className="text-center">
              <div
                className={`h-16 rounded ${getHeatColor(slot.intensity)} transition-all hover:scale-105 cursor-pointer relative group`}
                title={`${slot.hour}시: ${slot.tradeCount}건`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                  <span className="text-white font-bold">{slot.hour}시</span>
                  <span className="text-white/70">{slot.tradeCount}</span>
                </div>
                {slot.dominantPattern && (
                  <div className={`absolute top-1 right-1 text-xs ${getPatternColor(slot.dominantPattern)}`}>
                    •
                  </div>
                )}
                
                {/* 호버 시 상세 정보 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 rounded-lg p-2 text-xs text-white min-w-[120px]">
                    <p>거래: {slot.tradeCount}건</p>
                    <p>거래량: {slot.volume.toFixed(2)}</p>
                    <p>매수 비율: {slot.buyRatio.toFixed(1)}%</p>
                    {slot.dominantPattern && (
                      <p className={getPatternColor(slot.dominantPattern)}>
                        패턴: {slot.dominantPattern}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-12 gap-1">
          {heatmapData.slice(12, 24).map((slot, i) => (
            <div key={i + 12} className="text-center">
              <div
                className={`h-16 rounded ${getHeatColor(slot.intensity)} transition-all hover:scale-105 cursor-pointer relative group`}
                title={`${slot.hour}시: ${slot.tradeCount}건`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                  <span className="text-white font-bold">{slot.hour}시</span>
                  <span className="text-white/70">{slot.tradeCount}</span>
                </div>
                {slot.dominantPattern && (
                  <div className={`absolute top-1 right-1 text-xs ${getPatternColor(slot.dominantPattern)}`}>
                    •
                  </div>
                )}
                
                {/* 호버 시 상세 정보 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 rounded-lg p-2 text-xs text-white min-w-[120px]">
                    <p>거래: {slot.tradeCount}건</p>
                    <p>거래량: {slot.volume.toFixed(2)}</p>
                    <p>매수 비율: {slot.buyRatio.toFixed(1)}%</p>
                    {slot.dominantPattern && (
                      <p className={getPatternColor(slot.dominantPattern)}>
                        패턴: {slot.dominantPattern}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 가격대별 히트맵 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">💹 가격대별 알고 집중도</h3>
        <div className="space-y-2">
          {priceLevels.slice(0, 10).map((level, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-20 text-right">
                ${level.price.toFixed(2)}
              </span>
              <div className="flex-1 h-8 bg-gray-700 rounded overflow-hidden relative">
                <div
                  className={`h-full ${getHeatColor(level.count / Math.max(...priceLevels.map(l => l.count), 1) * 100)} transition-all`}
                  style={{ width: `${(level.count / Math.max(...priceLevels.map(l => l.count), 1)) * 100}%` }}
                >
                  <div className="absolute inset-0 flex items-center px-2 text-xs text-white">
                    {level.count}건
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`${level.buyRatio > 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {level.buyRatio > 50 ? '↑' : '↓'} {level.buyRatio.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 실시간 알고 활동 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">현재 활동 강도</p>
          <p className="text-2xl font-bold text-purple-400">
            {Math.min(...heatmapData.map(s => s.intensity)).toFixed(0)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">피크 시간대</p>
          <p className="text-2xl font-bold text-yellow-400">
            {heatmapData.reduce((max, s) => s.intensity > max.intensity ? s : max, heatmapData[0]).hour}시
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">감지된 봇</p>
          <p className="text-2xl font-bold text-green-400">
            {patterns.filter(p => p.confidence > 70).length}개
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">주요 패턴</p>
          <p className={`text-2xl font-bold ${getPatternColor(patterns[0]?.type || '')}`}>
            {patterns[0]?.type?.replace('_', ' ') || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}