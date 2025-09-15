'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTachometerAlt, FaExclamationCircle, FaChartLine, FaShieldAlt } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis, Legend
} from 'recharts'

interface Props {
  riskMetrics: any
  positions: any[]
}

export default function RealTimeRiskMonitor({ riskMetrics, positions }: Props) {
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  const [riskAlerts, setRiskAlerts] = useState<any[]>([])
  const [heartbeat, setHeartbeat] = useState(0)

  useEffect(() => {
    // 실시간 리스크 데이터 시뮬레이션
    const interval = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        totalRisk: riskMetrics.totalRisk + (Math.random() - 0.5) * 5,
        marketRisk: riskMetrics.marketRisk + (Math.random() - 0.5) * 3,
        liquidityRisk: riskMetrics.liquidityRisk + (Math.random() - 0.5) * 2,
        var95: riskMetrics.var95 + (Math.random() - 0.5) * 1,
        heartbeat: heartbeat + 1
      }

      setRealtimeData(prev => {
        const updated = [...prev, newDataPoint]
        return updated.slice(-50) // 최근 50개 데이터만 유지
      })

      // 리스크 알림 체크
      if (newDataPoint.totalRisk > 75) {
        setRiskAlerts(prev => [{
          id: Date.now(),
          type: 'critical',
          message: `위험 리스크 레벨 도달: ${newDataPoint.totalRisk.toFixed(1)}`,
          time: new Date()
        }, ...prev].slice(0, 5))
      }

      setHeartbeat(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [riskMetrics, heartbeat])

  // 리스크 카테고리별 데이터
  const riskCategories = [
    { name: '시장 리스크', value: riskMetrics.marketRisk, fill: '#3B82F6', max: 100 },
    { name: '유동성 리스크', value: riskMetrics.liquidityRisk, fill: '#10B981', max: 100 },
    { name: '운영 리스크', value: riskMetrics.operationalRisk, fill: '#F59E0B', max: 100 },
    { name: '신용 리스크', value: riskMetrics.creditRisk, fill: '#EF4444', max: 100 }
  ]

  // 포지션별 리스크
  const positionRisks = positions.map(pos => ({
    symbol: pos.symbol,
    risk: pos.risk,
    exposure: (pos.size * pos.currentPrice * pos.leverage).toFixed(0),
    var: (pos.size * pos.currentPrice * 0.05 * pos.leverage).toFixed(0)
  }))

  // 리스크 게이지 데이터
  const gaugeData = [{
    name: 'Total Risk',
    value: riskMetrics.totalRisk,
    fill: riskMetrics.totalRisk > 70 ? '#EF4444' : 
          riskMetrics.totalRisk > 50 ? '#F59E0B' : '#10B981'
  }]

  return (
    <div className="space-y-6">
      {/* 실시간 모니터링 대시보드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 리스크 게이지 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaTachometerAlt className="text-red-400" />
            리스크 레벨
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="90%" 
              data={gaugeData}
              startAngle={180} 
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                fill={gaugeData[0].fill}
              />
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-3xl font-bold fill-white"
              >
                {riskMetrics.totalRisk.toFixed(0)}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">안전 구간</span>
              <span className="text-green-400">0-40</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">주의 구간</span>
              <span className="text-yellow-400">40-70</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">위험 구간</span>
              <span className="text-red-400">70-100</span>
            </div>
          </div>
        </div>

        {/* 실시간 리스크 차트 */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            실시간 리스크 추이
            <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${heartbeat % 2 === 0 ? 'bg-green-400' : 'bg-green-600'}`}></span>
              LIVE
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="totalRiskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Area 
                type="monotone" 
                dataKey="totalRisk" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#totalRiskGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 리스크 카테고리별 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 리스크 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">리스크 구성</h3>
          <div className="space-y-4">
            {riskCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{category.name}</span>
                  <span className="text-white font-semibold">{category.value.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.value}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: category.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 포지션별 리스크 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">포지션 리스크</h3>
          <div className="space-y-3">
            {positionRisks.map((pos, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{pos.symbol}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    pos.risk > 15 ? 'bg-red-500/20 text-red-400' :
                    pos.risk > 10 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    리스크: {pos.risk}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">노출금액:</span>
                    <span className="text-white ml-2">${pos.exposure}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">VaR:</span>
                    <span className="text-orange-400 ml-2">${pos.var}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실시간 알림 */}
      {riskAlerts.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaExclamationCircle className="text-yellow-400" />
            최근 리스크 알림
          </h3>
          <div className="space-y-2">
            {riskAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${
                  alert.type === 'critical' 
                    ? 'bg-red-900/20 border-red-500/50' 
                    : 'bg-yellow-900/20 border-yellow-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {alert.time.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 리스크 지표 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FaShieldAlt className="text-blue-400" />
            <span className="text-xs text-gray-400">VaR (95%)</span>
          </div>
          <div className="text-2xl font-bold text-white">{riskMetrics.var95.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">일일 최대 손실</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FaShieldAlt className="text-red-400" />
            <span className="text-xs text-gray-400">CVaR (95%)</span>
          </div>
          <div className="text-2xl font-bold text-white">{riskMetrics.cvar95.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">조건부 손실</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-yellow-400" />
            <span className="text-xs text-gray-400">최대 손실</span>
          </div>
          <div className="text-2xl font-bold text-white">{riskMetrics.maxDrawdown.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">역사적 최대</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-purple-400" />
            <span className="text-xs text-gray-400">샤프 비율</span>
          </div>
          <div className="text-2xl font-bold text-white">{riskMetrics.sharpeRatio.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">위험조정수익</div>
        </div>
      </div>
    </div>
  )
}