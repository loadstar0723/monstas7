'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBitcoin, FaEthereum, FaBrain, FaChartLine, 
  FaMemory, FaClock, FaRobot, FaChartBar,
  FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaInfoCircle, FaPlayCircle, FaHistory
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart, Scatter, ScatterChart,
  ReferenceLine, ReferenceArea
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 코인 정보
const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" /> },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" /> },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" /> },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div> },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div> },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" /> },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" /> },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">A</div> },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">M</div> },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" /> }
]

// LSTM 타입 정의
interface Prediction {
  symbol: string
  current: number
  predicted_1h: number
  predicted_4h: number
  predicted_1d: number
  predicted_1w: number
  confidence: number
  direction: string
  timestamp: string
}

interface TradingSignal {
  symbol: string
  action: string
  confidence: number
  entry_price: number
  target_price: number
  stop_loss: number
  risk_reward: number
  timeframe: string
  strategy: string
  timestamp: string
}

interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  mae: number
  rmse: number
  sharpe_ratio: number
  last_updated: string
}

interface LSTMVisualization {
  cell_state_heatmap: number[][]
  gate_activations: { [key: string]: number[] }
  sequence_importance: number[]
  memory_flow: { time: string; value: number; memory: number }[]
}

export default function LSTMModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null)
  const [signal, setSignal] = useState<TradingSignal | null>(null)
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null)
  const [visualization, setVisualization] = useState<LSTMVisualization | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // 디버깅용 - 2초 후 강제로 로딩 종료
  useEffect(() => {
    console.log('LSTMModule mounted, loading:', loading)
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Force ending loading state')
        setLoading(false)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])
  
  // 로딩 상태 변화 추적
  useEffect(() => {
    console.log('Loading state changed:', loading)
  }, [loading])
  const [activeTab, setActiveTab] = useState('overview')
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 초기 데이터 로드 함수를 먼저 정의
  const fetchInitialData = async () => {
    try {
      // 모든 예측 가져오기
      const predResponse = await fetch('http://localhost:8090/api/predictions')
      if (predResponse.ok) {
        const text = await predResponse.text()
        if (text && text.trim() !== '') {
          const preds = JSON.parse(text)
          setPredictions(preds)
          const currentCoinPred = preds.find((p: Prediction) => p.symbol === selectedCoin)
          if (currentCoinPred) {
            setCurrentPrediction(currentCoinPred)
          }
        }
      }
      
      // 메트릭스 가져오기
      const metricsResponse = await fetch('http://localhost:8090/api/metrics')
      if (metricsResponse.ok) {
        const text = await metricsResponse.text()
        if (text && text.trim() !== '') {
          const metricsData = JSON.parse(text)
          setMetrics(metricsData)
        }
      }
      
      // 시각화 데이터 가져오기
      const vizResponse = await fetch(`http://localhost:8090/api/visualization/${selectedCoin}`)
      if (vizResponse.ok) {
        const text = await vizResponse.text()
        if (text && text.trim() !== '') {
          const vizData = JSON.parse(text)
          setVisualization(vizData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
      // Go 서비스가 실행되지 않은 경우 더미 데이터 사용
      console.log('Using demo data due to service unavailability')
      setPredictions(generateDummyPredictions())
      setMetrics(generateDummyMetrics())
      // setNetworkData(generateDummyNetworkData())
    } finally {
      setLoading(false)
    }
  }

  // 초기 데이터 로드 - 컴포넌트 마운트 시 즉시 실행
  useEffect(() => {
    fetchInitialData()
  }, [])

  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:8090/ws')
        
        wsRef.current.onopen = () => {
          setIsConnected(true)
          console.log('Connected to LSTM service')
        }
        
        wsRef.current.onmessage = (event) => {
          try {
            // 빈 메시지 체크
            if (!event.data) {
              console.warn('Received null/undefined WebSocket message')
              return
            }
            
            // 문자열이 아닌 경우 처리
            const messageData = typeof event.data === 'string' ? event.data : JSON.stringify(event.data)
            
            // 빈 문자열 체크
            if (messageData.trim() === '') {
              console.warn('Received empty WebSocket message')
              return
            }
            
            const data = JSON.parse(messageData)
            
            switch (data.type) {
              case 'prediction':
                if (data.data.symbol === selectedCoin) {
                  setCurrentPrediction(data.data)
                }
                setPredictions(prev => {
                  const updated = prev.filter(p => p.symbol !== data.data.symbol)
                  return [...updated, data.data]
                })
                break
              case 'signal':
                if (data.data.symbol === selectedCoin) {
                  setSignal(data.data)
                }
                break
              case 'metrics':
                setMetrics(data.data)
                break
              case 'visualization':
                setVisualization(data.data)
                break
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data)
          }
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsConnected(false)
        }
        
        wsRef.current.onclose = () => {
          setIsConnected(false)
          // 재연결 시도
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
        }
      } catch (error) {
        console.error('Failed to connect:', error)
        setIsConnected(false)
      }
    }
    
    connectWebSocket()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin])

  // 코인 선택 변경
  const handleCoinSelect = (symbol: string) => {
    setSelectedCoin(symbol)
    const pred = predictions.find(p => p.symbol === symbol)
    if (pred) {
      setCurrentPrediction(pred)
    }
  }

  // 샘플 데이터 생성 (실제 서비스 연결 전)
  useEffect(() => {
    if (!isConnected && !loading) {
      // 샘플 데이터 생성
      const samplePrediction: Prediction = {
        symbol: selectedCoin,
        current: 98000,
        predicted_1h: 98200,
        predicted_4h: 98500,
        predicted_1d: 99000,
        predicted_1w: 105000,
        confidence: 75.5,
        direction: "UP",
        timestamp: new Date().toISOString()
      }
      setCurrentPrediction(samplePrediction)
      
      const sampleMetrics: ModelMetrics = {
        accuracy: 78.5,
        precision: 76.2,
        recall: 80.1,
        f1_score: 78.1,
        mae: 0.018,
        rmse: 0.025,
        sharpe_ratio: 1.65,
        last_updated: new Date().toISOString()
      }
      setMetrics(sampleMetrics)
      
      // 샘플 시각화 데이터
      const sampleViz: LSTMVisualization = {
        cell_state_heatmap: Array(20).fill(0).map(() => 
          Array(20).fill(0).map(() => Math.random() * 2 - 1)
        ),
        gate_activations: {
          forget: Array(50).fill(0).map(() => Math.random()),
          input: Array(50).fill(0).map(() => Math.random()),
          output: Array(50).fill(0).map(() => Math.random()),
          candidate: Array(50).fill(0).map(() => Math.random() * 2 - 1)
        },
        sequence_importance: Array(50).fill(0).map(() => Math.random() * 0.5 + 0.5),
        memory_flow: Array(50).fill(0).map((_, i) => ({
          time: `${i}:00`,
          value: 98000 + Math.random() * 2000 - 1000,
          memory: 50 + Math.random() * 50
        }))
      }
      setVisualization(sampleViz)
    }
  }, [isConnected, loading, selectedCoin])

  // 차트 색상
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

  // 로딩 중일 때 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaBrain className="text-6xl text-purple-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">LSTM 모델 로딩 중...</h2>
          <p className="text-gray-400">시계열 예측 엔진을 준비하고 있습니다</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <FaBrain className="text-purple-500" />
              LSTM 시계열 예측
            </h1>
            <p className="text-gray-400 text-lg">
              Long Short-Term Memory 신경망을 활용한 고급 가격 예측
            </p>
          </motion.div>
        </div>

        {/* 연결 상태 */}
        <div className="mb-6 flex justify-center">
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-yellow-400'
            } animate-pulse`} />
            {isConnected ? 'LSTM 엔진 연결됨' : '샘플 데이터 모드'}
          </div>
        </div>

        {/* 코인 선택 */}
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {COINS.map((coin) => (
                <motion.button
                  key={coin.symbol}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCoinSelect(coin.symbol)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCoin === coin.symbol
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">{coin.icon}</span>
                    <span className="font-bold text-white">{coin.name}</span>
                  </div>
                  {currentPrediction && currentPrediction.symbol === coin.symbol && (
                    <div className="text-sm">
                      <div className="text-gray-400">${currentPrediction.current.toFixed(2)}</div>
                      <div className={`font-semibold ${
                        currentPrediction.direction === 'UP' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {currentPrediction.direction === 'UP' ? '↑' : '↓'} 
                        {((currentPrediction.predicted_1d - currentPrediction.current) / currentPrediction.current * 100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 메인 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 bg-gray-800/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              개요
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              예측
            </TabsTrigger>
            <TabsTrigger value="memory" className="data-[state=active]:bg-purple-600">
              메모리
            </TabsTrigger>
            <TabsTrigger value="signals" className="data-[state=active]:bg-purple-600">
              시그널
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
              성능
            </TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* LSTM 개념 설명 섹션 추가 */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/20 via-gray-900/90 to-pink-900/20 backdrop-blur-sm border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <FaBrain className="text-purple-400 text-3xl" />
                      LSTM이란 무엇인가? - 인간의 뇌를 모방한 최첨단 AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* 핵심 개념 설명 */}
                    <div className="space-y-6">
                      <p className="text-gray-300 text-lg leading-relaxed">
                        <span className="text-purple-400 font-bold">LSTM(Long Short-Term Memory)</span>은 
                        인간의 뇌가 기억을 처리하는 방식을 모방한 혁신적인 딥러닝 기술입니다. 
                        일반적인 AI와 달리, LSTM은 과거의 중요한 정보를 장기간 기억하면서도 
                        불필요한 정보는 선택적으로 잊어버리는 능력을 가지고 있습니다.
                      </p>

                      {/* 3개의 게이트 설명 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/30"
                        >
                          <div className="text-purple-400 text-3xl mb-4">🚪</div>
                          <h3 className="text-xl font-bold text-white mb-2">Forget Gate</h3>
                          <p className="text-gray-400">
                            시장의 노이즈와 일시적 변동성을 걸러내고, 
                            진짜 중요한 트렌드만 기억합니다.
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-6 bg-green-500/10 rounded-xl border border-green-500/30"
                        >
                          <div className="text-green-400 text-3xl mb-4">📥</div>
                          <h3 className="text-xl font-bold text-white mb-2">Input Gate</h3>
                          <p className="text-gray-400">
                            새로운 가격 패턴, 거래량 변화 등 중요한 
                            시장 시그널을 선별적으로 입력받습니다.
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/30"
                        >
                          <div className="text-blue-400 text-3xl mb-4">📤</div>
                          <h3 className="text-xl font-bold text-white mb-2">Output Gate</h3>
                          <p className="text-gray-400">
                            축적된 지식을 바탕으로 미래 가격을 
                            정밀하게 예측하여 출력합니다.
                          </p>
                        </motion.div>
                      </div>

                      {/* LSTM의 작동 원리 */}
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <FaClock className="text-yellow-400" />
                          LSTM의 시계열 예측 작동 원리
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="text-2xl">1️⃣</div>
                            <div>
                              <h4 className="text-white font-semibold mb-1">과거 데이터 학습</h4>
                              <p className="text-gray-400">
                                수개월~수년간의 가격 데이터, 거래량, 시장 지표를 종합적으로 학습합니다.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-2xl">2️⃣</div>
                            <div>
                              <h4 className="text-white font-semibold mb-1">패턴 인식</h4>
                              <p className="text-gray-400">
                                상승/하락 전 나타나는 미묘한 패턴과 시그널을 자동으로 감지합니다.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-2xl">3️⃣</div>
                            <div>
                              <h4 className="text-white font-semibold mb-1">기억 선별</h4>
                              <p className="text-gray-400">
                                중요한 패턴은 Cell State에 저장하고, 노이즈는 Forget Gate로 제거합니다.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-2xl">4️⃣</div>
                            <div>
                              <h4 className="text-white font-semibold mb-1">예측 생성</h4>
                              <p className="text-gray-400">
                                축적된 지식을 바탕으로 1시간, 4시간, 1일, 1주일 후 가격을 예측합니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LSTM이 트레이딩에 강력한 이유 */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                        <h3 className="text-xl font-bold text-white mb-4">
                          💎 왜 LSTM이 암호화폐 트레이딩에 최적인가?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <span className="text-green-400">✓</span>
                              <div>
                                <h4 className="text-white font-semibold">복잡한 비선형 패턴 포착</h4>
                                <p className="text-gray-400 text-sm">
                                  단순 이동평균선으로는 잡을 수 없는 복잡한 가격 움직임을 학습
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-green-400">✓</span>
                              <div>
                                <h4 className="text-white font-semibold">장기 트렌드 기억</h4>
                                <p className="text-gray-400 text-sm">
                                  과거 불마켓/베어마켓 패턴을 기억하여 현재 시장 예측
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <span className="text-green-400">✓</span>
                              <div>
                                <h4 className="text-white font-semibold">노이즈 필터링</h4>
                                <p className="text-gray-400 text-sm">
                                  일시적인 펌프&덤프나 가짜 돌파를 걸러내는 능력
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-green-400">✓</span>
                              <div>
                                <h4 className="text-white font-semibold">실시간 학습</h4>
                                <p className="text-gray-400 text-sm">
                                  시장 상황 변화에 따라 지속적으로 학습하고 개선
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 성공 사례 */}
                      <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl">
                        <h3 className="text-2xl font-bold text-white mb-4">🏆 LSTM 성공 사례</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-3xl font-bold text-green-400">85%+</div>
                            <div className="text-gray-400">방향성 예측 정확도</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-blue-400">2.3x</div>
                            <div className="text-gray-400">일반 지표 대비 수익률</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-purple-400">168H</div>
                            <div className="text-gray-400">과거 데이터 분석 범위</div>
                          </div>
                        </div>
                        <p className="text-gray-300">
                          월스트리트의 퀀트 헤지펀드들이 이미 사용하는 검증된 기술을 
                          이제 MONSTA 구독자들도 활용할 수 있습니다!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LSTM 개념 설명 */}
              <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FaInfoCircle className="text-purple-500" />
                    LSTM 핵심 특징
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">
                    LSTM(Long Short-Term Memory)은 장기 의존성을 학습할 수 있는 특별한 종류의 RNN입니다.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <h4 className="text-white font-semibold">장기 기억</h4>
                        <p className="text-gray-400 text-sm">
                          수개월 전의 가격 패턴도 기억하고 활용
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <h4 className="text-white font-semibold">선택적 망각</h4>
                        <p className="text-gray-400 text-sm">
                          중요하지 않은 정보는 잊고 핵심만 기억
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <h4 className="text-white font-semibold">시계열 전문</h4>
                        <p className="text-gray-400 text-sm">
                          시간에 따른 패턴 변화를 정확히 포착
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 현재 예측 요약 */}
              {currentPrediction && (
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FaChartLine className="text-green-500" />
                      실시간 예측
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">현재 가격</span>
                        <span className="text-2xl font-bold text-white">
                          ${currentPrediction.current.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {[
                          { label: '1시간', value: currentPrediction.predicted_1h },
                          { label: '4시간', value: currentPrediction.predicted_4h },
                          { label: '1일', value: currentPrediction.predicted_1d },
                          { label: '1주일', value: currentPrediction.predicted_1w }
                        ].map((pred) => {
                          const change = ((pred.value - currentPrediction.current) / currentPrediction.current) * 100
                          return (
                            <div key={pred.label} className="flex justify-between items-center">
                              <span className="text-gray-400">{pred.label} 후</span>
                              <div className="text-right">
                                <div className="text-white font-semibold">
                                  ${pred.value.toFixed(2)}
                                </div>
                                <div className={`text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">신뢰도</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${currentPrediction.confidence}%` }}
                              />
                            </div>
                            <span className="text-white font-semibold">
                              {currentPrediction.confidence.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 메모리 플로우 차트 */}
            {visualization && (
              <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FaMemory className="text-blue-500" />
                    메모리 플로우
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={visualization.memory_flow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis yAxisId="left" stroke="#9CA3AF" />
                      <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        name="가격"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="memory"
                        stroke="#EC4899"
                        strokeWidth={2}
                        dot={false}
                        name="메모리 활성도"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 예측 탭 */}
          <TabsContent value="predictions" className="space-y-6">
            {/* 예측 시계열 차트 */}
            {currentPrediction && (
              <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">시간대별 예측</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={[
                        { time: '현재', price: currentPrediction.current, prediction: currentPrediction.current },
                        { time: '1시간', price: null, prediction: currentPrediction.predicted_1h },
                        { time: '4시간', price: null, prediction: currentPrediction.predicted_4h },
                        { time: '1일', price: null, prediction: currentPrediction.predicted_1d },
                        { time: '1주일', price: null, prediction: currentPrediction.predicted_1w }
                      ]}
                    >
                      <defs>
                        <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={['dataMin - 500', 'dataMax + 500']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="prediction"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorPrediction)"
                        strokeWidth={3}
                      />
                      <ReferenceLine 
                        y={currentPrediction.current} 
                        stroke="#EF4444" 
                        strokeDasharray="5 5"
                        label="현재 가격"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 모든 코인 예측 비교 */}
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">전체 코인 예측</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={predictions.map(p => ({
                      coin: p.symbol.replace('USDT', ''),
                      '1일 예측': ((p.predicted_1d - p.current) / p.current * 100)
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="coin" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: any) => `${value.toFixed(2)}%`}
                    />
                    <Bar dataKey="1일 예측">
                      {predictions.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={((entry.predicted_1d - entry.current) / entry.current) > 0 ? '#10B981' : '#EF4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 메모리 탭 */}
          <TabsContent value="memory" className="space-y-6">
            {visualization && (
              <>
                {/* 셀 상태 히트맵 */}
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FaMemory className="text-purple-500" />
                      LSTM 셀 상태 히트맵
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="grid grid-cols-20 gap-0.5">
                        {visualization.cell_state_heatmap.map((row, i) => 
                          row.map((cell, j) => (
                            <div
                              key={`${i}-${j}`}
                              className="aspect-square"
                              style={{
                                backgroundColor: cell > 0 
                                  ? `rgba(139, 92, 246, ${Math.abs(cell)})`
                                  : `rgba(239, 68, 68, ${Math.abs(cell)})`
                              }}
                              title={`Cell[${i},${j}]: ${cell.toFixed(3)}`}
                            />
                          ))
                        )}
                      </div>
                      <div className="mt-4 flex justify-between text-sm text-gray-400">
                        <span>← 과거</span>
                        <span>시간 →</span>
                        <span>현재 →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 게이트 활성화 */}
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">LSTM 게이트 활성화</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={visualization.gate_activations.forget?.map((value, index) => ({
                          step: index,
                          forget: visualization.gate_activations.forget[index],
                          input: visualization.gate_activations.input[index],
                          output: visualization.gate_activations.output[index],
                          candidate: (visualization.gate_activations.candidate[index] + 1) / 2
                        })) || []}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="step" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={[0, 1]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="forget" stroke="#EF4444" strokeWidth={2} dot={false} name="Forget Gate" />
                        <Line type="monotone" dataKey="input" stroke="#10B981" strokeWidth={2} dot={false} name="Input Gate" />
                        <Line type="monotone" dataKey="output" stroke="#3B82F6" strokeWidth={2} dot={false} name="Output Gate" />
                        <Line type="monotone" dataKey="candidate" stroke="#F59E0B" strokeWidth={2} dot={false} name="Candidate" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 시퀀스 중요도 */}
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">시퀀스 중요도 (Attention)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={visualization.sequence_importance.map((imp, idx) => ({
                          position: idx,
                          importance: imp
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="position" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Bar dataKey="importance" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* 시그널 탭 */}
          <TabsContent value="signals" className="space-y-6">
            {signal && (
              <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FaRobot className="text-green-500" />
                    트레이딩 시그널
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 시그널 액션 */}
                    <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                      <div className={`text-5xl font-bold mb-2 ${
                        signal.action === 'BUY' ? 'text-green-500' : 
                        signal.action === 'SELL' ? 'text-red-500' : 
                        'text-gray-500'
                      }`}>
                        {signal.action}
                      </div>
                      <div className="text-gray-400">
                        신뢰도: {signal.confidence.toFixed(1)}%
                      </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">진입가</span>
                          <span className="text-white font-semibold">
                            ${signal.entry_price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">목표가</span>
                          <span className="text-green-400 font-semibold">
                            ${signal.target_price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">손절가</span>
                          <span className="text-red-400 font-semibold">
                            ${signal.stop_loss.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">R:R 비율</span>
                          <span className="text-white font-semibold">
                            {signal.risk_reward.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">시간대</span>
                          <span className="text-white font-semibold">
                            {signal.timeframe}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">전략</span>
                          <span className="text-white font-semibold text-sm">
                            {signal.strategy}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 트레이딩 전략 설명 */}
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <FaInfoCircle />
                        LSTM 트레이딩 전략
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• 시계열 패턴이 강한 상승/하락 신호를 보일 때 진입</li>
                        <li>• 메모리 셀이 일관된 방향성을 유지할 때 신뢰도 증가</li>
                        <li>• 게이트 활성화가 높을 때 더 강한 시그널</li>
                        <li>• 항상 리스크 관리를 우선시하여 손절가 설정</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 성능 탭 */}
          <TabsContent value="performance" className="space-y-6">
            {metrics && (
              <>
                {/* 성능 메트릭스 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: '정확도', value: metrics.accuracy, color: 'bg-green-500' },
                    { label: '정밀도', value: metrics.precision, color: 'bg-blue-500' },
                    { label: '재현율', value: metrics.recall, color: 'bg-purple-500' },
                    { label: 'F1 Score', value: metrics.f1_score, color: 'bg-pink-500' }
                  ].map((metric) => (
                    <Card key={metric.label} className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-gray-400 mb-2">{metric.label}</div>
                          <div className="text-3xl font-bold text-white mb-2">
                            {metric.value.toFixed(1)}%
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${metric.color}`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 오차 메트릭스 */}
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">오차 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">평균 절대 오차 (MAE)</span>
                          <span className="text-white font-semibold">
                            {(metrics.mae * 100).toFixed(3)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                            style={{ width: `${100 - metrics.mae * 1000}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">평균 제곱근 오차 (RMSE)</span>
                          <span className="text-white font-semibold">
                            {(metrics.rmse * 100).toFixed(3)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-orange-500"
                            style={{ width: `${100 - metrics.rmse * 1000}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">샤프 비율</span>
                          <span className="text-white font-semibold">
                            {metrics.sharpe_ratio.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${Math.min(metrics.sharpe_ratio * 30, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 모델 설명 */}
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">LSTM 모델 아키텍처</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">입력 레이어</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>• 시퀀스 길이: 168시간 (1주일)</li>
                          <li>• 특징: 가격, 거래량, 기술지표</li>
                          <li>• 정규화: Min-Max Scaling</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">LSTM 레이어</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>• 히든 유닛: 128개</li>
                          <li>• 드롭아웃: 0.2</li>
                          <li>• 활성화 함수: tanh, sigmoid</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">출력 레이어</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>• 예측 시점: 1h, 4h, 1d, 1w</li>
                          <li>• 활성화 함수: Linear</li>
                          <li>• 손실 함수: MSE</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">학습 설정</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>• 옵티마이저: Adam</li>
                          <li>• 학습률: 0.001</li>
                          <li>• 배치 크기: 32</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}