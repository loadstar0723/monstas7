'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaHistory, FaPlay, FaCog, FaChartLine, FaDollarSign } from 'react-icons/fa'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'

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

interface BacktestResult {
  date: string
  totalPnL: number
  trades: number
  winRate: number
  sharpe: number
}

interface SimulationParams {
  spread: number
  orderSize: number
  maxInventory: number
  stopLoss: number
  period: '1d' | '7d' | '30d'
}

export default function ProfitSimulator({ selectedCoin }: Props) {
  const [params, setParams] = useState<SimulationParams>({
    spread: 0.1,
    orderSize: 0.1,
    maxInventory: 5,
    stopLoss: 2,
    period: '7d'
  })
  const [results, setResults] = useState<BacktestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    totalProfit: 0,
    totalTrades: 0,
    avgWinRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0
  })

  useEffect(() => {
    // 초기 백테스트 실행
    runBacktest()
  }, [selectedCoin.fullSymbol])

  const runBacktest = async () => {
    setLoading(true)
    
    try {
      // 과거 가격 데이터 가져오기
      const interval = params.period === '1d' ? '1h' : params.period === '7d' ? '4h' : '1d'
      const limit = params.period === '1d' ? 24 : params.period === '7d' ? 42 : 30
      
      const response = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=${interval}&limit=${limit}`
      )
      const klines = await response.json()
      
      // 백테스트 시뮬레이션
      const backtestResults: BacktestResult[] = []
      let cumulativePnL = 0
      let totalTrades = 0
      let winningTrades = 0
      
      for (let i = 1; i < klines.length; i++) {
        const [openTime, open, high, low, close, volume] = klines[i]
        const price = parseFloat(close)
        const prevPrice = parseFloat(klines[i-1][4])
        
        // 마켓 메이킹 시뮬레이션
        const priceChange = ((price - prevPrice) / prevPrice) * 100
        const volatility = Math.abs(priceChange)
        
        // 스프레드 수익 계산
        const spreadProfit = price * params.orderSize * (params.spread / 100)
        const tradesPerPeriod = Math.floor(10 + volatility * 5) // 변동성에 따른 거래 횟수
        const periodPnL = spreadProfit * tradesPerPeriod
        
        // 재고 리스크 계산
        const inventoryRisk = ((Date.now() % 1000) / 1000) < 0.2 ? -periodPnL * 0.3 : 0
        const netPnL = periodPnL + inventoryRisk
        
        cumulativePnL += netPnL
        totalTrades += tradesPerPeriod
        if (netPnL > 0) winningTrades += tradesPerPeriod * 0.6
        
        const date = new Date(openTime)
        backtestResults.push({
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          totalPnL: cumulativePnL,
          trades: tradesPerPeriod,
          winRate: (winningTrades / totalTrades) * 100,
          sharpe: cumulativePnL / (Math.sqrt(totalTrades) * volatility) || 0
        })
      }
      
      setResults(backtestResults)
      
      // 요약 통계 계산
      const maxPnL = Math.max(...backtestResults.map(r => r.totalPnL))
      const minPnL = Math.min(...backtestResults.map(r => r.totalPnL))
      const drawdown = maxPnL > 0 ? ((maxPnL - minPnL) / maxPnL) * 100 : 0
      
      setSummary({
        totalProfit: cumulativePnL,
        totalTrades,
        avgWinRate: (winningTrades / totalTrades) * 100,
        sharpeRatio: backtestResults[backtestResults.length - 1]?.sharpe || 0,
        maxDrawdown: drawdown
      })
      
    } catch (error) {
      console.error('백테스트 실행 실패:', error)
    }
    
    setLoading(false)
  }

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return `$${safeFixed(value, 2)}`
      case 'percentage':
        return `${safeFixed(value, 1)}%`
      case 'number':
        return safeFixed(value, 2)
      default:
        return value.toString()
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaHistory className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">수익 시뮬레이터</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} 백테스팅 및 수익 분석</p>
        </div>
      </div>
      
      {/* 시뮬레이션 설정 - 모바일 최적화 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaCog className="text-purple-400" />
          백테스트 설정
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 block">스프레드 (%)</label>
            <input
              type="number"
              value={params.spread}
              onChange={(e) => setParams({...params, spread: Number(e.target.value)})}
              step="0.01"
              min="0.01"
              max="1"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 block">주문 크기 ({selectedCoin.symbol})</label>
            <input
              type="number"
              value={params.orderSize}
              onChange={(e) => setParams({...params, orderSize: Number(e.target.value)})}
              step="0.01"
              min="0.01"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 block">최대 재고</label>
            <input
              type="number"
              value={params.maxInventory}
              onChange={(e) => setParams({...params, maxInventory: Number(e.target.value)})}
              step="0.1"
              min="1"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 block">손절선 (%)</label>
            <input
              type="number"
              value={params.stopLoss}
              onChange={(e) => setParams({...params, stopLoss: Number(e.target.value)})}
              step="0.1"
              min="0.5"
              max="10"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 block">기간</label>
            <select
              value={params.period}
              onChange={(e) => setParams({...params, period: e.target.value as '1d' | '7d' | '30d'})}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="1d">1일</option>
              <option value="7d">7일</option>
              <option value="30d">30일</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <FaPlay className="text-xs" />
              {loading ? '실행 중...' : '백테스트 실행'}
            </button>
          </div>
        </div>
      </div>

      {/* 요약 통계 - 모바일 2열 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">총 수익</p>
          <p className={`text-lg sm:text-2xl font-bold ${
            summary.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${safeFixed(summary.totalProfit, 0)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">총 거래</p>
          <p className="text-lg sm:text-2xl font-bold text-white">
            {summary.totalTrades}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">승률</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-400">
            {safeFixed(summary.avgWinRate, 1)}%
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">샤프 비율</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-400">
            {safeFixed(summary.sharpeRatio, 2)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">최대 손실</p>
          <p className="text-lg sm:text-2xl font-bold text-orange-400">
            -{safeFixed(summary.maxDrawdown, 1)}%
          </p>
        </div>
      </div>

      {/* 수익 곡선 차트 - 모바일 높이 조정 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          누적 수익 곡선
        </h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${safeFixed(value, 0)}`}
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
              <Area 
                type="monotone" 
                dataKey="totalPnL" 
                stroke="#A78BFA" 
                fill="#A78BFA"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 거래 분석 - 모바일 스크롤 */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 overflow-x-auto">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">상세 거래 내역</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2 sm:px-3">날짜</th>
                <th className="text-right py-2 px-2 sm:px-3">거래수</th>
                <th className="text-right py-2 px-2 sm:px-3">승률</th>
                <th className="text-right py-2 px-2 sm:px-3">누적 수익</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(-10).reverse().map((result, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-2 px-2 sm:px-3 text-gray-300">{result.date}</td>
                  <td className="text-right py-2 px-2 sm:px-3 text-gray-300">{result.trades}</td>
                  <td className="text-right py-2 px-2 sm:px-3">
                    <span className={result.winRate > 50 ? 'text-green-400' : 'text-red-400'}>
                      {safeFixed(result.winRate, 1)}%
                    </span>
                  </td>
                  <td className="text-right py-2 px-2 sm:px-3">
                    <span className={result.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${safeFixed(result.totalPnL, 2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 전략 추천 - 모바일 최적화 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <FaDollarSign className="text-purple-400" />
          백테스트 기반 추천
        </h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <p className="text-gray-300">
            • 현재 설정으로 {params.period} 동안 <span className="text-green-400 font-semibold">${safeFixed(summary.totalProfit, 2)}</span>의 수익 예상
          </p>
          <p className="text-gray-300">
            • 권장 스프레드: {summary.avgWinRate > 60 ? '현재 유지' : '0.05% 증가'} ({params.spread}% → {summary.avgWinRate > 60 ? params.spread : params.spread + 0.05}%)
          </p>
          <p className="text-gray-300">
            • 리스크 관리: 최대 손실 {safeFixed(summary.maxDrawdown, 1)}%를 고려하여 자본의 {Math.min(20, 100 / summary.maxDrawdown).toFixed(0)}% 이내 운용
          </p>
          <p className="text-gray-300">
            • 최적 거래 시간: 변동성이 높은 시간대에 집중 (거래량 상위 20% 시간)
          </p>
        </div>
      </div>
    </div>
  )
}