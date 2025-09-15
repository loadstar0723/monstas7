'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBolt, FaLeaf, FaMemory, FaCogs, FaChartBar,
  FaTree, FaDatabase, FaRocket, FaLightbulb
} from 'react-icons/fa'

// 3D Leaf Boosting 배경 임포트
import { DarkWaveBackground3D } from '@/components/backgrounds/DarkWaveBackground3D'

// 동적 임포트로 성능 최적화
const ErrorBoundary = dynamic(() => import('./components/ErrorBoundary'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelOverview = dynamic(() => import('./components/ModelOverview'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const LeafwiseVisualization = dynamic(() => import('./components/LeafwiseVisualization'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const MemoryEfficiency = dynamic(() => import('./components/MemoryEfficiency'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ParameterOptimization = dynamic(() => import('./components/ParameterOptimization'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const AdvancedVisualization = dynamic(() => import('./components/AdvancedVisualization'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const DynamicAnalysis = dynamic(() => import('./components/DynamicAnalysis'), {
  ssr: false
})


// 탭 설정
interface TabConfig {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  color: string
}

export default function LightGBMModuleEnhanced() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      title: '모델 개요',
      icon: <FaBolt className="text-2xl" />,
      description: 'LightGBM 알고리즘 소개',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'leafwise',
      title: 'Leaf-wise 성장',
      icon: <FaLeaf className="text-2xl" />,
      description: '효율적인 트리 성장 방식',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'memory',
      title: '메모리 효율성',
      icon: <FaMemory className="text-2xl" />,
      description: '히스토그램 기반 최적화',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'parameter',
      title: '파라미터 튜닝',
      icon: <FaCogs className="text-2xl" />,
      description: '하이퍼파라미터 최적화',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'visualization',
      title: '고급 시각화',
      icon: <FaChartBar className="text-2xl" />,
      description: '모델 내부 구조 분석',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <ErrorBoundary>
            <ModelOverview symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="overview" />
          </ErrorBoundary>
        )
      case 'leafwise':
        return (
          <ErrorBoundary>
            <LeafwiseVisualization symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="leafwise" />
          </ErrorBoundary>
        )
      case 'memory':
        return (
          <ErrorBoundary>
            <MemoryEfficiency symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="memory" />
          </ErrorBoundary>
        )
      case 'parameter':
        return (
          <ErrorBoundary>
            <ParameterOptimization symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="parameter" />
          </ErrorBoundary>
        )
      case 'visualization':
        return (
          <ErrorBoundary>
            <AdvancedVisualization symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="visualization" />
          </ErrorBoundary>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* 3D Leaf Boosting 배경 */}
      <div className="fixed inset-0 z-0">
        <DarkWaveBackground3D />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            LightGBM - Light Gradient Boosting Machine
          </h1>
          <p className="text-xl text-gray-300">
            Microsoft의 초고속, 고효율 그래디언트 부스팅 프레임워크
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
            className="bg-gray-800/50 backdrop-blur-sm text-white rounded-lg px-6 py-3 border border-gray-700 focus:border-blue-500 transition-all"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>
        </div>

        {/* 탭 네비게이션 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`relative p-4 rounded-xl backdrop-blur-sm transition-all ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-2">
                {tab.icon}
                <span className="text-sm font-medium">{tab.title}</span>
              </div>
              
              {selectedTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
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
          <p>LightGBM은 대용량 데이터 처리에 최적화된 알고리즘입니다</p>
          <p className="mt-2">메모리 효율성과 속도를 모두 잡은 최고의 선택</p>
        </motion.div>

        {/* 주요 특징 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaRocket className="text-3xl text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">15x</div>
            <div className="text-sm text-gray-400">더 빠른 속도</div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaMemory className="text-3xl text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">8x</div>
            <div className="text-sm text-gray-400">메모리 효율</div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaDatabase className="text-3xl text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">10M+</div>
            <div className="text-sm text-gray-400">처리 가능 행</div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaLightbulb className="text-3xl text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">91%</div>
            <div className="text-sm text-gray-400">예측 정확도</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}