'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  FaChartPie, FaChartLine, FaBalanceScale, FaCalculator,
  FaRobot, FaUniversity, FaCogs, FaChartBar
} from 'react-icons/fa'

// Dynamic imports
const EfficientFrontier3D = dynamic(() => import('./efficient-frontier-3d'), {
  loading: () => <div className="text-center py-20">효율적 프론티어 로딩중...</div>,
  ssr: false
})

const BlackLittermanModel = dynamic(() => import('./black-litterman-model'), {
  loading: () => <div className="text-center py-20">Black-Litterman 모델 로딩중...</div>,
  ssr: false
})

const RiskParityStrategy = dynamic(() => import('./risk-parity-strategy'), {
  loading: () => <div className="text-center py-20">Risk Parity 전략 로딩중...</div>,
  ssr: false
})

const KellyCriterion = dynamic(() => import('./kelly-criterion'), {
  loading: () => <div className="text-center py-20">Kelly Criterion 로딩중...</div>,
  ssr: false
})

interface TabContent {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

const tabs: TabContent[] = [
  {
    id: 'efficient-frontier',
    label: '효율적 프론티어',
    icon: FaChartLine,
    description: '리스크-수익률 최적화를 통한 포트폴리오 구성'
  },
  {
    id: 'black-litterman',
    label: 'Black-Litterman',
    icon: FaUniversity,
    description: '시장 균형과 투자자 전망을 결합한 포트폴리오 최적화'
  },
  {
    id: 'risk-parity',
    label: 'Risk Parity',
    icon: FaBalanceScale,
    description: '리스크 기여도 균등 배분 전략'
  },
  {
    id: 'kelly-criterion',
    label: 'Kelly Criterion',
    icon: FaCalculator,
    description: '최적 베팅 크기 계산기'
  }
]

export default function PortfolioOptimizerModule() {
  const [activeTab, setActiveTab] = useState('efficient-frontier')
  const [savedPortfolios, setSavedPortfolios] = useState<any[]>([])

  const handleSavePortfolio = (portfolio: any) => {
    setSavedPortfolios([...savedPortfolios, {
      ...portfolio,
      id: Date.now(),
      createdAt: new Date()
    }])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <FaChartPie className="text-4xl" />
              포트폴리오 옵티마이저
            </h1>
            <p className="text-lg opacity-90">
              과학적인 방법론을 활용한 최적의 포트폴리오 구성
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-3xl font-bold">15%</p>
              <p className="text-sm opacity-80">목표 수익률</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-3xl font-bold">8%</p>
              <p className="text-sm opacity-80">리스크 수준</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[200px] px-6 py-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <tab.icon className="text-xl" />
                <span className="font-semibold">{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <p className="text-sm mt-1 opacity-80">{tab.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        {activeTab === 'efficient-frontier' && <EfficientFrontier3D />}
        {activeTab === 'black-litterman' && <BlackLittermanModel />}
        {activeTab === 'risk-parity' && <RiskParityStrategy />}
        {activeTab === 'kelly-criterion' && <KellyCriterion />}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaChartLine className="text-4xl text-blue-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">3D</h3>
          <p className="text-gray-400">시각화</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaRobot className="text-4xl text-green-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">AI</h3>
          <p className="text-gray-400">최적화</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaBalanceScale className="text-4xl text-purple-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">균형</h3>
          <p className="text-gray-400">리스크 관리</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaChartBar className="text-4xl text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">백테스팅</h3>
          <p className="text-gray-400">검증</p>
        </motion.div>
      </div>

      {/* Saved Portfolios */}
      {savedPortfolios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCogs className="text-gray-400" />
            저장된 포트폴리오
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPortfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all cursor-pointer"
              >
                <h4 className="text-white font-semibold">{portfolio.name || 'Untitled Portfolio'}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(portfolio.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-green-400">
                    수익률: {portfolio.expectedReturn || 'N/A'}%
                  </span>
                  <span className="text-red-400">
                    리스크: {portfolio.risk || 'N/A'}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Educational Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">포트폴리오 최적화란?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-300">
          <div>
            <h4 className="font-semibold mb-2">Modern Portfolio Theory (MPT)</h4>
            <p>
              Harry Markowitz가 개발한 이론으로, 주어진 리스크 수준에서 최대 수익률을 
              달성하거나 목표 수익률을 최소 리스크로 달성하는 포트폴리오를 찾습니다.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">다양한 최적화 방법론</h4>
            <p>
              효율적 프론티어, Black-Litterman, Risk Parity, Kelly Criterion 등 
              다양한 방법론을 활용하여 투자자의 목표와 상황에 맞는 최적의 포트폴리오를 구성합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}