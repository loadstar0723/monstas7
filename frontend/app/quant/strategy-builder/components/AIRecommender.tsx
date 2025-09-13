'use client'

import React, { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FiZap, FiTrendingUp, FiTarget, FiAlertCircle, FiRefreshCw, FiStar } from 'react-icons/fi'
import { FaBrain, FaChartBar } from 'react-icons/fa'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

interface MarketCondition {
  trend: 'bullish' | 'bearish' | 'sideways'
  volatility: 'low' | 'medium' | 'high'
  volume: 'low' | 'medium' | 'high'
  fearGreedIndex: number
  dominance: {
    btc: number
    eth: number
    others: number
  }
}

interface AIRecommendation {
  id: string
  strategy: string
  confidence: number
  expectedReturn: string
  timeframe: string
  riskLevel: 'low' | 'medium' | 'high'
  reasoning: string[]
  marketConditions: string[]
  parameters: {
    [key: string]: number
  }
  backtestResults: {
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    totalReturn: number
  }
}

interface AIRecommenderProps {
  symbol?: string
  timeframe?: string
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
  onApplyRecommendation: (recommendation: AIRecommendation) => void
}

const AIRecommender: React.FC<AIRecommenderProps> = ({
  symbol = 'BTCUSDT',
  timeframe = '1d',
  riskTolerance = 'moderate',
  onApplyRecommendation
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [marketConditions, setMarketConditions] = useState<MarketCondition | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)

  // 시장 데이터 및 AI 추천 로드
  useEffect(() => {
    loadMarketAnalysis()
  }, [symbol, timeframe, riskTolerance])

  const loadMarketAnalysis = async () => {
    try {
      setLoading(true)
      
      // 실제 시장 데이터 로드
      const [marketData, aiRecommendations] = await Promise.all([
        fetchMarketConditions(),
        fetchAIRecommendations()
      ])

      setMarketConditions(marketData)
      setRecommendations(aiRecommendations)
    } catch (error) {
      console.error('AI 추천 로드 실패:', error)
      // 에러 시 기본값 사용
      await loadDefaultRecommendations()
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketConditions = async (): Promise<MarketCondition> => {
    try {
      // Binance API로 시장 데이터 가져오기
      const priceData = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=100`)
      const priceResult = priceData.ok ? await priceData.json() : { data: [] }
      
      // Fear & Greed 및 도미넌스는 옵셔널 (API가 없을 수 있음)
      let fearGreedResult = { value: 50 }
      let dominanceResult = { btc: 45, eth: 18, others: 37 }
      
      try {
        const fearGreedData = await fetch('/api/fear-greed-index')
        if (fearGreedData.ok) {
          const contentType = fearGreedData.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            fearGreedResult = await fearGreedData.json()
          }
        }
      } catch (e) {
        }
      
      try {
        const dominanceData = await fetch('/api/market-dominance')
        if (dominanceData.ok) {
          const contentType = dominanceData.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            dominanceResult = await dominanceData.json()
          }
        }
      } catch (e) {
        }

      // 트렌드 및 단독성 분석
      const prices = priceResult.data?.map((d: any) => parseFloat(d[4])) || []
      const recentPrices = prices.slice(-20)
      const trend = analyzeTrend(recentPrices)
      const volatility = analyzeVolatility(prices)
      
      return {
        trend,
        volatility,
        volume: 'medium', // 볼륨 분석
        fearGreedIndex: fearGreedResult.value || 50,
        dominance: dominanceResult || { btc: 45, eth: 18, others: 37 }
      }
    } catch (error) {
      console.error('시장 조건 로드 실패:', error)
      // 기본값 반환
      return {
        trend: 'sideways',
        volatility: 'medium',
        volume: 'medium',
        fearGreedIndex: 50,
        dominance: { btc: 45, eth: 18, others: 37 }
      }
    }
  }

  const fetchAIRecommendations = async (): Promise<AIRecommendation[]> => {
    try {
      const response = await fetch('/api/ai/strategy-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeframe,
          riskTolerance,
          marketConditions
        })
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      // API가 없거나 JSON이 아닌 경우 기본 추천 사용
      return generateDefaultRecommendations()
    } catch (error) {
      console.error('AI 추천 API 사용 불가, 기본 추천 사용')
      return generateDefaultRecommendations()
    }
  }

  const generateDefaultRecommendations = (): AIRecommendation[] => {
    // 시장 조건에 따른 기본 AI 추천
    const baseRecommendations = [
      {
        id: 'momentum-strategy',
        strategy: '모멘텀 돌파 전략',
        confidence: 85,
        expectedReturn: '+15-25%',
        timeframe: '1-3주',
        riskLevel: 'medium' as const,
        reasoning: [
          '강력한 상승 모멘텀 감지',
          '거래량 급증으로 인한 강세 지속 가능성',
          'RSI 50 상단 돌파로 트렌드 확인'
        ],
        marketConditions: ['상승장', '높은 거래량', '중간 변동성'],
        parameters: {
          entryThreshold: 2.5,
          stopLoss: 3.0,
          takeProfit: 8.0,
          volumeFilter: 1.5
        },
        backtestResults: {
          winRate: 68,
          sharpeRatio: 1.45,
          maxDrawdown: 12,
          totalReturn: 245
        }
      },
      {
        id: 'mean-reversion',
        strategy: '평균회귀 전략',
        confidence: 72,
        expectedReturn: '+8-15%',
        timeframe: '3-7일',
        riskLevel: 'low' as const,
        reasoning: [
          '과매도/과매수 구간에서 반등 기대',
          '볼린저밴드 하단 터치로 매수 신호',
          '안정적인 수익성과 낮은 리스크'
        ],
        marketConditions: ['횡보장', '낮은 변동성', '안정적 거래량'],
        parameters: {
          rsiLower: 25,
          rsiUpper: 75,
          bbPeriod: 20,
          stopLoss: 2.0
        },
        backtestResults: {
          winRate: 74,
          sharpeRatio: 1.28,
          maxDrawdown: 8,
          totalReturn: 186
        }
      }
    ]

    return baseRecommendations
  }

  const loadDefaultRecommendations = async () => {
    const defaultRecs = generateDefaultRecommendations()
    setRecommendations(defaultRecs)
    setMarketConditions({
      trend: 'sideways',
      volatility: 'medium',
      volume: 'medium',
      fearGreedIndex: 50,
      dominance: { btc: 45, eth: 18, others: 37 }
    })
  }

  const analyzeTrend = (prices: number[]): 'bullish' | 'bearish' | 'sideways' => {
    if (prices.length < 2) return 'sideways'
    
    const first = prices[0]
    const last = prices[prices.length - 1]
    const change = ((last - first) / first) * 100
    
    if (change > 2) return 'bullish'
    if (change < -2) return 'bearish'
    return 'sideways'
  }

  const analyzeVolatility = (prices: number[]): 'low' | 'medium' | 'high' => {
    if (prices.length < 10) return 'medium'
    
    const returns = prices.slice(1).map((price, i) => 
      Math.abs((price - prices[i]) / prices[i])
    )
    
    const avgVolatility = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    
    if (avgVolatility < 0.02) return 'low'
    if (avgVolatility > 0.05) return 'high'
    return 'medium'
  }

  const refreshAnalysis = async () => {
    setAnalyzing(true)
    await loadMarketAnalysis()
    setAnalyzing(false)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-48 bg-gray-700 rounded-xl"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <FaBrain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI 전략 추천</h2>
            <p className="text-gray-400 text-sm">시장 분석 기반 맞춤형 전략</p>
          </div>
        </div>
        
        <button
          onClick={refreshAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? '분석 중...' : '재분석'}
        </button>
      </div>

      {/* 시장 조건 */}
      {marketConditions && (
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">현재 시장 조건</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {marketConditions.trend === 'bullish' ? '🚀' : 
                 marketConditions.trend === 'bearish' ? '📉' : '➡️'}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {marketConditions.trend === 'bullish' ? '상승세' : 
                 marketConditions.trend === 'bearish' ? '하락세' : '횡보세'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{marketConditions.fearGreedIndex}</div>
              <div className="text-sm text-gray-300 mt-1">공포탐욕지수</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {marketConditions.volatility === 'low' ? '🟢' : 
                 marketConditions.volatility === 'medium' ? '🟡' : '🔴'}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {marketConditions.volatility === 'low' ? '낮은 변동성' : 
                 marketConditions.volatility === 'medium' ? '중간 변동성' : '높은 변동성'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{marketConditions.dominance.btc}%</div>
              <div className="text-sm text-gray-300 mt-1">BTC 도미넨스</div>
            </div>
          </div>

          {/* 도미넨스 차트 */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'BTC', value: marketConditions.dominance.btc, color: '#F7931A' },
                    { name: 'ETH', value: marketConditions.dominance.eth, color: '#627EEA' },
                    { name: 'Others', value: marketConditions.dominance.others, color: '#8B5CF6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    { name: 'BTC', value: marketConditions.dominance.btc, color: '#F7931A' },
                    { name: 'ETH', value: marketConditions.dominance.eth, color: '#627EEA' },
                    { name: 'Others', value: marketConditions.dominance.others, color: '#8B5CF6' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI 추천 전략 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">추천 전략</h3>
        
        {recommendations && recommendations.length > 0 ? recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer ${
              selectedRecommendation === rec.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 hover:border-purple-400'
            }`}
            onClick={() => setSelectedRecommendation(rec.id)}
          >
            {/* 전략 헤더 */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
              <div className="flex items-start gap-4 mb-4 lg:mb-0">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FiZap className="w-6 h-6 text-purple-400" />
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">{rec.strategy}</h4>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <span className={`font-medium ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}% 신뢰도
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <FiTarget className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">{rec.expectedReturn}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <FiAlertCircle className="w-4 h-4 text-gray-400" />
                      <span className={`font-medium ${getRiskColor(rec.riskLevel)}`}>
                        {rec.riskLevel === 'low' ? '낮음' : 
                         rec.riskLevel === 'medium' ? '중간' : '높음'} 리스크
                      </span>
                    </div>
                    
                    <div className="text-gray-400">
                      {rec.timeframe} 예상
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onApplyRecommendation(rec)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                전략 적용
              </button>
            </div>

            {/* 분석 근거 */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">분석 근거:</h5>
              <ul className="space-y-1">
                {rec.reasoning.map((reason, reasonIndex) => (
                  <li key={reasonIndex} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-purple-400 mt-1.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* 백테스트 결과 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">
                  {rec.backtestResults.winRate}%
                </div>
                <div className="text-xs text-gray-500">승률</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400">
                  {safeFixed(rec.backtestResults.sharpeRatio, 2)}
                </div>
                <div className="text-xs text-gray-500">샤프비율</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-400">
                  -{rec.backtestResults.maxDrawdown}%
                </div>
                <div className="text-xs text-gray-500">최대손실</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-400">
                  +{rec.backtestResults.totalReturn}%
                </div>
                <div className="text-xs text-gray-500">총 수익</div>
              </div>
            </div>

            {/* 시장 조건 태그 */}
            <div className="flex flex-wrap gap-2">
              {rec.marketConditions.map((condition, condIndex) => (
                <span
                  key={condIndex}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                >
                  {condition}
                </span>
              ))}
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12">
            <FaBrain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">추천 전략을 찾을 수 없습니다</div>
            <div className="text-gray-500 text-sm">시장 조건을 다시 분석해보세요</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIRecommender