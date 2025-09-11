'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaWater, FaChartArea, FaExchangeAlt } from 'react-icons/fa'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
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

interface LiquidityData {
  price: number
  bidVolume: number
  askVolume: number
  totalVolume: number
}

interface TradeFlow {
  time: string
  buyVolume: number
  sellVolume: number
  netFlow: number
}

export default function LiquidityChart({ selectedCoin }: Props) {
  const [liquidityData, setLiquidityData] = useState<LiquidityData[]>([])
  const [tradeFlowData, setTradeFlowData] = useState<TradeFlow[]>([])
  const [totalLiquidity, setTotalLiquidity] = useState({ bid: 0, ask: 0 })
  const [liquidityRatio, setLiquidityRatio] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLiquidityData()
    const interval = setInterval(loadLiquidityData, 10000)
    return () => clearInterval(interval)
  }, [selectedCoin.fullSymbol])

  const loadLiquidityData = async () => {
    try {
      setLoading(true)
      
      // 오더북 깊이 데이터 가져오기 (프록시 API 사용)
      const response = await fetch(`/api/binance/depth?symbol=${selectedCoin.fullSymbol}&limit=100`)
      const orderBook = await response.json()
      
      // 유동성 데이터 처리
      const processedData: LiquidityData[] = []
      const priceRange = 0.02 // ±2% 가격 범위
      
      const midPrice = (parseFloat(orderBook.bids[0][0]) + parseFloat(orderBook.asks[0][0])) / 2
      const priceStep = midPrice * 0.0005 // 0.05% 간격
      
      // 가격대별 유동성 집계
      for (let i = -40; i <= 40; i++) {
        const price = midPrice + (i * priceStep)
        let bidVolume = 0
        let askVolume = 0
        
        // 해당 가격대의 매수 주문량
        orderBook.bids.forEach((bid: any) => {
          const bidPrice = parseFloat(bid[0])
          if (bidPrice >= price - priceStep/2 && bidPrice < price + priceStep/2) {
            bidVolume += parseFloat(bid[1])
          }
        })
        
        // 해당 가격대의 매도 주문량
        orderBook.asks.forEach((ask: any) => {
          const askPrice = parseFloat(ask[0])
          if (askPrice >= price - priceStep/2 && askPrice < price + priceStep/2) {
            askVolume += parseFloat(ask[1])
          }
        })
        
        processedData.push({
          price,
          bidVolume,
          askVolume,
          totalVolume: bidVolume + askVolume
        })
      }
      
      setLiquidityData(processedData)
      
      // 전체 유동성 계산
      const totalBid = orderBook.bids.reduce((sum: number, bid: any) => sum + parseFloat(bid[1]), 0)
      const totalAsk = orderBook.asks.reduce((sum: number, ask: any) => sum + parseFloat(ask[1]), 0)
      setTotalLiquidity({ bid: totalBid, ask: totalAsk })
      setLiquidityRatio(totalBid / (totalAsk || 1))
      
      // 거래 흐름 데이터 시뮬레이션 (실제로는 거래 히스토리 API 사용)
      const flowData: TradeFlow[] = []
      const now = Date.now()
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now - i * 60000)
        const buyVolume = 100 + Math.random() * 50
        const sellVolume = 100 + Math.random() * 50
        
        flowData.push({
          time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          buyVolume,
          sellVolume,
          netFlow: buyVolume - sellVolume
        })
      }
      
      setTradeFlowData(flowData)
      setLoading(false)
      
    } catch (error) {
      console.error('유동성 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 10000) return safePrice(price, 0)
    if (price >= 100) return safePrice(price, 2)
    return safePrice(price, 4)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return safeFixed(volume, 2)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaWater className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">유동성 차트</h2>
            <p className="text-gray-400">{selectedCoin.name} 시장 유동성 분석</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">유동성 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaWater className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">유동성 차트</h2>
          <p className="text-gray-400">{selectedCoin.name} 시장 유동성 분석</p>
        </div>
      </div>

      {/* 유동성 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">매수 유동성</p>
          <p className="text-2xl font-bold text-green-400">{safeFixed(totalLiquidity.bid, 2)}</p>
          <p className="text-xs text-gray-400">{selectedCoin.symbol}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">매도 유동성</p>
          <p className="text-2xl font-bold text-red-400">{safeFixed(totalLiquidity.ask, 2)}</p>
          <p className="text-xs text-gray-400">{selectedCoin.symbol}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">유동성 비율</p>
          <p className={`text-2xl font-bold ${
            liquidityRatio > 1.1 ? 'text-green-400' : 
            liquidityRatio < 0.9 ? 'text-red-400' : 'text-white'
          }`}>
            {safeFixed(liquidityRatio, 3)}
          </p>
          <p className="text-xs text-gray-400">
            {liquidityRatio > 1.1 ? '매수 우세' : 
             liquidityRatio < 0.9 ? '매도 우세' : '균형'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">총 유동성</p>
          <p className="text-2xl font-bold text-purple-400">
            {(totalLiquidity.bid + totalLiquidity.ask).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">{selectedCoin.symbol}</p>
        </div>
      </div>

      {/* 유동성 분포 차트 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaChartArea className="text-purple-400" />
          가격대별 유동성 분포
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liquidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="price" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={formatPrice}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={formatVolume}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E5E7EB' }}
                formatter={(value: number) => formatVolume(value)}
                labelFormatter={(value: number) => `$${formatPrice(value)}`}
              />
              <Area 
                type="monotone" 
                dataKey="bidVolume" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.4}
                name="매수 주문"
              />
              <Area 
                type="monotone" 
                dataKey="askVolume" 
                stackId="1"
                stroke="#EF4444" 
                fill="#EF4444"
                fillOpacity={0.4}
                name="매도 주문"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 거래 흐름 차트 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaExchangeAlt className="text-purple-400" />
          거래량 흐름
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tradeFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Bar 
                dataKey="buyVolume" 
                fill="#10B981"
                name="매수 거래량"
              />
              <Bar 
                dataKey="sellVolume" 
                fill="#EF4444"
                name="매도 거래량"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 마켓 메이킹 전략 제안 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">유동성 기반 전략</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">현재 유동성 상태</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  {liquidityRatio > 1.1 ? '매수 측 유동성이 풍부합니다.' :
                   liquidityRatio < 0.9 ? '매도 측 유동성이 풍부합니다.' :
                   '양쪽 유동성이 균형잡혀 있습니다.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  총 유동성: {(totalLiquidity.bid + totalLiquidity.ask).toFixed(2)} {selectedCoin.symbol}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  {totalLiquidity.bid + totalLiquidity.ask > 100 ? 
                   '충분한 유동성으로 큰 주문도 가능합니다.' :
                   '유동성이 제한적이므로 작은 주문이 권장됩니다.'}
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">권장 전략</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>
                  {liquidityRatio > 1.1 ? '매도 호가를 타이트하게 설정하세요.' :
                   liquidityRatio < 0.9 ? '매수 호가를 타이트하게 설정하세요.' :
                   '양쪽 호가를 균등하게 설정하세요.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>
                  주문 크기: 평균 유동성의 {totalLiquidity.bid + totalLiquidity.ask > 100 ? '1-2%' : '0.5-1%'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>
                  유동성이 얇은 가격대를 타겟으로 호가를 제시하세요.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}