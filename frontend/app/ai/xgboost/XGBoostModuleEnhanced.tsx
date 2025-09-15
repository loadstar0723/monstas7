'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaRocket, FaTree, FaCogs, FaChartBar, FaLayerGroup,
  FaProjectDiagram, FaChartLine, FaAtom, FaBolt
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


// 탭 설정
interface TabConfig {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  color: string
}

export default function XGBoostModuleEnhanced() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')

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
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            XGBoost - eXtreme Gradient Boosting
          </h1>
          <p className="text-xl text-gray-300">
            최강의 머신러닝 알고리즘으로 암호화폐 시장을 예측하세요
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
            className="bg-gray-800/50 backdrop-blur-sm text-white rounded-lg px-6 py-3 border border-gray-700 focus:border-green-500 transition-all"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>
        </div>

        {/* 탭 네비게이션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
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
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 -z-10"
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
    </div>
  )
}