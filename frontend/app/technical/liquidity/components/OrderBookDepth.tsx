'use client'

import { useState, useMemo } from 'react'

interface OrderBookLevel {
  price: number
  quantity: number
  size: number
  orders?: number
  side: 'buy' | 'sell'
}

interface OrderBook {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

interface OrderBookDepthProps {
  orderBook: OrderBook
  currentPrice: number
  symbol: string
  detailed?: boolean
}

export default function OrderBookDepth({ 
  orderBook, 
  currentPrice, 
  symbol, 
  detailed = false 
}: OrderBookDepthProps) {
  const [viewMode, setViewMode] = useState<'combined' | 'separate'>('combined')
  const [depthLevels, setDepthLevels] = useState(detailed ? 20 : 10)

  // 오더북 분석 데이터
  const analysis = useMemo(() => {
    if (!orderBook?.bids?.length || !orderBook?.asks?.length) {
      return {
        spread: 0,
        spreadPercent: 0,
        bidPressure: 0,
        askPressure: 0,
        imbalance: 0,
        totalBidSize: 0,
        totalAskSize: 0,
        averageBidSize: 0,
        averageAskSize: 0,
        maxBidPrice: 0,
        minAskPrice: 0
      }
    }

    const topBids = orderBook.bids.slice(0, depthLevels)
    const topAsks = orderBook.asks.slice(0, depthLevels)
    
    const maxBidPrice = Math.max(...topBids.map(b => b.price))
    const minAskPrice = Math.min(...topAsks.map(a => a.price))
    const spread = minAskPrice - maxBidPrice
    const spreadPercent = (spread / currentPrice) * 100

    const totalBidSize = topBids.reduce((sum, bid) => sum + bid.size, 0)
    const totalAskSize = topAsks.reduce((sum, ask) => sum + ask.size, 0)
    
    const averageBidSize = totalBidSize / topBids.length
    const averageAskSize = totalAskSize / topAsks.length

    const bidPressure = totalBidSize / (totalBidSize + totalAskSize)
    const askPressure = totalAskSize / (totalBidSize + totalAskSize)
    const imbalance = (bidPressure - askPressure) * 100

    return {
      spread,
      spreadPercent,
      bidPressure,
      askPressure,
      imbalance,
      totalBidSize,
      totalAskSize,
      averageBidSize,
      averageAskSize,
      maxBidPrice,
      minAskPrice
    }
  }, [orderBook, depthLevels, currentPrice])

  // 누적 사이즈 계산
  const cumulativeData = useMemo(() => {
    if (!orderBook?.bids?.length || !orderBook?.asks?.length) return { bids: [], asks: [] }

    const bidsWithCumulative = orderBook.bids.slice(0, depthLevels).map((bid, index) => ({
      ...bid,
      cumulative: orderBook.bids.slice(0, index + 1).reduce((sum, b) => sum + b.size, 0)
    }))

    const asksWithCumulative = orderBook.asks.slice(0, depthLevels).map((ask, index) => ({
      ...ask,
      cumulative: orderBook.asks.slice(0, index + 1).reduce((sum, a) => sum + a.size, 0)
    }))

    return { bids: bidsWithCumulative, asks: asksWithCumulative }
  }, [orderBook, depthLevels])

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    if (currentPrice >= 1000) return price.toFixed(2)
    if (currentPrice >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  // 사이즈 포맷팅
  const formatSize = (size: number) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(1)}K`
    return size.toFixed(2)
  }

  // 수량 포맷팅
  const formatQuantity = (quantity: number) => {
    if (quantity >= 1000) return `${(quantity / 1000).toFixed(1)}K`
    if (quantity >= 1) return quantity.toFixed(2)
    return quantity.toFixed(4)
  }

  // 상대적 바 크기 계산
  const getBarWidth = (size: number, maxSize: number) => {
    return Math.max((size / maxSize) * 100, 2)
  }

  const maxSize = Math.max(
    ...cumulativeData.bids.map(b => b.cumulative),
    ...cumulativeData.asks.map(a => a.cumulative)
  )

  return (
    <div className="space-y-4">
      {/* 컨트롤 패널 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">표시:</span>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'combined' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              통합
            </button>
            <button
              onClick={() => setViewMode('separate')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'separate' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              분리
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">레벨:</span>
            <select
              value={depthLevels}
              onChange={(e) => setDepthLevels(Number(e.target.value))}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* 스프레드 정보 */}
        <div className="text-right">
          <div className="text-xs text-gray-400">스프레드</div>
          <div className="text-sm font-mono text-white">
            ${analysis.spread.toFixed(4)} ({analysis.spreadPercent.toFixed(3)}%)
          </div>
        </div>
      </div>

      {/* 현재가 및 요약 정보 */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <div className="text-center mb-3">
          <div className="text-xl font-bold text-white font-mono">
            ${formatPrice(currentPrice)}
          </div>
          <div className="text-sm text-gray-400">{symbol}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">매수 압력</div>
            <div className="text-green-400 font-medium">
              {(analysis.bidPressure * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">매도 압력</div>
            <div className="text-red-400 font-medium">
              {(analysis.askPressure * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 불균형 인디케이터 */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>매수</span>
            <span>불균형: {analysis.imbalance.toFixed(1)}%</span>
            <span>매도</span>
          </div>
          <div className="relative bg-gray-600 rounded-full h-2">
            <div 
              className="absolute top-0 left-0 bg-green-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${analysis.bidPressure * 100}%` }}
            />
            <div 
              className="absolute top-0 right-0 bg-red-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${analysis.askPressure * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 오더북 테이블 */}
      <div className={`grid ${viewMode === 'combined' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {viewMode === 'combined' ? (
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gray-700/50 px-4 py-2 grid grid-cols-4 gap-2 text-xs text-gray-400 font-medium">
              <div className="text-left">가격</div>
              <div className="text-right">수량</div>
              <div className="text-right">크기</div>
              <div className="text-right">누적</div>
            </div>

            {/* 매도 주문 */}
            <div className="space-y-1 p-2">
              {cumulativeData.asks.reverse().map((ask, index) => (
                <div 
                  key={`ask-${index}`}
                  className="relative grid grid-cols-4 gap-2 text-sm py-1 hover:bg-red-500/10"
                >
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-red-500/20 transition-all duration-300"
                    style={{ width: `${getBarWidth(ask.cumulative, maxSize)}%` }}
                  />
                  <div className="text-red-400 font-mono relative z-10">{formatPrice(ask.price)}</div>
                  <div className="text-gray-300 text-right font-mono relative z-10">{formatQuantity(ask.quantity)}</div>
                  <div className="text-gray-300 text-right font-mono relative z-10">{formatSize(ask.size)}</div>
                  <div className="text-gray-400 text-right font-mono relative z-10">{formatSize(ask.cumulative)}</div>
                </div>
              ))}
            </div>

            {/* 중간 구분선 */}
            <div className="border-t border-gray-600 mx-4"></div>

            {/* 매수 주문 */}
            <div className="space-y-1 p-2">
              {cumulativeData.bids.map((bid, index) => (
                <div 
                  key={`bid-${index}`}
                  className="relative grid grid-cols-4 gap-2 text-sm py-1 hover:bg-green-500/10"
                >
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-green-500/20 transition-all duration-300"
                    style={{ width: `${getBarWidth(bid.cumulative, maxSize)}%` }}
                  />
                  <div className="text-green-400 font-mono relative z-10">{formatPrice(bid.price)}</div>
                  <div className="text-gray-300 text-right font-mono relative z-10">{formatQuantity(bid.quantity)}</div>
                  <div className="text-gray-300 text-right font-mono relative z-10">{formatSize(bid.size)}</div>
                  <div className="text-gray-400 text-right font-mono relative z-10">{formatSize(bid.cumulative)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 매도 주문 */}
            <div className="bg-gray-800/50 rounded-lg overflow-hidden">
              <div className="bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400">
                매도 주문 (Asks)
              </div>
              <div className="space-y-1 p-2">
                {cumulativeData.asks.reverse().map((ask, index) => (
                  <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-red-500/10">
                    <div className="text-red-400 font-mono">{formatPrice(ask.price)}</div>
                    <div className="text-gray-300 text-right font-mono">{formatQuantity(ask.quantity)}</div>
                    <div className="text-gray-400 text-right font-mono">{formatSize(ask.size)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 매수 주문 */}
            <div className="bg-gray-800/50 rounded-lg overflow-hidden">
              <div className="bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400">
                매수 주문 (Bids)
              </div>
              <div className="space-y-1 p-2">
                {cumulativeData.bids.map((bid, index) => (
                  <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-green-500/10">
                    <div className="text-green-400 font-mono">{formatPrice(bid.price)}</div>
                    <div className="text-gray-300 text-right font-mono">{formatQuantity(bid.quantity)}</div>
                    <div className="text-gray-400 text-right font-mono">{formatSize(bid.size)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 상세 통계 (detailed 모드일 때) */}
      {detailed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">총 매수량</div>
            <div className="text-lg font-bold text-green-400">
              {formatSize(analysis.totalBidSize)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">총 매도량</div>
            <div className="text-lg font-bold text-red-400">
              {formatSize(analysis.totalAskSize)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">평균 매수 주문</div>
            <div className="text-lg font-bold text-white">
              {formatSize(analysis.averageBidSize)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">평균 매도 주문</div>
            <div className="text-lg font-bold text-white">
              {formatSize(analysis.averageAskSize)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}