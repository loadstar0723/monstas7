'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartLine, FaCalculator, FaBrain, FaExclamationTriangle } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

interface SpreadData {
  time: string
  spread: number
  percentage: number
  volume: number
}

interface MarketCondition {
  volatility: 'low' | 'medium' | 'high'
  liquidity: 'poor' | 'moderate' | 'good'
  competition: 'low' | 'medium' | 'high'
  trend: 'bullish' | 'neutral' | 'bearish'
}

export default function SpreadAnalysisTool({ selectedCoin }: Props) {
  const [historicalData, setHistoricalData] = useState<SpreadData[]>([])
  const [currentSpread, setCurrentSpread] = useState(0)
  const [avgSpread, setAvgSpread] = useState(0)
  const [marketCondition, setMarketCondition] = useState<MarketCondition>({
    volatility: 'medium',
    liquidity: 'moderate',
    competition: 'medium',
    trend: 'neutral'
  })
  const [customSpread, setCustomSpread] = useState(0.1)
  const [orderSize, setOrderSize] = useState(0.1)
  const [projectedProfit, setProjectedProfit] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 데이터 로드
    loadSpreadData()
    
    // 주기적 업데이트
    const interval = setInterval(() => {
      updateSpreadData()
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedCoin.fullSymbol])

  useEffect(() => {
    // 수익 계산
    calculateProfit()
  }, [customSpread, orderSize, avgSpread])

  const loadSpreadData = async () => {
    try {
      setLoading(true)
      
      // 오더북에서 스프레드 계산 (프록시 API 사용)
      const response = await fetch(`/api/binance/depth?symbol=${selectedCoin.fullSymbol}&limit=5`)
      const orderBook = await response.json()
      
      if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
        const bestBid = parseFloat(orderBook.bids[0][0])
        const bestAsk = parseFloat(orderBook.asks[0][0])
        const spread = bestAsk - bestBid
        const spreadPercentage = (spread / bestAsk) * 100
        
        setCurrentSpread(spreadPercentage)
        
        // 시뮬레이션 데이터 생성 (실제로는 historical API 사용)
        const mockHistoricalData: SpreadData[] = []
        const now = Date.now()
        
        for (let i = 59; i >= 0; i--) {
          const time = new Date(now - i * 60000)
          const baseSpread = spreadPercentage
          const variation = (Math.random() - 0.5) * 0.05 // ±0.025% 변동
          
          mockHistoricalData.push({
            time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            spread: baseSpread + variation,
            percentage: baseSpread + variation,
            volume: 1000000 + Math.random() * 500000
          })
        }
        
        setHistoricalData(mockHistoricalData)
        setAvgSpread(mockHistoricalData.reduce((sum, d) => sum + d.spread, 0) / mockHistoricalData.length)
        
        // 시장 조건 분석
        analyzeMarketCondition(mockHistoricalData)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('스프레드 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const updateSpreadData = async () => {
    try {
      const response = await fetch(`/api/binance/depth?symbol=${selectedCoin.fullSymbol}&limit=5`)
      const orderBook = await response.json()
      
      if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
        const bestBid = parseFloat(orderBook.bids[0][0])
        const bestAsk = parseFloat(orderBook.asks[0][0])
        const spread = bestAsk - bestBid
        const spreadPercentage = (spread / bestAsk) * 100
        
        setCurrentSpread(spreadPercentage)
        
        // 히스토리 데이터 업데이트
        setHistoricalData(prev => {
          const newData = [...prev.slice(1), {
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            spread: spreadPercentage,
            percentage: spreadPercentage,
            volume: 1000000 + Math.random() * 500000
          }]
          
          // 평균 재계산
          setAvgSpread(newData.reduce((sum, d) => sum + d.spread, 0) / newData.length)
          
          return newData
        })
      }
    } catch (error) {
      console.error('스프레드 업데이트 실패:', error)
    }
  }

  const analyzeMarketCondition = (data: SpreadData[]) => {
    // 변동성 계산
    const spreadValues = data.map(d => d.spread)
    const stdDev = calculateStdDev(spreadValues)
    
    let volatility: 'low' | 'medium' | 'high' = 'medium'
    if (stdDev < 0.02) volatility = 'low'
    else if (stdDev > 0.05) volatility = 'high'
    
    // 유동성 평가 (거래량 기반)
    const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length
    let liquidity: 'poor' | 'moderate' | 'good' = 'moderate'
    if (avgVolume < 500000) liquidity = 'poor'
    else if (avgVolume > 1500000) liquidity = 'good'
    
    // 경쟁 평가 (스프레드 타이트함 기반)
    const avgSpreadValue = data.reduce((sum, d) => sum + d.spread, 0) / data.length
    let competition: 'low' | 'medium' | 'high' = 'medium'
    if (avgSpreadValue > 0.15) competition = 'low'
    else if (avgSpreadValue < 0.05) competition = 'high'
    
    setMarketCondition({
      volatility,
      liquidity,
      competition,
      trend: 'neutral' // 단순화
    })
  }

  const calculateStdDev = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  const calculateProfit = () => {
    // 예상 수익 계산
    const dailyTrades = 200 // 일일 예상 거래 횟수
    const avgPrice = 50000 // 예시 가격
    const profitPerTrade = avgPrice * orderSize * (customSpread / 100)
    const dailyProfit = profitPerTrade * dailyTrades
    
    setProjectedProfit(dailyProfit)
  }

  const getOptimalSpread = (): number => {
    let baseSpread = avgSpread
    
    // 시장 조건에 따른 조정
    if (marketCondition.volatility === 'high') baseSpread *= 1.5
    else if (marketCondition.volatility === 'low') baseSpread *= 0.8
    
    if (marketCondition.liquidity === 'poor') baseSpread *= 1.3
    else if (marketCondition.liquidity === 'good') baseSpread *= 0.9
    
    if (marketCondition.competition === 'high') baseSpread *= 0.8
    else if (marketCondition.competition === 'low') baseSpread *= 1.2
    
    return Math.max(0.05, Math.min(0.5, baseSpread))
  }

  const getConditionColor = (value: string): string => {
    switch (value) {
      case 'low':
      case 'good':
      case 'bullish':
        return 'text-green-400'
      case 'high':
      case 'poor':
      case 'bearish':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const getConditionLabel = (type: string, value: string): string => {
    const labels: Record<string, Record<string, string>> = {
      volatility: { low: '낮음', medium: '보통', high: '높음' },
      liquidity: { poor: '부족', moderate: '적정', good: '풍부' },
      competition: { low: '낮음', medium: '보통', high: '높음' },
      trend: { bullish: '상승', neutral: '중립', bearish: '하락' }
    }
    return labels[type]?.[value] || value
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaChartLine className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">스프레드 분석</h2>
            <p className="text-gray-400">{selectedCoin.name} 스프레드 최적화 도구</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">스프레드 데이터 분석 중...</p>
        </div>
      </div>
    )
  }

  const optimalSpread = getOptimalSpread()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaChartLine className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">스프레드 분석</h2>
          <p className="text-gray-400">{selectedCoin.name} 스프레드 최적화 도구</p>
        </div>
      </div>

      {/* 현재 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">현재 스프레드</p>
          <p className="text-2xl font-bold text-white">{safeFixed(currentSpread, 3)}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">평균 스프레드</p>
          <p className="text-2xl font-bold text-white">{safeFixed(avgSpread, 3)}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">권장 스프레드</p>
          <p className="text-2xl font-bold text-purple-400">{safeFixed(optimalSpread, 3)}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">예상 일일 수익</p>
          <p className="text-2xl font-bold text-green-400">${safeFixed(projectedProfit, 0)}</p>
        </div>
      </div>

      {/* 스프레드 차트 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">스프레드 변화 추이</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="spread" 
                stroke="#A78BFA" 
                strokeWidth={2}
                dot={false}
                name="스프레드 (%)"
              />
              <Line
                type="monotone"
                dataKey={() => optimalSpread}
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="권장 스프레드"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시장 조건 분석 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaBrain className="text-purple-400" />
          시장 조건 분석
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">변동성</p>
            <p className={`text-lg font-semibold ${getConditionColor(marketCondition.volatility)}`}>
              {getConditionLabel('volatility', marketCondition.volatility)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">유동성</p>
            <p className={`text-lg font-semibold ${getConditionColor(marketCondition.liquidity)}`}>
              {getConditionLabel('liquidity', marketCondition.liquidity)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">경쟁도</p>
            <p className={`text-lg font-semibold ${getConditionColor(marketCondition.competition)}`}>
              {getConditionLabel('competition', marketCondition.competition)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">추세</p>
            <p className={`text-lg font-semibold ${getConditionColor(marketCondition.trend)}`}>
              {getConditionLabel('trend', marketCondition.trend)}
            </p>
          </div>
        </div>
      </div>

      {/* 수익 계산기 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaCalculator className="text-purple-400" />
          수익 계산기
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">스프레드 설정 (%)</label>
              <input
                type="number"
                value={customSpread}
                onChange={(e) => setCustomSpread(Number(e.target.value))}
                step="0.01"
                min="0.01"
                max="1"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
              />
              <input
                type="range"
                value={customSpread}
                onChange={(e) => setCustomSpread(Number(e.target.value))}
                min="0.01"
                max="0.5"
                step="0.01"
                className="w-full mt-2"
              />
            </div>
            
            <div>
              <label className="text-gray-400 text-sm mb-1 block">주문 크기 ({selectedCoin.symbol})</label>
              <input
                type="number"
                value={orderSize}
                onChange={(e) => setOrderSize(Number(e.target.value))}
                step="0.01"
                min="0.01"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
              />
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">예상 수익</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>거래당 수익:</span>
                <span>${(50000 * orderSize * (customSpread / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>일일 거래 횟수:</span>
                <span>~200회</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>일일 예상 수익:</span>
                  <span>${safeFixed(projectedProfit, 0)}</span>
                </div>
                <div className="flex justify-between text-blue-400 mt-1">
                  <span>월간 예상 수익:</span>
                  <span>${(projectedProfit * 30).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {customSpread < optimalSpread * 0.8 && (
          <div className="mt-4 bg-yellow-600/20 rounded-lg p-3 border border-yellow-600/30">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              설정된 스프레드가 권장값보다 낮습니다. 경쟁이 심할 수 있습니다.
            </p>
          </div>
        )}
        
        {customSpread > optimalSpread * 1.5 && (
          <div className="mt-4 bg-orange-600/20 rounded-lg p-3 border border-orange-600/30">
            <p className="text-orange-400 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              설정된 스프레드가 높습니다. 체결률이 낮을 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* AI 추천 전략 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">AI 추천 전략</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-white font-semibold">기본 스프레드: {safeFixed(optimalSpread, 3)}%</p>
              <p className="text-gray-400">현재 시장 조건에 최적화된 스프레드입니다.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-white font-semibold">동적 조정 범위: ±{(optimalSpread * 0.3).toFixed(3)}%</p>
              <p className="text-gray-400">시장 상황에 따라 자동으로 조정하세요.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-white font-semibold">재고 편향 조정: {marketCondition.volatility === 'high' ? '빠르게' : '천천히'}</p>
              <p className="text-gray-400">
                {marketCondition.volatility === 'high' 
                  ? '변동성이 높으므로 재고를 빠르게 중립으로 돌려야 합니다.'
                  : '안정적인 시장이므로 점진적으로 조정하세요.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <p className="text-white font-semibold">주문 크기: {orderSize} {selectedCoin.symbol}</p>
              <p className="text-gray-400">평균 호가 수량의 30-50% 수준이 적절합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}