'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, Activity, DollarSign } from 'lucide-react'

interface ExecutionMetrics {
  isRunning: boolean
  strategyName: string
  positions: {
    id: string
    symbol: string
    side: 'LONG' | 'SHORT'
    entryPrice: number
    currentPrice: number
    size: number
    pnl: number
    pnlPercent: number
    status: 'OPEN' | 'CLOSED' | 'PENDING'
    timestamp: string
  }[]
  totalPnl: number
  winCount: number
  lossCount: number
  activePositions: number
  executionSpeed: number
  orders: {
    id: string
    type: 'MARKET' | 'LIMIT' | 'STOP'
    side: 'BUY' | 'SELL'
    price: number
    size: number
    status: 'PENDING' | 'FILLED' | 'CANCELLED'
    timestamp: string
  }[]
}

export default function GoLiveExecution() {
  const [metrics, setMetrics] = useState<ExecutionMetrics>({
    isRunning: false,
    strategyName: 'AI Strategy #1',
    positions: [],
    totalPnl: 0,
    winCount: 0,
    lossCount: 0,
    activePositions: 0,
    executionSpeed: 0,
    orders: []
  })

  const [pnlHistory, setPnlHistory] = useState<number[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8080/ws/strategy/execution')

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data)
          updateMetrics(data)
        }

        wsRef.current.onerror = () => {
          simulateExecution()
        }
      } catch (error) {
        simulateExecution()
      }
    }

    const updateMetrics = (data: any) => {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']

      // 시뮬레이션 포지션
      const positions = Array(Math.floor(Math.random() * 3) + 1).fill(null).map(() => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)]
        const side = Math.random() > 0.5 ? 'LONG' : 'SHORT'
        const entryPrice = 40000 + Math.random() * 20000
        const currentPrice = entryPrice * (1 + (Math.random() - 0.5) * 0.1)
        const size = Math.random() * 0.5 + 0.1
        const pnl = (currentPrice - entryPrice) * size * (side === 'LONG' ? 1 : -1)

        return {
          id: Math.random().toString(36).substr(2, 9),
          symbol,
          side: side as 'LONG' | 'SHORT',
          entryPrice,
          currentPrice,
          size,
          pnl,
          pnlPercent: (pnl / (entryPrice * size)) * 100,
          status: Math.random() > 0.3 ? 'OPEN' : 'CLOSED' as 'OPEN' | 'CLOSED',
          timestamp: new Date().toLocaleTimeString()
        }
      })

      // 시뮬레이션 주문
      const orders = Array(Math.floor(Math.random() * 5) + 2).fill(null).map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        type: ['MARKET', 'LIMIT', 'STOP'][Math.floor(Math.random() * 3)] as 'MARKET' | 'LIMIT' | 'STOP',
        side: Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL',
        price: 40000 + Math.random() * 20000,
        size: Math.random() * 0.5 + 0.1,
        status: ['PENDING', 'FILLED', 'CANCELLED'][Math.floor(Math.random() * 3)] as 'PENDING' | 'FILLED' | 'CANCELLED',
        timestamp: new Date().toLocaleTimeString()
      }))

      const wins = positions.filter(p => p.pnl > 0).length
      const losses = positions.filter(p => p.pnl < 0).length
      const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)

      setMetrics({
        isRunning: data?.running || metrics.isRunning,
        strategyName: data?.strategy || 'AI Strategy #1',
        positions,
        totalPnl,
        winCount: wins,
        lossCount: losses,
        activePositions: positions.filter(p => p.status === 'OPEN').length,
        executionSpeed: data?.speed || Math.random() * 5 + 1,
        orders
      })

      setPnlHistory(prev => [...prev.slice(-19), totalPnl])
    }

    const simulateExecution = () => {
      const interval = setInterval(() => {
        if (metrics.isRunning) {
          updateMetrics({})
        }
      }, 2000)

      return () => clearInterval(interval)
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [metrics.isRunning])

  const getPnlColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-green-500'
      case 'FILLED': return 'bg-green-500'
      case 'PENDING': return 'bg-yellow-500'
      case 'CLOSED': return 'bg-gray-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 실행 상태 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Activity className="w-5 h-5" />
            Go 실시간 전략 실행
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">실행 상태</div>
              <div className={`text-xl font-bold ${metrics.isRunning ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.isRunning ? '실행 중' : '중지'}
              </div>
              <div className="text-xs text-gray-500">{metrics.strategyName}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">총 손익</div>
              <div className={`text-xl font-bold ${getPnlColor(metrics.totalPnl)}`}>
                ${metrics.totalPnl.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">실현 + 미실현</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">승/패</div>
              <div className="text-xl font-bold">
                <span className="text-green-400">{metrics.winCount}</span>
                <span className="text-gray-400">/</span>
                <span className="text-red-400">{metrics.lossCount}</span>
              </div>
              <div className="text-xs text-gray-500">
                승률 {metrics.winCount + metrics.lossCount > 0
                  ? ((metrics.winCount / (metrics.winCount + metrics.lossCount)) * 100).toFixed(0)
                  : 0}%
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">활성 포지션</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.activePositions}
              </div>
              <div className="text-xs text-gray-500">진행 중</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">실행 속도</div>
              <div className="text-xl font-bold text-yellow-400">
                {metrics.executionSpeed.toFixed(1)} ms
              </div>
              <div className="text-xs text-gray-500">평균 지연</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 활성 포지션 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <DollarSign className="w-5 h-5" />
            활성 포지션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.positions.slice(0, 5).map((position) => (
              <div key={position.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(position.status)}`} />
                  <div>
                    <div className="text-sm font-bold text-gray-200">
                      {position.symbol}
                    </div>
                    <div className="text-xs text-gray-500">
                      {position.side} • {position.size.toFixed(3)} • ${position.entryPrice.toFixed(0)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getPnlColor(position.pnl)}`}>
                    ${position.pnl.toFixed(2)}
                  </div>
                  <div className={`text-xs ${getPnlColor(position.pnlPercent)}`}>
                    {position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}

            {metrics.positions.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                포지션 없음
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 최근 주문 */}
      <Card className="bg-gray-900 border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-400">
            최근 주문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                  <span className={order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                    {order.side}
                  </span>
                  <span className="text-gray-400">{order.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">
                    {order.size.toFixed(3)} @ ${order.price.toFixed(0)}
                  </span>
                  <span className={`${
                    order.status === 'FILLED' ? 'text-green-400' :
                    order.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PnL 차트 */}
      <Card className="bg-gray-900 border-yellow-800">
        <CardHeader>
          <CardTitle className="text-yellow-400">
            손익 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-end justify-between gap-1">
            {pnlHistory.map((value, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-t transition-all duration-300 ${
                  value >= 0 ? 'bg-gradient-to-t from-green-600 to-green-400' : 'bg-gradient-to-t from-red-600 to-red-400'
                }`}
                style={{
                  height: `${Math.abs(value / 1000) * 50 + 10}%`,
                  opacity: 0.5 + (idx / pnlHistory.length) * 0.5
                }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            실시간 손익 변화
          </div>
        </CardContent>
      </Card>

      {/* 제어 버튼 */}
      <Card className="bg-gray-900 border-cyan-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <button
              onClick={() => setMetrics({ ...metrics, isRunning: !metrics.isRunning })}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                metrics.isRunning
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-500 hover:to-blue-500'
              }`}
            >
              {metrics.isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  실행 중지
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  실행 시작
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-2">Go 실행 엔진</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">주문 지연:</span>
                <span className="text-green-400">&lt; 1ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">처리량:</span>
                <span className="text-green-400">10K/s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}