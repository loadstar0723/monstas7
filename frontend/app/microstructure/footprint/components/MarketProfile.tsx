'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { MarketProfile as MarketProfileType } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { FaCrown, FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa'

interface MarketProfileProps {
  data: MarketProfileType[]
  currentPrice: number
  symbol: string
}

export default function MarketProfile({ data, currentPrice, symbol }: MarketProfileProps) {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">마켓 프로파일 요약</h3>
          <div className="h-32 flex items-center justify-center">
            <p className="text-gray-400">데이터를 수집 중입니다...</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">거래량 프로파일</h3>
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-400">실시간 거래 데이터가 곧 표시됩니다...</p>
          </div>
        </div>
      </div>
    )
  }

  // 정렬된 데이터 (가격순)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.price - a.price)
  }, [data])

  // 밸류 에어리어 경계
  const valueAreaBounds = useMemo(() => {
    const valueAreaLevels = sortedData.filter(d => d.valueArea)
    if (!valueAreaLevels.length) return null
    
    return {
      high: Math.max(...valueAreaLevels.map(d => d.price)),
      low: Math.min(...valueAreaLevels.map(d => d.price)),
      percentage: valueAreaLevels.reduce((sum, d) => sum + d.tpo, 0)
    }
  }, [sortedData])

  // POC (Point of Control)
  const poc = useMemo(() => {
    return sortedData.find(d => d.poc)
  }, [sortedData])

  // 지지/저항 레벨
  const supportResistance = useMemo(() => {
    const volumeThreshold = Math.max(...data.map(d => d.volume)) * FOOTPRINT_CONFIG.VALUE_AREA_PERCENTAGE
    const significantLevels = data.filter(d => d.volume > volumeThreshold)
    
    const support = significantLevels
      .filter(d => d.price < currentPrice)
      .sort((a, b) => b.price - a.price)
      .slice(0, 3)
    
    const resistance = significantLevels
      .filter(d => d.price > currentPrice)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
    
    return { support, resistance }
  }, [data, currentPrice])

  // 차트용 데이터
  const chartData = useMemo(() => {
    return sortedData.map(d => ({
      ...d,
      color: d.poc ? '#FBBF24' : d.valueArea ? '#8B5CF6' : '#4B5563'
    }))
  }, [sortedData])

  // 가격 대비 POC 위치
  const pocPosition = useMemo(() => {
    if (!poc) return 'neutral'
    const diff = ((currentPrice - poc.price) / poc.price) * 100
    if (diff > 2) return 'above'
    if (diff < -2) return 'below'
    return 'at'
  }, [poc, currentPrice])

  return (
    <div className="space-y-6">
      {/* 마켓 프로파일 요약 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">마켓 프로파일 요약</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              ${poc?.price.toLocaleString('ko-KR') || '-'}
            </div>
            <div className="text-sm text-gray-400">POC</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              ${valueAreaBounds?.high.toLocaleString('ko-KR') || '-'}
            </div>
            <div className="text-sm text-gray-400">밸류 상단</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              ${valueAreaBounds?.low.toLocaleString('ko-KR') || '-'}
            </div>
            <div className="text-sm text-gray-400">밸류 하단</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {valueAreaBounds?.safePercent(percentage) || '0'}%
            </div>
            <div className="text-sm text-gray-400">밸류 비율</div>
          </div>
        </div>
      </div>

      {/* 프로파일 차트 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">거래량 프로파일</h3>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height={384}>
            <BarChart data={chartData} layout="horizontal" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis 
                dataKey="price" 
                type="category" 
                stroke="#9CA3AF"
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: number) => [`${safeFixed(value, 2)}`, '거래량']}
                labelFormatter={(label) => `가격: $${label}`}
              />
              <Bar dataKey="volume" fill="#4B5563">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 현재가 표시 */}
        <div className="mt-4 p-3 bg-gray-700/30 rounded-lg flex items-center gap-2">
          <FaChartBar className="text-gray-400" />
          <span className="text-sm text-gray-400">
            현재가: ${currentPrice.toLocaleString('ko-KR')} 
            {pocPosition === 'above' && ' (POC 위)'}
            {pocPosition === 'below' && ' (POC 아래)'}
            {pocPosition === 'at' && ' (POC 근처)'}
          </span>
        </div>
      </div>

      {/* 지지/저항 레벨 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 지지 레벨 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h4 className="font-medium text-white mb-4 flex items-center gap-2">
            <FaArrowDown className="text-green-400" />
            주요 지지 레벨
          </h4>
          <div className="space-y-2">
            {supportResistance.support.length > 0 ? (
              supportResistance.support.map((level, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                  <span className="text-sm font-medium">${level.price.toLocaleString('ko-KR')}</span>
                  <span className="text-xs text-gray-400">거래량: {safeFixed(level.volume, 2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">현재가 아래 주요 레벨 없음</p>
            )}
          </div>
        </div>
        
        {/* 저항 레벨 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h4 className="font-medium text-white mb-4 flex items-center gap-2">
            <FaArrowUp className="text-red-400" />
            주요 저항 레벨
          </h4>
          <div className="space-y-2">
            {supportResistance.resistance.length > 0 ? (
              supportResistance.resistance.map((level, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                  <span className="text-sm font-medium">${level.price.toLocaleString('ko-KR')}</span>
                  <span className="text-xs text-gray-400">거래량: {safeFixed(level.volume, 2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">현재가 위 주요 레벨 없음</p>
            )}
          </div>
        </div>
      </div>

      {/* 마켓 프로파일 인사이트 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h4 className="font-medium text-white mb-4">마켓 프로파일 해석</h4>
        <div className="space-y-3 text-sm text-gray-400">
          {poc && (
            <div className="flex items-start gap-2">
              <FaCrown className="text-yellow-400 mt-1" />
              <p>
                POC (Point of Control)는 ${poc.price.toLocaleString('ko-KR')}에 위치해 있습니다. 
                이는 가장 많은 거래가 발생한 가격대로, 중요한 균형점을 나타냅니다.
              </p>
            </div>
          )}
          
          {valueAreaBounds && (
            <div className="flex items-start gap-2">
              <FaChartBar className="text-purple-400 mt-1" />
              <p>
                밸류 에어리어는 ${valueAreaBounds.low.toLocaleString('ko-KR')} - 
                ${valueAreaBounds.high.toLocaleString('ko-KR')} 구간입니다. 
                전체 거래량의 {safePercent(valueAreaBounds.percentage)}%가 이 구간에서 발생했습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 마켓 프로파일 이해하기 */}
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h4 className="font-medium text-white mb-2">마켓 프로파일이란?</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            마켓 프로파일은 특정 기간 동안 각 가격대에서 발생한 거래량을 시각화한 차트입니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>POC: 가장 많은 거래가 발생한 가격 (공정 가치)</li>
            <li>밸류 에어리어: 전체 거래량의 70%가 집중된 구간</li>
            <li>높은 거래량 구간: 강한 지지/저항으로 작용</li>
          </ul>
        </div>
      </div>
    </div>
  )
}