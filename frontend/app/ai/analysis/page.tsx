'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon } from 'lucide-react'

interface MarketAnalysis {
  timestamp: string
  market_sentiment: string
  trend_direction: string
  strength: number
  predictions: Prediction[]
  indicators: TechnicalIndicators
  opportunities: TradingOpportunity[]
  risk_level: string
  ai_confidence: number
}

interface Prediction {
  symbol: string
  current: number
  predicted_1h: number
  predicted_4h: number
  predicted_1d: number
  confidence: number
  direction: string
}

interface TechnicalIndicators {
  rsi: Record<string, number>
  macd: Record<string, MACDData>
  bollinger_bands: Record<string, BBData>
  volume: Record<string, VolumeData>
  support_levels: Record<string, number[]>
  resistance_levels: Record<string, number[]>
}

interface MACDData {
  macd: number
  signal: number
  histogram: number
  trend: string
}

interface BBData {
  upper: number
  middle: number
  lower: number
  width: number
}

interface VolumeData {
  current_24h: number
  average_7d: number
  trend_strength: number
}

interface TradingOpportunity {
  type: string
  symbol: string
  entry_price: number
  target_price: number
  stop_loss: number
  risk_reward: number
  confidence: number
  timeframe: string
  description: string
}

export default function AIAnalysisPage() {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Go AI 분석 서비스 WebSocket 연결
    const ws = new WebSocket('ws://localhost:8083/ws/analysis')
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to AI Analysis Service')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setAnalysis(data)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
    
    ws.onclose = () => {
      setIsConnected(false)
    }
    
    return () => ws.close()
  }, [])

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      '극도의 공포': 'text-red-600',
      '공포': 'text-red-400',
      '중립': 'text-gray-400',
      '탐욕': 'text-green-400',
      '극도의 탐욕': 'text-green-600'
    }
    return colors[sentiment] || 'text-gray-400'
  }

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      'LOW': 'bg-green-500',
      'MEDIUM': 'bg-yellow-500',
      'HIGH': 'bg-red-500'
    }
    return colors[risk] || 'bg-gray-500'
  }

  const getTrendIcon = (direction: string) => {
    if (direction.includes('상승')) return <TrendingUpIcon className="w-5 h-5 text-green-400" />
    if (direction.includes('하락')) return <TrendingDownIcon className="w-5 h-5 text-red-400" />
    return <ArrowDownIcon className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            🤖 AI 시장 분석
          </h1>
          <div className={`flex items-center px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {isConnected ? 'AI 엔진 연결됨' : 'AI 엔진 연결 끊김'}
          </div>
        </div>

        {analysis && (
          <>
            {/* 시장 개요 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">시장 센티먼트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSentimentColor(analysis.market_sentiment)}`}>
                    {analysis.market_sentiment}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">트렌드 방향</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(analysis.trend_direction)}
                    <span className="text-xl font-bold text-white">
                      {analysis.trend_direction}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    강도: {analysis.strength.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">리스크 레벨</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(analysis.risk_level)}`} />
                    <span className="text-xl font-bold text-white">
                      {analysis.risk_level}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">AI 신뢰도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.ai_confidence.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 가격 예측 */}
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white">AI 가격 예측</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysis.predictions.map((pred) => (
                    <div key={pred.symbol} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-lg font-bold text-white">{pred.symbol}</div>
                          <div className="text-sm text-gray-400">현재: ${pred.current.toFixed(2)}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          pred.direction === 'UP' ? 'bg-green-500/20 text-green-400' :
                          pred.direction === 'DOWN' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pred.direction}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">1시간</span>
                          <span className={pred.predicted_1h > pred.current ? 'text-green-400' : 'text-red-400'}>
                            ${pred.predicted_1h.toFixed(2)} ({((pred.predicted_1h - pred.current) / pred.current * 100).toFixed(2)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">4시간</span>
                          <span className={pred.predicted_4h > pred.current ? 'text-green-400' : 'text-red-400'}>
                            ${pred.predicted_4h.toFixed(2)} ({((pred.predicted_4h - pred.current) / pred.current * 100).toFixed(2)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">1일</span>
                          <span className={pred.predicted_1d > pred.current ? 'text-green-400' : 'text-red-400'}>
                            ${pred.predicted_1d.toFixed(2)} ({((pred.predicted_1d - pred.current) / pred.current * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">신뢰도</span>
                          <div className="flex items-center gap-1">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500"
                                style={{ width: `${pred.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-purple-400">{pred.confidence.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 거래 기회 */}
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white">🎯 AI 추천 거래 기회</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.opportunities.map((opp, idx) => (
                    <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">{opp.symbol}</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              opp.type === 'BREAKOUT' ? 'bg-blue-500/20 text-blue-400' :
                              opp.type === 'REVERSAL' ? 'bg-purple-500/20 text-purple-400' :
                              opp.type === 'MOMENTUM' ? 'bg-green-500/20 text-green-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {opp.type}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{opp.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">신뢰도</div>
                          <div className="text-lg font-bold text-purple-400">{opp.confidence.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-xs text-gray-400">진입가</div>
                          <div className="text-white font-semibold">${opp.entry_price.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">목표가</div>
                          <div className="text-green-400 font-semibold">${opp.target_price.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">손절가</div>
                          <div className="text-red-400 font-semibold">${opp.stop_loss.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">R:R</div>
                          <div className="text-blue-400 font-semibold">{opp.risk_reward.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">시간대</div>
                          <div className="text-white font-semibold">{opp.timeframe}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 기술적 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* RSI */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">RSI 지표</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analysis.indicators.rsi).map(([symbol, value]) => (
                      <div key={symbol} className="flex justify-between items-center">
                        <span className="text-gray-400">{symbol}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                value > 70 ? 'bg-red-500' :
                                value < 30 ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${
                            value > 70 ? 'text-red-400' :
                            value < 30 ? 'text-green-400' :
                            'text-blue-400'
                          }`}>
                            {value.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* MACD */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">MACD 신호</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analysis.indicators.macd).map(([symbol, data]) => (
                      <div key={symbol} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-semibold">{symbol}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            data.trend === 'BULLISH' ? 'bg-green-500/20 text-green-400' :
                            data.trend === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {data.trend}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-400">MACD</div>
                            <div className="text-white">{data.macd.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Signal</div>
                            <div className="text-white">{data.signal.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Histogram</div>
                            <div className={data.histogram > 0 ? 'text-green-400' : 'text-red-400'}>
                              {data.histogram.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}