'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  FaTree, FaChartBar, FaRocket, FaBrain, FaChartLine,
  FaLayerGroup, FaCogs, FaChartArea, FaTachometerAlt, FaBalanceScale,
  FaNetworkWired, FaCode, FaAtom, FaMagic, FaChessKing
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  ComposedChart, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Brush, ReferenceLine,
  Treemap, Sankey, RadialBarChart, RadialBar, Funnel, FunnelChart
} from 'recharts'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Cone, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// 3D 트리 비주얼라이제이션
function TreeVisualization() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        {/* 트리 구조 */}
        <Cone args={[2, 3, 6]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#10b981" roughness={0.3} />
        </Cone>
        <Cone args={[1.5, 2.5, 6]} position={[0, 1.8, 0]}>
          <meshStandardMaterial color="#22c55e" roughness={0.3} />
        </Cone>
        <Cone args={[1, 2, 6]} position={[0, 3.2, 0]}>
          <meshStandardMaterial color="#34d399" roughness={0.3} />
        </Cone>
        
        {/* 트렁크 */}
        <Box args={[0.5, 1.5, 0.5]} position={[0, -2, 0]}>
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </Box>
        
        {/* 노드들 */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const radius = 1.5
          const height = Math.random() * 3 - 0.5
          return (
            <Sphere key={i} args={[0.1]} position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}>
              <meshStandardMaterial 
                color={['#ef4444', '#f59e0b', '#10b981'][i % 3]} 
                emissive={['#ef4444', '#f59e0b', '#10b981'][i % 3]}
                emissiveIntensity={0.5}
              />
            </Sphere>
          )
        })}
      </group>
    </Float>
  )
}

// 3D 배경 애니메이션
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        
        <TreeVisualization />
        
        {/* 배경 입자들 */}
        {[...Array(50)].map((_, i) => (
          <Float key={i} speed={Math.random() * 2 + 1} floatIntensity={Math.random() + 0.5}>
            <Box
              args={[0.1, 0.1, 0.1]}
              position={[
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10 - 5
              ]}
            >
              <meshStandardMaterial 
                color="#10b981" 
                emissive="#10b981" 
                emissiveIntensity={0.5}
                opacity={0.3}
                transparent
              />
            </Box>
          </Float>
        ))}
      </Canvas>
    </div>
  )
}

// 로딩 컴포넌트
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">XGBoost 앙상블 로딩 중...</p>
        <p className="text-gray-400 text-sm mt-2">부스팅 트리 모델 준비 중</p>
      </div>
    </div>
  )
}

// 플로팅 카드 효과
function FloatingCards() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${30 + Math.random() * 20}s`
          }}
        >
          <div className={`
            w-20 h-20 rounded-lg rotate-45
            ${['bg-green-500/10', 'bg-emerald-500/10', 'bg-teal-500/10'][i % 3]}
            border ${['border-green-500/20', 'border-emerald-500/20', 'border-teal-500/20'][i % 3]}
            backdrop-blur-sm
          `} />
        </div>
      ))}
    </div>
  )
}

// 메인 XGBoost 모듈
export default function XGBoostModule() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [predictions, setPredictions] = useState<any[]>([])
  const [visualization, setVisualization] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결
  useEffect(() => {
    const connectWS = () => {
      try {
        const ws = new WebSocket('ws://localhost:8094/ws')
        
        ws.onopen = () => {
          console.log('XGBoost WebSocket connected')
          setWsConnected(true)
        }
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'prediction':
              setPredictions(prev => [...prev.slice(-99), data.data].filter(Boolean))
              break
            case 'visualization':
              setVisualization(data.data)
              break
            case 'metrics':
              setMetrics(data.data)
              break
          }
        }
        
        ws.onerror = (error) => {
          console.warn('XGBoost WebSocket 연결 실패 - 서비스가 실행 중인지 확인하세요')
          setWsConnected(false)
        }
        
        ws.onclose = () => {
          setWsConnected(false)
          setTimeout(connectWS, 10000)
        }
        
        wsRef.current = ws
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setTimeout(connectWS, 5000)
      }
    }
    
    connectWS()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 모든 예측 가져오기
        const predResponse = await fetch('http://localhost:8094/api/predictions')
        if (predResponse.ok) {
          const preds = await predResponse.json()
          setPredictions(preds)
        }
        
        // 메트릭 가져오기
        const metricsResponse = await fetch('http://localhost:8094/api/metrics')
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData)
        }
        
        // 시각화 데이터 가져오기
        const vizResponse = await fetch(`http://localhost:8094/api/visualization/${selectedCoin}`)
        if (vizResponse.ok) {
          const vizData = await vizResponse.json()
          setVisualization(vizData)
        }
      } catch (error) {
        console.warn('Initial data fetch failed - using demo data')
        // 더미 데이터 설정
        setPredictions(generateDummyPredictions())
        setMetrics(generateDummyMetrics())
        setVisualization(generateDummyVisualization())
      } finally {
        setLoading(false)
      }
    }
    
    fetchInitialData()
  }, [])

  // selectedCoin 변경 시 데이터 다시 로드
  useEffect(() => {
    if (selectedCoin) {
      const fetchInitialData = async () => {
        try {
          const vizResponse = await fetch(`http://localhost:8094/api/visualization/${selectedCoin}`)
          if (vizResponse.ok) {
            const vizData = await vizResponse.json()
            setVisualization(vizData)
          }
        } catch (error) {
          console.warn('Failed to fetch visualization for coin change')
        }
      }
      fetchInitialData()
    }
  }, [selectedCoin])

  // 더미 데이터 생성 함수들
  const generateDummyPredictions = () => {
    return coins.map(coin => ({
      symbol: coin,
      current: coin === 'BTCUSDT' ? 98000 : coin === 'ETHUSDT' ? 3500 : 700,
      predicted1H: coin === 'BTCUSDT' ? 98200 : coin === 'ETHUSDT' ? 3520 : 705,
      predicted4H: coin === 'BTCUSDT' ? 98500 : coin === 'ETHUSDT' ? 3550 : 710,
      predicted1D: coin === 'BTCUSDT' ? 99000 : coin === 'ETHUSDT' ? 3600 : 720,
      predicted1W: coin === 'BTCUSDT' ? 102000 : coin === 'ETHUSDT' ? 3800 : 750,
      confidence: 75 + Math.random() * 15,
      direction: Math.random() > 0.5 ? 'UP' : 'DOWN'
    }))
  }

  const generateDummyMetrics = () => ({
    accuracy: 82.5,
    precision: 80.3,
    recall: 84.7,
    f1Score: 82.4,
    mae: 0.015,
    rmse: 0.022,
    sharpeRatio: 1.65,
    lastUpdated: new Date()
  })

  const generateDummyVisualization = () => ({
    tree_structure: generateTreeStructure(),
    feature_importance: generateFeatureImportance(),
    learning_curve: generateLearningCurve(),
    validation_curve: generateValidationCurve(),
    shap: generateSHAPData(),
    performance: {
      train_score: 0.88,
      valid_score: 0.82,
      rmse: 0.022,
      mae: 0.015,
      r2: 0.82
    }
  })

  const generateTreeStructure = () => {
    return [...Array(5)].map((_, i) => ({
      tree_id: i,
      nodes: [...Array(15)].map((_, j) => ({
        feature: ['price_change_1h', 'volume_ratio', 'rsi', 'momentum'][j % 4],
        threshold: Math.random() * 100,
        gain: Math.random() * 0.1,
        is_leaf: j > 10,
        value: j > 10 ? Math.random() * 0.01 - 0.005 : 0
      })),
      max_depth: 6,
      num_leaves: 8,
      score: 0.85 + Math.random() * 0.1
    }))
  }

  const generateFeatureImportance = () => {
    const features = [
      'price_change_1h', 'volume_ratio', 'rsi', 'macd', 'momentum',
      'volatility', 'trend_strength', 'support_resistance', 'ema_ratio',
      'bollinger_position', 'volume_weighted_price', 'price_position'
    ]
    
    return features.map(feature => ({
      feature,
      importance: Math.random() * 0.8 + 0.2,
      gain: Math.random() * 0.7 + 0.3,
      cover: Math.random() * 0.6 + 0.4,
      frequency: Math.random() * 0.5 + 0.5
    })).sort((a, b) => b.importance - a.importance)
  }

  const generateLearningCurve = () => {
    return [...Array(10)].map((_, i) => ({
      iteration: i * 10,
      train_score: 0.5 + i * 0.04 + Math.random() * 0.02,
      valid_score: 0.48 + i * 0.035 + Math.random() * 0.03,
      time: new Date(Date.now() - (10 - i) * 60000).toLocaleTimeString()
    }))
  }

  const generateValidationCurve = () => {
    return [...Array(50)].map(() => {
      const actual = Math.random() * 0.1 - 0.05
      const predicted = actual + (Math.random() - 0.5) * 0.02
      return {
        actual,
        predicted,
        error: actual - predicted,
        tree_count: 100
      }
    })
  }

  const generateSHAPData = () => ({
    base_value: 0.001,
    feature_values: {
      price_change_1h: 0.012,
      volume_ratio: 1.25,
      rsi: 65.5,
      momentum: 0.008,
      trend_strength: 0.015
    },
    shap_values: {
      price_change_1h: 0.003,
      volume_ratio: -0.001,
      rsi: 0.002,
      momentum: 0.004,
      trend_strength: 0.005
    },
    prediction: 0.013
  })

  const coins = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

  const tabs = [
    { id: 'overview', label: '개요', icon: FaBrain },
    { id: 'trees', label: '트리 구조', icon: FaTree },
    { id: 'importance', label: '특성 중요도', icon: FaChartBar },
    { id: 'predictions', label: '예측', icon: FaRocket },
    { id: 'performance', label: '성능', icon: FaTachometerAlt },
    { id: 'shap', label: 'SHAP 분석', icon: FaBalanceScale }
  ]

  if (loading) {
    return <LoadingComponent />
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 모델 개요 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <FaTree className="text-4xl text-green-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">앙상블 트리</h3>
          <p className="text-3xl font-bold text-green-400">100</p>
          <p className="text-sm text-gray-400 mt-2">그래디언트 부스팅 트리</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <FaLayerGroup className="text-4xl text-blue-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">최대 깊이</h3>
          <p className="text-3xl font-bold text-blue-400">6</p>
          <p className="text-sm text-gray-400 mt-2">트리당 최대 레벨</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <FaCogs className="text-4xl text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">학습률</h3>
          <p className="text-3xl font-bold text-purple-400">0.3</p>
          <p className="text-sm text-gray-400 mt-2">부스팅 학습률</p>
        </div>
      </div>

      {/* 모델 설명 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBrain className="text-green-400" />
          XGBoost란?
        </h3>
        <div className="space-y-4 text-gray-300">
          <p>
            <span className="text-green-400 font-semibold">XGBoost (eXtreme Gradient Boosting)</span>는 
            최고 성능의 머신러닝 알고리즘으로, 캐글 대회에서 가장 많이 사용되는 모델입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">핵심 원리</h4>
              <ul className="space-y-1 text-sm">
                <li>• 그래디언트 부스팅을 통한 순차적 학습</li>
                <li>• 이전 트리의 오류를 다음 트리가 보정</li>
                <li>• 정규화를 통한 과적합 방지</li>
                <li>• 병렬 처리로 빠른 학습 속도</li>
              </ul>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">트레이딩 활용</h4>
              <ul className="space-y-1 text-sm">
                <li>• 가격 변동 예측</li>
                <li>• 특성 중요도 분석</li>
                <li>• 비선형 패턴 포착</li>
                <li>• 높은 예측 정확도</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 예측 현황 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">실시간 예측 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {predictions.slice(0, 5).map((pred, i) => (
            <div key={i} className="text-center">
              <p className="text-sm text-gray-400">{pred.symbol}</p>
              <p className="text-xl font-bold text-white">${pred.current?.toLocaleString() || '0'}</p>
              <p className={`text-sm ${pred.direction === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                {pred.direction === 'UP' ? '↑' : '↓'} {((pred.predicted1D - pred.current) / pred.current * 100).toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTrees = () => {
    const treeData = visualization?.tree_structure || generateTreeStructure()
    
    return (
      <div className="space-y-6">
        {/* 트리 구조 시각화 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">의사결정 트리 구조</h3>
          
          {/* 트리 시각화 */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={treeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="tree_id" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="num_leaves" fill="#10b981" opacity={0.7} name="리프 노드" />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="트리 점수" />
                <Area type="monotone" dataKey="max_depth" fill="#8b5cf6" opacity={0.3} name="깊이" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 개별 트리 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {treeData.slice(0, 3).map((tree, i) => (
              <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">트리 #{tree.tree_id}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">노드 수:</span>
                    <span className="text-white">{tree.nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">리프 노드:</span>
                    <span className="text-white">{tree.num_leaves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">최대 깊이:</span>
                    <span className="text-white">{tree.max_depth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">점수:</span>
                    <span className="text-green-400">{tree.score.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 트리 앙상블 효과 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">앙상블 효과</h3>
          <p className="text-gray-300 mb-4">
            여러 개의 약한 학습기(트리)를 결합하여 강한 예측 모델을 만듭니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">부스팅 과정</h4>
              <div className="space-y-2">
                {[
                  { step: 1, desc: '첫 번째 트리로 기본 예측' },
                  { step: 2, desc: '잔차(오류)를 계산' },
                  { step: 3, desc: '다음 트리가 잔차를 학습' },
                  { step: 4, desc: '예측값을 누적하여 개선' },
                  { step: 5, desc: '100개 트리까지 반복' }
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-sm text-green-400">{item.step}</span>
                    </div>
                    <span className="text-sm text-gray-300">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">성능 향상</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={generateLearningCurve().slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="iteration" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line type="monotone" dataKey="train_score" stroke="#10b981" strokeWidth={2} name="학습" />
                  <Line type="monotone" dataKey="valid_score" stroke="#3b82f6" strokeWidth={2} name="검증" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderImportance = () => {
    const featureData = visualization?.feature_importance || generateFeatureImportance()
    
    return (
      <div className="space-y-6">
        {/* 특성 중요도 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">특성 중요도 분석</h3>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={featureData.slice(0, 10)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis type="category" dataKey="feature" stroke="#9CA3AF" width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="importance" fill="#10b981">
                {featureData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    index === 0 ? '#ef4444' :
                    index === 1 ? '#f59e0b' :
                    index === 2 ? '#10b981' :
                    '#3b82f6'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 특성 상세 정보 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">특성 상세 분석</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">특성</th>
                  <th className="text-right py-2 text-gray-400">중요도</th>
                  <th className="text-right py-2 text-gray-400">게인</th>
                  <th className="text-right py-2 text-gray-400">커버</th>
                  <th className="text-right py-2 text-gray-400">빈도</th>
                </tr>
              </thead>
              <tbody>
                {featureData.slice(0, 8).map((feature, i) => (
                  <tr 
                    key={i} 
                    className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer"
                    onMouseEnter={() => setHoveredFeature(feature.feature)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <td className="py-2 text-white font-medium">{feature.feature}</td>
                    <td className="text-right py-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${feature.importance * 100}%` }}
                          />
                        </div>
                        <span className="text-green-400">{(feature.importance * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="text-right py-2 text-blue-400">{feature.gain.toFixed(3)}</td>
                    <td className="text-right py-2 text-purple-400">{feature.cover.toFixed(3)}</td>
                    <td className="text-right py-2 text-yellow-400">{feature.frequency.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {hoveredFeature && (
            <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-2">{hoveredFeature} 설명</h4>
              <p className="text-sm text-gray-300">
                {getFeatureDescription(hoveredFeature)}
              </p>
            </div>
          )}
        </div>

        {/* 특성 상관관계 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">특성 기여도 분석</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={featureData.slice(0, 6)}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="feature" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              <Radar 
                name="중요도" 
                dataKey="importance" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="게인" 
                dataKey="gain" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.4} 
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderPredictions = () => {
    const currentPred = predictions.find(p => p.symbol === selectedCoin) || {
      symbol: selectedCoin,
      current: 50000,
      predicted1H: 50100,
      predicted4H: 50300,
      predicted1D: 50800,
      predicted1W: 52000,
      confidence: 82.5,
      direction: 'UP'
    }

    return (
      <div className="space-y-6">
        {/* 예측 결과 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <p className="text-sm text-gray-400 mb-1">1시간 후</p>
            <p className="text-2xl font-bold text-blue-400">
              ${currentPred.predicted1H?.toLocaleString() || '0'}
            </p>
            <p className={`text-sm mt-1 ${currentPred.predicted1H > currentPred.current ? 'text-green-400' : 'text-red-400'}`}>
              {currentPred.predicted1H > currentPred.current ? '+' : ''}
              {((currentPred.predicted1H - currentPred.current) / currentPred.current * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <p className="text-sm text-gray-400 mb-1">4시간 후</p>
            <p className="text-2xl font-bold text-purple-400">
              ${currentPred.predicted4H?.toLocaleString() || '0'}
            </p>
            <p className={`text-sm mt-1 ${currentPred.predicted4H > currentPred.current ? 'text-green-400' : 'text-red-400'}`}>
              {currentPred.predicted4H > currentPred.current ? '+' : ''}
              {((currentPred.predicted4H - currentPred.current) / currentPred.current * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <p className="text-sm text-gray-400 mb-1">1일 후</p>
            <p className="text-2xl font-bold text-green-400">
              ${currentPred.predicted1D?.toLocaleString() || '0'}
            </p>
            <p className={`text-sm mt-1 ${currentPred.predicted1D > currentPred.current ? 'text-green-400' : 'text-red-400'}`}>
              {currentPred.predicted1D > currentPred.current ? '+' : ''}
              {((currentPred.predicted1D - currentPred.current) / currentPred.current * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <p className="text-sm text-gray-400 mb-1">1주일 후</p>
            <p className="text-2xl font-bold text-yellow-400">
              ${currentPred.predicted1W?.toLocaleString() || '0'}
            </p>
            <p className={`text-sm mt-1 ${currentPred.predicted1W > currentPred.current ? 'text-green-400' : 'text-red-400'}`}>
              {currentPred.predicted1W > currentPred.current ? '+' : ''}
              {((currentPred.predicted1W - currentPred.current) / currentPred.current * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* 예측 시각화 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">XGBoost 가격 예측</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={[
              { time: '현재', price: currentPred.current },
              { time: '1시간', price: currentPred.predicted1H },
              { time: '4시간', price: currentPred.predicted4H },
              { time: '1일', price: currentPred.predicted1D },
              { time: '1주일', price: currentPred.predicted1W }
            ]}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#priceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 전체 코인 예측 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">전체 코인 예측</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">코인</th>
                  <th className="text-right py-2 text-gray-400">현재가</th>
                  <th className="text-right py-2 text-gray-400">1일 예측</th>
                  <th className="text-right py-2 text-gray-400">변화율</th>
                  <th className="text-right py-2 text-gray-400">신뢰도</th>
                  <th className="text-center py-2 text-gray-400">방향</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-2 text-white font-medium">{pred.symbol}</td>
                    <td className="text-right py-2 text-gray-300">${pred.current?.toLocaleString() || '0'}</td>
                    <td className="text-right py-2 text-blue-400">${pred.predicted1D?.toLocaleString() || '0'}</td>
                    <td className="text-right py-2">
                      <span className={pred.predicted1D > pred.current ? 'text-green-400' : 'text-red-400'}>
                        {pred.predicted1D > pred.current ? '+' : ''}
                        {((pred.predicted1D - pred.current) / pred.current * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right py-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                        <span className="text-green-400">{pred.confidence?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        pred.direction === 'UP' ? 'bg-green-500/20 text-green-400' : 
                        pred.direction === 'DOWN' ? 'bg-red-500/20 text-red-400' : 
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {pred.direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderPerformance = () => {
    const perf = visualization?.performance || generateDummyVisualization().performance
    const validationData = visualization?.validation_curve || generateValidationCurve()
    
    return (
      <div className="space-y-6">
        {/* 성능 지표 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <p className="text-sm text-gray-400 mb-1">R² Score</p>
            <p className="text-2xl font-bold text-green-400">{(perf.r2 * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">설명력</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <p className="text-sm text-gray-400 mb-1">RMSE</p>
            <p className="text-2xl font-bold text-blue-400">{perf.rmse.toFixed(4)}</p>
            <p className="text-xs text-gray-500 mt-1">평균제곱근오차</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <p className="text-sm text-gray-400 mb-1">MAE</p>
            <p className="text-2xl font-bold text-purple-400">{perf.mae.toFixed(4)}</p>
            <p className="text-xs text-gray-500 mt-1">평균절대오차</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <p className="text-sm text-gray-400 mb-1">검증 점수</p>
            <p className="text-2xl font-bold text-yellow-400">{(perf.valid_score * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">교차검증</p>
          </div>
        </div>

        {/* 학습 곡선 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">학습 곡선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visualization?.learning_curve || generateLearningCurve()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="iteration" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="train_score" 
                stroke="#10b981" 
                strokeWidth={2} 
                name="학습 점수" 
              />
              <Line 
                type="monotone" 
                dataKey="valid_score" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                name="검증 점수" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 예측 vs 실제 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">예측 vs 실제</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="actual" stroke="#9CA3AF" name="실제값" />
              <YAxis dataKey="predicted" stroke="#9CA3AF" name="예측값" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value) => value.toFixed(4)}
              />
              <Scatter name="예측" data={validationData} fill="#10b981" opacity={0.6} />
              <ReferenceLine 
                x={-0.05} 
                y={-0.05} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                segment={[{x: -0.05, y: -0.05}, {x: 0.05, y: 0.05}]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 잔차 분석 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">잔차 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={validationData.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
              <Bar dataKey="error" fill="#3b82f6">
                {validationData.slice(0, 30).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.error > 0 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderSHAP = () => {
    const shapData = visualization?.shap || generateSHAPData()
    
    // SHAP 값을 바 차트용 데이터로 변환
    const shapBarData = Object.entries(shapData.shap_values).map(([feature, value]) => ({
      feature,
      value: value as number,
      abs_value: Math.abs(value as number)
    })).sort((a, b) => b.abs_value - a.abs_value)
    
    return (
      <div className="space-y-6">
        {/* SHAP 설명 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaBalanceScale className="text-green-400" />
            SHAP (SHapley Additive exPlanations)
          </h3>
          <p className="text-gray-300 mb-4">
            각 특성이 예측에 미치는 영향을 정량적으로 분석합니다. 
            게임 이론 기반으로 각 특성의 기여도를 공정하게 할당합니다.
          </p>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">기본값 (Base Value)</span>
              <span className="text-lg font-bold text-white">{shapData.base_value.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">최종 예측값</span>
              <span className="text-lg font-bold text-green-400">{shapData.prediction.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* SHAP 값 시각화 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">특성별 SHAP 값</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shapBarData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis type="category" dataKey="feature" stroke="#9CA3AF" width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value) => value.toFixed(4)}
              />
              <Bar dataKey="value">
                {shapBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Waterfall 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">예측 구성 요소</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-sm text-gray-400">기본값</span>
              <span className="text-sm font-bold text-white">{shapData.base_value.toFixed(4)}</span>
            </div>
            
            {shapBarData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.value > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-sm text-gray-300">{item.feature}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    ({shapData.feature_values[item.feature]?.toFixed(2)})
                  </span>
                  <span className={`text-sm font-bold ${item.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.value > 0 ? '+' : ''}{item.value.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <span className="text-sm font-bold text-green-400">최종 예측</span>
              <span className="text-lg font-bold text-green-400">{shapData.prediction.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* 특성 영향 해석 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">예측 해석</h3>
          <div className="space-y-4">
            {shapBarData.slice(0, 3).map((item, i) => (
              <div key={i} className="p-4 bg-gray-700/30 rounded-lg">
                <h4 className="text-sm font-semibold text-green-400 mb-2">{item.feature}</h4>
                <p className="text-sm text-gray-300">
                  현재값: <span className="text-white font-medium">
                    {shapData.feature_values[item.feature]?.toFixed(3)}
                  </span>
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  영향: <span className={`font-medium ${item.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.value > 0 ? '긍정적' : '부정적'} ({item.value > 0 ? '+' : ''}{item.value.toFixed(4)})
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {getFeatureInterpretation(item.feature, item.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getFeatureDescription = (feature: string) => {
    const descriptions: Record<string, string> = {
      'price_change_1h': '지난 1시간 동안의 가격 변화율. 단기 모멘텀을 나타냅니다.',
      'volume_ratio': '현재 거래량과 이전 거래량의 비율. 시장 활성도를 측정합니다.',
      'rsi': 'RSI (Relative Strength Index). 과매수/과매도 상태를 판단합니다.',
      'macd': 'MACD 지표. 추세 전환 신호를 포착합니다.',
      'momentum': '가격 모멘텀. 추세의 강도를 나타냅니다.',
      'volatility': '가격 변동성. 리스크 수준을 측정합니다.',
      'trend_strength': '추세 강도. 현재 추세의 지속 가능성을 평가합니다.',
      'support_resistance': '지지/저항 수준과의 거리. 가격 반전 가능성을 예측합니다.'
    }
    return descriptions[feature] || '이 특성은 모델 예측에 중요한 역할을 합니다.'
  }

  const getFeatureInterpretation = (feature: string, value: number) => {
    const positive = value > 0
    const interpretations: Record<string, { positive: string, negative: string }> = {
      'price_change_1h': {
        positive: '최근 상승 모멘텀이 지속될 가능성이 높습니다.',
        negative: '최근 하락 압력이 계속될 수 있습니다.'
      },
      'volume_ratio': {
        positive: '거래량 증가로 가격 상승 가능성이 높아졌습니다.',
        negative: '거래량 감소로 가격 하락 위험이 있습니다.'
      },
      'momentum': {
        positive: '강한 상승 추세가 형성되고 있습니다.',
        negative: '하락 모멘텀이 강화되고 있습니다.'
      }
    }
    
    const interpretation = interpretations[feature]
    if (interpretation) {
      return positive ? interpretation.positive : interpretation.negative
    }
    
    return positive ? '이 특성이 가격 상승에 기여하고 있습니다.' : '이 특성이 가격 하락 압력을 가하고 있습니다.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <AnimatedBackground />
      <FloatingCards />
      
      <div className="relative z-10 p-4 md:p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            XGBoost 예측 모델
          </h1>
          <p className="text-gray-400">극한의 그래디언트 부스팅으로 암호화폐 가격 예측</p>
        </div>

        {/* 연결 상태 */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            wsConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">{wsConnected ? 'XGBoost 연결됨' : 'XGBoost 연결 끊김'}</span>
          </div>
          
          {metrics && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">정확도:</span>
              <span className="text-green-400 font-semibold">{metrics.accuracy?.toFixed(1)}%</span>
              <span className="text-gray-400">F1:</span>
              <span className="text-blue-400 font-semibold">{metrics.f1Score?.toFixed(1)}%</span>
              <span className="text-gray-400">샤프:</span>
              <span className="text-purple-400 font-semibold">{metrics.sharpeRatio?.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* 코인 선택 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {coins.map(coin => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCoin === coin
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {coin}
            </button>
          ))}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="relative z-10">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'trees' && renderTrees()}
          {activeTab === 'importance' && renderImportance()}
          {activeTab === 'predictions' && renderPredictions()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'shap' && renderSHAP()}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        
        @keyframes float-slow {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-30px) translateX(20px) rotate(180deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}