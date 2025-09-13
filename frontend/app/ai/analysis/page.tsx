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
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectDelay = 3000

    const connectWebSocket = () => {
      try {
        // Go AI 분석 서비스 WebSocket 연결
        ws = new WebSocket('ws://localhost:8083/ws/analysis')
        
        ws.onopen = () => {
          setIsConnected(true)
          setConnectionError(null)
          reconnectAttempts = 0
          console.log('Connected to AI Analysis Service')
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setAnalysis(data)
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err)
          }
        }
        
        ws.onerror = (error) => {
          console.warn('WebSocket connection error - AI Analysis Service may not be running')
          setConnectionError('AI 분석 서비스에 연결할 수 없습니다. 서비스가 실행 중인지 확인해주세요.')
        }
        
        ws.onclose = () => {
          setIsConnected(false)
          
          // 재연결 시도
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            console.log(`Reconnecting in ${reconnectDelay/1000} seconds... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
            
            reconnectTimer = setTimeout(() => {
              connectWebSocket()
            }, reconnectDelay)
          } else {
            setConnectionError('AI 분석 서비스 연결에 실패했습니다.')
          }
        }
      } catch (err) {
        console.error('Failed to create WebSocket connection:', err)
        setConnectionError('WebSocket 연결을 생성할 수 없습니다.')
      }
    }

    // 초기 연결 시도
    connectWebSocket()

    // 클린업
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
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

  // 샘플 데이터 (서비스 연결 전 표시용)
  const sampleAnalysis: MarketAnalysis = {
    timestamp: new Date().toISOString(),
    market_sentiment: '중립',
    trend_direction: '횡보',
    strength: 52.3,
    predictions: [
      { symbol: 'BTCUSDT', current: 98000, predicted_1h: 98500, predicted_4h: 99000, predicted_1d: 100000, confidence: 72.5, direction: 'UP' },
      { symbol: 'ETHUSDT', current: 3500, predicted_1h: 3480, predicted_4h: 3450, predicted_1d: 3400, confidence: 68.2, direction: 'DOWN' },
      { symbol: 'BNBUSDT', current: 700, predicted_1h: 705, predicted_4h: 710, predicted_1d: 720, confidence: 74.8, direction: 'UP' },
      { symbol: 'SOLUSDT', current: 240, predicted_1h: 242, predicted_4h: 245, predicted_1d: 250, confidence: 71.3, direction: 'UP' }
    ],
    indicators: {
      rsi: { 'BTCUSDT': 65.4, 'ETHUSDT': 48.2, 'BNBUSDT': 58.7, 'SOLUSDT': 72.1 },
      macd: {
        'BTCUSDT': { macd: 2.5, signal: 1.8, histogram: 0.7, trend: 'BULLISH' },
        'ETHUSDT': { macd: -1.2, signal: -0.8, histogram: -0.4, trend: 'BEARISH' },
        'BNBUSDT': { macd: 0.5, signal: 0.3, histogram: 0.2, trend: 'BULLISH' },
        'SOLUSDT': { macd: 3.1, signal: 2.9, histogram: 0.2, trend: 'BULLISH' }
      },
      bollinger_bands: {
        'BTCUSDT': { upper: 99500, middle: 98000, lower: 96500, width: 3000 },
        'ETHUSDT': { upper: 3600, middle: 3500, lower: 3400, width: 200 },
        'BNBUSDT': { upper: 720, middle: 700, lower: 680, width: 40 },
        'SOLUSDT': { upper: 250, middle: 240, lower: 230, width: 20 }
      },
      volume: {
        'BTCUSDT': { current_24h: 1200000, average_7d: 1000000, trend_strength: 68 },
        'ETHUSDT': { current_24h: 800000, average_7d: 750000, trend_strength: 55 },
        'BNBUSDT': { current_24h: 300000, average_7d: 280000, trend_strength: 62 },
        'SOLUSDT': { current_24h: 500000, average_7d: 450000, trend_strength: 70 }
      },
      support_levels: {
        'BTCUSDT': [95000, 92000, 88000],
        'ETHUSDT': [3300, 3200, 3000],
        'BNBUSDT': [680, 660, 640],
        'SOLUSDT': [230, 220, 210]
      },
      resistance_levels: {
        'BTCUSDT': [100000, 102000, 105000],
        'ETHUSDT': [3600, 3700, 3800],
        'BNBUSDT': [720, 740, 760],
        'SOLUSDT': [250, 260, 270]
      }
    },
    opportunities: [
      {
        type: 'BREAKOUT',
        symbol: 'BTCUSDT',
        entry_price: 98500,
        target_price: 102000,
        stop_loss: 97000,
        risk_reward: 2.33,
        confidence: 78.5,
        timeframe: '4H',
        description: '주요 저항선 돌파 시도 중. 거래량 증가 확인'
      },
      {
        type: 'REVERSAL',
        symbol: 'ETHUSDT',
        entry_price: 3450,
        target_price: 3650,
        stop_loss: 3380,
        risk_reward: 2.86,
        confidence: 72.3,
        timeframe: '1D',
        description: '이중 바닥 패턴 완성. RSI 과매도 구간 이탈'
      }
    ],
    risk_level: 'MEDIUM',
    ai_confidence: 75.5
  }

  const displayData = analysis || sampleAnalysis

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
            {isConnected ? 'AI 엔진 연결됨' : 'AI 엔진 연결 대기중'}
          </div>
        </div>

        {/* 연결 오류 메시지 */}
        {connectionError && !isConnected && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <div className="text-yellow-400 font-semibold">서비스 연결 안내</div>
                <div className="text-gray-400 text-sm mt-1">{connectionError}</div>
                <div className="text-gray-500 text-xs mt-2">
                  Go 서비스 실행: <code className="bg-gray-800 px-2 py-1 rounded">cd go-services && start-services.bat</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 실시간/샘플 데이터 표시 */}
        {!isConnected && (
          <div className="mb-4 text-center text-gray-500 text-sm">
            📊 샘플 데이터를 표시하고 있습니다. Go 서비스 연결 시 실시간 데이터로 전환됩니다.
          </div>
        )}
        {/* 데이터 표시 */}
        {displayData && (
          <>
            {/* 시장 개요 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">시장 센티먼트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSentimentColor(displayData.market_sentiment)}`}>
                    {displayData.market_sentiment}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">트렌드 방향</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(displayData.trend_direction)}
                    <span className="text-xl font-bold text-white">
                      {displayData.trend_direction}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    강도: {displayData.strength.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">리스크 레벨</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(displayData.risk_level)}`} />
                    <span className="text-xl font-bold text-white">
                      {displayData.risk_level}
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
                    {displayData.ai_confidence.toFixed(1)}%
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
                  {displayData.predictions.map((pred) => (
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
                  {displayData.opportunities.map((opp, idx) => (
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
                    {Object.entries(displayData.indicators.rsi).map(([symbol, value]) => (
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
                    {Object.entries(displayData.indicators.macd).map(([symbol, data]) => (
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