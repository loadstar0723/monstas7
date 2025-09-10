'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

interface VolumeProfileProps {
  trades: TradeData[]
  currentPrice: number
}

export default function VolumeProfile({ trades, currentPrice }: VolumeProfileProps) {
  // 가격대별 거래량 프로파일
  const volumeProfile = useMemo(() => {
    if (trades.length === 0) return []
    
    const prices = trades.map(t => t.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const levels = 30
    
    const profile = Array(levels).fill(0).map((_, i) => {
      const levelMin = minPrice + (priceRange / levels) * i
      const levelMax = minPrice + (priceRange / levels) * (i + 1)
      const levelTrades = trades.filter(t => t.price >= levelMin && t.price < levelMax)
      
      const buyVolume = levelTrades.filter(t => !t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
      const sellVolume = levelTrades.filter(t => t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
      const totalVolume = buyVolume + sellVolume
      
      return {
        price: (levelMin + levelMax) / 2,
        priceRange: `$${levelMin.toFixed(2)}-${levelMax.toFixed(2)}`,
        buyVolume,
        sellVolume,
        totalVolume,
        dominance: totalVolume > 0 ? (buyVolume / totalVolume * 100) : 50,
        poc: false // Point of Control
      }
    })
    
    // POC (Point of Control) 찾기
    const maxVolume = Math.max(...profile.map(p => p.totalVolume))
    profile.forEach(p => {
      if (p.totalVolume === maxVolume) p.poc = true
    })
    
    return profile
  }, [trades])
  
  // 시간대별 거래량 추이
  const volumeTrend = useMemo(() => {
    const now = Date.now()
    const slots = 24
    const slotDuration = 60000 // 1분
    
    return Array(slots).fill(0).map((_, i) => {
      const slotStart = now - (slots - i) * slotDuration
      const slotEnd = slotStart + slotDuration
      const slotTrades = trades.filter(t => t.time >= slotStart && t.time < slotEnd)
      
      const buyVolume = slotTrades.filter(t => !t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
      const sellVolume = slotTrades.filter(t => t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
      
      return {
        time: new Date(slotStart).toLocaleTimeString('ko-KR', { minute: '2-digit', second: '2-digit' }),
        buyVolume,
        sellVolume,
        totalVolume: buyVolume + sellVolume
      }
    })
  }, [trades])
  
  // VWAP 계산
  const vwap = useMemo(() => {
    if (trades.length === 0) return currentPrice
    
    const sumPriceVolume = trades.reduce((sum, t) => sum + (t.price * t.quantity), 0)
    const sumVolume = trades.reduce((sum, t) => sum + t.quantity, 0)
    
    return sumVolume > 0 ? sumPriceVolume / sumVolume : currentPrice
  }, [trades, currentPrice])
  
  // 거래량 가중 통계
  const volumeStats = useMemo(() => {
    const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0)
    const buyVolume = trades.filter(t => !t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
    const sellVolume = trades.filter(t => t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
    
    const avgTradeSize = totalVolume / Math.max(trades.length, 1)
    const largeTrades = trades.filter(t => t.quantity > avgTradeSize * 2)
    
    return {
      totalVolume,
      buyVolume,
      sellVolume,
      buyRatio: totalVolume > 0 ? (buyVolume / totalVolume * 100) : 50,
      avgTradeSize,
      largeTradesCount: largeTrades.length,
      largeTradesVolume: largeTrades.reduce((sum, t) => sum + t.quantity, 0)
    }
  }, [trades])
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">📊 거래량 프로파일 분석</h2>
      
      {/* 주요 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">VWAP</p>
          <p className="text-lg font-bold text-white">${vwap.toFixed(2)}</p>
          <p className="text-xs text-gray-500">
            {vwap > currentPrice ? (
              <span className="text-red-400">현재가 -${(vwap - currentPrice).toFixed(2)}</span>
            ) : (
              <span className="text-green-400">현재가 +${(currentPrice - vwap).toFixed(2)}</span>
            )}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">총 거래량</p>
          <p className="text-lg font-bold text-white">
            {(volumeStats.totalVolume / 1000).toFixed(2)}K
          </p>
          <p className="text-xs text-gray-500">최근 {trades.length}건</p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">매수/매도 비율</p>
          <p className={`text-lg font-bold ${volumeStats.buyRatio > 50 ? 'text-green-400' : 'text-red-400'}`}>
            {volumeStats.buyRatio.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            {volumeStats.buyRatio > 50 ? '매수 우세' : '매도 우세'}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">대량 거래</p>
          <p className="text-lg font-bold text-purple-400">{volumeStats.largeTradesCount}건</p>
          <p className="text-xs text-gray-500">
            {((volumeStats.largeTradesVolume / volumeStats.totalVolume) * 100).toFixed(1)}% 차지
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 가격대별 거래량 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">가격대별 거래량 분포</h3>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {volumeProfile.slice(0, 20).map((level, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-24 text-right">
                  ${level.price.toFixed(2)}
                </span>
                <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden relative">
                  <div className="absolute inset-0 flex">
                    <div 
                      className="bg-green-600/70 transition-all duration-300"
                      style={{ width: `${level.dominance}%` }}
                    />
                    <div 
                      className="bg-red-600/70 transition-all duration-300"
                      style={{ width: `${100 - level.dominance}%` }}
                    />
                  </div>
                  {level.poc && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-yellow-400 font-bold bg-black/50 px-1 rounded">POC</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-xs text-white/80">
                      {(level.totalVolume / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-gray-400">매수 거래량</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-gray-400">매도 거래량</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span className="text-gray-400">POC (최대 거래량 지점)</span>
            </div>
          </div>
        </div>
        
        {/* 시간대별 거래량 추이 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">시간대별 거래량 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Area 
                type="monotone" 
                dataKey="buyVolume" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="매수"
              />
              <Area 
                type="monotone" 
                dataKey="sellVolume" 
                stackId="1"
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.6}
                name="매도"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 거래량 인사이트 */}
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
        <h3 className="text-blue-400 font-semibold mb-2">💡 거래량 인사이트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div>
            • VWAP {vwap > currentPrice ? '위' : '아래'}에서 거래 중 ({vwap > currentPrice ? '약세' : '강세'} 신호)
          </div>
          <div>
            • 매수/매도 비율: {volumeStats.buyRatio.toFixed(1)}% ({volumeStats.buyRatio > 50 ? '매수 우세' : '매도 우세'})
          </div>
          <div>
            • 평균 거래 크기: {volumeStats.avgTradeSize.toFixed(3)} 단위
          </div>
          <div>
            • 대량 거래 비중: {((volumeStats.largeTradesVolume / volumeStats.totalVolume) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}