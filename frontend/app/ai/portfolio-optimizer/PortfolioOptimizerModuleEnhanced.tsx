'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartPie, FaBalanceScale, FaRedo, FaHistory,
  FaChartLine, FaShieldAlt, FaBolt, FaCogs
} from 'react-icons/fa'
import { TrendingUp, Shield, RefreshCw, ChartBar } from 'lucide-react'
import GoEngineStatus from '@/components/GoEngineStatus'

// Go 하이브리드 컴포넌트
const GoEfficientFrontier = dynamic(() => import('./components/GoEfficientFrontier'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoRiskManagement = dynamic(() => import('./components/GoRiskManagement'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoRebalancing = dynamic(() => import('./components/GoRebalancing'), {
  loading: () => <div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />,
  ssr: false
})

const GoBacktesting = dynamic(() => import('./components/GoBacktesting'), {
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
    id: 'go-frontier',
    label: 'Go 효율적 프론티어',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Go 병렬 최적화로 효율적 프론티어 계산',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'go-risk',
    label: 'Go 리스크 관리',
    icon: <Shield className="w-5 h-5" />,
    description: 'Go 실시간 리스크 계산 엔진',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'go-rebalancing',
    label: 'Go 리밸런싱',
    icon: <RefreshCw className="w-5 h-5" />,
    description: 'Go 자동 포트폴리오 리밸런싱',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'go-backtest',
    label: 'Go 백테스팅',
    icon: <ChartBar className="w-5 h-5" />,
    description: 'Go 고속 백테스팅 엔진',
    gradient: 'from-yellow-500 to-red-500'
  }
]

export default function PortfolioOptimizerModuleEnhanced() {
  const [activeTab, setActiveTab] = useState('go-frontier')
  const [selectedSymbol, setSelectedSymbol] = useState('PORTFOLIO')
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
      case 'go-frontier':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoEfficientFrontier />
          </Suspense>
        )
      case 'go-risk':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoRiskManagement />
          </Suspense>
        )
      case 'go-rebalancing':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoRebalancing />
          </Suspense>
        )
      case 'go-backtest':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-800/50 h-96 rounded-xl" />}>
            <GoBacktesting />
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
            Portfolio Optimizer AI
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Go 하이브리드 엔진으로 최적의 포트폴리오 구성과 리스크 관리
          </p>
        </motion.div>

        {/* Portfolio Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 inline-flex gap-2">
            {['PORTFOLIO', 'AGGRESSIVE', 'BALANCED', 'CONSERVATIVE', 'CUSTOM'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSymbol(type)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSymbol === type
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
            <FaCogs className="text-2xl text-yellow-400" />
            <h3 className="text-xl font-bold text-white">포트폴리오 최적화 팁</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-indigo-400 font-semibold mb-2">포트폴리오 구성 원칙</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 효율적 프론티어: 최대 수익, 최소 리스크</li>
                <li>• 분산 투자: 5-10개 자산으로 리스크 분산</li>
                <li>• 정기 리밸런싱: 월 1회 자동 조정</li>
                <li>• 백테스팅: 과거 데이터로 전략 검증</li>
              </ul>
            </div>

            <div>
              <h4 className="text-purple-400 font-semibold mb-2">Go 하이브리드 성능</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 프론티어 계산: 50x 빠른 최적화</li>
                <li>• 리스크 분석: 실시간 VaR 계산</li>
                <li>• 백테스팅: 10년치 데이터 1초 처리</li>
                <li>• 리밸런싱: 슬리피지 40% 절감</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}