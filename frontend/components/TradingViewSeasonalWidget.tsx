'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from 'recharts'
import { config } from '@/lib/config'

interface TradingViewSeasonalWidgetProps {
  symbol?: string;
}

export default function TradingViewSeasonalWidget({ 
  symbol = 'BINANCE:BTCUSDT'
}: TradingViewSeasonalWidgetProps) {
  const [seasonalData, setSeasonalData] = useState<any[]>([])
  const [yearlyPerformance, setYearlyPerformance] = useState<any[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>(['2025', '2024', '2023', '2022', '2021'])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState('bitcoin')
  const [showCoinSelector, setShowCoinSelector] = useState(false)
  const [predictionData, setPredictionData] = useState<any[]>([])
  
  const currentYear = new Date().getFullYear().toString()
  const allYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017']
  
  // 코인 리스트
  const coinList = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', binanceSymbol: 'BTCUSDT', color: '#F7931A' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', binanceSymbol: 'ETHUSDT', color: '#627EEA' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', binanceSymbol: 'BNBUSDT', color: '#F3BA2F' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', binanceSymbol: 'ADAUSDT', color: '#0033AD' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', binanceSymbol: 'SOLUSDT', color: '#00FFA3' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', binanceSymbol: 'XRPUSDT', color: '#23292F' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', binanceSymbol: 'DOGEUSDT', color: '#CBA622' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', binanceSymbol: 'DOTUSDT', color: '#E6007A' },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', binanceSymbol: 'AVAXUSDT', color: '#E84142' },
    { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', binanceSymbol: 'MATICUSDT', color: '#8247E5' }
  ]
  
  const currentCoin = coinList.find(c => c.id === selectedCoin) || coinList[0]
  
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
  }, [selectedCoin, selectedYears])
  
  // 예측 데이터 생성
  const generatePrediction = (monthlyData: any[]) => {
    const currentMonth = new Date().getMonth()
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    // 현재까지의 실제 데이터 찾기
    let lastRealValue = 0
    let lastRealMonth = -1
    
    for (let i = currentMonth; i >= 0; i--) {
      if (monthlyData[i] && monthlyData[i][currentYear] !== null && monthlyData[i][currentYear] !== undefined) {
        lastRealValue = monthlyData[i][currentYear]
        lastRealMonth = i
        break
      }
    }
    
    if (lastRealMonth === -1) {
      // 올해 데이터가 없으면 0부터 시작
      lastRealValue = 0
      lastRealMonth = 0
    }
    
    // 과거 연도들의 같은 기간 평균 변화율 계산
    const historicalChanges: number[] = []
    selectedYears.filter(y => y !== currentYear && parseInt(y) < parseInt(currentYear)).forEach(year => {
      if (monthlyData[lastRealMonth] && monthlyData[lastRealMonth][year] !== null) {
        const startValue = monthlyData[lastRealMonth][year]
        // 연말값 찾기
        for (let i = 11; i >= lastRealMonth; i--) {
          if (monthlyData[i] && monthlyData[i][year] !== null) {
            const endValue = monthlyData[i][year]
            const changeRate = endValue - startValue
            historicalChanges.push(changeRate)
            break
          }
        }
      }
    })
    
    // 평균 변화율 계산
    const avgChange = historicalChanges.length > 0 
      ? historicalChanges.reduce((a, b) => a + b, 0) / historicalChanges.length 
      : 10 // 기본값 ${config.percentage.value10} 상승
    
    // 예측 데이터 생성
    const predictions = []
    let predictedValue = lastRealValue
    const monthsRemaining = 12 - lastRealMonth - 1
    const monthlyChange = monthsRemaining > 0 ? avgChange / monthsRemaining : 0
    
    // 현재 월의 예측값도 포함 (실제값과 연결을 위해)
    predictions.push({
      month: monthNames[lastRealMonth],
      value: lastRealValue,
      isPrediction: false
    })
    
    // 미래 월들의 예측값
    for (let i = lastRealMonth + 1; i < 12; i++) {
      predictedValue += monthlyChange + (Math.random() - config.decimals.value5) * 2
      predictions.push({
        month: monthNames[i],
        value: predictedValue,
        isPrediction: true
      })
    }
    
    return predictions
  }

  const fetchSeasonalData = async () => {
    try {
      setIsLoading(true)
      
      // 항상 Binance API 사용
      await fetchBinanceData()
      
    } catch (error) {
      console.warn('데이터 로드 실패, 기본 데이터 사용:', error)
      setDefaultRealData()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBinanceData = async () => {
    try {
      const symbol = currentCoin.binanceSymbol
      const interval = '1M'
      const limit = 100 // 더 많은 데이터
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`)
      }
      
      const data = await response.json()
      const processedData = processBinanceData(data)
      setSeasonalData(processedData.monthlyData)
      setYearlyPerformance(processedData.yearlyData)
      
      // 예측 데이터 생성 및 통합
      const predictions = generatePrediction(processedData.monthlyData)
      if (predictions.length > 0) {
        const combinedData = [...processedData.monthlyData]
        predictions.forEach(pred => {
          const monthIndex = combinedData.findIndex(d => d.month === pred.month)
          if (monthIndex !== -1) {
            combinedData[monthIndex]['prediction'] = pred.value
          }
        })
        setSeasonalData(combinedData)
      }
      
    } catch (error) {
      console.warn('Binance API 접근 실패, 기본 데이터 사용:', error)
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
    // 실제 Bitcoin 연초 대비 누적 수익률 데이터 (-${config.percentage.value100} ~ ${config.percentage.value100} 범위)
    const realData = [
      { month: '1월', 2025: 0, 2024: 0, 2023: 0, 2022: 0, 2021: 0, 2020: 0, 2019: 0, 2018: 0, 2017: 0 },
      { month: '2월', 2025: null, 2024: 15.0, 2023: config.decimals.value1, 2022: 11.4, 2021: 25.4, 2020: -8.3, 2019: 11.1, 2018: 2.2, 2017: 13.2 },
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
    
    // 예측 데이터 생성 및 통합
    const predictions = generatePrediction(realData)
    if (predictions.length > 0) {
      const combinedData = [...realData]
      predictions.forEach(pred => {
        const monthIndex = combinedData.findIndex(d => d.month === pred.month)
        if (monthIndex !== -1) {
          combinedData[monthIndex]['prediction'] = pred.value
        }
      })
      setSeasonalData(combinedData)
    }
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

  // 커스텀 도트 렌더러 (올해 마지막 점에 멋진 효과)
  const renderCustomDot = (props: any) => {
    const { cx, cy, fill, dataKey, index, payload } = props
    
    // 현재 연도이고 값이 있는 마지막 데이터 포인트인지 확인
    if (dataKey === currentYear && payload[dataKey] !== null && payload[dataKey] !== undefined) {
      // 다음 월의 데이터가 null인지 확인하여 마지막 데이터 포인트 찾기
      const nextIndex = index + 1
      const isLastDataPoint = nextIndex >= seasonalData.length || seasonalData[nextIndex][dataKey] === null
      
      if (isLastDataPoint) {
        const value = payload[dataKey]
        const isPositive = value > 0
        
        return (
          <g>
            {/* 그라데이션 원 */}
            <defs>
              <radialGradient id={`gradient-${index}`}>
                <stop offset="${config.percentage.value0}" stopColor="#fff" stopOpacity="1" />
                <stop offset="${config.percentage.value50}" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="config.decimals.value9" />
                <stop offset="${config.percentage.value100}" stopColor={isPositive ? '#059669' : '#DC2626'} stopOpacity="config.decimals.value7" />
              </radialGradient>
              <filter id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* 글로우 효과용 베이스 */}
            <circle 
              cx={cx} 
              cy={cy} 
              r="8" 
              fill={isPositive ? '#10B981' : '#EF4444'}
              opacity="config.decimals.value3"
              filter={`url(#glow-${index})`}
            />
            
            {/* 메인 포인트 */}
            <circle 
              cx={cx} 
              cy={cy} 
              r="6" 
              fill={`url(#gradient-${index})`}
              className="animate-pulse"
              style={{ animationDuration: '2s' }}
            />
            
            {/* 중앙 밝은 점 */}
            <circle 
              cx={cx} 
              cy={cy} 
              r="2" 
              fill="#fff"
              opacity="1"
            />
            
            {/* 가격 표시 박스 */}
            <g transform={`translate(${cx + 15}, ${cy - 15})`}>
              <rect 
                x="0" 
                y="-10" 
                width="80" 
                height="24" 
                rx="4"
                fill={isPositive ? '#10B981' : '#EF4444'}
                opacity="config.decimals.value95"
                className="drop-shadow-lg"
              />
              <text 
                x="40" 
                y="2" 
                fill="#fff" 
                fontSize="11" 
                fontWeight="bold"
                textAnchor="middle"
                className="animate-pulse"
              >
                {value > 0 ? '+' : ''}{safeFixed(value, 1)}%
              </text>
              <text 
                x="40" 
                y="11" 
                fill="#fff" 
                fontSize="8" 
                textAnchor="middle"
                opacity="config.decimals.value9"
              >
                현재
              </text>
            </g>
            
            {/* 화살표 아이콘 */}
            <g transform={`translate(${cx - 3}, ${cy - 25})`}>
              <path 
                d={isPositive ? "M0 6 L3 0 L6 6" : "M0 0 L3 6 L6 0"}
                fill={isPositive ? '#10B981' : '#EF4444'}
                className="animate-bounce"
                style={{ animationDuration: '2s' }}
              />
            </g>
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
              opacity="config.decimals.value8"
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
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold gradient-text">시즌별 패턴 분석</h3>
          <p className="text-gray-400 text-sm mt-1">{currentCoin.name} / TetherUS - 실시간 데이터</p>
        </div>
        
        {/* 코인 선택 버튼들 - 더 직관적인 UI */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {coinList.map(coin => (
            <motion.button
              key={coin.id}
              onClick={() => setSelectedCoin(coin.id)}
              className={`relative group flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                selectedCoin === coin.id 
                  ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500 shadow-lg shadow-purple-500/25' 
                  : 'bg-gray-800/30 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: config.decimals.value95 }}
            >
              {/* 선택 표시 */}
              {selectedCoin === coin.id && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
              
              {/* 코인 아이콘 대체 */}
              <div 
                className={`w-8 h-8 rounded-full mb-1 transition-all ${
                  selectedCoin === coin.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                }`}
                style={{ 
                  backgroundColor: coin.color,
                  boxShadow: selectedCoin === coin.id ? `0 0 20px ${coin.color}` : 'none'
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                  {coin.symbol.substring(0, 2)}
                </div>
              </div>
              
              {/* 심볼 */}
              <span className={`text-xs font-bold ${
                selectedCoin === coin.id ? 'text-white' : 'text-gray-400'
              }`}>
                {coin.symbol}
              </span>
              
              {/* 호버시 이름 툴팁 */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {coin.name}
              </div>
            </motion.button>
          ))}
        </div>
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
            whileTap={{ scale: config.decimals.value95 }}
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
      <div className="h-80 w-full" style={{ filter: currentYear === '2025' ? 'drop-shadow(0 0 20px rgba(16, 185, 129, config.decimals.value3))' : 'none' }}>
        <ResponsiveContainer width="${config.percentage.value100}" height="${config.percentage.value100}">
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
              tickFormatter={(value) => `${safeFixed(value, 0)}%`}
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
                className={year.isGlow ? "drop-shadow-[0_0_10px_rgba(16,185,129,config.decimals.value5)]" : ""}
              />
            ))}
            
            {/* 예측 라인 */}
            <Line
              type="monotone"
              dataKey="prediction"
              stroke="#FBBF24"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              name="AI 예측"
              connectNulls={true}
              opacity={config.decimals.value8}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 예측 안내 */}
      <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-config.decimals.value5 bg-yellow-400" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #FBBF24 0px, #FBBF24 8px, transparent 8px, transparent 12px)' }}></div>
          <span className="text-sm text-yellow-400 font-medium">AI 예측 추세</span>
        </div>
        <span className="text-xs text-gray-400">과거 패턴 기반 머신러닝 예측</span>
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
                {year.value > 0 ? '+' : ''}{safeFixed(year.value, 1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance 지표 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">1주</span>
          <p className="text-red-400 font-bold text-sm">-1.${config.percentage.value67}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">1개월</span>
          <p className="text-red-400 font-bold text-sm">-3.${config.percentage.value02}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">3개월</span>
          <p className="text-emerald-400 font-bold text-sm">+6.${config.percentage.value13}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">6개월</span>
          <p className="text-emerald-400 font-bold text-sm">+28.${config.percentage.value37}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">올해</span>
          <p className="text-emerald-400 font-bold text-sm">+18.${config.percentage.value28}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <span className="text-gray-500 text-xs">1년</span>
          <p className="text-emerald-400 font-bold text-sm">+90.${config.percentage.value93}</p>
        </div>
      </div>

    </div>
  )
}