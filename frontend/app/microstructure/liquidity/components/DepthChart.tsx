'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface DepthChartProps {
  orderbook: any
  currentPrice: number
}

export default function DepthChart({ orderbook, currentPrice }: DepthChartProps) {
  
  // 깊이 차트 데이터 준비
  const depthData = useMemo(() => {
    if (!orderbook) return []
    
    // 누적 깊이 계산
    let bidCumulative = 0
    const bidDepth = orderbook.bids.slice(0, 50).map((bid: any) => {
      bidCumulative += bid.total
      return {
        price: bid.price,
        bidVolume: bidCumulative / 1000000,  // Convert to millions
        askVolume: 0,
        type: 'bid'
      }
    }).reverse()
    
    let askCumulative = 0
    const askDepth = orderbook.asks.slice(0, 50).map((ask: any) => {
      askCumulative += ask.total
      return {
        price: ask.price,
        bidVolume: 0,
        askVolume: askCumulative / 1000000,  // Convert to millions
        type: 'ask'
      }
    })
    
    // 중간에 현재가 포인트 추가
    const midPoint = {
      price: currentPrice,
      bidVolume: 0,
      askVolume: 0,
      type: 'current'
    }
    
    return [...bidDepth, midPoint, ...askDepth]
  }, [orderbook, currentPrice])
  
  // 불균형 지표 계산
  const imbalanceMetrics = useMemo(() => {
    if (!orderbook) return null
    
    const bidVolume5 = orderbook.bids.slice(0, 5).reduce((sum: number, b: any) => sum + b.total, 0)
    const askVolume5 = orderbook.asks.slice(0, 5).reduce((sum: number, a: any) => sum + a.total, 0)
    const imbalance5 = ((bidVolume5 - askVolume5) / (bidVolume5 + askVolume5)) * 100
    
    const bidVolume10 = orderbook.bids.slice(0, 10).reduce((sum: number, b: any) => sum + b.total, 0)
    const askVolume10 = orderbook.asks.slice(0, 10).reduce((sum: number, a: any) => sum + a.total, 0)
    const imbalance10 = ((bidVolume10 - askVolume10) / (bidVolume10 + askVolume10)) * 100
    
    const bidVolume20 = orderbook.bids.slice(0, 20).reduce((sum: number, b: any) => sum + b.total, 0)
    const askVolume20 = orderbook.asks.slice(0, 20).reduce((sum: number, a: any) => sum + a.total, 0)
    const imbalance20 = ((bidVolume20 - askVolume20) / (bidVolume20 + askVolume20)) * 100
    
    return {
      level5: { bid: bidVolume5, ask: askVolume5, imbalance: imbalance5 },
      level10: { bid: bidVolume10, ask: askVolume10, imbalance: imbalance10 },
      level20: { bid: bidVolume20, ask: askVolume20, imbalance: imbalance20 }
    }
  }, [orderbook])
  
  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <p className="text-white font-semibold">${label?.toFixed(2)}</p>
          {data.bidVolume > 0 && (
            <p className="text-green-400 text-sm">
              매수 누적: ${safeFixed(data.bidVolume, 2)}M
            </p>
          )}
          {data.askVolume > 0 && (
            <p className="text-red-400 text-sm">
              매도 누적: ${safeFixed(data.askVolume, 2)}M
            </p>
          )}
          {data.type === 'current' && (
            <p className="text-yellow-400 text-sm">현재가</p>
          )}
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">누적 깊이 차트</h3>
        <p className="text-gray-400 text-sm">오더북 누적 유동성 시각화</p>
      </div>
      
      {/* 메인 깊이 차트 */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={depthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="price" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${safeFixed(value, 0)}`}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${value}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              x={currentPrice} 
              stroke="#fbbf24" 
              strokeDasharray="5 5" 
              label={{ value: "현재가", fill: "#fbbf24", fontSize: 12 }}
            />
            <Area
              type="stepAfter"
              dataKey="bidVolume"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#bidGradient)"
            />
            <Area
              type="stepBefore"
              dataKey="askVolume"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#askGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* 깊이 불균형 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-gray-400 text-sm mb-2">5 레벨 깊이</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-400 text-sm">
              매수: ${(imbalanceMetrics?.level5.bid / 1000000).toFixed(2)}M
            </span>
            <span className="text-red-400 text-sm">
              매도: ${(imbalanceMetrics?.level5.ask / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500"
              style={{ 
                width: `${50 + (imbalanceMetrics?.level5.imbalance || 0) / 2}%` 
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {imbalanceMetrics?.safeFixed(level5.imbalance, 1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-gray-400 text-sm mb-2">10 레벨 깊이</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-400 text-sm">
              매수: ${(imbalanceMetrics?.level10.bid / 1000000).toFixed(2)}M
            </span>
            <span className="text-red-400 text-sm">
              매도: ${(imbalanceMetrics?.level10.ask / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500"
              style={{ 
                width: `${50 + (imbalanceMetrics?.level10.imbalance || 0) / 2}%` 
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {imbalanceMetrics?.safeFixed(level10.imbalance, 1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-gray-400 text-sm mb-2">20 레벨 깊이</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-400 text-sm">
              매수: ${(imbalanceMetrics?.level20.bid / 1000000).toFixed(2)}M
            </span>
            <span className="text-red-400 text-sm">
              매도: ${(imbalanceMetrics?.level20.ask / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500"
              style={{ 
                width: `${50 + (imbalanceMetrics?.level20.imbalance || 0) / 2}%` 
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {imbalanceMetrics?.safeFixed(level20.imbalance, 1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 깊이 분석 인사이트 */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">깊이 분석 인사이트</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">시장 압력</p>
            <p className="text-white">
              {imbalanceMetrics && imbalanceMetrics.level5.imbalance > 20 ? (
                <span className="text-green-400">강한 매수 압력</span>
              ) : imbalanceMetrics && imbalanceMetrics.level5.imbalance < -20 ? (
                <span className="text-red-400">강한 매도 압력</span>
              ) : (
                <span className="text-yellow-400">균형 상태</span>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-2">유동성 상태</p>
            <p className="text-white">
              {depthData.length > 80 ? (
                <span className="text-green-400">깊은 유동성</span>
              ) : depthData.length > 40 ? (
                <span className="text-yellow-400">보통 유동성</span>
              ) : (
                <span className="text-red-400">얕은 유동성</span>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-2">추천 전략</p>
            <p className="text-white text-sm">
              {imbalanceMetrics && Math.abs(imbalanceMetrics.level5.imbalance) > 30 ? (
                <span className="text-purple-400">모멘텀 추종</span>
              ) : (
                <span className="text-blue-400">레인지 트레이딩</span>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-2">리스크 레벨</p>
            <p className="text-white">
              {imbalanceMetrics && Math.abs(imbalanceMetrics.level10.imbalance - imbalanceMetrics.level5.imbalance) > 10 ? (
                <span className="text-orange-400">중간 리스크</span>
              ) : (
                <span className="text-green-400">낮은 리스크</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}