'use client'

import { FootprintCell, MarketProfile } from '../types'
import { FaBug } from 'react-icons/fa'
import { useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface DebugPanelProps {
  footprintData: FootprintCell[]
  marketProfile: MarketProfile[]
  selectedSymbol: string
}

export default function DebugPanel({ footprintData, marketProfile, selectedSymbol }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 데이터 요약
  const dataStats = {
    footprintCells: footprintData.length,
    profileLevels: marketProfile.length,
    uniquePrices: new Set(footprintData.map(d => d.price)).size,
    uniqueTimes: new Set(footprintData.map(d => d.time)).size,
    totalVolume: footprintData.reduce((sum, d) => sum + d.totalVolume, 0),
    poc: marketProfile.find(p => p.poc)?.price || 0,
    valueAreaCount: marketProfile.filter(p => p.valueArea).length
  }
  
  // 샘플 데이터 표시
  const sampleData = footprintData.slice(0, 5)
  const sampleProfile = marketProfile.slice(0, 5)
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
      >
        <FaBug />
      </button>
      
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-96 bg-gray-900 text-white p-4 rounded-lg shadow-2xl border border-gray-700 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaBug className="text-yellow-400" />
            디버그 패널
          </h3>
          
          {/* 데이터 통계 */}
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-yellow-400">데이터 통계</h4>
            <div className="space-y-1 text-sm">
              <div>심볼: {selectedSymbol}</div>
              <div>풋프린트 셀: {dataStats.footprintCells}개</div>
              <div>프로파일 레벨: {dataStats.profileLevels}개</div>
              <div>고유 가격: {dataStats.uniquePrices}개</div>
              <div>고유 시간: {dataStats.uniqueTimes}개</div>
              <div>총 거래량: {safeFixed(dataStats.totalVolume, 2)}</div>
              <div>POC: ${dataStats.poc}</div>
              <div>밸류 에어리어 레벨: {dataStats.valueAreaCount}개</div>
            </div>
          </div>
          
          {/* 풋프린트 샘플 데이터 */}
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-green-400">풋프린트 샘플 (상위 5개)</h4>
            <div className="space-y-2 text-xs">
              {sampleData.map((cell, i) => (
                <div key={i} className="bg-gray-800 p-2 rounded">
                  <div>시간: {cell.time} | 가격: ${cell.price}</div>
                  <div>매수: {safeFixed(cell.buyVolume, 2)} | 매도: {safeFixed(cell.sellVolume, 2)}</div>
                  <div>델타: {safeFixed(cell.delta, 2)} | POC: {cell.poc ? 'Yes' : 'No'}</div>
                </div>
              ))}
              {footprintData.length === 0 && (
                <div className="text-red-400">풋프린트 데이터가 없습니다!</div>
              )}
            </div>
          </div>
          
          {/* 마켓 프로파일 샘플 */}
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-blue-400">마켓 프로파일 샘플 (상위 5개)</h4>
            <div className="space-y-2 text-xs">
              {sampleProfile.map((level, i) => (
                <div key={i} className="bg-gray-800 p-2 rounded">
                  <div>가격: ${level.price} | 거래량: {safeFixed(level.volume, 2)}</div>
                  <div>TPO: {level.tpo}% | POC: {level.poc ? 'Yes' : 'No'} | VA: {level.valueArea ? 'Yes' : 'No'}</div>
                </div>
              ))}
              {marketProfile.length === 0 && (
                <div className="text-red-400">마켓 프로파일 데이터가 없습니다!</div>
              )}
            </div>
          </div>
          
          {/* 디버그 액션 */}
          <div className="space-y-2">
            <button
              onClick={() => console.log('Footprint Data:', footprintData)}
              className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
            >
              콘솔에 풋프린트 데이터 출력
            </button>
            <button
              onClick={() => console.log('Market Profile:', marketProfile)}
              className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
            >
              콘솔에 마켓 프로파일 출력
            </button>
          </div>
        </div>
      )}
    </div>
  )
}