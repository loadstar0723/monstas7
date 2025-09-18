'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar, BarChart3 } from 'lucide-react'

export default function BacktestPage() {
  const [backtestConfig, setBacktestConfig] = useState({
    symbol: 'BTCUSDT',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialCapital: 10000,
    strategy: 'momentum'
  })

  const [backtestResult, setBacktestResult] = useState({
    totalReturn: 45.67,
    sharpeRatio: 1.85,
    maxDrawdown: -12.34,
    winRate: 62.5,
    totalTrades: 156,
    profitFactor: 2.34
  })

  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 10000 + Math.random() * 5000 - 1000 + i * 150,
    benchmark: 10000 + i * 100
  }))

  const runBacktest = async () => {
    try {
      const response = await fetch('/api/go-backend/trading/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backtestConfig)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Backtest result:', data)
      }
    } catch (error) {
      console.error('Backtest error:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        백테스팅 엔진
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 설정 패널 */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>백테스트 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>심볼</Label>
              <select
                className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded"
                value={backtestConfig.symbol}
                onChange={(e) => setBacktestConfig({ ...backtestConfig, symbol: e.target.value })}
              >
                <option>BTCUSDT</option>
                <option>ETHUSDT</option>
                <option>BNBUSDT</option>
                <option>SOLUSDT</option>
              </select>
            </div>

            <div>
              <Label>시작일</Label>
              <Input
                type="date"
                value={backtestConfig.startDate}
                onChange={(e) => setBacktestConfig({ ...backtestConfig, startDate: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <Label>종료일</Label>
              <Input
                type="date"
                value={backtestConfig.endDate}
                onChange={(e) => setBacktestConfig({ ...backtestConfig, endDate: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <Label>초기 자본금 (USDT)</Label>
              <Input
                type="number"
                value={backtestConfig.initialCapital}
                onChange={(e) => setBacktestConfig({ ...backtestConfig, initialCapital: Number(e.target.value) })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <Label>전략</Label>
              <select
                className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded"
                value={backtestConfig.strategy}
                onChange={(e) => setBacktestConfig({ ...backtestConfig, strategy: e.target.value })}
              >
                <option value="momentum">모멘텀</option>
                <option value="meanReversion">평균회귀</option>
                <option value="breakout">브레이크아웃</option>
                <option value="macd">MACD</option>
                <option value="rsi">RSI</option>
              </select>
            </div>

            <Button onClick={runBacktest} className="w-full bg-purple-600 hover:bg-purple-700">
              백테스트 실행
            </Button>
          </CardContent>
        </Card>

        {/* 결과 차트 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 성과 차트 */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>성과 곡선</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    name="전략 수익"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#6b7280"
                    fill="#6b7280"
                    fillOpacity={0.1}
                    name="벤치마크"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">총 수익률</p>
                    <p className="text-xl font-bold text-green-500">
                      +{backtestResult.totalReturn}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">샤프 비율</p>
                    <p className="text-xl font-bold text-purple-500">
                      {backtestResult.sharpeRatio}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">최대 손실</p>
                    <p className="text-xl font-bold text-red-500">
                      {backtestResult.maxDrawdown}%
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">승률</p>
                    <p className="text-xl font-bold text-blue-500">
                      {backtestResult.winRate}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">총 거래</p>
                    <p className="text-xl font-bold text-gray-300">
                      {backtestResult.totalTrades}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">수익 팩터</p>
                    <p className="text-xl font-bold text-yellow-500">
                      {backtestResult.profitFactor}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}