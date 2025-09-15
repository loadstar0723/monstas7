'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaRobot, FaLightbulb,
  FaNetworkWired, FaWeightHanging, FaChartBar, FaTachometerAlt,
  FaCogs, FaCheckCircle, FaSyncAlt, FaLayerGroup
} from 'react-icons/fa'
import { AiOutlineCluster } from 'react-icons/ai'
import dynamic from 'next/dynamic'

// 3D 앙상블 배경
const EnsembleBackground3D = dynamic(
  () => import('./components/EnsembleBackground3D'),
  { ssr: false }
)

// 동적 임포트
const ErrorBoundary = dynamic(() => import('./components/ErrorBoundary'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelOverview = dynamic(() => import('./components/ModelOverview'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelPerformance = dynamic(() => import('./components/ModelPerformance'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const WeightOptimization = dynamic(() => import('./components/WeightOptimization'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const PredictionConsensus = dynamic(() => import('./components/PredictionConsensus'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelCorrelation = dynamic(() => import('./components/ModelCorrelation'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const RealTimeEnsemble = dynamic(() => import('./components/RealTimeEnsemble'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const MetaLearning = dynamic(() => import('./components/MetaLearning'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

export default function EnsembleModule() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')

  const tabs = [
    { id: 'overview', label: '개요', icon: FaBrain },
    { id: 'performance', label: '모델 성능', icon: FaChartBar },
    { id: 'weights', label: '가중치 최적화', icon: FaWeightHanging },
    { id: 'consensus', label: '예측 통합', icon: FaNetworkWired },
    { id: 'correlation', label: '상관관계', icon: AiOutlineCluster },
    { id: 'realtime', label: '실시간', icon: FaSyncAlt },
    { id: 'meta', label: '메타러닝', icon: FaLightbulb }
  ]

  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ErrorBoundary><ModelOverview /></ErrorBoundary>
      case 'performance':
        return <ErrorBoundary><ModelPerformance symbol={selectedSymbol} /></ErrorBoundary>
      case 'weights':
        return <ErrorBoundary><WeightOptimization symbol={selectedSymbol} /></ErrorBoundary>
      case 'consensus':
        return <ErrorBoundary><PredictionConsensus symbol={selectedSymbol} timeframe={timeframe} /></ErrorBoundary>
      case 'correlation':
        return <ErrorBoundary><ModelCorrelation /></ErrorBoundary>
      case 'realtime':
        return <ErrorBoundary><RealTimeEnsemble symbol={selectedSymbol} timeframe={timeframe} /></ErrorBoundary>
      case 'meta':
        return <ErrorBoundary><MetaLearning /></ErrorBoundary>
      default:
        return <ErrorBoundary><ModelOverview /></ErrorBoundary>
    }
  }

  return (
    <div className="min-h-screen">
        {/* 3D 앙상블 배경 */}
        <div className="fixed inset-0 z-0">
        <EnsembleBackground3D />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8">

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            AI 앙상블 시스템
          </h1>
          <p className="text-gray-300 text-xl">
            11개 AI 모델의 집단 지성으로 최고 정확도의 예측 달성
          </p>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">모델 수</span>
              <FaLayerGroup className="text-purple-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-white">11개</div>
            <div className="text-sm text-gray-400">AI 모델</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">통합 정확도</span>
              <FaTachometerAlt className="text-green-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-green-400">92.7%</div>
            <div className="text-sm text-gray-400">평균 정확도</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">신뢰도</span>
              <FaCheckCircle className="text-blue-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-blue-400">95%</div>
            <div className="text-sm text-gray-400">예측 신뢰도</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">처리 속도</span>
              <FaRobot className="text-orange-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-orange-400">0.3초</div>
            <div className="text-sm text-gray-400">추론 시간</div>
          </motion.div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-gray-400 text-sm">심볼</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="ml-2 bg-gray-700/50 text-white px-3 py-1 rounded-lg border border-gray-600"
                >
                  {symbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">시간대</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="ml-2 bg-gray-700/50 text-white px-3 py-1 rounded-lg border border-gray-600"
                >
                  {timeframes.map(tf => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2">
              <FaSyncAlt />
              재분석
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}