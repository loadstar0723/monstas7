'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AISignal {
  symbol: string
  action: string
  confidence: number
  price: number
  predicted_price: number
  stop_loss: number
  take_profit: number
  timestamp: number
}

interface Performance {
  total_trades: number
  winning_trades: number
  losing_trades: number
  total_profit: number
  win_rate: number
  sharpe_ratio: number
}

export default function AITradingPage() {
  const [signals, setSignals] = useState<AISignal[]>([])
  const [performance, setPerformance] = useState<Performance | null>(null)
  const [positions, setPositions] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Go WebSocket 연결
    const ws = new WebSocket('ws://localhost:8082/ws/status')
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to AI Trading Engine')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.positions) setPositions(Object.values(data.positions))
      if (data.performance) setPerformance(data.performance)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
    
    return () => ws.close()
  }, [])

  const triggerPrediction = async () => {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'BTCUSDT' })
      })
      
      const data = await response.json()
      if (data.signal) {
        setSignals(prev => [data.signal, ...prev].slice(0, 10))
      }
    } catch (error) {
      console.error('Prediction error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          🤖 AI 트레이딩 시스템
        </h1>

        {/* 연결 상태 */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {isConnected ? 'AI 엔진 연결됨' : 'AI 엔진 연결 끊김'}
          </div>
        </div>

        {/* 성과 지표 */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">총 거래</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {performance.total_trades}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">승률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {(performance.win_rate * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">총 수익</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  ${performance.total_profit.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">샤프 비율</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {performance.sharpe_ratio?.toFixed(2) || 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI 예측 트리거 */}
        <div className="mb-8">
          <button
            onClick={triggerPrediction}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            AI 예측 실행
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 AI 신호 */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">최근 AI 신호</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signals.map((signal, i) => (
                  <div key={i} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {signal.symbol}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                            signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {signal.action}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          신뢰도: {(signal.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">
                          ${signal.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          예측: ${signal.predicted_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 활성 포지션 */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">활성 포지션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positions.map((position, i) => (
                  <div key={i} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {position.Symbol}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            position.Side === 'BUY' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {position.Side}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          수량: {position.Quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">
                          진입가: ${position.EntryPrice}
                        </div>
                        <div className="text-xs text-gray-400">
                          SL: ${position.StopLoss} / TP: ${position.TakeProfit}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}