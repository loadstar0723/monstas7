'use client'

import { motion } from 'framer-motion'
import { FaCalculator, FaExclamationTriangle, FaChartLine } from 'react-icons/fa'
import { useState, useMemo } from 'react'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface PriceImpactCalculatorProps {
  orderbook: {
    bids: OrderbookLevel[]
    asks: OrderbookLevel[]
    lastUpdate?: Date
  } | null
  currentPrice: number
}

interface ImpactResult {
  type: 'buy' | 'sell'
  orderSize: number
  avgPrice: number
  priceImpact: number
  slippage: number
  filledLevels: number
  totalCost: number
}

export default function PriceImpactCalculator({ orderbook, currentPrice }: PriceImpactCalculatorProps) {
  const [orderSize, setOrderSize] = useState<string>('')
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')

  const impactResult = useMemo(() => {
    if (!orderSize || isNaN(parseFloat(orderSize)) || parseFloat(orderSize) <= 0) {
      return null
    }

    if (!orderbook) return null

    const size = parseFloat(orderSize)
    const levels = orderType === 'buy' ? orderbook.asks : orderbook.bids
    
    if (!levels || levels.length === 0) return null

    let remainingSize = size
    let totalCost = 0
    let filledLevels = 0
    const executionPrices: { price: number; amount: number }[] = []

    // 주문이 체결될 가격대를 계산
    for (const level of levels) {
      if (remainingSize <= 0) break
      
      const fillAmount = Math.min(remainingSize, level.amount)
      totalCost += fillAmount * level.price
      executionPrices.push({ price: level.price, amount: fillAmount })
      remainingSize -= fillAmount
      filledLevels++
    }

    // 평균 체결 가격
    const avgPrice = totalCost / (size - remainingSize)
    
    // 가격 충격률 (현재가 대비 평균 체결가)
    const priceImpact = orderType === 'buy' 
      ? ((avgPrice - currentPrice) / currentPrice) * 100
      : ((currentPrice - avgPrice) / currentPrice) * 100

    // 슬리피지 (베스트 가격 대비 평균 체결가)
    const bestPrice = levels[0]?.price || currentPrice
    const slippage = orderType === 'buy'
      ? ((avgPrice - bestPrice) / bestPrice) * 100
      : ((bestPrice - avgPrice) / bestPrice) * 100

    return {
      type: orderType,
      orderSize: size - remainingSize,
      avgPrice,
      priceImpact,
      slippage,
      filledLevels,
      totalCost,
      executionPrices,
      remainingSize
    } as ImpactResult & { executionPrices: typeof executionPrices; remainingSize: number }
  }, [orderSize, orderType, orderbook, currentPrice])

  const getImpactColor = (impact: number) => {
    if (impact < 0.1) return 'text-green-400'
    if (impact < 0.5) return 'text-yellow-400'
    if (impact < 1) return 'text-orange-400'
    return 'text-red-400'
  }

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  const formatUSD = (num: number) => {
    return `$${formatNumber(num, 2)}`
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaCalculator className="text-green-400" />
        가격 충격 계산기
      </h3>

      {/* 입력 섹션 */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-300 text-sm mb-2 block">주문 타입</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderType('buy')}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                orderType === 'buy' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              매수 (Buy)
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                orderType === 'sell' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              매도 (Sell)
            </button>
          </div>
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">주문 수량</label>
          <div className="relative">
            <input
              type="number"
              value={orderSize}
              onChange={(e) => setOrderSize(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              step="0.01"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              BTC
            </div>
          </div>
        </div>
      </div>

      {/* 결과 표시 */}
      {impactResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 주요 지표 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">평균 체결가</div>
              <div className="text-white text-xl font-bold">
                {formatUSD(impactResult.avgPrice)}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                현재가: {formatUSD(currentPrice)}
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">총 비용</div>
              <div className="text-white text-xl font-bold">
                {formatUSD(impactResult.totalCost)}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {impactResult.filledLevels}개 가격대 체결
              </div>
            </div>
          </div>

          {/* 충격 지표 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300">가격 충격률</span>
              <span className={`text-xl font-bold ${getImpactColor(impactResult.priceImpact)}`}>
                {formatNumber(impactResult.priceImpact, 3)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">슬리피지</span>
              <span className={`text-xl font-bold ${getImpactColor(impactResult.slippage)}`}>
                {formatNumber(impactResult.slippage, 3)}%
              </span>
            </div>
          </div>

          {/* 경고 메시지 */}
          {impactResult.priceImpact > 0.5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 flex items-start gap-3"
            >
              <FaExclamationTriangle className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold">높은 가격 충격 경고</p>
                <p className="text-gray-300 text-sm mt-1">
                  이 주문은 시장에 상당한 영향을 미칠 수 있습니다. 
                  더 작은 규모로 나누어 주문하는 것을 고려하세요.
                </p>
              </div>
            </motion.div>
          )}

          {impactResult.remainingSize > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500 rounded-lg p-4"
            >
              <p className="text-red-400 font-semibold">유동성 부족</p>
              <p className="text-gray-300 text-sm mt-1">
                현재 오더북에 {formatNumber(impactResult.remainingSize, 4)} BTC 만큼의 유동성이 부족합니다.
              </p>
            </motion.div>
          )}

          {/* 체결 예상 분포 */}
          {impactResult.executionPrices && impactResult.executionPrices.length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaChartLine className="text-purple-400" />
                <span className="text-gray-300 font-medium">체결 예상 분포</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {impactResult.executionPrices.map((exec, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {formatUSD(exec.price)}
                    </span>
                    <span className="text-gray-300">
                      {formatNumber(exec.amount, 4)} BTC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 정보 메시지 */}
      {!impactResult && orderSize === '' && (
        <div className="text-center py-8 text-gray-400">
          <FaCalculator className="text-4xl mx-auto mb-3 opacity-50" />
          <p>주문 수량을 입력하면 예상 체결가와 가격 충격을 계산합니다</p>
          <p className="text-sm mt-2">실시간 오더북 데이터 기반 정확한 분석</p>
        </div>
      )}
    </div>
  )
}