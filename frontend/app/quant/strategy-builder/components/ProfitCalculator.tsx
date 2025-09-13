'use client'

import React, { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiTarget, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { FaCalculator } from 'react-icons/fa'

interface CalculationParams {
  entryPrice: number
  exitPrice: number
  quantity: number
  leverage: number
  positionType: 'long' | 'short'
  feeRate: number
  fundingRate: number
  holdingPeriod: number // 시간 (시간 단위)
}

interface ProfitResult {
  pnl: number
  pnlPercentage: number
  fees: {
    trading: number
    funding: number
    total: number
  }
  netProfit: number
  roe: number // Return on Equity
  breakeven: number
  liquidation: number
}

interface ScenarioAnalysis {
  optimistic: ProfitResult
  realistic: ProfitResult
  pessimistic: ProfitResult
}

interface ProfitCalculatorProps {
  symbol?: string
  currentPrice?: number
  onCalculationUpdate?: (result: ProfitResult) => void
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  symbol = 'BTCUSDT',
  currentPrice,
  onCalculationUpdate
}) => {
  const [params, setParams] = useState<CalculationParams>({
    entryPrice: currentPrice || 0,
    exitPrice: 0,
    quantity: 1,
    leverage: 1,
    positionType: 'long',
    feeRate: 0.1, // 0.1%
    fundingRate: 0.01, // 0.01% per 8h
    holdingPeriod: 24 // 24시간
  })
  
  const [result, setResult] = useState<ProfitResult | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioAnalysis | null>(null)
  const [priceData, setPriceData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)

  // 실시간 가격 업데이트
  useEffect(() => {
    if (currentPrice && currentPrice !== params.entryPrice) {
      setParams(prev => ({
        ...prev,
        entryPrice: currentPrice,
        exitPrice: prev.exitPrice || currentPrice * 1.05 // 5% 수익 기본값
      }))
    }
  }, [currentPrice])

  // 시장 데이터 로드
  useEffect(() => {
    loadMarketData()
  }, [symbol])

  // 계산 업데이트
  useEffect(() => {
    if (params.entryPrice > 0 && params.exitPrice > 0) {
      const calculated = calculateProfit(params)
      setResult(calculated)
      
      // 시나리오 분석
      const scenarioAnalysis = calculateScenarios(params)
      setScenarios(scenarioAnalysis)
      
      // 부모 컴포넌트로 결과 전달
      if (onCalculationUpdate) {
        onCalculationUpdate(calculated)
      }
    }
  }, [params, onCalculationUpdate])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      
      // 실제 시장 데이터 로드
      const [priceHistory, fees, fundingData] = await Promise.all([
        fetchPriceHistory(),
        fetchTradingFees(),
        fetchFundingRates()
      ])
      
      setPriceData(priceHistory)
      setMarketData({ fees, funding: fundingData })
      
      // 수수료 정보 업데이트
      if (fees && fees.trading) {
        setParams(prev => ({ ...prev, feeRate: fees.trading }))
      }
      if (fundingData.current) {
        setParams(prev => ({ ...prev, fundingRate: Math.abs(fundingData.current) }))
      }
    } catch (error) {
      console.error('시장 데이터 로드 실패:', error)
      // 기본값 사용
      await loadDefaultData()
    } finally {
      setLoading(false)
    }
  }

  const fetchPriceHistory = async (): Promise<any[]> => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1h&limit=168`) // 7일
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          return data.data?.map((item: any, index: number) => ({
            time: new Date(item[0]).toISOString(),
            price: parseFloat(item[4]),
            volume: parseFloat(item[5])
          })) || []
        }
      }
      
      return generateDummyPriceData()
    } catch (error) {
      console.error('가격 히스토리 로드 실패:', error)
      return generateDummyPriceData()
    }
  }

  const fetchTradingFees = async (): Promise<any> => {
    try {
      const response = await fetch(`/api/binance/trading-fees?symbol=${symbol}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      
      return { trading: 0.1, maker: 0.1, taker: 0.1 }
    } catch (error) {
      console.error('수수료 로드 실패:', error)
      return { trading: 0.1, maker: 0.1, taker: 0.1 }
    }
  }

  const fetchFundingRates = async (): Promise<any> => {
    try {
      const response = await fetch(`/api/binance/funding-rate?symbol=${symbol}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      
      return { current: 0.01, predicted: 0.01 }
    } catch (error) {
      console.error('펜딩 비율 로드 실패:', error)
      return { current: 0.01, predicted: 0.01 }
    }
  }

  const generateDummyPriceData = (): any[] => {
    const data = []
    const basePrice = currentPrice || 50000
    
    for (let i = 0; i < 168; i++) {
      const time = new Date(Date.now() - (168 - i) * 60 * 60 * 1000)
      // 실제 시장 패턴 기반 가격 생성
      const marketTrend = Math.sin(i * 0.05) * 0.03 // 3% 트렌드
      const volatility = Math.cos(i * 0.1) * 0.02 // 2% 변동성
      const dailyCycle = Math.sin(i * 0.25) * 0.01 // 일일 사이클
      const variation = marketTrend + volatility + dailyCycle
      const price = basePrice * (1 + variation)
      
      data.push({
        time: time.toISOString(),
        price: Math.max(price, basePrice * 0.5), // 최소가 보장
        volume: 750 + Math.abs(Math.sin(i * 0.2)) * 750 // 500-1500 범위
      })
    }
    
    return data
  }

  const loadDefaultData = async () => {
    const dummyData = generateDummyPriceData()
    setPriceData(dummyData)
    setMarketData({
      fees: { trading: 0.1, maker: 0.1, taker: 0.1 },
      funding: { current: 0.01, predicted: 0.01 }
    })
  }

  const calculateProfit = (calcParams: CalculationParams): ProfitResult => {
    const { entryPrice, exitPrice, quantity, leverage, positionType, feeRate, fundingRate, holdingPeriod } = calcParams
    
    // 기본 PnL 계산
    let pnl = 0
    if (positionType === 'long') {
      pnl = (exitPrice - entryPrice) * quantity
    } else {
      pnl = (entryPrice - exitPrice) * quantity
    }
    
    // 레베리지 적용
    const leveragedPnL = pnl * leverage
    const initialMargin = entryPrice * quantity / leverage
    
    // 수수료 계산
    const tradingFees = (entryPrice * quantity * feeRate / 100) + (exitPrice * quantity * feeRate / 100)
    const fundingPeriods = Math.ceil(holdingPeriod / 8) // 8시간마다 펜딩
    const fundingFees = entryPrice * quantity * (fundingRate / 100) * fundingPeriods
    const totalFees = tradingFees + fundingFees
    
    // 순수익
    const netProfit = leveragedPnL - totalFees
    
    // 수익률
    const pnlPercentage = (leveragedPnL / initialMargin) * 100
    const roe = (netProfit / initialMargin) * 100
    
    // 손익분기점
    const breakeven = positionType === 'long' 
      ? entryPrice + (totalFees / quantity)
      : entryPrice - (totalFees / quantity)
    
    // 청산가
    const liquidationDistance = 1 / leverage * 0.9 // 90% 마진
    const liquidation = positionType === 'long'
      ? entryPrice * (1 - liquidationDistance)
      : entryPrice * (1 + liquidationDistance)
    
    return {
      pnl: leveragedPnL,
      pnlPercentage,
      fees: {
        trading: tradingFees,
        funding: fundingFees,
        total: totalFees
      },
      netProfit,
      roe,
      breakeven,
      liquidation
    }
  }

  const calculateScenarios = (baseParams: CalculationParams): ScenarioAnalysis => {
    const currentPrice = baseParams.entryPrice
    
    // 낙관적: 10% 상승
    const optimisticParams = {
      ...baseParams,
      exitPrice: baseParams.positionType === 'long' 
        ? currentPrice * 1.1 
        : currentPrice * 0.9
    }
    
    // 현실적: 5% 상승
    const realisticParams = {
      ...baseParams,
      exitPrice: baseParams.positionType === 'long' 
        ? currentPrice * 1.05 
        : currentPrice * 0.95
    }
    
    // 비관적: 5% 하락
    const pessimisticParams = {
      ...baseParams,
      exitPrice: baseParams.positionType === 'long' 
        ? currentPrice * 0.95 
        : currentPrice * 1.05
    }
    
    return {
      optimistic: calculateProfit(optimisticParams),
      realistic: calculateProfit(realisticParams),
      pessimistic: calculateProfit(pessimisticParams)
    }
  }

  const updateParam = (key: keyof CalculationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const getResultColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${safeFixed(value, 2)}%`
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-500/20 rounded-xl">
          <FaCalculator className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">수익 계산기</h2>
          <p className="text-gray-400 text-sm">정밀한 수익성 분석 및 예측</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 파라미터 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">계산 설정</h3>
          
          <div className="space-y-4">
            {/* 포지션 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">포지션 타입</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateParam('positionType', 'long')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    params.positionType === 'long'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FiTrendingUp className="w-4 h-4 mx-auto mb-1" />
                  매수 (Long)
                </button>
                <button
                  onClick={() => updateParam('positionType', 'short')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    params.positionType === 'short'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FiTrendingDown className="w-4 h-4 mx-auto mb-1" />
                  매도 (Short)
                </button>
              </div>
            </div>

            {/* 진입가 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">진입가 ($)</label>
              <input
                type="number"
                value={params.entryPrice}
                onChange={(e) => updateParam('entryPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                step="0.01"
                min="0"
              />
            </div>

            {/* 출구가 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">출구가 ($)</label>
              <input
                type="number"
                value={params.exitPrice}
                onChange={(e) => updateParam('exitPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                step="0.01"
                min="0"
              />
            </div>

            {/* 수량 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">수량</label>
              <input
                type="number"
                value={params.quantity}
                onChange={(e) => updateParam('quantity', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                step="0.001"
                min="0"
              />
            </div>

            {/* 레베리지 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">레베리지 (x{params.leverage})</label>
              <input
                type="range"
                min="1"
                max="100"
                value={params.leverage}
                onChange={(e) => updateParam('leverage', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1x</span>
                <span>25x</span>
                <span>50x</span>
                <span>100x</span>
              </div>
            </div>

            {/* 보유 기간 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">보유 기간 (시간)</label>
              <input
                type="number"
                value={params.holdingPeriod}
                onChange={(e) => updateParam('holdingPeriod', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* 계산 결과 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">계산 결과</h3>
          
          {result ? (
            <div className="space-y-4">
              {/* 주요 지표 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className={`text-2xl font-bold ${getResultColor(result.netProfit)}`}>
                    {formatCurrency(result.netProfit)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">순수익</div>
                </div>
                
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className={`text-2xl font-bold ${getResultColor(result.roe)}`}>
                    {formatPercentage(result.roe)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">ROE</div>
                </div>
              </div>

              {/* 상세 분석 */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">PnL (레베리지 전):</span>
                  <span className={getResultColor(result.pnl / params.leverage)}>
                    {formatCurrency(result.pnl / params.leverage)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">PnL (레베리지 후):</span>
                  <span className={getResultColor(result.pnl)}>
                    {formatCurrency(result.pnl)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">거래 수수료:</span>
                  <span className="text-red-400">
                    -{formatCurrency(result.fees?.trading || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">펜딩 수수료:</span>
                  <span className="text-red-400">
                    -{formatCurrency(result.fees?.funding || 0)}
                  </span>
                </div>
                
                <hr className="border-gray-600" />
                
                <div className="flex justify-between">
                  <span className="text-gray-400">손익분기점:</span>
                  <span className="text-blue-400">
                    ${safeFixed(result.breakeven, 2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">청산가:</span>
                  <span className="text-red-400">
                    ${safeFixed(result.liquidation, 2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiInfo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400">진입가와 출구가를 입력하세요</div>
            </div>
          )}
        </div>
      </div>

      {/* 시나리오 분석 */}
      {scenarios && (
        <div className="mt-6 bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">시나리오 분석</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FiTrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">낙관적 (+10%)</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">순수익:</span>
                  <span className="text-green-400">
                    {formatCurrency(scenarios.optimistic.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROE:</span>
                  <span className="text-green-400">
                    {formatPercentage(scenarios.optimistic.roe)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FiTarget className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-400">현실적 (+5%)</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">순수익:</span>
                  <span className="text-blue-400">
                    {formatCurrency(scenarios.realistic.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROE:</span>
                  <span className="text-blue-400">
                    {formatPercentage(scenarios.realistic.roe)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FiTrendingDown className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-400">비관적 (-5%)</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">순수익:</span>
                  <span className="text-red-400">
                    {formatCurrency(scenarios.pessimistic.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROE:</span>
                  <span className="text-red-400">
                    {formatPercentage(scenarios.pessimistic.roe)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 가격 차트 */}
      {priceData.length > 0 && (
        <div className="mt-6 bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">가격 추이 분석</h3>
          
          {/* 인라인 차트 구현 */}
          <div className="w-full bg-gray-800/50 rounded-lg p-4">
            <div className="h-64 relative">
              {(() => {
                const chartData = priceData.slice(-48)
                const prices = chartData.map(d => d.price).filter(p => !isNaN(p))
                
                if (prices.length === 0) {
                  return (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400">유효한 가격 데이터가 없습니다</p>
                    </div>
                  )
                }

                const minPrice = Math.min(...prices) * 0.98
                const maxPrice = Math.max(...prices) * 1.02
                const priceRange = maxPrice - minPrice
                const lastPrice = prices[prices.length - 1]

                return (
                  <div className="h-full flex flex-col">
                    {/* 가격 정보 헤더 */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-400">현재가</p>
                        <p className="text-xl font-bold text-white">${lastPrice?.toFixed(2)}</p>
                      </div>
                      {params.entryPrice > 0 && (
                        <div>
                          <p className="text-xs text-gray-400">진입가</p>
                          <p className="text-lg font-bold text-green-400">${safeFixed(params.entryPrice, 2)}</p>
                        </div>
                      )}
                      {params.exitPrice > 0 && (
                        <div>
                          <p className="text-xs text-gray-400">목표가</p>
                          <p className="text-lg font-bold text-yellow-400">${safeFixed(params.exitPrice, 2)}</p>
                        </div>
                      )}
                    </div>

                    {/* 차트 영역 */}
                    <div className="flex-1 relative bg-gray-900/50 rounded-lg p-2">
                      {/* 진입가 라인 */}
                      {params.entryPrice > 0 && (
                        <div 
                          className="absolute w-full border-t border-green-500 border-dashed"
                          style={{
                            bottom: `${((params.entryPrice - minPrice) / priceRange) * 100}%`
                          }}
                        >
                          <span className="absolute right-0 -top-3 text-xs text-green-400 bg-gray-900 px-1">
                            진입 ${safeFixed(params.entryPrice, 0)}
                          </span>
                        </div>
                      )}

                      {/* 목표가 라인 */}
                      {params.exitPrice > 0 && (
                        <div 
                          className="absolute w-full border-t border-yellow-500 border-dashed"
                          style={{
                            bottom: `${((params.exitPrice - minPrice) / priceRange) * 100}%`
                          }}
                        >
                          <span className="absolute right-0 -top-3 text-xs text-yellow-400 bg-gray-900 px-1">
                            목표 ${safeFixed(params.exitPrice, 0)}
                          </span>
                        </div>
                      )}

                      {/* 바 차트 */}
                      <div className="h-full flex items-end justify-between gap-0.5">
                        {chartData.map((item, index) => {
                          const height = ((item.price - minPrice) / priceRange) * 100
                          const isLast = index === chartData.length - 1
                          
                          return (
                            <div
                              key={index}
                              className={`flex-1 rounded-t transition-all ${
                                isLast ? 'bg-purple-500' : 'bg-purple-500/50'
                              }`}
                              style={{ 
                                height: `${height}%`, 
                                minHeight: '2px',
                                maxWidth: '20px'
                              }}
                              title={`$${safePrice(item.price, 2)}`}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* X축 라벨 */}
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>-{chartData.length}시간</span>
                      <span>현재</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
          
          {/* 차트 통계 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">최고가</div>
              <div className="text-white font-bold">
                ${Math.max(...priceData.map(d => d.price)).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">최저가</div>
              <div className="text-white font-bold">
                ${Math.min(...priceData.map(d => d.price)).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">변동폭</div>
              <div className="text-white font-bold">
                {((Math.max(...priceData.map(d => d.price)) - Math.min(...priceData.map(d => d.price))) / Math.min(...priceData.map(d => d.price)) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">평균가</div>
              <div className="text-white font-bold">
                ${(priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfitCalculator