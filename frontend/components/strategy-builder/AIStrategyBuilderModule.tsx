'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FaBrain, FaChartLine, FaCode, FaHistory, FaRocket, FaBook, FaCog, FaCloudDownloadAlt } from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'

// 동적 임포트
const StrategyCanvas = dynamic(() => import('./StrategyCanvas'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><div className="text-white">전략 빌더 로딩중...</div></div>
})

const IndicatorLibrary = dynamic(() => import('./IndicatorLibrary'), { ssr: false })
const BacktestEngine = dynamic(() => import('./BacktestEngine'), { ssr: false })
const StrategyOptimizer = dynamic(() => import('./StrategyOptimizer'), { ssr: false })
const CodeGenerator = dynamic(() => import('./CodeGenerator'), { ssr: false })
const StrategyTemplates = dynamic(() => import('./StrategyTemplates'), { ssr: false })

interface Strategy {
  id: string
  name: string
  description: string
  nodes: any[]
  edges: any[]
  performance?: {
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    totalReturn: number
  }
  createdAt: number
  updatedAt: number
}

export default function AIStrategyBuilderModule() {
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([])
  const [activeTab, setActiveTab] = useState('builder')
  const [isOptimizing, setIsOptimizing] = useState(false)

  // 저장된 전략 로드
  useEffect(() => {
    const loadedStrategies: Strategy[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('strategy_')) {
        try {
          const strategy = JSON.parse(localStorage.getItem(key) || '{}')
          loadedStrategies.push(strategy)
        } catch (e) {
          console.error('Failed to parse strategy:', e)
        }
      }
    }
    setSavedStrategies(loadedStrategies.sort((a, b) => b.updatedAt - a.updatedAt))
  }, [])

  // 전략 변경 핸들러
  const handleStrategyChange = (strategy: any) => {
    const updatedStrategy: Strategy = {
      id: currentStrategy?.id || `strategy_${Date.now()}`,
      name: strategy.name,
      description: strategy.description || '',
      nodes: strategy.nodes,
      edges: strategy.edges,
      createdAt: currentStrategy?.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    
    setCurrentStrategy(updatedStrategy)
    
    // 로컬 스토리지 업데이트
    localStorage.setItem(updatedStrategy.id, JSON.stringify(updatedStrategy))
    
    // 저장된 전략 목록 업데이트
    setSavedStrategies(prev => {
      const filtered = prev.filter(s => s.id !== updatedStrategy.id)
      return [updatedStrategy, ...filtered]
    })
  }

  // 전략 최적화
  const optimizeStrategy = async () => {
    if (!currentStrategy) return
    
    setIsOptimizing(true)
    
    // 시뮬레이션된 최적화 프로세스
    setTimeout(() => {
      const optimizedPerformance = {
        winRate: 65 + Math.random() * 20,
        sharpeRatio: 1.2 + Math.random() * 0.8,
        maxDrawdown: -(10 + Math.random() * 15),
        totalReturn: 50 + Math.random() * 100
      }
      
      const optimizedStrategy = {
        ...currentStrategy,
        performance: optimizedPerformance,
        updatedAt: Date.now()
      }
      
      setCurrentStrategy(optimizedStrategy)
      handleStrategyChange(optimizedStrategy)
      setIsOptimizing(false)
    }, 3000)
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <GiArtificialIntelligence className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI 전략 빌더 3.0</h2>
              <p className="text-gray-400">드래그&드롭으로 고급 트레이딩 전략 구축</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentStrategy && (
              <div className="text-right">
                <div className="text-sm text-gray-400">현재 전략</div>
                <div className="text-white font-semibold">{currentStrategy.name}</div>
              </div>
            )}
            <button
              onClick={optimizeStrategy}
              disabled={!currentStrategy || isOptimizing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <FaRocket className={isOptimizing ? 'animate-pulse' : ''} />
              {isOptimizing ? '최적화 중...' : 'AI 최적화'}
            </button>
          </div>
        </div>

        {/* 성과 지표 */}
        {currentStrategy?.performance && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">승률</div>
              <div className="text-2xl font-bold text-green-400">
                {currentStrategy.performance.winRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">샤프 비율</div>
              <div className="text-2xl font-bold text-blue-400">
                {currentStrategy.performance.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">최대 손실</div>
              <div className="text-2xl font-bold text-red-400">
                {currentStrategy.performance.maxDrawdown.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">총 수익률</div>
              <div className="text-2xl font-bold text-purple-400">
                +{currentStrategy.performance.totalReturn.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메인 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full bg-gray-800/50 p-1">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FaBrain className="text-sm" />
            빌더
          </TabsTrigger>
          <TabsTrigger value="indicators" className="flex items-center gap-2">
            <FaChartLine className="text-sm" />
            지표
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <FaHistory className="text-sm" />
            백테스트
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <FaCog className="text-sm" />
            최적화
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <FaCode className="text-sm" />
            코드
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FaBook className="text-sm" />
            템플릿
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4">
          <div className="bg-gray-800/50 rounded-lg p-4 h-[800px]">
            <StrategyCanvas 
              onStrategyChange={handleStrategyChange}
              initialStrategy={currentStrategy}
            />
          </div>
        </TabsContent>

        <TabsContent value="indicators" className="mt-4">
          <IndicatorLibrary />
        </TabsContent>

        <TabsContent value="backtest" className="mt-4">
          <BacktestEngine strategy={currentStrategy} />
        </TabsContent>

        <TabsContent value="optimize" className="mt-4">
          <StrategyOptimizer strategy={currentStrategy} />
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <CodeGenerator strategy={currentStrategy} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <StrategyTemplates onSelectTemplate={handleStrategyChange} />
        </TabsContent>
      </Tabs>

      {/* 저장된 전략 사이드바 */}
      <div className="fixed right-6 top-32 w-64">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaCloudDownloadAlt />
            저장된 전략
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedStrategies.map(strategy => (
              <motion.div
                key={strategy.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentStrategy(strategy)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  currentStrategy?.id === strategy.id 
                    ? 'bg-purple-600/30 border border-purple-500' 
                    : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                }`}
              >
                <div className="text-white font-medium text-sm">{strategy.name}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(strategy.updatedAt).toLocaleDateString()}
                </div>
                {strategy.performance && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-green-400">
                      {strategy.performance.winRate.toFixed(0)}%
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-blue-400">
                      SR: {strategy.performance.sharpeRatio.toFixed(1)}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}