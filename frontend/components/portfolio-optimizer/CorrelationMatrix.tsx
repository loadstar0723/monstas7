'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCog, FaChartBar } from 'react-icons/fa'

interface Props {
  assets: any[]
}

export default function CorrelationMatrix({ assets }: Props) {
  const [correlationData, setCorrelationData] = useState<number[][]>([])
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null)
  const [displayMode, setDisplayMode] = useState<'heatmap' | 'numbers'>('heatmap')

  useEffect(() => {
    if (!assets || assets.length === 0) return

    // 상관관계 매트릭스 생성 (시뮬레이션)
    const matrix: number[][] = []
    
    for (let i = 0; i < assets.length; i++) {
      matrix[i] = []
      for (let j = 0; j < assets.length; j++) {
        if (i === j) {
          matrix[i][j] = 1 // 자기 자신과의 상관관계는 1
        } else if (j < i) {
          matrix[i][j] = matrix[j][i] // 대칭
        } else {
          // 자산 간 상관관계 시뮬레이션
          const baseCorr = 0.5 + Math.random() * 0.3 // 0.5~0.8 기본 상관관계
          const noise = (Math.random() - 0.5) * 0.3
          matrix[i][j] = Math.max(-1, Math.min(1, baseCorr + noise))
        }
      }
    }

    setCorrelationData(matrix)
  }, [assets])

  // 상관관계 값에 따른 색상
  const getCorrelationColor = (value: number) => {
    if (value === 1) return 'rgb(16, 185, 129)' // 완전 양의 상관관계
    if (value >= 0.7) return 'rgb(52, 211, 153)'
    if (value >= 0.5) return 'rgb(110, 231, 183)'
    if (value >= 0.3) return 'rgb(167, 243, 208)'
    if (value >= 0) return 'rgb(236, 253, 245)'
    if (value >= -0.3) return 'rgb(254, 226, 226)'
    if (value >= -0.5) return 'rgb(252, 165, 165)'
    if (value >= -0.7) return 'rgb(248, 113, 113)'
    return 'rgb(239, 68, 68)' // 강한 음의 상관관계
  }

  // 상관관계 설명
  const getCorrelationDescription = (value: number) => {
    if (value >= 0.7) return '강한 양의 상관관계'
    if (value >= 0.3) return '양의 상관관계'
    if (value >= -0.3) return '약한 상관관계'
    if (value >= -0.7) return '음의 상관관계'
    return '강한 음의 상관관계'
  }

  // 다각화 점수 계산
  const calculateDiversificationScore = () => {
    if (correlationData.length === 0) return 0
    
    let totalCorr = 0
    let count = 0
    
    for (let i = 0; i < correlationData.length; i++) {
      for (let j = i + 1; j < correlationData[i].length; j++) {
        totalCorr += Math.abs(correlationData[i][j])
        count++
      }
    }
    
    const avgCorr = totalCorr / count
    return Math.max(0, 100 - avgCorr * 100)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaCog className="text-purple-400" />
            자산 상관관계 매트릭스
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDisplayMode(displayMode === 'heatmap' ? 'numbers' : 'heatmap')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              {displayMode === 'heatmap' ? '숫자 보기' : '히트맵 보기'}
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          자산 간 상관관계를 분석하여 포트폴리오의 다각화 수준을 평가합니다. 
          낮은 상관관계는 더 나은 리스크 분산을 의미합니다.
        </p>

        {/* 다각화 점수 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">다각화 점수</span>
            <span className="text-2xl font-bold text-green-400">
              {calculateDiversificationScore().toFixed(0)}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 h-2 rounded-full transition-all"
              style={{ width: `${calculateDiversificationScore()}%` }}
            />
          </div>
        </div>
      </div>

      {/* 상관관계 매트릭스 */}
      {correlationData.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* 열 헤더 */}
            <div className="flex items-center mb-2">
              <div className="w-20"></div>
              {assets.map((asset, index) => (
                <div
                  key={`header-${index}`}
                  className="flex-1 text-center text-white font-semibold text-sm"
                >
                  {asset.symbol}
                </div>
              ))}
            </div>

            {/* 매트릭스 본체 */}
            {correlationData.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex items-center mb-1">
                {/* 행 헤더 */}
                <div className="w-20 text-white font-semibold text-sm text-right pr-2">
                  {assets[rowIndex].symbol}
                </div>
                
                {/* 셀들 */}
                {row.map((value, colIndex) => (
                  <motion.div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="flex-1 aspect-square mx-0.5 rounded cursor-pointer relative"
                    style={{
                      backgroundColor: displayMode === 'heatmap' 
                        ? getCorrelationColor(value)
                        : '#1F2937'
                    }}
                    whileHover={{ scale: 1.1 }}
                    onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {displayMode === 'numbers' && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                        {value.toFixed(2)}
                      </div>
                    )}
                    
                    {/* 호버 시 툴팁 */}
                    {hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && (
                      <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white p-2 rounded text-xs whitespace-nowrap">
                        <div className="font-semibold">
                          {assets[rowIndex].symbol} - {assets[colIndex].symbol}
                        </div>
                        <div>상관계수: {value.toFixed(3)}</div>
                        <div className="text-gray-400">
                          {getCorrelationDescription(value)}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>

          {/* 범례 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-gray-400 text-sm">음의 상관관계</span>
            <div className="flex gap-1">
              <div className="w-8 h-4 bg-red-500 rounded"></div>
              <div className="w-8 h-4 bg-red-300 rounded"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
              <div className="w-8 h-4 bg-green-300 rounded"></div>
              <div className="w-8 h-4 bg-green-500 rounded"></div>
            </div>
            <span className="text-gray-400 text-sm">양의 상관관계</span>
          </div>
        </div>
      )}

      {/* 상관관계 통계 */}
      {correlationData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">가장 높은 상관관계</h4>
            {(() => {
              let maxCorr = -1
              let maxPair = { asset1: '', asset2: '', value: 0 }
              
              for (let i = 0; i < correlationData.length; i++) {
                for (let j = i + 1; j < correlationData[i].length; j++) {
                  if (correlationData[i][j] > maxCorr) {
                    maxCorr = correlationData[i][j]
                    maxPair = {
                      asset1: assets[i].symbol,
                      asset2: assets[j].symbol,
                      value: correlationData[i][j]
                    }
                  }
                }
              }
              
              return (
                <div>
                  <div className="text-white font-semibold">
                    {maxPair.asset1} - {maxPair.asset2}
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {maxPair.value.toFixed(3)}
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">가장 낮은 상관관계</h4>
            {(() => {
              let minCorr = 1
              let minPair = { asset1: '', asset2: '', value: 0 }
              
              for (let i = 0; i < correlationData.length; i++) {
                for (let j = i + 1; j < correlationData[i].length; j++) {
                  if (correlationData[i][j] < minCorr) {
                    minCorr = correlationData[i][j]
                    minPair = {
                      asset1: assets[i].symbol,
                      asset2: assets[j].symbol,
                      value: correlationData[i][j]
                    }
                  }
                }
              }
              
              return (
                <div>
                  <div className="text-white font-semibold">
                    {minPair.asset1} - {minPair.asset2}
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {minPair.value.toFixed(3)}
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">평균 상관관계</h4>
            {(() => {
              let totalCorr = 0
              let count = 0
              
              for (let i = 0; i < correlationData.length; i++) {
                for (let j = i + 1; j < correlationData[i].length; j++) {
                  totalCorr += correlationData[i][j]
                  count++
                }
              }
              
              const avgCorr = totalCorr / count
              
              return (
                <div>
                  <div className="text-white font-semibold">전체 포트폴리오</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {avgCorr.toFixed(3)}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* 다각화 권장사항 */}
      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
        <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
          <FaChartBar />
          다각화 개선 방안
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• 상관관계가 낮은 자산들을 추가하여 포트폴리오 리스크를 감소시키세요</li>
          <li>• 상관계수가 0.7 이상인 자산들은 비슷한 움직임을 보이므로 주의가 필요합니다</li>
          <li>• 음의 상관관계를 가진 자산들은 헤징 효과를 제공합니다</li>
          <li>• 다양한 섹터와 자산군에 분산 투자하여 시스템 리스크를 줄이세요</li>
        </ul>
      </div>
    </div>
  )
}