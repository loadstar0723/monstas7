'use client'

import React from 'react'

interface InstitutionalFlowChartProps {
  data: any[]
}

export default function InstitutionalFlowChart({ data }: InstitutionalFlowChartProps) {
  // 데이터가 없거나 비어있으면 실제 데이터 수집 중 메시지
  if (!data || data.length === 0) {
    return (
      <div className="h-96 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-2">실시간 VC 거래 데이터 수집 중...</p>
        <p className="text-xs text-gray-500">Binance WebSocket 연결 대기</p>
        <p className="text-xs text-gray-600 mt-4">* $100,000 이상 대규모 거래만 표시됩니다</p>
      </div>
    )
  }

  // 최대값 찾기 (차트 스케일링용)
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.inflow || 0, d.outflow || 0))
  )

  // 디버깅: 데이터 확인 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('InstitutionalFlowChart data:', data)
    console.log('Data length:', data.length)
  }
  
  // 간단한 바 차트 구현
  return (
    <div className="h-96 bg-gray-900/50 rounded-lg p-4">
      {/* 데이터 정보 표시 */}
      <div className="text-xs text-gray-500 mb-2">
        총 {data.length}개 거래 | 최대값: ${maxValue.toLocaleString()}
      </div>
      
      <div className="h-full flex items-end justify-between gap-1">
        {data.slice(-24).map((item, index) => {
          const inflowHeight = maxValue > 0 ? Math.max(1, (item.inflow / maxValue) * 80) : 0
          const outflowHeight = maxValue > 0 ? Math.max(1, (item.outflow / maxValue) * 80) : 0
          const hasData = item.inflow > 0 || item.outflow > 0
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full flex flex-col justify-end h-full gap-1">
                {/* 유입 바 */}
                {item.inflow > 0 && (
                  <div 
                    className="w-full bg-green-500/70 rounded-t transition-all duration-300 min-h-[2px]"
                    style={{ height: `${inflowHeight}%` }}
                    title={`유입: $${item.inflow?.toLocaleString() || 0}`}
                  />
                )}
                {/* 유출 바 */}
                {item.outflow > 0 && (
                  <div 
                    className="w-full bg-red-500/70 rounded-t transition-all duration-300 min-h-[2px]"
                    style={{ height: `${outflowHeight}%` }}
                    title={`유출: $${item.outflow?.toLocaleString() || 0}`}
                  />
                )}
                {/* 데이터 없음 표시 */}
                {!hasData && (
                  <div className="w-full h-1 bg-gray-700/30 rounded" />
                )}
              </div>
              {/* 시간 레이블 (3시간마다) */}
              {index % 3 === 0 && (
                <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                  {item.time}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* 범례 */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs text-gray-400">유입</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-xs text-gray-400">유출</span>
        </div>
      </div>
    </div>
  )
}