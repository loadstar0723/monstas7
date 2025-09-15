'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaGlobeAmericas, FaExclamationTriangle, 
  FaNewspaper, FaBitcoin, FaDollarSign 
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, HeatmapGrid,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell
} from 'recharts'

interface MarketIndicator {
  name: string
  value: number
  change: number
  risk: 'low' | 'medium' | 'high'
  impact: number
}

export default function MarketRiskDashboard() {
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicator[]>([])
  const [volatilityData, setVolatilityData] = useState<any[]>([])
  const [correlationMatrix, setCorrelationMatrix] = useState<any[]>([])
  const [marketEvents, setMarketEvents] = useState<any[]>([])

  useEffect(() => {
    // 시장 지표 데이터 시뮬레이션
    const indicators: MarketIndicator[] = [
      {
        name: 'BTC Dominance',
        value: 48.5 + Math.random() * 2,
        change: (Math.random() - 0.5) * 5,
        risk: 'medium',
        impact: 85
      },
      {
        name: 'Fear & Greed Index',
        value: 35 + Math.random() * 30,
        change: (Math.random() - 0.5) * 10,
        risk: 'high',
        impact: 70
      },
      {
        name: 'VIX',
        value: 18 + Math.random() * 10,
        change: (Math.random() - 0.5) * 3,
        risk: 'medium',
        impact: 60
      },
      {
        name: 'DXY',
        value: 104 + Math.random() * 2,
        change: (Math.random() - 0.5) * 1,
        risk: 'low',
        impact: 50
      },
      {
        name: 'Open Interest',
        value: 12.5 + Math.random() * 3,
        change: (Math.random() - 0.5) * 8,
        risk: 'high',
        impact: 75
      },
      {
        name: 'Funding Rate',
        value: 0.01 + Math.random() * 0.03,
        change: (Math.random() - 0.5) * 0.02,
        risk: 'medium',
        impact: 65
      }
    ]
    setMarketIndicators(indicators)

    // 변동성 데이터 생성
    const volData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      btc: 60 + Math.random() * 30,
      eth: 70 + Math.random() * 35,
      market: 55 + Math.random() * 25
    }))
    setVolatilityData(volData)

    // 상관관계 매트릭스
    const assets = ['BTC', 'ETH', 'SOL', 'BNB', 'MATIC']
    const matrix = assets.map((asset1, i) => 
      assets.map((asset2, j) => ({
        x: asset1,
        y: asset2,
        value: i === j ? 1 : 0.5 + Math.random() * 0.4
      }))
    ).flat()
    setCorrelationMatrix(matrix)

    // 시장 이벤트
    const events = [
      {
        id: 1,
        type: 'macro',
        title: 'FOMC 회의 예정',
        date: '2024-01-31',
        impact: 'high',
        description: '금리 결정 발표 예정'
      },
      {
        id: 2,
        type: 'crypto',
        title: 'BTC 반감기 접근',
        date: '2024-04-15',
        impact: 'high',
        description: '비트코인 반감기 90일 전'
      },
      {
        id: 3,
        type: 'regulation',
        title: 'SEC 규제 발표',
        date: '2024-02-15',
        impact: 'medium',
        description: '암호화폐 규제 가이드라인'
      }
    ]
    setMarketEvents(events)
  }, [])

  // 리스크 레벨별 색상
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  // 영향도별 색상
  const getImpactColor = (impact: number) => {
    if (impact > 80) return '#EF4444'
    if (impact > 60) return '#F59E0B'
    if (impact > 40) return '#3B82F6'
    return '#10B981'
  }

  // 전체 시장 리스크 점수
  const overallMarketRisk = marketIndicators.reduce((sum, indicator) => 
    sum + (indicator.risk === 'high' ? 30 : indicator.risk === 'medium' ? 20 : 10), 0
  ) / marketIndicators.length

  return (
    <div className="space-y-6">
      {/* 시장 리스크 개요 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaGlobeAmericas className="text-blue-400" />
            글로벌 시장 리스크
          </h3>
          <div className={`px-4 py-2 rounded-lg ${
            overallMarketRisk > 20 ? 'bg-red-500/20 text-red-400' :
            overallMarketRisk > 15 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            <div className="text-xs">전체 리스크</div>
            <div className="text-xl font-bold">{overallMarketRisk.toFixed(0)}/30</div>
          </div>
        </div>

        {/* 주요 시장 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {marketIndicators.map((indicator, index) => (
            <motion.div
              key={indicator.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">{indicator.name}</div>
              <div className="text-lg font-bold text-white">
                {indicator.name === 'Funding Rate' 
                  ? `${(indicator.value * 100).toFixed(3)}%`
                  : indicator.value.toFixed(2)
                }
              </div>
              <div className={`text-sm flex items-center gap-1 ${
                indicator.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{indicator.change > 0 ? '▲' : '▼'}</span>
                <span>{Math.abs(indicator.change).toFixed(2)}</span>
              </div>
              <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${getRiskColor(indicator.risk)}`}>
                {indicator.risk}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 변동성 추이 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-yellow-400" />
            시장 변동성 추이
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volatilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Line type="monotone" dataKey="btc" stroke="#F59E0B" name="BTC" strokeWidth={2} />
              <Line type="monotone" dataKey="eth" stroke="#3B82F6" name="ETH" strokeWidth={2} />
              <Line type="monotone" dataKey="market" stroke="#10B981" name="Market" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 리스크 영향도 산점도 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">리스크-영향도 매트릭스</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="impact" 
                name="영향도" 
                stroke="#9CA3AF"
                domain={[0, 100]}
              />
              <YAxis 
                type="number" 
                dataKey="riskScore" 
                name="리스크" 
                stroke="#9CA3AF"
                domain={[0, 30]}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              />
              <Scatter 
                name="지표" 
                data={marketIndicators.map(ind => ({
                  ...ind,
                  riskScore: ind.risk === 'high' ? 25 : ind.risk === 'medium' ? 15 : 5
                }))}
                fill="#8884d8"
              >
                {marketIndicators.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getImpactColor(entry.impact)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시장 이벤트 캘린더 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaNewspaper className="text-purple-400" />
          주요 시장 이벤트
        </h3>
        <div className="space-y-3">
          {marketEvents.map((event) => (
            <div 
              key={event.id}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {event.type === 'crypto' && <FaBitcoin className="text-orange-400" />}
                    {event.type === 'macro' && <FaDollarSign className="text-green-400" />}
                    {event.type === 'regulation' && <FaExclamationTriangle className="text-red-400" />}
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {event.impact === 'high' ? '높음' : event.impact === 'medium' ? '중간' : '낮음'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{event.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-gray-500 text-xs">예정일</div>
                  <div className="text-white font-semibold">
                    {new Date(event.date).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 자산 상관관계 히트맵 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">자산 상관관계 (실시간)</h3>
        <div className="grid grid-cols-6 gap-1">
          <div></div>
          {['BTC', 'ETH', 'SOL', 'BNB', 'MATIC'].map(asset => (
            <div key={asset} className="text-center text-xs text-gray-400">{asset}</div>
          ))}
          
          {['BTC', 'ETH', 'SOL', 'BNB', 'MATIC'].map((asset1, i) => (
            <React.Fragment key={asset1}>
              <div className="text-right text-xs text-gray-400 pr-2">{asset1}</div>
              {['BTC', 'ETH', 'SOL', 'BNB', 'MATIC'].map((asset2, j) => {
                const correlation = correlationMatrix.find(
                  (item) => item.x === asset1 && item.y === asset2
                )?.value || 0
                const color = correlation > 0.8 ? 'bg-red-600' :
                             correlation > 0.6 ? 'bg-orange-600' :
                             correlation > 0.4 ? 'bg-yellow-600' : 'bg-green-600'
                
                return (
                  <div
                    key={`${asset1}-${asset2}`}
                    className={`aspect-square ${color} bg-opacity-50 rounded flex items-center justify-center text-xs text-white`}
                  >
                    {correlation.toFixed(2)}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-400">낮은 상관관계</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span className="text-gray-400">중간 상관관계</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-400">높은 상관관계</span>
          </div>
        </div>
      </div>
    </div>
  )
}