'use client'

import { motion } from 'framer-motion'
import { FaWater, FaChartLine, FaExclamationTriangle, FaCoins, FaArrowsAltV } from 'react-icons/fa'
import { useState, useMemo, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface OrderbookLevel {
  price: number
  amount: number
  total: number
}

interface LiquidityDepthProps {
  orderbook: {
    bids: OrderbookLevel[]
    asks: OrderbookLevel[]
    lastUpdate?: Date
  } | null
  symbol: string
  currentPrice: number
}

interface LiquidityMetrics {
  bidLiquidity: number
  askLiquidity: number
  totalLiquidity: number
  liquidityImbalance: number
  depthRatio: number
  spreadBps: number
  midPrice: number
}

interface DepthLevel {
  percentage: number
  bidLiquidity: number
  askLiquidity: number
  bidPrice: number
  askPrice: number
  spread: number
  slippage: number
}

export default function LiquidityDepth({ orderbook, symbol, currentPrice }: LiquidityDepthProps) {
  const [selectedPercentage, setSelectedPercentage] = useState(1)
  const [animationKey, setAnimationKey] = useState(0)

  // 유동성 메트릭 계산
  const metrics = useMemo<LiquidityMetrics>(() => {
    if (!orderbook || !orderbook.bids?.length || !orderbook.asks?.length) {
      // 초기값 제공
      return {
        bidLiquidity: 1250000,
        askLiquidity: 980000,
        totalLiquidity: 2230000,
        liquidityImbalance: 12.5,
        depthRatio: 1.28,
        spreadBps: 5.2,
        midPrice: currentPrice || 98000
      }
    }

    const bidLiquidity = orderbook.bids.reduce((sum, bid) => sum + (bid.price * bid.amount), 0)
    const askLiquidity = orderbook.asks.reduce((sum, ask) => sum + (ask.price * ask.amount), 0)
    const totalLiquidity = bidLiquidity + askLiquidity
    
    const bestBid = orderbook.bids[0]?.price || 0
    const bestAsk = orderbook.asks[0]?.price || 0
    const midPrice = (bestBid + bestAsk) / 2
    const spreadBps = bestAsk > 0 ? ((bestAsk - bestBid) / bestAsk) * 10000 : 0

    return {
      bidLiquidity,
      askLiquidity,
      totalLiquidity,
      liquidityImbalance: ((bidLiquidity - askLiquidity) / totalLiquidity) * 100,
      depthRatio: askLiquidity > 0 ? bidLiquidity / askLiquidity : 1,
      spreadBps,
      midPrice
    }
  }, [orderbook, currentPrice])

  // 깊이별 유동성 계산
  const depthLevels = useMemo<DepthLevel[]>(() => {
    if (!orderbook || !orderbook.bids?.length || !orderbook.asks?.length) {
      // 초기값 제공
      const basePrice = currentPrice || 98000
      return [0.1, 0.5, 1, 2, 5, 10].map((pct, idx) => ({
        percentage: pct,
        bidLiquidity: 50000 * (idx + 1) * 2.5,
        askLiquidity: 45000 * (idx + 1) * 2.3,
        bidPrice: basePrice * (1 - pct / 100),
        askPrice: basePrice * (1 + pct / 100),
        spread: basePrice * (pct * 2 / 100),
        slippage: pct * 0.15
      }))
    }

    const levels = [0.1, 0.5, 1, 2, 5, 10]
    const midPrice = metrics.midPrice

    return levels.map(percentage => {
      const priceRangeDown = midPrice * (1 - percentage / 100)
      const priceRangeUp = midPrice * (1 + percentage / 100)

      // 해당 가격 범위 내의 유동성 계산
      const bidsInRange = orderbook.bids.filter(bid => bid.price >= priceRangeDown)
      const asksInRange = orderbook.asks.filter(ask => ask.price <= priceRangeUp)

      const bidLiquidity = bidsInRange.reduce((sum, bid) => sum + (bid.price * bid.amount), 0)
      const askLiquidity = asksInRange.reduce((sum, ask) => sum + (ask.price * ask.amount), 0)

      const worstBidPrice = bidsInRange[bidsInRange.length - 1]?.price || priceRangeDown
      const worstAskPrice = asksInRange[asksInRange.length - 1]?.price || priceRangeUp

      const bidSlippage = midPrice > 0 ? ((midPrice - worstBidPrice) / midPrice) * 100 : 0
      const askSlippage = worstAskPrice > 0 ? ((worstAskPrice - midPrice) / midPrice) * 100 : 0

      return {
        percentage,
        bidLiquidity,
        askLiquidity,
        bidPrice: worstBidPrice,
        askPrice: worstAskPrice,
        spread: worstAskPrice - worstBidPrice,
        slippage: Math.max(bidSlippage, askSlippage)
      }
    })
  }, [orderbook, currentPrice, metrics.midPrice])

  // 애니메이션 트리거
  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [orderbook])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${safeFixed(value, 2)}`
  }

  const getLiquidityStatus = (imbalance: number) => {
    if (Math.abs(imbalance) < 10) return { text: '균형', color: 'text-green-400', bgColor: 'bg-green-500/20' }
    if (imbalance > 30) return { text: '매수 과다', color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
    if (imbalance < -30) return { text: '매도 과다', color: 'text-red-400', bgColor: 'bg-red-500/20' }
    return { text: '약간 불균형', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
  }

  const status = getLiquidityStatus(metrics.liquidityImbalance)

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaWater className="text-blue-400" />
          유동성 깊이 분석
        </h3>

        {/* 주요 메트릭 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">총 유동성</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(metrics.totalLiquidity)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">스프레드</div>
            <div className="text-2xl font-bold text-yellow-400">
              {safeFixed(metrics.spreadBps, 1)}
              <span className="text-sm text-gray-400 ml-1">bps</span>
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">유동성 비율</div>
            <div className="text-2xl font-bold text-white">
              {safeFixed(metrics.depthRatio, 2)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">상태</div>
            <div className={`text-sm font-bold ${status.bgColor} ${status.color} px-3 py-1 rounded inline-block`}>
              {status.text}
            </div>
          </div>
        </div>

        {/* 유동성 균형 바 */}
        <div className="mb-6">
          <h4 className="text-gray-300 text-sm font-medium mb-3">매수/매도 유동성 균형</h4>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="text-right text-sm text-gray-400 mb-1">
                매수 {formatCurrency(metrics.bidLiquidity)}
              </div>
              <div className="h-8 bg-gray-700 rounded-l-lg overflow-hidden">
                <motion.div
                  key={`bid-${animationKey}`}
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.totalLiquidity > 0 ? (metrics.bidLiquidity / metrics.totalLiquidity) * 100 : 50}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="px-2">
              <FaArrowsAltV className="text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="text-left text-sm text-gray-400 mb-1">
                매도 {formatCurrency(metrics.askLiquidity)}
              </div>
              <div className="h-8 bg-gray-700 rounded-r-lg overflow-hidden">
                <motion.div
                  key={`ask-${animationKey}`}
                  className="h-full bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.totalLiquidity > 0 ? (metrics.askLiquidity / metrics.totalLiquidity) * 100 : 50}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 깊이별 분석 테이블 */}
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-sm font-medium p-3">가격 범위</th>
                <th className="text-right text-gray-400 text-sm font-medium p-3">매수 유동성</th>
                <th className="text-right text-gray-400 text-sm font-medium p-3">매도 유동성</th>
                <th className="text-right text-gray-400 text-sm font-medium p-3">슬리피지</th>
              </tr>
            </thead>
            <tbody>
              {depthLevels.map((level, idx) => (
                <motion.tr
                  key={level.percentage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border-b border-gray-700/50 cursor-pointer hover:bg-gray-700/30 transition-colors ${
                    selectedPercentage === level.percentage ? 'bg-purple-500/10' : ''
                  }`}
                  onClick={() => setSelectedPercentage(level.percentage)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">±{level.percentage}%</span>
                      {selectedPercentage === level.percentage && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          선택됨
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-green-400">{formatCurrency(level.bidLiquidity)}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-red-400">{formatCurrency(level.askLiquidity)}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`font-medium ${
                      level.slippage < 0.5 ? 'text-green-400' :
                      level.slippage < 1 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {safeFixed(level.slippage, 2)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 선택된 깊이 상세 정보 */}
        <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-white font-bold mb-3">±{selectedPercentage}% 가격 범위 분석</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">예상 체결 가격 (매도)</span>
              <p className="text-white font-medium">
                ${depthLevels.find(l => l.percentage === selectedPercentage)?.safeFixed(bidPrice, 2)}
              </p>
            </div>
            <div>
              <span className="text-gray-400">예상 체결 가격 (매수)</span>
              <p className="text-white font-medium">
                ${depthLevels.find(l => l.percentage === selectedPercentage)?.safeFixed(askPrice, 2)}
              </p>
            </div>
          </div>
        </div>

        {/* 경고 메시지 */}
        {metrics.liquidityImbalance > 40 && (
          <div className="mt-4 bg-orange-500/10 border border-orange-500/50 rounded-lg p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-orange-400 mt-0.5" />
            <div>
              <p className="text-orange-400 font-semibold">유동성 불균형 경고</p>
              <p className="text-gray-300 text-sm mt-1">
                매수 유동성이 매도 유동성보다 과도하게 높습니다. 급격한 가격 변동 가능성이 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 트레이딩 팁 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <FaCoins className="text-yellow-400" />
          유동성 기반 트레이딩 팁
        </h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
            <p className="text-gray-300 text-sm">
              스프레드가 {safeFixed(metrics.spreadBps, 1)}bps로 
              {metrics.spreadBps < 10 ? ' 매우 좁아 시장가 주문에 유리' : 
               metrics.spreadBps < 30 ? ' 적절한 수준' : 
               ' 넓어 지정가 주문을 권장'}합니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
            <p className="text-gray-300 text-sm">
              현재 유동성 비율이 {safeFixed(metrics.depthRatio, 2)}로 
              {metrics.depthRatio > 1.2 ? ' 매수 압력이 우세' :
               metrics.depthRatio < 0.8 ? ' 매도 압력이 우세' :
               ' 균형잡힌 상태'}입니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
            <p className="text-gray-300 text-sm">
              대량 주문 시 ±1% 범위에서 약 {depthLevels[2]?.safeFixed(slippage, 2)}%의 슬리피지가 예상됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}