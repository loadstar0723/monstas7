'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBrain, FaChartBar, FaArrowUp, FaArrowDown, 
  FaInfoCircle, FaLightbulb, FaBalanceScale, FaFilter
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Area, AreaChart, RadialBarChart,
  RadialBar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

interface SHAPAnalysisProps {
  symbol: string
}

export default function SHAPAnalysis({ symbol }: SHAPAnalysisProps) {
  const [selectedPrediction, setSelectedPrediction] = useState(0)
  const [viewMode, setViewMode] = useState<'waterfall' | 'force' | 'summary'>('waterfall')
  const [featureFilter, setFeatureFilter] = useState<'all' | 'positive' | 'negative'>('all')

  // SHAP 값 데이터 생성
  const generateSHAPData = () => {
    const features = [
      { name: 'RSI', value: 65.4, shap: 0.23, baseline: 50 },
      { name: 'MACD Signal', value: 1.2, shap: 0.18, baseline: 0 },
      { name: 'Volume Ratio', value: 1.8, shap: 0.15, baseline: 1 },
      { name: 'MA20 Distance', value: 2.3, shap: 0.12, baseline: 0 },
      { name: 'Bollinger Position', value: 0.7, shap: -0.08, baseline: 0.5 },
      { name: 'ATR', value: 3.2, shap: -0.06, baseline: 2 },
      { name: 'Market Cap Rank', value: 1, shap: 0.09, baseline: 10 },
      { name: 'Whale Activity', value: 85, shap: 0.14, baseline: 50 },
      { name: 'Fear & Greed', value: 72, shap: -0.11, baseline: 50 },
      { name: 'Network Activity', value: 120, shap: 0.07, baseline: 100 }
    ]

    // 필터링
    if (featureFilter === 'positive') {
      return features.filter(f => f.shap > 0).sort((a, b) => b.shap - a.shap)
    } else if (featureFilter === 'negative') {
      return features.filter(f => f.shap < 0).sort((a, b) => a.shap - b.shap)
    }
    
    return features.sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
  }

  const shapData = generateSHAPData()

  // 예측 샘플 데이터
  const predictions = [
    {
      id: 0,
      time: '2024-01-15 14:30',
      prediction: 'UP',
      probability: 0.73,
      baseValue: 0.5,
      shapSum: 0.23
    },
    {
      id: 1,
      time: '2024-01-15 15:00',
      prediction: 'DOWN',
      probability: 0.31,
      baseValue: 0.5,
      shapSum: -0.19
    },
    {
      id: 2,
      time: '2024-01-15 15:30',
      prediction: 'UP',
      probability: 0.68,
      baseValue: 0.5,
      shapSum: 0.18
    }
  ]

  const currentPrediction = predictions[selectedPrediction]

  // Waterfall 차트용 데이터 변환
  const waterfallData = (() => {
    let cumulative = currentPrediction.baseValue
    const data = [
      { 
        name: '기준값', 
        value: cumulative, 
        fill: '#6b7280',
        isBase: true 
      }
    ]
    
    shapData.forEach(feature => {
      const prevCumulative = cumulative
      cumulative += feature.shap
      data.push({
        name: feature.name,
        value: feature.shap,
        cumulative,
        prevCumulative,
        fill: feature.shap > 0 ? '#10b981' : '#ef4444',
        isBase: false
      })
    })
    
    data.push({
      name: '최종 예측',
      value: cumulative,
      fill: '#3b82f6',
      isBase: true
    })
    
    return data
  })()

  // Force Plot 데이터
  const forcePlotData = shapData.map((feature, index) => ({
    x: index,
    y: feature.shap,
    name: feature.name,
    value: feature.value,
    impact: Math.abs(feature.shap)
  }))

  // Summary Plot 데이터 (여러 예측에 대한 SHAP 값)
  const summaryData = shapData.map(feature => ({
    feature: feature.name,
    min: feature.shap * 0.5,
    q1: feature.shap * 0.7,
    median: feature.shap,
    q3: feature.shap * 1.3,
    max: feature.shap * 1.5,
    current: feature.shap
  }))

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaBrain className="text-purple-400" />
          SHAP 분석 - 모델 설명가능성
        </h2>
        <p className="text-gray-300">
          각 특성이 예측에 미치는 영향을 정량적으로 분석하여 모델의 의사결정을 투명하게 설명합니다
        </p>
      </div>

      {/* 예측 선택 및 컨트롤 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">예측 샘플 선택</h3>
            <div className="flex gap-2">
              {predictions.map((pred) => (
                <button
                  key={pred.id}
                  onClick={() => setSelectedPrediction(pred.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedPrediction === pred.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 border border-gray-600/50'
                  }`}
                >
                  <div className="text-sm">{pred.time}</div>
                  <div className={`font-semibold ${
                    pred.prediction === 'UP' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pred.prediction} ({(pred.probability * 100).toFixed(0)}%)
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('waterfall')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'waterfall'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              Waterfall
            </button>
            <button
              onClick={() => setViewMode('force')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'force'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              Force Plot
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'summary'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              Summary
            </button>
          </div>
        </div>

        {/* 필터 옵션 */}
        <div className="flex items-center gap-4">
          <FaFilter className="text-gray-400" />
          <button
            onClick={() => setFeatureFilter('all')}
            className={`px-3 py-1 rounded text-sm ${
              featureFilter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-400'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFeatureFilter('positive')}
            className={`px-3 py-1 rounded text-sm ${
              featureFilter === 'positive' ? 'bg-green-600 text-white' : 'text-gray-400'
            }`}
          >
            긍정적 영향
          </button>
          <button
            onClick={() => setFeatureFilter('negative')}
            className={`px-3 py-1 rounded text-sm ${
              featureFilter === 'negative' ? 'bg-red-600 text-white' : 'text-gray-400'
            }`}
          >
            부정적 영향
          </button>
        </div>
      </div>

      {/* SHAP 시각화 */}
      <AnimatePresence mode="wait">
        {viewMode === 'waterfall' && (
          <motion.div
            key="waterfall"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-xl font-bold text-white mb-4">Waterfall Plot</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={waterfallData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => value.toFixed(3)}
                />
                <Bar dataKey="value" fill="#3b82f6">
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <ReferenceLine y={0.5} stroke="#6b7280" strokeDasharray="5 5" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {viewMode === 'force' && (
          <motion.div
            key="force"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-xl font-bold text-white mb-4">Force Plot</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" hide />
                <YAxis type="number" stroke="#9ca3af" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                          <p className="text-white font-semibold">{data.name}</p>
                          <p className="text-gray-400 text-sm">값: {data.value}</p>
                          <p className={`text-sm ${data.y > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            SHAP: {data.y.toFixed(3)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="5 5" />
                <Scatter name="Features" data={forcePlotData} fill="#8884d8">
                  {forcePlotData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.y > 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Force 화살표 시각화 */}
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="text-gray-400 text-sm">Base: {currentPrediction.baseValue}</div>
                {shapData.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className={`h-8 flex items-center justify-center text-xs px-2 ${
                        feature.shap > 0 ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.abs(feature.shap) * 200}px` }}
                    >
                      {feature.name.substring(0, 3)}
                    </div>
                  </div>
                ))}
                <div className="text-blue-400 text-sm font-semibold ml-2">
                  = {(currentPrediction.baseValue + currentPrediction.shapSum).toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-xl font-bold text-white mb-4">Summary Plot</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={summaryData} 
                layout="horizontal"
                margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="feature" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="median" fill="#3b82f6">
                  {summaryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.median > 0 ? '#10b981' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHAP 값 상세 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-blue-400" />
          특성별 영향도 상세
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">특성</th>
                <th className="text-right py-3 px-4 text-gray-400">현재값</th>
                <th className="text-right py-3 px-4 text-gray-400">기준값</th>
                <th className="text-right py-3 px-4 text-gray-400">SHAP 값</th>
                <th className="text-right py-3 px-4 text-gray-400">영향도</th>
                <th className="text-center py-3 px-4 text-gray-400">방향</th>
              </tr>
            </thead>
            <tbody>
              {shapData.map((feature, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white">{feature.name}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{feature.value}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{feature.baseline}</td>
                  <td className={`py-3 px-4 text-right font-mono ${
                    feature.shap > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {feature.shap > 0 ? '+' : ''}{feature.shap.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${feature.shap > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.abs(feature.shap) * 200}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">
                        {(Math.abs(feature.shap) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {feature.shap > 0 ? (
                      <FaArrowUp className="text-green-400 mx-auto" />
                    ) : (
                      <FaArrowDown className="text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* SHAP 해석 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          SHAP 값 해석 방법
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">기본 개념</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>SHAP 값은 각 특성이 예측에 미치는 기여도를 나타냅니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>양수(+)는 상승 예측에 기여, 음수(-)는 하락 예측에 기여</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>절대값이 클수록 해당 특성의 영향력이 큼</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">실전 활용</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>주요 영향 특성을 파악하여 투자 전략 수립</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>예측의 신뢰성을 검증하고 리스크 평가</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>시장 변화에 따른 모델 행동 이해</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}