'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

interface LiquidityMetricsProps {
  orderbook: any
  currentPrice: number
  symbol: string
}

export default function LiquidityMetrics({ orderbook, currentPrice, symbol }: LiquidityMetricsProps) {
  
  // 메트릭 계산
  const metrics = useMemo(() => {
    if (!orderbook) return null
    
    // 스프레드 계산
    const bestBid = orderbook.bids[0]?.price || 0
    const bestAsk = orderbook.asks[0]?.price || 0
    const spread = bestAsk - bestBid
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0
    
    // 슬리피지 계산 (0.1 BTC 기준)
    const calculateSlippage = (orders: any[], amount: number, isBuy: boolean) => {
      let remainingAmount = amount
      let totalCost = 0
      let avgPrice = 0
      
      for (const order of orders) {
        if (remainingAmount <= 0) break
        
        const orderAmount = Math.min(remainingAmount, order.amount)
        totalCost += orderAmount * order.price
        remainingAmount -= orderAmount
      }
      
      if (amount - remainingAmount > 0) {
        avgPrice = totalCost / (amount - remainingAmount)
      }
      
      const slippage = isBuy 
        ? ((avgPrice - bestAsk) / bestAsk) * 100
        : ((bestBid - avgPrice) / bestBid) * 100
      
      return { avgPrice, slippage: Math.abs(slippage) }
    }
    
    // 0.1 BTC 기준 슬리피지
    const buySlippage = calculateSlippage(orderbook.asks, 0.1, true)
    const sellSlippage = calculateSlippage(orderbook.bids, 0.1, false)
    
    // 시장 깊이 계산
    const depthBids = orderbook.bids.slice(0, 20).reduce((sum: number, b: any) => sum + b.total, 0)
    const depthAsks = orderbook.asks.slice(0, 20).reduce((sum: number, b: any) => sum + b.total, 0)
    const totalDepth = depthBids + depthAsks
    
    // 유동성 점수 계산 (0-100)
    const liquidityScore = Math.min(100, Math.round(
      (100 - spreadPercent * 10) * 0.3 +  // 스프레드 (30%)
      (100 - buySlippage.slippage * 20) * 0.3 +  // 슬리피지 (30%)
      Math.min(100, totalDepth / 1000000 * 10) * 0.4  // 깊이 (40%)
    ))
    
    // 마켓 임팩트 예측 (대량 주문 시)
    const calculateMarketImpact = (amount: number) => {
      const buyImpact = calculateSlippage(orderbook.asks, amount, true)
      const sellImpact = calculateSlippage(orderbook.bids, amount, false)
      return { buy: buyImpact.slippage, sell: sellImpact.slippage }
    }
    
    const impact1BTC = calculateMarketImpact(1)
    const impact10BTC = calculateMarketImpact(10)
    
    return {
      spread,
      spreadPercent,
      buySlippage,
      sellSlippage,
      depthBids,
      depthAsks,
      totalDepth,
      liquidityScore,
      impact1BTC,
      impact10BTC
    }
  }, [orderbook, currentPrice])
  
  if (!metrics) return null
  
  // 유동성 상태 판단
  const getLiquidityStatus = (score: number) => {
    if (score >= 80) return { text: '매우 우수', color: 'text-green-400', icon: CheckCircleIcon }
    if (score >= 60) return { text: '양호', color: 'text-blue-400', icon: CheckCircleIcon }
    if (score >= 40) return { text: '보통', color: 'text-yellow-400', icon: ExclamationTriangleIcon }
    return { text: '주의', color: 'text-red-400', icon: ExclamationTriangleIcon }
  }
  
  const status = getLiquidityStatus(metrics.liquidityScore)
  const StatusIcon = status.icon
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">유동성 메트릭</h3>
          <div className={`flex items-center gap-2 ${status.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="font-semibold">{status.text}</span>
          </div>
        </div>
        
        {/* 유동성 점수 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">유동성 점수</span>
            <span className="text-2xl font-bold text-white">{metrics.liquidityScore}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                metrics.liquidityScore >= 80 ? 'bg-green-500' :
                metrics.liquidityScore >= 60 ? 'bg-blue-500' :
                metrics.liquidityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.liquidityScore}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 메트릭 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 스프레드 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Bid-Ask 스프레드</span>
            <ArrowUpIcon className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-xl font-bold text-white">${safeFixed(metrics.spread, 2)}</p>
          <p className="text-sm text-gray-400 mt-1">{safeFixed(metrics.spreadPercent, 4)}%</p>
        </div>
        
        {/* 매수 슬리피지 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">매수 슬리피지 (0.1 BTC)</span>
            <ArrowUpIcon className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-xl font-bold text-green-400">{safeFixed(metrics.buySlippage.slippage, 3)}%</p>
          <p className="text-sm text-gray-400 mt-1">평균가: ${safeFixed(metrics.buySlippage.avgPrice, 2)}</p>
        </div>
        
        {/* 매도 슬리피지 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">매도 슬리피지 (0.1 BTC)</span>
            <ArrowDownIcon className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-bold text-red-400">{safeFixed(metrics.sellSlippage.slippage, 3)}%</p>
          <p className="text-sm text-gray-400 mt-1">평균가: ${safeFixed(metrics.sellSlippage.avgPrice, 2)}</p>
        </div>
        
        {/* 매수 깊이 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">매수 깊이 (20 레벨)</span>
          </div>
          <p className="text-xl font-bold text-green-400">
            ${(metrics.depthBids / 1000000).toFixed(2)}M
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {((metrics.depthBids / metrics.totalDepth) * 100).toFixed(1)}% of total
          </p>
        </div>
        
        {/* 매도 깊이 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">매도 깊이 (20 레벨)</span>
          </div>
          <p className="text-xl font-bold text-red-400">
            ${(metrics.depthAsks / 1000000).toFixed(2)}M
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {((metrics.depthAsks / metrics.totalDepth) * 100).toFixed(1)}% of total
          </p>
        </div>
        
        {/* 총 유동성 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">총 유동성</span>
          </div>
          <p className="text-xl font-bold text-purple-400">
            ${(metrics.totalDepth / 1000000).toFixed(2)}M
          </p>
          <p className="text-sm text-gray-400 mt-1">Top 20 levels</p>
        </div>
      </div>
      
      {/* 마켓 임팩트 예측 */}
      <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">마켓 임팩트 예측</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm mb-2">1 BTC 거래 시</p>
            <div className="flex justify-between">
              <span className="text-green-400">매수: {safeFixed(metrics.impact1BTC.buy, 3)}%</span>
              <span className="text-red-400">매도: {safeFixed(metrics.impact1BTC.sell, 3)}%</span>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm mb-2">10 BTC 거래 시</p>
            <div className="flex justify-between">
              <span className="text-green-400">매수: {safeFixed(metrics.impact10BTC.buy, 3)}%</span>
              <span className="text-red-400">매도: {safeFixed(metrics.impact10BTC.sell, 3)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}