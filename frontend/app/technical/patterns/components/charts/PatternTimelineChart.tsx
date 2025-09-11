'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { safeFixed, safePrice } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCalendarAlt, FaFilter, FaChartLine, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

interface PatternEvent {
  id: string
  patternType: string
  patternName: string
  startTime: number
  endTime: number
  detectedTime: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  actualExitPrice?: number
  result?: 'success' | 'failure' | 'pending'
  profitLoss?: number
  confidence: number
}

interface PatternTimelineChartProps {
  events: PatternEvent[]
  currentTime?: number
  selectedTypes?: string[]
  onEventClick?: (event: PatternEvent) => void
}

export default function PatternTimelineChart({
  events = [],
  currentTime = Date.now(),
  selectedTypes = [],
  onEventClick
}: PatternTimelineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredEvent, setHoveredEvent] = useState<PatternEvent | null>(null)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [filterResult, setFilterResult] = useState<'all' | 'success' | 'failure' | 'pending'>('all')
  
  // 패턴 타입별 색상
  const patternColors: Record<string, string> = {
    headAndShoulders: '#EF4444', // 빨강
    doubleTop: '#F59E0B', // 주황
    doubleBottom: '#10B981', // 초록
    triangle: '#3B82F6', // 파랑
    wedge: '#8B5CF6', // 보라
    flag: '#EC4899', // 핑크
    pennant: '#14B8A6', // 청록
    cup: '#F43F5E', // 로즈
    rectangle: '#6B7280', // 회색
    roundingTop: '#A855F7' // 보라
  }
  
  // 샘플 데이터 생성
  const generateSampleEvents = (): PatternEvent[] => {
    const patterns = [
      { type: 'headAndShoulders', name: '헤드앤숄더' },
      { type: 'doubleTop', name: '이중천정' },
      { type: 'doubleBottom', name: '이중바닥' },
      { type: 'triangle', name: '삼각형' },
      { type: 'wedge', name: '쐐기' },
      { type: 'flag', name: '깃발' },
      { type: 'pennant', name: '페넌트' },
      { type: 'cup', name: '컵앤핸들' }
    ]
    
    const sampleEvents: PatternEvent[] = []
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    
    // 30일 간의 이벤트 생성
    for (let i = 0; i < 100; i++) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)]
      const daysAgo = Math.random() * 30
      const detectedTime = now - (daysAgo * dayMs)
      const startTime = detectedTime - (Math.random() * 4 * 60 * 60 * 1000) // 4시간 전
      const endTime = detectedTime + (Math.random() * 24 * 60 * 60 * 1000) // 24시간 후
      
      const entryPrice = 45000 + Math.random() * 10000
      const isLong = Math.random() > 0.5
      const targetPercent = 2 + Math.random() * 8 // 2-10%
      const stopPercent = 1 + Math.random() * 3 // 1-4%
      
      const targetPrice = isLong 
        ? entryPrice * (1 + targetPercent / 100)
        : entryPrice * (1 - targetPercent / 100)
      
      const stopLoss = isLong
        ? entryPrice * (1 - stopPercent / 100)
        : entryPrice * (1 + stopPercent / 100)
      
      // 과거 이벤트는 결과가 있음
      const isPast = endTime < now
      let result: 'success' | 'failure' | 'pending' = 'pending'
      let actualExitPrice: number | undefined
      let profitLoss: number | undefined
      
      if (isPast) {
        const successRate = Math.random()
        result = successRate > 0.4 ? 'success' : 'failure' // 60% 성공률
        
        if (result === 'success') {
          actualExitPrice = targetPrice + (Math.random() * 500 - 250)
          profitLoss = ((actualExitPrice - entryPrice) / entryPrice) * 100
        } else {
          actualExitPrice = stopLoss + (Math.random() * 500 - 250)
          profitLoss = ((actualExitPrice - entryPrice) / entryPrice) * 100
        }
      }
      
      sampleEvents.push({
        id: `event-${i}`,
        patternType: pattern.type,
        patternName: pattern.name,
        startTime,
        endTime,
        detectedTime,
        entryPrice,
        targetPrice,
        stopLoss,
        actualExitPrice,
        result,
        profitLoss,
        confidence: 60 + Math.random() * 35
      })
    }
    
    return sampleEvents.sort((a, b) => a.detectedTime - b.detectedTime)
  }
  
  const timelineEvents = useMemo(() => {
    return events.length > 0 ? events : generateSampleEvents()
  }, [events])
  
  // 시간 범위에 따른 필터링
  const filteredEvents = useMemo(() => {
    const now = currentTime
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const rangeStart = now - ranges[timeRange]
    
    return timelineEvents
      .filter(event => {
        // 시간 범위 필터
        if (event.detectedTime < rangeStart) return false
        
        // 패턴 타입 필터
        if (selectedTypes.length > 0 && !selectedTypes.includes(event.patternType)) {
          return false
        }
        
        // 결과 필터
        if (filterResult !== 'all' && event.result !== filterResult) {
          return false
        }
        
        return true
      })
  }, [timelineEvents, currentTime, timeRange, selectedTypes, filterResult])
  
  // 타임라인 렌더링
  const renderTimeline = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // 설정
    const padding = { top: 60, right: 20, bottom: 60, left: 100 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom
    
    // 배경
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (filteredEvents.length === 0) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.6)'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('선택된 기간에 패턴이 없습니다', canvas.width / 2, canvas.height / 2)
      return
    }
    
    // 시간 스케일 계산
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const rangeMs = timeRanges[timeRange]
    const startTime = currentTime - rangeMs
    const endTime = currentTime
    
    // Y축 위치 계산 (패턴별 레인)
    const patternTypes = Array.from(new Set(filteredEvents.map(e => e.patternType)))
    const laneHeight = Math.min(50, chartHeight / Math.max(patternTypes.length, 1))
    const laneSpacing = 5
    
    // 배경 레인 그리기
    patternTypes.forEach((type, index) => {
      const y = padding.top + index * (laneHeight + laneSpacing)
      
      ctx.fillStyle = index % 2 === 0 ? 'rgba(31, 41, 55, 0.5)' : 'rgba(17, 24, 39, 0.5)'
      ctx.fillRect(padding.left, y, chartWidth, laneHeight)
      
      // 패턴 이름
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '11px Inter'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      const patternName = filteredEvents.find(e => e.patternType === type)?.patternName || type
      ctx.fillText(patternName, padding.left - 10, y + laneHeight / 2)
    })
    
    // 시간 축 그리기
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    
    // 시간 그리드
    const gridCount = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
    for (let i = 0; i <= gridCount; i++) {
      const x = padding.left + (chartWidth / gridCount) * i
      
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
      
      // 시간 레이블
      if (i % (gridCount > 10 ? 5 : 1) === 0) {
        const time = startTime + (rangeMs / gridCount) * i
        const date = new Date(time)
        let label = ''
        
        if (timeRange === '24h') {
          label = date.getHours() + ':00'
        } else if (timeRange === '7d') {
          label = `${date.getMonth() + 1}/${date.getDate()}`
        } else {
          label = `${date.getMonth() + 1}/${date.getDate()}`
        }
        
        ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
        ctx.font = '10px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(label, x, padding.top + chartHeight + 10)
      }
    }
    
    // 현재 시간선
    const nowX = padding.left + chartWidth
    ctx.strokeStyle = 'rgba(139, 92, 246, 1)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(nowX, padding.top)
    ctx.lineTo(nowX, padding.top + chartHeight)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 이벤트 그리기
    filteredEvents.forEach(event => {
      const typeIndex = patternTypes.indexOf(event.patternType)
      const y = padding.top + typeIndex * (laneHeight + laneSpacing)
      
      // 이벤트 위치 계산
      const startX = padding.left + ((event.startTime - startTime) / rangeMs) * chartWidth
      const endX = padding.left + ((event.endTime - startTime) / rangeMs) * chartWidth
      const detectedX = padding.left + ((event.detectedTime - startTime) / rangeMs) * chartWidth
      
      // 패턴 기간 막대
      const barHeight = laneHeight * 0.6
      const barY = y + (laneHeight - barHeight) / 2
      
      // 결과에 따른 색상
      let fillColor = patternColors[event.patternType] || '#6B7280'
      if (event.result === 'success') {
        ctx.fillStyle = fillColor.replace(')', ', 0.8)')
      } else if (event.result === 'failure') {
        ctx.fillStyle = fillColor.replace(')', ', 0.3)')
      } else {
        ctx.fillStyle = fillColor.replace(')', ', 0.6)')
      }
      
      // 막대 그리기
      ctx.fillRect(Math.max(padding.left, startX), barY, Math.min(endX - startX, chartWidth + padding.left - startX), barHeight)
      
      // 테두리
      if (event.result === 'success') {
        ctx.strokeStyle = 'rgba(34, 197, 94, 1)'
        ctx.lineWidth = 2
      } else if (event.result === 'failure') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 1)'
        ctx.lineWidth = 1
      } else {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'
        ctx.lineWidth = 1
      }
      
      ctx.strokeRect(Math.max(padding.left, startX), barY, Math.min(endX - startX, chartWidth + padding.left - startX), barHeight)
      
      // 감지 시점 마커
      if (detectedX >= padding.left && detectedX <= padding.left + chartWidth) {
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(detectedX, y + laneHeight / 2, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // 신뢰도 표시 (높은 신뢰도만)
      if (event.confidence > 80 && endX - startX > 30) {
        ctx.fillStyle = 'white'
        ctx.font = '9px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(`${Math.round(event.confidence)}%`, (startX + endX) / 2, barY + barHeight / 2 + 3)
      }
    })
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('패턴 타임라인', 20, 25)
    
    // 범례
    const legendY = 20
    let legendX = canvas.width - 300
    
    // 성공
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
    ctx.fillRect(legendX, legendY, 15, 15)
    ctx.fillStyle = 'white'
    ctx.font = '11px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('성공', legendX + 20, legendY + 12)
    
    legendX += 60
    
    // 실패
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.fillRect(legendX, legendY, 15, 15)
    ctx.fillStyle = 'white'
    ctx.fillText('실패', legendX + 20, legendY + 12)
    
    legendX += 60
    
    // 진행중
    ctx.fillStyle = 'rgba(139, 92, 246, 0.6)'
    ctx.fillRect(legendX, legendY, 15, 15)
    ctx.fillStyle = 'white'
    ctx.fillText('진행중', legendX + 20, legendY + 12)
    
    // 통계
    const successCount = filteredEvents.filter(e => e.result === 'success').length
    const failureCount = filteredEvents.filter(e => e.result === 'failure').length
    const pendingCount = filteredEvents.filter(e => e.result === 'pending').length
    const successRate = successCount + failureCount > 0 
      ? (successCount / (successCount + failureCount)) * 100 
      : 0
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '11px Inter'
    ctx.textAlign = 'right'
    ctx.fillText(`성공률: ${safeFixed(successRate, 1)}% (${successCount}/${successCount + failureCount})`, 
                 canvas.width - 20, canvas.height - 10)
  }
  
  // 초기 렌더링
  useEffect(() => {
    renderTimeline()
  }, [filteredEvents, timeRange, currentTime])
  
  // 리사이즈 처리
  useEffect(() => {
    const handleResize = () => {
      renderTimeline()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [filteredEvents])
  
  // 마우스 이벤트 처리
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 호버된 이벤트 찾기
    const padding = { top: 60, right: 20, bottom: 60, left: 100 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom
    
    const patternTypes = Array.from(new Set(filteredEvents.map(e => e.patternType)))
    const laneHeight = Math.min(50, chartHeight / Math.max(patternTypes.length, 1))
    const laneSpacing = 5
    
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const rangeMs = timeRanges[timeRange]
    const startTime = currentTime - rangeMs
    
    let foundEvent = null
    
    filteredEvents.forEach(event => {
      const typeIndex = patternTypes.indexOf(event.patternType)
      const eventY = padding.top + typeIndex * (laneHeight + laneSpacing)
      
      const startX = padding.left + ((event.startTime - startTime) / rangeMs) * chartWidth
      const endX = padding.left + ((event.endTime - startTime) / rangeMs) * chartWidth
      
      const barHeight = laneHeight * 0.6
      const barY = eventY + (laneHeight - barHeight) / 2
      
      if (x >= startX && x <= endX && y >= barY && y <= barY + barHeight) {
        foundEvent = event
      }
    })
    
    setHoveredEvent(foundEvent)
  }
  
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredEvent && onEventClick) {
      onEventClick(hoveredEvent)
    }
  }
  
  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredEvent(null)}
        onClick={handleClick}
      />
      
      {/* 시간 범위 선택 */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <button
          onClick={() => setTimeRange('24h')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            timeRange === '24h'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          24시간
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            timeRange === '7d'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          7일
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            timeRange === '30d'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          30일
        </button>
      </div>
      
      {/* 결과 필터 */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <FaFilter className="text-gray-400 text-sm" />
        <button
          onClick={() => setFilterResult('all')}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            filterResult === 'all'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilterResult('success')}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            filterResult === 'success'
              ? 'bg-green-600/20 text-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          성공
        </button>
        <button
          onClick={() => setFilterResult('failure')}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            filterResult === 'failure'
              ? 'bg-red-600/20 text-red-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          실패
        </button>
        <button
          onClick={() => setFilterResult('pending')}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            filterResult === 'pending'
              ? 'bg-purple-600/20 text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          진행중
        </button>
      </div>
      
      {/* 호버 정보 */}
      <AnimatePresence>
        {hoveredEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs max-w-xs pointer-events-none z-20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">{hoveredEvent.patternName}</span>
              {hoveredEvent.result === 'success' && <FaCheckCircle className="text-green-400" />}
              {hoveredEvent.result === 'failure' && <FaTimesCircle className="text-red-400" />}
            </div>
            <div className="space-y-1 text-gray-400">
              <p>감지: {new Date(hoveredEvent.detectedTime).toLocaleString('ko-KR')}</p>
              <p>진입가: <span className="text-white">${safePrice(hoveredEvent.entryPrice)}</span></p>
              <p>목표가: <span className="text-green-400">${safePrice(hoveredEvent.targetPrice)}</span></p>
              <p>손절가: <span className="text-red-400">${safePrice(hoveredEvent.stopLoss)}</span></p>
              {hoveredEvent.profitLoss !== undefined && (
                <p>손익: <span className={hoveredEvent.profitLoss > 0 ? 'text-green-400' : 'text-red-400'}>
                  {hoveredEvent.profitLoss > 0 ? '+' : ''}{safeFixed(hoveredEvent.profitLoss, 2)}%
                </span></p>
              )}
              <p>신뢰도: <span className="text-purple-400">{safeFixed(hoveredEvent.confidence, 1)}%</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}