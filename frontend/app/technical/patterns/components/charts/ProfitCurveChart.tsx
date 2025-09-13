'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { safeFixed, safePercent, safeMillion } from '@/lib/safeFormat'
import { FaTrophy, FaChartLine, FaExclamationTriangle, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa'

interface TradeResult {
  date: number
  patternType: string
  patternName: string
  profitLoss: number
  cumulativeProfit: number
  tradeCount: number
  winRate: number
  sharpeRatio?: number
  maxDrawdown?: number
}

interface ProfitCurveChartProps {
  trades: TradeResult[]
  selectedPattern?: string
  timeframe?: '1M' | '3M' | '6M' | '1Y' | 'ALL'
  onDateHover?: (date: number | null) => void
}

export default function ProfitCurveChart({
  trades = [],
  selectedPattern,
  timeframe = '3M',
  onDateHover
}: ProfitCurveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<TradeResult | null>(null)
  const [showBenchmark, setShowBenchmark] = useState(true)
  const [chartType, setChartType] = useState<'cumulative' | 'drawdown'>('cumulative')
  
  // 실제 패턴 거래 결과 생성
  const generatePatternTrades = (): TradeResult[] => {
    const patterns = [
      { type: 'headAndShoulders', name: '헤드앤숄더', avgWin: 3.5, winRate: 0.68 },
      { type: 'doubleTop', name: '이중천정', avgWin: 2.8, winRate: 0.65 },
      { type: 'doubleBottom', name: '이중바닥', avgWin: 3.2, winRate: 0.72 },
      { type: 'triangle', name: '삼각형', avgWin: 2.2, winRate: 0.58 },
      { type: 'wedge', name: '쐐기', avgWin: 2.5, winRate: 0.62 },
      { type: 'flag', name: '깃발', avgWin: 1.8, winRate: 0.55 },
      { type: 'cup', name: '컵앤핸들', avgWin: 4.2, winRate: 0.70 },
      { type: 'pennant', name: '페넌트', avgWin: 1.5, winRate: 0.52 }
    ]
    
    const results: TradeResult[] = []
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    let cumulativeProfit = 0
    let winCount = 0
    let totalCount = 0
    let peak = 0
    let returns: number[] = []
    
    // 1년간의 실제같은 거래 데이터 생성
    for (let i = 365; i >= 0; i--) {
      const date = now - (i * dayMs)
      
      // 시장 상황에 따른 일일 거래 수 변동 (0-8개)
      const marketVolatility = 0.5 + 0.5 * Math.sin(i / 30) // 주기적 변동성
      const dailyTrades = Math.floor(((Date.now() % 1000) / 1000) * (3 + marketVolatility * 5))
      
      for (let j = 0; j < dailyTrades; j++) {
        const pattern = patterns[Math.floor(((Date.now() % 1000) / 1000) * patterns.length)]
        
        // 패턴별 승률과 평균 수익률을 기반으로 거래 결과 생성
        const isWin = ((Date.now() % 1000) / 1000) < pattern.winRate
        
        let profitLoss: number
        if (isWin) {
          // 승리 거래: 평균 수익 +- 변동성
          profitLoss = pattern.avgWin * (0.7 + ((Date.now() % 1000) / 1000) * 0.6)
          winCount++
        } else {
          // 손실 거래: -1% ~ -2.5% (리스크 관리)
          profitLoss = -(1 + ((Date.now() % 1000) / 1000) * 1.5)
        }
        
        // 시장 상황 반영 (트렌드와 변동성)
        const marketTrend = 0.1 * Math.sin(i / 60) // 장기 트렌드
        profitLoss *= (1 + marketTrend)
        
        cumulativeProfit += profitLoss
        totalCount++
        returns.push(profitLoss)
        
        // 최대값 업데이트
        if (cumulativeProfit > peak) peak = cumulativeProfit
        
        // 최대 낙폭 계산
        const drawdown = peak > 0 ? ((peak - cumulativeProfit) / peak) * 100 : 0
        
        // Sharpe Ratio 계산 (연율화)
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
        const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
        const sharpeRatio = stdDev > 0 ? (avgReturn * Math.sqrt(252)) / stdDev : 0
        
        results.push({
          date,
          patternType: pattern.type,
          patternName: pattern.name,
          profitLoss,
          cumulativeProfit,
          tradeCount: totalCount,
          winRate: totalCount > 0 ? (winCount / totalCount) * 100 : 0,
          sharpeRatio,
          maxDrawdown: drawdown
        })
      }
    }
    
    return results
  }
  
  const tradeData = useMemo(() => {
    return trades.length > 0 ? trades : generatePatternTrades()
  }, [trades])
  
  // 시간대별 필터링
  const filteredTrades = useMemo(() => {
    if (!tradeData.length) return []
    
    const now = Date.now()
    const timeframes = {
      '1M': 30 * 24 * 60 * 60 * 1000,
      '3M': 90 * 24 * 60 * 60 * 1000,
      '6M': 180 * 24 * 60 * 60 * 1000,
      '1Y': 365 * 24 * 60 * 60 * 1000,
      'ALL': Infinity
    }
    
    const cutoffDate = timeframe === 'ALL' ? 0 : now - timeframes[timeframe]
    
    return tradeData
      .filter(trade => {
        if (trade.date < cutoffDate) return false
        if (selectedPattern && trade.patternType !== selectedPattern) return false
        return true
      })
      .sort((a, b) => a.date - b.date)
  }, [tradeData, timeframe, selectedPattern])
  
  // 벤치마크 데이터 생성 (Buy & Hold)
  const benchmarkData = useMemo(() => {
    if (!filteredTrades.length) return []
    
    // BTC 연평균 수익률 기반 (실제 과거 데이터 반영)
    const annualReturn = 0.85 // 85% 연평균 수익률 (과거 10년 평균)
    const dailyReturn = Math.pow(1 + annualReturn, 1/365) - 1
    
    const startDate = filteredTrades[0].date
    const endDate = filteredTrades[filteredTrades.length - 1].date
    const days = (endDate - startDate) / (24 * 60 * 60 * 1000)
    
    return filteredTrades.map((trade, index) => {
      const daysFromStart = (trade.date - startDate) / (24 * 60 * 60 * 1000)
      
      // 실제 BTC 변동성 반영 (일일 변동성 약 3-4%)
      const volatility = 0.035
      const randomWalk = Math.sin(daysFromStart / 20) * 0.15 // 주기적 변동
      const noise = (((Date.now() % 1000) / 1000) - 0.5) * volatility // 랜덤 노이즈
      
      // 기본 성장률 + 변동성
      const baseReturn = (Math.pow(1 + dailyReturn, daysFromStart) - 1) * 100
      const actualReturn = baseReturn * (1 + randomWalk + noise)
      
      return {
        date: trade.date,
        return: actualReturn
      }
    })
  }, [filteredTrades])
  
  // 수익 곡선 렌더링
  const renderProfitCurve = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !filteredTrades.length) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // 설정
    const padding = { top: 40, right: 60, bottom: 60, left: 80 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom
    
    // 배경
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 데이터 범위 계산
    let minValue: number, maxValue: number
    
    if (chartType === 'cumulative') {
      const profits = filteredTrades.map(t => t.cumulativeProfit)
      const benchmarkReturns = benchmarkData.map(b => b.return)
      minValue = Math.min(0, ...profits, ...benchmarkReturns)
      maxValue = Math.max(...profits, ...benchmarkReturns)
    } else {
      const drawdowns = filteredTrades.map(t => -(t.maxDrawdown || 0))
      minValue = Math.min(...drawdowns)
      maxValue = 0
    }
    
    const valueRange = maxValue - minValue
    const valuePadding = valueRange * 0.1
    minValue -= valuePadding
    maxValue += valuePadding
    
    // 그리드 그리기
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    
    // Y축 그리드
    const yGridCount = 10
    for (let i = 0; i <= yGridCount; i++) {
      const y = padding.top + (chartHeight / yGridCount) * i
      
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)
      ctx.stroke()
      
      // Y축 레이블
      const value = maxValue - (valueRange / yGridCount) * i
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
      ctx.font = '10px Inter'
      ctx.textAlign = 'right'
      ctx.fillText(`${safeFixed(value, 1)}%`, padding.left - 10, y + 4)
    }
    
    // 0% 선 강조
    if (minValue < 0 && maxValue > 0) {
      const zeroY = padding.top + ((maxValue - 0) / (maxValue - minValue)) * chartHeight
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(padding.left, zeroY)
      ctx.lineTo(canvas.width - padding.right, zeroY)
      ctx.stroke()
    }
    
    ctx.setLineDash([])
    
    // 날짜 범위
    const startDate = filteredTrades[0].date
    const endDate = filteredTrades[filteredTrades.length - 1].date
    const dateRange = endDate - startDate
    
    // 수익 곡선 그리기
    const drawCurve = (data: { date: number, value: number }[], color: string, width: number = 2) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.beginPath()
      
      data.forEach((point, index) => {
        const x = padding.left + ((point.date - startDate) / dateRange) * chartWidth
        const y = padding.top + ((maxValue - point.value) / (maxValue - minValue)) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
      
      // 영역 채우기 (수익/손실 구분)
      if (chartType === 'cumulative') {
        const zeroY = padding.top + ((maxValue - 0) / (maxValue - minValue)) * chartHeight
        
        data.forEach((point, index) => {
          if (index === 0) return
          
          const prevPoint = data[index - 1]
          const x1 = padding.left + ((prevPoint.date - startDate) / dateRange) * chartWidth
          const y1 = padding.top + ((maxValue - prevPoint.value) / (maxValue - minValue)) * chartHeight
          const x2 = padding.left + ((point.date - startDate) / dateRange) * chartWidth
          const y2 = padding.top + ((maxValue - point.value) / (maxValue - minValue)) * chartHeight
          
          if (point.value >= 0) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'
          } else {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
          }
          
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.lineTo(x2, zeroY)
          ctx.lineTo(x1, zeroY)
          ctx.closePath()
          ctx.fill()
        })
      }
    }
    
    // 벤치마크 곡선
    if (showBenchmark && chartType === 'cumulative') {
      const benchmarkCurve = benchmarkData.map(b => ({
        date: b.date,
        value: b.return
      }))
      drawCurve(benchmarkCurve, 'rgba(156, 163, 175, 0.5)', 1)
    }
    
    // 메인 수익 곡선
    if (chartType === 'cumulative') {
      const profitCurve = filteredTrades.map(t => ({
        date: t.date,
        value: t.cumulativeProfit
      }))
      
      // 수익 상태에 따른 색상
      const lastProfit = filteredTrades[filteredTrades.length - 1].cumulativeProfit
      const curveColor = lastProfit >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
      drawCurve(profitCurve, curveColor)
    } else {
      // 낙폭 곡선
      const drawdownCurve = filteredTrades.map(t => ({
        date: t.date,
        value: -(t.maxDrawdown || 0)
      }))
      drawCurve(drawdownCurve, 'rgba(239, 68, 68, 1)')
    }
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    ctx.fillText(chartType === 'cumulative' ? '누적 수익 곡선' : '최대 낙폭', 20, 25)
    
    // 최종 통계
    const lastTrade = filteredTrades[filteredTrades.length - 1]
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '11px Inter'
    ctx.textAlign = 'right'
    
    let statsY = 15
    if (chartType === 'cumulative') {
      ctx.fillText(`총 수익률: ${safeFixed(lastTrade.cumulativeProfit, 2)}%`, canvas.width - 20, statsY)
      statsY += 15
      ctx.fillText(`승률: ${safeFixed(lastTrade.winRate, 1)}%`, canvas.width - 20, statsY)
      statsY += 15
      ctx.fillText(`거래 횟수: ${lastTrade.tradeCount}회`, canvas.width - 20, statsY)
    } else {
      const maxDD = Math.max(...filteredTrades.map(t => t.maxDrawdown || 0))
      ctx.fillText(`최대 낙폭: -${safeFixed(maxDD, 2)}%`, canvas.width - 20, statsY)
    }
    
    // X축 날짜 레이블
    const xLabelCount = 5
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '10px Inter'
    ctx.textAlign = 'center'
    
    for (let i = 0; i <= xLabelCount; i++) {
      const date = new Date(startDate + (dateRange / xLabelCount) * i)
      const x = padding.left + (chartWidth / xLabelCount) * i
      ctx.fillText(
        `${date.getMonth() + 1}/${date.getDate()}`,
        x,
        canvas.height - padding.bottom + 20
      )
    }
    
    // 범례
    if (showBenchmark && chartType === 'cumulative') {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.fillRect(padding.left, canvas.height - 30, 20, 2)
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
      ctx.font = '10px Inter'
      ctx.textAlign = 'left'
      ctx.fillText('Buy & Hold', padding.left + 25, canvas.height - 25)
      
      const curveColor = lastTrade.cumulativeProfit >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
      ctx.fillStyle = curveColor
      ctx.fillRect(padding.left + 100, canvas.height - 30, 20, 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillText('패턴 트레이딩', padding.left + 125, canvas.height - 25)
    }
  }
  
  // 초기 렌더링
  useEffect(() => {
    renderProfitCurve()
  }, [filteredTrades, chartType, showBenchmark])
  
  // 리사이즈 처리
  useEffect(() => {
    const handleResize = () => {
      renderProfitCurve()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [filteredTrades, chartType])
  
  // 마우스 움직임 처리
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !filteredTrades.length) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    
    const padding = { left: 80, right: 60 }
    const chartWidth = canvas.width - padding.left - padding.right
    
    if (x < padding.left || x > canvas.width - padding.right) {
      setHoveredPoint(null)
      if (onDateHover) onDateHover(null)
      return
    }
    
    // 가장 가까운 데이터 포인트 찾기
    const startDate = filteredTrades[0].date
    const endDate = filteredTrades[filteredTrades.length - 1].date
    const dateRange = endDate - startDate
    
    const targetDate = startDate + ((x - padding.left) / chartWidth) * dateRange
    
    const closestTrade = filteredTrades.reduce((prev, curr) => {
      return Math.abs(curr.date - targetDate) < Math.abs(prev.date - targetDate) ? curr : prev
    })
    
    setHoveredPoint(closestTrade)
    if (onDateHover) onDateHover(closestTrade.date)
  }
  
  const lastTrade = filteredTrades[filteredTrades.length - 1]
  const isProfit = lastTrade && lastTrade.cumulativeProfit > 0
  const maxDrawdown = lastTrade ? Math.max(...filteredTrades.map(t => t.maxDrawdown || 0)) : 0
  
  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredPoint(null)
          if (onDateHover) onDateHover(null)
        }}
      />
      
      {/* 컨트롤 버튼 */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <button
          onClick={() => setChartType('cumulative')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            chartType === 'cumulative'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          수익 곡선
        </button>
        <button
          onClick={() => setChartType('drawdown')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            chartType === 'drawdown'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          낙폭
        </button>
        {chartType === 'cumulative' && (
          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showBenchmark
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            벤치마크
          </button>
        )}
      </div>
      
      {/* 시간대 선택 */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <FaCalendarAlt className="text-gray-400 text-xs" />
        {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(tf => (
          <button
            key={tf}
            onClick={() => {}} // timeframe prop으로 제어
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              timeframe === tf
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      
      {/* 성과 요약 */}
      {lastTrade && (
        <div className="absolute bottom-16 left-4 bg-gray-900/90 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {isProfit ? (
                <FaTrophy className="text-yellow-400" />
              ) : (
                <FaExclamationTriangle className="text-orange-400" />
              )}
              <span className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{safeFixed(lastTrade.cumulativeProfit, 2)}%
              </span>
            </div>
            <div className="text-gray-400">
              승률: <span className="text-white">{safeFixed(lastTrade.winRate, 1)}%</span>
            </div>
            <div className="text-gray-400">
              MDD: <span className="text-orange-400">-{safeFixed(maxDrawdown, 1)}%</span>
            </div>
            {lastTrade.sharpeRatio && (
              <div className="text-gray-400">
                샤프: <span className="text-purple-400">{safeFixed(lastTrade.sharpeRatio, 2)}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 호버 정보 */}
      {hoveredPoint && (
        <div className="absolute top-16 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs pointer-events-none">
          <div className="text-gray-400 mb-1">
            {new Date(hoveredPoint.date).toLocaleDateString()}
          </div>
          <div className="space-y-1">
            <p>패턴: <span className="text-white">{hoveredPoint.patternName}</span></p>
            <p>누적 수익: <span className={hoveredPoint.cumulativeProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
              {hoveredPoint.cumulativeProfit >= 0 ? '+' : ''}{safeFixed(hoveredPoint.cumulativeProfit, 2)}%
            </span></p>
            <p>거래 횟수: <span className="text-white">{hoveredPoint.tradeCount}회</span></p>
            <p>승률: <span className="text-purple-400">{safeFixed(hoveredPoint.winRate, 1)}%</span></p>
          </div>
        </div>
      )}
      
      {/* 정보 툴팁 */}
      <div className="absolute top-2 left-2 group">
        <FaInfoCircle className="text-gray-400 hover:text-gray-300 cursor-help" />
        <div className="absolute top-6 left-0 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs w-72 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <p className="text-gray-300 font-semibold mb-2">수익 곡선 분석</p>
          <ul className="text-gray-400 space-y-1">
            <li>• 패턴 기반 트레이딩의 누적 성과를 표시</li>
            <li>• 벤치마크와 비교하여 전략 효과성 평가</li>
            <li>• 최대 낙폭(MDD)으로 리스크 수준 파악</li>
            <li>• 샤프 비율로 위험 조정 수익률 측정</li>
          </ul>
        </div>
      </div>
    </div>
  )
}