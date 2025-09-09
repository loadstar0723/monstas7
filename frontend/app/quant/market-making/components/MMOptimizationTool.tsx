'use client'

import { useState, useEffect } from 'react'
import { FaBrain, FaRocket, FaCog, FaChartLine, FaLightbulb, FaCheckCircle, FaSyncAlt } from 'react-icons/fa'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface OptimizationParams {
  spread: number
  orderSize: number
  orderCount: number
  inventoryLimit: number
  timeInterval: number
}

interface MarketFeatures {
  volatility: number
  liquidity: number
  trendStrength: number
  competitionLevel: number
  profitability: number
}

export default function MMOptimizationTool({ selectedCoin }: Props) {
  const [optimizedParams, setOptimizedParams] = useState<OptimizationParams>({
    spread: 0.1,
    orderSize: 0.1,
    orderCount: 5,
    inventoryLimit: 5,
    timeInterval: 30
  })
  
  const [marketFeatures, setMarketFeatures] = useState<MarketFeatures>({
    volatility: 0,
    liquidity: 0,
    trendStrength: 0,
    competitionLevel: 0,
    profitability: 0
  })
  
  const [optimizationScore, setOptimizationScore] = useState(0)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [performanceHistory, setPerformanceHistory] = useState<{ time: string; score: number }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    analyzeMarket()
    const interval = setInterval(analyzeMarket, 10000)
    return () => clearInterval(interval)
  }, [selectedCoin.fullSymbol])

  const analyzeMarket = async () => {
    setLoading(true)
    
    try {
      // 시장 데이터 가져오기 (프록시 API 사용)
      const [ticker, orderBook, klines] = await Promise.all([
        fetch(`/api/binance/ticker?symbol=${selectedCoin.fullSymbol}`).then(r => r.json()),
        fetch(`/api/binance/depth?symbol=${selectedCoin.fullSymbol}&limit=20`).then(r => r.json()),
        fetch(`/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=1h&limit=24`).then(r => r.json())
      ])
      
      // 시장 특징 계산
      const volatility = calculateVolatility(klines)
      const liquidity = calculateLiquidity(orderBook)
      const trendStrength = calculateTrend(klines)
      const competitionLevel = calculateCompetition(orderBook)
      const profitability = estimateProfitability(volatility, liquidity, competitionLevel)
      
      setMarketFeatures({
        volatility,
        liquidity,
        trendStrength,
        competitionLevel,
        profitability
      })
      
      // AI 최적화 파라미터 계산
      optimizeParameters(volatility, liquidity, trendStrength, competitionLevel)
      
      // 성과 점수 계산
      const score = calculateOptimizationScore(volatility, liquidity, competitionLevel, profitability)
      setOptimizationScore(score)
      
      // 추천사항 생성
      generateRecommendations(volatility, liquidity, competitionLevel)
      
      // 성과 히스토리 업데이트
      updatePerformanceHistory(score)
      
    } catch (error) {
      console.error('AI 분석 실패:', error)
    }
    
    setLoading(false)
  }

  const calculateVolatility = (klines: any[]): number => {
    const returns = klines.slice(1).map((k, i) => {
      const prevClose = parseFloat(klines[i][4])
      const currentClose = parseFloat(k[4])
      return ((currentClose - prevClose) / prevClose) * 100
    })
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    
    return Math.min(100, stdDev * 10) // 0-100 스케일로 정규화
  }

  const calculateLiquidity = (orderBook: any): number => {
    const bidVolume = orderBook.bids.reduce((sum: number, bid: any) => sum + parseFloat(bid[1]), 0)
    const askVolume = orderBook.asks.reduce((sum: number, ask: any) => sum + parseFloat(ask[1]), 0)
    const totalVolume = bidVolume + askVolume
    
    // 유동성 점수 (0-100)
    return Math.min(100, Math.log(totalVolume + 1) * 10)
  }

  const calculateTrend = (klines: any[]): number => {
    const firstPrice = parseFloat(klines[0][4])
    const lastPrice = parseFloat(klines[klines.length - 1][4])
    const change = ((lastPrice - firstPrice) / firstPrice) * 100
    
    return Math.max(-100, Math.min(100, change * 2)) // -100 ~ +100
  }

  const calculateCompetition = (orderBook: any): number => {
    // 스프레드로 경쟁도 측정
    const bestBid = parseFloat(orderBook.bids[0][0])
    const bestAsk = parseFloat(orderBook.asks[0][0])
    const spread = ((bestAsk - bestBid) / bestAsk) * 100
    
    // 스프레드가 좊을수록 경쟁이 격렬
    return Math.max(0, Math.min(100, (1 - spread) * 100))
  }

  const estimateProfitability = (volatility: number, liquidity: number, competition: number): number => {
    // 수익성 추정 (0-100)
    const volComponent = volatility * 0.3 // 변동성이 높을수록 좋음
    const liqComponent = liquidity * 0.5 // 유동성이 높을수록 좋음
    const compComponent = (100 - competition) * 0.2 // 경쟁이 낮을수록 좋음
    
    return Math.min(100, volComponent + liqComponent + compComponent)
  }

  const optimizeParameters = (volatility: number, liquidity: number, trend: number, competition: number) => {
    // AI 기반 파라미터 최적화
    let spread = 0.1
    let orderSize = 0.1
    let orderCount = 5
    let inventoryLimit = 5
    let timeInterval = 30
    
    // 변동성에 따른 스프레드 조정
    if (volatility > 70) {
      spread = 0.15 + (volatility / 100) * 0.1
    } else if (volatility < 30) {
      spread = 0.05 + (volatility / 100) * 0.05
    } else {
      spread = 0.1 + (volatility / 100) * 0.05
    }
    
    // 유동성에 따른 주문 크기 조정
    if (liquidity > 70) {
      orderSize = 0.2
      orderCount = 7
    } else if (liquidity < 30) {
      orderSize = 0.05
      orderCount = 3
    }
    
    // 경쟁도에 따른 주문 간격 조정
    if (competition > 70) {
      timeInterval = 10 // 빠른 주문 갱신
      spread *= 0.8 // 스프레드 축소
    } else if (competition < 30) {
      timeInterval = 60 // 느린 주문 갱신
      spread *= 1.2 // 스프레드 확대
    }
    
    // 트렌드에 따른 재고 한도 조정
    if (Math.abs(trend) > 50) {
      inventoryLimit = 3 // 강한 트렌드에서는 재고 제한
    } else {
      inventoryLimit = 7 // 횡보 시장에서는 재고 확대
    }
    
    setOptimizedParams({
      spread: Math.round(spread * 1000) / 1000,
      orderSize: Math.round(orderSize * 100) / 100,
      orderCount: Math.round(orderCount),
      inventoryLimit: Math.round(inventoryLimit),
      timeInterval: Math.round(timeInterval)
    })
  }

  const calculateOptimizationScore = (volatility: number, liquidity: number, competition: number, profitability: number): number => {
    const weights = {
      volatility: 0.2,
      liquidity: 0.3,
      competition: 0.2,
      profitability: 0.3
    }
    
    return Math.round(
      volatility * weights.volatility +
      liquidity * weights.liquidity +
      (100 - competition) * weights.competition +
      profitability * weights.profitability
    )
  }

  const generateRecommendations = (volatility: number, liquidity: number, competition: number) => {
    const recs = []
    
    if (volatility > 70) {
      recs.push('🔥 높은 변동성: 스프레드를 넓히고 리스크 관리 강화')
    }
    
    if (liquidity < 30) {
      recs.push('💧 낮은 유동성: 주문 크기를 줄이고 신중하게 접근')
    }
    
    if (competition > 70) {
      recs.push('⚔️ 높은 경쟁도: 빠른 주문 갱신과 타이트한 스프레드 유지')
    }
    
    if (optimizationScore > 70) {
      recs.push('✨ 매우 좋은 조건: 적극적인 마켓 메이킹 추천')
    } else if (optimizationScore < 30) {
      recs.push('⚠️ 어려운 조건: 리스크를 최소화하고 조심스럽게 접근')
    }
    
    setRecommendations(recs)
  }

  const updatePerformanceHistory = (score: number) => {
    setPerformanceHistory(prev => {
      const newHistory = [...prev, {
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        score
      }]
      return newHistory.slice(-20) // 최근 20개만 유지
    })
  }

  const radialData = [
    { name: '변동성', value: marketFeatures.volatility, fill: '#8B5CF6' },
    { name: '유동성', value: marketFeatures.liquidity, fill: '#3B82F6' },
    { name: '트렌드', value: Math.abs(marketFeatures.trendStrength), fill: '#10B981' },
    { name: '경쟁도', value: marketFeatures.competitionLevel, fill: '#F59E0B' },
    { name: '수익성', value: marketFeatures.profitability, fill: '#EC4899' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaBrain className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">AI 최적화</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} 마켓 메이킹 AI 최적화</p>
        </div>
      </div>
      
      {/* AI 분석 점수 - 모바일 최적화 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">AI 최적화 점수</h3>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl sm:text-5xl font-bold ${
                optimizationScore > 70 ? 'text-green-400' :
                optimizationScore > 40 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {optimizationScore}
              </span>
              <span className="text-lg sm:text-xl text-gray-400">/100</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {optimizationScore > 70 ? '매우 좋은 조건' :
               optimizationScore > 40 ? '보통 조건' :
               '어려운 조건'}
            </p>
          </div>
          
          {/* 시장 특징 차트 - 모바일 사이즈 조정 */}
          <div className="h-48 sm:h-64 w-full lg:w-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 최적화 파라미터 - 모바일 2열 그리드 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaRocket className="text-purple-400" />
          AI 추천 파라미터
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">스프레드</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-400">{optimizedParams.spread}%</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">주문 크기</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-400">{optimizedParams.orderSize}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">주문 수</p>
            <p className="text-lg sm:text-2xl font-bold text-green-400">{optimizedParams.orderCount}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">재고 한도</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-400">{optimizedParams.inventoryLimit}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 col-span-2 sm:col-span-1">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">갱신 주기</p>
            <p className="text-lg sm:text-2xl font-bold text-pink-400">{optimizedParams.timeInterval}s</p>
          </div>
        </div>
      </div>

      {/* 시장 특징 - 모바일 세로 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-400" />
            시장 특징 분석
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">변동성</span>
                <span className="text-sm font-medium text-white">{marketFeatures.volatility.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${marketFeatures.volatility}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">유동성</span>
                <span className="text-sm font-medium text-white">{marketFeatures.liquidity.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${marketFeatures.liquidity}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">경쟁도</span>
                <span className="text-sm font-medium text-white">{marketFeatures.competitionLevel.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${marketFeatures.competitionLevel}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">예상 수익성</span>
                <span className="text-sm font-medium text-white">{marketFeatures.profitability.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${marketFeatures.profitability}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 성과 추이 - 모바일 높이 조정 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">최적화 점수 추이</h3>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#A78BFA" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI 추천사항 - 모바일 최적화 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FaLightbulb className="text-purple-400" />
          AI 전략 추천
        </h3>
        {recommendations.length > 0 ? (
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">분석 중...</p>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-2">최적 트레이딩 시간대</h4>
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
            <div className="bg-gray-800/50 rounded px-2 py-1 text-center">
              <p className="text-gray-400">아시아</p>
              <p className="text-white font-medium">09:00-17:00</p>
            </div>
            <div className="bg-gray-800/50 rounded px-2 py-1 text-center">
              <p className="text-gray-400">유럽</p>
              <p className="text-white font-medium">16:00-01:00</p>
            </div>
            <div className="bg-gray-800/50 rounded px-2 py-1 text-center">
              <p className="text-gray-400">미국</p>
              <p className="text-white font-medium">23:00-07:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* 실행 버튼 - 모바일 고정 하단 */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={() => alert('AI 최적화 설정이 적용되었습니다!')}
          >
            <FaCog />
            최적화 설정 적용
          </button>
          <button 
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={analyzeMarket}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            {loading ? '분석 중...' : '다시 분석'}
          </button>
        </div>
      </div>
    </div>
  )
}