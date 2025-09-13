'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, RadialBarChart, RadialBar, ComposedChart, 
  Treemap, Sankey
} from 'recharts'
import WebSocketManager from '@/lib/websocketManager'

interface LiquidationData {
  price: number
  amount: number
  leverageRatio: number
  timestamp: number
  side: 'long' | 'short'
  symbol: string
  exchange: string
  cascade: boolean
  severity: 'low' | 'medium' | 'high' | 'extreme'
}

interface LiquidationLevel {
  price: number
  cumulativeAmount: number
  longAmount: number
  shortAmount: number
  density: number
  riskScore: number
}

interface CascadeEvent {
  id: string
  startTime: number
  endTime: number
  triggerPrice: number
  totalLiquidated: number
  maxLeverage: number
  affectedSymbols: string[]
  phases: number
}

interface LeverageDistribution {
  range: string
  count: number
  amount: number
  percentage: number
  riskLevel: string
}

export default function LiquidationChartModule() {
  // 상태 관리
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  
  // 데이터 상태
  const [liquidationData, setLiquidationData] = useState<LiquidationData[]>([])
  const [liquidationLevels, setLiquidationLevels] = useState<LiquidationLevel[]>([])
  const [cascadeEvents, setCascadeEvents] = useState<CascadeEvent[]>([])
  const [leverageDistribution, setLeverageDistribution] = useState<LeverageDistribution[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [realtimeStats, setRealtimeStats] = useState({
    totalLiquidations24h: 0,
    longLiquidations: 0,
    shortLiquidations: 0,
    totalValue: 0,
    topLiquidation: 0,
    cascadeCount: 0,
    averageLeverage: 0,
    riskLevel: 'low' as string
  })

  // WebSocket 관리
  const wsRef = useRef<WebSocket | null>(null)
  const wsManager = WebSocketManager.getInstance()

  // 코인 목록
  const symbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 
    'SOLUSDT', 'DOGEUSDT', 'MATICUSDT', 'AVAXUSDT', 'DOTUSDT'
  ]

  // 시간대 옵션
  const timeframes = [
    { value: '1m', label: '1분' },
    { value: '5m', label: '5분' },
    { value: '15m', label: '15분' },
    { value: '1h', label: '1시간' },
    { value: '4h', label: '4시간' },
    { value: '1d', label: '1일' }
  ]

  // 탭 정의
  const tabs = [
    { id: 'overview', name: '개요', icon: '📊' },
    { id: 'heatmap', name: '히트맵', icon: '🔥' },
    { id: 'cascade', name: '연쇄청산', icon: '⛓️' },
    { id: 'leverage', name: '레버리지', icon: '📈' },
    { id: 'history', name: '히스토리', icon: '📜' },
    { id: 'strategy', name: '전략', icon: '🎯' }
  ]

  // WebSocket 연결 및 데이터 로드
  useEffect(() => {
    connectWebSocket()
    loadHistoricalData()
    
    return () => {
      disconnectWebSocket()
    }
  }, [selectedSymbol, selectedTimeframe])

  const connectWebSocket = () => {
    disconnectWebSocket()
    
    const wsKey = `liquidation-${selectedSymbol}`
    const wsUrl = `wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@forceOrder`
    
    wsManager.connect(
      wsKey,
      wsUrl,
      handleWebSocketMessage,
      handleWebSocketError,
      () => {
        setConnected(true)
        console.log('청산 데이터 WebSocket 연결됨')
      },
      () => {
        setConnected(false)
        console.log('청산 데이터 WebSocket 연결 해제됨')
      }
    )
  }

  const disconnectWebSocket = () => {
    const wsKey = `liquidation-${selectedSymbol}`
    wsManager.disconnect(wsKey)
  }

  const handleWebSocketMessage = (data: any) => {
    try {
      // Binance Force Order 데이터 처리
      if (data.e === 'forceOrder') {
        const liquidation: LiquidationData = {
          price: parseFloat(data.o.p),
          amount: parseFloat(data.o.q),
          leverageRatio: 0, // Binance에서 직접 제공하지 않음
          timestamp: data.o.T,
          side: data.o.S === 'SELL' ? 'long' : 'short',
          symbol: data.o.s,
          exchange: 'Binance',
          cascade: false,
          severity: calculateSeverity(parseFloat(data.o.q))
        }
        
        setLiquidationData(prev => [...prev.slice(-999), liquidation])
        updateRealtimeStats(liquidation)
        checkCascadeEvent(liquidation)
      }
    } catch (error) {
      console.error('청산 데이터 처리 에러:', error)
    }
  }

  const handleWebSocketError = (error: Event) => {
    console.error('청산 WebSocket 에러:', error)
    setConnected(false)
  }

  const calculateSeverity = (amount: number): 'low' | 'medium' | 'high' | 'extreme' => {
    if (amount > 1000000) return 'extreme'
    if (amount > 100000) return 'high'
    if (amount > 10000) return 'medium'
    return 'low'
  }

  const updateRealtimeStats = (liquidation: LiquidationData) => {
    setRealtimeStats(prev => ({
      ...prev,
      totalLiquidations24h: prev.totalLiquidations24h + 1,
      longLiquidations: liquidation.side === 'long' ? prev.longLiquidations + 1 : prev.longLiquidations,
      shortLiquidations: liquidation.side === 'short' ? prev.shortLiquidations + 1 : prev.shortLiquidations,
      totalValue: prev.totalValue + liquidation.amount,
      topLiquidation: Math.max(prev.topLiquidation, liquidation.amount)
    }))
  }

  const checkCascadeEvent = (liquidation: LiquidationData) => {
    // 연쇄청산 감지 로직
    const recentLiquidations = liquidationData.filter(
      l => l.timestamp > Date.now() - 60000 && Math.abs(l.price - liquidation.price) < liquidation.price * 0.01
    )
    
    if (recentLiquidations.length > 5) {
      const cascadeId = `cascade-${Date.now()}`
      const newCascade: CascadeEvent = {
        id: cascadeId,
        startTime: Math.min(...recentLiquidations.map(l => l.timestamp)),
        endTime: Date.now(),
        triggerPrice: liquidation.price,
        totalLiquidated: recentLiquidations.reduce((sum, l) => sum + l.amount, 0),
        maxLeverage: 20, // 추정값
        affectedSymbols: [selectedSymbol],
        phases: 1
      }
      
      setCascadeEvents(prev => [...prev.slice(-49), newCascade])
    }
  }

  const loadHistoricalData = async () => {
    setLoading(true)
    try {
      // 실제 환경에서는 청산 데이터 API 호출
      await generateLiquidationLevels()
      await generateLeverageDistribution()
      await generateHeatmapData()
      await generateHistoricalData()
      
      setLoading(false)
    } catch (error) {
      console.error('히스토리 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const generateLiquidationLevels = async () => {
    // 현재 가격 기준으로 청산 레벨 계산
    const currentPrice = 43000 // 실제로는 API에서 가져와야 함
    const levels: LiquidationLevel[] = []
    
    for (let i = -10; i <= 10; i++) {
      const priceLevel = currentPrice * (1 + i * 0.01)
      const longAmount = Math.abs(i) * 1000000 * (i < 0 ? 1 : 0.3)
      const shortAmount = Math.abs(i) * 800000 * (i > 0 ? 1 : 0.3)
      
      levels.push({
        price: priceLevel,
        cumulativeAmount: longAmount + shortAmount,
        longAmount,
        shortAmount,
        density: Math.abs(i) * 10,
        riskScore: Math.min(Math.abs(i) * 10, 100)
      })
    }
    
    setLiquidationLevels(levels.sort((a, b) => a.price - b.price))
  }

  const generateLeverageDistribution = async () => {
    const distribution: LeverageDistribution[] = [
      { range: '2-5x', count: 1250, amount: 45000000, percentage: 35, riskLevel: 'low' },
      { range: '5-10x', count: 890, amount: 38000000, percentage: 28, riskLevel: 'medium' },
      { range: '10-20x', count: 654, amount: 29000000, percentage: 22, riskLevel: 'high' },
      { range: '20-50x', count: 432, amount: 15000000, percentage: 12, riskLevel: 'extreme' },
      { range: '50x+', count: 89, amount: 3000000, percentage: 3, riskLevel: 'extreme' }
    ]
    
    setLeverageDistribution(distribution)
  }

  const generateHeatmapData = async () => {
    // 히트맵 데이터 생성 (가격대별 청산 밀도)
    const heatmap = []
    const currentPrice = 43000
    
    for (let priceOffset = -1000; priceOffset <= 1000; priceOffset += 50) {
      for (let timeOffset = 0; timeOffset < 24; timeOffset++) {
        heatmap.push({
          price: currentPrice + priceOffset,
          time: timeOffset,
          intensity: Math.random() * 100,
          amount: Math.random() * 5000000,
          count: Math.floor(Math.random() * 50)
        })
      }
    }
    
    setHeatmapData(heatmap)
  }

  const generateHistoricalData = async () => {
    // 히스토리 데이터 생성
    const history = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      history.unshift({
        date: date.toISOString().split('T')[0],
        totalLiquidations: Math.floor(Math.random() * 1000) + 500,
        longLiquidations: Math.floor(Math.random() * 500) + 200,
        shortLiquidations: Math.floor(Math.random() * 500) + 200,
        totalValue: Math.floor(Math.random() * 100000000) + 50000000,
        cascadeEvents: Math.floor(Math.random() * 5),
        averageLeverage: Math.random() * 20 + 5
      })
    }
    
    setHistoricalData(history)
  }

  // 차트 컴포넌트들
  const LiquidationLevelsChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">💥 청산 레벨 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={liquidationLevels}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="price" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => `$${safeThousand(value)}K`}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'longAmount' ? `$${safeMillion(value)}M` : 
              name === 'shortAmount' ? `$${safeMillion(value)}M` : value,
              name === 'longAmount' ? '롱 청산' : 
              name === 'shortAmount' ? '숏 청산' : name
            ]}
          />
          <Bar dataKey="longAmount" fill="#EF4444" name="longAmount" />
          <Bar dataKey="shortAmount" fill="#10B981" name="shortAmount" />
          <Line type="monotone" dataKey="density" stroke="#F59E0B" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )

  const LiquidationHeatmap = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">🔥 청산 히트맵</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={heatmapData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => `${value}시`}
          />
          <YAxis 
            dataKey="price" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => `$${safeThousand(value)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'amount' ? `$${safeMillion(value)}M` : value,
              name === 'amount' ? '청산금액' : name
            ]}
          />
          <Scatter dataKey="amount" fill="#8B5CF6">
            {heatmapData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.intensity > 80 ? '#DC2626' :
                  entry.intensity > 60 ? '#F59E0B' :
                  entry.intensity > 40 ? '#EAB308' :
                  entry.intensity > 20 ? '#22D3EE' :
                  '#6B7280'
                }
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )

  const CascadeAnalysisChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">⛓️ 연쇄청산 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={cascadeEvents}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="startTime"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'totalLiquidated' ? `$${safeMillion(value)}M` : value,
              name === 'totalLiquidated' ? '총 청산액' : 
              name === 'maxLeverage' ? '최대 레버리지' : name
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="totalLiquidated" 
            stroke="#DC2626" 
            fill="#DC2626" 
            fillOpacity={0.3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  const LeverageDistributionChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">📈 레버리지 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={leverageDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="percentage"
            nameKey="range"
          >
            {leverageDistribution.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.riskLevel === 'extreme' ? '#DC2626' :
                  entry.riskLevel === 'high' ? '#F59E0B' :
                  entry.riskLevel === 'medium' ? '#EAB308' :
                  '#10B981'
                }
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [`${value}%`, '비율']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  const HistoricalTrendsChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">📜 청산 히스토리</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historicalData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'totalValue' ? `$${safeMillion(value)}M` : value,
              name === 'totalLiquidations' ? '총 청산' : 
              name === 'longLiquidations' ? '롱 청산' : 
              name === 'shortLiquidations' ? '숏 청산' : 
              name === 'totalValue' ? '총 금액' : name
            ]}
          />
          <Line type="monotone" dataKey="totalLiquidations" stroke="#8B5CF6" strokeWidth={2} />
          <Line type="monotone" dataKey="longLiquidations" stroke="#EF4444" strokeWidth={2} />
          <Line type="monotone" dataKey="shortLiquidations" stroke="#10B981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const RealTimeStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">24시간 청산</p>
            <p className="text-2xl font-bold text-white">{realtimeStats.totalLiquidations24h.toLocaleString()}</p>
          </div>
          <div className="text-3xl">💥</div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">총 청산액</p>
            <p className="text-2xl font-bold text-white">${safeMillion(realtimeStats.totalValue)}M</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">최대 청산</p>
            <p className="text-2xl font-bold text-white">${safeMillion(realtimeStats.topLiquidation)}M</p>
          </div>
          <div className="text-3xl">🔥</div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">연쇄청산</p>
            <p className="text-2xl font-bold text-white">{realtimeStats.cascadeCount}</p>
          </div>
          <div className="text-3xl">⛓️</div>
        </div>
      </div>
    </div>
  )

  const LongShortRatioChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">⚖️ 롱/숏 청산 비율</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[
          { name: '롱 청산', value: (realtimeStats.longLiquidations / (realtimeStats.longLiquidations + realtimeStats.shortLiquidations)) * 100, fill: '#EF4444' },
          { name: '숏 청산', value: (realtimeStats.shortLiquidations / (realtimeStats.longLiquidations + realtimeStats.shortLiquidations)) * 100, fill: '#10B981' }
        ]}>
          <RadialBar dataKey="value" fill="#8884d8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${safeFixed(value, 1)}%`, '비율']}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )

  const VolumeFlowChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">🌊 청산 볼륨 플로우</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={liquidationData.slice(-50)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`$${safeMillion(value)}M`, '청산액']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#8B5CF6" 
            fill="#8B5CF6" 
            fillOpacity={0.3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  const PriceImpactChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">📊 가격 영향 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={liquidationData.slice(-20)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'price' ? `$${safePrice(value)}` : `$${safeMillion(value)}M`,
              name === 'price' ? '가격' : '청산액'
            ]}
          />
          <Line type="monotone" dataKey="price" stroke="#F59E0B" strokeWidth={2} />
          <Bar dataKey="amount" fill="#8B5CF6" opacity={0.6} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )

  const RiskMatrixChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">⚠️ 리스크 매트릭스</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={leverageDistribution.map(item => ({
            ...item,
            size: item.amount,
            fill: item.riskLevel === 'extreme' ? '#DC2626' :
                  item.riskLevel === 'high' ? '#F59E0B' :
                  item.riskLevel === 'medium' ? '#EAB308' :
                  '#10B981'
          }))}
          dataKey="size"
          ratio={4/3}
          stroke="#374151"
          fill="#8884d8"
        />
      </ResponsiveContainer>
    </div>
  )

  const LiquidationFrequencyChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">⏰ 청산 빈도 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={Array.from({length: 24}, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 100) + 20,
          amount: Math.floor(Math.random() * 10000000) + 1000000
        }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="hour"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => `${value}시`}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'amount' ? `$${safeMillion(value)}M` : value,
              name === 'count' ? '청산 횟수' : '청산액'
            ]}
          />
          <Bar dataKey="count" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const ExchangeComparisonChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">🏪 거래소별 청산 비교</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[
              { name: 'Binance', value: 45, fill: '#F59E0B' },
              { name: 'OKX', value: 25, fill: '#8B5CF6' },
              { name: 'Bybit', value: 20, fill: '#10B981' },
              { name: 'Bitget', value: 10, fill: '#EF4444' }
            ]}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value}%`, '비율']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  const LeverageRiskChart = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">⚡ 레버리지 리스크 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={leverageDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="range"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'amount' ? `$${safeMillion(value)}M` : value,
              name === 'count' ? '사용자 수' : 
              name === 'amount' ? '총 금액' : name
            ]}
          />
          <Bar dataKey="count" fill="#60A5FA" />
          <Line type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )

  // 전략 분석 컴포넌트
  const StrategyAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-700/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4">🎯 청산 기반 트레이딩 전략</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-400">1. 청산 레벨 회피 전략</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>주요 청산 레벨 5% 이상 떨어진 곳에 손절 설정</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>레버리지는 15배 이하로 제한</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>청산 히트맵에서 고밀도 구간 회피</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-400">2. 연쇄청산 대응 전략</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>대량 청산 발생 시 즉시 손절</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>연쇄청산 시작 시 포지션 축소</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>안전 구간에서 재진입 기회 포착</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-700/30">
          <h4 className="text-lg font-semibold text-red-400 mb-2">⚠️ 위험 경고</h4>
          <p className="text-gray-300">
            현재 {selectedSymbol}의 청산 리스크 레벨: <span className="text-red-400 font-bold">{realtimeStats.riskLevel.toUpperCase()}</span>
          </p>
          <p className="text-gray-300 mt-2">
            고레버리지 포지션은 시장 변동성 증가 시 연쇄청산 위험이 높습니다.
          </p>
        </div>
      </div>
    </div>
  )

  // 탭 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <RealTimeStatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidationLevelsChart />
              <LongShortRatioChart />
              <VolumeFlowChart />
              <PriceImpactChart />
            </div>
          </div>
        )
      
      case 'heatmap':
        return (
          <div className="space-y-6">
            <LiquidationHeatmap />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidationFrequencyChart />
              <RiskMatrixChart />
            </div>
          </div>
        )
      
      case 'cascade':
        return (
          <div className="space-y-6">
            <CascadeAnalysisChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExchangeComparisonChart />
              <PriceImpactChart />
            </div>
          </div>
        )
      
      case 'leverage':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeverageDistributionChart />
              <LeverageRiskChart />
            </div>
            <RiskMatrixChart />
          </div>
        )
      
      case 'history':
        return (
          <div className="space-y-6">
            <HistoricalTrendsChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidationFrequencyChart />
              <ExchangeComparisonChart />
            </div>
          </div>
        )
      
      case 'strategy':
        return <StrategyAnalysis />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <span>홈</span>
          <span>/</span>
          <span>기술적 분석</span>
          <span>/</span>
          <span className="text-white">청산 차트 (오비추어리)</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">💀 청산 차트 모듈</h1>
            <p className="text-gray-400">실시간 청산 데이터 분석 및 리스크 관리</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {connected ? '실시간 연결' : '연결 해제'}
            </span>
          </div>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">코인 선택</label>
              <select 
                value={selectedSymbol} 
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">시간대</label>
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">청산 데이터 로딩 중...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  )
}