'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, TreemapChart, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ReferenceLine, Brush, ComposedChart
} from 'recharts'
import { FaRocket, FaChartLine, FaTree, FaCog, FaBrain, FaChartBar, FaChartArea, FaNetworkWired } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'

// 타입 정의
interface LightGBMPrediction {
  symbol: string
  timestamp: number
  currentPrice: number
  predictions: {
    '1h': number
    '4h': number
    '24h': number
    '7d': number
  }
  confidence: number
  treeStructure: TreeVisualization
  featureImportance: FeatureImportance[]
  gradientInfo: GradientInfo
  leafStats: LeafStatistics[]
  hyperparameters: Hyperparameters
  performanceMetrics: PerformanceMetrics
  modelInsights: ModelInsights
  historicalData: HistoricalDataPoint[]
}

interface TreeVisualization {
  treeId: number
  depth: number
  numLeaves: number
  rootNode: TreeNode
  treeWeight: number
}

interface TreeNode {
  nodeId: number
  feature: string
  threshold: number
  gain: number
  numSamples: number
  value: number
  isLeaf: boolean
  leftChild?: TreeNode
  rightChild?: TreeNode
}

interface FeatureImportance {
  feature: string
  importance: number
  gain: number
  cover: number
  frequency: number
}

interface GradientInfo {
  iterationNum: number
  learningRate: number
  currentLoss: number
  gradientNorm: number
  hessianNorm: number
  convergenceRate: number
}

interface LeafStatistics {
  leafId: number
  numSamples: number
  leafValue: number
  variance: number
  minValue: number
  maxValue: number
}

interface Hyperparameters {
  numIterations: number
  numLeaves: number
  maxDepth: number
  learningRate: number
  featureFraction: number
  baggingFraction: number
  baggingFreq: number
  minDataInLeaf: number
  lambda_l1: number
  lambda_l2: number
}

interface PerformanceMetrics {
  rmse: number
  mae: number
  mape: number
  r2Score: number
  auc: number
  precision: number
  recall: number
}

interface ModelInsights {
  trendDirection: string
  keyDrivers: string[]
  predictionRange: number[]
  confidenceLevel: string
  marketCondition: string
}

interface HistoricalDataPoint {
  timestamp: number
  price: number
  volume: number
  prediction: number
  error: number
}

// WebSocket 데이터 타입
interface WSMessage {
  type: string
  data: LightGBMPrediction
}

// 컬러 팔레트
const COLORS = {
  primary: '#8B5CF6',
  secondary: '#3B82F6', 
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientAlt: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
}

// 페이지 섹션 Enum
enum PageSection {
  Overview = 'overview',
  TreeVisualization = 'tree',
  FeatureImportance = 'features',
  Performance = 'performance',
  Predictions = 'predictions'
}

export default function LightGBMModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [prediction, setPrediction] = useState<LightGBMPrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<PageSection>(PageSection.Overview)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const treeCanvasRef = useRef<HTMLCanvasElement>(null)

  // 초기 데이터 로드
  const fetchInitialData = async () => {
    try {
      const response = await fetch(`http://localhost:8095/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol, interval: '1h', limit: 100 })
      })
      
      if (!response.ok) throw new Error('Failed to fetch prediction')
      
      const data = await response.json()
      setPrediction(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching prediction:', err)
      setError('LightGBM 서비스에 연결할 수 없습니다')
      // 더미 데이터 생성
      generateDummyData()
    } finally {
      setLoading(false)
    }
  }

  // 더미 데이터 생성
  const generateDummyData = () => {
    const currentPrice = 50000 + Math.random() * 10000
    const dummy: LightGBMPrediction = {
      symbol: selectedSymbol,
      timestamp: Date.now() / 1000,
      currentPrice,
      predictions: {
        '1h': currentPrice * (1 + (Math.random() * 0.02 - 0.01)),
        '4h': currentPrice * (1 + (Math.random() * 0.04 - 0.02)),
        '24h': currentPrice * (1 + (Math.random() * 0.08 - 0.04)),
        '7d': currentPrice * (1 + (Math.random() * 0.15 - 0.075))
      },
      confidence: 0.85 + Math.random() * 0.1,
      treeStructure: generateDummyTree(),
      featureImportance: generateDummyFeatureImportance(),
      gradientInfo: {
        iterationNum: 100,
        learningRate: 0.1,
        currentLoss: 0.0234 + Math.random() * 0.01,
        gradientNorm: 0.156 + Math.random() * 0.05,
        hessianNorm: 0.089 + Math.random() * 0.02,
        convergenceRate: 0.98 - Math.random() * 0.05
      },
      leafStats: generateDummyLeafStats(),
      hyperparameters: {
        numIterations: 100,
        numLeaves: 31,
        maxDepth: 6,
        learningRate: 0.1,
        featureFraction: 0.8,
        baggingFraction: 0.7,
        baggingFreq: 5,
        minDataInLeaf: 20,
        lambda_l1: 0.0,
        lambda_l2: 0.0
      },
      performanceMetrics: {
        rmse: 234.56 + Math.random() * 50,
        mae: 189.23 + Math.random() * 40,
        mape: 0.034 + Math.random() * 0.01,
        r2Score: 0.92 + Math.random() * 0.05,
        auc: 0.94 + Math.random() * 0.03,
        precision: 0.91 + Math.random() * 0.05,
        recall: 0.89 + Math.random() * 0.06
      },
      modelInsights: {
        trendDirection: Math.random() > 0.5 ? '상승' : '하락',
        keyDrivers: ['거래량', 'RSI', 'MACD', '볼린저밴드', '이동평균선'],
        predictionRange: [currentPrice * 0.95, currentPrice * 1.05],
        confidenceLevel: '높음',
        marketCondition: '변동성 증가'
      },
      historicalData: generateDummyHistoricalData(currentPrice)
    }
    setPrediction(dummy)
  }

  // 더미 트리 생성
  const generateDummyTree = (): TreeVisualization => {
    const buildTree = (nodeId: number, depth: number, maxDepth: number): TreeNode => {
      if (depth >= maxDepth || Math.random() < 0.3) {
        return {
          nodeId,
          feature: '',
          threshold: 0,
          gain: 0,
          numSamples: Math.floor(Math.random() * 1000) + 100,
          value: Math.random() * 200 - 100,
          isLeaf: true
        }
      }
      
      const features = ['RSI', 'MACD', 'Volume', 'MA_20', 'BB_Upper']
      return {
        nodeId,
        feature: features[Math.floor(Math.random() * features.length)],
        threshold: Math.random() * 100,
        gain: Math.random() * 1000,
        numSamples: Math.floor(Math.random() * 5000) + 1000,
        value: 0,
        isLeaf: false,
        leftChild: buildTree(nodeId * 2 + 1, depth + 1, maxDepth),
        rightChild: buildTree(nodeId * 2 + 2, depth + 1, maxDepth)
      }
    }
    
    return {
      treeId: 1,
      depth: 6,
      numLeaves: 31,
      rootNode: buildTree(0, 0, 6),
      treeWeight: 0.85 + Math.random() * 0.1
    }
  }

  // 더미 특성 중요도 생성
  const generateDummyFeatureImportance = (): FeatureImportance[] => {
    const features = ['RSI', 'MACD', 'Volume', 'MA_20', 'BB_Upper', 'BB_Lower', 
      'EMA_50', 'ATR', 'OBV', 'Stochastic']
    
    return features.map(feature => ({
      feature,
      importance: Math.random(),
      gain: Math.random() * 1000,
      cover: Math.random(),
      frequency: Math.floor(Math.random() * 100) + 10
    })).sort((a, b) => b.importance - a.importance)
  }

  // 더미 리프 통계 생성
  const generateDummyLeafStats = (): LeafStatistics[] => {
    return Array.from({ length: 20 }, (_, i) => {
      const value = Math.random() * 200 - 100
      const variance = Math.random() * 50
      return {
        leafId: i,
        numSamples: Math.floor(Math.random() * 500) + 50,
        leafValue: value,
        variance: variance,
        minValue: value - variance,
        maxValue: value + variance
      }
    })
  }

  // 더미 과거 데이터 생성
  const generateDummyHistoricalData = (currentPrice: number): HistoricalDataPoint[] => {
    return Array.from({ length: 100 }, (_, i) => {
      const price = currentPrice + (Math.random() - 0.5) * 1000 * (100 - i) / 100
      const prediction = price + (Math.random() - 0.5) * 500
      return {
        timestamp: Date.now() / 1000 - (100 - i) * 3600,
        price,
        volume: Math.random() * 1000000,
        prediction,
        error: Math.abs(price - prediction)
      }
    })
  }

  // WebSocket 연결
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`ws://localhost:8095/ws`)
    
    ws.onopen = () => {
      console.log('LightGBM WebSocket connected')
      setError(null)
    }
    
    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        if (message.type === 'prediction' && message.data.symbol === selectedSymbol) {
          setPrediction(message.data)
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }
    
    ws.onerror = (err) => {
      console.warn('WebSocket error:', err)
      setError('실시간 연결 오류')
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      if (autoRefresh && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
      }
    }
    
    wsRef.current = ws
  }

  // 트리 시각화 렌더링
  const renderTree = () => {
    if (!treeCanvasRef.current || !prediction?.treeStructure) return
    
    const canvas = treeCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 트리 그리기 로직
    const drawNode = (node: TreeNode, x: number, y: number, width: number) => {
      const nodeSize = 30
      const lineHeight = 60
      
      // 노드 그리기
      ctx.beginPath()
      ctx.arc(x, y, nodeSize, 0, 2 * Math.PI)
      ctx.fillStyle = node.isLeaf ? COLORS.success : COLORS.primary
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 노드 레이블
      ctx.fillStyle = '#fff'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (node.isLeaf) {
        ctx.fillText(node.value.toFixed(2), x, y)
      } else {
        ctx.fillText(node.feature, x, y)
      }
      
      // 자식 노드 연결
      if (!node.isLeaf && node.leftChild && node.rightChild) {
        const childWidth = width / 2
        const leftX = x - childWidth / 2
        const rightX = x + childWidth / 2
        const childY = y + lineHeight
        
        // 왼쪽 연결선
        ctx.beginPath()
        ctx.moveTo(x, y + nodeSize)
        ctx.lineTo(leftX, childY - nodeSize)
        ctx.strokeStyle = COLORS.secondary
        ctx.lineWidth = 2
        ctx.stroke()
        
        // 오른쪽 연결선
        ctx.beginPath()
        ctx.moveTo(x, y + nodeSize)
        ctx.lineTo(rightX, childY - nodeSize)
        ctx.stroke()
        
        // 재귀적으로 자식 노드 그리기
        drawNode(node.leftChild, leftX, childY, childWidth)
        drawNode(node.rightChild, rightX, childY, childWidth)
      }
    }
    
    // 루트 노드부터 시작
    drawNode(prediction.treeStructure.rootNode, canvas.width / 2, 50, canvas.width - 100)
  }

  // useEffect 훅들
  useEffect(() => {
    fetchInitialData()
  }, [selectedSymbol])

  useEffect(() => {
    if (autoRefresh) {
      connectWebSocket()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [selectedSymbol, autoRefresh])

  useEffect(() => {
    if (activeSection === PageSection.TreeVisualization) {
      setTimeout(renderTree, 100)
    }
  }, [activeSection, prediction])

  // 차트 데이터 준비
  const predictionChartData = useMemo(() => {
    if (!prediction) return []
    
    return Object.entries(prediction.predictions).map(([time, value]) => ({
      time,
      value,
      current: prediction.currentPrice,
      difference: ((value - prediction.currentPrice) / prediction.currentPrice * 100).toFixed(2)
    }))
  }, [prediction])

  const featureImportanceData = useMemo(() => {
    if (!prediction) return []
    
    return prediction.featureImportance.slice(0, 10).map(f => ({
      ...f,
      importancePercent: (f.importance * 100).toFixed(2)
    }))
  }, [prediction])

  const historicalChartData = useMemo(() => {
    if (!prediction) return []
    
    return prediction.historicalData.map(d => ({
      time: new Date(d.timestamp * 1000).toLocaleTimeString(),
      price: d.price,
      prediction: d.prediction,
      error: d.error,
      volume: d.volume / 1000000
    }))
  }, [prediction])

  const performanceRadarData = useMemo(() => {
    if (!prediction) return []
    
    const metrics = prediction.performanceMetrics
    return [
      { metric: 'RMSE', value: (100 - metrics.rmse / 10).toFixed(1), fullMark: 100 },
      { metric: 'MAE', value: (100 - metrics.mae / 10).toFixed(1), fullMark: 100 },
      { metric: 'R²', value: (metrics.r2Score * 100).toFixed(1), fullMark: 100 },
      { metric: 'AUC', value: (metrics.auc * 100).toFixed(1), fullMark: 100 },
      { metric: 'Precision', value: (metrics.precision * 100).toFixed(1), fullMark: 100 },
      { metric: 'Recall', value: (metrics.recall * 100).toFixed(1), fullMark: 100 }
    ]
  }, [prediction])

  const leafDistributionData = useMemo(() => {
    if (!prediction) return []
    
    return prediction.leafStats.map(leaf => ({
      leafId: `Leaf ${leaf.leafId}`,
      samples: leaf.numSamples,
      value: leaf.leafValue,
      variance: leaf.variance
    }))
  }, [prediction])

  // 렌더링
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaRocket className="text-6xl text-purple-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">LightGBM 모델 로딩 중...</h2>
          <p className="text-gray-400">Light Gradient Boosting Machine 준비 중</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <FaRocket className="text-4xl text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">LightGBM 예측 모델</h1>
              <p className="text-gray-400">Light Gradient Boosting Machine - 초고속 그래디언트 부스팅</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
            </select>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {autoRefresh ? '실시간 ON' : '실시간 OFF'}
            </button>
          </div>
        </div>

        {/* 섹션 탭 */}
        <div className="flex gap-2 mb-6">
          {Object.values(PageSection).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === section
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {section === PageSection.Overview && '개요'}
              {section === PageSection.TreeVisualization && '트리 구조'}
              {section === PageSection.FeatureImportance && '특성 중요도'}
              {section === PageSection.Performance && '성능 지표'}
              {section === PageSection.Predictions && '예측 분석'}
            </button>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* 컨텐츠 영역 */}
      <AnimatePresence mode="wait">
        {activeSection === PageSection.Overview && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 핵심 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-900/30 to-purple-600/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
              >
                <FaChartLine className="text-3xl text-purple-400 mb-2" />
                <h3 className="text-gray-300 text-sm">현재 가격</h3>
                <p className="text-2xl font-bold text-white">
                  ${prediction?.currentPrice.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-600/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
              >
                <FaBrain className="text-3xl text-blue-400 mb-2" />
                <h3 className="text-gray-300 text-sm">예측 신뢰도</h3>
                <p className="text-2xl font-bold text-white">
                  {(prediction?.confidence * 100).toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-900/30 to-green-600/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
              >
                <FaTree className="text-3xl text-green-400 mb-2" />
                <h3 className="text-gray-300 text-sm">트리 개수</h3>
                <p className="text-2xl font-bold text-white">
                  {prediction?.hyperparameters.numIterations}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-900/30 to-orange-600/30 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30"
              >
                <FaCog className="text-3xl text-orange-400 mb-2" />
                <h3 className="text-gray-300 text-sm">학습률</h3>
                <p className="text-2xl font-bold text-white">
                  {prediction?.hyperparameters.learningRate}
                </p>
              </motion.div>
            </div>

            {/* 예측 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-purple-400" />
                가격 예측
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predictionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]}>
                    {predictionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        parseFloat(entry.difference) > 0 ? COLORS.success : COLORS.danger
                      } />
                    ))}
                  </Bar>
                  <ReferenceLine y={prediction?.currentPrice} stroke={COLORS.warning} strokeDasharray="5 5" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 모델 인사이트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">모델 인사이트</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">트렌드 방향</p>
                  <p className={`text-lg font-semibold ${
                    prediction?.modelInsights.trendDirection === '상승' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {prediction?.modelInsights.trendDirection}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">시장 상태</p>
                  <p className="text-lg font-semibold text-orange-400">
                    {prediction?.modelInsights.marketCondition}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">예측 범위</p>
                  <p className="text-lg font-semibold text-blue-400">
                    ${prediction?.modelInsights.predictionRange[0].toLocaleString()} - 
                    ${prediction?.modelInsights.predictionRange[1].toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">주요 동인</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prediction?.modelInsights.keyDrivers.map((driver, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm">
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeSection === PageSection.TreeVisualization && (
          <motion.div
            key="tree"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaNetworkWired className="text-purple-400" />
                의사결정 트리 구조
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <canvas
                  ref={treeCanvasRef}
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">트리 깊이</p>
                  <p className="text-2xl font-bold text-white">{prediction?.treeStructure.depth}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">리프 노드 수</p>
                  <p className="text-2xl font-bold text-white">{prediction?.treeStructure.numLeaves}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">트리 가중치</p>
                  <p className="text-2xl font-bold text-white">
                    {(prediction?.treeStructure.treeWeight * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 리프 분포 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">리프 노드 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={leafDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="leafId" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="samples"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="variance"
                    stroke={COLORS.secondary}
                    fill={COLORS.secondary}
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {activeSection === PageSection.FeatureImportance && (
          <motion.div
            key="features"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-purple-400" />
                특성 중요도 분석
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureImportanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="feature" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar dataKey="importance" fill={COLORS.primary} radius={[0, 8, 8, 0]}>
                    {featureImportanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index < 3 ? COLORS.danger : index < 6 ? COLORS.warning : COLORS.primary
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 특성 상세 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureImportanceData.slice(0, 6).map((feature, index) => (
                <motion.div
                  key={feature.feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-white">{feature.feature}</h4>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      index < 2 ? 'bg-red-900/50 text-red-300' :
                      index < 4 ? 'bg-orange-900/50 text-orange-300' :
                      'bg-purple-900/50 text-purple-300'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">중요도</p>
                      <p className="text-white font-medium">{feature.importancePercent}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Gain</p>
                      <p className="text-white font-medium">{feature.gain.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Cover</p>
                      <p className="text-white font-medium">{(feature.cover * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">빈도</p>
                      <p className="text-white font-medium">{feature.frequency}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === PageSection.Performance && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 성능 레이더 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartArea className="text-purple-400" />
                모델 성능 지표
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 그래디언트 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">그래디언트 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">반복 횟수</span>
                    <span className="text-white font-medium">
                      {prediction?.gradientInfo.iterationNum}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">현재 손실</span>
                    <span className="text-white font-medium">
                      {prediction?.gradientInfo.currentLoss.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">그래디언트 노름</span>
                    <span className="text-white font-medium">
                      {prediction?.gradientInfo.gradientNorm.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">헤시안 노름</span>
                    <span className="text-white font-medium">
                      {prediction?.gradientInfo.hessianNorm.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">수렴률</span>
                    <span className="text-green-400 font-medium">
                      {(prediction?.gradientInfo.convergenceRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">하이퍼파라미터</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">리프 수</span>
                    <span className="text-white font-medium">
                      {prediction?.hyperparameters.numLeaves}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">최대 깊이</span>
                    <span className="text-white font-medium">
                      {prediction?.hyperparameters.maxDepth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">특성 샘플링</span>
                    <span className="text-white font-medium">
                      {(prediction?.hyperparameters.featureFraction * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">배깅 비율</span>
                    <span className="text-white font-medium">
                      {(prediction?.hyperparameters.baggingFraction * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">최소 데이터</span>
                    <span className="text-white font-medium">
                      {prediction?.hyperparameters.minDataInLeaf}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeSection === PageSection.Predictions && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 과거 데이터 vs 예측 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-400" />
                실제 vs 예측 비교
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={historicalChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Legend />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    fill={COLORS.secondary}
                    fillOpacity={0.3}
                    stroke="none"
                    name="거래량(M)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="price"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    name="실제 가격"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="prediction"
                    stroke={COLORS.warning}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="예측 가격"
                  />
                  <Brush dataKey="time" height={30} stroke={COLORS.primary} />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 예측 정확도 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-900/30 to-purple-600/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 text-center"
              >
                <h4 className="text-lg font-semibold text-white mb-2">RMSE</h4>
                <p className="text-3xl font-bold text-purple-400">
                  {prediction?.performanceMetrics.rmse.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-1">평균 제곱근 오차</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-600/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 text-center"
              >
                <h4 className="text-lg font-semibold text-white mb-2">MAE</h4>
                <p className="text-3xl font-bold text-blue-400">
                  {prediction?.performanceMetrics.mae.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-1">평균 절대 오차</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-green-900/30 to-green-600/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 text-center"
              >
                <h4 className="text-lg font-semibold text-white mb-2">R² Score</h4>
                <p className="text-3xl font-bold text-green-400">
                  {prediction?.performanceMetrics.r2Score.toFixed(3)}
                </p>
                <p className="text-sm text-gray-400 mt-1">결정 계수</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}