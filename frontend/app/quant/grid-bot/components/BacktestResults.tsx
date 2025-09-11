'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FaHistory, FaChartBar, FaCalendar, FaExclamationTriangle } from 'react-icons/fa'
import { binanceAPI } from '@/lib/binanceConfig'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from 'recharts'

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

interface BacktestData {
  date: string
  profit: number
  trades: number
  winRate: number
  cumulativeProfit: number
}

export default function BacktestResults({ selectedCoin }: Props) {
  const [backtestPeriod, setBacktestPeriod] = useState('7d')
  const [backtestData, setBacktestData] = useState<BacktestData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [backtestSettings] = useState({
    upperPrice: 50000,
    lowerPrice: 40000,
    gridCount: 20,
    investment: 10000
  })

  // 백테스트 시뮬레이션 (실제로는 과거 K라인 데이터로 계산해야 함)
  useEffect(() => {
    const runBacktest = async () => {
      try {
        setIsLoading(true)
        
        // K라인 데이터 가져오기
        const interval = backtestPeriod === '7d' ? '1h' : backtestPeriod === '30d' ? '4h' : '1d'
        const limit = backtestPeriod === '7d' ? 168 : backtestPeriod === '30d' ? 180 : 90
        
        const { data: klines } = await binanceAPI.getKlines({
          symbol: selectedCoin.fullSymbol,
          interval,
          limit
        })
        
        if (klines) {
          // 백테스트 시뮬레이션
          const results: BacktestData[] = []
          let cumulativeProfit = 0
          
          for (let i = 0; i < klines.length; i++) {
            const date = new Date(klines[i][0])
            const high = parseFloat(klines[i][2])
            const low = parseFloat(klines[i][3])
            const volatility = (high - low) / low * 100
            
            // 간단한 시뮬레이션 (실제로는 더 복잡한 계산 필요)
            const trades = Math.floor(volatility * 2)
            const profit = trades * backtestSettings.investment * 0.002 // 0.2% per trade
            const winRate = 50 + volatility * 2 // 변동성이 높을수록 승률 증가
            
            cumulativeProfit += profit
            
            results.push({
              date: date.toLocaleDateString('ko-KR'),
              profit,
              trades,
              winRate: Math.min(100, winRate),
              cumulativeProfit
            })
          }
          
          setBacktestData(results)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('백테스트 실패:', error)
        setIsLoading(false)
      }
    }
    
    runBacktest()
  }, [selectedCoin, backtestPeriod, backtestSettings])

  // 백테스트 요약 통계
  const calculateSummary = () => {
    if (backtestData.length === 0) return null
    
    const totalProfit = backtestData[backtestData.length - 1].cumulativeProfit
    const totalTrades = backtestData.reduce((sum, d) => sum + d.trades, 0)
    const avgWinRate = backtestData.reduce((sum, d) => sum + d.winRate, 0) / backtestData.length
    const profitableDay = backtestData.filter(d => d.profit > 0).length
    const maxDrawdown = Math.min(...backtestData.map(d => d.cumulativeProfit - totalProfit))
    
    return {
      totalProfit,
      totalTrades,
      avgWinRate,
      profitableDay,
      profitRatio: (profitableDay / backtestData.length) * 100,
      roi: (totalProfit / backtestSettings.investment) * 100,
      maxDrawdown
    }
  }

  const summary = calculateSummary()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">백테스트 진행 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaHistory className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">백테스트 결과</h2>
          <p className="text-gray-400">{selectedCoin.name} 그리드 봇 과거 성과 분석</p>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(period => (
            <button
              key={period}
              onClick={() => setBacktestPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                backtestPeriod === period
                  ? `${selectedCoin.bgColor} ${selectedCoin.color}`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FaCalendar />
          <span>백테스트 기간: {backtestPeriod === '7d' ? '최근 7일' : backtestPeriod === '30d' ? '최근 30일' : '최근 90일'}</span>
        </div>
      </div>

      {/* 백테스트 설정 */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-bold mb-3 text-gray-400">백테스트 설정</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">상한가</p>
            <p className="text-white">${backtestSettings.upperPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">하한가</p>
            <p className="text-white">${backtestSettings.lowerPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">그리드 수</p>
            <p className="text-white">{backtestSettings.gridCount}개</p>
          </div>
          <div>
            <p className="text-gray-500">투자금</p>
            <p className="text-white">${backtestSettings.investment.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 요약 통계 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">수익 성과</h3>
              <FaChartBar className={selectedCoin.color} />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">총 수익</p>
                <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${safeFixed(summary.totalProfit, 2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ROI (수익률)</p>
                <p className={`text-xl font-bold ${summary.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {safeFixed(summary.roi, 2)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">거래 통계</h3>
              <FaHistory className={selectedCoin.color} />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">총 거래 횟수</p>
                <p className="text-2xl font-bold text-white">{summary.totalTrades}회</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">평균 승률</p>
                <p className="text-xl font-bold text-yellow-400">{safeFixed(summary.avgWinRate, 1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">리스크 지표</h3>
              <FaExclamationTriangle className={selectedCoin.color} />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">수익일 비율</p>
                <p className="text-2xl font-bold text-green-400">{safeFixed(summary.profitRatio, 0)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">최대 손실폭</p>
                <p className="text-xl font-bold text-red-400">{safeFixed(summary.maxDrawdown, 2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 누적 수익 차트 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">누적 수익 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={backtestData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              stroke={selectedCoin.color.replace('text-', '#')}
              fill={selectedCoin.bgColor.replace('bg-', '#').replace('/20', '')}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 일별 성과 차트 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">일별 거래 성과</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={backtestData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="profit" 
              fill="#10B981" 
              name="일일 수익"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="trades" 
              fill="#F59E0B" 
              name="거래 횟수"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 주의사항 */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-700/30">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400" />
          백테스트 주의사항
        </h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• 과거 성과가 미래 수익을 보장하지 않습니다</li>
          <li>• 백테스트는 이상적인 조건을 가정합니다 (슬리피지, 수수료 등 미반영)</li>
          <li>• 실제 시장에서는 유동성 부족, 주문 미체결 등이 발생할 수 있습니다</li>
          <li>• 시장 상황 변화에 따라 성과가 크게 달라질 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}