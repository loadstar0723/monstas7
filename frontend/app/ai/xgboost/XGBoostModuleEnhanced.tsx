'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaRocket, FaTree, FaCogs, FaChartBar, FaLayerGroup,
  FaProjectDiagram, FaChartLine, FaAtom, FaBolt, FaServer,
  FaMicrochip, FaMemory, FaNetworkWired, FaChartArea,
  FaDatabase, FaGlobe, FaTachometerAlt, FaExchangeAlt,
  FaTimes, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa'
import { ParticleBackground3D } from '@/components/backgrounds/ParticleBackground3D'

// 동적 임포트로 성능 최적화
const ErrorBoundary = dynamic(() => import('./components/ErrorBoundary'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelOverview = dynamic(() => import('./components/ModelOverview'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const BoostingAnimation = dynamic(() => import('./components/BoostingAnimation'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const FeatureInteraction = dynamic(() => import('./components/FeatureInteraction'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const HyperparameterTuning = dynamic(() => import('./components/HyperparameterTuning'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const CrossValidation = dynamic(() => import('./components/CrossValidation'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelComparison = dynamic(() => import('./components/ModelComparison'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const AdvancedSHAP = dynamic(() => import('./components/AdvancedSHAP'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})


// Go 전용 컴포넌트 동적 임포트
const GoParallelBoost = dynamic(() => import('./components/GoParallelBoost'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const GoRealtimeStream = dynamic(() => import('./components/GoRealtimeStream'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const GoMemoryOptimizer = dynamic(() => import('./components/GoMemoryOptimizer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const GoPerformanceBench = dynamic(() => import('./components/GoPerformanceBench'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

// 탭 설정
interface TabConfig {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  color: string
  isGoFeature?: boolean
}

export default function XGBoostModuleEnhanced() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [goStatus, setGoStatus] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [modelSettings, setModelSettings] = useState({
    max_depth: 6,
    learning_rate: 0.01,
    n_estimators: 1000,
    subsample: 0.8,
    colsample_bytree: 0.8,
    min_child_weight: 3,
    gamma: 0.1,
    objective: 'reg:squarederror',
    eval_metric: 'rmse',
    early_stopping_rounds: 50,
    useGoEngine: true,
    enableParallel: true,
    enableGPU: false
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

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      title: '모델 개요',
      icon: <FaRocket className="text-2xl" />,
      description: 'XGBoost 알고리즘 소개',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'boosting',
      title: '부스팅 시각화',
      icon: <FaBolt className="text-2xl" />,
      description: '순차적 트리 학습 과정',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'interaction',
      title: '특성 상호작용',
      icon: <FaLayerGroup className="text-2xl" />,
      description: '2D/3D 상호작용 분석',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'tuning',
      title: '하이퍼파라미터',
      icon: <FaCogs className="text-2xl" />,
      description: '실시간 파라미터 최적화',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'validation',
      title: '교차 검증',
      icon: <FaChartBar className="text-2xl" />,
      description: 'K-Fold 검증 시각화',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'comparison',
      title: '모델 비교',
      icon: <FaChartLine className="text-2xl" />,
      description: '다른 모델과 성능 비교',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'shap',
      title: 'SHAP 분석',
      icon: <FaProjectDiagram className="text-2xl" />,
      description: '고급 해석 가능성',
      color: 'from-cyan-500 to-blue-500'
    },
    // Go 하이브리드 전용 탭들
    {
      id: 'go-parallel',
      title: '🚀 Go 병렬처리',
      icon: <FaBolt className="text-2xl text-green-400" />,
      description: 'Goroutines 병렬 부스팅',
      color: 'from-green-600 to-green-400',
      isGoFeature: true
    },
    {
      id: 'go-stream',
      title: '📡 실시간 스트림',
      icon: <FaChartLine className="text-2xl text-blue-400" />,
      description: 'WebSocket 실시간 분석',
      color: 'from-blue-600 to-blue-400',
      isGoFeature: true
    },
    {
      id: 'go-memory',
      title: '💾 메모리 최적화',
      icon: <FaAtom className="text-2xl text-purple-400" />,
      description: 'Go GC 메모리 관리',
      color: 'from-purple-600 to-purple-400',
      isGoFeature: true
    },
    {
      id: 'go-bench',
      title: '⚡ 성능 벤치마크',
      icon: <FaCogs className="text-2xl text-red-400" />,
      description: 'Go vs Python 성능 비교',
      color: 'from-red-600 to-red-400',
      isGoFeature: true
    }
  ]

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <ErrorBoundary>
            <ModelOverview symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'boosting':
        return (
          <ErrorBoundary>
            <BoostingAnimation symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'interaction':
        return (
          <ErrorBoundary>
            <FeatureInteraction symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'tuning':
        return (
          <ErrorBoundary>
            <HyperparameterTuning symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'validation':
        return (
          <ErrorBoundary>
            <CrossValidation symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'comparison':
        return (
          <ErrorBoundary>
            <ModelComparison symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'shap':
        return (
          <ErrorBoundary>
            <AdvancedSHAP symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      // Go 하이브리드 전용 컴포넌트
      case 'go-parallel':
        return (
          <ErrorBoundary>
            <GoParallelBoost symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'go-stream':
        return (
          <ErrorBoundary>
            <GoRealtimeStream symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'go-memory':
        return (
          <ErrorBoundary>
            <GoMemoryOptimizer symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'go-bench':
        return (
          <ErrorBoundary>
            <GoPerformanceBench symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* 화려한 3D 배경 */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground3D />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Go 엔진 상태 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 border border-green-800/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* 타이틀 섹션 */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-green-400 to-red-600 text-transparent bg-clip-text">
                    XGBoost Go 하이브리드 엔진
                  </span>
                </h1>
                <p className="text-sm md:text-base text-gray-400">
                  극한의 그래디언트 부스팅 + Go 병렬 처리 = 최강의 예측 성능
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
                  className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 justify-center"
                >
                  <FaCogs /> XGBoost 설정
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
            className="bg-gray-800/50 backdrop-blur-sm text-white rounded-lg px-6 py-3 border border-gray-700 focus:border-green-500 transition-all"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>
        </div>

        {/* 버튼식 탭 네비게이션 */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-4 py-3 rounded-xl transition-all ${
                selectedTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                <span className="text-sm font-medium">{tab.title}</span>
                {tab.isGoFeature && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Go</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* 탭 설명 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-gray-400">
              {tabs.find(tab => tab.id === selectedTab)?.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 컨텐츠 영역 */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-800"
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </motion.div>

        {/* 푸터 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>XGBoost는 Kaggle 대회에서 가장 많이 사용되는 알고리즘입니다</p>
          <p className="mt-2">정확도와 속도를 모두 잡은 최적의 선택</p>
        </motion.div>
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
                <h2 className="text-2xl font-bold text-white">XGBoost 모델 설정</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* 트리 파라미터 */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">트리 파라미터</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Max Depth</label>
                      <input
                        type="number"
                        value={modelSettings.max_depth}
                        onChange={(e) => setModelSettings({...modelSettings, max_depth: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Min Child Weight</label>
                      <input
                        type="number"
                        value={modelSettings.min_child_weight}
                        onChange={(e) => setModelSettings({...modelSettings, min_child_weight: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Gamma</label>
                      <input
                        type="number"
                        step="0.01"
                        value={modelSettings.gamma}
                        onChange={(e) => setModelSettings({...modelSettings, gamma: parseFloat(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 학습 파라미터 */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">학습 파라미터</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Learning Rate</label>
                      <input
                        type="number"
                        step="0.001"
                        value={modelSettings.learning_rate}
                        onChange={(e) => setModelSettings({...modelSettings, learning_rate: parseFloat(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">N Estimators</label>
                      <input
                        type="number"
                        value={modelSettings.n_estimators}
                        onChange={(e) => setModelSettings({...modelSettings, n_estimators: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Early Stopping Rounds</label>
                      <input
                        type="number"
                        value={modelSettings.early_stopping_rounds}
                        onChange={(e) => setModelSettings({...modelSettings, early_stopping_rounds: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 정규화 파라미터 */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">정규화 파라미터</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Subsample</label>
                      <input
                        type="number"
                        step="0.1"
                        value={modelSettings.subsample}
                        onChange={(e) => setModelSettings({...modelSettings, subsample: parseFloat(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Colsample by Tree</label>
                      <input
                        type="number"
                        step="0.1"
                        value={modelSettings.colsample_bytree}
                        onChange={(e) => setModelSettings({...modelSettings, colsample_bytree: parseFloat(e.target.value)})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 목적 함수 설정 */}
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-4">목적 함수 설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Objective</label>
                      <select
                        value={modelSettings.objective}
                        onChange={(e) => setModelSettings({...modelSettings, objective: e.target.value})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      >
                        <option value="reg:squarederror">Squared Error</option>
                        <option value="reg:linear">Linear</option>
                        <option value="reg:logistic">Logistic</option>
                        <option value="binary:logistic">Binary Logistic</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Eval Metric</label>
                      <select
                        value={modelSettings.eval_metric}
                        onChange={(e) => setModelSettings({...modelSettings, eval_metric: e.target.value})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                      >
                        <option value="rmse">RMSE</option>
                        <option value="mae">MAE</option>
                        <option value="logloss">Log Loss</option>
                        <option value="auc">AUC</option>
                      </select>
                    </div>
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
                        checked={modelSettings.enableGPU}
                        onChange={(e) => setModelSettings({...modelSettings, enableGPU: e.target.checked})}
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-white">GPU 가속 사용</span>
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
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-red-600 text-white rounded-lg hover:from-green-500 hover:to-red-500 transition-all"
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