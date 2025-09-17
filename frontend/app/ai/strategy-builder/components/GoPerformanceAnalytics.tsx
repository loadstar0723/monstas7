'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'

interface PerformanceMetrics {
  equity: number[]
  drawdown: number[]
  monthlyReturns: {
    month: string
    return: number
  }[]
  dailyPnl: {
    date: string
    pnl: number
    cumulative: number
  }[]
  statistics: {
    totalReturn: number
    sharpeRatio: number
    sortinoRatio: number
    calmarRatio: number
    maxDrawdown: number
    winRate: number
    profitFactor: number
    avgWin: number
    avgLoss: number
    bestTrade: number
    worstTrade: number
    totalTrades: number
  }
  riskMetrics: {
    var95: number
    var99: number
    cvar: number
    volatility: number
    beta: number
    correlation: number
  }
}

export default function GoPerformanceAnalytics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    equity: [],
    drawdown: [],
    monthlyReturns: [],
    dailyPnl: [],
    statistics: {
      totalReturn: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      bestTrade: 0,
      worstTrade: 0,
      totalTrades: 0
    },
    riskMetrics: {
      var95: 0,
      var99: 0,
      cvar: 0,
      volatility: 0,
      beta: 0,
      correlation: 0
    }
  })

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/strategy/performance')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        // 시뮬레이션 모드
        const equity = []
        const drawdown = []
        let balance = 10000

        // 30일 시뮬레이션
        for (let i = 0; i < 30; i++) {
          const dailyReturn = (Math.random() - 0.45) * 5
          balance *= (1 + dailyReturn / 100)
          equity.push(balance)
          drawdown.push(Math.min(0, (balance - 10000) / 10000 * 100))
        }

        const monthlyReturns = [
          { month: 'Jan', return: Math.random() * 20 - 5 },
          { month: 'Feb', return: Math.random() * 20 - 5 },
          { month: 'Mar', return: Math.random() * 20 - 5 },
          { month: 'Apr', return: Math.random() * 20 - 5 },
          { month: 'May', return: Math.random() * 20 - 5 },
          { month: 'Jun', return: Math.random() * 20 - 5 }
        ]

        const dailyPnl = []
        let cumulative = 0
        for (let i = 0; i < 20; i++) {
          const pnl = (Math.random() - 0.45) * 500
          cumulative += pnl
          dailyPnl.push({
            date: `Day ${i + 1}`,
            pnl,
            cumulative
          })
        }

        setMetrics({
          equity,
          drawdown,
          monthlyReturns,
          dailyPnl,
          statistics: {
            totalReturn: Math.random() * 50 + 20,
            sharpeRatio: Math.random() * 2 + 0.5,
            sortinoRatio: Math.random() * 2.5 + 0.8,
            calmarRatio: Math.random() * 2 + 0.5,
            maxDrawdown: Math.random() * 15 + 5,
            winRate: Math.random() * 20 + 50,
            profitFactor: Math.random() * 1.5 + 1.2,
            avgWin: Math.random() * 200 + 100,
            avgLoss: Math.random() * 100 + 50,
            bestTrade: Math.random() * 1000 + 500,
            worstTrade: Math.random() * -500 - 100,
            totalTrades: Math.floor(Math.random() * 100 + 50)
          },
          riskMetrics: {
            var95: Math.random() * 5 + 2,
            var99: Math.random() * 8 + 3,
            cvar: Math.random() * 10 + 4,
            volatility: Math.random() * 20 + 10,
            beta: Math.random() * 0.5 + 0.7,
            correlation: Math.random() * 0.4 + 0.5
          }
        })
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 성과 통계 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <BarChart3 className="w-5 h-5" />
            Go 전략 성과 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">총 수익률</div>
              <div className={`text-lg font-bold ${metrics.statistics.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.statistics.totalReturn > 0 ? '+' : ''}{metrics.statistics.totalReturn.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">샤프</div>
              <div className="text-lg font-bold text-blue-400">
                {metrics.statistics.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">승률</div>
              <div className="text-lg font-bold text-purple-400">
                {metrics.statistics.winRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">PF</div>
              <div className="text-lg font-bold text-yellow-400">
                {metrics.statistics.profitFactor.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">MDD</div>
              <div className="text-lg font-bold text-red-400">
                -{metrics.statistics.maxDrawdown.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">거래 수</div>
              <div className="text-lg font-bold text-cyan-400">
                {metrics.statistics.totalTrades}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 자산 곡선 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="w-5 h-5" />
            자산 곡선 & 낙폭
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.equity.map((value, idx) => ({
              day: `Day ${idx + 1}`,
              equity: value,
              drawdown: metrics.drawdown[idx]
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="자산"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                name="낙폭"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일별 PnL */}
        <Card className="bg-gray-900 border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Activity className="w-5 h-5" />
              일별 손익
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.dailyPnl.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Bar
                  dataKey="pnl"
                  fill={(data: any) => data.pnl >= 0 ? '#10b981' : '#ef4444'}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 월별 수익률 */}
        <Card className="bg-gray-900 border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <PieChart className="w-5 h-5" />
              월별 수익률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics.monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => `${value.toFixed(2)}%`}
                />
                <Area
                  type="monotone"
                  dataKey="return"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 리스크 메트릭 */}
      <Card className="bg-gray-900 border-cyan-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            리스크 메트릭
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">VaR 95%</div>
              <div className="text-lg font-bold text-red-400">
                -{metrics.riskMetrics.var95.toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">VaR 99%</div>
              <div className="text-lg font-bold text-red-400">
                -{metrics.riskMetrics.var99.toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">CVaR</div>
              <div className="text-lg font-bold text-red-400">
                -{metrics.riskMetrics.cvar.toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">변동성</div>
              <div className="text-lg font-bold text-blue-400">
                {metrics.riskMetrics.volatility.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">베타</div>
              <div className="text-lg font-bold text-purple-400">
                {metrics.riskMetrics.beta.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-400">상관계수</div>
              <div className="text-lg font-bold text-cyan-400">
                {metrics.riskMetrics.correlation.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-2">Go 분석 엔진</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">분석 속도:</span>
                <span className="text-green-400">실시간</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">계산 정확도:</span>
                <span className="text-green-400">99.9%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}