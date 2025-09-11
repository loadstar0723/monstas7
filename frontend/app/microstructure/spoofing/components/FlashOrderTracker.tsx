'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaBolt, FaClock, FaHistory, FaExclamationCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface FlashOrder {
  id: string
  type: 'bid' | 'ask'
  price: number
  amount: number
  lifespan: number // 밀리초
  timestamp: number
  impact: 'low' | 'medium' | 'high'
}

interface FlashOrderTrackerProps {
  orderbook: any
  symbol: string
  settings: any
}

export default function FlashOrderTracker({ orderbook, symbol, settings }: FlashOrderTrackerProps) {
  const [flashOrders, setFlashOrders] = useState<FlashOrder[]>([])
  const [stats, setStats] = useState({
    totalFlash: 0,
    avgLifespan: 0,
    bidFlash: 0,
    askFlash: 0,
    highImpact: 0,
    flashRate: 0 // 분당 플래시 오더 수
  })
  const [timeline, setTimeline] = useState<FlashOrder[]>([])
  const orderHistory = useRef<Map<string, { price: number, amount: number, timestamp: number }>>(new Map())
  const flashBuffer = useRef<FlashOrder[]>([])

  // 플래시 오더 감지
  useEffect(() => {
    if (!orderbook) return

    const currentTime = Date.now()
    const flashTimeWindow = settings?.flashTimeWindow || 1000 // 기본 1초
    const currentPrice = (orderbook.bestBid + orderbook.bestAsk) / 2

    // 새로운 주문 추적
    const allOrders = [...(orderbook.bids || []), ...(orderbook.asks || [])]
    const currentOrderIds = new Set<string>()

    allOrders.forEach(order => {
      const orderId = `${order.price}-${order.amount}`
      currentOrderIds.add(orderId)

      if (!orderHistory.current.has(orderId)) {
        // 새 주문 기록
        orderHistory.current.set(orderId, {
          price: order.price,
          amount: order.amount,
          timestamp: currentTime
        })
      }
    })

    // 사라진 주문 감지 (플래시 오더 후보)
    const detectedFlashOrders: FlashOrder[] = []
    
    orderHistory.current.forEach((order, orderId) => {
      if (!currentOrderIds.has(orderId)) {
        const lifespan = currentTime - order.timestamp
        
        if (lifespan < flashTimeWindow) {
          // 플래시 오더로 판정
          const isBid = order.price < currentPrice
          const priceImpact = Math.abs(order.price - currentPrice) / currentPrice * 100
          
          let impact: 'low' | 'medium' | 'high' = 'low'
          if (priceImpact < 0.1) impact = 'high'
          else if (priceImpact < 0.5) impact = 'medium'

          const flashOrder: FlashOrder = {
            id: `flash-${orderId}-${currentTime}`,
            type: isBid ? 'bid' : 'ask',
            price: order.price,
            amount: order.amount,
            lifespan,
            timestamp: currentTime,
            impact
          }

          detectedFlashOrders.push(flashOrder)
          flashBuffer.current.push(flashOrder)
        }
        
        // 오래된 주문 제거
        orderHistory.current.delete(orderId)
      }
    })

    // 오래된 기록 정리 (10초 이상)
    orderHistory.current.forEach((order, orderId) => {
      if (currentTime - order.timestamp > 10000) {
        orderHistory.current.delete(orderId)
      }
    })

    // 플래시 버퍼 정리 (최근 1분만 유지)
    flashBuffer.current = flashBuffer.current.filter(
      flash => currentTime - flash.timestamp < 60000
    )

    // 최근 플래시 오더 업데이트
    const recentFlash = flashBuffer.current
      .filter(flash => currentTime - flash.timestamp < 10000) // 최근 10초
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20) // 최대 20개

    setFlashOrders(recentFlash)
    setTimeline(flashBuffer.current.slice(-50)) // 최근 50개 타임라인

    // 통계 계산
    if (flashBuffer.current.length > 0) {
      const recentMinute = flashBuffer.current.filter(
        flash => currentTime - flash.timestamp < 60000
      )

      const bidFlash = recentMinute.filter(f => f.type === 'bid')
      const askFlash = recentMinute.filter(f => f.type === 'ask')
      const highImpact = recentMinute.filter(f => f.impact === 'high')
      const avgLifespan = recentMinute.reduce((sum, f) => sum + f.lifespan, 0) / recentMinute.length

      setStats({
        totalFlash: recentMinute.length,
        avgLifespan,
        bidFlash: bidFlash.length,
        askFlash: askFlash.length,
        highImpact: highImpact.length,
        flashRate: recentMinute.length // 분당
      })
    }
  }, [orderbook, settings])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getImpactBg = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-900/30 border-red-700'
      case 'medium': return 'bg-yellow-900/30 border-yellow-700'
      case 'low': return 'bg-green-900/30 border-green-700'
      default: return 'bg-gray-900/30 border-gray-700'
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBolt className="text-yellow-400" />
          <h3 className="text-lg font-bold text-white">플래시 오더 추적</h3>
        </div>
        <span className="text-sm text-gray-400">{symbol}</span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">1분 감지</div>
          <div className="text-lg font-bold text-white">{stats.totalFlash}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">평균 생존</div>
          <div className="text-lg font-bold text-yellow-400">
            {(stats.avgLifespan / 1000).toFixed(1)}s
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">매수 플래시</div>
          <div className="text-lg font-bold text-green-400">{stats.bidFlash}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">매도 플래시</div>
          <div className="text-lg font-bold text-red-400">{stats.askFlash}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">고영향</div>
          <div className="text-lg font-bold text-orange-400">{stats.highImpact}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">분당 비율</div>
          <div className="text-lg font-bold text-purple-400">{stats.flashRate}</div>
        </div>
      </div>

      {/* 실시간 플래시 오더 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaClock className="text-gray-400 text-sm" />
          <span className="text-sm font-semibold text-gray-300">실시간 감지 (최근 10초)</span>
        </div>
        
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          <AnimatePresence>
            {flashOrders.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <FaBolt className="text-2xl mx-auto mb-1 opacity-30" />
                <p className="text-sm">플래시 오더가 감지되지 않았습니다</p>
              </div>
            ) : (
              flashOrders.map((flash, index) => (
                <motion.div
                  key={flash.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-2 rounded-lg border ${getImpactBg(flash.impact)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaBolt className={`text-xs ${getImpactColor(flash.impact)}`} />
                      <span className={`text-xs font-bold ${
                        flash.type === 'bid' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {flash.type === 'bid' ? '매수' : '매도'}
                      </span>
                      <span className="text-xs text-white">
                        ${flash.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {safeAmount(flash.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${getImpactColor(flash.impact)}`}>
                        {flash.impact.toUpperCase()}
                      </span>
                      <span className="text-xs text-yellow-400">
                        {flash.lifespan}ms
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(flash.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 타임라인 차트 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FaHistory className="text-gray-400 text-sm" />
          <span className="text-sm font-semibold text-gray-300">플래시 오더 타임라인</span>
        </div>
        
        <div className="h-20 bg-gray-900/50 rounded-lg p-2 relative overflow-hidden">
          {timeline.length > 0 ? (
            <div className="relative h-full">
              {timeline.map((flash, index) => {
                const x = (index / timeline.length) * 100
                const y = flash.type === 'bid' ? 60 : 20
                const size = flash.impact === 'high' ? 4 : flash.impact === 'medium' ? 3 : 2
                
                return (
                  <div
                    key={flash.id}
                    className={`absolute rounded-full ${
                      flash.type === 'bid' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${size * 2}px`,
                      height: `${size * 2}px`,
                      opacity: 0.7 + (index / timeline.length) * 0.3
                    }}
                  />
                )
              })}
              
              {/* 중앙선 */}
              <div className="absolute w-full h-[1px] bg-gray-700 top-1/2" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-xs">
              타임라인 데이터 수집 중...
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>1분 전</span>
          <span>현재</span>
        </div>
      </div>

      {/* 경고 */}
      {stats.flashRate > 10 && (
        <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700 rounded-lg">
          <div className="flex items-start gap-2">
            <FaExclamationCircle className="text-orange-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-orange-400">
                높은 플래시 오더 활동 감지
              </div>
              <div className="text-xs text-gray-400 mt-1">
                분당 {stats.flashRate}개의 플래시 오더가 감지되었습니다.
                시장 조작 가능성이 있으니 주의하세요.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
