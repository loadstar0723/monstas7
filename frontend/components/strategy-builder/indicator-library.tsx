'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaSearch, FaFilter, FaStar,
  FaInfoCircle, FaCode, FaCopy
} from 'react-icons/fa'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

interface Indicator {
  id: string
  name: string
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'custom'
  description: string
  formula: string
  parameters: {
    name: string
    type: 'number' | 'string' | 'select'
    default: any
    min?: number
    max?: number
    options?: string[]
  }[]
  popularity: number
  accuracy: number
}

const indicators: Indicator[] = [
  {
    id: 'rsi',
    name: 'RSI (Relative Strength Index)',
    category: 'momentum',
    description: '과매수/과매도 상태를 측정하는 모멘텀 지표',
    formula: 'RSI = 100 - (100 / (1 + RS))',
    parameters: [
      { name: 'period', type: 'number', default: 14, min: 2, max: 100 },
      { name: 'overbought', type: 'number', default: 70, min: 50, max: 90 },
      { name: 'oversold', type: 'number', default: 30, min: 10, max: 50 }
    ],
    popularity: 95,
    accuracy: 78
  },
  {
    id: 'macd',
    name: 'MACD',
    category: 'trend',
    description: '추세 추종 모멘텀 지표',
    formula: 'MACD = EMA(12) - EMA(26)',
    parameters: [
      { name: 'fast', type: 'number', default: 12, min: 1, max: 50 },
      { name: 'slow', type: 'number', default: 26, min: 1, max: 100 },
      { name: 'signal', type: 'number', default: 9, min: 1, max: 50 }
    ],
    popularity: 92,
    accuracy: 82
  },
  {
    id: 'bb',
    name: 'Bollinger Bands',
    category: 'volatility',
    description: '가격 변동성을 측정하는 밴드 지표',
    formula: 'Upper = SMA + (STD × 2)',
    parameters: [
      { name: 'period', type: 'number', default: 20, min: 5, max: 200 },
      { name: 'stdDev', type: 'number', default: 2, min: 0.5, max: 5 },
      { name: 'source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low', 'hl2', 'hlc3', 'ohlc4'] }
    ],
    popularity: 88,
    accuracy: 75
  },
  {
    id: 'sma',
    name: 'Simple Moving Average',
    category: 'trend',
    description: '단순 이동평균선',
    formula: 'SMA = (P1 + P2 + ... + Pn) / n',
    parameters: [
      { name: 'period', type: 'number', default: 50, min: 1, max: 500 },
      { name: 'source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low'] }
    ],
    popularity: 98,
    accuracy: 70
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    category: 'trend',
    description: '지수 이동평균선',
    formula: 'EMA = (Close - EMAprev) × k + EMAprev',
    parameters: [
      { name: 'period', type: 'number', default: 20, min: 1, max: 500 },
      { name: 'source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low'] }
    ],
    popularity: 93,
    accuracy: 74
  },
  {
    id: 'atr',
    name: 'Average True Range',
    category: 'volatility',
    description: '평균 진정 범위 - 변동성 측정',
    formula: 'ATR = MA(TR, n)',
    parameters: [
      { name: 'period', type: 'number', default: 14, min: 1, max: 100 }
    ],
    popularity: 85,
    accuracy: 80
  },
  {
    id: 'stoch',
    name: 'Stochastic Oscillator',
    category: 'momentum',
    description: '가격의 모멘텀을 측정하는 오실레이터',
    formula: '%K = (Close - Low) / (High - Low) × 100',
    parameters: [
      { name: 'kPeriod', type: 'number', default: 14, min: 1, max: 100 },
      { name: 'dPeriod', type: 'number', default: 3, min: 1, max: 100 },
      { name: 'smooth', type: 'number', default: 3, min: 1, max: 100 }
    ],
    popularity: 82,
    accuracy: 76
  },
  {
    id: 'vwap',
    name: 'VWAP',
    category: 'volume',
    description: '거래량 가중 평균 가격',
    formula: 'VWAP = Σ(Price × Volume) / Σ(Volume)',
    parameters: [
      { name: 'anchor', type: 'select', default: 'session', options: ['session', 'week', 'month'] }
    ],
    popularity: 79,
    accuracy: 83
  }
]

export default function IndicatorLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
  const [customParameters, setCustomParameters] = useState<Record<string, any>>({})

  const categories = [
    { id: 'all', name: '전체', count: indicators.length },
    { id: 'trend', name: '추세', count: indicators.filter(i => i.category === 'trend').length },
    { id: 'momentum', name: '모멘텀', count: indicators.filter(i => i.category === 'momentum').length },
    { id: 'volatility', name: '변동성', count: indicators.filter(i => i.category === 'volatility').length },
    { id: 'volume', name: '거래량', count: indicators.filter(i => i.category === 'volume').length },
    { id: 'custom', name: '사용자정의', count: 0 }
  ]

  const filteredIndicators = indicators.filter(indicator => {
    const matchesCategory = selectedCategory === 'all' || indicator.category === selectedCategory
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const generateSampleData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      x: i,
      price: 50000 + Math.random() * 10000 + Math.sin(i / 5) * 5000,
      indicator: 50 + Math.sin(i / 3) * 30 + Math.random() * 10
    }))
  }

  const [sampleData] = useState(generateSampleData())

  const handleParameterChange = (paramName: string, value: any) => {
    setCustomParameters({
      ...customParameters,
      [paramName]: value
    })
  }

  const generatePineScript = (indicator: Indicator) => {
    // 실제로는 더 복잡한 코드 생성 로직
    return `//@version=5
indicator("${indicator.name}", overlay=true)
${indicator.parameters.map(p => `${p.name} = input.int(${p.default}, "${p.name}")`).join('\n')}

// ${indicator.formula}
plot(close, color=color.blue)`
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="지표 검색..."
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <FaFilter /> 필터
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIndicators.map((indicator) => (
          <motion.div
            key={indicator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
            onClick={() => setSelectedIndicator(indicator)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{indicator.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{indicator.description}</p>
              </div>
              <FaStar className={`text-yellow-400 ${indicator.popularity > 90 ? 'opacity-100' : 'opacity-50'}`} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                카테고리: <span className="text-white">{indicator.category}</span>
              </span>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  인기도: <span className="text-green-400">{indicator.popularity}%</span>
                </span>
                <span className="text-gray-400">
                  정확도: <span className="text-blue-400">{indicator.accuracy}%</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Indicator Detail Modal */}
      {selectedIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIndicator(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedIndicator.name}</h2>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview Chart */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">미리보기</h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sampleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="x" stroke="#9CA3AF" />
                      <YAxis yAxisId="price" orientation="left" stroke="#9CA3AF" />
                      <YAxis yAxisId="indicator" orientation="right" stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="indicator"
                        type="monotone"
                        dataKey="indicator"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <ReferenceLine yAxisId="indicator" y={70} stroke="#EF4444" strokeDasharray="5 5" />
                      <ReferenceLine yAxisId="indicator" y={30} stroke="#EF4444" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">파라미터 설정</h3>
                <div className="space-y-4">
                  {selectedIndicator.parameters.map((param) => (
                    <div key={param.name}>
                      <label className="block text-sm text-gray-400 mb-2">
                        {param.name}
                      </label>
                      {param.type === 'number' ? (
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            value={customParameters[param.name] || param.default}
                            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
                            className="flex-1"
                          />
                          <input
                            type="number"
                            min={param.min}
                            max={param.max}
                            value={customParameters[param.name] || param.default}
                            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
                            className="w-20 bg-gray-700 text-white px-3 py-2 rounded"
                          />
                        </div>
                      ) : param.type === 'select' ? (
                        <select
                          value={customParameters[param.name] || param.default}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                        >
                          {param.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formula and Code */}
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-400" />
                  공식
                </h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <code className="text-green-400">{selectedIndicator.formula}</code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaCode className="text-purple-400" />
                    Pine Script 코드
                  </h3>
                  <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <FaCopy /> 복사
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre">
                    {generatePineScript(selectedIndicator)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                전략에 추가
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                파라미터 초기화
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}