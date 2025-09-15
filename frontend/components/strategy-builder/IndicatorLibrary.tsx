'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaInfo, FaPlus, FaSearch } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

interface Indicator {
  id: string
  name: string
  category: string
  description: string
  parameters: {
    name: string
    type: 'number' | 'select' | 'boolean'
    default: any
    options?: string[]
    min?: number
    max?: number
  }[]
  formula?: string
  example?: any[]
}

export default function IndicatorLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)

  // 지표 데이터베이스
  const indicators: Indicator[] = [
    {
      id: 'rsi',
      name: 'RSI (Relative Strength Index)',
      category: 'momentum',
      description: '과매수/과매도 상태를 나타내는 모멘텀 지표. 0-100 범위에서 70 이상은 과매수, 30 이하는 과매도를 나타냄.',
      parameters: [
        { name: 'period', type: 'number', default: 14, min: 2, max: 100 },
        { name: 'overbought', type: 'number', default: 70, min: 50, max: 90 },
        { name: 'oversold', type: 'number', default: 30, min: 10, max: 50 }
      ],
      formula: 'RSI = 100 - (100 / (1 + RS))\nRS = Average Gain / Average Loss',
      example: Array.from({ length: 50 }, (_, i) => ({
        time: i,
        value: 50 + Math.sin(i / 5) * 30 + (Math.random() - 0.5) * 10
      }))
    },
    {
      id: 'macd',
      name: 'MACD (Moving Average Convergence Divergence)',
      category: 'trend',
      description: '두 이동평균의 차이를 이용한 추세 추종 지표. 시그널선과의 교차로 매매 신호 생성.',
      parameters: [
        { name: 'fastPeriod', type: 'number', default: 12, min: 2, max: 50 },
        { name: 'slowPeriod', type: 'number', default: 26, min: 10, max: 100 },
        { name: 'signalPeriod', type: 'number', default: 9, min: 2, max: 50 }
      ],
      formula: 'MACD = EMA(12) - EMA(26)\nSignal = EMA(9) of MACD\nHistogram = MACD - Signal'
    },
    {
      id: 'bb',
      name: '볼린저 밴드 (Bollinger Bands)',
      category: 'volatility',
      description: '가격의 상대적 높낮이와 변동성을 나타내는 지표. 밴드 확장/수축으로 변동성 파악.',
      parameters: [
        { name: 'period', type: 'number', default: 20, min: 5, max: 100 },
        { name: 'stdDev', type: 'number', default: 2, min: 1, max: 3 },
        { name: 'maType', type: 'select', default: 'sma', options: ['sma', 'ema', 'wma'] }
      ]
    },
    {
      id: 'stoch',
      name: 'Stochastic Oscillator',
      category: 'momentum',
      description: '현재 가격이 일정 기간 동안의 가격 범위에서 어디에 위치하는지를 나타내는 지표.',
      parameters: [
        { name: 'kPeriod', type: 'number', default: 14, min: 3, max: 50 },
        { name: 'dPeriod', type: 'number', default: 3, min: 1, max: 20 },
        { name: 'smooth', type: 'number', default: 3, min: 1, max: 10 }
      ]
    },
    {
      id: 'atr',
      name: 'ATR (Average True Range)',
      category: 'volatility',
      description: '변동성을 측정하는 지표. 손절 및 포지션 크기 결정에 활용.',
      parameters: [
        { name: 'period', type: 'number', default: 14, min: 2, max: 100 }
      ]
    },
    {
      id: 'adx',
      name: 'ADX (Average Directional Index)',
      category: 'trend',
      description: '추세의 강도를 측정하는 지표. 25 이상이면 강한 추세.',
      parameters: [
        { name: 'period', type: 'number', default: 14, min: 5, max: 50 }
      ]
    },
    {
      id: 'cci',
      name: 'CCI (Commodity Channel Index)',
      category: 'momentum',
      description: '평균으로부터의 편차를 측정하는 지표. ±100을 기준으로 과매수/과매도 판단.',
      parameters: [
        { name: 'period', type: 'number', default: 20, min: 5, max: 100 }
      ]
    },
    {
      id: 'obv',
      name: 'OBV (On Balance Volume)',
      category: 'volume',
      description: '거래량을 누적하여 가격 움직임을 예측하는 지표.',
      parameters: []
    },
    {
      id: 'vwap',
      name: 'VWAP (Volume Weighted Average Price)',
      category: 'volume',
      description: '거래량 가중 평균가격. 기관 트레이더들이 사용하는 벤치마크.',
      parameters: [
        { name: 'anchor', type: 'select', default: 'session', options: ['session', 'week', 'month'] }
      ]
    },
    {
      id: 'ichimoku',
      name: 'Ichimoku Cloud',
      category: 'trend',
      description: '다양한 시간대의 정보를 종합한 종합적인 추세 지표.',
      parameters: [
        { name: 'tenkan', type: 'number', default: 9, min: 5, max: 20 },
        { name: 'kijun', type: 'number', default: 26, min: 10, max: 50 },
        { name: 'senkou', type: 'number', default: 52, min: 20, max: 100 }
      ]
    }
  ]

  // 카테고리별 필터링
  const categories = ['all', 'momentum', 'trend', 'volatility', 'volume']
  
  // 필터링된 지표
  const filteredIndicators = indicators.filter(indicator => {
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || indicator.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="지표 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '전체' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* 지표 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIndicators.map((indicator) => (
          <motion.div
            key={indicator.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedIndicator(indicator)}
            className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">{indicator.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                indicator.category === 'momentum' ? 'bg-blue-500/20 text-blue-400' :
                indicator.category === 'trend' ? 'bg-green-500/20 text-green-400' :
                indicator.category === 'volatility' ? 'bg-purple-500/20 text-purple-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {indicator.category}
              </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{indicator.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                파라미터: {indicator.parameters.length}개
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // 지표 추가 로직
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"
              >
                <FaPlus className="text-xs" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 지표 상세 정보 모달 */}
      {selectedIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIndicator(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedIndicator.name}</h3>
                <p className="text-gray-400 mt-1">{selectedIndicator.description}</p>
              </div>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* 예제 차트 */}
            {selectedIndicator.example && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">예제 차트</h4>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={selectedIndicator.example}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 파라미터 */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">파라미터 설정</h4>
              <div className="space-y-3">
                {selectedIndicator.parameters.map((param) => (
                  <div key={param.name} className="bg-gray-900/50 rounded-lg p-3">
                    <label className="block text-sm text-gray-400 mb-1">
                      {param.name} (기본값: {param.default})
                    </label>
                    {param.type === 'number' ? (
                      <input
                        type="number"
                        defaultValue={param.default}
                        min={param.min}
                        max={param.max}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                      />
                    ) : param.type === 'select' ? (
                      <select
                        defaultValue={param.default}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                      >
                        {param.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* 공식 */}
            {selectedIndicator.formula && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">계산 공식</h4>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                    {selectedIndicator.formula}
                  </pre>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedIndicator(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 지표 추가 로직
                  setSelectedIndicator(null)
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                전략에 추가
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}