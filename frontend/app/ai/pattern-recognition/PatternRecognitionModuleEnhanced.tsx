'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine, FaSearch, FaHistory, FaBrain,
  FaCrosshairs, FaDatabase, FaBolt, FaCompass
} from 'react-icons/fa'
import { Search, Database, Activity, Compass } from 'lucide-react'
import GoEngineStatus from '@/components/GoEngineStatus'

// Dynamic imports for code splitting
const ModelOverview = dynamic(() => import('./components/ModelOverview'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const PatternDetection = dynamic(() => import('./components/PatternDetection'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const CandlestickPatterns = dynamic(() => import('./components/CandlestickPatterns'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const ChartPatterns = dynamic(() => import('./components/ChartPatterns'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const PatternPerformance = dynamic(() => import('./components/PatternPerformance'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const RealtimeScanner = dynamic(() => import('./components/RealtimeScanner'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const DynamicAnalysis = dynamic(() => import('./components/DynamicAnalysis'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

// Go 하이브리드 컴포넌트
const GoParallelScanning = dynamic(() => import('./components/GoParallelScanning'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoPatternCache = dynamic(() => import('./components/GoPatternCache'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoRealtimeDetection = dynamic(() => import('./components/GoRealtimeDetection'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoHarmonicAnalysis = dynamic(() => import('./components/GoHarmonicAnalysis'), {
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
    label: '개요',
    icon: <FaChartLine className="w-5 h-5" />,
    description: '패턴 인식 시스템 소개',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'detection',
    label: 'AI 패턴 탐지',
    icon: <FaBrain className="w-5 h-5" />,
    description: 'AI 패턴 자동 감지',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'candlestick',
    label: '캔들스틱',
    icon: <FaChartLine className="w-5 h-5" />,
    description: '캔들스틱 패턴 분석',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'chart',
    label: '차트 패턴',
    icon: <FaCrosshairs className="w-5 h-5" />,
    description: '차트 패턴 분석',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'performance',
    label: '백테스팅',
    icon: <FaHistory className="w-5 h-5" />,
    description: '패턴 성능 통계',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'scanner',
    label: '실시간 스캐너',
    icon: <FaSearch className="w-5 h-5" />,
    description: '실시간 차트 패턴 검색',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'analysis',
    label: '동적 분석',
    icon: <FaChartLine className="w-5 h-5" />,
    description: '실시간 시장 분석',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'go-scanning',
    label: 'Go 병렬 스캐닝',
    icon: <Search className="w-5 h-5" />,
    description: 'Go 병렬 패턴 스캐닝',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'go-cache',
    label: 'Go 패턴 캐싱',
    icon: <Database className="w-5 h-5" />,
    description: 'Go 메모리 최적화',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'go-realtime',
    label: 'Go 실시간 감지',
    icon: <Activity className="w-5 h-5" />,
    description: 'Go 실시간 패턴 감지',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'go-harmonic',
    label: 'Go 하모닉 분석',
    icon: <Compass className="w-5 h-5" />,
    description: 'Go 하모닉 패턴 분석',
    gradient: 'from-yellow-500 to-red-500'
  }
]

export default function PatternRecognitionModuleEnhanced() {
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
      case 'detection':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <PatternDetection />
          </Suspense>
        )
      case 'candlestick':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <CandlestickPatterns />
          </Suspense>
        )
      case 'chart':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <ChartPatterns />
          </Suspense>
        )
      case 'performance':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <PatternPerformance />
          </Suspense>
        )
      case 'scanner':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <RealtimeScanner />
          </Suspense>
        )
      case 'analysis':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <DynamicAnalysis />
          </Suspense>
        )
      case 'go-scanning':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoParallelScanning />
          </Suspense>
        )
      case 'go-cache':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoPatternCache />
          </Suspense>
        )
      case 'go-realtime':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoRealtimeDetection />
          </Suspense>
        )
      case 'go-harmonic':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoHarmonicAnalysis />
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
            Pattern Recognition AI
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            고급 차트 패턴 인식과 하모닉 분석으로 정확한 매매 타이밍 포착
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
            <FaChartLine className="text-2xl text-yellow-400" />
            <h3 className="text-xl font-bold text-white">패턴 인식 트레이딩 팁</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-indigo-400 font-semibold mb-2">주요 차트 패턴</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Head and Shoulders: 추세 전환 신호</li>
                <li>• Double Top/Bottom: 저항/지지 레벨</li>
                <li>• Triangles: 돌파 방향 예측</li>
                <li>• Flags/Pennants: 추세 지속 패턴</li>
              </ul>
            </div>

            <div>
              <h4 className="text-purple-400 font-semibold mb-2">Go 하이브리드 장점</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 병렬 스캐닝으로 10x 빠른 검색</li>
                <li>• 패턴 캐싱으로 메모리 60% 절감</li>
                <li>• 실시간 감지 지연 &lt; 10ms</li>
                <li>• 하모닉 패턴 정확도 95%+</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}