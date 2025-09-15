'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaRobot, FaGraduationCap, 
  FaEye, FaLayerGroup, FaCogs, FaLightbulb, FaBars
} from 'react-icons/fa'
import { useSidebar } from '@/contexts/SidebarContext'
import ErrorBoundary from './components/ErrorBoundary'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Line, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Dynamic imports
const ModelOverview = dynamic(() => import('./components/ModelOverview'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const NetworkArchitecture = dynamic(() => import('./components/NetworkArchitecture'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const TrainingVisualization = dynamic(() => import('./components/TrainingVisualization'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const AttentionMechanism = dynamic(() => import('./components/AttentionMechanism'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const PredictionInterface = dynamic(() => import('./components/PredictionInterface'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const DynamicAnalysis = dynamic(() => import('./components/DynamicAnalysis'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-64 rounded-xl" />,
  ssr: false
})

// 3D 신경망 애니메이션
function NeuralNetwork3D() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })
  
  // 뉴런 레이어
  const layers = [
    { count: 5, x: -6, color: '#4444ff' },
    { count: 8, x: -3, color: '#6666ff' },
    { count: 10, x: 0, color: '#8888ff' },
    { count: 8, x: 3, color: '#aaaaff' },
    { count: 3, x: 6, color: '#ccccff' }
  ]
  
  return (
    <group ref={groupRef}>
      {/* 뉴런들 */}
      {layers.map((layer, layerIndex) => (
        <React.Fragment key={layerIndex}>
          {Array.from({ length: layer.count }).map((_, i) => {
            const y = (i - layer.count / 2) * 1.2
            return (
              <group key={i} position={[layer.x, y, 0]}>
                <Sphere args={[0.3, 16, 16]}>
                  <meshStandardMaterial
                    color={layer.color}
                    emissive={layer.color}
                    emissiveIntensity={0.5}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </Sphere>
                {/* 글로우 효과 */}
                <Sphere args={[0.4, 8, 8]}>
                  <meshBasicMaterial
                    color={layer.color}
                    transparent
                    opacity={0.2}
                  />
                </Sphere>
              </group>
            )
          })}
          
          {/* 연결선 */}
          {layerIndex < layers.length - 1 && (
            <>
              {Array.from({ length: layer.count }).map((_, i) => {
                const fromY = (i - layer.count / 2) * 1.2
                const nextLayer = layers[layerIndex + 1]
                
                return Array.from({ length: nextLayer.count }).map((_, j) => {
                  const toY = (j - nextLayer.count / 2) * 1.2
                  const points = [
                    new THREE.Vector3(layer.x, fromY, 0),
                    new THREE.Vector3(nextLayer.x, toY, 0)
                  ]
                  
                  return (
                    <Line
                      key={`${i}-${j}`}
                      points={points}
                      color="#004488"
                      lineWidth={1}
                      opacity={0.3}
                      transparent
                    />
                  )
                })
              })}
            </>
          )}
        </React.Fragment>
      ))}
      
      {/* 중앙 에너지 코어 */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#0066ff"
          emissive="#00aaff"
          emissiveIntensity={1}
          wireframe
        />
      </mesh>
    </group>
  )
}

// 배경 파티클
function BackgroundParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#0066ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  gradient: string
}

const tabs: TabItem[] = [
  {
    id: 'overview',
    label: '모델 개요',
    icon: <FaBrain className="w-5 h-5" />,
    description: '신경망 모델 종류와 특성 비교',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'architecture',
    label: '네트워크 구조',
    icon: <FaLayerGroup className="w-5 h-5" />,
    description: '3D 신경망 아키텍처 시각화',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'training',
    label: '학습 과정',
    icon: <FaGraduationCap className="w-5 h-5" />,
    description: '실시간 훈련 과정 모니터링',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'attention',
    label: 'Attention',
    icon: <FaEye className="w-5 h-5" />,
    description: 'Transformer Attention 메커니즘',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'prediction',
    label: '예측 인터페이스',
    icon: <FaChartLine className="w-5 h-5" />,
    description: 'AI 가격 예측 실행',
    gradient: 'from-cyan-500 to-blue-500'
  }
]

export default function NeuralPageDark() {
  const { isOpen, setIsOpen } = useSidebar()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [activeTab])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <ModelOverview symbol={selectedSymbol} />
          </Suspense>
        )
      case 'architecture':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <NetworkArchitecture symbol={selectedSymbol} />
          </Suspense>
        )
      case 'training':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <TrainingVisualization symbol={selectedSymbol} />
          </Suspense>
        )
      case 'attention':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <AttentionMechanism symbol={selectedSymbol} />
          </Suspense>
        )
      case 'prediction':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <PredictionInterface symbol={selectedSymbol} />
          </Suspense>
        )
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <>
        {/* 햄버거 메뉴 버튼 - 사이드바가 닫혀있을 때만 표시 */}
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 z-[9999] p-3 rounded-xl bg-gradient-to-r from-purple-900/80 to-purple-800/80
                       backdrop-blur-sm border border-purple-600/50 hover:border-purple-500
                       shadow-xl hover:shadow-purple-500/30 transition-all group"
          >
            <div className="relative">
              <FaBars className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
            </div>
          </motion.button>
        )}
        
        <div className="relative min-h-screen overflow-hidden">
          {/* 검은색 배경 */}
          <div className="fixed inset-0 bg-black" />
        
        {/* 3D 배경 */}
        <div className="fixed inset-0">
          <Canvas
            camera={{ position: [0, 0, 15], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
          >
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 10, 30]} />
            
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.3} color="#0066ff" />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#6600ff" />
            
            <NeuralNetwork3D />
            <BackgroundParticles />
            
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
            />
          </Canvas>
        </div>
        
        {/* 그라데이션 오버레이 */}
        <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
              Neural Network AI
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              딥러닝 신경망을 활용한 차세대 암호화폐 가격 예측 시스템
            </p>
          </motion.div>

          {/* Symbol Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 inline-flex gap-2">
              {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedSymbol === symbol
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  {symbol.replace('USDT', '')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {tab.icon}
                      <span className="hidden md:inline font-medium">{tab.label}</span>
                      <span className="md:hidden text-sm">{tab.label.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-center text-gray-400"
              >
                {tabs.find(tab => tab.id === activeTab)?.description}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Dynamic Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-64 rounded-xl mt-8" />}>
              <DynamicAnalysis analysisType={activeTab as any} />
            </Suspense>
          </motion.div>

          {/* Footer Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaLightbulb className="text-2xl text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Neural Network AI 활용 팁</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-indigo-400 font-semibold mb-2">모델 선택 가이드</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• MLP: 기본적인 가격 예측에 적합</li>
                  <li>• CNN: 차트 패턴 인식에 특화</li>
                  <li>• LSTM/GRU: 시계열 예측의 표준</li>
                  <li>• Transformer: 최신 기술, 장기 의존성</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">최적 활용 전략</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 여러 모델 앙상블로 정확도 향상</li>
                  <li>• 시장 상황에 따른 모델 가중치 조정</li>
                  <li>• 정기적인 재학습으로 성능 유지</li>
                  <li>• 신뢰도 70% 이상에서만 거래 실행</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </>
    </ErrorBoundary>
  )
}