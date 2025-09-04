'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { motion } from 'framer-motion'
import { FaRobot, FaChartLine, FaBrain, FaSignal } from 'react-icons/fa'

interface Prediction {
  symbol: string
  prediction: string
  confidence: number
  target_price: number
  stop_loss: number
  models_agree: number
  timestamp: string
}

interface MarketAnalysis {
  technical_indicators: any
  sentiment: any
  volume_analysis: any
}

export default function AIDashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [loading, setLoading] = useState(false)
  const [wsData, setWsData] = useState<any>(null)

  useEffect(() => {
    // 초기 데이터 로드
    loadPredictions()
    loadMarketAnalysis(selectedSymbol)

    // WebSocket 연결
    const ws = apiClient.connectWebSocket((data) => {
      setWsData(data)
      if (data.type === 'ai_signal') {
        // 새로운 AI 시그널 받음
        console.log('New AI Signal:', data)
      }
    })

    return () => {
      ws.close()
    }
  }, [selectedSymbol])

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']
      const result = await apiClient.getBatchPredictions(symbols)
      setPredictions(result.predictions)
    } catch (error) {
      console.error('Failed to load predictions:', error)
    }
    setLoading(false)
  }

  const loadMarketAnalysis = async (symbol: string) => {
    try {
      const analysis = await apiClient.getMarketAnalysis(symbol)
      setMarketAnalysis(analysis)
    } catch (error) {
      console.error('Failed to load market analysis:', error)
    }
  }

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'BUY': return 'text-green-400 bg-green-400/20'
      case 'SELL': return 'text-red-400 bg-red-400/20'
      default: return 'text-yellow-400 bg-yellow-400/20'
    }
  }

  const getConfidenceBar = (confidence: number) => {
    const percentage = confidence * 100
    let color = 'bg-red-500'
    if (percentage > 80) color = 'bg-green-500'
    else if (percentage > 60) color = 'bg-yellow-500'
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI 예측 카드들 */}
      <div>
        <h2 className="text-2xl font-bold mb-4 gradient-text">
          <FaRobot className="inline mr-2" />
          AI 실시간 예측
        </h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((pred, index) => (
              <motion.div
                key={pred.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{pred.symbol.replace('USDT', '')}</h3>
                    <p className="text-gray-400 text-sm">
                      {pred.models_agree}/11 모델 동의
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPredictionColor(pred.prediction)}`}>
                    {pred.prediction}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">신뢰도</span>
                      <span>{(pred.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {getConfidenceBar(pred.confidence)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">목표가:</span>
                      <div className="font-bold text-green-400">
                        ${pred.target_price.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">손절가:</span>
                      <div className="font-bold text-red-400">
                        ${pred.stop_loss.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 기술적 분석 */}
      {marketAnalysis && (
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text">
            <FaChartLine className="inline mr-2" />
            기술적 분석 - {selectedSymbol}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* RSI */}
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold mb-2">RSI</h4>
              <div className="text-3xl font-bold mb-2">
                {marketAnalysis.technical_indicators.rsi.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                {marketAnalysis.technical_indicators.rsi > 70 ? '과매수' : 
                 marketAnalysis.technical_indicators.rsi < 30 ? '과매도' : '중립'}
              </div>
            </div>

            {/* MACD */}
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold mb-2">MACD</h4>
              <div className="space-y-1 text-sm">
                <div>Value: {marketAnalysis.technical_indicators.macd.value.toFixed(2)}</div>
                <div>Signal: {marketAnalysis.technical_indicators.macd.signal.toFixed(2)}</div>
                <div className={marketAnalysis.technical_indicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}>
                  Histogram: {marketAnalysis.technical_indicators.macd.histogram.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 볼린저 밴드 */}
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold mb-2">볼린저 밴드</h4>
              <div className="space-y-1 text-sm">
                <div>상단: ${marketAnalysis.technical_indicators.bollinger_bands.upper.toLocaleString()}</div>
                <div>중간: ${marketAnalysis.technical_indicators.bollinger_bands.middle.toLocaleString()}</div>
                <div>하단: ${marketAnalysis.technical_indicators.bollinger_bands.lower.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 시그널 */}
      {wsData && wsData.type === 'ai_signal' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500"
        >
          <h3 className="text-lg font-bold mb-2">
            <FaSignal className="inline mr-2 animate-pulse" />
            새로운 AI 시그널!
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-gray-400">심볼:</span>
              <div className="font-bold">{wsData.data.symbol}</div>
            </div>
            <div>
              <span className="text-gray-400">액션:</span>
              <div className={`font-bold ${wsData.data.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {wsData.data.action}
              </div>
            </div>
            <div>
              <span className="text-gray-400">신뢰도:</span>
              <div className="font-bold">{(wsData.data.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 시장 심리 */}
      {marketAnalysis && (
        <div>
          <h2 className="text-2xl font-bold mb-4 gradient-text">
            <FaBrain className="inline mr-2" />
            시장 심리 분석
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800 text-center">
              <div className="text-4xl mb-2">
                {marketAnalysis.sentiment.overall === 'BULLISH' ? '🐂' : 
                 marketAnalysis.sentiment.overall === 'BEARISH' ? '🐻' : '😐'}
              </div>
              <div className="font-bold">{marketAnalysis.sentiment.overall}</div>
              <div className="text-gray-400 text-sm">전반적 심리</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold mb-2">공포/탐욕 지수</h4>
              <div className="text-3xl font-bold">{marketAnalysis.sentiment.fear_greed_index}</div>
              <div className="text-sm text-gray-400">
                {marketAnalysis.sentiment.fear_greed_index > 70 ? '극도의 탐욕' :
                 marketAnalysis.sentiment.fear_greed_index > 50 ? '탐욕' :
                 marketAnalysis.sentiment.fear_greed_index > 30 ? '중립' :
                 marketAnalysis.sentiment.fear_greed_index > 10 ? '공포' : '극도의 공포'}
              </div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold mb-2">소셜 점수</h4>
              <div className="text-3xl font-bold">
                {(marketAnalysis.sentiment.social_score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">긍정적 언급</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800">
              <h4 className="font-bold mb-2">고래 활동</h4>
              <div className="text-3xl font-bold">{marketAnalysis.volume_analysis.whale_activity}</div>
              <div className="text-sm text-gray-400">
                {marketAnalysis.volume_analysis.whale_activity === 'HIGH' ? '매우 활발' :
                 marketAnalysis.volume_analysis.whale_activity === 'MEDIUM' ? '보통' : '조용'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}