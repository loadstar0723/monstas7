'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap
} from 'recharts'

interface ImbalanceMetrics {
  ofi: number
  depthImbalance: number
  tickImbalance: number
  volumeImbalance: number
  spreadImbalance: number
}

interface ChartProps {
  data: any[]
  metrics?: ImbalanceMetrics
  selectedCoin?: string
}

// 임밸런스 레이더 차트
export function ImbalanceRadar({ metrics }: { metrics: ImbalanceMetrics }) {
  const radarData = [
    { metric: 'OFI', value: Math.abs(metrics.ofi) * 100, fullMark: 100 },
    { metric: '깊이', value: Math.min(metrics.depthImbalance, 100), fullMark: 100 },
    { metric: '틱', value: Math.abs(metrics.tickImbalance) * 100, fullMark: 100 },
    { metric: '거래량', value: Math.abs(metrics.volumeImbalance) * 100, fullMark: 100 },
    { metric: '스프레드', value: Math.abs(metrics.spreadImbalance) * 100, fullMark: 100 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
        <Radar 
          name="임밸런스 강도" 
          dataKey="value" 
          stroke="#8B5CF6" 
          fill="#8B5CF6" 
          fillOpacity={0.6} 
        />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// 거래 분포 파이 차트
export function TradeDistribution({ trades }: { trades: any[] }) {
  const buyVolume = trades.filter(t => !t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
  const sellVolume = trades.filter(t => t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
  
  const data = [
    { name: '매수', value: buyVolume, color: '#10B981' },
    { name: '매도', value: sellVolume, color: '#EF4444' }
  ]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// 3D 스타일 오더북 깊이 차트
export function DepthChart3D({ orderBook }: { orderBook: any }) {
  const data = useMemo(() => {
    if (!orderBook.bids || !orderBook.asks) return []
    
    const bids = orderBook.bids.map((b: any, i: number) => ({
      price: b.price,
      bidVolume: b.quantity,
      askVolume: 0,
      depth: i + 1,
      type: 'bid'
    }))
    
    const asks = orderBook.asks.map((a: any, i: number) => ({
      price: a.price,
      bidVolume: 0,
      askVolume: a.quantity,
      depth: i + 1,
      type: 'ask'
    }))
    
    return [...asks.reverse(), ...bids]
  }, [orderBook])

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="price" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="bidVolume" 
          stackId="1" 
          stroke="#10B981" 
          fill="#10B981" 
          fillOpacity={0.6}
          name="매수 주문"
        />
        <Area 
          type="monotone" 
          dataKey="askVolume" 
          stackId="1" 
          stroke="#EF4444" 
          fill="#EF4444" 
          fillOpacity={0.6}
          name="매도 주문"
        />
        <Bar dataKey="depth" fill="#8B5CF6" opacity={0.3} name="깊이" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// 버블 차트 - 거래 크기와 임팩트
export function TradeBubbleChart({ trades }: { trades: any[] }) {
  const data = trades.slice(0, 50).map((trade, idx) => ({
    x: idx,
    y: trade.price,
    z: trade.quantity * trade.price, // 거래 금액
    type: trade.isBuyerMaker ? 'sell' : 'buy'
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="x" name="시간" stroke="#9CA3AF" />
        <YAxis dataKey="y" name="가격" stroke="#9CA3AF" />
        <ZAxis dataKey="z" range={[50, 500]} name="거래량" />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
        />
        <Scatter 
          name="거래" 
          data={data} 
          fill="#8B5CF6"
          fillOpacity={0.6}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.type === 'buy' ? '#10B981' : '#EF4444'} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// 히트맵 스타일 임밸런스 매트릭스
export function ImbalanceHeatmap({ history }: { history: any[] }) {
  const data = history.slice(0, 20).map((item, idx) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    ofi: item.ofi,
    depth: item.depthImbalance,
    tick: item.tickImbalance,
    ratio: item.imbalanceRatio
  }))

  const getColor = (value: number) => {
    if (value > 0.3) return '#10B981'
    if (value > 0.1) return '#34D399'
    if (value > -0.1) return '#6B7280'
    if (value > -0.3) return '#F87171'
    return '#EF4444'
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-21 gap-1 text-xs">
        <div className="text-gray-400">OFI</div>
        {data.map((d, i) => (
          <div 
            key={i} 
            className="h-8 flex items-center justify-center rounded"
            style={{ backgroundColor: getColor(d.ofi) }}
            title={`OFI: ${safeFixed(d.ofi, 3)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-21 gap-1 text-xs">
        <div className="text-gray-400">깊이</div>
        {data.map((d, i) => (
          <div 
            key={i} 
            className="h-8 flex items-center justify-center rounded"
            style={{ backgroundColor: getColor(d.depth / 100) }}
            title={`깊이: ${safeFixed(d.depth, 0)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-21 gap-1 text-xs">
        <div className="text-gray-400">틱</div>
        {data.map((d, i) => (
          <div 
            key={i} 
            className="h-8 flex items-center justify-center rounded"
            style={{ backgroundColor: getColor(d.tick) }}
            title={`틱: ${safeFixed(d.tick, 3)}`}
          />
        ))}
      </div>
    </div>
  )
}

// 트리맵 - 오더북 구조 시각화
export function OrderBookTreemap({ orderBook }: { orderBook: any }) {
  const data = useMemo(() => {
    if (!orderBook.bids || !orderBook.asks) return []
    
    const bids = orderBook.bids.slice(0, 5).map((b: any, i: number) => ({
      name: `B${i+1}: $${b.price}`,
      size: b.quantity * b.price,
      fill: '#10B981'
    }))
    
    const asks = orderBook.asks.slice(0, 5).map((a: any, i: number) => ({
      name: `A${i+1}: $${a.price}`,
      size: a.quantity * a.price,
      fill: '#EF4444'
    }))
    
    return [...bids, ...asks]
  }, [orderBook])

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size } = props

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.fill,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 && width > 30 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {name}
          </text>
        )}
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8B5CF6"
        content={<CustomizedContent />}
      />
    </ResponsiveContainer>
  )
}

// 실시간 플로우 스트림 차트
export function FlowStreamChart({ history }: { history: any[] }) {
  const data = history.slice(0, 30).reverse().map((item, idx) => ({
    time: idx,
    buy: item.bidVolume,
    sell: -item.askVolume,
    net: item.bidVolume - item.askVolume
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="time" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="buy" 
          stackId="1" 
          stroke="#10B981" 
          fill="#10B981" 
          fillOpacity={0.6}
          name="매수량"
        />
        <Area 
          type="monotone" 
          dataKey="sell" 
          stackId="1" 
          stroke="#EF4444" 
          fill="#EF4444" 
          fillOpacity={0.6}
          name="매도량"
        />
        <Line 
          type="monotone" 
          dataKey="net" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          name="순 플로우"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}