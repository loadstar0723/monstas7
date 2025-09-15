'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaLayerGroup, FaCube, FaExpand, 
  FaCompress, FaEye, FaChartLine
} from 'react-icons/fa'
import { 
  ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ZAxis
} from 'recharts'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Text } from '@react-three/drei'
import * as THREE from 'three'

interface FeatureInteractionProps {
  symbol: string
}

interface InteractionData {
  feature1: string
  feature2: string
  value1: number
  value2: number
  interaction: number
  prediction: number
}

export default function FeatureInteraction({ symbol }: FeatureInteractionProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<[string, string]>(['RSI', 'Volume'])
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const [showContour, setShowContour] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)

  // 사용 가능한 특성들
  const features = [
    'RSI', 'MACD', 'Volume', 'Price', 'Volatility', 
    'SMA_20', 'EMA_50', 'BollingerBand', 'ATR', 'OBV'
  ]

  // 상호작용 데이터 생성
  const generateInteractionData = (): InteractionData[] => {
    const data: InteractionData[] = []
    const gridSize = 20
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const value1 = (i / gridSize) * 100
        const value2 = (j / gridSize) * 100
        
        // 특성 간 상호작용 효과 계산 (실제로는 모델에서 계산)
        const interaction = Math.sin(value1 * 0.05) * Math.cos(value2 * 0.05) * 50 + 50
        const prediction = interaction + (Math.random() - 0.5) * 10
        
        data.push({
          feature1: selectedFeatures[0],
          feature2: selectedFeatures[1],
          value1,
          value2,
          interaction,
          prediction
        })
      }
    }
    
    return data
  }

  const interactionData = useMemo(generateInteractionData, [selectedFeatures])

  // 히트맵 데이터 생성
  const heatmapData = useMemo(() => {
    const gridSize = 10
    const heatmap: number[][] = []
    
    for (let i = 0; i < gridSize; i++) {
      const row: number[] = []
      for (let j = 0; j < gridSize; j++) {
        const value = Math.sin(i * 0.3) * Math.cos(j * 0.3) * 50 + 50
        row.push(value)
      }
      heatmap.push(row)
    }
    
    return heatmap
  }, [selectedFeatures])

  // 색상 매핑 함수
  const getColor = (value: number) => {
    const normalized = value / 100
    const r = Math.floor(255 * normalized)
    const g = Math.floor(100 * (1 - normalized) + 155 * normalized)
    const b = Math.floor(255 * (1 - normalized))
    return `rgb(${r}, ${g}, ${b})`
  }

  // 3D 상호작용 시각화 컴포넌트
  function InteractionSurface() {
    const geometry = useMemo(() => {
      const geo = new THREE.PlaneGeometry(10, 10, 20, 20)
      const positions = geo.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2
        positions.setZ(i, z)
      }
      
      geo.computeVertexNormals()
      return geo
    }, [])

    return (
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          color="#10b981" 
          metalness={0.3} 
          roughness={0.5}
          wireframe={false}
        />
      </mesh>
    )
  }

  // 2D 히트맵 렌더링
  const render2DHeatmap = () => (
    <div className="relative">
      <svg width="100%" height="400" viewBox="0 0 500 400">
        {heatmapData.map((row, i) => 
          row.map((value, j) => (
            <rect
              key={`${i}-${j}`}
              x={j * 50}
              y={i * 40}
              width="50"
              height="40"
              fill={getColor(value)}
              stroke="#374151"
              strokeWidth="1"
            />
          ))
        )}
        
        {/* 축 레이블 */}
        <text x="250" y="395" textAnchor="middle" fill="#9ca3af" fontSize="14">
          {selectedFeatures[0]}
        </text>
        <text 
          x="10" 
          y="200" 
          textAnchor="middle" 
          fill="#9ca3af" 
          fontSize="14"
          transform="rotate(-90 10 200)"
        >
          {selectedFeatures[1]}
        </text>
      </svg>
      
      {/* 범례 */}
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-2">상호작용 강도</div>
        <div className="w-32 h-3 bg-gradient-to-r from-blue-600 via-green-500 to-red-500 rounded" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaLayerGroup className="text-purple-400" />
          특성 상호작용 분석
        </h2>
        <p className="text-gray-300">
          두 특성 간의 복잡한 상호작용 패턴을 시각화하여 모델의 예측 방식을 이해합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-white">상호작용 매트릭스</h3>
          
          <div className="flex items-center gap-4">
            {/* 특성 선택 */}
            <div className="flex items-center gap-2">
              <select
                value={selectedFeatures[0]}
                onChange={(e) => setSelectedFeatures([e.target.value, selectedFeatures[1]])}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                {features.filter(f => f !== selectedFeatures[1]).map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
              <span className="text-gray-400">×</span>
              <select
                value={selectedFeatures[1]}
                onChange={(e) => setSelectedFeatures([selectedFeatures[0], e.target.value])}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                {features.filter(f => f !== selectedFeatures[0]).map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
            </div>
            
            {/* 뷰 모드 토글 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('2D')}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  viewMode === '2D'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                }`}
              >
                <FaChartBar className="inline mr-1" /> 2D
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  viewMode === '3D'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                }`}
              >
                <FaCube className="inline mr-1" /> 3D
              </button>
            </div>
          </div>
        </div>

        {/* 시각화 영역 */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          {viewMode === '2D' ? (
            render2DHeatmap()
          ) : (
            <div style={{ height: '400px' }}>
              <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <InteractionSurface />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                <gridHelper args={[20, 20, '#374151', '#1f2937']} />
              </Canvas>
            </div>
          )}
        </div>

        {/* 상호작용 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">89.5%</div>
            <div className="text-sm text-gray-400">상호작용 강도</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">0.76</div>
            <div className="text-sm text-gray-400">상관계수</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">비선형</div>
            <div className="text-sm text-gray-400">패턴 유형</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">상위 5%</div>
            <div className="text-sm text-gray-400">중요도 순위</div>
          </div>
        </div>
      </div>

      {/* 상위 상호작용 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-green-400" />
          주요 상호작용 패턴
        </h3>
        
        <div className="space-y-3">
          {[
            { features: ['RSI', 'Volume'], strength: 92, type: '비선형', impact: '매우 높음' },
            { features: ['MACD', 'Price'], strength: 87, type: '선형', impact: '높음' },
            { features: ['Volatility', 'ATR'], strength: 85, type: '곡선형', impact: '높음' },
            { features: ['SMA_20', 'EMA_50'], strength: 78, type: '선형', impact: '중간' },
            { features: ['BollingerBand', 'OBV'], strength: 72, type: '비선형', impact: '중간' }
          ].map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  pattern.strength > 85 ? 'bg-green-400' : 
                  pattern.strength > 75 ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <span className="text-white font-medium">
                  {pattern.features[0]} × {pattern.features[1]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">타입: <span className="text-white">{pattern.type}</span></span>
                <span className="text-gray-400">영향: <span className={
                  pattern.impact === '매우 높음' ? 'text-red-400' :
                  pattern.impact === '높음' ? 'text-yellow-400' : 'text-blue-400'
                }>{pattern.impact}</span></span>
                <div className="flex items-center gap-1">
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${pattern.strength}%` }}
                    />
                  </div>
                  <span className="text-white font-bold ml-2">{pattern.strength}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 상호작용 인사이트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaEye className="text-purple-400" />
          상호작용 인사이트
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">발견된 패턴</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• RSI와 거래량의 강한 비선형 관계</li>
              <li>• 가격과 MACD의 시차 상호작용</li>
              <li>• 변동성 지표 간 높은 상관관계</li>
              <li>• 이동평균선의 교차 시너지 효과</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-400 font-semibold mb-2">트레이딩 시사점</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 복합 지표 활용 시 정확도 15% 향상</li>
              <li>• 비선형 패턴 고려 시 노이즈 감소</li>
              <li>• 상호작용 기반 필터링으로 신호 개선</li>
              <li>• 다중 타임프레임 분석 효과 증대</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}