'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartArea, FaFilter, FaLayerGroup, FaArrowsAltH,
  FaInfoCircle, FaChartLine, FaHeatmap, FaMagic
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, HeatMapGrid,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Surface, Symbols, Legend,
  ComposedChart, Bar, ScatterChart, Scatter
} from 'recharts'

interface PartialDependenceProps {
  symbol: string
}

// 히트맵 컴포넌트
function Heatmap({ data, xLabels, yLabels }: any) {
  const cellSize = 40
  const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#c7417b', '#f39c6b', '#ff6b6b']
  
  const getColor = (value: number) => {
    const index = Math.floor(value * (colors.length - 1))
    return colors[Math.min(index, colors.length - 1)]
  }

  return (
    <svg width={xLabels.length * cellSize + 100} height={yLabels.length * cellSize + 100}>
      {/* Y축 라벨 */}
      {yLabels.map((label: string, i: number) => (
        <text
          key={`y-${i}`}
          x={80}
          y={i * cellSize + cellSize / 2 + 60}
          textAnchor="end"
          fill="#9ca3af"
          fontSize="12"
        >
          {label}
        </text>
      ))}
      
      {/* X축 라벨 */}
      {xLabels.map((label: string, i: number) => (
        <text
          key={`x-${i}`}
          x={i * cellSize + cellSize / 2 + 100}
          y={50}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="12"
        >
          {label}
        </text>
      ))}
      
      {/* 히트맵 셀 */}
      {data.map((row: number[], i: number) =>
        row.map((value: number, j: number) => (
          <rect
            key={`cell-${i}-${j}`}
            x={j * cellSize + 100}
            y={i * cellSize + 60}
            width={cellSize - 2}
            height={cellSize - 2}
            fill={getColor(value)}
            stroke="#1f2937"
          />
        ))
      )}
    </svg>
  )
}

export default function PartialDependence({ symbol }: PartialDependenceProps) {
  const [selectedFeature, setSelectedFeature] = useState('RSI')
  const [selectedFeature2, setSelectedFeature2] = useState('Volume')
  const [viewMode, setViewMode] = useState<'1d' | '2d' | 'multi'>('1d')

  // 특성 목록
  const features = [
    'RSI', 'MACD', 'Volume', 'MA20', 'Bollinger', 'ATR', 
    'Whale Activity', 'Fear & Greed', 'Network Activity'
  ]

  // 1D 부분 의존성 데이터 생성
  const generate1DData = (feature: string) => {
    const data = []
    const steps = 50
    
    for (let i = 0; i < steps; i++) {
      const x = i / (steps - 1)
      let y = 0
      
      // 특성별 다른 패턴
      switch (feature) {
        case 'RSI':
          // RSI는 30 이하에서 상승, 70 이상에서 하락
          if (x < 0.3) y = 0.2 + (0.3 - x) * 2
          else if (x > 0.7) y = -0.2 - (x - 0.7) * 2
          else y = 0.05 * Math.sin((x - 0.3) * 10)
          break
        
        case 'Volume':
          // 거래량은 증가할수록 영향력 증가 (로그 스케일)
          y = Math.log(x * 10 + 1) * 0.15
          break
        
        case 'MACD':
          // MACD는 0을 기준으로 방향성
          y = Math.tanh((x - 0.5) * 4) * 0.3
          break
        
        case 'Whale Activity':
          // 고래 활동은 임계값 이상에서 급격히 증가
          y = x > 0.7 ? (x - 0.7) * 2 : x * 0.1
          break
        
        default:
          y = Math.sin(x * Math.PI * 2) * 0.2
      }
      
      data.push({
        x: x * 100,
        y,
        feature: `${feature}: ${(x * 100).toFixed(0)}`
      })
    }
    
    return data
  }

  // 2D 부분 의존성 히트맵 데이터
  const generate2DData = () => {
    const size = 10
    const data = []
    
    for (let i = 0; i < size; i++) {
      const row = []
      for (let j = 0; j < size; j++) {
        // RSI와 Volume의 상호작용 효과
        const rsi = i / (size - 1)
        const volume = j / (size - 1)
        
        let value = 0
        // RSI 과매도 + 높은 거래량 = 강한 상승 신호
        if (rsi < 0.3 && volume > 0.7) value = 0.8
        // RSI 과매수 + 높은 거래량 = 강한 하락 신호
        else if (rsi > 0.7 && volume > 0.7) value = 0.2
        // 중간 영역
        else value = 0.5 + Math.sin(rsi * Math.PI) * Math.cos(volume * Math.PI) * 0.3
        
        row.push(value)
      }
      data.push(row)
    }
    
    return data
  }

  // 다중 특성 비교 데이터
  const generateMultiData = () => {
    const selectedFeatures = ['RSI', 'Volume', 'MACD', 'Whale Activity']
    const data = []
    
    for (let i = 0; i < 20; i++) {
      const point: any = { x: i * 5 }
      selectedFeatures.forEach(feature => {
        const pdData = generate1DData(feature)
        point[feature] = pdData[Math.floor(i * 2.5)]?.y || 0
      })
      data.push(point)
    }
    
    return data
  }

  const pdData1D = generate1DData(selectedFeature)
  const pdData2D = generate2DData()
  const multiData = generateMultiData()

  // ICE (Individual Conditional Expectation) 곡선
  const generateICECurves = () => {
    const curves = []
    for (let i = 0; i < 10; i++) {
      const curve = pdData1D.map(point => ({
        x: point.x,
        y: point.y + (Math.random() - 0.5) * 0.1
      }))
      curves.push(curve)
    }
    return curves
  }

  const iceCurves = generateICECurves()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaChartArea className="text-purple-400" />
          부분 의존성 플롯 (PDP)
        </h2>
        <p className="text-gray-300">
          각 특성이 예측에 미치는 한계 효과를 분석하여 모델의 의사결정 과정을 이해합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 뷰 모드 선택 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('1d')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === '1d'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              1D PDP
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === '2d'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              2D PDP
            </button>
            <button
              onClick={() => setViewMode('multi')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'multi'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              다중 비교
            </button>
          </div>

          {/* 특성 선택 */}
          {viewMode === '1d' && (
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedFeature}
                onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSelectedFeature(e.target.value)
                }
              }}
                className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {features.map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
            </div>
          )}

          {viewMode === '2d' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedFeature}
                onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSelectedFeature(e.target.value)
                }
              }}
                className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {features.map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
              <FaArrowsAltH className="text-gray-400" />
              <select
                value={selectedFeature2}
                onChange={(e) => {
              if (e && e.target && e.target.value) {
                setSelectedFeature2(e.target.value)
              }
            }}
                className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {features.filter(f => f !== selectedFeature).map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 부분 의존성 시각화 */}
      {viewMode === '1d' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            {selectedFeature}의 부분 의존성
          </h3>
          
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={pdData1D}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="x" 
                stroke="#9ca3af"
                label={{ value: selectedFeature, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ value: '예측 영향도', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              
              {/* ICE 곡선들 (개별 인스턴스) */}
              {iceCurves.map((curve, index) => (
                <Line
                  key={`ice-${index}`}
                  type="monotone"
                  data={curve}
                  dataKey="y"
                  stroke="#6b7280"
                  strokeWidth={0.5}
                  dot={false}
                  opacity={0.3}
                />
              ))}
              
              {/* PDP 평균 곡선 */}
              <Line
                type="monotone"
                dataKey="y"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                name="평균 효과"
              />
              
              {/* 신뢰구간 */}
              <Area
                type="monotone"
                dataKey="y"
                stroke="none"
                fill="#8b5cf6"
                fillOpacity={0.2}
              />
              
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>

          {/* 특성별 해석 */}
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-purple-400 font-semibold mb-2">해석 가이드</h4>
            <p className="text-gray-300 text-sm">
              {selectedFeature === 'RSI' && 
                'RSI가 30 이하일 때 상승 예측이 강해지고, 70 이상일 때 하락 예측이 강해집니다. 중간 영역에서는 중립적입니다.'}
              {selectedFeature === 'Volume' && 
                '거래량이 증가할수록 예측에 미치는 영향이 로그 스케일로 증가합니다. 높은 거래량은 강한 신호를 의미합니다.'}
              {selectedFeature === 'MACD' && 
                'MACD가 0을 상향 돌파하면 상승 신호, 하향 돌파하면 하락 신호로 작용합니다.'}
              {selectedFeature === 'Whale Activity' && 
                '고래 활동이 70% 이상일 때 급격한 가격 변동 가능성이 증가합니다.'}
            </p>
          </div>
        </motion.div>
      )}

      {viewMode === '2d' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            {selectedFeature} × {selectedFeature2} 상호작용
          </h3>
          
          <div className="flex justify-center">
            <Heatmap
              data={pdData2D}
              xLabels={Array.from({ length: 10 }, (_, i) => `${i * 10}`)}
              yLabels={Array.from({ length: 10 }, (_, i) => `${i * 10}`)}
            />
          </div>

          {/* 범례 */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-gray-400 text-sm">낮은 영향</span>
            <div className="flex h-4">
              {['#1a1a2e', '#16213e', '#0f3460', '#533483', '#c7417b', '#f39c6b', '#ff6b6b'].map((color, i) => (
                <div key={i} className="w-8 h-full" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="text-gray-400 text-sm">높은 영향</span>
          </div>

          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-purple-400 font-semibold mb-2">상호작용 효과</h4>
            <p className="text-gray-300 text-sm">
              두 특성의 조합이 예측에 미치는 영향을 보여줍니다. 
              밝은 색은 상승 예측, 어두운 색은 하락 예측을 의미합니다. 
              대각선 패턴은 두 특성이 독립적임을, 복잡한 패턴은 강한 상호작용을 나타냅니다.
            </p>
          </div>
        </motion.div>
      )}

      {viewMode === 'multi' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">다중 특성 부분 의존성 비교</h3>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={multiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="x" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="RSI" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Volume" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="MACD" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Whale Activity" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">가장 영향력 있는 특성</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>1. RSI - 극단값에서 강한 신호</li>
                <li>2. Volume - 지속적인 양의 상관관계</li>
                <li>3. Whale Activity - 임계값 이상에서 급증</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">특성 간 관계</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• RSI와 Volume이 함께 극단값일 때 시너지</li>
                <li>• MACD는 다른 지표와 독립적으로 작용</li>
                <li>• Whale Activity는 Volume과 양의 상관</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* PDP 활용 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMagic className="text-yellow-400" />
          부분 의존성 플롯 활용법
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">특성 이해</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 각 특성의 한계 효과 파악</li>
              <li>• 비선형 관계 발견</li>
              <li>• 임계값과 변곡점 식별</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">트레이딩 전략</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 최적 진입/청산 지점 설정</li>
              <li>• 특성 조합 전략 수립</li>
              <li>• 리스크 구간 회피</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-green-400 font-semibold mb-2">모델 개선</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 불필요한 특성 제거</li>
              <li>• 특성 변환 방법 결정</li>
              <li>• 상호작용 항 추가</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}