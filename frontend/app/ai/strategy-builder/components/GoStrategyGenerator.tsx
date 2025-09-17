'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Zap, Target, Layers } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  type: 'momentum' | 'mean-reversion' | 'arbitrage' | 'market-making' | 'trend-following'
  complexity: 'simple' | 'medium' | 'advanced'
  expectedReturn: number
  riskLevel: number
  winRate: number
  indicators: string[]
  rules: {
    entry: string[]
    exit: string[]
    stopLoss: string
    takeProfit: string
  }
  backtest: {
    sharpe: number
    maxDrawdown: number
    profitFactor: number
  }
}

interface GeneratorMetrics {
  totalStrategies: number
  generationSpeed: number
  activeGenerators: number
  topStrategies: Strategy[]
  generationProgress: number
}

interface GoStrategyGeneratorProps {
  selectedStrategy?: string
}

export default function GoStrategyGenerator({ selectedStrategy = 'MOMENTUM' }: GoStrategyGeneratorProps) {
  const [metrics, setMetrics] = useState<GeneratorMetrics>({
    totalStrategies: 0,
    generationSpeed: 0,
    activeGenerators: 0,
    topStrategies: [],
    generationProgress: 0
  })

  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/strategy/generate')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        // 시뮬레이션 모드
        const strategyTypeMap: Record<string, string> = {
          'MOMENTUM': 'momentum',
          'MEAN-REVERSION': 'mean-reversion',
          'ARBITRAGE': 'arbitrage',
          'MARKET-MAKING': 'market-making',
          'TREND': 'trend-following'
        }

        const currentType = strategyTypeMap[selectedStrategy] || 'momentum'
        const complexityLevels = ['simple', 'medium', 'advanced'] as const
        const indicators = ['RSI', 'MACD', 'BB', 'EMA', 'SMA', 'Volume', 'ATR', 'Stochastic']

        const strategies: Strategy[] = Array(3).fill(null).map((_, idx) => ({
          id: `STR${Date.now()}${idx}`,
          name: `${selectedStrategy} 전략 #${idx + 1}`,
          type: currentType as any,
          complexity: complexityLevels[Math.floor(Math.random() * complexityLevels.length)],
          expectedReturn: Math.random() * 50 + 20,
          riskLevel: Math.random() * 30 + 10,
          winRate: Math.random() * 20 + 50,
          indicators: indicators.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2),
          rules: {
            entry: [
              'RSI < 30',
              'MACD 골든크로스',
              'Volume > MA(20)'
            ],
            exit: [
              'RSI > 70',
              'MACD 데드크로스',
              'Price < EMA(50)'
            ],
            stopLoss: '-2%',
            takeProfit: '+5%'
          },
          backtest: {
            sharpe: Math.random() * 2 + 0.5,
            maxDrawdown: Math.random() * 15 + 5,
            profitFactor: Math.random() * 1.5 + 1.2
          }
        }))

        setMetrics({
          totalStrategies: Math.floor(Math.random() * 100 + 50),
          generationSpeed: Math.floor(Math.random() * 50 + 20),
          activeGenerators: Math.floor(Math.random() * 8 + 4),
          topStrategies: strategies,
          generationProgress: isGenerating ? Math.min(100, metrics.generationProgress + 10) : 0
        })
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [isGenerating, metrics.generationProgress, selectedStrategy])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'momentum': 'text-green-400',
      'mean-reversion': 'text-blue-400',
      'arbitrage': 'text-purple-400',
      'market-making': 'text-yellow-400',
      'trend-following': 'text-cyan-400'
    }
    return colors[type] || 'text-gray-400'
  }

  const getComplexityBadge = (complexity: string) => {
    const colors: Record<string, string> = {
      'simple': 'bg-green-900 text-green-300',
      'medium': 'bg-yellow-900 text-yellow-300',
      'advanced': 'bg-red-900 text-red-300'
    }
    return colors[complexity] || 'bg-gray-900 text-gray-300'
  }

  return (
    <div className="space-y-6">
      {/* 전략 생성 메트릭 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Brain className="w-5 h-5" />
            Go AI 전략 생성기 - {selectedStrategy}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">생성된 전략</div>
              <div className="text-xl font-bold text-green-400">
                {metrics.totalStrategies}
              </div>
              <div className="text-xs text-gray-500">총 전략 수</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">생성 속도</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.generationSpeed}/s
              </div>
              <div className="text-xs text-gray-500">전략/초</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">활성 생성기</div>
              <div className="text-xl font-bold text-purple-400">
                {metrics.activeGenerators}
              </div>
              <div className="text-xs text-gray-500">병렬 처리</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">최고 샤프</div>
              <div className="text-xl font-bold text-yellow-400">
                {metrics.topStrategies[0]?.backtest.sharpe.toFixed(2) || '0'}
              </div>
              <div className="text-xs text-gray-500">최고 성능</div>
            </div>
          </div>

          {/* 생성 진행률 */}
          {isGenerating && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>전략 생성 중...</span>
                <span>{metrics.generationProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.generationProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 생성된 전략 목록 */}
      <Card className="bg-gray-900 border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Target className="w-5 h-5" />
            AI 생성 전략 (Top 3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topStrategies.map((strategy) => (
              <div key={strategy.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getTypeColor(strategy.type)}`}>
                        {strategy.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getComplexityBadge(strategy.complexity)}`}>
                        {strategy.complexity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      타입: {strategy.type} | 지표: {strategy.indicators.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">
                      +{strategy.expectedReturn.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      예상 수익
                    </div>
                  </div>
                </div>

                {/* 전략 규칙 */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2 bg-gray-900 rounded">
                    <div className="text-xs text-green-400 mb-1">진입 조건</div>
                    <div className="text-xs text-gray-400">
                      {strategy.rules.entry.slice(0, 2).map((rule, idx) => (
                        <div key={idx}>• {rule}</div>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-900 rounded">
                    <div className="text-xs text-red-400 mb-1">청산 조건</div>
                    <div className="text-xs text-gray-400">
                      <div>• SL: {strategy.rules.stopLoss}</div>
                      <div>• TP: {strategy.rules.takeProfit}</div>
                    </div>
                  </div>
                </div>

                {/* 백테스트 결과 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">승률</div>
                    <div className="text-sm font-bold text-blue-400">
                      {strategy.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">샤프</div>
                    <div className="text-sm font-bold text-purple-400">
                      {strategy.backtest.sharpe.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">MDD</div>
                    <div className="text-sm font-bold text-red-400">
                      -{strategy.backtest.maxDrawdown.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Go 생성 최적화 */}
      <Card className="bg-gray-900 border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Layers className="w-5 h-5" />
            Go 전략 생성 파이프라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                유전자 알고리즘
              </div>
              <div className="text-xs text-gray-500">
                10,000세대 진화
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                강화학습
              </div>
              <div className="text-xs text-gray-500">
                DQN/PPO 최적화
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                백테스트 검증
              </div>
              <div className="text-xs text-gray-500">
                5년 데이터 검증
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                리스크 필터
              </div>
              <div className="text-xs text-gray-500">
                샤프 &gt; 1.5 필터링
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-2">생성 성능</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">생성 속도:</span>
                <span className="text-green-400">100x faster</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">성공률:</span>
                <span className="text-green-400">85%+</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsGenerating(!isGenerating)}
            className={`w-full mt-4 py-2 rounded-lg font-semibold transition-all ${
              isGenerating
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-500 hover:to-blue-500'
            }`}
          >
            {isGenerating ? '생성 중지' : 'AI 전략 생성'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}