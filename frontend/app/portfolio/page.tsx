'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

interface Asset {
  symbol: string
  name: string
  amount: number
  value: number
  price: number
  change24h: number
  allocation: number
}

interface HistoricalData {
  date: string
  value: number
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Asset[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalChange, setTotalChange] = useState(0)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)

  // 포트폴리오 데이터 초기화 (실제 API 연동 시 교체)
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Binance API로 실시간 가격 조회
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']
        const responses = await Promise.all(
          symbols.map(symbol => 
            fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
              .then(res => res.json())
          )
        )

        // 포트폴리오 구성 (실제로는 DB에서 가져와야 함)
        const holdings = [
          { symbol: 'BTC', name: 'Bitcoin', amount: 0.5 },
          { symbol: 'ETH', name: 'Ethereum', amount: 5.2 },
          { symbol: 'BNB', name: 'Binance Coin', amount: 10 },
          { symbol: 'SOL', name: 'Solana', amount: 50 },
          { symbol: 'ADA', name: 'Cardano', amount: 1000 }
        ]

        const portfolioData = holdings.map((holding, index) => {
          const ticker = responses[index]
          const price = parseFloat(ticker.lastPrice)
          const value = holding.amount * price
          return {
            ...holding,
            price,
            value,
            change24h: parseFloat(ticker.priceChangePercent),
            allocation: 0
          }
        })

        const total = portfolioData.reduce((sum, asset) => sum + asset.value, 0)
        
        // 할당 비율 계산
        portfolioData.forEach(asset => {
          asset.allocation = (asset.value / total) * 100
        })

        setPortfolio(portfolioData)
        setTotalValue(total)
        
        // 24시간 변동 가중평균
        const weightedChange = portfolioData.reduce((sum, asset) => 
          sum + (asset.change24h * asset.allocation / 100), 0
        )
        setTotalChange(weightedChange)

        // 히스토리컬 데이터 생성 (실제로는 DB에서)
        const history = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return {
            date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            value: total * (0.9 + Math.random() * 0.3)
          }
        })
        setHistoricalData(history)
        
        setLoading(false)
      } catch (error) {
        console.error('포트폴리오 로드 실패:', error)
        setLoading(false)
      }
    }

    fetchPortfolio()
    const interval = setInterval(fetchPortfolio, 10000)
    return () => clearInterval(interval)
  }, [])

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">포트폴리오</h1>
          <p className="text-gray-400">실시간 자산 현황 및 수익률 분석</p>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">총 자산 가치</div>
            <div className="text-3xl font-bold text-white">
              {formatValue(totalValue)}
            </div>
            <div className={`text-sm mt-2 ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalChange >= 0 ? '↑' : '↓'} {Math.abs(totalChange).toFixed(2)}% (24시간)
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">오늘 수익</div>
            <div className={`text-3xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalChange >= 0 ? '+' : ''}{formatValue(totalValue * totalChange / 100)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              수익률: {totalChange.toFixed(2)}%
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6"
          >
            <div className="text-sm text-gray-400 mb-2">보유 코인</div>
            <div className="text-3xl font-bold text-blue-500">
              {portfolio.length}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              종목 다양화
            </div>
          </motion.div>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 포트폴리오 구성 */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 gradient-text">자산 구성</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolio}
                  dataKey="allocation"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ symbol, allocation }) => `${symbol} ${allocation.toFixed(1)}%`}
                  labelLine={false}
                >
                  {portfolio.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 수익률 추이 */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 gradient-text">30일 수익률</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => formatValue(value)}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 자산 목록 */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">보유 자산</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3">자산</th>
                  <th className="pb-3">보유량</th>
                  <th className="pb-3">현재가</th>
                  <th className="pb-3">평가금액</th>
                  <th className="pb-3">24시간 변동</th>
                  <th className="pb-3">비중</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.sort((a, b) => b.value - a.value).map((asset, index) => (
                  <motion.tr 
                    key={asset.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-xs text-gray-500">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{asset.amount}</td>
                    <td className="py-3">{formatValue(asset.price)}</td>
                    <td className="py-3 font-medium">{formatValue(asset.value)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        asset.change24h >= 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${asset.allocation}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <span className="text-sm">{asset.allocation.toFixed(1)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}