'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, FaChartLine, FaWaveSquare, FaClock, FaChartArea,
  FaCalculator, FaSignal, FaChartPie, FaTachometerAlt, FaHistory,
  FaBalanceScale, FaFilter, FaMagic, FaRocket, FaAtom
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


export default function ARIMAModuleEnhanced() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')

  const tabs = [
    { id: 'overview', label: '개요', icon: FaChartBar },
    { id: 'decomposition', label: '시계열 분해', icon: FaWaveSquare },
    { id: 'acfpacf', label: 'ACF/PACF', icon: FaChartArea },
    { id: 'autoarima', label: 'Auto-ARIMA', icon: FaMagic },
    { id: 'fanchart', label: 'Fan Chart', icon: FaChartLine },
    { id: 'diagnostics', label: '진단', icon: FaTachometerAlt }
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
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mb-4">
            ARIMA 시계열 분석
          </h1>
          <p className="text-xl text-gray-300">
            AutoRegressive Integrated Moving Average - 전통적 시계열 예측의 황금 표준
          </p>
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

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <AnimatePresence>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="text-lg" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </AnimatePresence>
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}