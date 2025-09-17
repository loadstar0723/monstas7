'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaRobot, FaCogs, FaPlay, FaChartBar,
  FaBrain, FaFlask, FaBolt, FaTachometerAlt
} from 'react-icons/fa'
import { Brain, Settings, Play, BarChart3 } from 'lucide-react'
import GoEngineStatus from '@/components/GoEngineStatus'

// 드래그앤드랍 인터페이스
const DragDropInterface = dynamic(() => import('@/components/strategy-builder/DragDropInterface'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

// 기존 전략 빌더 컴포넌트들
const StrategyBuilderModule = dynamic(() => import('@/components/strategy-builder/StrategyBuilderModule'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const AIStrategyBuilderModule = dynamic(() => import('@/components/strategy-builder/AIStrategyBuilderModule'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const CodeGenerator = dynamic(() => import('@/components/strategy-builder/CodeGenerator'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

// Go 하이브리드 컴포넌트
const GoStrategyGenerator = dynamic(() => import('./components/GoStrategyGenerator'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoOptimization = dynamic(() => import('./components/GoOptimization'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoLiveExecution = dynamic(() => import('./components/GoLiveExecution'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoPerformanceAnalytics = dynamic(() => import('./components/GoPerformanceAnalytics'), {
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
    id: 'drag-drop',
    label: '드래그앤드랍 빌더',
    icon: <FaCogs className="w-5 h-5" />,
    description: '시각적 전략 구성 도구',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'full-builder',
    label: '전체 빌더',
    icon: <FaRobot className="w-5 h-5" />,
    description: '통합 전략 빌더 모듈',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ai-builder',
    label: 'AI 전략 빌더',
    icon: <FaBrain className="w-5 h-5" />,
    description: 'AI 기반 전략 구성',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'code-generator',
    label: '코드 생성기',
    icon: <FaFlask className="w-5 h-5" />,
    description: 'Pine Script/Python 코드 생성',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'go-generator',
    label: 'Go 전략 생성',
    icon: <Brain className="w-5 h-5" />,
    description: 'Go AI 전략 자동 생성기',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'go-optimization',
    label: 'Go 최적화',
    icon: <Settings className="w-5 h-5" />,
    description: 'Go 하이퍼파라미터 최적화',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'go-execution',
    label: 'Go 실시간 실행',
    icon: <Play className="w-5 h-5" />,
    description: 'Go 실시간 전략 실행',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'go-analytics',
    label: 'Go 성과 분석',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Go 전략 성과 분석',
    gradient: 'from-yellow-500 to-red-500'
  }
]

export default function StrategyBuilderModuleEnhanced() {
  const [activeTab, setActiveTab] = useState('go-generator')
  const [selectedStrategy, setSelectedStrategy] = useState('MOMENTUM')
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
      case 'drag-drop':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <DragDropInterface />
          </Suspense>
        )
      case 'full-builder':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <StrategyBuilderModule />
          </Suspense>
        )
      case 'ai-builder':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <AIStrategyBuilderModule />
          </Suspense>
        )
      case 'code-generator':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <CodeGenerator />
          </Suspense>
        )
      case 'go-generator':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoStrategyGenerator selectedStrategy={selectedStrategy} />
          </Suspense>
        )
      case 'go-optimization':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoOptimization />
          </Suspense>
        )
      case 'go-execution':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoLiveExecution />
          </Suspense>
        )
      case 'go-analytics':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoPerformanceAnalytics />
          </Suspense>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* 3D 효과 배경 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse" />
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
            AI Strategy Builder 3.0
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Go 하이브리드 AI로 최적의 트레이딩 전략을 자동 생성하고 실행
          </p>
        </motion.div>

        {/* Strategy Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 inline-flex gap-2">
            {['MOMENTUM', 'MEAN-REVERSION', 'ARBITRAGE', 'MARKET-MAKING', 'TREND'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedStrategy(type)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedStrategy === type
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                {type}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
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
            <FaRobot className="text-2xl text-yellow-400" />
            <h3 className="text-xl font-bold text-white">AI 전략 빌더 활용 팁</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-indigo-400 font-semibold mb-2">전략 생성 프로세스</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• AI 자동 생성: 유전자 알고리즘 + 강화학습</li>
                <li>• 파라미터 최적화: 베이지안 최적화</li>
                <li>• 백테스트 검증: 5년 데이터 자동 검증</li>
                <li>• 실시간 실행: 지연 &lt; 1ms</li>
              </ul>
            </div>

            <div>
              <h4 className="text-purple-400 font-semibold mb-2">Go 하이브리드 성능</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 전략 생성: 100x 빠른 속도</li>
                <li>• 최적화: 10,000 시나리오 동시 처리</li>
                <li>• 실시간 실행: 10K 주문/초</li>
                <li>• 성과 분석: 실시간 업데이트</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}