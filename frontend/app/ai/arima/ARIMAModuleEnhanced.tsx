'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartBar, FaChartLine, FaWaveSquare, FaClock, FaChartArea,
  FaCalculator, FaSignal, FaChartPie, FaTachometerAlt, FaHistory,
  FaBalanceScale, FaFilter, FaMagic, FaRocket, FaAtom, FaServer,
  FaCogs, FaTimes, FaBolt, FaMemory, FaDatabase
} from 'react-icons/fa'
import ErrorBoundary from './components/ErrorBoundary'

// 3D 시계열 흐름 배경 임포트
import { DarkWaveBackground3D } from '@/components/backgrounds/DarkWaveBackground3D'

// 동적 임포트로 각 컴포넌트 로드
const ModelOverview = dynamic(() => import('./components/ModelOverview'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const TimeSeriesDecomposition = dynamic(() => import('./components/TimeSeriesDecomposition'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const ACFPACFAnalysis = dynamic(() => import('./components/ACFPACFAnalysis'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const AutoARIMA = dynamic(() => import('./components/AutoARIMA'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const FanChart = dynamic(() => import('./components/FanChart'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const DiagnosticTests = dynamic(() => import('./components/DiagnosticTests'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const DynamicAnalysis = dynamic(() => import('./components/DynamicAnalysis'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})


// Go 전용 컴포넌트 동적 임포트
const GoARIMAEngine = dynamic(() => import('./components/GoARIMAEngine'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

const GoForecastOptimization = dynamic(() => import('./components/GoForecastOptimization'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />,
  ssr: false
})

export default function ARIMAModuleEnhanced() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [goStatus, setGoStatus] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [modelSettings, setModelSettings] = useState({
    p: 2, // AR order
    d: 1, // Differencing degree
    q: 2, // MA order
    seasonal_p: 1,
    seasonal_d: 1,
    seasonal_q: 1,
    seasonal_period: 24,
    use_exog: false,
    confidence_level: 0.95,
    forecast_horizon: 24,
    useGoEngine: true,
    enableParallel: true,
    enableStreaming: true
  })

  // Go 서버 상태 체크
  useEffect(() => {
    const checkGoStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/health')
        if (response.ok) {
          const data = await response.json()
          setGoStatus(data)
        } else {
          setGoStatus(null)
        }
      } catch (error) {
        setGoStatus(null)
      }
    }

    checkGoStatus()
    const interval = setInterval(checkGoStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: '개요', icon: FaChartBar, color: 'from-blue-500 to-cyan-500' },
    { id: 'decomposition', label: '시계열 분해', icon: FaWaveSquare, color: 'from-purple-500 to-pink-500' },
    { id: 'acfpacf', label: 'ACF/PACF', icon: FaChartArea, color: 'from-green-500 to-emerald-500' },
    { id: 'autoarima', label: 'Auto-ARIMA', icon: FaMagic, color: 'from-yellow-500 to-orange-500' },
    { id: 'fanchart', label: 'Fan Chart', icon: FaChartLine, color: 'from-red-500 to-rose-500' },
    { id: 'diagnostics', label: '진단', icon: FaTachometerAlt, color: 'from-indigo-500 to-purple-500' },
    // Go 하이브리드 탭들
    { id: 'go-engine', label: '🚀 Go 엔진', icon: FaBolt, color: 'from-green-600 to-green-400', isGoFeature: true },
    { id: 'go-forecast', label: '📊 Go 예측', icon: FaDatabase, color: 'from-blue-600 to-blue-400', isGoFeature: true }
  ]

  const symbols = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'BNBUSDT', label: 'BNB/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' }
  ]

  return (
    <div className="min-h-screen">
      {/* 3D 시계열 흐름 배경 */}
      <div className="fixed inset-0 z-0">
        <DarkWaveBackground3D />
      </div>
      
      <div className="relative z-10 p-4 md:p-8">
        {/* Go 엔진 상태 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 border border-blue-800/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* 타이틀 섹션 */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 text-transparent bg-clip-text">
                    ARIMA Go 하이브리드 엔진
                  </span>
                </h1>
                <p className="text-sm md:text-base text-gray-400">
                  전통적 시계열 분석 + Go 병렬 처리 = 초고속 예측 성능
                </p>
              </div>

              {/* Go 서버 상태 */}
              <div className="flex flex-col gap-3 min-w-[280px]">
                {/* 연결 상태 */}
                <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-4 py-2">
                  <FaServer className="text-green-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {goStatus ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-400 font-semibold">Go Engine Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-sm text-red-400">Go Engine Offline</span>
                        </>
                      )}
                    </div>
                    {goStatus && (
                      <div className="text-xs text-gray-500 mt-1">
                        Version {goStatus.version} | Port 8080
                      </div>
                    )}
                  </div>
                </div>

                {/* 성능 메트릭 */}
                {goStatus && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-400">CPU</div>
                      <div className="text-sm font-bold text-yellow-400">
                        {goStatus.cpu_usage || 0} cores
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-400">메모리</div>
                      <div className="text-sm font-bold text-blue-400">
                        {goStatus.memory_usage || 0} MB
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-400">고루틴</div>
                      <div className="text-sm font-bold text-green-400">
                        {goStatus.goroutines || 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* 설정 버튼 */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gradient-to-r from-purple-600/50 to-blue-600/50 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 justify-center"
                >
                  <FaCogs /> ARIMA 설정
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 심볼 선택 */}
        <div className="flex justify-center mb-8">
          <select
            value={selectedSymbol}
            onChange={(e) => {
              if (e && e.target && e.target.value) {
                setSelectedSymbol(e.target.value)
              }
            }}
            className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            {symbols.map(symbol => (
              <option key={symbol.value} value={symbol.value}>
                {symbol.label}
              </option>
            ))}
          </select>
        </div>

        {/* 버튼식 탭 네비게이션 */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="text-lg" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.isGoFeature && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Go</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* 컨텐츠 영역 */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <ModelOverview />
                  <div className="mt-8">
                    <DynamicAnalysis type="overview" symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </motion.div>
            )}

            {activeTab === 'decomposition' && (
              <motion.div
                key="decomposition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <TimeSeriesDecomposition symbol={selectedSymbol} />
                  <div className="mt-8">
                    <DynamicAnalysis type="decomposition" symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </motion.div>
            )}

            {activeTab === 'acfpacf' && (
              <motion.div
                key="acfpacf"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <ACFPACFAnalysis symbol={selectedSymbol} />
                  <div className="mt-8">
                    <DynamicAnalysis type="correlation" symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </motion.div>
            )}

            {activeTab === 'autoarima' && (
              <motion.div
                key="autoarima"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <AutoARIMA symbol={selectedSymbol} />
                  <div className="mt-8">
                    <DynamicAnalysis type="autoarima" symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </motion.div>
            )}

            {activeTab === 'fanchart' && (
              <motion.div
                key="fanchart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <FanChart symbol={selectedSymbol} />
                  <div className="mt-8">
                    <DynamicAnalysis type="forecast" symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </motion.div>
            )}

            {activeTab === 'diagnostics' && (
              <motion.div
                key="diagnostics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <DiagnosticTests symbol={selectedSymbol} />
                  <div className="mt-8">
                    <DynamicAnalysis type="diagnostics" symbol={selectedSymbol} />
                  </div>
                </ErrorBoundary>
              </motion.div>
            )}

            {/* Go 하이브리드 탭들 */}
            {activeTab === 'go-engine' && (
              <motion.div
                key="go-engine"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <GoARIMAEngine />
                </ErrorBoundary>
              </motion.div>
            )}

            {activeTab === 'go-forecast' && (
              <motion.div
                key="go-forecast"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ErrorBoundary>
                  <GoForecastOptimization symbol={selectedSymbol} />
                </ErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 설정 모달 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">ARIMA 모델 설정</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* ARIMA 파라미터 */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">ARIMA 파라미터</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">p (AR order)</label>
                      <input
                        type="number"
                        value={modelSettings.p}
                        onChange={(e) => setModelSettings({...modelSettings, p: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">d (Differencing)</label>
                      <input
                        type="number"
                        value={modelSettings.d}
                        onChange={(e) => setModelSettings({...modelSettings, d: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">q (MA order)</label>
                      <input
                        type="number"
                        value={modelSettings.q}
                        onChange={(e) => setModelSettings({...modelSettings, q: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 계절성 파라미터 */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">계절성 ARIMA 파라미터</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">P (계절 AR)</label>
                      <input
                        type="number"
                        value={modelSettings.seasonal_p}
                        onChange={(e) => setModelSettings({...modelSettings, seasonal_p: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">D (계절 차분)</label>
                      <input
                        type="number"
                        value={modelSettings.seasonal_d}
                        onChange={(e) => setModelSettings({...modelSettings, seasonal_d: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Q (계절 MA)</label>
                      <input
                        type="number"
                        value={modelSettings.seasonal_q}
                        onChange={(e) => setModelSettings({...modelSettings, seasonal_q: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">계절 주기</label>
                      <input
                        type="number"
                        value={modelSettings.seasonal_period}
                        onChange={(e) => setModelSettings({...modelSettings, seasonal_period: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 예측 설정 */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">예측 설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">예측 기간 (steps)</label>
                      <input
                        type="number"
                        value={modelSettings.forecast_horizon}
                        onChange={(e) => setModelSettings({...modelSettings, forecast_horizon: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">신뢰 수준</label>
                      <input
                        type="number"
                        step="0.01"
                        value={modelSettings.confidence_level}
                        onChange={(e) => setModelSettings({...modelSettings, confidence_level: parseFloat(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.use_exog}
                        onChange={(e) => setModelSettings({...modelSettings, use_exog: e.target.checked})}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-white">외생 변수 사용 (Exogenous variables)</span>
                    </label>
                  </div>
                </div>

                {/* Go 엔진 설정 */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Go 엔진 설정</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.useGoEngine}
                        onChange={(e) => setModelSettings({...modelSettings, useGoEngine: e.target.checked})}
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-white">Go 엔진 사용</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.enableParallel}
                        onChange={(e) => setModelSettings({...modelSettings, enableParallel: e.target.checked})}
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-white">병렬 처리 활성화</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.enableStreaming}
                        onChange={(e) => setModelSettings({...modelSettings, enableStreaming: e.target.checked})}
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-white">실시간 스트리밍</span>
                    </label>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      console.log('Settings saved:', modelSettings)
                      setShowSettings(false)
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all"
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}