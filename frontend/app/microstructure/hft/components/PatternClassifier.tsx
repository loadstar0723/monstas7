'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface HFTPattern {
  timestamp: number
  type: string
  confidence: number
  volume: number
  impact: string
}

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

interface PatternClassifierProps {
  patterns: HFTPattern[]
  trades: TradeData[]
}

export default function PatternClassifier({ patterns, trades }: PatternClassifierProps) {
  // 패턴별 통계
  const patternStats = useMemo(() => {
    const stats: Record<string, { count: number; volume: number; avgConfidence: number; color: string }> = {
      market_making: { count: 0, volume: 0, avgConfidence: 0, color: '#3B82F6' },
      arbitrage: { count: 0, volume: 0, avgConfidence: 0, color: '#10B981' },
      momentum: { count: 0, volume: 0, avgConfidence: 0, color: '#F59E0B' },
      scalping: { count: 0, volume: 0, avgConfidence: 0, color: '#8B5CF6' },
      spoofing: { count: 0, volume: 0, avgConfidence: 0, color: '#EF4444' }
    }
    
    patterns.forEach(pattern => {
      if (stats[pattern.type]) {
        stats[pattern.type].count++
        stats[pattern.type].volume += pattern.volume
        stats[pattern.type].avgConfidence += pattern.confidence
      }
    })
    
    // 평균 신뢰도 계산
    Object.keys(stats).forEach(type => {
      if (stats[type].count > 0) {
        stats[type].avgConfidence = stats[type].avgConfidence / stats[type].count
      }
    })
    
    return stats
  }, [patterns])
  
  // 파이 차트 데이터
  const pieData = useMemo(() => {
    return Object.entries(patternStats)
      .filter(([_, stat]) => stat.count > 0)
      .map(([type, stat]) => ({
        name: type.replace('_', ' ').toUpperCase(),
        value: stat.count,
        color: stat.color
      }))
  }, [patternStats])
  
  // 바 차트 데이터
  const barData = useMemo(() => {
    return Object.entries(patternStats)
      .map(([type, stat]) => ({
        pattern: type.replace('_', ' '),
        count: stat.count,
        confidence: stat.avgConfidence,
        volume: stat.volume / 1000000 // M 단위
      }))
  }, [patternStats])
  
  // 최근 패턴 분석
  const recentPatterns = useMemo(() => {
    return patterns.slice(0, 10).map(p => ({
      ...p,
      timeAgo: Math.floor((Date.now() - p.timestamp) / 1000)
    }))
  }, [patterns])
  
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'market_making': return '⚖️'
      case 'arbitrage': return '🔄'
      case 'momentum': return '📈'
      case 'scalping': return '⚡'
      case 'spoofing': return '🎭'
      default: return '❓'
    }
  }
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">🎯 패턴 분류 분석</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 패턴 분포 파이 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">패턴 분포</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* 패턴별 지표 바 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">패턴별 신뢰도</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="pattern" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Bar dataKey="confidence" fill="#8B5CF6" name="신뢰도 %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 패턴별 상세 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Object.entries(patternStats).map(([type, stat]) => (
          <div key={type} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPatternIcon(type)}</span>
                <h4 className="text-sm font-semibold text-white">
                  {type.replace('_', ' ').toUpperCase()}
                </h4>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">감지 횟수</span>
                <span className="text-white font-medium">{stat.count}회</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">평균 신뢰도</span>
                <span className="text-purple-400 font-medium">{stat.avgConfidence.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">거래량</span>
                <span className="text-blue-400 font-medium">{(stat.volume / 1000000).toFixed(2)}M</span>
              </div>
            </div>
            
            {/* 신뢰도 바 */}
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${stat.avgConfidence}%`,
                  backgroundColor: stat.color 
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* 최근 감지 패턴 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">🕐 최근 감지 패턴</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {recentPatterns.map((pattern, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors">
              <span className="text-xl">{getPatternIcon(pattern.type)}</span>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {pattern.type.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-gray-400 text-xs">
                  {pattern.timeAgo < 60 ? `${pattern.timeAgo}초 전` : `${Math.floor(pattern.timeAgo / 60)}분 전`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-sm font-medium">{pattern.confidence.toFixed(1)}%</p>
                <p className={`text-xs ${getImpactColor(pattern.impact)}`}>
                  {pattern.impact.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}