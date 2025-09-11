'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FootprintCell } from '../types'
import { groupByTimeframe, calculatePOC, calculateValueArea } from '../utils/calculations'
import { FOOTPRINT_CONFIG } from '../config/constants'

interface FootprintChartProps {
  data: FootprintCell[]
  symbol: string
  timeframe: string
}

export default function FootprintChart({ data, symbol, timeframe }: FootprintChartProps) {
  // 시간대별로 그룹화된 데이터
  const groupedData = useMemo(() => {
    return groupByTimeframe(data, timeframe)
  }, [data, timeframe])
  
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">풋프린트 차트</h3>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">데이터를 수집 중입니다...</div>
            <div className="text-sm text-gray-500">실시간 거래 데이터가 곧 표시됩니다.</div>
          </div>
        </div>
      </div>
    )
  }

  // 가격 범위 계산
  const priceRange = useMemo(() => {
    if (!groupedData.length) return { min: 0, max: 0, step: 10 }
    
    const prices = groupedData.map(d => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    // 가격 단계 계산 (심볼에 따라 다르게)
    const step = FOOTPRINT_CONFIG.PRICE_GROUPING[symbol] * 10 || 10
    
    return {
      min: Math.floor(min / step) * step,
      max: Math.ceil(max / step) * step,
      step
    }
  }, [groupedData, symbol])

  // 시간 목록
  const timeSlots = useMemo(() => {
    const slots = new Set(groupedData.map(d => d.time))
    return Array.from(slots).sort()
  }, [groupedData])

  // POC 및 밸류 에어리어
  const poc = useMemo(() => calculatePOC(groupedData), [groupedData])
  const valueArea = useMemo(() => calculateValueArea(groupedData), [groupedData])

  // 최대 볼륨 (색상 농도 계산용)
  const maxVolume = useMemo(() => {
    return Math.max(...groupedData.map(d => Math.max(d.buyVolume, d.sellVolume)))
  }, [groupedData])

  // 셀 데이터 가져오기
  const getCellData = (time: string, price: number) => {
    return groupedData.find(d => d.time === time && Math.abs(d.price - price) < priceRange.step)
  }

  // 색상 계산
  const getCellColor = (cell: FootprintCell | undefined) => {
    if (!cell) return 'bg-gray-800/20'
    
    const intensity = Math.max(cell.buyVolume, cell.sellVolume) / maxVolume
    const opacity = Math.min(FOOTPRINT_CONFIG.OPACITY_MAX, FOOTPRINT_CONFIG.OPACITY_BASE + intensity * FOOTPRINT_CONFIG.OPACITY_INTENSITY_FACTOR)
    
    if (cell.delta > 0) {
      return `rgba(16, 185, 129, ${opacity})` // green-500
    } else if (cell.delta < 0) {
      return `rgba(239, 68, 68, ${opacity})` // red-500
    } else {
      return `rgba(156, 163, 175, ${opacity})` // gray-400
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6">풋프린트 차트</h3>
      
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          {/* 시간 헤더 */}
          <div className="flex">
            <div className="w-20 h-8"></div>
            {timeSlots.map(time => (
              <div key={time} className="flex-1 text-center text-xs text-gray-400 px-1">
                {time}
              </div>
            ))}
          </div>
          
          {/* 차트 그리드 */}
          {(() => {
            const rows = []
            for (let price = priceRange.max; price >= priceRange.min; price -= priceRange.step) {
              rows.push(
                <div key={price} className="flex">
                  {/* 가격 레이블 */}
                  <div className={`w-20 text-right pr-2 text-xs ${
                    price === poc ? 'text-yellow-400 font-bold' :
                    price >= valueArea.low && price <= valueArea.high ? 'text-purple-400' :
                    'text-gray-400'
                  }`}>
                    ${price}
                  </div>
                  
                  {/* 풋프린트 셀 */}
                  {timeSlots.map(time => {
                    const cell = getCellData(time, price)
                    const bgColor = getCellColor(cell)
                    
                    return (
                      <div
                        key={`${time}-${price}`}
                        className="flex-1 h-8 border border-gray-700/30 relative group cursor-pointer"
                        style={{ backgroundColor: bgColor }}
                      >
                        {cell && (
                          <>
                            {/* 델타 표시 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-xs font-medium ${
                                cell.delta > 0 ? 'text-green-300' : 
                                cell.delta < 0 ? 'text-red-300' : 
                                'text-gray-300'
                              }`}>
                                {Math.abs(cell.delta).toFixed(0)}
                              </span>
                            </div>
                            
                            {/* 호버 시 상세 정보 */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-900 rounded shadow-xl hidden group-hover:block z-10 whitespace-nowrap">
                              <div className="text-xs">
                                <div className="text-gray-400">시간: {time}</div>
                                <div className="text-gray-400">가격: ${price}</div>
                                <div className="text-green-400">매수: {safeFixed(cell.buyVolume, 2)}</div>
                                <div className="text-red-400">매도: {safeFixed(cell.sellVolume, 2)}</div>
                                <div className={`${cell.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  델타: {safeFixed(cell.delta, 2)}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            }
            return rows
          })()}
        </div>
      </div>
      
      {/* 범례 */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-400">매수 우세</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-400">매도 우세</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span className="text-gray-400">POC (최다 거래)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-400 rounded"></div>
          <span className="text-gray-400">밸류 에어리어</span>
        </div>
      </div>
      
      {/* 설명 */}
      <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
        <p className="text-sm text-gray-400">
          풋프린트 차트는 각 가격대에서의 매수/매도 압력을 시각화합니다. 
          숫자는 델타값(매수량-매도량)을 나타내며, 색상의 진하기는 거래량을 표시합니다.
        </p>
      </div>
    </div>
  )
}