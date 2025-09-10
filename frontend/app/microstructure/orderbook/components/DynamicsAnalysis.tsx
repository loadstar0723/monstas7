'use client'

import { motion } from 'framer-motion'
import { FaFireAlt, FaChartLine, FaExchangeAlt, FaBolt, FaTachometerAlt } from 'react-icons/fa'
import { useState, useEffect, useMemo } from 'react'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface DynamicsAnalysisProps {
  orderbook: {
    bids: OrderbookLevel[]
    asks: OrderbookLevel[]
    lastUpdate?: Date
  } | null
  historicalData: any[]
  symbol: string
}

interface OrderDynamics {
  addRate: number
  cancelRate: number
  modifyRate: number
  avgOrderSize: number
  orderVelocity: number
  momentum: 'bullish' | 'bearish' | 'neutral'
}

export default function DynamicsAnalysis({ orderbook, historicalData, symbol }: DynamicsAnalysisProps) {
  const [dynamics, setDynamics] = useState<OrderDynamics>({
    addRate: 45.5,
    cancelRate: 23.2,
    modifyRate: 12.8,
    avgOrderSize: 0.85,
    orderVelocity: 125,
    momentum: 'neutral'
  })
  
  const [orderHistory, setOrderHistory] = useState<{
    timestamp: number
    type: 'add' | 'cancel' | 'modify'
    side: 'bid' | 'ask'
    price: number
    amount: number
  }[]>([
    {
      timestamp: Date.now() - 5000,
      type: 'add',
      side: 'bid',
      price: 98000,
      amount: 0.5
    },
    {
      timestamp: Date.now() - 4000,
      type: 'cancel',
      side: 'ask',
      price: 98100,
      amount: 0.3
    },
    {
      timestamp: Date.now() - 3000,
      type: 'modify',
      side: 'bid',
      price: 97950,
      amount: 1.2
    }
  ])

  // 오더북 변화 추적
  useEffect(() => {
    // orderbook이 없어도 계속 업데이트 진행

    // 이전 오더북과 비교하여 변화 감지 (실제 구현에서는 더 정교한 로직 필요)
    const now = Date.now()
    
    // 더미 다이나믹스 데이터 생성 (실제로는 WebSocket 이벤트에서 계산)
    const randomDynamics: OrderDynamics = {
      addRate: Math.random() * 100,
      cancelRate: Math.random() * 50,
      modifyRate: Math.random() * 30,
      avgOrderSize: orderbook && orderbook.bids?.length > 0 
        ? orderbook.bids.reduce((sum, bid) => sum + bid.amount, 0) / orderbook.bids.length 
        : 0.85,
      orderVelocity: Math.random() * 200,
      momentum: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral'
    }
    
    setDynamics(randomDynamics)
    
    // 주문 히스토리 업데이트
    if (Math.random() > 0.7) {
      const newOrder = {
        timestamp: now,
        type: ['add', 'cancel', 'modify'][Math.floor(Math.random() * 3)] as 'add' | 'cancel' | 'modify',
        side: Math.random() > 0.5 ? 'bid' as const : 'ask' as const,
        price: orderbook?.bids?.[0]?.price || 98000,
        amount: Math.random() * 2
      }
      setOrderHistory(prev => [...prev.slice(-49), newOrder])
    }
  }, [orderbook])

  // 주문 패턴 분석
  const orderPatterns = useMemo(() => {
    const recent = orderHistory.slice(-20)
    const addCount = recent.filter(o => o.type === 'add').length
    const cancelCount = recent.filter(o => o.type === 'cancel').length
    const modifyCount = recent.filter(o => o.type === 'modify').length
    
    return {
      addRatio: addCount / (recent.length || 1) * 100,
      cancelRatio: cancelCount / (recent.length || 1) * 100,
      modifyRatio: modifyCount / (recent.length || 1) * 100,
      totalActivity: recent.length
    }
  }, [orderHistory])

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getMomentumText = (momentum: string) => {
    switch (momentum) {
      case 'bullish': return '강세 모멘텀'
      case 'bearish': return '약세 모멘텀'
      default: return '중립'
    }
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaFireAlt className="text-orange-500" />
          호가창 다이나믹스 분석
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaBolt className="text-yellow-400" />
              주문 추가율
            </div>
            <div className="text-2xl font-bold text-white">
              {dynamics.addRate.toFixed(1)}
              <span className="text-sm text-gray-400 ml-1">/분</span>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaExchangeAlt className="text-red-400" />
              주문 취소율
            </div>
            <div className="text-2xl font-bold text-white">
              {dynamics.cancelRate.toFixed(1)}
              <span className="text-sm text-gray-400 ml-1">/분</span>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaTachometerAlt className="text-blue-400" />
              주문 속도
            </div>
            <div className="text-2xl font-bold text-white">
              {dynamics.orderVelocity.toFixed(0)}
              <span className="text-sm text-gray-400 ml-1">건/분</span>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaChartLine className="text-purple-400" />
              모멘텀
            </div>
            <div className={`text-2xl font-bold ${getMomentumColor(dynamics.momentum)}`}>
              {getMomentumText(dynamics.momentum)}
            </div>
          </div>
        </div>

        {/* 주문 패턴 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <h4 className="text-gray-300 text-sm font-medium mb-3">주문 타입별 비율</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">추가</span>
                <span className="text-green-400">{orderPatterns.addRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500"
                  animate={{ width: `${orderPatterns.addRatio}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">취소</span>
                <span className="text-red-400">{orderPatterns.cancelRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  animate={{ width: `${orderPatterns.cancelRatio}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">수정</span>
                <span className="text-yellow-400">{orderPatterns.modifyRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-500"
                  animate={{ width: `${orderPatterns.modifyRatio}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 최근 주문 활동 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">최근 주문 활동</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {orderHistory.length > 0 ? (
              orderHistory.slice(-10).reverse().map((order, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      order.type === 'add' ? 'bg-green-400' :
                      order.type === 'cancel' ? 'bg-red-400' :
                      'bg-yellow-400'
                    }`} />
                    <span className="text-sm text-gray-300">
                      {order.type === 'add' ? '추가' :
                       order.type === 'cancel' ? '취소' : '수정'}
                    </span>
                    <span className={`text-sm ${order.side === 'bid' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.side === 'bid' ? '매수' : '매도'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      ${order.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.amount.toFixed(4)} BTC
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">주문 활동 대기 중...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 분석 인사이트 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-bold mb-3">다이나믹스 인사이트</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
            <p className="text-gray-300 text-sm">
              현재 주문 추가율이 {dynamics.addRate > 50 ? '높아' : '낮아'} 
              시장 참여자들의 {dynamics.addRate > 50 ? '적극적인' : '소극적인'} 거래 의사를 보여줍니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
            <p className="text-gray-300 text-sm">
              취소율 {dynamics.cancelRate.toFixed(1)}%는 
              {dynamics.cancelRate > 30 ? ' 높은 편으로 시장 불확실성이 존재' : ' 안정적인 수준'}합니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
            <p className="text-gray-300 text-sm">
              주문 속도가 분당 {dynamics.orderVelocity.toFixed(0)}건으로 
              {dynamics.orderVelocity > 100 ? ' 활발한 거래' : ' 보통 수준의 거래'}가 이루어지고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}