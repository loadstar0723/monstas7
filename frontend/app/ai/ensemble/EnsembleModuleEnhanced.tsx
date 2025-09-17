'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUsers, FaChartPie, FaNetworkWired, FaCogs,
  FaBalanceScale, FaChartLine, FaEye, FaBrain
} from 'react-icons/fa'
import { Users, Settings, Network, Zap } from 'lucide-react'
import GoEngineStatus from '@/components/GoEngineStatus'
import ErrorBoundary from './components/ErrorBoundary'
import EnsembleBackground3D from './components/EnsembleBackground3D'
import styles from './ensemble.module.css'

// Dynamic imports for code splitting
const ModelOverview = dynamic(() => import('./components/ModelOverview'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const ModelCorrelation = dynamic(() => import('./components/ModelCorrelation'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const MetaLearning = dynamic(() => import('./components/MetaLearning'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const PredictionConsensus = dynamic(() => import('./components/PredictionConsensus'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const RealTimeEnsemble = dynamic(() => import('./components/RealTimeEnsemble'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

// Go 하이브리드 컴포넌트
const GoParallelVoting = dynamic(() => import('./components/GoParallelVoting'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoWeightOptimizer = dynamic(() => import('./components/GoWeightOptimizer'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoModelOrchestration = dynamic(() => import('./components/GoModelOrchestration'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoRealtimeConsensus = dynamic(() => import('./components/GoRealtimeConsensus'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  gradient: string
}

const tabs: TabItem[] = [
  {
    id: 'overview',
    label: '모델 개요',
    icon: <FaUsers className="w-5 h-5" />,
    description: '앙상블 모델 구성 및 성능',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'correlation',
    label: '모델 상관관계',
    icon: <FaNetworkWired className="w-5 h-5" />,
    description: '모델 간 상관관계 분석',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'meta-learning',
    label: '메타 러닝',
    icon: <FaBrain className="w-5 h-5" />,
    description: '메타 학습 최적화',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'consensus',
    label: '예측 합의',
    icon: <FaBalanceScale className="w-5 h-5" />,
    description: '모델 간 합의 도출',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'realtime',
    label: '실시간 앙상블',
    icon: <FaChartLine className="w-5 h-5" />,
    description: '실시간 예측 통합',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'go-voting',
    label: 'Go 병렬 투표',
    icon: <Users className="w-5 h-5" />,
    description: 'Go 병렬 투표 시스템',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'go-weight',
    label: 'Go 가중치 최적화',
    icon: <Settings className="w-5 h-5" />,
    description: 'Go 가중치 최적화 엔진',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'go-orchestration',
    label: 'Go 오케스트레이션',
    icon: <Network className="w-5 h-5" />,
    description: 'Go 모델 오케스트레이션',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'go-consensus',
    label: 'Go 실시간 합의',
    icon: <Zap className="w-5 h-5" />,
    description: 'Go 실시간 합의 엔진',
    gradient: 'from-yellow-500 to-red-500'
  }
]

export default function EnsembleModuleEnhanced() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [isLoading, setIsLoading] = useState(false)

  // Tab change effect
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [activeTab])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <ModelOverview />
          </Suspense>
        )
      case 'correlation':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <ModelCorrelation />
          </Suspense>
        )
      case 'meta-learning':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <MetaLearning />
          </Suspense>
        )
      case 'consensus':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <PredictionConsensus />
          </Suspense>
        )
      case 'realtime':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <RealTimeEnsemble />
          </Suspense>
        )
      case 'go-voting':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoParallelVoting />
          </Suspense>
        )
      case 'go-weight':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoWeightOptimizer />
          </Suspense>
        )
      case 'go-orchestration':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoModelOrchestration />
          </Suspense>
        )
      case 'go-consensus':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoRealtimeConsensus />
          </Suspense>
        )
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className={`${styles.darkBackground} relative min-h-screen`} style={{ backgroundColor: '#000000' }}>
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

        {/* 3D 배경 */}
        <div className="absolute inset-0">
          <EnsembleBackground3D />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Go Engine Status */}
          <GoEngineStatus />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
              Ensemble AI Trading
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              7개 AI 모델의 집단 지성으로 최적의 트레이딩 결정
            </p>
          </motion.div>

          {/* Symbol Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 inline-flex gap-2">
              {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedSymbol === symbol
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  {symbol.replace('USDT', '')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-2">
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 py-2 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {tab.icon}
                      <span className="hidden lg:inline text-xs font-medium">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-center text-gray-400"
              >
                {tabs.find(tab => tab.id === activeTab)?.description}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Footer Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaCogs className="text-2xl text-yellow-400" />
              <h3 className="text-xl font-bold text-white">앙상블 AI 활용 팁</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-indigo-400 font-semibold mb-2">앙상블의 강점</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 개별 모델의 약점을 상호 보완</li>
                  <li>• 다수결로 더 안정적인 예측</li>
                  <li>• 과적합 위험 감소</li>
                  <li>• 다양한 패턴 포착 가능</li>
                </ul>
              </div>

              <div>
                <h4 className="text-purple-400 font-semibold mb-2">최적 활용 전략</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 합의율 70% 이상일 때 신뢰</li>
                  <li>• 반대 모델이 2개 이하일 때 실행</li>
                  <li>• 가중치 최적화 수렴 후 거래</li>
                  <li>• Byzantine 내성 60% 이상 유지</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  )
}