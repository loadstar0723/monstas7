'use client'

import React from 'react'

interface SimpleLineChartProps {
  data: any[]
  entryPrice: number
  exitPrice: number
  currentPrice?: number
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, entryPrice, exitPrice, currentPrice }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-800/50 rounded-lg">
        <p className="text-gray-400">차트 데이터 로딩 중...</p>
      </div>
    )
  }

  // 차트에 표시할 데이터 선택 (최근 48개)
  const chartData = data.slice(-48)
  const prices = chartData.map(d => d.price).filter(p => !isNaN(p))
  
  if (prices.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-800/50 rounded-lg">
        <p className="text-gray-400">유효한 가격 데이터가 없습니다</p>
      </div>
    )
  }

  // 최대/최소값 찾기 (안전하게 처리)
  const validPrices = [...prices]
  if (entryPrice && !isNaN(entryPrice)) validPrices.push(entryPrice)
  if (exitPrice && !isNaN(exitPrice)) validPrices.push(exitPrice)
  if (currentPrice && !isNaN(currentPrice)) validPrices.push(currentPrice)
  
  const minPrice = Math.min(...validPrices) * 0.98 // 2% 여백
  const maxPrice = Math.max(...validPrices) * 1.02 // 2% 여백
  const priceRange = maxPrice - minPrice

  // SVG 차트 크기
  const width = 800
  const height = 320
  const padding = { top: 20, right: 80, bottom: 40, left: 80 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // 데이터를 SVG 좌표로 변환
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1 || 1)) * chartWidth + padding.left
    const y = height - padding.bottom - ((d.price - minPrice) / priceRange) * chartHeight
    return { x, y, price: d.price }
  })

  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // 진입가/출구가/현재가 Y 좌표
  const entryY = entryPrice ? height - padding.bottom - ((entryPrice - minPrice) / priceRange) * chartHeight : null
  const exitY = exitPrice ? height - padding.bottom - ((exitPrice - minPrice) / priceRange) * chartHeight : null
  const currentY = currentPrice ? height - padding.bottom - ((currentPrice - minPrice) / priceRange) * chartHeight : null

  // Y축 눈금값 생성
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const ratio = i / 4
    const price = minPrice + ratio * priceRange
    const y = height - padding.bottom - ratio * chartHeight
    return { price, y }
  })

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-4">
      <div className="w-full" style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* 그리드 패턴 */}
            <pattern id="chartGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            
            {/* 그라데이션 */}
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05"/>
            </linearGradient>
          </defs>

          {/* 배경 */}
          <rect width={width} height={height} fill="#111827" rx="8"/>
          <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="url(#chartGrid)" />

          {/* Y축 눈금 및 라벨 */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line 
                x1={padding.left} 
                y1={tick.y} 
                x2={width - padding.right} 
                y2={tick.y} 
                stroke="#374151" 
                strokeWidth="0.5" 
                opacity="0.5"
              />
              <text 
                x={padding.left - 10} 
                y={tick.y + 5} 
                fill="#9CA3AF" 
                fontSize="11" 
                textAnchor="end"
              >
                ${tick.price.toFixed(0)}
              </text>
            </g>
          ))}

          {/* X축 라벨 */}
          <text x={padding.left} y={height - 10} fill="#9CA3AF" fontSize="11">
            -{chartData.length}시간
          </text>
          <text x={width - padding.right} y={height - 10} fill="#9CA3AF" fontSize="11" textAnchor="end">
            현재
          </text>

          {/* 현재가 라인 */}
          {currentY !== null && currentPrice && (
            <g>
              <line 
                x1={padding.left} 
                y1={currentY} 
                x2={width - padding.right} 
                y2={currentY} 
                stroke="#6366F1" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
                opacity="0.8"
              />
              <rect x={width - padding.right + 5} y={currentY - 10} width={70} height="20" fill="#6366F1" rx="3"/>
              <text x={width - padding.right + 40} y={currentY + 4} fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">
                ${currentPrice.toFixed(0)}
              </text>
            </g>
          )}

          {/* 진입가 라인 */}
          {entryY !== null && entryPrice && (
            <g>
              <line 
                x1={padding.left} 
                y1={entryY} 
                x2={width - padding.right} 
                y2={entryY} 
                stroke="#10B981" 
                strokeWidth="1.5" 
                strokeDasharray="5,5"
                opacity="0.8"
              />
              <rect x={width - padding.right + 5} y={entryY - 10} width={70} height="20" fill="#10B981" rx="3"/>
              <text x={width - padding.right + 40} y={entryY + 4} fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">
                진입 ${entryPrice.toFixed(0)}
              </text>
            </g>
          )}

          {/* 출구가 라인 */}
          {exitY !== null && exitPrice && (
            <g>
              <line 
                x1={padding.left} 
                y1={exitY} 
                x2={width - padding.right} 
                y2={exitY} 
                stroke="#F59E0B" 
                strokeWidth="1.5" 
                strokeDasharray="5,5"
                opacity="0.8"
              />
              <rect x={width - padding.right + 5} y={exitY - 10} width={70} height="20" fill="#F59E0B" rx="3"/>
              <text x={width - padding.right + 40} y={exitY + 4} fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">
                목표 ${exitPrice.toFixed(0)}
              </text>
            </g>
          )}

          {/* 차트 영역 채우기 */}
          <path 
            d={`${pathString} L ${points[points.length - 1]?.x || padding.left} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
            fill="url(#areaGradient)"
            opacity="0.7"
          />

          {/* 가격 라인 */}
          <path 
            d={pathString}
            fill="none" 
            stroke="#8B5CF6" 
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 8)) === 0 || i === points.length - 1).map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="3" fill="#8B5CF6" stroke="white" strokeWidth="1.5"/>
              {i === points.filter((_, j) => j % Math.max(1, Math.floor(points.length / 8)) === 0 || j === points.length - 1).length - 1 && (
                <g>
                  <circle cx={point.x} cy={point.y} r="5" fill="#8B5CF6" stroke="white" strokeWidth="2"/>
                  <text x={point.x} y={point.y - 10} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">
                    ${point.price.toFixed(0)}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default SimpleLineChart