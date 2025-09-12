'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaWallet, FaArrowUp, FaArrowDown, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface Order {
  id: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  filled: number
  status: 'open' | 'filled' | 'cancelled'
  time: string
}

interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
}

export default function PositionMonitor({ selectedCoin }: Props) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [position, setPosition] = useState<Position>({
    symbol: selectedCoin.symbol,
    quantity: 0,
    avgPrice: 0,
    currentPrice: 50000,
    pnl: 0,
    pnlPercentage: 0
  })
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    filledOrders: 0,
    cancelledOrders: 0,
    fillRate: 0
  })
  const [inventoryHistory, setInventoryHistory] = useState<{ time: string; inventory: number }[]>([])

  useEffect(() => {
    // 실시간 주문 및 포지션 시뮬레이션
    simulateOrders()
    const interval = setInterval(updateOrders, 3000)
    return () => clearInterval(interval)
  }, [selectedCoin.symbol])

  const simulateOrders = () => {
    // 가상 주문 생성
    const mockOrders: Order[] = [
      {
        id: 'MM001',
        side: 'buy',
        price: 49950,
        quantity: 0.1,
        filled: 0.1,
        status: 'filled',
        time: new Date(Date.now() - 300000).toLocaleTimeString('ko-KR')
      },
      {
        id: 'MM002',
        side: 'sell',
        price: 50050,
        quantity: 0.1,
        filled: 0.05,
        status: 'open',
        time: new Date(Date.now() - 180000).toLocaleTimeString('ko-KR')
      },
      {
        id: 'MM003',
        side: 'buy',
        price: 49920,
        quantity: 0.15,
        filled: 0,
        status: 'open',
        time: new Date(Date.now() - 60000).toLocaleTimeString('ko-KR')
      },
      {
        id: 'MM004',
        side: 'sell',
        price: 50080,
        quantity: 0.15,
        filled: 0,
        status: 'open',
        time: new Date(Date.now() - 30000).toLocaleTimeString('ko-KR')
      }
    ]
    setActiveOrders(mockOrders)

    // 포지션 계산
    const buyOrders = mockOrders.filter(o => o.side === 'buy' && o.filled > 0)
    const sellOrders = mockOrders.filter(o => o.side === 'sell' && o.filled > 0)
    
    const totalBought = buyOrders.reduce((sum, o) => sum + o.filled, 0)
    const totalSold = sellOrders.reduce((sum, o) => sum + o.filled, 0)
    const netPosition = totalBought - totalSold
    
    const avgBuyPrice = buyOrders.length > 0 
      ? buyOrders.reduce((sum, o) => sum + o.price * o.filled, 0) / totalBought
      : 0
      
    const currentPrice = 50000
    const pnl = netPosition * (currentPrice - avgBuyPrice)
    const pnlPercentage = avgBuyPrice > 0 ? (pnl / (avgBuyPrice * Math.abs(netPosition))) * 100 : 0

    setPosition({
      symbol: selectedCoin.symbol,
      quantity: netPosition,
      avgPrice: avgBuyPrice,
      currentPrice,
      pnl,
      pnlPercentage
    })

    // 주문 통계
    const filled = mockOrders.filter(o => o.status === 'filled').length
    const cancelled = mockOrders.filter(o => o.status === 'cancelled').length
    const total = mockOrders.length
    
    setOrderStats({
      totalOrders: total,
      filledOrders: filled,
      cancelledOrders: cancelled,
      fillRate: total > 0 ? (filled / total) * 100 : 0
    })

    // 재고 히스토리
    const history = []
    for (let i = 10; i >= 0; i--) {
      history.push({
        time: new Date(Date.now() - i * 60000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        inventory: netPosition + (((Date.now() % 1000) / 1000) - 0.5) * 0.05
      })
    }
    setInventoryHistory(history)
  }

  const updateOrders = () => {
    // 주문 상태 업데이트 시뮬레이션
    setActiveOrders(prev => prev.map(order => {
      if (order.status === 'open' && ((Date.now() % 1000) / 1000) > 0.7) {
        return {
          ...order,
          filled: Math.min(order.quantity, order.filled + ((Date.now() % 1000) / 1000) * 0.05),
          status: order.filled >= order.quantity * 0.9 ? 'filled' : 'open'
        }
      }
      return order
    }))
  }

  const formatPrice = (price: number) => {
    return price >= 10000 ? safePrice(price, 0) : safePrice(price, 2)
  }

  const pieData = [
    { name: '체결', value: orderStats.filledOrders, color: '#10B981' },
    { name: '대기', value: orderStats.totalOrders - orderStats.filledOrders - orderStats.cancelledOrders, color: '#F59E0B' },
    { name: '취소', value: orderStats.cancelledOrders, color: '#EF4444' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaWallet className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">포지션 모니터</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} 실시간 포지션 추적</p>
        </div>
      </div>
      
      {/* 현재 포지션 - 모바일 최적화 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">현재 포지션</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">순 포지션</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              position.quantity > 0 ? 'text-green-400' : 
              position.quantity < 0 ? 'text-red-400' : 'text-white'
            }`}>
              {position.quantity > 0 && '+'}{safeAmount(position.quantity)} {selectedCoin.symbol}
            </p>
          </div>
          
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">평균 가격</p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              ${formatPrice(position.avgPrice)}
            </p>
          </div>
          
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">손익</p>
            <div className={`text-lg sm:text-2xl font-bold ${
              position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span className="flex items-center gap-1">
                {position.pnl >= 0 ? <FaArrowUp className="text-sm" /> : <FaArrowDown className="text-sm" />}
                ${Math.abs(position.pnl).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">수익률</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              position.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {position.pnlPercentage >= 0 ? '+' : ''}{safeFixed(position.pnlPercentage, 2)}%
            </p>
          </div>
        </div>

        {/* 재고 경고 - 모바일 반응형 */}
        {Math.abs(position.quantity) > 0.3 && (
          <div className="mt-4 bg-yellow-600/20 rounded-lg p-3 border border-yellow-600/30">
            <p className="text-xs sm:text-sm text-yellow-400 flex items-start sm:items-center gap-2">
              <FaExclamationTriangle className="mt-0.5 sm:mt-0 flex-shrink-0" />
              <span>재고가 {position.quantity > 0 ? '매수' : '매도'} 쪽으로 편향되어 있습니다. 포지션 조정을 고려하세요.</span>
            </p>
          </div>
        )}
      </div>

      {/* 활성 주문 - 모바일 스크롤 테이블 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">활성 주문</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2 sm:px-3">ID</th>
                <th className="text-center py-2 px-2 sm:px-3">구분</th>
                <th className="text-right py-2 px-2 sm:px-3">가격</th>
                <th className="text-right py-2 px-2 sm:px-3">수량</th>
                <th className="text-right py-2 px-2 sm:px-3">체결</th>
                <th className="text-center py-2 px-2 sm:px-3">상태</th>
                <th className="text-right py-2 px-2 sm:px-3 hidden sm:table-cell">시간</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-700/50">
                  <td className="py-2 px-2 sm:px-3 text-gray-300">{order.id}</td>
                  <td className="text-center py-2 px-2 sm:px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      order.side === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                    }`}>
                      {order.side === 'buy' ? '매수' : '매도'}
                    </span>
                  </td>
                  <td className="text-right py-2 px-2 sm:px-3 text-gray-300">${formatPrice(order.price)}</td>
                  <td className="text-right py-2 px-2 sm:px-3 text-gray-300">{safeAmount(order.quantity)}</td>
                  <td className="text-right py-2 px-2 sm:px-3 text-gray-300">
                    {safeFixed(order.filled, 3)}
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div 
                        className="bg-purple-500 h-1 rounded-full transition-all"
                        style={{ width: `${(order.filled / order.quantity) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="text-center py-2 px-2 sm:px-3">
                    {order.status === 'filled' && <FaCheckCircle className="text-green-400 mx-auto" />}
                    {order.status === 'open' && <FaClock className="text-yellow-400 mx-auto" />}
                    {order.status === 'cancelled' && <span className="text-red-400">×</span>}
                  </td>
                  <td className="text-right py-2 px-2 sm:px-3 text-gray-400 text-xs hidden sm:table-cell">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 주문 통계 - 모바일 2열 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 주문 상태 차트 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">주문 상태</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
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
          <div className="mt-4 space-y-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-gray-400">{item.value}개</span>
              </div>
            ))}
          </div>
        </div>

        {/* 재고 변화 차트 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">재고 변화</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Bar 
                  dataKey="inventory" 
                  fill={(data: any) => data.inventory >= 0 ? '#10B981' : '#EF4444'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 전략 추천 - 모바일 최적화 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">포지션 관리 전략</h3>
        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
          <p>• 현재 체결률: <span className="text-green-400 font-semibold">{safeFixed(orderStats.fillRate, 1)}%</span></p>
          <p>• 호가 조정 권장: {position.quantity > 0.1 ? '매도 호가를 낮춰 재고 균형 맞추기' : position.quantity < -0.1 ? '매수 호가를 높여 재고 균형 맞추기' : '현재 전략 유지'}</p>
          <p>• 리스크 경고: 재고 편향도 {(Math.abs(position.quantity) / 0.5 * 100).toFixed(0)}%</p>
          <p>• 추천 주문 크기: 현재 포지션의 {position.quantity > 0.2 ? '50%' : '100%'} 수준</p>
        </div>
      </div>
    </div>
  )
}