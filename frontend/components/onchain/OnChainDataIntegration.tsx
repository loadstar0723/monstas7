'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEthereum, FaBitcoin, FaWallet, FaExchangeAlt, FaChartBar, FaFire } from 'react-icons/fa'
import { GiBreakingChain, GiMiner, GiWhale } from 'react-icons/gi'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart, Scatter
} from 'recharts'

interface OnChainMetrics {
  symbol: string
  network: 'ethereum' | 'bitcoin' | 'bsc' | 'polygon'
  metrics: {
    // 네트워크 활동
    activeAddresses: number
    newAddresses: number
    transactions: number
    transactionVolume: number
    avgTransactionSize: number
    
    // 거래소 흐름
    exchangeInflow: number
    exchangeOutflow: number
    exchangeNetFlow: number
    exchangeBalance: number
    
    // 채굴자/검증자
    minerRevenue: number
    hashRate: number
    difficulty: number
    blockTime: number
    
    // 스마트 머니
    whaleTransactions: number
    whaleAccumulation: number
    retailActivity: number
    
    // DeFi 메트릭 (이더리움 기반)
    tvl?: number
    defiUsers?: number
    gasPrice?: number
    burnedFees?: number
    
    // 공급 메트릭
    circulatingSupply: number
    stakedSupply?: number
    lockedSupply?: number
  }
  timestamp: number
}

interface AddressCluster {
  type: 'whale' | 'exchange' | 'miner' | 'retail' | 'smart'
  count: number
  balance: number
  activity: number
  trend: 'accumulating' | 'distributing' | 'holding'
}

interface NetworkHealth {
  score: number // 0-100
  factors: {
    decentralization: number
    security: number
    activity: number
    growth: number
  }
  alerts: string[]
}

interface Props {
  symbols: string[]
  onMetricAlert?: (alert: any) => void
  includeDefi?: boolean
}

export default function OnChainDataIntegration({
  symbols = ['BTC', 'ETH', 'BNB'],
  onMetricAlert,
  includeDefi = true
}: Props) {
  const [onchainData, setOnchainData] = useState<Record<string, OnChainMetrics>>({})
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [addressClusters, setAddressClusters] = useState<AddressCluster[]>([])
  const [networkHealth, setNetworkHealth] = useState<Record<string, NetworkHealth>>({})
  const [selectedMetric, setSelectedMetric] = useState<'activity' | 'flow' | 'supply' | 'defi'>('activity')
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h')
  const [alerts, setAlerts] = useState<string[]>([])

  // 온체인 데이터 가져오기
  useEffect(() => {
    const fetchOnchainData = async () => {
      try {
        // 실제로는 Glassnode, CryptoQuant, Etherscan 등의 API 사용
        // 여기서는 시뮬레이션 데이터
        const mockData = generateMockOnchainData(symbols)
        setOnchainData(mockData)
        
        // 히스토리컬 데이터
        const historical = generateHistoricalData(symbols, timeframe)
        setHistoricalData(historical)
        
        // 주소 클러스터 분석
        const clusters = analyzeAddressClusters(mockData)
        setAddressClusters(clusters)
        
        // 네트워크 건강도
        const health = calculateNetworkHealth(mockData)
        setNetworkHealth(health)
        
        // 알림 체크
        checkForAlerts(mockData)
      } catch (error) {
        console.error('Error fetching onchain data:', error)
      }
    }

    fetchOnchainData()
    const interval = setInterval(fetchOnchainData, 30000) // 30초마다 업데이트

    return () => clearInterval(interval)
  }, [symbols, timeframe])

  // 모의 온체인 데이터 생성
  const generateMockOnchainData = (symbols: string[]): Record<string, OnChainMetrics> => {
    const data: Record<string, OnChainMetrics> = {}
    
    symbols.forEach(symbol => {
      const baseMetrics = {
        activeAddresses: Math.floor(Math.random() * 1000000) + 100000,
        newAddresses: Math.floor(Math.random() * 50000) + 5000,
        transactions: Math.floor(Math.random() * 2000000) + 500000,
        transactionVolume: Math.random() * 10000000000 + 1000000000,
        avgTransactionSize: Math.random() * 10000 + 1000,
        
        exchangeInflow: Math.random() * 100000000,
        exchangeOutflow: Math.random() * 100000000,
        exchangeNetFlow: 0, // 계산될 것
        exchangeBalance: Math.random() * 5000000000,
        
        minerRevenue: Math.random() * 100000000,
        hashRate: Math.random() * 300 + 100, // EH/s
        difficulty: Math.random() * 30 + 20, // T
        blockTime: 600 + Math.random() * 60 - 30, // 초
        
        whaleTransactions: Math.floor(Math.random() * 1000) + 100,
        whaleAccumulation: (Math.random() - 0.5) * 100000,
        retailActivity: Math.random() * 100,
        
        circulatingSupply: 19000000 + Math.random() * 500000,
      }
      
      baseMetrics.exchangeNetFlow = baseMetrics.exchangeOutflow - baseMetrics.exchangeInflow
      
      // 이더리움 기반 토큰은 DeFi 메트릭 추가
      if (['ETH', 'BNB', 'MATIC'].includes(symbol)) {
        Object.assign(baseMetrics, {
          tvl: Math.random() * 100000000000,
          defiUsers: Math.floor(Math.random() * 1000000) + 100000,
          gasPrice: Math.random() * 200 + 20,
          burnedFees: Math.random() * 10000,
          stakedSupply: Math.random() * 10000000
        })
      }
      
      data[symbol] = {
        symbol,
        network: getNetwork(symbol),
        metrics: baseMetrics,
        timestamp: Date.now()
      }
    })
    
    return data
  }

  // 네트워크 결정
  const getNetwork = (symbol: string): OnChainMetrics['network'] => {
    const networks: Record<string, OnChainMetrics['network']> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'bsc',
      'MATIC': 'polygon'
    }
    return networks[symbol] || 'ethereum'
  }

  // 히스토리컬 데이터 생성
  const generateHistoricalData = (symbols: string[], timeframe: string) => {
    const periods = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30
    const data = []
    
    for (let i = 0; i < periods; i++) {
      const point: any = {
        time: timeframe === '24h' 
          ? `${i}:00`
          : new Date(Date.now() - (periods - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
      }
      
      symbols.forEach(symbol => {
        point[`${symbol}_activity`] = Math.random() * 1000000 + 500000
        point[`${symbol}_flow`] = (Math.random() - 0.5) * 100000000
        point[`${symbol}_whale`] = Math.random() * 1000 + 100
      })
      
      data.push(point)
    }
    
    return data
  }

  // 주소 클러스터 분석
  const analyzeAddressClusters = (data: Record<string, OnChainMetrics>): AddressCluster[] => {
    return [
      {
        type: 'whale',
        count: Math.floor(Math.random() * 5000) + 1000,
        balance: Math.random() * 10000000,
        activity: Math.random() * 100,
        trend: Math.random() > 0.5 ? 'accumulating' : 'distributing'
      },
      {
        type: 'exchange',
        count: Math.floor(Math.random() * 100) + 20,
        balance: Math.random() * 50000000,
        activity: Math.random() * 100,
        trend: 'holding'
      },
      {
        type: 'miner',
        count: Math.floor(Math.random() * 10000) + 1000,
        balance: Math.random() * 1000000,
        activity: Math.random() * 100,
        trend: Math.random() > 0.7 ? 'distributing' : 'holding'
      },
      {
        type: 'retail',
        count: Math.floor(Math.random() * 1000000) + 100000,
        balance: Math.random() * 100000,
        activity: Math.random() * 100,
        trend: 'accumulating'
      },
      {
        type: 'smart',
        count: Math.floor(Math.random() * 1000) + 100,
        balance: Math.random() * 5000000,
        activity: Math.random() * 100,
        trend: 'accumulating'
      }
    ]
  }

  // 네트워크 건강도 계산
  const calculateNetworkHealth = (data: Record<string, OnChainMetrics>): Record<string, NetworkHealth> => {
    const health: Record<string, NetworkHealth> = {}
    
    Object.entries(data).forEach(([symbol, metrics]) => {
      const decentralization = Math.min(100, metrics.metrics.activeAddresses / 10000)
      const security = Math.min(100, metrics.metrics.hashRate)
      const activity = Math.min(100, metrics.metrics.transactions / 10000)
      const growth = Math.min(100, metrics.metrics.newAddresses / 500)
      
      const score = (decentralization + security + activity + growth) / 4
      
      const alerts = []
      if (metrics.metrics.exchangeNetFlow < -100000000) {
        alerts.push('대규모 거래소 유출 감지')
      }
      if (metrics.metrics.whaleAccumulation > 50000) {
        alerts.push('고래 대량 매집 중')
      }
      if (activity < 30) {
        alerts.push('네트워크 활동 저조')
      }
      
      health[symbol] = {
        score,
        factors: {
          decentralization,
          security,
          activity,
          growth
        },
        alerts
      }
    })
    
    return health
  }

  // 알림 체크
  const checkForAlerts = (data: Record<string, OnChainMetrics>) => {
    const newAlerts: string[] = []
    
    Object.entries(data).forEach(([symbol, metrics]) => {
      if (metrics.metrics.exchangeNetFlow < -100000000) {
        newAlerts.push(`🚨 ${symbol}: 대규모 거래소 유출 ${(metrics.metrics.exchangeNetFlow / 1000000).toFixed(1)}M`)
      }
      if (metrics.metrics.whaleTransactions > 800) {
        newAlerts.push(`🐋 ${symbol}: 고래 활동 급증 (${metrics.metrics.whaleTransactions} 건)`)
      }
      if (metrics.metrics.newAddresses > 40000) {
        newAlerts.push(`📈 ${symbol}: 신규 주소 급증 (${metrics.metrics.newAddresses.toLocaleString()})`)
      }
    })
    
    setAlerts(newAlerts)
    
    if (onMetricAlert && newAlerts.length > 0) {
      newAlerts.forEach(alert => onMetricAlert({ message: alert, timestamp: Date.now() }))
    }
  }

  // 색상 팔레트
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-6 rounded-lg border border-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <GiBreakingChain className="text-indigo-400" />
            온체인 데이터 분석
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="activity">네트워크 활동</option>
              <option value="flow">거래소 흐름</option>
              <option value="supply">공급 분석</option>
              {includeDefi && <option value="defi">DeFi 메트릭</option>}
            </select>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="24h">24시간</option>
              <option value="7d">7일</option>
              <option value="30d">30일</option>
            </select>
          </div>
        </div>

        {/* 실시간 알림 */}
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={`${alert}-${index}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2 p-3 bg-indigo-500/20 border border-indigo-500/50 rounded-lg"
            >
              <span className="text-white text-sm">{alert}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 네트워크 건강도 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(networkHealth).map(([symbol, health]) => (
          <motion.div
            key={symbol}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                {symbol === 'BTC' && <FaBitcoin className="text-orange-500" />}
                {symbol === 'ETH' && <FaEthereum className="text-blue-500" />}
                {symbol}
              </h4>
              <div className={`text-2xl font-bold ${
                health.score > 70 ? 'text-green-400' :
                health.score > 40 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {health.score.toFixed(0)}
              </div>
            </div>
            
            <div className="space-y-2">
              {Object.entries(health.factors).map(([factor, value]) => (
                <div key={factor} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm capitalize">{factor}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300">{value.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            {health.alerts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                {health.alerts.map((alert, i) => (
                  <div key={i} className="text-xs text-yellow-400 mb-1">⚠️ {alert}</div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 선택된 메트릭 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">
          {selectedMetric === 'activity' && '네트워크 활동 추이'}
          {selectedMetric === 'flow' && '거래소 순 흐름'}
          {selectedMetric === 'supply' && '공급량 분포'}
          {selectedMetric === 'defi' && 'DeFi 활동 지표'}
        </h4>
        
        <ResponsiveContainer width="100%" height={300}>
          {selectedMetric === 'activity' && (
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Legend />
              {symbols.map((symbol, index) => (
                <Line
                  key={symbol}
                  type="monotone"
                  dataKey={`${symbol}_activity`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={`${symbol} 활동`}
                />
              ))}
            </LineChart>
          )}
          
          {selectedMetric === 'flow' && (
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Legend />
              {symbols.map((symbol, index) => (
                <Bar
                  key={symbol}
                  dataKey={`${symbol}_flow`}
                  fill={COLORS[index % COLORS.length]}
                  name={`${symbol} 순흐름`}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 주소 클러스터 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaWallet className="text-purple-400" />
            주소 클러스터 분포
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={addressClusters}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${(count / 1000).toFixed(0)}K`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {addressClusters.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <GiWhale className="text-blue-400" />
            클러스터별 활동
          </h4>
          <div className="space-y-3">
            {addressClusters.map((cluster, index) => (
              <div key={cluster.type} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-white font-semibold capitalize">{cluster.type}</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    cluster.trend === 'accumulating' ? 'bg-green-500/20 text-green-400' :
                    cluster.trend === 'distributing' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {cluster.trend}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">주소 수</span>
                    <div className="text-white font-semibold">{cluster.count.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">보유량</span>
                    <div className="text-white font-semibold">{(cluster.balance / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <span className="text-gray-400">활동도</span>
                    <div className="text-white font-semibold">{cluster.activity.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 메트릭 테이블 */}
      <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
        <h4 className="text-lg font-bold text-white mb-4">상세 온체인 메트릭</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left p-2">메트릭</th>
              {symbols.map(symbol => (
                <th key={symbol} className="text-right p-2">{symbol}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700/50">
              <td className="p-2 text-gray-300">활성 주소</td>
              {symbols.map(symbol => (
                <td key={symbol} className="text-right p-2 text-white">
                  {onchainData[symbol]?.metrics.activeAddresses.toLocaleString() || '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-700/50">
              <td className="p-2 text-gray-300">거래량 (24h)</td>
              {symbols.map(symbol => (
                <td key={symbol} className="text-right p-2 text-white">
                  ${(onchainData[symbol]?.metrics.transactionVolume / 1000000000).toFixed(2) || '-'}B
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-700/50">
              <td className="p-2 text-gray-300">거래소 순흐름</td>
              {symbols.map(symbol => {
                const netFlow = onchainData[symbol]?.metrics.exchangeNetFlow || 0
                return (
                  <td key={symbol} className={`text-right p-2 font-semibold ${
                    netFlow > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {netFlow > 0 ? '+' : ''}{(netFlow / 1000000).toFixed(1)}M
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-gray-700/50">
              <td className="p-2 text-gray-300">고래 거래</td>
              {symbols.map(symbol => (
                <td key={symbol} className="text-right p-2 text-white">
                  {onchainData[symbol]?.metrics.whaleTransactions || '-'}
                </td>
              ))}
            </tr>
            {includeDefi && (
              <tr className="border-b border-gray-700/50">
                <td className="p-2 text-gray-300">TVL</td>
                {symbols.map(symbol => (
                  <td key={symbol} className="text-right p-2 text-white">
                    {onchainData[symbol]?.metrics.tvl 
                      ? `$${(onchainData[symbol].metrics.tvl! / 1000000000).toFixed(2)}B`
                      : '-'}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}