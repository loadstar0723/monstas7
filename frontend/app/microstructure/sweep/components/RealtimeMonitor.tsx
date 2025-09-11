'use client'

import React, { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface RealtimeMonitorProps {
  sweeps: SweepData[]
  currentPrice: number
  symbol?: string
}

export default function RealtimeMonitor({ 
  sweeps, 
  currentPrice,
  symbol = 'BTCUSDT'
}: RealtimeMonitorProps) {
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [minVolume, setMinVolume] = useState(0)
  
  // 심볼별 대량 주문 임계값
  const getThresholdForSymbol = (symbol: string) => {
    const thresholds: Record<string, number> = {
      'BTCUSDT': 10,
      'ETHUSDT': 100,
      'BNBUSDT': 200,
      'SOLUSDT': 500,
      'XRPUSDT': 50000,
      'ADAUSDT': 50000,
      'DOGEUSDT': 500000,
      'AVAXUSDT': 500,
      'MATICUSDT': 50000,
      'DOTUSDT': 1000
    }
    return thresholds[symbol] || 100
  }
  
  // 필터링된 스윕 데이터
  const filteredSweeps = React.useMemo(() => {
    return sweeps.filter(sweep => {
      if (filter !== 'all' && sweep.side !== filter) return false
      if (sweep.volume < minVolume) return false
      return true
    }).slice(-50).reverse() // 최근 50개만 표시
  }, [sweeps, filter, minVolume])
  
  // 실시간 통계
  const realtimeStats = React.useMemo(() => {
    const last5Min = Date.now() - 5 * 60 * 1000
    const recentSweeps = sweeps.filter(s => s.timestamp > last5Min)
    
    const buyCount = recentSweeps.filter(s => s.side === 'buy').length
    const sellCount = recentSweeps.filter(s => s.side === 'sell').length
    const totalVolume = recentSweeps.reduce((sum, s) => sum + s.volume, 0)
    const avgImpact = recentSweeps.length > 0 
      ? recentSweeps.reduce((sum, s) => sum + s.impact, 0) / recentSweeps.length 
      : 0
    
    return {
      buyCount,
      sellCount,
      totalCount: buyCount + sellCount,
      totalVolume,
      avgImpact,
      sweepsPerMinute: recentSweeps.length / 5
    }
  }, [sweeps])
  
  // 스윕 타입 색상
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'aggressive': return 'text-red-500'
      case 'stealth': return 'text-blue-500'
      case 'ladder': return 'text-green-500'
      case 'iceberg': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'aggressive': return '공격적'
      case 'stealth': return '스텔스'
      case 'ladder': return '래더'
      case 'iceberg': return '빙산'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* 실시간 대시보드 */}
      <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            실시간 모니터 - {symbol.replace('USDT', '')}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-500">실시간</span>
          </div>
        </div>
        
        {/* 실시간 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">5분 스윕</p>
            <p className="text-2xl font-bold text-white">{realtimeStats.totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {safeFixed(realtimeStats.sweepsPerMinute, 1)}/분
            </p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">매수/매도</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-green-400">{realtimeStats.buyCount}</span>
              <span className="text-gray-500">/</span>
              <span className="text-xl font-bold text-red-400">{realtimeStats.sellCount}</span>
            </div>
            <div className="w-full bg-gray-700 h-2 mt-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ 
                  width: `${realtimeStats.totalCount > 0 ? (realtimeStats.buyCount / realtimeStats.totalCount) * 100 : 50}%` 
                }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">5분 거래량</p>
            <p className="text-2xl font-bold text-yellow-400">
              {safeFixed(realtimeStats.totalVolume, 2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              영향도: {safeFixed(realtimeStats.avgImpact, 2)}%
            </p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">상태</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">활성</span>
                <span className="text-xs text-white font-medium">{sweeps.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">필터됨</span>
                <span className="text-xs text-white font-medium">{filteredSweeps.length}</span>
              </div>
            </div>
          </div>
        </div>
          
          {/* 필터 컨트롤 */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex gap-2">
              {[
                { value: 'all', label: '전체' },
                { value: 'buy', label: '매수' },
                { value: 'sell', label: '매도' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-200
                    ${
                      filter === f.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">최소 거래량</span>
              <input
                type="number"
                value={minVolume}
                onChange={(e) => setMinVolume(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-purple-500"
                min="0"
                step="0.1"
              />
            </div>
            
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`ml-auto px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                autoScroll
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              자동 스크롤 {autoScroll ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {/* 스윕 피드 */}
          <div className="bg-gray-800/30 rounded-lg p-4 h-96 overflow-y-auto" 
               id="sweep-feed">
            {filteredSweeps.length > 0 ? (
              <div className="space-y-2">
                {filteredSweeps.map((sweep, index) => (
                  <div 
                    key={`${sweep.timestamp}-${index}`}
                    className={`p-4 rounded-lg transition-all duration-300 ${
                      sweep.side === 'buy' 
                        ? 'bg-green-900/20 border border-green-800/30 hover:border-green-700/50' 
                        : 'bg-red-900/20 border border-red-800/30 hover:border-red-700/50'
                    } ${index === 0 ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className={`text-sm font-bold ${
                            sweep.side === 'buy' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sweep.side === 'buy' ? '매수' : '매도'}
                          </span>
                          <span className="text-white font-medium">
                            ${safePrice(sweep.price, 2)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(sweep.type)} bg-gray-800/50`}>
                            {getTypeBadge(sweep.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-gray-400">
                            거래량: <span className="text-white">{safeFixed(sweep.volume, 4)}</span>
                          </span>
                          <span className="text-gray-400">
                            영향도: <span className={`font-medium ${
                              sweep.impact > 3 ? 'text-red-400' : 
                              sweep.impact > 1 ? 'text-yellow-400' : 
                              'text-gray-300'
                            }`}>{safeFixed(sweep.impact, 2)}%</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(sweep.timestamp).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">스윕 대기 중</div>
                  <p className="text-xs text-gray-500">대량 주문 모니터링 중...</p>
                </div>
              </div>
            )}
          </div>
      </div>
      
      {/* 실시간 알림 설정 */}
      <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
        <h4 className="text-lg font-bold text-white mb-4">알림 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500" />
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
              대량 스윕 알림 (&gt;{getThresholdForSymbol(symbol)} {symbol.replace('USDT', '')})
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500" />
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">고영향도 알림 (&gt;3%)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500" />
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">연속 스윕 알림 (5개+)</span>
          </label>
        </div>
      </div>
    </div>
  )
}