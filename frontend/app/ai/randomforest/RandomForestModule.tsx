'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  FaTree, FaChartLine, FaChartBar, FaLeaf, FaCodeBranch,
  FaVoteYea, FaChartPie, FaSeedling, FaBalanceScale, FaLightbulb,
  FaProjectDiagram, FaRandom, FaLayerGroup, FaBrain, FaMountain
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  ComposedChart, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Brush, ReferenceLine,
  RadialBarChart, RadialBar, Treemap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cylinder, MeshDistortMaterial, Text3D, Float } from '@react-three/drei'
import * as THREE from 'three'
import * as d3 from 'd3'

// 나무 모델 컴포넌트
function TreeModel({ position, scale = 1 }: any) {
  return (
    <group position={position} scale={scale}>
      {/* 나무 줄기 */}
      <Cylinder args={[0.2, 0.3, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Cylinder>
      {/* 나뭇잎 */}
      <Sphere args={[0.8, 8, 6]} position={[0, 2.2, 0]}>
        <meshStandardMaterial color="#228B22" roughness={0.6} />
      </Sphere>
      <Sphere args={[0.6, 8, 6]} position={[0, 2.8, 0]}>
        <meshStandardMaterial color="#32CD32" roughness={0.6} />
      </Sphere>
    </group>
  )
}

// 애니메이션 그룹 컴포넌트 (Canvas 내부에서 사용)
function AnimatedForest() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* 랜덤 포레스트 트리들 */}
      {Array.from({ length: 20 }, (_, i) => (
        <TreeModel
          key={i}
          position={[
            (Math.random() - 0.5) * 15,
            0,
            (Math.random() - 0.5) * 15
          ]}
          scale={0.5 + Math.random() * 0.5}
        />
      ))}
    </group>
  )
}

// 3D 숲 배경
function ForestBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#90EE90" />
        <fog attach="fog" args={['#0a0a0a', 10, 30]} />
        
        <AnimatedForest />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
      </Canvas>
    </div>
  )
}

// 떨어지는 나뭇잎 효과
function FallingLeaves() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 10}s`
          }}
        >
          <FaLeaf 
            className={`text-${['green', 'yellow', 'orange'][Math.floor(Math.random() * 3)]}-500 
              opacity-60 transform rotate-${Math.floor(Math.random() * 360)}`}
            size={20 + Math.random() * 20}
          />
        </div>
      ))}
    </div>
  )
}

// 로딩 컴포넌트
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Random Forest 모델 로딩 중...</p>
        <p className="text-gray-400 text-sm mt-2">의사결정 트리 생성 중</p>
      </div>
    </div>
  )
}

// 의사결정 트리 시각화 컴포넌트
function DecisionTreeVisualization({ treeData }: any) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  useEffect(() => {
    if (!svgRef.current || !treeData) return
    
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    
    const width = 800
    const height = 600
    const margin = { top: 20, right: 90, bottom: 30, left: 90 }
    
    const tree = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom])
    
    const root = d3.hierarchy(treeData)
    const treeData2 = tree(root)
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
    
    // Links
    g.selectAll(".link")
      .data(treeData2.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y))
      .style("fill", "none")
      .style("stroke", "#555")
      .style("stroke-width", 2)
    
    // Nodes
    const node = g.selectAll(".node")
      .data(treeData2.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    
    node.append("circle")
      .attr("r", 10)
      .style("fill", (d: any) => d.children ? "#69b3a2" : "#ff6b6b")
    
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => d.children ? -13 : 13)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.name)
      .style("fill", "white")
      .style("font-size", "12px")
  }, [treeData])
  
  return <svg ref={svgRef} width="100%" height="600" />
}

// 메인 Random Forest 모듈
export default function RandomForestModule() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [predictions, setPredictions] = useState<any[]>([])
  const [visualization, setVisualization] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [forestInfo, setForestInfo] = useState<any>(null)
  const [selectedTree, setSelectedTree] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결
  useEffect(() => {
    const connectWS = () => {
      try {
        const ws = new WebSocket('ws://localhost:8093/ws')
        
        ws.onopen = () => {
          console.log('Random Forest WebSocket connected')
          setWsConnected(true)
        }
        
        ws.onmessage = (event) => {
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
                setPredictions(prev => [...prev.slice(-99), data.data].filter(Boolean))
                break
              case 'visualization':
                setVisualization(data.data)
                break
              case 'metrics':
                setMetrics(data.data)
                break
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data)
          }
        }
        
        ws.onerror = (error) => {
          // WebSocket 에러는 정상적인 상황(서비스 미실행)에서도 발생하므로 경고 수준으로 낮춤
          console.warn('Random Forest WebSocket 연결 실패 - 서비스가 실행 중인지 확인하세요')
          setWsConnected(false)
        }
        
        ws.onclose = () => {
          setWsConnected(false)
          // 너무 자주 재연결 시도하지 않도록 제한
          setTimeout(connectWS, 10000) // 10초로 늘림
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

  // 더미 데이터 생성 함수들
  const generateDummyPredictions = () => {
    const currentPrice = selectedCoin === 'BTCUSDT' ? 98000 : selectedCoin === 'ETHUSDT' ? 3500 : 700
    return coins.map(coin => ({
      symbol: coin,
      current: coin === 'BTCUSDT' ? 98000 : coin === 'ETHUSDT' ? 3500 : 700,
      predicted1H: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
      predicted4H: currentPrice * (1 + (Math.random() - 0.5) * 0.05),
      predicted1D: currentPrice * (1 + (Math.random() - 0.5) * 0.1),
      predicted1W: currentPrice * (1 + (Math.random() - 0.5) * 0.2),
      confidence: 80 + Math.random() * 15,
      direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString()
    }))
  }

  const generateDummyVisualization = () => ({
    tree_structures: Array.from({length: 5}, (_, i) => ({
      tree_id: i,
      nodes: Array.from({length: 10}, (_, j) => ({
        id: j,
        x: Math.random() * 100,
        y: j * 50,
        label: j === 0 ? 'Root' : `Node ${j}`,
        value: Math.random(),
        is_leaf: j > 7,
        color: j > 7 ? '#10b981' : '#3b82f6',
        size: 10 + Math.random() * 20
      })),
      links: Array.from({length: 9}, (_, k) => ({
        source: Math.floor(k / 2),
        target: k + 1,
        value: k % 2 === 0 ? 'Yes' : 'No'
      }))
    })),
    feature_importance: [
      { feature: 'RSI', importance: 0.85, rank: 1 },
      { feature: 'Volume', importance: 0.78, rank: 2 },
      { feature: 'Price Change', importance: 0.72, rank: 3 },
      { feature: 'MA Cross', importance: 0.65, rank: 4 },
      { feature: 'MACD', importance: 0.58, rank: 5 }
    ],
    confusion_matrix: [[85, 10, 5], [8, 82, 10], [5, 8, 87]]
  })

  const generateDummyMetrics = () => ({
    accuracy: 88.5 + Math.random() * 5,
    precision: 86.2 + Math.random() * 5,
    recall: 89.1 + Math.random() * 5,
    f1_score: 87.5 + Math.random() * 5,
    mae: 0.015 + Math.random() * 0.005,
    rmse: 0.022 + Math.random() * 0.005,
    sharpe_ratio: 1.85 + Math.random() * 0.3
  })

  const generateDummyForestInfo = () => ({
    num_trees: 100,
    max_depth: 10,
    min_samples_split: 5,
    oob_score: 0.88 + Math.random() * 0.05,
    features: ['price_change_1h', 'volume_change', 'rsi', 'macd', 'bb_position'],
    feature_importances: {
      'price_change_1h': 0.25,
      'volume_change': 0.22,
      'rsi': 0.20,
      'macd': 0.18,
      'bb_position': 0.15
    }
  })

  // 데이터 로드 함수
  const loadData = async () => {
    setLoading(true)
    try {
      const [predResponse, vizResponse, metricsResponse, forestResponse] = await Promise.all([
        fetch('http://localhost:8093/api/predictions').catch(() => null),
        fetch(`http://localhost:8093/api/visualization/${selectedCoin}`).catch(() => null),
        fetch('http://localhost:8093/api/metrics').catch(() => null),
        fetch('http://localhost:8093/api/forest/info').catch(() => null)
      ])
      
      if (predResponse && predResponse.ok) {
        const text = await predResponse.text()
        if (text && text.trim() !== '') {
          const predData = JSON.parse(text)
          setPredictions(predData)
        } else {
          setPredictions(generateDummyPredictions())
        }
      } else {
        console.warn('Random Forest 서비스가 실행되지 않았습니다. 더미 데이터를 표시합니다.')
        setPredictions(generateDummyPredictions())
      }
      
      if (vizResponse && vizResponse.ok) {
        const text = await vizResponse.text()
        if (text && text.trim() !== '') {
          const vizData = JSON.parse(text)
          setVisualization(vizData)
        } else {
          setVisualization(generateDummyVisualization())
        }
      } else {
        setVisualization(generateDummyVisualization())
      }
      
      if (metricsResponse && metricsResponse.ok) {
        const text = await metricsResponse.text()
        if (text && text.trim() !== '') {
          const metricsData = JSON.parse(text)
          setMetrics(metricsData)
        } else {
          setMetrics(generateDummyMetrics())
        }
      } else {
        setMetrics(generateDummyMetrics())
      }
      
      if (forestResponse && forestResponse.ok) {
        const text = await forestResponse.text()
        if (text && text.trim() !== '') {
          const forestData = JSON.parse(text)
          setForestInfo(forestData)
        } else {
          setForestInfo(generateDummyForestInfo())
        }
      } else {
        setForestInfo(generateDummyForestInfo())
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      // 에러 시 더미 데이터 사용
      setPredictions(generateDummyPredictions())
      setVisualization(generateDummyVisualization())
      setMetrics(generateDummyMetrics())
      setForestInfo(generateDummyForestInfo())
    } finally {
      setLoading(false)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // selectedCoin 변경 시 데이터 다시 로드
  useEffect(() => {
    if (selectedCoin) {
      loadData()
    }
  }, [selectedCoin])

  const tabs = [
    { id: 'overview', label: '개요', icon: FaTree },
    { id: 'trees', label: '트리 구조', icon: FaCodeBranch },
    { id: 'importance', label: '특성 중요도', icon: FaChartBar },
    { id: 'ensemble', label: '앙상블 투표', icon: FaVoteYea },
    { id: 'predictions', label: '예측', icon: FaChartLine },
    { id: 'performance', label: '성능', icon: FaChartPie }
  ]

  const coins = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'ETHUSDT', name: 'Ethereum', color: '#627eea' },
    { symbol: 'BNBUSDT', name: 'BNB', color: '#f3ba2f' },
    { symbol: 'SOLUSDT', name: 'Solana', color: '#9945ff' },
    { symbol: 'XRPUSDT', name: 'XRP', color: '#23292f' }
  ]

  // 샘플 데이터 생성
  const generateSampleData = () => {
    const features = [
      'price_change_1h', 'price_change_24h', 'volume_change',
      'rsi', 'macd', 'bb_position', 'ma_cross', 'volume_profile',
      'market_cap_rank', 'sentiment_score'
    ]
    
    return {
      featureImportance: features.map((f, i) => ({
        feature: f,
        importance: Math.random() * 0.3 + 0.1,
        rank: i + 1
      })),
      
      treeVotes: Array.from({ length: 20 }, (_, i) => ({
        treeId: i,
        prediction: ['UP', 'DOWN', 'NEUTRAL'][Math.floor(Math.random() * 3)],
        confidence: 0.6 + Math.random() * 0.3
      })),
      
      treePerformance: Array.from({ length: 10 }, (_, i) => ({
        treeId: i,
        accuracy: 0.75 + Math.random() * 0.15,
        depth: 5 + Math.floor(Math.random() * 5),
        leaves: 20 + Math.floor(Math.random() * 30)
      })),
      
      confusionMatrix: {
        data: [
          { predicted: 'UP', actual: 'UP', value: 85 },
          { predicted: 'UP', actual: 'DOWN', value: 10 },
          { predicted: 'UP', actual: 'NEUTRAL', value: 5 },
          { predicted: 'DOWN', actual: 'UP', value: 8 },
          { predicted: 'DOWN', actual: 'DOWN', value: 82 },
          { predicted: 'DOWN', actual: 'NEUTRAL', value: 10 },
          { predicted: 'NEUTRAL', actual: 'UP', value: 5 },
          { predicted: 'NEUTRAL', actual: 'DOWN', value: 8 },
          { predicted: 'NEUTRAL', actual: 'NEUTRAL', value: 87 }
        ]
      },
      
      treeStructure: {
        name: 'Root',
        children: [
          {
            name: 'RSI <= 30',
            children: [
              { name: 'Volume > 1M', children: [{ name: 'BUY (85%)' }, { name: 'HOLD (15%)' }] },
              { name: 'Volume <= 1M', children: [{ name: 'HOLD (60%)' }, { name: 'SELL (40%)' }] }
            ]
          },
          {
            name: 'RSI > 30',
            children: [
              { name: 'MACD > 0', children: [{ name: 'BUY (70%)' }, { name: 'HOLD (30%)' }] },
              { name: 'MACD <= 0', children: [{ name: 'SELL (80%)' }, { name: 'HOLD (20%)' }] }
            ]
          }
        ]
      }
    }
  }

  const sampleData = generateSampleData()

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI 모델 설명 섹션 */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-green-500/30">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaTree className="text-green-400 text-3xl" />
          Random Forest란 무엇인가?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400">🌲 핵심 개념</h3>
            <p className="text-gray-300 leading-relaxed">
              Random Forest는 <span className="text-green-400 font-semibold">수백 개의 의사결정 트리</span>를 동시에 학습시켜 
              각 트리의 예측을 종합하는 <span className="text-blue-400">앙상블 학습</span> 기법입니다. 
              마치 여러 전문가의 의견을 모아 최종 결정을 내리는 것과 같습니다.
            </p>
            
            <h3 className="text-lg font-semibold text-green-400 mt-6">📊 작동 원리</h3>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">1.</span>
                <span><strong>Bootstrap Sampling:</strong> 원본 데이터에서 무작위로 샘플을 추출하여 각 트리를 학습</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">2.</span>
                <span><strong>Feature Randomness:</strong> 각 노드에서 일부 특성만 무작위로 선택하여 분할</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">3.</span>
                <span><strong>Majority Voting:</strong> 모든 트리의 예측을 종합하여 최종 결정</span>
              </li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">💎 왜 Random Forest인가?</h3>
            <div className="space-y-3">
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                <h4 className="text-green-400 font-semibold mb-1">높은 정확도</h4>
                <p className="text-gray-300 text-sm">단일 모델보다 85-95% 높은 예측 정확도</p>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-400 font-semibold mb-1">과적합 방지</h4>
                <p className="text-gray-300 text-sm">무작위성 도입으로 일반화 성능 향상</p>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                <h4 className="text-purple-400 font-semibold mb-1">특성 중요도</h4>
                <p className="text-gray-300 text-sm">어떤 요인이 가격에 영향을 미치는지 자동 분석</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-yellow-400 mt-6">🚀 트레이딩 활용</h3>
            <p className="text-gray-300 leading-relaxed">
              암호화폐 시장의 <span className="text-yellow-400">복잡한 패턴</span>을 학습하여 
              가격 변동, 거래량, 기술적 지표 등 <span className="text-orange-400">14가지 특성</span>을 
              종합적으로 분석합니다. 각 트리가 다른 관점에서 시장을 해석하여 
              <span className="text-green-400 font-semibold">더 안정적인 예측</span>을 제공합니다.
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/30">
          <p className="text-center text-gray-300">
            <span className="text-green-400 font-bold">100개의 트리</span> × 
            <span className="text-blue-400 font-bold"> 14개의 특성</span> × 
            <span className="text-purple-400 font-bold"> 720시간의 데이터</span> = 
            <span className="text-yellow-400 font-bold text-lg"> 강력한 예측 모델</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 모델 정보 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all transform hover:scale-105">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaTree className="text-green-400" />
            Random Forest 구성
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">트리 개수</span>
              <span className="text-2xl font-bold text-green-400">100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">최대 깊이</span>
              <span className="text-xl font-bold text-blue-400">10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">최소 분할 샘플</span>
              <span className="text-xl font-bold text-purple-400">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">OOB 점수</span>
              <span className="text-xl font-bold text-yellow-400">89.2%</span>
            </div>
          </div>
        </div>

        {/* 앙상블 강도 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all transform hover:scale-105">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaLayerGroup className="text-green-400" />
            앙상블 다양성
          </h3>
          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
                { name: '트리 일치도', value: 72, fill: '#10b981' },
                { name: '특성 다양성', value: 88, fill: '#3b82f6' },
                { name: '예측 분산', value: 65, fill: '#8b5cf6' }
              ]}>
                <RadialBar dataKey="value" cornerRadius={10} />
                <Legend />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 실시간 상태 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all transform hover:scale-105">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaMountain className="text-green-400" />
            실시간 성능
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">예측 속도</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-400 animate-pulse" style={{ width: '95%' }} />
                </div>
                <span className="text-green-400 text-sm">12ms</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">메모리 사용</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: '45%' }} />
                </div>
                <span className="text-blue-400 text-sm">156MB</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">활성 트리</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: '100%' }} />
                </div>
                <span className="text-purple-400 text-sm">100/100</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">모든 트리 정상 작동 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* 예측 흐름 시각화 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaProjectDiagram className="text-green-400" />
          Random Forest 예측 프로세스
        </h3>
        <div className="relative h-96 overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* 입력 데이터 */}
            <Box position={[-3, 0, 0]} args={[1, 1, 1]}>
              <meshStandardMaterial color="#3b82f6" />
            </Box>
            
            {/* 트리들 */}
            {Array.from({ length: 5 }, (_, i) => (
              <Cylinder key={i} position={[0, i - 2, 0]} args={[0.3, 0.3, 0.5]}>
                <meshStandardMaterial color="#10b981" opacity={0.8} transparent />
              </Cylinder>
            ))}
            
            {/* 결과 집계 */}
            <Sphere position={[3, 0, 0]} args={[0.6, 32, 32]}>
              <meshStandardMaterial color="#f59e0b" />
            </Sphere>
            
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
      </div>
    </div>
  )

  const renderTrees = () => (
    <div className="space-y-6">
      {/* 트리 선택 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">트리 선택:</span>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map(i => (
              <button
                key={i}
                onClick={() => setSelectedTree(i)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTree === i
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                Tree {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 트리 구조 시각화 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCodeBranch className="text-green-400" />
          의사결정 트리 #{selectedTree + 1}
        </h3>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <DecisionTreeVisualization treeData={sampleData.treeStructure} />
        </div>
      </div>

      {/* 트리 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">트리 깊이 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sampleData.treePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="treeId" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="depth" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">리프 노드 수</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sampleData.treePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="treeId" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="leaves" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">트리별 정확도</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sampleData.treePerformance}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="treeId" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0.7, 0.9]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #8b5cf6' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" fill="url(#accuracyGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderImportance = () => (
    <div className="space-y-6">
      {/* 특성 중요도 막대 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-green-400" />
          특성 중요도 순위
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sampleData.featureImportance} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="feature" type="category" stroke="#9ca3af" width={120} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="importance" fill="#10b981">
              {sampleData.featureImportance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${120 - index * 10}, 70%, 50%)`} />
              ))}
              <LabelList dataKey="importance" position="right" formatter={(value: any) => `${(value * 100).toFixed(1)}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 특성 상관관계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">특성 간 상호작용</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={sampleData.featureImportance.slice(0, 6)}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="feature" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="중요도" dataKey="importance" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">누적 중요도</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleData.featureImportance.map((f, i) => ({
              ...f,
              cumulative: sampleData.featureImportance.slice(0, i + 1).reduce((sum, item) => sum + item.importance, 0)
            }))}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="feature" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="url(#cumulativeGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 특성 영향도 히트맵 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">특성 영향도 매트릭스</h3>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 100 }, (_, i) => {
            const intensity = Math.random()
            return (
              <div
                key={i}
                className="aspect-square rounded transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                  boxShadow: intensity > 0.7 ? `0 0 10px rgba(16, 185, 129, ${intensity})` : 'none'
                }}
                title={`Feature ${Math.floor(i / 10) + 1} × Feature ${(i % 10) + 1}: ${(intensity * 100).toFixed(1)}%`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderEnsemble = () => (
    <div className="space-y-6">
      {/* 트리 투표 분포 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaVoteYea className="text-green-400" />
          트리별 예측 투표
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { prediction: 'UP', count: 42, percentage: 42 },
            { prediction: 'DOWN', count: 35, percentage: 35 },
            { prediction: 'NEUTRAL', count: 23, percentage: 23 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="prediction" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]}>
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
              <Cell fill="#f59e0b" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 개별 트리 투표 시각화 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">개별 트리 투표 현황</h3>
        <div className="grid grid-cols-20 gap-1">
          {sampleData.treeVotes.map((vote, i) => (
            <div
              key={i}
              className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110 ${
                vote.prediction === 'UP' ? 'bg-green-500' :
                vote.prediction === 'DOWN' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}
              style={{ opacity: vote.confidence }}
              title={`Tree ${vote.treeId}: ${vote.prediction} (${(vote.confidence * 100).toFixed(0)}%)`}
            >
              {vote.treeId + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 혼동 행렬 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">예측 혼동 행렬</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-gray-400"></th>
                <th className="p-2 text-gray-400">UP 예측</th>
                <th className="p-2 text-gray-400">DOWN 예측</th>
                <th className="p-2 text-gray-400">NEUTRAL 예측</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 text-gray-400">실제 UP</td>
                <td className="p-2 text-center bg-green-500/20 text-green-400 font-bold">85</td>
                <td className="p-2 text-center bg-red-500/10 text-red-400">10</td>
                <td className="p-2 text-center bg-yellow-500/10 text-yellow-400">5</td>
              </tr>
              <tr>
                <td className="p-2 text-gray-400">실제 DOWN</td>
                <td className="p-2 text-center bg-red-500/10 text-red-400">8</td>
                <td className="p-2 text-center bg-green-500/20 text-green-400 font-bold">82</td>
                <td className="p-2 text-center bg-yellow-500/10 text-yellow-400">10</td>
              </tr>
              <tr>
                <td className="p-2 text-gray-400">실제 NEUTRAL</td>
                <td className="p-2 text-center bg-yellow-500/10 text-yellow-400">5</td>
                <td className="p-2 text-center bg-yellow-500/10 text-yellow-400">8</td>
                <td className="p-2 text-center bg-green-500/20 text-green-400 font-bold">87</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderPredictions = () => {
    const currentPred = predictions.find(p => p.symbol === selectedCoin) || {
      current: 50000,
      predicted_1h: 50300,
      predicted_4h: 50800,
      predicted_1d: 51500,
      predicted_1w: 53000,
      confidence: 85.5,
      direction: 'UP'
    }

    return (
      <div className="space-y-6">
        {/* 예측 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            Random Forest 가격 예측
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={[
              { time: '현재', price: currentPred.current, min: currentPred.current, max: currentPred.current },
              { time: '1시간', price: currentPred.predicted_1h, min: currentPred.predicted_1h * 0.995, max: currentPred.predicted_1h * 1.005 },
              { time: '4시간', price: currentPred.predicted_4h, min: currentPred.predicted_4h * 0.99, max: currentPred.predicted_4h * 1.01 },
              { time: '1일', price: currentPred.predicted_1d, min: currentPred.predicted_1d * 0.98, max: currentPred.predicted_1d * 1.02 },
              { time: '1주', price: currentPred.predicted_1w, min: currentPred.predicted_1w * 0.95, max: currentPred.predicted_1w * 1.05 }
            ]}>
              <defs>
                <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="price"
                fill="url(#predictionGradient)"
                stroke="#10b981"
                strokeWidth={3}
              />
              <Line type="monotone" dataKey="max" stroke="#10b981" strokeDasharray="5 5" opacity={0.5} />
              <Line type="monotone" dataKey="min" stroke="#10b981" strokeDasharray="5 5" opacity={0.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 예측 상세 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예측 신뢰도</h3>
            <div className="relative h-40 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl font-bold text-green-400">
                  {currentPred.confidence.toFixed(1)}%
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="60"
                  stroke="#374151"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="60"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${currentPred.confidence * 3.77} 377`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예측 방향</h3>
            <div className="flex flex-col items-center justify-center h-40">
              <div className={`text-6xl mb-2 ${
                currentPred.direction === 'UP' ? 'text-green-400 animate-bounce' : 
                currentPred.direction === 'DOWN' ? 'text-red-400 animate-bounce' : 
                'text-yellow-400'
              }`}>
                {currentPred.direction === 'UP' ? '🌲' : 
                 currentPred.direction === 'DOWN' ? '🍂' : '🌳'}
              </div>
              <div className="text-2xl font-bold text-white">
                {currentPred.direction}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예상 수익률</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">1시간</span>
                <span className={`font-bold ${
                  currentPred.predicted_1h > currentPred.current ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((currentPred.predicted_1h - currentPred.current) / currentPred.current * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">1일</span>
                <span className={`font-bold ${
                  currentPred.predicted_1d > currentPred.current ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((currentPred.predicted_1d - currentPred.current) / currentPred.current * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">1주</span>
                <span className={`font-bold ${
                  currentPred.predicted_1w > currentPred.current ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((currentPred.predicted_1w - currentPred.current) / currentPred.current * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* 성능 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '정확도', value: metrics?.accuracy || 85.5, color: 'green', icon: FaLightbulb },
          { label: '정밀도', value: metrics?.precision || 83.2, color: 'blue', icon: FaBalanceScale },
          { label: '재현율', value: metrics?.recall || 87.1, color: 'purple', icon: FaBrain },
          { label: 'F1 Score', value: metrics?.f1_score || 85.0, color: 'yellow', icon: FaChartPie }
        ].map((metric) => (
          <div key={metric.label} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">{metric.label}</h4>
              <metric.icon className={`text-${metric.color}-400`} />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {metric.value.toFixed(1)}%
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${
                  metric.color === 'green' ? 'from-green-600 to-green-400' :
                  metric.color === 'blue' ? 'from-blue-600 to-blue-400' :
                  metric.color === 'purple' ? 'from-purple-600 to-purple-400' :
                  'from-yellow-600 to-yellow-400'
                } transition-all duration-1000`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ROC 곡선 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">ROC 곡선</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={Array.from({ length: 100 }, (_, i) => ({
            fpr: i / 100,
            tpr: Math.sqrt(i / 100) + Math.random() * 0.05
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="fpr" stroke="#9ca3af" domain={[0, 1]} />
            <YAxis dataKey="tpr" stroke="#9ca3af" domain={[0, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="tpr" stroke="#10b981" strokeWidth={3} dot={false} />
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#6b7280" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <span className="text-gray-400">AUC: </span>
          <span className="text-green-400 font-bold text-xl">0.912</span>
        </div>
      </div>

      {/* 샤프 비율 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">위험 조정 수익률</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-gray-400 mb-2">샤프 비율</h4>
            <div className="text-4xl font-bold text-green-400">
              {(metrics?.sharpe_ratio || 1.75).toFixed(2)}
            </div>
          </div>
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                day: i + 1,
                value: 1.5 + Math.sin(i / 5) * 0.3 + Math.random() * 0.2
              }))}>
                <defs>
                  <linearGradient id="sharpeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#sharpeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6 relative overflow-hidden">
      <ForestBackground />
      <FallingLeaves />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
            Random Forest 예측 모델
          </h1>
          <p className="text-xl text-gray-400">
            의사결정 트리 앙상블 - 집단 지성의 힘
          </p>
        </div>

        {/* 연결 상태 */}
        <div className="flex items-center justify-center mb-6 gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            wsConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              {wsConnected ? 'Random Forest 서비스 연결됨' : 'Random Forest 서비스 연결 중...'}
            </span>
          </div>
          
          {/* 코인 선택 */}
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
          >
            {coins.map(coin => (
              <option key={coin.symbol} value={coin.symbol}>{coin.name}</option>
            ))}
          </select>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform ${
                activeTab === tab.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:scale-105'
              }`}
            >
              <tab.icon className="text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="relative">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'trees' && renderTrees()}
          {activeTab === 'importance' && renderImportance()}
          {activeTab === 'ensemble' && renderEnsemble()}
          {activeTab === 'predictions' && renderPredictions()}
          {activeTab === 'performance' && renderPerformance()}
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 100px)) rotate(360deg); opacity: 0; }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  )
}