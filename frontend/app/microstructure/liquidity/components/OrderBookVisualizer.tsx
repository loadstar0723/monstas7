'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface OrderBookVisualizerProps {
  orderbook: any
  currentPrice: number
}

export default function OrderBookVisualizer({ orderbook, currentPrice }: OrderBookVisualizerProps) {
  // 오더북 데이터 처리
  const processedData = useMemo(() => {
    if (!orderbook) return { bids: [], asks: [], maxTotal: 0 }
    
    const bids = orderbook.bids.slice(0, 15)
    const asks = orderbook.asks.slice(0, 15)
    
    // 누적 총액 계산
    let bidCumulative = 0
    const bidsWithCumulative = bids.map((bid: any) => {
      bidCumulative += bid.total
      return { ...bid, cumulative: bidCumulative }
    })
    
    let askCumulative = 0
    const asksWithCumulative = asks.map((ask: any) => {
      askCumulative += ask.total
      return { ...ask, cumulative: askCumulative }
    })
    
    const maxTotal = Math.max(bidCumulative, askCumulative)
    
    return { 
      bids: bidsWithCumulative, 
      asks: asksWithCumulative.reverse(), 
      maxTotal 
    }
  }, [orderbook])
  
  // 스프레드 계산
  const spread = useMemo(() => {
    if (!orderbook || !orderbook.bids[0] || !orderbook.asks[0]) return 0
    return orderbook.asks[0].price - orderbook.bids[0].price
  }, [orderbook])
  
  const spreadPercent = useMemo(() => {
    if (!currentPrice || !spread) return 0
    return (spread / currentPrice) * 100
  }, [spread, currentPrice])
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">실시간 오더북</h3>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-lg px-3 py-1">
            <span className="text-gray-400 text-sm">스프레드: </span>
            <span className="text-yellow-400 font-semibold">
              ${safeFixed(spread, 2)} ({safeFixed(spreadPercent, 4)}%)
            </span>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-1">
            <span className="text-gray-400 text-sm">중간가: </span>
            <span className="text-white font-semibold">
              ${((orderbook?.bids[0]?.price + orderbook?.asks[0]?.price) / 2 || currentPrice).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 매수 오더북 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-green-400 font-semibold mb-3">매수 주문 (Bids)</h4>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-xs text-gray-500 pb-2 border-b border-gray-700">
              <span>가격</span>
              <span className="text-right">수량</span>
              <span className="text-right">총액</span>
            </div>
            {processedData.bids.map((bid: any, index: number) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 bg-green-500/20 rounded"
                  style={{ 
                    width: `${(bid.cumulative / processedData.maxTotal) * 100}%` 
                  }}
                />
                <div className="relative grid grid-cols-3 text-sm py-1 px-1">
                  <span className="text-green-400 font-mono">
                    ${safePrice(bid.price, 2)}
                  </span>
                  <span className="text-gray-300 text-right font-mono">
                    {safeAmount(bid.amount)}
                  </span>
                  <span className="text-gray-400 text-right font-mono">
                    ${(bid.total / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 매도 오더북 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-3">매도 주문 (Asks)</h4>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-xs text-gray-500 pb-2 border-b border-gray-700">
              <span>가격</span>
              <span className="text-right">수량</span>
              <span className="text-right">총액</span>
            </div>
            {processedData.asks.map((ask: any, index: number) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 bg-red-500/20 rounded"
                  style={{ 
                    width: `${(ask.cumulative / processedData.maxTotal) * 100}%` 
                  }}
                />
                <div className="relative grid grid-cols-3 text-sm py-1 px-1">
                  <span className="text-red-400 font-mono">
                    ${safePrice(ask.price, 2)}
                  </span>
                  <span className="text-gray-300 text-right font-mono">
                    {safeAmount(ask.amount)}
                  </span>
                  <span className="text-gray-400 text-right font-mono">
                    ${(ask.total / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 오더북 임밸런스 */}
      <div className="mt-4 bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-gray-400 text-sm mb-2">오더북 임밸런스</h4>
        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400"
            style={{ 
              width: `${(processedData.bids.reduce((sum, b) => sum + b.total, 0) / 
                (processedData.bids.reduce((sum, b) => sum + b.total, 0) + 
                 processedData.asks.reduce((sum, a) => sum + a.total, 0))) * 100}%` 
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {((processedData.bids.reduce((sum, b) => sum + b.total, 0) / 
                (processedData.bids.reduce((sum, b) => sum + b.total, 0) + 
                 processedData.asks.reduce((sum, a) => sum + a.total, 0))) * 100).toFixed(1)}% 매수
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>강한 매수 압력</span>
          <span>균형</span>
          <span>강한 매도 압력</span>
        </div>
      </div>
    </div>
  )
}