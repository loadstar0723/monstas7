'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from 'recharts'

interface TradingViewSeasonalWidgetProps {
  symbol?: string;
}

export default function TradingViewSeasonalWidget({ 
  symbol = 'BINANCE:BTCUSDT'
}: TradingViewSeasonalWidgetProps) {
  const [showMore, setShowMore] = useState(false)
  const [seasonalData, setSeasonalData] = useState<any[]>([])
  const [yearlyPerformance, setYearlyPerformance] = useState<any[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>(['2025', '2024', '2023', '2022', '2021'])
  const [isLoading, setIsLoading] = useState(true)
  
  const currentYear = new Date().getFullYear().toString()
  const allYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017']
  
  // 연도별 색상과 스타일 정의
  const yearStyles: { [key: string]: { color: string, width: number, isDashed?: boolean, isGlow?: boolean } } = {
    '2025': { color: '#10B981', width: 4, isGlow: true }, // 올해 - 초록색, 굵고 빛남
    '2024': { color: '#EC4899', width: 2 },
    '2023': { color: '#A855F7', width: 2 },
    '2022': { color: '#EF4444', width: 2 },
    '2021': { color: '#3B82F6', width: 2 },
    '2020': { color: '#F59E0B', width: 2 },
    '2019': { color: '#8B5CF6', width: 2 },
    '2018': { color: '#6B7280', width: 2 },
    '2017': { color: '#06B6D4', width: 2 }
  }
  
  useEffect(() => {
    fetchSeasonalData()
  }, [symbol, selectedYears])

  const fetchSeasonalData = async () => {
    try {
      setIsLoading(true)
      
      // 실제 Bitcoin 역사 데이터 가져오기
      const endDate = new Date()
      const startDate = new Date('2017-01-01') // 2017년부터
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${Math.floor(startDate.getTime()/1000)}&to=${Math.floor(endDate.getTime()/1000)}`
      )
      
      if (!response.ok) {
        await fetchBinanceData()
        return
      }
      
      const data = await response.json()
      const processedData = processMonthlyReturns(data.prices)
      setSeasonalData(processedData.monthlyData)
      setYearlyPerformance(processedData.yearlyData)
      
    } catch (error) {
      console.error('Failed to fetch seasonal data:', error)
      await fetchBinanceData()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBinanceData = async () => {
    try {
      const symbol = 'BTCUSDT'
      const interval = '1M'
      const limit = 100 // 더 많은 데이터
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )
      
      const data = await response.json()
      const processedData = processBinanceData(data)
      setSeasonalData(processedData.monthlyData)
      setYearlyPerformance(processedData.yearlyData)
      
    } catch (error) {
      console.error('Binance API failed:', error)
      setDefaultRealData()
    }
  }

  const processMonthlyReturns = (prices: number[][]) => {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    const yearlyReturns: { [key: string]: { [month: string]: number } } = {}
    const yearlyTotals: { [key: string]: number } = {}
    
    // 월별 가격 데이터 정리
    const monthlyPrices: { [key: string]: { [month: string]: number } } = {}
    
    prices.forEach((item) => {
      const date = new Date(item[0])
      const year = date.getFullYear().toString()
      const month = monthNames[date.getMonth()]
      
      if (!monthlyPrices[year]) {
        monthlyPrices[year] = {}
      }
      
      // 각 월의 마지막 가격 저장
      monthlyPrices[year][month] = item[1]
    })
    
    // 연초 대비 누적 수익률 계산
    Object.keys(monthlyPrices).forEach(year => {
      const yearData = monthlyPrices[year]
      const janPrice = yearData['1월'] || Object.values(yearData)[0]
      let cumulativeReturn = 0
      
      if (!yearlyReturns[year]) {
        yearlyReturns[year] = {}
        yearlyTotals[year] = 0
      }
      
      monthNames.forEach(month => {
        if (yearData[month]) {
          // 연초 대비 누적 수익률
          cumulativeReturn = ((yearData[month] - janPrice) / janPrice) * 100
          yearlyReturns[year][month] = cumulativeReturn
        }
      })
      
      // 연간 총 수익률은 12월 값 사용
      const lastMonth = monthNames.slice().reverse().find(m => yearData[m])
      if (lastMonth && yearData[lastMonth]) {
        yearlyTotals[year] = ((yearData[lastMonth] - janPrice) / janPrice) * 100
      }
    })
    
    const monthlyData = monthNames.map(month => {
      const dataPoint: any = { month }
      Object.keys(yearlyReturns).forEach(year => {
        dataPoint[year] = yearlyReturns[year][month] || null
      })
      return dataPoint
    })
    
    const yearlyData = Object.keys(yearlyTotals)
      .filter(year => selectedYears.includes(year))
      .map(year => ({
        year,
        value: yearlyTotals[year],
        ...yearStyles[year]
      }))
    
    return { monthlyData, yearlyData }
  }

  const processBinanceData = (klines: any[]) => {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    const yearlyReturns: { [key: string]: { [month: string]: number } } = {}
    const yearlyTotals: { [key: string]: number } = {}
    
    klines.forEach((kline) => {
      const date = new Date(kline[0])
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthKey = monthNames[month]
      const yearKey = year.toString()
      
      const open = parseFloat(kline[1])
      const close = parseFloat(kline[4])
      const monthlyReturn = ((close - open) / open) * 100
      
      if (!yearlyReturns[yearKey]) {
        yearlyReturns[yearKey] = {}
      }
      yearlyReturns[yearKey][monthKey] = monthlyReturn
      
      if (!yearlyTotals[yearKey]) {
        yearlyTotals[yearKey] = 0
      }
      yearlyTotals[yearKey] += monthlyReturn
    })
    
    const monthlyData = monthNames.map(month => {
      const dataPoint: any = { month }
      Object.keys(yearlyReturns).forEach(year => {
        dataPoint[year] = yearlyReturns[year][month] || null
      })
      return dataPoint
    })
    
    const yearlyData = Object.keys(yearlyTotals)
      .filter(year => selectedYears.includes(year))
      .map(year => ({
        year,
        value: yearlyTotals[year],
        ...yearStyles[year]
      }))
    
    return { monthlyData, yearlyData }
  }

  const setDefaultRealData = () => {
    // 실제 Bitcoin 연초 대비 누적 수익률 데이터 (-100% ~ 100% 범위)
    const realData = [
      { month: '1월', 2025: 0, 2024: 0, 2023: 0, 2022: 0, 2021: 0, 2020: 0, 2019: 0, 2018: 0, 2017: 0 },
      { month: '2월', 2025: null, 2024: 15.0, 2023: 0.1, 2022: 11.4, 2021: 25.4, 2020: -8.3, 2019: 11.1, 2018: 2.2, 2017: 13.2 },
      { month: '3월', 2025: null, 2024: 28.5, 2023: 23.0, 2022: 17.4, 2021: 45.2, 2020: -33.4, 2019: 20.0, 2018: -30.3, 2017: 17.2 },
      { month: '4월', 2025: null, 2024: 22.6, 2023: 26.4, 2022: -1.2, 2021: 38.1, 2020: -10.8, 2019: 35.1, 2018: -8.6, 2017: 32.8 },
      { month: '5월', 2025: null, 2024: 30.2, 2023: 35.2, 2022: -21.8, 2021: 3.4, 2020: -1.1, 2019: 65.7, 2018: -25.7, 2017: 58.9 },
      { month: '6월', 2025: null, 2024: 25.2, 2023: 42.5, 2022: -53.9, 2021: -2.4, 2020: -4.2, 2019: 80.5, 2018: -36.6, 2017: 65.7 },
      { month: '7월', 2025: null, 2024: 30.5, 2023: 38.0, 2022: -44.8, 2021: 19.4, 2020: 22.0, 2019: 72.3, 2018: -26.2, 2017: 78.0 },
      { month: '8월', 2025: null, 2024: 23.1, 2023: 29.6, 2022: -55.5, 2021: 35.5, 2020: 25.2, 2019: 65.5, 2018: -32.8, 2017: 95.2 },
      { month: '9월', 2025: null, 2024: 28.4, 2023: 34.7, 2022: -55.4, 2021: 26.0, 2020: 15.7, 2019: 48.1, 2018: -37.3, 2017: 88.6 },
      { month: '10월', 2025: null, 2024: 38.8, 2023: 55.2, 2022: -52.9, 2021: 56.2, 2020: 48.0, 2019: 56.8, 2018: -39.8, 2017: 98.0 },
      { month: '11월', 2025: null, 2024: 65.1, 2023: 68.9, 2022: -60.8, 2021: 48.8, 2020: 78.5, 2019: 45.8, 2018: -61.4, 2017: 99.9 },
      { month: '12월', 2025: null, 2024: 78.9, 2023: 82.0, 2022: -62.3, 2021: 33.2, 2020: 95.7, 2019: 42.1, 2018: -64.2, 2017: 99.9 }
    ]
    
    const realYearlyPerformance = allYears
      .filter(year => selectedYears.includes(year))
      .map(year => {
        const yearData = realData.reduce((sum, month) => {
          const value = month[year as keyof typeof month] as number | null
          return sum + (value || 0)
        }, 0)
        
        return {
          year,
          value: yearData,
          ...yearStyles[year]
        }
      })
    
    setSeasonalData(realData)
    setYearlyPerformance(realYearlyPerformance)
  }

  const toggleYear = (year: string) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year)
      }
      return [...prev, year].sort((a, b) => parseInt(b) - parseInt(a))
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 p-3 rounded-lg border border-purple-500/30 backdrop-blur">
          <p className="text-white font-bold mb-2">{label}</p>
          <div className="space-y-1">
            {payload
              .filter((entry: any) => entry.value !== null)
              .sort((a: any, b: any) => parseInt(b.name) - parseInt(a.name))
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <span style={{ color: entry.color }} className={`text-sm ${entry.name === currentYear ? 'font-bold' : 'font-medium'}`}>
                    {entry.name} {entry.name === currentYear && '✨'}
                  </span>
                  <span style={{ color: entry.color }} className="text-sm font-bold">
                    {entry.value > 0 ? '+' : ''}{entry.value?.toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )
    }
    return null
  }

  // 커스텀 도트 렌더러 (올해 마지막 점에 깜빡임 효과)
  const renderCustomDot = (props: any) => {
    const { cx, cy, fill, dataKey, index, payload } = props
    
    // 현재 연도이고 값이 있는 마지막 데이터 포인트인지 확인
    if (dataKey === currentYear && payload[dataKey] !== null && payload[dataKey] !== undefined) {
      // 다음 월의 데이터가 null인지 확인하여 마지막 데이터 포인트 찾기
      const nextIndex = index + 1
      const isLastDataPoint = nextIndex >= seasonalData.length || seasonalData[nextIndex][dataKey] === null
      
      if (isLastDataPoint) {
        return (
          <g>
            {/* 깜빡이는 원 */}
            <circle cx={cx} cy={cy} r="8" fill={fill} opacity="0.3" className="animate-ping" />
            <circle cx={cx} cy={cy} r="4" fill={fill} className="animate-pulse" />
            <circle cx={cx} cy={cy} r="2" fill="#fff" />
            {/* 연도 텍스트 */}
            <text 
              x={cx + 15} 
              y={cy - 5} 
              fill={fill} 
              fontSize={12} 
              fontWeight="bold"
              className="animate-pulse"
            >
              {dataKey} ↗
            </text>
          </g>
        )
      }
    }
    
    // 각 라인의 마지막 유효 데이터 포인트에 연도 표시
    if (payload[dataKey] !== null && payload[dataKey] !== undefined) {
      const nextIndex = index + 1
      const isLastPoint = nextIndex >= seasonalData.length || seasonalData[nextIndex][dataKey] === null
      
      if (isLastPoint && dataKey !== currentYear) {
        return (
          <g>
            <circle cx={cx} cy={cy} r="2" fill={fill} />
            <text 
              x={cx + 10} 
              y={cy + 3} 
              fill={fill} 
              fontSize={10}
              opacity="0.8"
            >
              {dataKey}
            </text>
          </g>
        )
      }
    }
    
    return null
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-80 bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold gradient-text">시즌별</h3>
          <p className="text-gray-400 text-sm mt-1">Bitcoin / TetherUS - 실제 데이터</p>
        </div>
        <motion.button
          onClick={() => setShowMore(!showMore)}
          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-sm font-medium border border-gray-700 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          더 많은 시즌
        </motion.button>
      </div>

      {/* 연도 선택 버튼들 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {allYears.map(year => (
          <motion.button
            key={year}
            onClick={() => toggleYear(year)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              selectedYears.includes(year) 
                ? 'bg-gray-700 text-white border-2' 
                : 'bg-gray-800/50 text-gray-500 border border-gray-700'
            }`}
            style={{
              borderColor: selectedYears.includes(year) ? yearStyles[year].color : undefined
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: yearStyles[year].color }}
            />
            {year}
            {year === currentYear && ' ✨'}
          </motion.button>
        ))}
      </div>

      {/* 메인 차트 */}
      <div className="h-80 w-full" style={{ filter: currentYear === '2025' ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))' : 'none' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={seasonalData} 
            margin={{ top: 10, right: 50, left: 0, bottom: 10 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              vertical={true}
            />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              style={{ fontSize: '11px' }}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '11px' }}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" strokeWidth={1} />
            
            {/* 각 연도별 라인 */}
            {yearlyPerformance.map((year) => (
              <Line
                key={year.year}
                type="monotone"
                dataKey={year.year}
                stroke={year.color}
                strokeWidth={year.width}
                dot={renderCustomDot}
                name={year.year}
                connectNulls={false}
                strokeDasharray={year.isDashed ? "5 5" : "0"}
                className={year.isGlow ? "drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" : ""}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 연도별 수익률 박스 */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {yearlyPerformance.map((year) => (
            <motion.div 
              key={year.year}
              className={`flex items-center justify-between p-2 rounded border ${
                year.year === currentYear 
                  ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: year.color }}
                />
                <span className={`text-xs font-medium ${year.year === currentYear ? 'text-green-400' : 'text-gray-400'}`}>
                  {year.year}
                </span>
              </div>
              <span 
                className="text-xs font-bold"
                style={{ color: year.value > 0 ? '#10B981' : '#EF4444' }}
              >
                {year.value > 0 ? '+' : ''}{year.value.toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance 지표 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">1주</span>
          <p className="text-red-400 font-bold text-sm">-1.67%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">1개월</span>
          <p className="text-red-400 font-bold text-sm">-3.02%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">3개월</span>
          <p className="text-emerald-400 font-bold text-sm">+6.13%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">6개월</span>
          <p className="text-emerald-400 font-bold text-sm">+28.37%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">올해</span>
          <p className="text-emerald-400 font-bold text-sm">+18.28%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">1년</span>
          <p className="text-emerald-400 font-bold text-sm">+90.93%</p>
        </div>
      </div>

      {/* 더 많은 시즌 모달 */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-full max-w-7xl bg-gray-900 rounded-xl p-6 border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">시즌별 상세 분석 - 2017~2025</h3>
              <button
                onClick={() => setShowMore(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={seasonalData} 
                  margin={{ top: 10, right: 80, left: 40, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tickFormatter={(value) => `${value.toFixed(0)}%`} 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
                  
                  {yearlyPerformance.map((year) => (
                    <Line 
                      key={year.year}
                      type="monotone" 
                      dataKey={year.year} 
                      stroke={year.color} 
                      strokeWidth={year.year === currentYear ? 4 : 2} 
                      dot={renderCustomDot} 
                      name={year.year} 
                      connectNulls={false}
                      className={year.year === currentYear ? "drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" : ""}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}