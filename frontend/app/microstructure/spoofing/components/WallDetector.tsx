'use client'

import { useEffect, useState } from 'react'
import { FaShieldAlt, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface Wall {
  id: string
  type: 'bid' | 'ask'
  price: number
  amount: number
  btcValue: number
  distance: number // 현재가로부터 거리 (%)
  strength: number // 벽 강도 (1-10)
  timestamp: number
  suspicious: boolean
}

interface WallDetectorProps {
  orderbook: any
  symbol: string
  settings: any
}

export default function WallDetector({ orderbook, symbol, settings }: WallDetectorProps) {
  const [walls, setWalls] = useState<Wall[]>([])
  const [stats, setStats] = useState({
    totalWalls: 0,
    bidWalls: 0,
    askWalls: 0,
    suspiciousWalls: 0,
    avgDistance: 0
  })

  // 벽 감지 로직
  useEffect(() => {
    if (!orderbook) return

    const currentPrice = (orderbook.bestBid + orderbook.bestAsk) / 2
    const minWallSize = settings?.wallMinSize || 10 // BTC 기준
    const detectedWalls: Wall[] = []

    // 매수 벽 감지
    if (orderbook.bids) {
      orderbook.bids.forEach((bid: any, index: number) => {
        const btcValue = bid.amount * bid.price / currentPrice
        
        if (btcValue >= minWallSize) {
          const distance = ((currentPrice - bid.price) / currentPrice) * 100
          const strength = Math.min(10, Math.floor(btcValue / minWallSize))
          
          detectedWalls.push({
            id: `bid-${bid.price}-${Date.now()}`,
            type: 'bid',
            price: bid.price,
            amount: bid.amount,
            btcValue,
            distance,
            strength,
            timestamp: Date.now(),
            suspicious: bid.lifespan && bid.lifespan < 5000 // 5초 이내 취소 의심
          })
        }
      })
    }

    // 매도 벽 감지
    if (orderbook.asks) {
      orderbook.asks.forEach((ask: any, index: number) => {
        const btcValue = ask.amount * ask.price / currentPrice
        
        if (btcValue >= minWallSize) {
          const distance = ((ask.price - currentPrice) / currentPrice) * 100
          const strength = Math.min(10, Math.floor(btcValue / minWallSize))
          
          detectedWalls.push({
            id: `ask-${ask.price}-${Date.now()}`,
            type: 'ask',
            price: ask.price,
            amount: ask.amount,
            btcValue,
            distance,
            strength,
            timestamp: Date.now(),
            suspicious: ask.lifespan && ask.lifespan < 5000
          })
        }
      })
    }

    // 거리순으로 정렬
    detectedWalls.sort((a, b) => a.distance - b.distance)

    // 상위 10개만 유지
    const topWalls = detectedWalls.slice(0, 10)
    setWalls(topWalls)

    // 통계 업데이트
    const bidWalls = topWalls.filter(w => w.type === 'bid')
    const askWalls = topWalls.filter(w => w.type === 'ask')
    const suspiciousWalls = topWalls.filter(w => w.suspicious)
    const avgDistance = topWalls.length > 0 
      ? topWalls.reduce((sum, w) => sum + w.distance, 0) / topWalls.length 
      : 0

    setStats({
      totalWalls: topWalls.length,
      bidWalls: bidWalls.length,
      askWalls: askWalls.length,
      suspiciousWalls: suspiciousWalls.length,
      avgDistance
    })
  }, [orderbook, settings])

  const getWallColor = (wall: Wall) => {
    if (wall.suspicious) return 'bg-red-900/30 border-red-700'
    if (wall.type === 'bid') return 'bg-green-900/20 border-green-700'
    return 'bg-red-900/20 border-red-700'
  }

  const getStrengthBar = (strength: number) => {
    const bars = []
    for (let i = 0; i < 10; i++) {
      bars.push(
        <div
          key={i}
          className={`w-1 h-3 rounded-sm ${
            i < strength 
              ? 'bg-gradient-to-t from-purple-600 to-purple-400' 
              : 'bg-gray-700'
          }`}
        />
      )
    }
    return bars
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">매수/매도 벽 감지</h3>
        </div>
        <span className="text-sm text-gray-400">{symbol}</span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">전체 벽</div>
          <div className="text-lg font-bold text-white">{stats.totalWalls}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">매수 벽</div>
          <div className="text-lg font-bold text-green-400">{stats.bidWalls}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">매도 벽</div>
          <div className="text-lg font-bold text-red-400">{stats.askWalls}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">의심 벽</div>
          <div className="text-lg font-bold text-yellow-400">{stats.suspiciousWalls}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">평균 거리</div>
          <div className="text-lg font-bold text-white">{stats.avgDistance.toFixed(2)}%</div>
        </div>
      </div>

      {/* 벽 리스트 */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {walls.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaShieldAlt className="text-4xl mx-auto mb-2 opacity-30" />
              <p>현재 감지된 벽이 없습니다</p>
              <p className="text-xs mt-1">최소 크기: {settings?.wallMinSize || 10} BTC</p>
            </div>
          ) : (
            walls.map((wall, index) => (
              <motion.div
                key={wall.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border ${getWallColor(wall)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {wall.type === 'bid' ? (
                        <FaArrowUp className="text-green-400" />
                      ) : (
                        <FaArrowDown className="text-red-400" />
                      )}
                      <span className={`text-sm font-bold ${
                        wall.type === 'bid' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {wall.type === 'bid' ? '매수 벽' : '매도 벽'}
                      </span>
                      {wall.suspicious && (
                        <FaExclamationTriangle className="text-yellow-400 text-xs animate-pulse" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">가격:</span>
                        <span className="text-white ml-1">
                          ${wall.price.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">수량:</span>
                        <span className="text-white ml-1">
                          {wall.amount.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">BTC 가치:</span>
                        <span className="text-white ml-1">
                          {wall.btcValue.toFixed(2)} BTC
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">거리:</span>
                        <span className={`ml-1 ${
                          wall.distance < 0.5 ? 'text-red-400' : 
                          wall.distance < 1 ? 'text-yellow-400' : 
                          'text-white'
                        }`}>
                          {wall.distance.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 강도 표시 */}
                  <div className="flex items-center gap-0.5 ml-4">
                    {getStrengthBar(wall.strength)}
                  </div>
                </div>

                {/* 경고 메시지 */}
                {wall.suspicious && (
                  <div className="mt-2 p-2 bg-yellow-900/30 rounded text-xs text-yellow-400">
                    ⚠️ 짧은 생존 시간 - 스푸핑 의심
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 범례 */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-400">매수 벽</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-400">매도 벽</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded animate-pulse" />
              <span className="text-gray-400">스푸핑 의심</span>
            </div>
          </div>
          <div className="text-gray-400">
            최소 크기: {settings?.wallMinSize || 10} BTC
          </div>
        </div>
      </div>
    </div>
  )
}