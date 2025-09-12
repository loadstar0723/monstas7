'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaCrosshairs, FaCoins, FaDollarSign, FaPercent, FaCalendarAlt } from 'react-icons/fa'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface DCASettings {
  interval: string
  amount: number
  startDate: string
  totalBudget: number
  stopLoss: number
  takeProfit: number
  strategy: string
}

interface Props {
  selectedCoin: CoinInfo
  settings: DCASettings
}

interface Position {
  date: string
  amount: number
  price: number
  coins: number
  value: number
}

export default function PositionTracker({ selectedCoin, settings }: Props) {
  const [positions, setPositions] = useState<Position[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCurrentPrice()
    generateSamplePositions()
  }, [selectedCoin.fullSymbol, settings])

  const loadCurrentPrice = async () => {
    try {
      const response = await fetch(`/api/binance/ticker?symbol=${selectedCoin.fullSymbol}`)
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        setCurrentPrice(parseFloat(data[0].lastPrice))
      }
      setLoading(false)
    } catch (error) {
      console.error('현재 가격 로드 실패:', error)
      setLoading(false)
    }
  }

  const generateSamplePositions = () => {
    // 실제로는 사용자의 DCA 기록을 불러와야 함
    // 여기서는 시뮬레이션을 위한 샘플 데이터 생성
    const samplePositions: Position[] = []
    const startDate = new Date(settings.startDate)
    const today = new Date()
    let currentDate = new Date(startDate)
    
    // 간격에 따른 포지션 생성
    while (currentDate <= today && samplePositions.length * settings.amount < settings.totalBudget) {
      // 시장 패턴 기반 가격 생성 (실제로는 과거 가격 데이터 사용)
      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      const marketTrend = Math.sin(daysSinceStart * 0.1) * 0.15 // 15% 트렌드 변동
      const volatility = Math.cos(daysSinceStart * 0.05) * 0.1 // 10% 변동성
      const seasonality = Math.sin(daysSinceStart * 0.02) * 0.05 // 5% 계절성
      const priceVariation = 1 + marketTrend + volatility + seasonality
      const price = currentPrice * Math.max(0.5, Math.min(1.5, priceVariation)) // 0.5-1.5 범위
      const coins = settings.amount / price

      samplePositions.push({
        date: currentDate.toISOString().split('T')[0],
        amount: settings.amount,
        price,
        coins,
        value: coins * currentPrice
      })

      // 다음 투자일 계산
      if (settings.interval === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (settings.interval === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    setPositions(samplePositions)
  }

  const calculateMetrics = () => {
    const totalInvested = positions.reduce((sum, p) => sum + p.amount, 0)
    const totalCoins = positions.reduce((sum, p) => sum + p.coins, 0)
    const avgBuyPrice = totalInvested / totalCoins || 0
    const currentValue = totalCoins * currentPrice
    const profitLoss = currentValue - totalInvested
    const profitLossPercent = (profitLoss / totalInvested) * 100 || 0

    return {
      totalInvested,
      totalCoins,
      avgBuyPrice,
      currentValue,
      profitLoss,
      profitLossPercent
    }
  }

  const metrics = calculateMetrics()

  // 포지션 분포 차트 데이터
  const positionDistribution = positions.map((p, index) => ({
    name: `포지션 ${index + 1}`,
    value: p.value,
    amount: p.amount,
    price: p.price
  }))

  // 가격 분포 히스토그램 데이터
  const priceRanges = [
    { range: '하위 25%', count: 0, avgPrice: 0, totalAmount: 0 },
    { range: '중하위', count: 0, avgPrice: 0, totalAmount: 0 },
    { range: '중상위', count: 0, avgPrice: 0, totalAmount: 0 },
    { range: '상위 25%', count: 0, avgPrice: 0, totalAmount: 0 }
  ]

  if (positions.length > 0) {
    const prices = positions.map(p => p.price).sort((a, b) => a - b)
    const q1 = prices[Math.floor(prices.length * 0.25)]
    const q2 = prices[Math.floor(prices.length * 0.5)]
    const q3 = prices[Math.floor(prices.length * 0.75)]

    positions.forEach(p => {
      let rangeIndex = 0
      if (p.price < q1) rangeIndex = 0
      else if (p.price < q2) rangeIndex = 1
      else if (p.price < q3) rangeIndex = 2
      else rangeIndex = 3

      priceRanges[rangeIndex].count++
      priceRanges[rangeIndex].avgPrice += p.price
      priceRanges[rangeIndex].totalAmount += p.amount
    })

    priceRanges.forEach(range => {
      if (range.count > 0) {
        range.avgPrice /= range.count
      }
    })
  }

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">포지션 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaCrosshairs className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">포지션 추적기</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 포지션 현황</p>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaDollarSign className="text-green-400" />
            <p className="text-xs sm:text-sm text-gray-400">총 투자금</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-white">
            ${metrics.totalInvested.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {positions.length}회 투자
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaCoins className="text-yellow-400" />
            <p className="text-xs sm:text-sm text-gray-400">보유 수량</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-white">
            {safeFixed(metrics.totalCoins, 6)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {selectedCoin.symbol}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaDollarSign className="text-blue-400" />
            <p className="text-xs sm:text-sm text-gray-400">평균 매수가</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-white">
            ${safeFixed(metrics.avgBuyPrice, 2)}
          </p>
          <p className={`text-xs mt-1 ${
            currentPrice > metrics.avgBuyPrice ? 'text-green-400' : 'text-red-400'
          }`}>
            현재가 대비 {((currentPrice - metrics.avgBuyPrice) / metrics.avgBuyPrice * 100).toFixed(2)}%
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaPercent className={metrics.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'} />
            <p className="text-xs sm:text-sm text-gray-400">수익률</p>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${
            metrics.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {metrics.profitLossPercent >= 0 ? '+' : ''}{safeFixed(metrics.profitLossPercent, 2)}%
          </p>
          <p className={`text-xs mt-1 ${
            metrics.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${safeFixed(metrics.profitLoss, 2)}
          </p>
        </div>
      </div>

      {/* 포지션 분포 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">포지션 가치 분포</h3>
          <div className="h-64">
            {positions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {positionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `$${safeFixed(value, 2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                포지션 데이터가 없습니다
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">현재 포트폴리오 가치</p>
            <p className="text-2xl font-bold text-purple-400">${metrics.currentValue.toLocaleString()}</p>
          </div>
        </div>

        {/* 가격대별 포지션 분포 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">가격대별 매수 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="range" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'count') return `${value}회`
                    if (name === 'totalAmount') return `$${safeFixed(value, 2)}`
                    return value
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" name="매수 횟수" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            낮은 가격에 더 많이 매수할수록 수익률이 개선됩니다
          </p>
        </div>
      </div>

      {/* 포지션 히스토리 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">최근 포지션 내역</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs sm:text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-2">날짜</th>
                <th className="pb-2">투자금</th>
                <th className="pb-2">매수가</th>
                <th className="pb-2">수량</th>
                <th className="pb-2">현재 가치</th>
                <th className="pb-2">수익률</th>
              </tr>
            </thead>
            <tbody>
              {positions.slice(-5).reverse().map((position, index) => {
                const profitLoss = (currentPrice - position.price) / position.price * 100
                return (
                  <tr key={index} className="text-xs sm:text-sm border-b border-gray-700/50">
                    <td className="py-3 text-gray-300">{position.date}</td>
                    <td className="py-3 text-white">${position.amount}</td>
                    <td className="py-3 text-white">${safePrice(position.price, 2)}</td>
                    <td className="py-3 text-white">{safeFixed(position.coins, 6)}</td>
                    <td className="py-3 text-purple-400">${safeFixed(position.value, 2)}</td>
                    <td className={`py-3 ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profitLoss >= 0 ? '+' : ''}{safeFixed(profitLoss, 2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {positions.length > 5 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            최근 5개 포지션만 표시됩니다
          </p>
        )}
      </div>

      {/* 포지션 요약 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">포지션 분석 요약</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">투자 현황</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              <li>• 첫 투자일: {positions[0]?.date || '-'}</li>
              <li>• 최근 투자일: {positions[positions.length - 1]?.date || '-'}</li>
              <li>• 투자 주기: {settings.interval === 'daily' ? '매일' : settings.interval === 'weekly' ? '매주' : '매월'}</li>
              <li>• 남은 예산: ${(settings.totalBudget - metrics.totalInvested).toLocaleString()}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-2">성과 분석</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              <li>• 최고 매수가: ${Math.max(...positions.map(p => p.price)).toFixed(2)}</li>
              <li>• 최저 매수가: ${Math.min(...positions.map(p => p.price)).toFixed(2)}</li>
              <li>• 손익분기점: ${safeFixed(metrics.avgBuyPrice, 2)}</li>
              <li>• 목표 수익률 도달: {metrics.profitLossPercent >= settings.takeProfit ? '달성' : `${(settings.takeProfit - metrics.profitLossPercent).toFixed(1)}% 남음`}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}