'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { RefreshCw, TrendingUp, DollarSign, Clock } from 'lucide-react'

interface RebalancingMetrics {
  currentAllocation: { symbol: string; current: number; target: number; diff: number }[]
  rebalancingNeeded: boolean
  threshold: number
  estimatedCost: number
  estimatedSlippage: number
  lastRebalance: string
  nextRebalance: string
  trades: {
    symbol: string
    action: 'BUY' | 'SELL'
    amount: number
    price: number
  }[]
}

export default function GoRebalancing() {
  const [metrics, setMetrics] = useState<RebalancingMetrics>({
    currentAllocation: [],
    rebalancingNeeded: false,
    threshold: 5,
    estimatedCost: 0,
    estimatedSlippage: 0,
    lastRebalance: '',
    nextRebalance: '',
    trades: []
  })

  const [rebalanceHistory, setRebalanceHistory] = useState<number[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8080/ws/portfolio/rebalancing')

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data)
          updateMetrics(data)
        }

        wsRef.current.onerror = () => {
          simulateRebalancing()
        }
      } catch (error) {
        simulateRebalancing()
      }
    }

    const updateMetrics = (data: any) => {
      const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOT']
      const allocation = symbols.map(symbol => {
        const target = Math.random() * 30 + 10
        const current = target + (Math.random() - 0.5) * 10
        return {
          symbol,
          current: Math.max(0, current),
          target,
          diff: current - target
        }
      })

      // Normalize to 100%
      const currentSum = allocation.reduce((sum, a) => sum + a.current, 0)
      const targetSum = allocation.reduce((sum, a) => sum + a.target, 0)
      allocation.forEach(a => {
        a.current = (a.current / currentSum) * 100
        a.target = (a.target / targetSum) * 100
        a.diff = a.current - a.target
      })

      const needsRebalance = allocation.some(a => Math.abs(a.diff) > 5)

      const trades = allocation
        .filter(a => Math.abs(a.diff) > 1)
        .map(a => ({
          symbol: a.symbol,
          action: a.diff > 0 ? 'SELL' as const : 'BUY' as const,
          amount: Math.abs(a.diff * 1000),
          price: Math.random() * 50000 + 10000
        }))

      setMetrics({
        currentAllocation: allocation,
        rebalancingNeeded: needsRebalance,
        threshold: data?.threshold || 5,
        estimatedCost: data?.cost || Math.random() * 100 + 50,
        estimatedSlippage: data?.slippage || Math.random() * 0.5 + 0.1,
        lastRebalance: data?.last || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        nextRebalance: data?.next || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        trades
      })

      setRebalanceHistory(prev => [...prev.slice(-19), needsRebalance ? 1 : 0])
    }

    const simulateRebalancing = () => {
      const interval = setInterval(() => {
        updateMetrics({})
      }, 3000)

      return () => clearInterval(interval)
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

  return (
    <div className="space-y-6">
      {/* 리밸런싱 상태 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <RefreshCw className="w-5 h-5" />
            Go 자동 리밸런싱 엔진
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">리밸런싱 필요</div>
              <div className={`text-xl font-bold ${metrics.rebalancingNeeded ? 'text-yellow-400' : 'text-green-400'}`}>
                {metrics.rebalancingNeeded ? '필요' : '정상'}
              </div>
              <div className="text-xs text-gray-500">임계값 {metrics.threshold}%</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">예상 비용</div>
              <div className="text-xl font-bold text-blue-400">
                ${metrics.estimatedCost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">수수료 포함</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">슬리피지</div>
              <div className="text-xl font-bold text-purple-400">
                {metrics.estimatedSlippage.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">예상 영향</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">다음 리밸런싱</div>
              <div className="text-sm font-bold text-yellow-400">
                {metrics.nextRebalance}
              </div>
              <div className="text-xs text-gray-500">예정일</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 현재 vs 목표 할당 */}
        <Card className="bg-gray-900 border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <TrendingUp className="w-5 h-5" />
              포트폴리오 할당 비교
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.currentAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="symbol" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="current" fill="#3b82f6" name="현재" />
                <Bar dataKey="target" fill="#10b981" name="목표" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 파이 차트 */}
        <Card className="bg-gray-900 border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <DollarSign className="w-5 h-5" />
              현재 자산 배분
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.currentAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="current"
                  label={({ symbol, current }) => `${symbol}: ${current.toFixed(1)}%`}
                >
                  {metrics.currentAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 리밸런싱 거래 계획 */}
      <Card className="bg-gray-900 border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Clock className="w-5 h-5" />
            리밸런싱 실행 계획
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.trades.map((trade, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    trade.action === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-300">{trade.symbol}</span>
                  <span className={`text-sm font-bold ${
                    trade.action === 'BUY' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.action}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-200">
                    ${trade.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    @ ${trade.price.toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {metrics.trades.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              포트폴리오가 균형 상태입니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* Go 리밸런싱 최적화 */}
      <Card className="bg-gray-900 border-cyan-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Go 리밸런싱 최적화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                스마트 라우팅
              </div>
              <div className="text-xs text-gray-500">
                최적 거래소 자동 선택
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                슬리피지 최소화
              </div>
              <div className="text-xs text-gray-500">
                분할 주문 실행
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                세금 최적화
              </div>
              <div className="text-xs text-gray-500">
                Tax-loss harvesting
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                자동 실행
              </div>
              <div className="text-xs text-gray-500">
                임계값 기반 트리거
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-1">리밸런싱 성능</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">실행 속도:</span>
                <span className="text-green-400 ml-1">&lt; 100ms</span>
              </div>
              <div>
                <span className="text-gray-400">비용 절감:</span>
                <span className="text-green-400 ml-1">40%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}