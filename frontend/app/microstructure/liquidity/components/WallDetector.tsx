'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { ShieldExclamationIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'

interface WallDetectorProps {
  orderbook: any
  currentPrice: number
}

export default function WallDetector({ orderbook, currentPrice }: WallDetectorProps) {
  
  // Wall 감지 로직
  const walls = useMemo(() => {
    if (!orderbook) return { buyWalls: [], sellWalls: [] }
    
    // 평균 주문 크기 계산
    const avgBidSize = orderbook.bids.reduce((sum: number, b: any) => sum + b.total, 0) / orderbook.bids.length
    const avgAskSize = orderbook.asks.reduce((sum: number, a: any) => sum + a.total, 0) / orderbook.asks.length
    
    // Wall 기준: 평균의 3배 이상
    const buyWallThreshold = avgBidSize * 3
    const sellWallThreshold = avgAskSize * 3
    
    // Buy Walls 감지
    const buyWalls = orderbook.bids
      .filter((bid: any) => bid.total >= buyWallThreshold)
      .map((bid: any) => ({
        price: bid.price,
        amount: bid.amount,
        total: bid.total,
        distance: ((currentPrice - bid.price) / currentPrice) * 100,
        strength: bid.total / buyWallThreshold
      }))
      .slice(0, 5)
    
    // Sell Walls 감지
    const sellWalls = orderbook.asks
      .filter((ask: any) => ask.total >= sellWallThreshold)
      .map((ask: any) => ({
        price: ask.price,
        amount: ask.amount,
        total: ask.total,
        distance: ((ask.price - currentPrice) / currentPrice) * 100,
        strength: ask.total / sellWallThreshold
      }))
      .slice(0, 5)
    
    return { buyWalls, sellWalls, buyWallThreshold, sellWallThreshold }
  }, [orderbook, currentPrice])
  
  // Wall 강도 평가
  const getWallStrength = (strength: number) => {
    if (strength >= 5) return { text: '매우 강함', color: 'text-red-500' }
    if (strength >= 3) return { text: '강함', color: 'text-orange-500' }
    if (strength >= 2) return { text: '중간', color: 'text-yellow-500' }
    return { text: '약함', color: 'text-blue-500' }
  }
  
  // Wall 영향력 평가
  const getWallImpact = (distance: number) => {
    if (distance <= 0.5) return { text: '즉각적', color: 'text-red-500' }
    if (distance <= 1) return { text: '높음', color: 'text-orange-500' }
    if (distance <= 2) return { text: '중간', color: 'text-yellow-500' }
    return { text: '낮음', color: 'text-gray-500' }
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Wall 탐지기</h3>
        <p className="text-gray-400 text-sm">대규모 주문 벽 실시간 감지</p>
      </div>
      
      {/* 탐지 상태 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {walls.buyWalls.length > 0 || walls.sellWalls.length > 0 ? (
              <>
                <ShieldExclamationIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  {walls.buyWalls.length + walls.sellWalls.length}개 Wall 감지됨
                </span>
              </>
            ) : (
              <>
                <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Wall 없음</span>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">임계값</p>
            <p className="text-sm text-gray-300">
              Buy: ${(walls.buyWallThreshold / 1000).toFixed(1)}K | 
              Sell: ${(walls.sellWallThreshold / 1000).toFixed(1)}K
            </p>
          </div>
        </div>
      </div>
      
      {/* Buy Walls */}
      <div className="mb-4">
        <h4 className="text-green-400 font-semibold mb-2">매수 벽 (Buy Walls)</h4>
        {walls.buyWalls.length > 0 ? (
          <div className="space-y-2">
            {walls.buyWalls.map((wall: any, index: number) => {
              const strength = getWallStrength(wall.strength)
              const impact = getWallImpact(wall.distance)
              return (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono">
                        ${safePrice(wall.price, 2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${strength.color} bg-gray-800`}>
                        {strength.text}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${impact.color} bg-gray-800`}>
                        {impact.text}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      -{safeFixed(wall.distance, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      수량: {safeAmount(wall.amount)} BTC
                    </span>
                    <span className="text-green-400">
                      ${(wall.total / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, wall.strength * 20)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <p className="text-gray-500">감지된 매수 벽 없음</p>
          </div>
        )}
      </div>
      
      {/* Sell Walls */}
      <div>
        <h4 className="text-red-400 font-semibold mb-2">매도 벽 (Sell Walls)</h4>
        {walls.sellWalls.length > 0 ? (
          <div className="space-y-2">
            {walls.sellWalls.map((wall: any, index: number) => {
              const strength = getWallStrength(wall.strength)
              const impact = getWallImpact(wall.distance)
              return (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono">
                        ${safePrice(wall.price, 2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${strength.color} bg-gray-800`}>
                        {strength.text}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${impact.color} bg-gray-800`}>
                        {impact.text}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      +{safeFixed(wall.distance, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      수량: {safeAmount(wall.amount)} BTC
                    </span>
                    <span className="text-red-400">
                      ${(wall.total / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, wall.strength * 20)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <p className="text-gray-500">감지된 매도 벽 없음</p>
          </div>
        )}
      </div>
      
      {/* Wall 트레이딩 팁 */}
      <div className="mt-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">💡 Wall 트레이딩 전략</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 강한 매수 벽은 지지선 역할 → 바로 위에서 롱 포지션</li>
          <li>• 강한 매도 벽은 저항선 역할 → 바로 아래서 숏 포지션</li>
          <li>• Wall이 갑자기 사라지면 가격 급변동 가능성</li>
          <li>• 거리 1% 이내 Wall은 즉각적 영향 주의</li>
        </ul>
      </div>
    </div>
  )
}