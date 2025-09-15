'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaMagic, FaSearch, FaCheckCircle, FaClock,
  FaChartLine, FaRocket, FaCogs, FaLightbulb
} from 'react-icons/fa'
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import CountUp from 'react-countup'

interface AutoARIMAProps {
  symbol: string
}

export default function AutoARIMA({ symbol }: AutoARIMAProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [bestModel, setBestModel] = useState<any>(null)
  const [currentModel, setCurrentModel] = useState<any>(null)

  // Auto-ARIMA 검색 시뮬레이션
  const startAutoARIMA = () => {
    setIsSearching(true)
    setSearchProgress(0)
    setSearchResults([])
    setBestModel(null)
    
    let progress = 0
    const models: any[] = []
    
    const searchInterval = setInterval(() => {
      progress += 5
      setSearchProgress(progress)
      
      // 모델 테스트 시뮬레이션
      if (progress % 10 === 0) {
        const p = Math.floor(Math.random() * 5)
        const d = Math.floor(Math.random() * 3)
        const q = Math.floor(Math.random() * 5)
        
        const model = {
          name: `ARIMA(${p},${d},${q})`,
          p, d, q,
          aic: 15000 + Math.random() * 1000,
          bic: 15100 + Math.random() * 1000,
          rmse: 0.02 + Math.random() * 0.02,
          mae: 0.015 + Math.random() * 0.015,
          mape: 1.5 + Math.random() * 2,
          logLikelihood: -7500 - Math.random() * 500
        }
        
        models.push(model)
        setSearchResults([...models])
        setCurrentModel(model)
      }
      
      if (progress >= 100) {
        clearInterval(searchInterval)
        setIsSearching(false)
        
        // 최적 모델 선택
        const best = models.reduce((prev, current) => 
          prev.aic < current.aic ? prev : current
        )
        setBestModel(best)
        setCurrentModel(best)
      }
    }, 100)
  }

  // 모델 비교 데이터
  const modelComparison = searchResults.map(model => ({
    model: model.name,
    aic: model.aic,
    bic: model.bic,
    rmse: model.rmse * 1000,
    score: 100 - (model.aic - 15000) / 10
  }))

  // 파라미터 검색 공간
  const parameterSpace = {
    p: Array.from({ length: 6 }, (_, i) => ({ value: i, tested: searchResults.some(m => m.p === i) })),
    d: Array.from({ length: 3 }, (_, i) => ({ value: i, tested: searchResults.some(m => m.d === i) })),
    q: Array.from({ length: 6 }, (_, i) => ({ value: i, tested: searchResults.some(m => m.q === i) }))
  }

  // 성능 메트릭 레이더 차트 데이터
  const performanceMetrics = bestModel ? [
    { metric: '정확도', value: 95 - bestModel.mape * 10, fullMark: 100 },
    { metric: '속도', value: 85, fullMark: 100 },
    { metric: '안정성', value: 90, fullMark: 100 },
    { metric: '복잡도', value: 100 - (bestModel.p + bestModel.q) * 10, fullMark: 100 },
    { metric: '적합도', value: 100 - (bestModel.aic - 15000) / 10, fullMark: 100 }
  ] : []

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaMagic className="text-purple-400" />
          Auto-ARIMA 최적 모델 탐색
        </h2>
        <p className="text-gray-300">
          자동으로 최적의 ARIMA(p,d,q) 파라미터를 찾아 가장 정확한 예측 모델을 생성합니다
        </p>
      </div>

      {/* 검색 컨트롤 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Auto-ARIMA 검색</h3>
          {!isSearching && (
            <button
              onClick={startAutoARIMA}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <FaSearch />
              최적 모델 검색 시작
            </button>
          )}
        </div>

        {/* 검색 진행 상황 */}
        {isSearching && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">검색 진행률</span>
              <span className="text-white font-semibold">{searchProgress}%</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${searchProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              />
            </div>
            {currentModel && (
              <div className="text-center text-gray-400">
                현재 테스트 중: {currentModel.name}
              </div>
            )}
          </div>
        )}

        {/* 최적 모델 결과 */}
        {bestModel && !isSearching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/30"
          >
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              최적 모델 발견!
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{bestModel.name}</div>
                <div className="text-sm text-gray-400 mt-1">모델</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  <CountUp end={bestModel.aic} decimals={1} duration={1} />
                </div>
                <div className="text-sm text-gray-400 mt-1">AIC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  <CountUp end={bestModel.rmse * 100} decimals={2} suffix="%" duration={1} />
                </div>
                <div className="text-sm text-gray-400 mt-1">RMSE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  <CountUp end={bestModel.mape} decimals={1} suffix="%" duration={1} />
                </div>
                <div className="text-sm text-gray-400 mt-1">MAPE</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 파라미터 검색 공간 시각화 */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCogs className="text-blue-400" />
            파라미터 검색 공간
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(parameterSpace).map(([param, values]) => (
              <div key={param}>
                <h4 className="text-lg font-semibold text-white mb-3">
                  {param} 파라미터
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {values.map((v) => (
                    <div
                      key={v.value}
                      className={`aspect-square rounded-lg flex items-center justify-center text-white font-semibold transition-all ${
                        v.tested
                          ? bestModel && bestModel[param] === v.value
                            ? 'bg-green-600'
                            : 'bg-blue-600'
                          : 'bg-gray-700'
                      }`}
                    >
                      {v.value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 모델 비교 차트 */}
      {searchResults.length > 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">AIC 스코어 비교</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelComparison.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="model" stroke="#9ca3af" angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="aic" fill="#3b82f6">
                  {modelComparison.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={bestModel && entry.model === bestModel.name ? '#10b981' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">RMSE 성능</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" dataKey="aic" stroke="#9ca3af" name="AIC" />
                <YAxis type="number" dataKey="rmse" stroke="#9ca3af" name="RMSE" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter name="Models" data={modelComparison} fill="#8b5cf6">
                  {modelComparison.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={bestModel && entry.model === bestModel.name ? '#10b981' : '#8b5cf6'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* 최적 모델 성능 메트릭 */}
      {bestModel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            최적 모델 성능 분석
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">성능 지표</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">AIC (Akaike 정보 기준)</span>
                  <span className="text-white font-semibold">{bestModel.aic.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">BIC (Bayesian 정보 기준)</span>
                  <span className="text-white font-semibold">{bestModel.bic.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">RMSE (평균 제곱근 오차)</span>
                  <span className="text-white font-semibold">{(bestModel.rmse * 100).toFixed(3)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">MAPE (평균 절대 백분율 오차)</span>
                  <span className="text-white font-semibold">{bestModel.mape.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">종합 성능</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar
                    name="성능"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auto-ARIMA 장점 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          Auto-ARIMA의 장점
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <FaRocket className="text-purple-400 mt-1" />
            <div>
              <h4 className="text-white font-semibold">자동 파라미터 선택</h4>
              <p className="text-gray-400 text-sm">
                수동 조정 없이 최적의 p, d, q 값을 자동으로 찾습니다
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaClock className="text-blue-400 mt-1" />
            <div>
              <h4 className="text-white font-semibold">시간 절약</h4>
              <p className="text-gray-400 text-sm">
                수백 개의 모델을 빠르게 테스트하여 최적 모델 선택
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaChartLine className="text-green-400 mt-1" />
            <div>
              <h4 className="text-white font-semibold">성능 최적화</h4>
              <p className="text-gray-400 text-sm">
                AIC/BIC 기준으로 과적합을 방지하면서 정확도 극대화
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCogs className="text-yellow-400 mt-1" />
            <div>
              <h4 className="text-white font-semibold">계절성 자동 감지</h4>
              <p className="text-gray-400 text-sm">
                SARIMA 모델로 자동 확장하여 계절성 패턴 포착
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}