'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaHistory, FaCog, FaPlay, FaDownload,
  FaTrophy, FaExclamationTriangle, FaChartBar 
} from 'react-icons/fa'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { binanceAPI } from '@/lib/binanceConfig'

interface BacktestEngineProps {
  symbol: string
}

interface BacktestResult {
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
  profitableTrades: number
  avgWin: number
  avgLoss: number
  profitFactor: number
}

export default function BacktestEngine({ symbol }: BacktestEngineProps) {
  const [period, setPeriod] = useState('1y')
  const [strategy, setStrategy] = useState('ma_crossover')
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<BacktestResult | null>(null)
  const [equityCurve, setEquityCurve] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [drawdownData, setDrawdownData] = useState<any[]>([])
  
  // 백테스팅 실행
  const runBacktest = async () => {
    setIsRunning(true)
    
    try {
      // 실제로는 API 호출로 백테스팅 수행
      // 여기서는 시뮬레이션 데이터
      const response = await binanceAPI.getKlines(symbol, '1d', 365)
      
      if (response.data) {
        // 가상의 백테스팅 결과 생성
        const mockResults: BacktestResult = {
          totalReturn: 45.67,
          sharpeRatio: 1.85,
          maxDrawdown: -12.34,
          winRate: 58.5,
          totalTrades: 142,
          profitableTrades: 83,
          avgWin: 3.21,
          avgLoss: -1.45,
          profitFactor: 2.21
        }
        
        // 자산 곡선 데이터 생성
        const mockEquityCurve = Array.from({ length: 100 }, (_, i) => ({
          date: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          value: 10000 * (1 + Math.sin(i / 10) * 0.1 + i / 200),
          benchmark: 10000 * (1 + i / 150)
        }))
        
        // 거래 내역 생성
        const mockTrades = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          date: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: i % 3 === 0 ? 'SELL' : 'BUY',
          price: 40000 + ((Date.now() % 1000) / 1000) * 10000,
          quantity: 0.1 + ((Date.now() % 1000) / 1000) * 0.5,
          pnl: (((Date.now() % 1000) / 1000) - 0.4) * 500,
          pnlPercent: (((Date.now() % 1000) / 1000) - 0.4) * 10
        }))
        
        // 드로우다운 데이터 생성
        const mockDrawdown = Array.from({ length: 100 }, (_, i) => ({
          date: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          drawdown: -Math.abs(Math.sin(i / 20) * 15)
        }))
        
        setResults(mockResults)
        setEquityCurve(mockEquityCurve)
        setTrades(mockTrades)
        setDrawdownData(mockDrawdown)
      }
    } catch (error) {
      console.error('백테스팅 오류:', error)
    } finally {
      setIsRunning(false)
    }
  }
  
  // 결과 다운로드
  const downloadResults = () => {
    if (!results) return
    
    const csv = `전략,${strategy}
기간,${period}
총 수익률,${results.totalReturn}%
샤프 비율,${results.sharpeRatio}
최대 낙폭,${results.maxDrawdown}%
승률,${results.winRate}%
총 거래 횟수,${results.totalTrades}
수익 거래,${results.profitableTrades}
평균 수익,${results.avgWin}%
평균 손실,${results.avgLoss}%
수익 팩터,${results.profitFactor}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backtest_${symbol}_${Date.now()}.csv`
    a.click()
  }
  
  return (
    <div className="space-y-6">
      {/* 설정 패널 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCog className="text-purple-400" />
          백테스팅 설정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 기간 선택 */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">테스트 기간</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600"
            >
              <option value="1m">1개월</option>
              <option value="3m">3개월</option>
              <option value="6m">6개월</option>
              <option value="1y">1년</option>
              <option value="2y">2년</option>
              <option value="5y">5년</option>
            </select>
          </div>
          
          {/* 전략 선택 */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">전략</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600"
            >
              <option value="ma_crossover">이동평균 크로스오버</option>
              <option value="rsi_oversold">RSI 과매도/과매수</option>
              <option value="macd_divergence">MACD 다이버전스</option>
              <option value="bollinger_bands">볼린저밴드 반전</option>
              <option value="momentum">모멘텀 브레이크아웃</option>
            </select>
          </div>
          
          {/* 실행 버튼 */}
          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={isRunning}
              className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FaPlay />
              {isRunning ? '백테스팅 중...' : '백테스팅 실행'}
            </button>
          </div>
        </div>
      </div>
      
      {results && (
        <>
          {/* 성과 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <FaTrophy className="text-green-400" />
                <span className="text-gray-400 text-sm">총 수익률</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {results.totalReturn > 0 ? '+' : ''}{safeFixed(results.totalReturn, 2)}%
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <FaChartBar className="text-blue-400" />
                <span className="text-gray-400 text-sm">샤프 비율</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {safeFixed(results.sharpeRatio, 2)}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-4 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-400" />
                <span className="text-gray-400 text-sm">최대 낙폭</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {safeFixed(results.maxDrawdown, 2)}%
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-purple-400" />
                <span className="text-gray-400 text-sm">승률</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {safeFixed(results.winRate, 1)}%
              </div>
            </div>
          </div>
          
          {/* 자산 곡선 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">자산 곡선</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#A855F7" 
                  strokeWidth={2}
                  name="전략" 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6B7280" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="벤치마크" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* 드로우다운 차트 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">드로우다운</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={drawdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="drawdown" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* 거래 내역 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">거래 내역</h3>
              <button
                onClick={downloadResults}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaDownload className="text-sm" />
                CSV 다운로드
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">#</th>
                    <th className="text-left py-2 text-gray-400">날짜</th>
                    <th className="text-left py-2 text-gray-400">유형</th>
                    <th className="text-right py-2 text-gray-400">가격</th>
                    <th className="text-right py-2 text-gray-400">수량</th>
                    <th className="text-right py-2 text-gray-400">손익</th>
                    <th className="text-right py-2 text-gray-400">수익률</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-800">
                      <td className="py-2 text-white">{trade.id}</td>
                      <td className="py-2 text-gray-300">{trade.date}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.type === 'BUY' 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        ${safePrice(trade.price, 2)}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {safeAmount(trade.quantity)}
                      </td>
                      <td className={`py-2 text-right ${
                        trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}{safeFixed(trade.pnl, 2)}
                      </td>
                      <td className={`py-2 text-right ${
                        trade.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.pnlPercent >= 0 ? '+' : ''}{safeFixed(trade.pnlPercent, 2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 상세 통계 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">상세 통계</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-400 text-sm">총 거래 횟수</span>
                <p className="text-white text-lg font-semibold">{results.totalTrades}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">수익 거래</span>
                <p className="text-green-400 text-lg font-semibold">{results.profitableTrades}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">평균 수익</span>
                <p className="text-green-400 text-lg font-semibold">+{safeFixed(results.avgWin, 2)}%</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">평균 손실</span>
                <p className="text-red-400 text-lg font-semibold">{safeFixed(results.avgLoss, 2)}%</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">수익 팩터</span>
                <p className="text-purple-400 text-lg font-semibold">{safeFixed(results.profitFactor, 2)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">승률</span>
                <p className="text-blue-400 text-lg font-semibold">{safeFixed(results.winRate, 1)}%</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">샤프 비율</span>
                <p className="text-yellow-400 text-lg font-semibold">{safeFixed(results.sharpeRatio, 2)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">최대 낙폭</span>
                <p className="text-red-400 text-lg font-semibold">{safeFixed(results.maxDrawdown, 2)}%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}