'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, FaWater, FaArrowRight, FaArrowLeft,
  FaExchangeAlt, FaProjectDiagram, FaLightbulb, FaFilter
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine
} from 'recharts'

interface AdvancedSHAPProps {
  symbol: string
}

interface SHAPValue {
  feature: string
  value: number
  impact: number
  contribution: 'positive' | 'negative'
  importance: number
}

export default function AdvancedSHAP({ symbol }: AdvancedSHAPProps) {
  const [selectedView, setSelectedView] = useState<'waterfall' | 'force' | 'dependency' | 'summary'>('waterfall')
  const [selectedFeature, setSelectedFeature] = useState('RSI')
  const [selectedSample, setSelectedSample] = useState(0)

  // SHAP 값 생성 (실제로는 모델에서 계산)
  const generateSHAPValues = (): SHAPValue[] => {
    const features = [
      'RSI', 'MACD', 'Volume', 'Price Change', 'Volatility',
      'MA_20', 'MA_50', 'Bollinger Band', 'ATR', 'OBV'
    ]
    
    return features.map(feature => {
      const impact = (Math.random() - 0.5) * 2
      return {
        feature,
        value: Math.random() * 100,
        impact,
        contribution: impact > 0 ? 'positive' : 'negative',
        importance: Math.abs(impact)
      }
    }).sort((a, b) => b.importance - a.importance)
  }

  const shapValues = useMemo(generateSHAPValues, [selectedSample])

  // Waterfall 차트 데이터
  const waterfallData = useMemo(() => {
    let cumulative = 0.5 // 기본 예측값
    const data = [{ name: 'Base', value: cumulative, fill: '#6b7280' }]
    
    shapValues.forEach(shap => {
      const prevCumulative = cumulative
      cumulative += shap.impact
      data.push({
        name: shap.feature,
        value: shap.impact,
        cumulative,
        prevCumulative,
        fill: shap.contribution === 'positive' ? '#10b981' : '#ef4444'
      })
    })
    
    data.push({ name: 'Prediction', value: cumulative, fill: '#3b82f6' })
    return data
  }, [shapValues])

  // Force Plot 데이터
  const forcePlotData = useMemo(() => {
    const positive = shapValues.filter(s => s.contribution === 'positive')
    const negative = shapValues.filter(s => s.contribution === 'negative')
    
    return {
      positive: positive.sort((a, b) => b.impact - a.impact),
      negative: negative.sort((a, b) => a.impact - b.impact),
      baseValue: 0.5,
      prediction: 0.5 + shapValues.reduce((sum, s) => sum + s.impact, 0)
    }
  }, [shapValues])

  // Dependency Plot 데이터
  const dependencyData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const featureValue = i * 2
      const shapValue = Math.sin(featureValue * 0.1) * 0.5 + (Math.random() - 0.5) * 0.2
      const interactionValue = Math.random() * 100
      
      return {
        x: featureValue,
        y: shapValue,
        interaction: interactionValue,
        color: interactionValue > 50 ? '#10b981' : '#ef4444'
      }
    })
  }, [selectedFeature])

  // Summary Plot 데이터
  const summaryData = useMemo(() => {
    return shapValues.map(shap => ({
      feature: shap.feature,
      importance: shap.importance,
      avgImpact: shap.importance * 0.8 + Math.random() * 0.2,
      samples: Array.from({ length: 20 }, () => ({
        value: Math.random() * 100,
        impact: (Math.random() - 0.5) * shap.importance * 2
      }))
    }))
  }, [shapValues])

  // Waterfall 차트 렌더링
  const renderWaterfall = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">예측 기여도 분해</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={waterfallData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="category" dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
          <YAxis type="number" stroke="#9ca3af" domain={[-1, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: any) => value.toFixed(3)}
          />
          <Bar dataKey="value">
            {waterfallData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
          <ReferenceLine y={0} stroke="#6b7280" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="bg-gray-700/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          기본 예측값 <span className="text-white font-bold">0.500</span>에서 시작하여
          각 특성의 기여도가 더해져 최종 예측값 <span className="text-blue-400 font-bold">
          {(0.5 + shapValues.reduce((sum, s) => sum + s.impact, 0)).toFixed(3)}</span>이 됩니다.
        </p>
      </div>
    </div>
  )

  // Force Plot 렌더링
  const renderForce = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Force Plot 시각화</h4>
      
      <div className="bg-gray-900/50 rounded-xl p-6">
        {/* 예측값 표시 */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-400">기본값</div>
            <div className="text-2xl font-bold text-gray-400">{forcePlotData.baseValue.toFixed(3)}</div>
          </div>
          
          <FaArrowRight className="text-gray-400 text-2xl" />
          
          <div className="text-center">
            <div className="text-sm text-gray-400">예측값</div>
            <div className="text-2xl font-bold text-blue-400">{forcePlotData.prediction.toFixed(3)}</div>
          </div>
        </div>

        {/* Force 막대 */}
        <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            {/* 음의 기여도 */}
            <div className="flex-1 flex justify-end">
              {forcePlotData.negative.map((shap, index) => (
                <motion.div
                  key={shap.feature}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(shap.impact) * 100}px` }}
                  className="bg-red-500 h-full relative group"
                  style={{ marginRight: index > 0 ? '1px' : 0 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                    <span className="text-xs text-white font-semibold">{shap.feature}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 중심선 */}
            <div className="w-1 bg-gray-600" />
            
            {/* 양의 기여도 */}
            <div className="flex-1 flex">
              {forcePlotData.positive.map((shap, index) => (
                <motion.div
                  key={shap.feature}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(shap.impact) * 100}px` }}
                  className="bg-green-500 h-full relative group"
                  style={{ marginLeft: index > 0 ? '1px' : 0 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                    <span className="text-xs text-white font-semibold">{shap.feature}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-gray-400">예측값 감소</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-400">예측값 증가</span>
          </div>
        </div>
      </div>

      {/* 상세 기여도 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-green-400 font-semibold mb-2">긍정적 기여 특성</h5>
          <div className="space-y-1">
            {forcePlotData.positive.slice(0, 5).map(shap => (
              <div key={shap.feature} className="flex justify-between text-sm">
                <span className="text-gray-400">{shap.feature}</span>
                <span className="text-green-400 font-mono">+{shap.impact.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-red-400 font-semibold mb-2">부정적 기여 특성</h5>
          <div className="space-y-1">
            {forcePlotData.negative.slice(0, 5).map(shap => (
              <div key={shap.feature} className="flex justify-between text-sm">
                <span className="text-gray-400">{shap.feature}</span>
                <span className="text-red-400 font-mono">{shap.impact.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Dependency Plot 렌더링
  const renderDependency = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">특성 의존성 분석</h4>
        <select
          value={selectedFeature}
          onChange={(e) => {
              if (e && e.target && e.target.value) {
                setSelectedFeature(e.target.value)
              }
            }}
          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
        >
          {shapValues.map(shap => (
            <option key={shap.feature} value={shap.feature}>{shap.feature}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            dataKey="x" 
            stroke="#9ca3af"
            label={{ value: `${selectedFeature} 값`, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            stroke="#9ca3af"
            label={{ value: 'SHAP 값', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Scatter name="SHAP Values" data={dependencyData}>
            {dependencyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="5 5" />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="bg-gray-700/30 rounded-lg p-4">
        <h5 className="text-blue-400 font-semibold mb-2">패턴 분석</h5>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• {selectedFeature} 값이 증가할수록 예측에 미치는 영향이 비선형적으로 변화</li>
          <li>• 색상은 다른 특성과의 상호작용 강도를 나타냄</li>
          <li>• 수평선 근처의 점들은 해당 특성 값에서 중립적 영향</li>
        </ul>
      </div>
    </div>
  )

  // Summary Plot 렌더링
  const renderSummary = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">SHAP 요약 플롯</h4>
      
      <div className="space-y-3">
        {summaryData.map((feature, index) => (
          <motion.div
            key={feature.feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{feature.feature}</span>
              <span className="text-sm text-gray-400">평균 |SHAP|: {feature.avgImpact.toFixed(3)}</span>
            </div>
            
            {/* SHAP 값 분포 */}
            <div className="h-8 bg-gray-800 rounded overflow-hidden relative">
              {feature.samples.map((sample, idx) => (
                <div
                  key={idx}
                  className="absolute h-full w-1"
                  style={{
                    left: `${(sample.value / 100) * 100}%`,
                    backgroundColor: sample.impact > 0 ? '#10b981' : '#ef4444',
                    opacity: 0.6
                  }}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>낮은 특성값</span>
              <span>높은 특성값</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaProjectDiagram className="text-cyan-400" />
          고급 SHAP 분석
        </h2>
        <p className="text-gray-300">
          XGBoost 모델의 예측을 특성별 기여도로 분해하여 해석합니다
        </p>
      </div>

      {/* 뷰 선택 탭 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700/50">
        <div className="flex gap-2">
          {[
            { id: 'waterfall', label: 'Waterfall Plot', icon: <FaWater /> },
            { id: 'force', label: 'Force Plot', icon: <FaExchangeAlt /> },
            { id: 'dependency', label: 'Dependency Plot', icon: <FaChartBar /> },
            { id: 'summary', label: 'Summary Plot', icon: <FaFilter /> }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                selectedView === view.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50'
              }`}
            >
              {view.icon}
              <span className="font-medium">{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 샘플 선택 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">샘플 #{selectedSample + 1} 분석</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSample(Math.max(0, selectedSample - 1))}
              className="px-3 py-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50"
            >
              <FaArrowLeft />
            </button>
            <span className="text-white font-mono">Sample {selectedSample + 1} / 100</span>
            <button
              onClick={() => setSelectedSample(Math.min(99, selectedSample + 1))}
              className="px-3 py-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>

        {/* 선택된 뷰 렌더링 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {selectedView === 'waterfall' && renderWaterfall()}
            {selectedView === 'force' && renderForce()}
            {selectedView === 'dependency' && renderDependency()}
            {selectedView === 'summary' && renderSummary()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SHAP 해석 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          SHAP 값 해석 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">SHAP 값의 의미</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 양수(+): 예측값을 증가시키는 기여</li>
              <li>• 음수(-): 예측값을 감소시키는 기여</li>
              <li>• 절대값: 기여도의 크기</li>
              <li>• 0에 가까움: 해당 특성의 영향 미미</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">활용 방법</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 개별 예측 설명 및 검증</li>
              <li>• 모델 디버깅 및 개선</li>
              <li>• 특성 엔지니어링 인사이트</li>
              <li>• 비즈니스 의사결정 지원</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}