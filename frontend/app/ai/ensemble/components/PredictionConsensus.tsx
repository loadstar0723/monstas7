'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaNetworkWired, FaChartLine, FaCheckCircle, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaBullseye, FaBalanceScale
} from 'react-icons/fa'
import { BiMerge } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, ScatterChart, Scatter, ComposedChart
} from 'recharts'

interface PredictionConsensusProps {
  symbol: string
  timeframe: string
}

export default function PredictionConsensus({ symbol, timeframe }: PredictionConsensusProps) {
  const [viewMode, setViewMode] = useState('predictions')

  // 개별 모델 예측
  const modelPredictions = [
    { model: 'Transformer', prediction: 52450, confidence: 91, direction: 'up' },
    { model: 'DeepAR', prediction: 52380, confidence: 88, direction: 'up' },
    { model: 'XGBoost', prediction: 52200, confidence: 85, direction: 'up' },
    { model: 'LightGBM', prediction: 52150, confidence: 84, direction: 'up' },
    { model: 'LSTM', prediction: 52500, confidence: 86, direction: 'up' },
    { model: 'Neural Net', prediction: 51950, confidence: 82, direction: 'neutral' },
    { model: 'GRU', prediction: 52300, confidence: 83, direction: 'up' },
    { model: 'Random Forest', prediction: 51800, confidence: 80, direction: 'down' },
    { model: 'CNN', prediction: 52100, confidence: 81, direction: 'up' },
    { model: 'Prophet', prediction: 51900, confidence: 78, direction: 'neutral' },
    { model: 'ARIMA', prediction: 51700, confidence: 75, direction: 'down' }
  ]

  // 앙상블 예측
  const ensemblePrediction = {
    price: 52280,
    confidence: 94.5,
    range: { min: 52050, max: 52510 },
    direction: 'up',
    strength: 78
  }

  // 예측 분포
  const predictionDistribution = [
    { range: '51700-51900', count: 3, models: ['ARIMA', 'Random Forest', 'Prophet'] },
    { range: '51900-52100', count: 2, models: ['Neural Net', 'CNN'] },
    { range: '52100-52300', count: 3, models: ['XGBoost', 'LightGBM', 'GRU'] },
    { range: '52300-52500', count: 3, models: ['DeepAR', 'Transformer', 'LSTM'] }
  ]

  // 시간별 컨센서스
  const consensusHistory = [
    { time: '5분전', ensemble: 52100, consensus: 85, spread: 350 },
    { time: '4분전', ensemble: 52150, consensus: 87, spread: 320 },
    { time: '3분전', ensemble: 52200, consensus: 89, spread: 300 },
    { time: '2분전', ensemble: 52250, consensus: 92, spread: 280 },
    { time: '1분전', ensemble: 52270, consensus: 93, spread: 260 },
    { time: '현재', ensemble: 52280, consensus: 94.5, spread: 250 }
  ]

  // 신뢰도 계산
  const confidenceMetrics = [
    { metric: '모델 일치도', value: 82, max: 100 },
    { metric: '예측 분산', value: 15, max: 100 },
    { metric: '과거 정확도', value: 89, max: 100 },
    { metric: '시장 상관성', value: 91, max: 100 }
  ]

  // 산점도 데이터
  const scatterData = modelPredictions.map(model => ({
    x: model.confidence,
    y: model.prediction,
    name: model.model
  }))

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaNetworkWired className="text-purple-400" />
          예측 통합 & 컨센서스
        </h3>
        <p className="text-gray-400">
          {symbol} {timeframe} - 11개 모델의 예측을 통합한 최종 예측
        </p>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setViewMode('predictions')}
          className={`px-6 py-2 rounded-lg transition-all ${
            viewMode === 'predictions'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          개별 예측
        </button>
        <button
          onClick={() => setViewMode('consensus')}
          className={`px-6 py-2 rounded-lg transition-all ${
            viewMode === 'consensus'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          컨센서스
        </button>
        <button
          onClick={() => setViewMode('distribution')}
          className={`px-6 py-2 rounded-lg transition-all ${
            viewMode === 'distribution'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          분포 분석
        </button>
      </div>

      {/* 앙상블 예측 결과 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            <BiMerge className="text-purple-400" />
            앙상블 최종 예측
          </h4>
          <div className={`flex items-center gap-2 text-lg font-bold ${
            ensemblePrediction.direction === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {ensemblePrediction.direction === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            {ensemblePrediction.strength}% 신호 강도
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-gray-400 mb-2">예측 가격</p>
            <p className="text-3xl font-bold text-white">${ensemblePrediction.price.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-2">신뢰도</p>
            <p className="text-3xl font-bold text-green-400">{ensemblePrediction.confidence}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-2">예측 범위</p>
            <p className="text-lg font-bold text-white">
              ${ensemblePrediction.range.min} - ${ensemblePrediction.range.max}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-2">방향성</p>
            <p className={`text-3xl font-bold ${
              ensemblePrediction.direction === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {ensemblePrediction.direction === 'up' ? '상승' : '하락'}
            </p>
          </div>
        </div>
      </motion.div>

      {viewMode === 'predictions' && (
        <>
          {/* 개별 모델 예측 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-4">개별 모델 예측</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400">모델</th>
                    <th className="text-right py-3 text-gray-400">예측 가격</th>
                    <th className="text-center py-3 text-gray-400">신뢰도</th>
                    <th className="text-center py-3 text-gray-400">방향</th>
                    <th className="text-right py-3 text-gray-400">편차</th>
                  </tr>
                </thead>
                <tbody>
                  {modelPredictions.map((model, index) => {
                    const deviation = ((model.prediction - ensemblePrediction.price) / ensemblePrediction.price * 100).toFixed(2)
                    return (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="py-3 text-white font-medium">{model.model}</td>
                        <td className="py-3 text-right text-white">
                          ${model.prediction.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            model.confidence >= 85 ? 'bg-green-500/20 text-green-400' :
                            model.confidence >= 80 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {model.confidence}%
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`${
                            model.direction === 'up' ? 'text-green-400' :
                            model.direction === 'down' ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {model.direction === 'up' ? '↑' :
                             model.direction === 'down' ? '↓' : '→'}
                          </span>
                        </td>
                        <td className={`py-3 text-right ${
                          parseFloat(deviation) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {parseFloat(deviation) > 0 ? '+' : ''}{deviation}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 예측 산점도 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-4">예측 vs 신뢰도 분포</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="x" name="신뢰도" unit="%" stroke="#9ca3af" />
                <YAxis dataKey="y" name="예측 가격" unit="$" stroke="#9ca3af" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Scatter name="모델 예측" data={scatterData} fill="#8b5cf6">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.y > ensemblePrediction.price ? '#10b981' : '#ef4444'
                    } />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {viewMode === 'consensus' && (
        <>
          {/* 컨센서스 추이 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-4">컨센서스 형성 과정</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={consensusHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="spread"
                  fill="#6b7280"
                  stroke="#6b7280"
                  fillOpacity={0.3}
                  name="예측 분산"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ensemble"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  name="앙상블 예측"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="consensus"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="컨센서스 강도"
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 신뢰도 메트릭 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {confidenceMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <h5 className="text-gray-400 text-sm mb-2">{metric.metric}</h5>
                <div className="relative h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-bold text-white">{metric.value}%</div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - metric.value / metric.max)}`}
                      className="text-purple-400 transition-all duration-1000"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === 'distribution' && (
        <>
          {/* 예측 분포 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-4">예측 가격 분포</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={predictionDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                          <p className="text-white font-semibold">{data.range}</p>
                          <p className="text-gray-400">모델 수: {data.count}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {data.models.join(', ')}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 통계 요약 */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBalanceScale className="text-purple-400" />
              예측 통계 요약
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">평균 예측</p>
                <p className="text-xl font-bold text-white">$52,118</p>
              </div>
              <div>
                <p className="text-gray-400">중간값</p>
                <p className="text-xl font-bold text-white">$52,150</p>
              </div>
              <div>
                <p className="text-gray-400">표준편차</p>
                <p className="text-xl font-bold text-white">$287</p>
              </div>
              <div>
                <p className="text-gray-400">신뢰구간</p>
                <p className="text-xl font-bold text-white">95%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}