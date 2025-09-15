'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, FaTree, FaLayerGroup, FaBrain,
  FaProjectDiagram, FaWater, FaChartPie, FaChartLine
} from 'react-icons/fa'
import { 
  Treemap, AreaChart, Area, ScatterChart, Scatter,
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, RadialBarChart, RadialBar, PolarGrid
} from 'recharts'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

interface AdvancedVisualizationProps {
  symbol: string
}

export default function AdvancedVisualization({ symbol }: AdvancedVisualizationProps) {
  const [selectedView, setSelectedView] = useState<'treemap' | 'shap' | 'importance' | 'splits'>('treemap')
  const [animationEnabled, setAnimationEnabled] = useState(true)

  // 트리맵 데이터 (특성 계층 구조)
  const treemapData = {
    name: 'Features',
    children: [
      {
        name: 'Technical',
        children: [
          { name: 'RSI', size: 4500, importance: 0.92 },
          { name: 'MACD', size: 3800, importance: 0.85 },
          { name: 'Bollinger', size: 3200, importance: 0.78 },
          { name: 'SMA', size: 2800, importance: 0.72 }
        ]
      },
      {
        name: 'Volume',
        children: [
          { name: 'Volume', size: 4200, importance: 0.88 },
          { name: 'OBV', size: 3500, importance: 0.82 },
          { name: 'CVD', size: 2900, importance: 0.75 }
        ]
      },
      {
        name: 'Price',
        children: [
          { name: 'Price', size: 3900, importance: 0.86 },
          { name: 'High', size: 2600, importance: 0.70 },
          { name: 'Low', size: 2500, importance: 0.68 },
          { name: 'Open', size: 2400, importance: 0.65 }
        ]
      },
      {
        name: 'Market',
        children: [
          { name: 'Volatility', size: 3600, importance: 0.83 },
          { name: 'Correlation', size: 3100, importance: 0.76 },
          { name: 'Sentiment', size: 2700, importance: 0.71 }
        ]
      }
    ]
  }

  // SHAP 워터폴 데이터
  const shapWaterfall = [
    { feature: 'Base', value: 0.5, cumulative: 0.5 },
    { feature: 'RSI', value: 0.15, cumulative: 0.65 },
    { feature: 'Volume', value: 0.12, cumulative: 0.77 },
    { feature: 'MACD', value: -0.08, cumulative: 0.69 },
    { feature: 'Price', value: 0.10, cumulative: 0.79 },
    { feature: 'Volatility', value: -0.06, cumulative: 0.73 },
    { feature: 'SMA', value: 0.05, cumulative: 0.78 },
    { feature: 'Other', value: 0.04, cumulative: 0.82 }
  ]

  // 특성 중요도 분포
  const importanceDistribution = [
    { range: '0-10%', count: 45, color: '#6b7280' },
    { range: '10-20%', count: 28, color: '#3b82f6' },
    { range: '20-30%', count: 15, color: '#10b981' },
    { range: '30-40%', count: 8, color: '#f59e0b' },
    { range: '40%+', count: 4, color: '#ef4444' }
  ]

  // 분할 통계
  const splitStatistics = [
    { depth: 0, splits: 1, gain: 100, samples: 10000 },
    { depth: 1, splits: 2, gain: 85, samples: 8500 },
    { depth: 2, splits: 4, gain: 72, samples: 7200 },
    { depth: 3, splits: 7, gain: 58, samples: 5800 },
    { depth: 4, splits: 12, gain: 45, samples: 4500 },
    { depth: 5, splits: 18, gain: 32, samples: 3200 },
    { depth: 6, splits: 25, gain: 20, samples: 2000 }
  ]

  // 3D 트리 노드
  function TreeNode3D({ position, size, color, label }: any) {
    return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[size, size * 0.2, size]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Text
          position={[0, size * 0.15, 0]}
          fontSize={size * 0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    )
  }

  // 색상 스케일
  const getColor = (value: number) => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
    const index = Math.floor(value * (colors.length - 1))
    return colors[index]
  }

  const renderTreemap = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">특성 계층 구조 트리맵</h4>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
            data={[treemapData]}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={({ x, y, width, height, name, value }: any) => (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  style={{
                    fill: getColor(Math.random()),
                    stroke: '#374151',
                    strokeWidth: 2,
                    strokeOpacity: 1
                  }}
                />
                {width > 50 && height > 30 && (
                  <>
                    <text
                      x={x + width / 2}
                      y={y + height / 2 - 10}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={14}
                      fontWeight="bold"
                    >
                      {name}
                    </text>
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + 10}
                      textAnchor="middle"
                      fill="#e5e7eb"
                      fontSize={12}
                    >
                      {value}
                    </text>
                  </>
                )}
              </g>
            )}
        />
      </ResponsiveContainer>
      
      <div className="bg-gray-700/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          트리맵은 특성들의 계층 구조와 상대적 중요도를 시각화합니다. 
          크기가 클수록 모델에서 더 중요한 역할을 합니다.
        </p>
      </div>
    </div>
  )

  const renderSHAP = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">SHAP 워터폴 플롯</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={shapWaterfall} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" domain={[0, 1]} />
          <YAxis dataKey="feature" type="category" stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: any) => value.toFixed(3)}
          />
          <Bar dataKey="value">
            {shapWaterfall.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={
                entry.value > 0 ? '#10b981' : entry.value < 0 ? '#ef4444' : '#6b7280'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">+0.32</div>
          <div className="text-sm text-gray-400">긍정 기여도</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">-0.14</div>
          <div className="text-sm text-gray-400">부정 기여도</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">0.82</div>
          <div className="text-sm text-gray-400">최종 예측</div>
        </div>
      </div>
    </div>
  )

  const renderImportance = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">특성 중요도 분포</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={importanceDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="count"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {importanceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="space-y-3">
          <h5 className="text-blue-400 font-semibold">중요도 분포 통계</h5>
          {importanceDistribution.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.range}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${(item.count / 100) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
                <span className="text-sm text-white font-mono">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-500/30">
        <p className="text-sm text-gray-300">
          <span className="text-blue-400 font-semibold">인사이트:</span> 상위 4개 특성이 
          전체 예측력의 40% 이상을 담당하고 있습니다. 특성 엔지니어링 시 이들 특성에 
          집중하면 효율적입니다.
        </p>
      </div>
    </div>
  )

  const renderSplits = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">트리 분할 통계</h4>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={splitStatistics}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="depth" stroke="#9ca3af" label={{ value: '깊이', position: 'insideBottom', offset: -5 }} />
          <YAxis yAxisId="left" stroke="#9ca3af" />
          <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Bar yAxisId="left" dataKey="splits" fill="#3b82f6" name="분할 수" />
          <Line yAxisId="right" type="monotone" dataKey="gain" stroke="#10b981" strokeWidth={2} name="평균 이득" />
          <Area yAxisId="right" type="monotone" dataKey="samples" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="샘플 수" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h5 className="text-green-400 font-semibold mb-2">Leaf-wise 효과</h5>
          <p className="text-sm text-gray-300">
            깊이가 증가해도 분할 수가 선형적으로 증가하지 않아 메모리 효율적
          </p>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h5 className="text-blue-400 font-semibold mb-2">이득 감소</h5>
          <p className="text-sm text-gray-300">
            깊이가 깊어질수록 평균 이득이 감소하여 자연스러운 정지 조건 형성
          </p>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h5 className="text-yellow-400 font-semibold mb-2">샘플 분포</h5>
          <p className="text-sm text-gray-300">
            깊은 노드일수록 적은 샘플로 과적합 위험 증가
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaChartBar className="text-indigo-400" />
          고급 시각화 분석
        </h2>
        <p className="text-gray-300">
          LightGBM 모델의 내부 구조와 예측 과정을 심층 분석합니다
        </p>
      </div>

      {/* 뷰 선택 탭 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700/50">
        <div className="flex gap-2">
          {[
            { id: 'treemap', label: '트리맵', icon: <FaTree /> },
            { id: 'shap', label: 'SHAP 분석', icon: <FaWater /> },
            { id: 'importance', label: '중요도 분포', icon: <FaChartPie /> },
            { id: 'splits', label: '분할 통계', icon: <FaLayerGroup /> }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                selectedView === view.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50'
              }`}
            >
              {view.icon}
              <span className="font-medium">{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 뷰 렌더링 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {selectedView === 'treemap' && renderTreemap()}
            {selectedView === 'shap' && renderSHAP()}
            {selectedView === 'importance' && renderImportance()}
            {selectedView === 'splits' && renderSplits()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 3D 트리 구조 시각화 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBrain className="text-purple-400" />
          3D 특성 공간 시각화
        </h3>
        
        <div style={{ height: '400px' }} className="bg-gray-900/50 rounded-lg">
          <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            
            {/* 특성 노드들 */}
            <TreeNode3D position={[0, 0, 0]} size={2} color="#3b82f6" label="Root" />
            <TreeNode3D position={[-3, -2, 0]} size={1.5} color="#10b981" label="Technical" />
            <TreeNode3D position={[3, -2, 0]} size={1.5} color="#f59e0b" label="Volume" />
            <TreeNode3D position={[0, -2, 3]} size={1.3} color="#ef4444" label="Price" />
            <TreeNode3D position={[0, -2, -3]} size={1.2} color="#8b5cf6" label="Market" />
            
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
        
        <div className="mt-4 text-sm text-gray-400 text-center">
          마우스로 회전, 스크롤로 줌 조절이 가능합니다
        </div>
      </motion.div>

      {/* 모델 인사이트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaProjectDiagram className="text-indigo-400" />
          LightGBM 모델 인사이트
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-indigo-400 font-semibold mb-3">성능 최적화 포인트</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>상위 20% 특성이 80% 예측력 담당 (파레토 법칙)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>깊이 5-7에서 최적 성능 대비 복잡도 균형</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>희소 특성 자동 그룹화로 30% 메모리 절약</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>병렬 히스토그램 구축으로 8코어에서 6.5x 속도 향상</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">트레이딩 활용 전략</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>실시간 예측: 히스토그램 캐싱으로 1ms 이내 응답</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>다중 시간대: 병렬 모델로 1m, 5m, 1h 동시 예측</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>특성 중요도 기반 동적 가중치 조정</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>SHAP 값 모니터링으로 시장 체제 변화 감지</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}