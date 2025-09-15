'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTree, FaBrain, FaChartBar, FaDatabase, FaVoteYea, 
  FaBalanceScale, FaChartArea, FaMagic, FaRobot, FaLeaf,
  FaChartLine, FaLightbulb, FaLayerGroup, FaCube
} from 'react-icons/fa'

// 동적 임포트로 성능 최적화
const ErrorBoundary = dynamic(() => import('./components/ErrorBoundary'), { ssr: false })
const ModelOverview = dynamic(() => import('./components/ModelOverview'), { ssr: false })
const TreeVisualization3D = dynamic(() => import('./components/TreeVisualization3D'), { ssr: false })
const SHAPAnalysis = dynamic(() => import('./components/SHAPAnalysis'), { ssr: false })
const FeatureImportance = dynamic(() => import('./components/FeatureImportance'), { ssr: false })
const EnsembleVoting = dynamic(() => import('./components/EnsembleVoting'), { ssr: false })
const OOBAnalysis = dynamic(() => import('./components/OOBAnalysis'), { ssr: false })
const PartialDependence = dynamic(() => import('./components/PartialDependence'), { ssr: false })
const DynamicAnalysis = dynamic(() => import('./components/DynamicAnalysis'), { ssr: false })

// 원래 3D 숲 배경 임포트
import { ForestBackground3D } from '@/components/backgrounds/ForestBackground3D'

interface TabConfig {
  id: string
  title: string
  icon: React.ReactNode
  gradient: string
  description: string
}

const tabs: TabConfig[] = [
  {
    id: 'overview',
    title: '모델 개요',
    icon: <FaTree className="text-2xl" />,
    gradient: 'from-green-500/20 to-emerald-500/20',
    description: 'Random Forest 알고리즘의 작동 원리와 특징을 학습합니다'
  },
  {
    id: 'tree3d',
    title: '3D 트리 시각화',
    icon: <FaCube className="text-2xl" />,
    gradient: 'from-purple-500/20 to-pink-500/20',
    description: '의사결정 트리를 3차원으로 탐색하고 상호작용합니다'
  },
  {
    id: 'shap',
    title: 'SHAP 분석',
    icon: <FaBrain className="text-2xl" />,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    description: '각 특성이 예측에 미치는 영향을 정량적으로 분석합니다'
  },
  {
    id: 'importance',
    title: '특성 중요도',
    icon: <FaChartBar className="text-2xl" />,
    gradient: 'from-yellow-500/20 to-orange-500/20',
    description: '예측에 중요한 특성을 식별하고 우선순위를 매깁니다'
  },
  {
    id: 'voting',
    title: '앙상블 투표',
    icon: <FaVoteYea className="text-2xl" />,
    gradient: 'from-red-500/20 to-pink-500/20',
    description: '여러 트리의 투표 과정을 실시간으로 시뮬레이션합니다'
  },
  {
    id: 'oob',
    title: 'OOB 분석',
    icon: <FaDatabase className="text-2xl" />,
    gradient: 'from-indigo-500/20 to-purple-500/20',
    description: 'Out-of-Bag 샘플로 모델 성능을 검증합니다'
  },
  {
    id: 'pdp',
    title: '부분 의존성',
    icon: <FaChartArea className="text-2xl" />,
    gradient: 'from-teal-500/20 to-green-500/20',
    description: '특성의 한계 효과를 분석하여 모델 행동을 이해합니다'
  }
]

const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']

export default function RandomForestModuleEnhanced() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // 3D 애니메이션 배경 효과
    const timer = setInterval(() => {
      setIsAnimating(prev => !prev)
    }, 10000)

    return () => clearInterval(timer)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ErrorBoundary>
            <ModelOverview symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="overview" />
          </ErrorBoundary>
        )
      case 'tree3d':
        return (
          <ErrorBoundary>
            <TreeVisualization3D symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="tree" />
          </ErrorBoundary>
        )
      case 'shap':
        return (
          <ErrorBoundary>
            <SHAPAnalysis symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="shap" />
          </ErrorBoundary>
        )
      case 'importance':
        return (
          <ErrorBoundary>
            <FeatureImportance symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="importance" />
          </ErrorBoundary>
        )
      case 'voting':
        return (
          <ErrorBoundary>
            <EnsembleVoting symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="voting" />
          </ErrorBoundary>
        )
      case 'oob':
        return (
          <ErrorBoundary>
            <OOBAnalysis symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="oob" />
          </ErrorBoundary>
        )
      case 'pdp':
        return (
          <ErrorBoundary>
            <PartialDependence symbol={selectedSymbol} />
            <DynamicAnalysis analysisType="pdp" />
          </ErrorBoundary>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* 원래 3D 숲 배경 */}
      <div className="fixed inset-0 z-0">
        <ForestBackground3D />
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <FaTree className="text-green-400" />
            Random Forest AI 트레이딩
            <FaLeaf className="text-green-400" />
          </h1>
          <p className="text-xl text-gray-300">
            앙상블 학습의 힘으로 더 정확하고 안정적인 암호화폐 가격 예측
          </p>
          
          {/* 심볼 선택 */}
          <div className="mt-6 flex justify-center gap-2">
            {symbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative p-4 rounded-xl transition-all duration-300 overflow-hidden group ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br ' + tab.gradient + ' border-2 border-white/20 shadow-xl'
                  : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="relative z-10 min-h-screen p-6">
                <div className="flex justify-center mb-2 text-white">{tab.icon}</div>
                <div className="text-sm font-semibold text-white">{tab.title}</div>
              </div>
              
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabHighlight"
                  className="absolute inset-0 bg-white/5 blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* 액티브 탭 설명 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
        >
          <p className="text-gray-300 text-center">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </motion.div>

        {/* 탭 컨텐츠 */}
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