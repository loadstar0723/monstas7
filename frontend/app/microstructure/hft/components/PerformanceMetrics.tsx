'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface HFTPattern {
  timestamp: number
  type: string
  confidence: number
  impact: string
}

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

interface PerformanceMetricsProps {
  patterns: HFTPattern[]
  trades: TradeData[]
}

export default function PerformanceMetrics({ patterns, trades }: PerformanceMetricsProps) {
  // 패턴 탐지 성능 지표
  const detectionMetrics = useMemo(() => {
    const totalPatterns = patterns.length
    const highConfidencePatterns = patterns.filter(p => p.confidence > 80).length
    const highImpactPatterns = patterns.filter(p => p.impact === 'high').length
    
    const patternTypes = patterns.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const avgConfidence = totalPatterns > 0
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / totalPatterns
      : 0
    
    return {
      totalPatterns,
      highConfidencePatterns,
      highImpactPatterns,
      avgConfidence,
      patternTypes,
      detectionRate: totalPatterns > 0 ? (highConfidencePatterns / totalPatterns * 100) : 0
    }
  }, [patterns])
  
  // 시간대별 성능 추이
  const performanceTrend = useMemo(() => {
    const now = Date.now()
    const slots = 12
    const slotDuration = 300000 // 5분
    
    return Array(slots).fill(0).map((_, i) => {
      const slotStart = now - (slots - i) * slotDuration
      const slotEnd = slotStart + slotDuration
      const slotPatterns = patterns.filter(p => p.timestamp >= slotStart && p.timestamp < slotEnd)
      const slotTrades = trades.filter(t => t.time >= slotStart && t.time < slotEnd)
      
      return {
        time: new Date(slotStart).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        patterns: slotPatterns.length,
        confidence: slotPatterns.length > 0
          ? slotPatterns.reduce((sum, p) => sum + p.confidence, 0) / slotPatterns.length
          : 0,
        trades: slotTrades.length,
        accuracy: slotPatterns.filter(p => p.confidence > 70).length / Math.max(slotPatterns.length, 1) * 100
      }
    })
  }, [patterns, trades])
  
  // 시스템 상태 지표
  const systemStatus = useMemo(() => {
    const recentPatterns = patterns.filter(p => Date.now() - p.timestamp < 60000)
    const recentTrades = trades.filter(t => Date.now() - t.time < 60000)
    
    const processingSpeed = recentTrades.length // 분당 처리 거래 수
    const responseTime = recentPatterns.length > 0 ? 50 : 0 // ms (시뮬레이션)
    const uptime = 99.9 // % (시뮬레이션)
    const cpuUsage = Math.min(processingSpeed / 10, 90) // % (시뮬레이션)
    
    return {
      processingSpeed,
      responseTime,
      uptime,
      cpuUsage,
      status: cpuUsage > 80 ? 'overload' : cpuUsage > 50 ? 'busy' : 'normal'
    }
  }, [patterns, trades])
  
  // 패턴별 정확도
  const patternAccuracy = useMemo(() => {
    const types = ['market_making', 'arbitrage', 'momentum', 'scalping', 'spoofing']
    
    return types.map(type => {
      const typePatterns = patterns.filter(p => p.type === type)
      const highConfidence = typePatterns.filter(p => p.confidence > 70).length
      
      return {
        type: type.replace('_', ' '),
        accuracy: typePatterns.length > 0 ? (highConfidence / typePatterns.length * 100) : 0,
        count: typePatterns.length
      }
    })
  }, [patterns])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overload': return 'text-red-400'
      case 'busy': return 'text-yellow-400'
      case 'normal': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">⚡ 성능 지표</h2>
      
      {/* 주요 성능 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">패턴 탐지</p>
          <p className="text-2xl font-bold text-white">{detectionMetrics.totalPatterns}</p>
          <p className="text-xs text-gray-500">총 감지</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${detectionMetrics.detectionRate}%` }}
              />
            </div>
            <span className="text-xs text-purple-400">{safeFixed(detectionMetrics.detectionRate, 0)}%</span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">평균 신뢰도</p>
          <p className="text-2xl font-bold text-white">{safeFixed(detectionMetrics.avgConfidence, 1)}%</p>
          <p className="text-xs text-gray-500">정확도</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs ${detectionMetrics.avgConfidence > 70 ? 'text-green-400' : detectionMetrics.avgConfidence > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {detectionMetrics.avgConfidence > 70 ? '높음' : detectionMetrics.avgConfidence > 50 ? '보통' : '낮음'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">처리 속도</p>
          <p className="text-2xl font-bold text-white">{systemStatus.processingSpeed}</p>
          <p className="text-xs text-gray-500">거래/분</p>
          <div className="mt-2">
            <span className={`text-xs ${getStatusColor(systemStatus.status)}`}>
              {systemStatus.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">응답 시간</p>
          <p className="text-2xl font-bold text-white">{systemStatus.responseTime}</p>
          <p className="text-xs text-gray-500">ms</p>
          <div className="mt-2">
            <span className="text-xs text-green-400">
              실시간
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 성능 추이 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">탐지 성능 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Line 
                type="monotone" 
                dataKey="patterns" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="패턴 수"
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={2}
                name="정확도 %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* 패턴별 정확도 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">패턴별 정확도</h3>
          <div className="space-y-3">
            {patternAccuracy.map((pattern, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 capitalize">{pattern.type}</span>
                <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      pattern.accuracy > 70 ? 'bg-green-600' :
                      pattern.accuracy > 50 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${pattern.accuracy}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-xs text-white/80">
                      {safeFixed(pattern.accuracy, 0)}% ({pattern.count}건)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 시스템 상태 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">시스템 상태</span>
          <span className={`text-sm font-medium ${getStatusColor(systemStatus.status)}`}>
            ● {systemStatus.status.toUpperCase()}
          </span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">CPU 사용률</span>
          <span className={`text-sm font-medium ${systemStatus.cpuUsage > 80 ? 'text-red-400' : systemStatus.cpuUsage > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
            {safeFixed(systemStatus.cpuUsage, 0)}%
          </span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">가동 시간</span>
          <span className="text-sm font-medium text-green-400">
            {systemStatus.uptime}%
          </span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">고신뢰 패턴</span>
          <span className="text-sm font-medium text-purple-400">
            {detectionMetrics.highConfidencePatterns}개
          </span>
        </div>
      </div>
      
      {/* 성능 요약 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20">
        <h3 className="text-purple-400 font-semibold mb-2">📊 성능 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div>• 총 {detectionMetrics.totalPatterns}개 패턴 감지 (신뢰도 {safeFixed(detectionMetrics.avgConfidence, 1)}%)</div>
          <div>• 분당 {systemStatus.processingSpeed}건 거래 처리</div>
          <div>• 고영향 패턴 {detectionMetrics.highImpactPatterns}개 감지</div>
          <div>• 시스템 응답 시간 {systemStatus.responseTime}ms</div>
        </div>
      </div>
    </div>
  )
}