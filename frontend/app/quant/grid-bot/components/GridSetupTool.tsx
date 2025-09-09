'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaCog, FaCalculator, FaBrain, FaChartLine, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa'
import { binanceAPI, BINANCE_CONFIG } from '@/lib/binanceConfig'
import { ModuleWebSocket } from '@/lib/moduleUtils'

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

interface GridSettings {
  upperPrice: number
  lowerPrice: number
  gridCount: number
  investment: number
  leverage: number
}

interface MarketStats {
  currentPrice: number
  high24h: number
  low24h: number
  volatility: number
  trend: 'up' | 'down' | 'sideways'
}

export default function GridSetupTool({ selectedCoin }: Props) {
  const [settings, setSettings] = useState<GridSettings>({
    upperPrice: 0,
    lowerPrice: 0,
    gridCount: 20,
    investment: 1000,
    leverage: 1
  })
  
  const [marketStats, setMarketStats] = useState<MarketStats>({
    currentPrice: 0,
    high24h: 0,
    low24h: 0,
    volatility: 0,
    trend: 'sideways'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [showAIRecommendation, setShowAIRecommendation] = useState(false)
  const wsRef = useRef<ModuleWebSocket | null>(null)

  // 실시간 시장 데이터 가져오기
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const { data } = await binanceAPI.get24hrTicker(selectedCoin.fullSymbol)
        if (data) {
          const currentPrice = parseFloat(data.lastPrice)
          const high24h = parseFloat(data.highPrice)
          const low24h = parseFloat(data.lowPrice)
          const priceChange = parseFloat(data.priceChangePercent)
          
          // 변동성 계산 (high-low / average)
          const volatility = ((high24h - low24h) / ((high24h + low24h) / 2)) * 100
          
          // 트렌드 판단
          let trend: 'up' | 'down' | 'sideways' = 'sideways'
          if (priceChange > 2) trend = 'up'
          else if (priceChange < -2) trend = 'down'
          
          setMarketStats({
            currentPrice,
            high24h,
            low24h,
            volatility,
            trend
          })
          
          // 초기 설정값 계산
          if (settings.upperPrice === 0 && settings.lowerPrice === 0) {
            const range = high24h - low24h
            const upperPrice = currentPrice + range * 0.5
            const lowerPrice = currentPrice - range * 0.5
            
            setSettings(prev => ({
              ...prev,
              upperPrice: Math.round(upperPrice * 100) / 100,
              lowerPrice: Math.round(lowerPrice * 100) / 100
            }))
          }
          
          setIsLoading(false)
        }
      } catch (error) {
        console.error('시장 데이터 로드 실패:', error)
        setIsLoading(false)
      }
    }
    
    fetchMarketData()
    
    // WebSocket 연결
    wsRef.current = new ModuleWebSocket('GridSetup')
    const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedCoin.fullSymbol.toLowerCase()}@ticker`
    
    wsRef.current.connect(wsUrl, (data) => {
      if (data.c) {
        setMarketStats(prev => ({
          ...prev,
          currentPrice: parseFloat(data.c)
        }))
      }
    })
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [selectedCoin])

  // 그리드 계산
  const calculateGrid = () => {
    const { upperPrice, lowerPrice, gridCount, investment } = settings
    
    if (!upperPrice || !lowerPrice || !gridCount || !investment) {
      return null
    }
    
    const priceRange = upperPrice - lowerPrice
    const gridInterval = priceRange / gridCount
    const gridProfit = (gridInterval / ((upperPrice + lowerPrice) / 2)) * 100
    const perGridInvestment = investment / gridCount
    const estimatedProfit = (gridProfit * 0.5) / 100 // 수수료 고려
    
    return {
      gridInterval,
      gridProfit,
      perGridInvestment,
      estimatedProfit,
      totalGrids: gridCount,
      priceRange
    }
  }

  // AI 추천값 계산
  const getAIRecommendation = () => {
    const { currentPrice, volatility, trend } = marketStats
    
    if (!currentPrice || !volatility) return null
    
    // 변동성에 따른 범위 설정
    const rangeMultiplier = volatility > 10 ? 2.5 : volatility > 5 ? 2.0 : 1.5
    const priceRange = currentPrice * (volatility / 100) * rangeMultiplier
    
    // 트렌드에 따른 비대칭 설정
    let upperOffset = 0.5
    let lowerOffset = 0.5
    
    if (trend === 'up') {
      upperOffset = 0.7
      lowerOffset = 0.3
    } else if (trend === 'down') {
      upperOffset = 0.3
      lowerOffset = 0.7
    }
    
    const upperPrice = currentPrice + (priceRange * upperOffset)
    const lowerPrice = currentPrice - (priceRange * lowerOffset)
    
    // 변동성에 따른 그리드 수
    let gridCount = 20
    if (volatility > 10) gridCount = 30
    else if (volatility < 5) gridCount = 15
    
    // 투자금 추천
    const recommendedInvestment = 1000 // 기본값
    
    return {
      upperPrice: Math.round(upperPrice * 100) / 100,
      lowerPrice: Math.round(lowerPrice * 100) / 100,
      gridCount,
      investment: recommendedInvestment,
      leverage: 1,
      reason: `${selectedCoin.name}의 24시간 변동성 ${volatility.toFixed(1)}%와 ${
        trend === 'up' ? '상승' : trend === 'down' ? '하락' : '횡보'
      } 추세를 고려한 최적 설정`
    }
  }

  const handleApplyAIRecommendation = () => {
    const recommendation = getAIRecommendation()
    if (recommendation) {
      setSettings({
        upperPrice: recommendation.upperPrice,
        lowerPrice: recommendation.lowerPrice,
        gridCount: recommendation.gridCount,
        investment: recommendation.investment,
        leverage: recommendation.leverage
      })
      setShowAIRecommendation(false)
    }
  }

  const gridCalculation = calculateGrid()
  const aiRecommendation = getAIRecommendation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">시장 데이터 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaCog className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">그리드 설정 도구</h2>
          <p className="text-gray-400">{selectedCoin.name} 그리드 봇 최적 설정</p>
        </div>
      </div>

      {/* 시장 현황 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaChartLine className={selectedCoin.color} />
          시장 현황
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-400">현재가</p>
            <p className="text-xl font-bold text-white">
              ${marketStats.currentPrice.toFixed(selectedCoin.symbol === 'BTC' ? 2 : 4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">24시간 최고</p>
            <p className="text-xl font-bold text-green-400">
              ${marketStats.high24h.toFixed(selectedCoin.symbol === 'BTC' ? 2 : 4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">24시간 최저</p>
            <p className="text-xl font-bold text-red-400">
              ${marketStats.low24h.toFixed(selectedCoin.symbol === 'BTC' ? 2 : 4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">변동성</p>
            <p className="text-xl font-bold text-yellow-400">
              {marketStats.volatility.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">추세</p>
            <p className={`text-xl font-bold ${
              marketStats.trend === 'up' ? 'text-green-400' : 
              marketStats.trend === 'down' ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {marketStats.trend === 'up' ? '상승' : 
               marketStats.trend === 'down' ? '하락' : 
               '횡보'}
            </p>
          </div>
        </div>
      </div>

      {/* AI 추천 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaBrain className="text-purple-400" />
            AI 추천 설정
          </h3>
          <button
            onClick={() => setShowAIRecommendation(!showAIRecommendation)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {showAIRecommendation ? '닫기' : 'AI 추천 보기'}
          </button>
        </div>

        {showAIRecommendation && aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <p className="text-gray-300 text-sm">{aiRecommendation.reason}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-400">상한가</p>
                <p className="text-lg font-bold text-green-400">
                  ${aiRecommendation.upperPrice}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">하한가</p>
                <p className="text-lg font-bold text-red-400">
                  ${aiRecommendation.lowerPrice}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">그리드 수</p>
                <p className="text-lg font-bold text-yellow-400">
                  {aiRecommendation.gridCount}개
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">투자금</p>
                <p className="text-lg font-bold text-blue-400">
                  ${aiRecommendation.investment}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleApplyAIRecommendation}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              AI 추천값 적용
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* 그리드 설정 입력 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaCalculator className={selectedCoin.color} />
          그리드 매개변수 설정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">상한가 (Upper Price)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.upperPrice}
                onChange={(e) => setSettings({ ...settings, upperPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-8 pr-4 text-white focus:border-purple-500 focus:outline-none"
                placeholder="50000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">하한가 (Lower Price)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.lowerPrice}
                onChange={(e) => setSettings({ ...settings, lowerPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-8 pr-4 text-white focus:border-purple-500 focus:outline-none"
                placeholder="40000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">그리드 수</label>
            <input
              type="number"
              value={settings.gridCount}
              onChange={(e) => setSettings({ ...settings, gridCount: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-white focus:border-purple-500 focus:outline-none"
              placeholder="20"
              min="2"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">권장: 10-50개</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">투자금</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.investment}
                onChange={(e) => setSettings({ ...settings, investment: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-8 pr-4 text-white focus:border-purple-500 focus:outline-none"
                placeholder="1000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 계산 결과 */}
      {gridCalculation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaDollarSign className={selectedCoin.color} />
            그리드 계산 결과
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">그리드 간격</p>
              <p className="text-2xl font-bold text-white">
                ${gridCalculation.gridInterval.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                ({gridCalculation.gridProfit.toFixed(2)}%)
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">그리드당 투자금</p>
              <p className="text-2xl font-bold text-white">
                ${gridCalculation.perGridInvestment.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                총 {gridCalculation.totalGrids}개 그리드
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">예상 그리드당 수익</p>
              <p className="text-2xl font-bold text-green-400">
                ${(settings.investment * gridCalculation.estimatedProfit).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                ({(gridCalculation.estimatedProfit * 100).toFixed(2)}% 수수료 차감 후)
              </p>
            </div>
          </div>
          
          {/* 리스크 경고 */}
          {settings.upperPrice - settings.lowerPrice > marketStats.currentPrice * 0.5 && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <FaExclamationTriangle />
                <p className="text-sm">
                  설정한 가격 범위가 현재가 대비 50% 이상입니다. 너무 넓은 범위는 자금 효율성이 떨어질 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 빠른 설정 버튼 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">빠른 설정</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              const range = marketStats.currentPrice * 0.1
              setSettings({
                ...settings,
                upperPrice: Math.round((marketStats.currentPrice + range) * 100) / 100,
                lowerPrice: Math.round((marketStats.currentPrice - range) * 100) / 100,
                gridCount: 20
              })
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            보수적 (±10%)
          </button>
          <button
            onClick={() => {
              const range = marketStats.currentPrice * 0.2
              setSettings({
                ...settings,
                upperPrice: Math.round((marketStats.currentPrice + range) * 100) / 100,
                lowerPrice: Math.round((marketStats.currentPrice - range) * 100) / 100,
                gridCount: 30
              })
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            표준 (±20%)
          </button>
          <button
            onClick={() => {
              const range = marketStats.currentPrice * 0.3
              setSettings({
                ...settings,
                upperPrice: Math.round((marketStats.currentPrice + range) * 100) / 100,
                lowerPrice: Math.round((marketStats.currentPrice - range) * 100) / 100,
                gridCount: 40
              })
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            공격적 (±30%)
          </button>
          <button
            onClick={() => {
              setSettings({
                ...settings,
                upperPrice: Math.round(marketStats.high24h * 100) / 100,
                lowerPrice: Math.round(marketStats.low24h * 100) / 100,
                gridCount: 25
              })
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            24시간 범위
          </button>
        </div>
      </div>
    </div>
  )
}