'use client'

import { useEffect, useRef, useMemo } from 'react'
import { safeFixed } from '@/lib/safeFormat'
import { FaInfoCircle, FaChartArea } from 'react-icons/fa'

interface PatternHeatmapData {
  time: string
  patterns: {
    type: string
    strength: number
    confidence: number
  }[]
}

interface PatternHeatmapProps {
  data: PatternHeatmapData[]
  selectedPattern?: string
  onPatternSelect?: (pattern: string) => void
}

export default function PatternHeatmap({
  data = [],
  selectedPattern,
  onPatternSelect
}: PatternHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 패턴 타입 목록
  const patternTypes = [
    'headAndShoulders',
    'doubleTop',
    'doubleBottom',
    'triangle',
    'wedge',
    'flag',
    'pennant',
    'cup',
    'rectangle',
    'roundingTop'
  ]
  
  const patternNames: Record<string, string> = {
    headAndShoulders: '헤드앤숄더',
    doubleTop: '이중천정',
    doubleBottom: '이중바닥',
    triangle: '삼각형',
    wedge: '쐐기',
    flag: '깃발',
    pennant: '페넌트',
    cup: '컵앤핸들',
    rectangle: '직사각형',
    roundingTop: '라운딩탑'
  }

  // 색상 함수 - 강도에 따른 색상
  const getColorByStrength = (strength: number) => {
    // 0-100 강도를 0-1로 정규화
    const normalized = strength / 100
    
    if (normalized < 0.2) {
      // 약함 - 파란색
      return `rgba(59, 130, 246, ${0.2 + normalized * 2})`
    } else if (normalized < 0.4) {
      // 보통 - 초록색
      return `rgba(34, 197, 94, ${0.3 + (normalized - 0.2) * 2.5})`
    } else if (normalized < 0.6) {
      // 중간 - 노란색
      return `rgba(250, 204, 21, ${0.4 + (normalized - 0.4) * 3})`
    } else if (normalized < 0.8) {
      // 강함 - 주황색
      return `rgba(251, 146, 60, ${0.5 + (normalized - 0.6) * 2.5})`
    } else {
      // 매우 강함 - 빨간색
      return `rgba(239, 68, 68, ${0.6 + (normalized - 0.8) * 2})`
    }
  }

  // 샘플 데이터 생성 (실제로는 props.data 사용)
  const generateSampleData = (): PatternHeatmapData[] => {
    const times = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
    
    return times.map(time => ({
      time,
      patterns: patternTypes.map(type => ({
        type,
        strength: ((Date.now() % 1000) / 1000) * 100,
        confidence: 60 + ((Date.now() % 1000) / 1000) * 40
      }))
    }))
  }

  const heatmapData = useMemo(() => {
    return data.length > 0 ? data : generateSampleData()
  }, [data])

  // 히트맵 렌더링
  const renderHeatmap = () => {
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
    const padding = { top: 40, right: 10, bottom: 40, left: 100 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom
    
    const cellWidth = chartWidth / heatmapData.length
    const cellHeight = chartHeight / patternTypes.length
    
    // 배경
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 히트맵 셀 그리기
    heatmapData.forEach((timeData, timeIndex) => {
      const x = padding.left + timeIndex * cellWidth
      
      timeData.patterns.forEach((pattern, patternIndex) => {
        const y = padding.top + patternIndex * cellHeight
        const isSelected = selectedPattern === pattern.type
        
        // 셀 그리기
        ctx.fillStyle = getColorByStrength(pattern.strength)
        ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1)
        
        // 선택된 패턴 강조
        if (isSelected) {
          ctx.strokeStyle = 'rgba(139, 92, 246, 1)'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, cellWidth - 1, cellHeight - 1)
        }
      })
    })
    
    // Y축 레이블 (패턴 이름)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '12px Inter'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    
    patternTypes.forEach((type, index) => {
      const y = padding.top + index * cellHeight + cellHeight / 2
      ctx.fillText(patternNames[type] || type, padding.left - 10, y)
    })
    
    // X축 레이블 (시간)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    heatmapData.forEach((timeData, index) => {
      if (index % 4 === 0) { // 4시간마다 표시
        const x = padding.left + index * cellWidth + cellWidth / 2
        ctx.fillText(timeData.time, x, canvas.height - padding.bottom + 10)
      }
    })
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('패턴 강도 히트맵', 20, 25)
    
    // 범례
    const legendX = canvas.width - 150
    const legendY = 10
    const legendWidth = 120
    const legendHeight = 20
    
    // 그라데이션 생성
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)')
    gradient.addColorStop(0.25, 'rgba(34, 197, 94, 0.5)')
    gradient.addColorStop(0.5, 'rgba(250, 204, 21, 0.6)')
    gradient.addColorStop(0.75, 'rgba(251, 146, 60, 0.7)')
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight)
    
    ctx.fillStyle = 'white'
    ctx.font = '10px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('약함', legendX, legendY + legendHeight + 15)
    ctx.fillText('강함', legendX + legendWidth, legendY + legendHeight + 15)
  }

  // 초기 렌더링
  useEffect(() => {
    renderHeatmap()
  }, [heatmapData, selectedPattern])

  // 리사이즈 이벤트
  useEffect(() => {
    const handleResize = () => {
      renderHeatmap()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 클릭 이벤트
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !onPatternSelect) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const padding = { top: 40, right: 10, bottom: 40, left: 100 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom
    
    const cellHeight = chartHeight / patternTypes.length
    
    // 클릭된 패턴 찾기
    if (x >= padding.left && x <= canvas.width - padding.right &&
        y >= padding.top && y <= canvas.height - padding.bottom) {
      const patternIndex = Math.floor((y - padding.top) / cellHeight)
      if (patternIndex >= 0 && patternIndex < patternTypes.length) {
        onPatternSelect(patternTypes[patternIndex])
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />
      
      {/* 정보 툴팁 */}
      <div className="absolute top-2 left-2 group">
        <FaInfoCircle className="text-gray-400 hover:text-gray-300 cursor-help" />
        <div className="absolute top-6 left-0 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <p className="text-gray-300 mb-2">
            시간대별 패턴 형성 강도를 시각화합니다.
          </p>
          <ul className="text-gray-400 space-y-1">
            <li>• 파란색: 약한 신호 (0-20%)</li>
            <li>• 초록색: 보통 신호 (20-40%)</li>
            <li>• 노란색: 중간 신호 (40-60%)</li>
            <li>• 주황색: 강한 신호 (60-80%)</li>
            <li>• 빨간색: 매우 강한 신호 (80-100%)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}