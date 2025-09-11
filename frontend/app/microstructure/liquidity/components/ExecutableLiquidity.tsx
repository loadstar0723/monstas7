'use client'

import { useMemo, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { CalculatorIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface ExecutableLiquidityProps {
  orderbook: any
  currentPrice: number
}

export default function ExecutableLiquidity({ orderbook, currentPrice }: ExecutableLiquidityProps) {
  const [tradeSize, setTradeSize] = useState(0.1)
  
  // 실행 가능 유동성 계산
  const executableLiquidity = useMemo(() => {
    if (!orderbook) return null
    
    // 다양한 거래 크기에 대한 실행 가능성 계산
    const tradeSizes = [0.01, 0.1, 0.5, 1, 5, 10]
    
    const calculateExecutability = (size: number) => {
      // 매수 실행
      let buyRemaining = size
      let buyTotalCost = 0
      let buyLevels = 0
      
      for (const ask of orderbook.asks) {
        if (buyRemaining <= 0) break
        const amount = Math.min(buyRemaining, ask.amount)
        buyTotalCost += amount * ask.price
        buyRemaining -= amount
        buyLevels++
      }
      
      const buyAvgPrice = size > 0 ? buyTotalCost / (size - buyRemaining) : 0
      const buySlippage = buyAvgPrice > 0 ? ((buyAvgPrice - orderbook.asks[0]?.price) / orderbook.asks[0]?.price) * 100 : 0
      const buyExecutable = buyRemaining === 0
      
      // 매도 실행
      let sellRemaining = size
      let sellTotalCost = 0
      let sellLevels = 0
      
      for (const bid of orderbook.bids) {
        if (sellRemaining <= 0) break
        const amount = Math.min(sellRemaining, bid.amount)
        sellTotalCost += amount * bid.price
        sellRemaining -= amount
        sellLevels++
      }
      
      const sellAvgPrice = size > 0 ? sellTotalCost / (size - sellRemaining) : 0
      const sellSlippage = sellAvgPrice > 0 ? ((orderbook.bids[0]?.price - sellAvgPrice) / orderbook.bids[0]?.price) * 100 : 0
      const sellExecutable = sellRemaining === 0
      
      return {
        size,
        buy: {
          executable: buyExecutable,
          avgPrice: buyAvgPrice,
          slippage: buySlippage,
          levels: buyLevels,
          totalCost: buyTotalCost
        },
        sell: {
          executable: sellExecutable,
          avgPrice: sellAvgPrice,
          slippage: sellSlippage,
          levels: sellLevels,
          totalRevenue: sellTotalCost
        }
      }
    }
    
    const results = tradeSizes.map(size => calculateExecutability(size))
    const customResult = calculateExecutability(tradeSize)
    
    // 최대 실행 가능 크기 찾기
    let maxBuySize = 0
    let maxSellSize = 0
    
    const totalAskLiquidity = orderbook.asks.reduce((sum: number, a: any) => sum + a.amount, 0)
    const totalBidLiquidity = orderbook.bids.reduce((sum: number, b: any) => sum + b.amount, 0)
    
    maxBuySize = totalAskLiquidity
    maxSellSize = totalBidLiquidity
    
    return {
      results,
      customResult,
      maxBuySize,
      maxSellSize
    }
  }, [orderbook, tradeSize])
  
  if (!executableLiquidity) return null
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">실행 가능 유동성 분석</h3>
        <p className="text-gray-400 text-sm">거래 크기별 실행 가능성 및 슬리피지 분석</p>
      </div>
      
      {/* 최대 실행 가능 크기 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-semibold">최대 매수 가능</span>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {safeFixed(executableLiquidity.maxBuySize, 4)} BTC
          </p>
          <p className="text-sm text-gray-400 mt-1">
            ≈ ${(executableLiquidity.maxBuySize * currentPrice / 1000000).toFixed(2)}M
          </p>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 font-semibold">최대 매도 가능</span>
            <ChartBarIcon className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {safeFixed(executableLiquidity.maxSellSize, 4)} BTC
          </p>
          <p className="text-sm text-gray-400 mt-1">
            ≈ ${(executableLiquidity.maxSellSize * currentPrice / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>
      
      {/* 표준 크기별 실행 가능성 */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">표준 거래 크기 분석</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2">크기</th>
                <th className="text-center py-2">매수 실행</th>
                <th className="text-center py-2">매수 슬리피지</th>
                <th className="text-center py-2">매도 실행</th>
                <th className="text-center py-2">매도 슬리피지</th>
              </tr>
            </thead>
            <tbody>
              {executableLiquidity.results.map((result: any) => (
                <tr key={result.size} className="border-b border-gray-800">
                  <td className="py-2 text-white font-mono">{result.size} BTC</td>
                  <td className="text-center py-2">
                    {result.buy.executable ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="text-center py-2">
                    <span className={result.buy.slippage > 0.1 ? 'text-yellow-400' : 'text-gray-300'}>
                      {safeFixed(result.buy.slippage, 3)}%
                    </span>
                  </td>
                  <td className="text-center py-2">
                    {result.sell.executable ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="text-center py-2">
                    <span className={result.sell.slippage > 0.1 ? 'text-yellow-400' : 'text-gray-300'}>
                      {safeFixed(result.sell.slippage, 3)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 커스텀 크기 계산기 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <CalculatorIcon className="w-5 h-5" />
          커스텀 크기 계산기
        </h4>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">거래 크기 (BTC)</label>
          <input
            type="number"
            value={tradeSize}
            onChange={(e) => setTradeSize(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.001"
            max="100"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {executableLiquidity.customResult && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <h5 className="text-green-400 font-semibold mb-2">매수 분석</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">실행 가능:</span>
                  <span className={executableLiquidity.customResult.buy.executable ? 'text-green-400' : 'text-red-400'}>
                    {executableLiquidity.customResult.buy.executable ? '예' : '아니오'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">평균가:</span>
                  <span className="text-white">${safeFixed(executableLiquidity.customResult.buy.avgPrice, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">슬리피지:</span>
                  <span className="text-yellow-400">{safeFixed(executableLiquidity.customResult.buy.slippage, 3)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">필요 레벨:</span>
                  <span className="text-white">{executableLiquidity.customResult.buy.levels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">총 비용:</span>
                  <span className="text-purple-400">${(executableLiquidity.customResult.buy.totalCost / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <h5 className="text-red-400 font-semibold mb-2">매도 분석</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">실행 가능:</span>
                  <span className={executableLiquidity.customResult.sell.executable ? 'text-green-400' : 'text-red-400'}>
                    {executableLiquidity.customResult.sell.executable ? '예' : '아니오'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">평균가:</span>
                  <span className="text-white">${safeFixed(executableLiquidity.customResult.sell.avgPrice, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">슬리피지:</span>
                  <span className="text-yellow-400">{safeFixed(executableLiquidity.customResult.sell.slippage, 3)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">필요 레벨:</span>
                  <span className="text-white">{executableLiquidity.customResult.sell.levels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">총 수익:</span>
                  <span className="text-purple-400">${(executableLiquidity.customResult.sell.totalRevenue / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 실행 팁 */}
      <div className="mt-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">💡 실행 최적화 팁</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 슬리피지 0.1% 이하가 이상적인 실행 조건</li>
          <li>• 대량 거래는 여러 번 나누어 실행 권장</li>
          <li>• 레벨 수가 많을수록 가격 변동 위험 증가</li>
          <li>• 유동성이 낮은 시간대는 실행 피하기</li>
        </ul>
      </div>
    </div>
  )
}