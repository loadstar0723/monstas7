'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  FaRobot, FaChartLine, FaCogs, FaHistory,
  FaBrain, FaCode, FaPlay, FaSave
} from 'react-icons/fa'

// Dynamic imports for performance
const DragDropInterface = dynamic(() => import('./DragDropInterface'), {
  loading: () => <div className="text-center py-20">전략 빌더 로딩중...</div>,
  ssr: false
})

const IndicatorLibrary = dynamic(() => import('./indicator-library'), {
  loading: () => <div className="text-center py-20">지표 라이브러리 로딩중...</div>,
  ssr: false
})

const AISignalCombiner = dynamic(() => import('./AISignalCombiner'), {
  loading: () => <div className="text-center py-20">AI 신호 결합기 로딩중...</div>,
  ssr: false
})

const RealtimeBacktest = dynamic(() => import('./RealtimeBacktest'), {
  loading: () => <div className="text-center py-20">백테스트 엔진 로딩중...</div>,
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
    id: 'builder',
    label: '전략 빌더',
    icon: FaCogs,
    description: '드래그&드롭으로 쉽게 전략을 구성하세요'
  },
  {
    id: 'indicators',
    label: '지표 라이브러리',
    icon: FaChartLine,
    description: '100개 이상의 기술적 지표를 활용하세요'
  },
  {
    id: 'ai-signals',
    label: 'AI 신호 결합',
    icon: FaBrain,
    description: '여러 AI 모델의 신호를 최적으로 결합하세요'
  },
  {
    id: 'backtest',
    label: '백테스트',
    icon: FaHistory,
    description: '실시간으로 전략 성과를 검증하세요'
  }
]

export default function StrategyBuilderModule() {
  const [activeTab, setActiveTab] = useState('builder')
  const [savedStrategies, setSavedStrategies] = useState<any[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  const handleSaveStrategy = (strategy: any) => {
    setSavedStrategies([...savedStrategies, {
      ...strategy,
      id: Date.now(),
      createdAt: new Date()
    }])
  }

  const handleExecuteStrategy = () => {
    setIsExecuting(true)
    // 실제 실행 로직
    setTimeout(() => {
      setIsExecuting(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <FaRobot className="text-4xl" />
              AI 전략 빌더 3.0
            </h1>
            <p className="text-lg opacity-90">
              드래그&드롭으로 간편하게 나만의 AI 트레이딩 전략을 만들어보세요
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExecuteStrategy}
              disabled={isExecuting}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isExecuting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  실행 중...
                </>
              ) : (
                <>
                  <FaPlay /> 전략 실행
                </>
              )}
            </button>
            <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <FaCode /> 코드 생성
            </button>
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
        className="bg-gray-900 rounded-xl p-6 min-h-[600px]"
      >
        {activeTab === 'builder' && <DragDropInterface />}
        {activeTab === 'indicators' && <IndicatorLibrary />}
        {activeTab === 'ai-signals' && <AISignalCombiner />}
        {activeTab === 'backtest' && <RealtimeBacktest />}
      </motion.div>

      {/* Saved Strategies */}
      {savedStrategies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaSave className="text-blue-400" />
            저장된 전략
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedStrategies.map((strategy) => (
              <div
                key={strategy.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all cursor-pointer"
              >
                <h4 className="text-white font-semibold">{strategy.metadata?.name || 'Untitled Strategy'}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(strategy.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-300">
                    컴포넌트: {strategy.components?.length || 0}
                  </span>
                  <span className="text-gray-300">
                    연결: {strategy.connections?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaChartLine className="text-4xl text-blue-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">100+</h3>
          <p className="text-gray-400">기술적 지표</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaBrain className="text-4xl text-green-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">9</h3>
          <p className="text-gray-400">AI 모델</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaHistory className="text-4xl text-purple-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">실시간</h3>
          <p className="text-gray-400">백테스팅</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 text-center"
        >
          <FaCode className="text-4xl text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">자동</h3>
          <p className="text-gray-400">코드 생성</p>
        </motion.div>
      </div>
    </div>
  )
}