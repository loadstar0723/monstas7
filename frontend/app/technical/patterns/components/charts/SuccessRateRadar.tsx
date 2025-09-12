'use client'

import { useEffect, useRef, useMemo } from 'react'
import { safeFixed, safePercent } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FaChartLine, FaInfoCircle, FaTrophy, FaExclamationTriangle } from 'react-icons/fa'

interface PatternSuccessData {
  patternType: string
  patternName: string
  successRate: number
  totalOccurrences: number
  avgProfit: number
  avgLoss: number
  winLossRatio: number
  confidence: number
}

interface SuccessRateRadarProps {
  data: PatternSuccessData[]
  selectedPattern?: string
  onPatternSelect?: (pattern: string) => void
}

export default function SuccessRateRadar({
  data = [],
  selectedPattern,
  onPatternSelect
}: SuccessRateRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  
  // 샘플 데이터 생성
  const generateSampleData = (): PatternSuccessData[] => {
    const patterns = [
      { type: 'headAndShoulders', name: '헤드앤숄더' },
      { type: 'doubleTop', name: '이중천정' },
      { type: 'doubleBottom', name: '이중바닥' },
      { type: 'triangle', name: '삼각형' },
      { type: 'wedge', name: '쐐기' },
      { type: 'flag', name: '깃발' },
      { type: 'pennant', name: '페넌트' },
      { type: 'cup', name: '컵앤핸들' },
      { type: 'rectangle', name: '직사각형' },
      { type: 'roundingTop', name: '라운딩탑' }
    ]
    
    return patterns.map(pattern => ({
      patternType: pattern.type,
      patternName: pattern.name,
      successRate: 50 + ((Date.now() % 1000) / 1000) * 40, // 50-90%
      totalOccurrences: Math.floor(100 + ((Date.now() % 1000) / 1000) * 900), // 100-1000
      avgProfit: 2 + ((Date.now() % 1000) / 1000) * 8, // 2-10%
      avgLoss: -(1 + ((Date.now() % 1000) / 1000) * 4), // -1 ~ -5%
      winLossRatio: 1.5 + ((Date.now() % 1000) / 1000) * 2, // 1.5-3.5
      confidence: 60 + ((Date.now() % 1000) / 1000) * 35 // 60-95%
    }))
  }
  
  const successData = useMemo(() => {
    return data.length > 0 ? data : generateSampleData()
  }, [data])
  
  // 각도 계산
  const angleStep = (Math.PI * 2) / successData.length
  const centerX = 250
  const centerY = 250
  const maxRadius = 180
  
  // 좌표 계산
  const getCoordinates = (value: number, index: number, radius: number = maxRadius) => {
    const normalizedValue = value / 100 // 0-100을 0-1로 정규화
    const angle = index * angleStep - Math.PI / 2 // 12시 방향부터 시작
    const r = radius * normalizedValue
    
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    }
  }
  
  // 색상 결정
  const getColorByRate = (rate: number) => {
    if (rate >= 80) return 'rgba(34, 197, 94, 0.8)' // 초록색
    if (rate >= 70) return 'rgba(59, 130, 246, 0.8)' // 파란색
    if (rate >= 60) return 'rgba(250, 204, 21, 0.8)' // 노란색
    if (rate >= 50) return 'rgba(251, 146, 60, 0.8)' // 주황색
    return 'rgba(239, 68, 68, 0.8)' // 빨간색
  }
  
  // 레이더 차트 렌더링
  const renderRadarChart = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    canvas.width = 500
    canvas.height = 500
    
    // 배경
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 그리드 그리기
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    
    // 동심원 그리기
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, Math.PI * 2)
      ctx.stroke()
      
      // 퍼센트 레이블
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(156, 163, 175, 0.6)'
        ctx.font = '10px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(`${i * 20}%`, centerX + (maxRadius / 5) * i + 15, centerY + 3)
      }
    }
    
    // 축 그리기
    successData.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2
      const x = centerX + maxRadius * Math.cos(angle)
      const y = centerY + maxRadius * Math.sin(angle)
      
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })
    
    // 데이터 영역 그리기
    ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'
    ctx.lineWidth = 2
    
    ctx.beginPath()
    successData.forEach((pattern, index) => {
      const coord = getCoordinates(pattern.successRate, index)
      if (index === 0) {
        ctx.moveTo(coord.x, coord.y)
      } else {
        ctx.lineTo(coord.x, coord.y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 데이터 포인트 그리기
    successData.forEach((pattern, index) => {
      const coord = getCoordinates(pattern.successRate, index)
      const isSelected = selectedPattern === pattern.patternType
      
      // 포인트
      ctx.fillStyle = getColorByRate(pattern.successRate)
      ctx.beginPath()
      ctx.arc(coord.x, coord.y, isSelected ? 8 : 5, 0, Math.PI * 2)
      ctx.fill()
      
      if (isSelected) {
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      
      // 성공률 표시
      ctx.fillStyle = 'white'
      ctx.font = isSelected ? 'bold 11px Inter' : '10px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(`${safeFixed(pattern.successRate, 1)}%`, coord.x, coord.y - 10)
    })
    
    // 패턴 이름 레이블
    successData.forEach((pattern, index) => {
      const angle = index * angleStep - Math.PI / 2
      const labelRadius = maxRadius + 30
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)
      
      ctx.fillStyle = selectedPattern === pattern.patternType ? 'white' : 'rgba(255, 255, 255, 0.8)'
      ctx.font = selectedPattern === pattern.patternType ? 'bold 12px Inter' : '11px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 각도에 따른 텍스트 위치 조정
      if (angle > -Math.PI/2 && angle < Math.PI/2) {
        ctx.textAlign = 'left'
      } else {
        ctx.textAlign = 'right'
      }
      
      ctx.fillText(pattern.patternName, x, y)
      
      // 발생 횟수 표시
      ctx.fillStyle = 'rgba(156, 163, 175, 0.6)'
      ctx.font = '9px Inter'
      ctx.fillText(`(${pattern.totalOccurrences}회)`, x, y + 12)
    })
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('패턴별 성공률 분석', 20, 25)
    
    // 평균 성공률
    const avgSuccessRate = successData.reduce((sum, p) => sum + p.successRate, 0) / successData.length
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`평균 성공률: ${safeFixed(avgSuccessRate, 1)}%`, centerX, centerY)
  }
  
  // 초기 렌더링
  useEffect(() => {
    renderRadarChart()
  }, [successData, selectedPattern])
  
  // 리사이즈 처리
  useEffect(() => {
    const handleResize = () => {
      renderRadarChart()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [successData, selectedPattern])
  
  // 클릭 이벤트
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !onPatternSelect) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    
    // 클릭된 패턴 찾기
    successData.forEach((pattern, index) => {
      const coord = getCoordinates(pattern.successRate, index)
      const distance = Math.sqrt((x - coord.x) ** 2 + (y - coord.y) ** 2)
      
      if (distance <= 15) { // 클릭 반경
        onPatternSelect(pattern.patternType)
      }
    })
  }
  
  // 선택된 패턴의 상세 정보
  const selectedPatternData = successData.find(p => p.patternType === selectedPattern)
  
  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <canvas 
          ref={canvasRef}
          className="cursor-pointer"
          onClick={handleCanvasClick}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
      
      {/* 선택된 패턴 상세 정보 */}
      {selectedPatternData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-gray-900 border border-purple-500 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold flex items-center gap-2">
              {selectedPatternData.patternName}
              {selectedPatternData.successRate >= 70 && <FaTrophy className="text-yellow-400" />}
              {selectedPatternData.successRate < 60 && <FaExclamationTriangle className="text-orange-400" />}
            </h4>
            <span className={`text-lg font-bold ${
              selectedPatternData.successRate >= 70 ? 'text-green-400' : 
              selectedPatternData.successRate >= 60 ? 'text-yellow-400' : 'text-orange-400'
            }`}>
              {safeFixed(selectedPatternData.successRate, 1)}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-400">발생 횟수</span>
              <p className="text-white font-semibold">{selectedPatternData.totalOccurrences}회</p>
            </div>
            <div>
              <span className="text-gray-400">평균 수익</span>
              <p className="text-green-400 font-semibold">+{safeFixed(selectedPatternData.avgProfit, 1)}%</p>
            </div>
            <div>
              <span className="text-gray-400">평균 손실</span>
              <p className="text-red-400 font-semibold">{safeFixed(selectedPatternData.avgLoss, 1)}%</p>
            </div>
            <div>
              <span className="text-gray-400">손익비</span>
              <p className="text-purple-400 font-semibold">{safeFixed(selectedPatternData.winLossRatio, 2)}:1</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 정보 툴팁 */}
      <div className="absolute top-2 right-2 group">
        <FaInfoCircle className="text-gray-400 hover:text-gray-300 cursor-help" />
        <div className="absolute top-6 right-0 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <p className="text-gray-300 font-semibold mb-2">성공률 분석 가이드</p>
          <ul className="text-gray-400 space-y-1">
            <li>• 중심에서 멀수록 성공률이 높음</li>
            <li>• 색상으로 성공률 구간 표시</li>
            <li>• 클릭하여 상세 정보 확인</li>
            <li>• 괄호 안은 총 발생 횟수</li>
          </ul>
        </div>
      </div>
    </div>
  )
}