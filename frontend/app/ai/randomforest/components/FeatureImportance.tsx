'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaSortAmountDown, FaInfoCircle, FaFilter,
  FaLayerGroup, FaTachometerAlt, FaBalanceScale, FaLightbulb
} from 'react-icons/fa'
import { 
  BarChart, Bar, TreemapChart, Treemap, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  LineChart, Line, Area, AreaChart, ComposedChart
} from 'recharts'

interface FeatureImportanceProps {
  symbol: string
}

// 특성 카테고리별 색상
const categoryColors: { [key: string]: string } = {
  '기술적 지표': '#3b82f6',
  '시장 데이터': '#10b981',
  '온체인 데이터': '#8b5cf6',
  '센티먼트': '#f59e0b',
  '거시경제': '#ef4444'
}

export default function FeatureImportance({ symbol }: FeatureImportanceProps) {
  const [sortBy, setSortBy] = useState<'importance' | 'category' | 'gain'>('importance')
  const [viewMode, setViewMode] = useState<'bar' | 'treemap' | 'radar'>('bar')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 특성 중요도 데이터 생성
  const generateFeatureData = () => {
    const features = [
      // 기술적 지표
      { name: 'RSI (14일)', importance: 0.152, gain: 0.089, category: '기술적 지표', splits: 243 },
      { name: 'MACD Signal', importance: 0.138, gain: 0.076, category: '기술적 지표', splits: 198 },
      { name: 'Bollinger Bands', importance: 0.098, gain: 0.052, category: '기술적 지표', splits: 156 },
      { name: 'MA20', importance: 0.087, gain: 0.048, category: '기술적 지표', splits: 134 },
      { name: 'ATR', importance: 0.065, gain: 0.038, category: '기술적 지표', splits: 98 },
      
      // 시장 데이터
      { name: '거래량 비율', importance: 0.125, gain: 0.072, category: '시장 데이터', splits: 187 },
      { name: '가격 변동성', importance: 0.095, gain: 0.055, category: '시장 데이터', splits: 145 },
      { name: '시가총액 순위', importance: 0.052, gain: 0.032, category: '시장 데이터', splits: 76 },
      
      // 온체인 데이터
      { name: '고래 활동', importance: 0.113, gain: 0.068, category: '온체인 데이터', splits: 167 },
      { name: '네트워크 활성도', importance: 0.078, gain: 0.045, category: '온체인 데이터', splits: 112 },
      { name: '거래소 유입량', importance: 0.062, gain: 0.035, category: '온체인 데이터', splits: 89 },
      
      // 센티먼트
      { name: 'Fear & Greed', importance: 0.089, gain: 0.051, category: '센티먼트', splits: 123 },
      { name: '소셜 미디어', importance: 0.058, gain: 0.034, category: '센티먼트', splits: 87 },
      
      // 거시경제
      { name: 'DXY 지수', importance: 0.045, gain: 0.028, category: '거시경제', splits: 65 },
      { name: 'S&P 500', importance: 0.038, gain: 0.022, category: '거시경제', splits: 54 }
    ]

    // 필터링
    if (selectedCategory !== 'all') {
      return features.filter(f => f.category === selectedCategory)
    }

    // 정렬
    switch (sortBy) {
      case 'importance':
        return features.sort((a, b) => b.importance - a.importance)
      case 'gain':
        return features.sort((a, b) => b.gain - a.gain)
      case 'category':
        return features.sort((a, b) => a.category.localeCompare(b.category))
      default:
        return features
    }
  }

  const featureData = generateFeatureData()

  // 카테고리별 집계
  const categoryData = (() => {
    const categoryMap = new Map()
    
    featureData.forEach(feature => {
      if (!categoryMap.has(feature.category)) {
        categoryMap.set(feature.category, {
          category: feature.category,
          importance: 0,
          count: 0,
          features: []
        })
      }
      
      const cat = categoryMap.get(feature.category)
      cat.importance += feature.importance
      cat.count += 1
      cat.features.push(feature)
    })
    
    return Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      avgImportance: cat.importance / cat.count
    }))
  })()

  // Treemap 데이터 변환
  const treemapData = {
    name: 'Features',
    children: categoryData.map(cat => ({
      name: cat.category,
      children: cat.features.map(f => ({
        name: f.name,
        size: f.importance * 1000,
        gain: f.gain,
        splits: f.splits
      }))
    }))
  }

  // Radar 차트 데이터
  const radarData = featureData.slice(0, 8).map(f => ({
    feature: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
    importance: f.importance * 100,
    gain: f.gain * 100,
    fullMark: 20
  }))

  // 시간에 따른 중요도 변화 (시뮬레이션)
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    RSI: 15 + Math.sin(i / 4) * 3 + Math.random() * 2,
    Volume: 12 + Math.cos(i / 3) * 2 + Math.random() * 1.5,
    Whale: 11 + Math.sin(i / 5) * 2.5 + Math.random() * 1.8,
    MACD: 13 + Math.cos(i / 4) * 2.2 + Math.random() * 1.2
  }))

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaChartBar className="text-blue-400" />
          특성 중요도 분석
        </h2>
        <p className="text-gray-300">
          Random Forest가 예측에 사용하는 각 특성의 상대적 중요도를 분석합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 뷰 모드 선택 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('bar')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'bar'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              막대 차트
            </button>
            <button
              onClick={() => setViewMode('treemap')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'treemap'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              트리맵
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'radar'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              레이더
            </button>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex items-center gap-2">
            <FaSortAmountDown className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSortBy(e.target.value as any)
                }
              }}
              className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="importance">중요도순</option>
              <option value="gain">정보 이득순</option>
              <option value="category">카테고리별</option>
            </select>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSelectedCategory(e.target.value)
                }
              }}
              className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">전체</option>
              {Object.keys(categoryColors).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 중요도 시각화 */}
      {viewMode === 'bar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={featureData} margin={{ top: 20, right: 30, bottom: 80, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => (value * 100).toFixed(1) + '%'}
              />
              <Bar dataKey="importance" name="중요도">
                {featureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.category]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {viewMode === 'treemap' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <ResponsiveContainer width="100%" height={500}>
            <Treemap
              data={treemapData.children}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                        <p className="text-white font-semibold">{data.name}</p>
                        <p className="text-gray-400 text-sm">
                          중요도: {((data.size || data.value) / 10).toFixed(1)}%
                        </p>
                        {data.gain && (
                          <p className="text-gray-400 text-sm">
                            정보 이득: {(data.gain * 100).toFixed(1)}%
                          </p>
                        )}
                        {data.splits && (
                          <p className="text-gray-400 text-sm">
                            분할 횟수: {data.splits}
                          </p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </motion.div>
      )}

      {viewMode === 'radar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="feature" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 20]} stroke="#9ca3af" />
              <Radar
                name="중요도"
                dataKey="importance"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="정보 이득"
                dataKey="gain"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* 카테고리별 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categoryData.map((cat, index) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
          >
            <div 
              className="w-full h-2 rounded-full mb-3"
              style={{ backgroundColor: categoryColors[cat.category] + '40' }}
            >
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${(cat.importance * 100).toFixed(0)}%`,
                  backgroundColor: categoryColors[cat.category]
                }}
              />
            </div>
            <h4 className="text-white font-semibold text-sm">{cat.category}</h4>
            <div className="text-2xl font-bold text-white mt-1">
              {(cat.importance * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {cat.count}개 특성
            </div>
          </motion.div>
        ))}
      </div>

      {/* 시간에 따른 중요도 변화 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaTachometerAlt className="text-yellow-400" />
          시간대별 특성 중요도 변화
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
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
            <Line type="monotone" dataKey="Whale" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="MACD" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
        
        <p className="text-gray-400 text-sm mt-4">
          시장 상황에 따라 각 특성의 중요도가 동적으로 변화합니다. 
          변동성이 큰 시간대에는 기술적 지표의 중요도가 증가하는 경향을 보입니다.
        </p>
      </motion.div>

      {/* 특성 중요도 해석 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          특성 중요도 활용 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">중요도 메트릭 이해</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>중요도(Importance):</strong> 해당 특성이 분할에 사용된 빈도와 정보 이득의 가중 평균</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>정보 이득(Gain):</strong> 해당 특성으로 분할 시 불순도 감소량</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>분할 횟수(Splits):</strong> 전체 트리에서 해당 특성이 사용된 총 횟수</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-green-400 font-semibold mb-2">실전 활용 방법</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>상위 5개 특성에 집중하여 트레이딩 전략 수립</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>카테고리별 중요도를 참고하여 데이터 수집 우선순위 결정</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>시간대별 변화를 모니터링하여 동적 전략 조정</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}