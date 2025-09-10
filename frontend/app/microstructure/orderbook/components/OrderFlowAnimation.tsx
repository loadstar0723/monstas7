'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaExchangeAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface OrderFlowAnimationProps {
  orderbook: {
    bids: OrderbookLevel[]
    asks: OrderbookLevel[]
    lastUpdate?: Date
  } | null
  showAnimation: boolean
}

interface FlowOrder {
  id: string
  type: 'bid' | 'ask'
  price: number
  amount: number
  timestamp: number
  y: number
}

export default function OrderFlowAnimation({ orderbook, showAnimation }: OrderFlowAnimationProps) {
  const [flowOrders, setFlowOrders] = useState<FlowOrder[]>([])
  const [orderHistory, setOrderHistory] = useState<FlowOrder[]>([])
  const previousOrderbook = useRef(orderbook)
  const flowIdCounter = useRef(0)

  // 오더북 변화 감지 및 플로우 생성
  useEffect(() => {
    if (!showAnimation) return

    // orderbook이 없을 때 샘플 데이터 생성
    if (!orderbook || (!orderbook.bids?.length && !orderbook.asks?.length)) {
      // 샘플 초기 플로우 생성
      const sampleFlows: FlowOrder[] = [
        {
          id: `flow-${flowIdCounter.current++}`,
          type: 'bid',
          price: 98000,
          amount: 0.5,
          timestamp: Date.now() - 5000,
          y: 50
        },
        {
          id: `flow-${flowIdCounter.current++}`,
          type: 'ask',
          price: 98100,
          amount: 0.3,
          timestamp: Date.now() - 4000,
          y: 35
        },
        {
          id: `flow-${flowIdCounter.current++}`,
          type: 'bid',
          price: 97950,
          amount: 0.8,
          timestamp: Date.now() - 3000,
          y: 65
        }
      ]
      setOrderHistory(sampleFlows)
      return
    }

    const prev = previousOrderbook.current
    const curr = orderbook

    // 초기 데이터가 없을 경우 현재 데이터를 이전 데이터로 설정
    if (!prev) {
      previousOrderbook.current = curr
      // 초기 플로우 생성
      const initialFlows: FlowOrder[] = []
      curr.bids.slice(0, 3).forEach((bid, idx) => {
        if (bid.amount > 0) {
          initialFlows.push({
            id: `flow-${flowIdCounter.current++}`,
            type: 'bid',
            price: bid.price,
            amount: bid.amount,
            timestamp: Date.now() - (idx * 1000),
            y: 50 + idx * 15
          })
        }
      })
      curr.asks.slice(0, 3).forEach((ask, idx) => {
        if (ask.amount > 0) {
          initialFlows.push({
            id: `flow-${flowIdCounter.current++}`,
            type: 'ask',
            price: ask.price,
            amount: ask.amount,
            timestamp: Date.now() - (idx * 1000),
            y: 50 - idx * 15
          })
        }
      })
      setOrderHistory(initialFlows.slice(0, 10))
      return
    }

    // 비드 변화 감지
    curr.bids.slice(0, 5).forEach((bid, idx) => {
      if (prev.bids[idx] && bid.amount !== prev.bids[idx].amount) {
        const change = bid.amount - prev.bids[idx].amount
        if (Math.abs(change) > 0.01) {
          const newOrder: FlowOrder = {
            id: `flow-${flowIdCounter.current++}`,
            type: 'bid',
            price: bid.price,
            amount: Math.abs(change),
            timestamp: Date.now(),
            y: 50 + idx * 15
          }
          setFlowOrders(prev => [...prev, newOrder])
          setOrderHistory(prev => [newOrder, ...prev.slice(0, 19)])
        }
      }
    })

    // 아스크 변화 감지
    curr.asks.slice(0, 5).forEach((ask, idx) => {
      if (prev.asks[idx] && ask.amount !== prev.asks[idx].amount) {
        const change = ask.amount - prev.asks[idx].amount
        if (Math.abs(change) > 0.01) {
          const newOrder: FlowOrder = {
            id: `flow-${flowIdCounter.current++}`,
            type: 'ask',
            price: ask.price,
            amount: Math.abs(change),
            timestamp: Date.now(),
            y: 50 - idx * 15
          }
          setFlowOrders(prev => [...prev, newOrder])
          setOrderHistory(prev => [newOrder, ...prev.slice(0, 19)])
        }
      }
    })

    previousOrderbook.current = curr
  }, [orderbook, showAnimation])

  // 오래된 플로우 제거
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowOrders(prev => prev.filter(order => 
        Date.now() - order.timestamp < 3000
      ))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return num.toFixed(4)
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaExchangeAlt className="text-yellow-400" />
        주문 플로우 애니메이션
        {showAnimation && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            실시간
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 플로우 비주얼라이저 */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-3">실시간 주문 흐름</h4>
          <div className="relative h-64 bg-gray-900/50 rounded-lg overflow-hidden">
            {/* 중앙선 */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-600" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600" />
            
            {/* 라벨 */}
            <div className="absolute left-2 top-2 text-xs text-green-400">매수 (Bid)</div>
            <div className="absolute left-2 bottom-2 text-xs text-red-400">매도 (Ask)</div>

            <AnimatePresence>
              {showAnimation && flowOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ x: -50, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    x: 300,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.8]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="absolute"
                  style={{ 
                    top: `${order.y}%`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <div className={`flex items-center gap-2 ${order.type === 'bid' ? 'text-green-400' : 'text-red-400'}`}>
                    {order.type === 'bid' ? <FaArrowUp /> : <FaArrowDown />}
                    <span className="text-sm font-mono">
                      {formatNumber(order.amount)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!showAnimation && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm">애니메이션이 일시중지됨</p>
              </div>
            )}
          </div>
        </div>

        {/* 주문 히스토리 */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-3">최근 주문 변화</h4>
          <div className="bg-gray-900/50 rounded-lg p-4 h-64 overflow-y-auto">
            {orderHistory.length > 0 ? (
              <div className="space-y-2">
                {orderHistory.map((order, idx) => {
                  const timeAgo = Math.floor((Date.now() - order.timestamp) / 1000)
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${order.type === 'bid' ? 'text-green-400' : 'text-red-400'}`}>
                          {order.type === 'bid' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${order.type === 'bid' ? 'text-green-400' : 'text-red-400'}`}>
                            {order.type === 'bid' ? '매수' : '매도'}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            {formatNumber(order.amount)} BTC
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-300 text-sm">
                          ${order.price.toFixed(2)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {timeAgo}초 전
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm">아직 감지된 주문 변화가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs mb-1">총 매수</div>
          <div className="text-green-400 font-bold">
            {orderHistory.filter(o => o.type === 'bid').reduce((sum, o) => sum + o.amount, 0).toFixed(4)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs mb-1">총 매도</div>
          <div className="text-red-400 font-bold">
            {orderHistory.filter(o => o.type === 'ask').reduce((sum, o) => sum + o.amount, 0).toFixed(4)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs mb-1">주문 비율</div>
          <div className="font-bold">
            {(() => {
              const bidTotal = orderHistory.filter(o => o.type === 'bid').reduce((sum, o) => sum + o.amount, 0)
              const askTotal = orderHistory.filter(o => o.type === 'ask').reduce((sum, o) => sum + o.amount, 0)
              const ratio = bidTotal / (askTotal || 1)
              return (
                <span className={ratio > 1.2 ? 'text-green-400' : ratio < 0.8 ? 'text-red-400' : 'text-gray-300'}>
                  {ratio.toFixed(2)}
                </span>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}