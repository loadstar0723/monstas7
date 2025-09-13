'use client'

import { useState, useEffect, useMemo } from 'react'

interface HeatmapDataPoint {
  price: number
  time: number
  liquidity: number
  volume: number
}

interface LiquidityHeatmapProps {
  data: HeatmapDataPoint[]
  currentPrice: number
  range: string
  detailed?: boolean
}

export default function LiquidityHeatmap({ 
  data, 
  currentPrice, 
  range, 
  detailed = false 
}: LiquidityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null)
  const [viewMode, setViewMode] = useState<'liquidity' | 'volume'>('liquidity')

  // 히트맵 그리드 데이터 처리
  const heatmapGrid = useMemo(() => {
    if (!data || data.length === 0) return { grid: [], maxValue: 0, minValue: 0 }

    // 가격과 시간 축 설정
    const uniqueTimes = [...new Set(data.map(d => d.time))].sort()
    const priceRange = parseFloat(range.replace('%', '')) / 100
    const minPrice = currentPrice * (1 - priceRange)
    const maxPrice = currentPrice * (1 + priceRange)
    
    // 가격 구간 나누기 (50개 구간)
    const priceSteps = 50
    const priceStepSize = (maxPrice - minPrice) / priceSteps
    const pricePoints = Array.from({ length: priceSteps }, (_, i) => 
      minPrice + (i * priceStepSize)
    )

    // 시간 구간 나누기 (24시간을 24개 구간으로)
    const timeSteps = Math.min(24, uniqueTimes.length)
    const timePoints = uniqueTimes.slice(0, timeSteps)

    // 그리드 데이터 생성
    const grid = []
    let maxValue = 0
    let minValue = Infinity

    for (let t = 0; t < timePoints.length; t++) {
      for (let p = 0; p < pricePoints.length; p++) {
        const timePoint = timePoints[t]
        const pricePoint = pricePoints[p]
        
        // 해당 시간/가격대의 데이터 찾기
        const relevantData = data.filter(d => 
          Math.abs(d.time - timePoint) < 30 * 60 * 1000 && // 30분 오차 허용
          Math.abs(d.price - pricePoint) < priceStepSize
        )
        
        const value = viewMode === 'liquidity' 
          ? relevantData.reduce((sum, d) => sum + d.liquidity, 0)
          : relevantData.reduce((sum, d) => sum + d.volume, 0)
        
        if (value > maxValue) maxValue = value
        if (value < minValue && value > 0) minValue = value
        
        grid.push({
          x: t,
          y: p,
          time: timePoint,
          price: pricePoint,
          value,
          normalizedValue: 0, // 나중에 계산
          originalData: relevantData[0] || { price: pricePoint, time: timePoint, liquidity: 0, volume: 0 }
        })
      }
    }

    // 정규화
    grid.forEach(cell => {
      cell.normalizedValue = maxValue > 0 ? cell.value / maxValue : 0
    })

    return { grid, maxValue, minValue, timePoints, pricePoints }
  }, [data, currentPrice, range, viewMode])

  // 색상 계산
  const getHeatColor = (normalizedValue: number) => {
    if (normalizedValue === 0) return 'rgba(30, 30, 30, 0.3)'
    
    // 차가운 색상 (낮은 값) → 뜨거운 색상 (높은 값)
    const intensity = Math.pow(normalizedValue, 0.7) // 비선형 강도
    
    if (intensity < 0.3) {
      // 파란색 계열
      return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`
    } else if (intensity < 0.6) {
      // 초록색 계열
      return `rgba(34, 197, 94, ${0.4 + intensity * 0.6})`
    } else if (intensity < 0.8) {
      // 노란색 계열
      return `rgba(251, 191, 36, ${0.5 + intensity * 0.5})`
    } else {
      // 빨간색 계열
      return `rgba(239, 68, 68, ${0.6 + intensity * 0.4})`
    }
  }

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  // 값 포맷팅
  const formatValue = (value: number, type: 'liquidity' | 'volume') => {
    if (value === 0) return '0'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }

  const cellSize = detailed ? 12 : 8
  const height = detailed ? 400 : 250

  return (
    <div className="relative">
      {/* 컨트롤 패널 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">모드:</span>
            <button
              onClick={() => setViewMode('liquidity')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'liquidity' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              유동성
            </button>
            <button
              onClick={() => setViewMode('volume')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'volume' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              거래량
            </button>
          </div>
          
          <div className="text-xs text-gray-400">
            범위: {range} • {data?.length || 0}개 데이터
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">강도:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 bg-blue-500/50 rounded"></div>
            <span className="text-gray-500">낮음</span>
            <div className="w-4 h-3 bg-green-500/70 rounded"></div>
            <span className="text-gray-500">보통</span>
            <div className="w-4 h-3 bg-yellow-500/80 rounded"></div>
            <span className="text-gray-500">높음</span>
            <div className="w-4 h-3 bg-red-500/90 rounded"></div>
            <span className="text-gray-500">최고</span>
          </div>
        </div>
      </div>

      {/* 히트맵 차트 */}
      <div 
        className="relative bg-gray-900 rounded-lg p-4 overflow-auto"
        style={{ height }}
      >
        {heatmapGrid.grid.length > 0 ? (
          <div className="relative">
            {/* 현재가 라인 */}
            <div 
              className="absolute w-full border-t-2 border-yellow-400 z-10"
              style={{ 
                top: `${((currentPrice - heatmapGrid.pricePoints[0]) / 
                  (heatmapGrid.pricePoints[heatmapGrid.pricePoints.length - 1] - heatmapGrid.pricePoints[0])) * 100}%`
              }}
            >
              <span className="absolute left-2 -top-3 text-xs text-yellow-400 bg-gray-900 px-1">
                현재가: ${currentPrice.toFixed(2)}
              </span>
            </div>

            {/* Y축 (가격) */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-400">
              {heatmapGrid.pricePoints.slice(0, 10).map((price, i) => (
                <div key={i} className="text-right pr-2">
                  ${formatPrice(price)}
                </div>
              ))}
            </div>

            {/* X축 (시간) */}
            <div className="absolute bottom-0 left-16 right-0 h-8 flex justify-between text-xs text-gray-400">
              {heatmapGrid.timePoints.slice(0, 6).map((time, i) => (
                <div key={i} className="transform rotate-45 origin-left">
                  {formatTime(time)}
                </div>
              ))}
            </div>

            {/* 히트맵 셀들 */}
            <div 
              className="ml-16 mb-8"
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${heatmapGrid.timePoints.length}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${heatmapGrid.pricePoints.length}, ${cellSize}px)`,
                gap: '1px'
              }}
            >
              {heatmapGrid.grid.map((cell, index) => (
                <div
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-110"
                  style={{
                    backgroundColor: getHeatColor(cell.normalizedValue),
                    gridColumn: cell.x + 1,
                    gridRow: heatmapGrid.pricePoints.length - cell.y
                  }}
                  onMouseEnter={() => setHoveredCell(cell.originalData)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-gray-400">데이터 로딩 중...</div>
            </div>
          </div>
        )}
      </div>

      {/* 호버 정보 툴팁 */}
      {hoveredCell && (
        <div className="absolute bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 z-20">
          <div className="text-sm space-y-1">
            <div className="text-white font-medium">
              ${formatPrice(hoveredCell.price)}
            </div>
            <div className="text-gray-400">
              시간: {formatTime(hoveredCell.time)}
            </div>
            <div className="text-purple-400">
              유동성: {formatValue(hoveredCell.liquidity, 'liquidity')}
            </div>
            <div className="text-blue-400">
              거래량: {formatValue(hoveredCell.volume, 'volume')}
            </div>
          </div>
        </div>
      )}

      {/* 상세 통계 (detailed 모드일 때) */}
      {detailed && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">평균 유동성</div>
            <div className="text-lg font-bold text-white">
              {formatValue(
                data.reduce((sum, d) => sum + d.liquidity, 0) / data.length || 0,
                'liquidity'
              )}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">최대 유동성</div>
            <div className="text-lg font-bold text-green-400">
              {formatValue(heatmapGrid.maxValue, viewMode)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">유동성 분포</div>
            <div className="text-lg font-bold text-blue-400">
              균등
            </div>
          </div>
        </div>
      )}
    </div>
  )
}