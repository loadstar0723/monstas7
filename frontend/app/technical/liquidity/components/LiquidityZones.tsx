'use client'

import { useState, useMemo } from 'react'

interface LiquidityZone {
  id: string
  priceRange: [number, number]
  strength: number
  type: 'accumulation' | 'distribution' | 'neutral'
  volume: number
  timeframe: string
  significance: 'low' | 'medium' | 'high' | 'critical'
}

interface LiquidityLevel {
  price: number
  buyLiquidity: number
  sellLiquidity: number
  totalLiquidity: number
  orders: number
  strength: 'weak' | 'moderate' | 'strong' | 'extreme'
  type: 'support' | 'resistance' | 'neutral'
}

interface LiquidityZonesProps {
  zones: LiquidityZone[]
  levels: LiquidityLevel[]
  currentPrice: number
  timeframe: string
}

export default function LiquidityZones({ 
  zones, 
  levels, 
  currentPrice, 
  timeframe 
}: LiquidityZonesProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'zones' | 'levels' | 'combined'>('combined')
  const [filterSignificance, setFilterSignificance] = useState<'all' | 'high' | 'critical'>('all')

  // 필터링된 존과 레벨
  const filteredData = useMemo(() => {
    let filteredZones = zones
    let filteredLevels = levels

    // 중요도 필터
    if (filterSignificance !== 'all') {
      filteredZones = zones.filter(zone => 
        filterSignificance === 'high' 
          ? ['high', 'critical'].includes(zone.significance)
          : zone.significance === 'critical'
      )
    }

    // 강한 레벨만 필터링
    filteredLevels = levels.filter(level => 
      level.strength === 'extreme' || level.strength === 'strong'
    )

    return { zones: filteredZones, levels: filteredLevels }
  }, [zones, levels, filterSignificance])

  // 가격 거리 계산
  const getPriceDistance = (price: number) => {
    const distance = ((price - currentPrice) / currentPrice) * 100
    return { distance, isAbove: distance > 0 }
  }

  // 존 색상 계산
  const getZoneColor = (zone: LiquidityZone) => {
    const colors = {
      accumulation: {
        critical: 'bg-green-500/30 border-green-500',
        high: 'bg-green-500/20 border-green-400', 
        medium: 'bg-green-500/10 border-green-300',
        low: 'bg-green-500/5 border-green-200'
      },
      distribution: {
        critical: 'bg-red-500/30 border-red-500',
        high: 'bg-red-500/20 border-red-400',
        medium: 'bg-red-500/10 border-red-300', 
        low: 'bg-red-500/5 border-red-200'
      },
      neutral: {
        critical: 'bg-yellow-500/30 border-yellow-500',
        high: 'bg-yellow-500/20 border-yellow-400',
        medium: 'bg-yellow-500/10 border-yellow-300',
        low: 'bg-yellow-500/5 border-yellow-200'
      }
    }
    return colors[zone.type][zone.significance]
  }

  // 레벨 색상 계산
  const getLevelColor = (level: LiquidityLevel) => {
    if (level.type === 'support') {
      return level.strength === 'extreme' ? 'text-green-400' : 'text-green-300'
    } else if (level.type === 'resistance') {
      return level.strength === 'extreme' ? 'text-red-400' : 'text-red-300'
    }
    return 'text-gray-400'
  }

  // 값 포맷팅
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(2)
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  // 존 통계 계산
  const zoneStats = useMemo(() => {
    const totalZones = filteredData.zones.length
    const criticalZones = filteredData.zones.filter(z => z.significance === 'critical').length
    const accumulationZones = filteredData.zones.filter(z => z.type === 'accumulation').length
    const distributionZones = filteredData.zones.filter(z => z.type === 'distribution').length
    const averageStrength = filteredData.zones.reduce((sum, z) => sum + z.strength, 0) / totalZones || 0

    return {
      totalZones,
      criticalZones,
      accumulationZones, 
      distributionZones,
      averageStrength
    }
  }, [filteredData.zones])

  return (
    <div className="space-y-6">
      {/* 헤더 및 컨트롤 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">유동성 집중 구간</h3>
          <p className="text-sm text-gray-400">
            현재가 기준 주요 매수/매도 벽 분석 ({timeframe} 기준)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">표시:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
            >
              <option value="combined">통합</option>
              <option value="zones">존만</option>
              <option value="levels">레벨만</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">중요도:</span>
            <select
              value={filterSignificance}
              onChange={(e) => setFilterSignificance(e.target.value as any)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
            >
              <option value="all">전체</option>
              <option value="high">높음 이상</option>
              <option value="critical">매우중요만</option>
            </select>
          </div>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">총 존</div>
          <div className="text-xl font-bold text-white">
            {zoneStats.totalZones}개
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">매우중요</div>
          <div className="text-xl font-bold text-red-400">
            {zoneStats.criticalZones}개
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">매집 존</div>
          <div className="text-xl font-bold text-green-400">
            {zoneStats.accumulationZones}개
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">분산 존</div>
          <div className="text-xl font-bold text-red-400">
            {zoneStats.distributionZones}개
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">평균 강도</div>
          <div className="text-xl font-bold text-purple-400">
            {formatValue(zoneStats.averageStrength)}
          </div>
        </div>
      </div>

      {/* 현재가 표시 */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">현재가</div>
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {formatPrice(currentPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 유동성 존 목록 */}
        {(viewMode === 'zones' || viewMode === 'combined') && (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🎯 유동성 집중 구간
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData.zones.map((zone, index) => {
                const midPrice = (zone.priceRange[0] + zone.priceRange[1]) / 2
                const { distance, isAbove } = getPriceDistance(midPrice)
                const isSelected = selectedZone === zone.id
                
                return (
                  <div
                    key={zone.id}
                    className={`rounded-lg p-4 border cursor-pointer transition-all duration-200 ${
                      getZoneColor(zone)
                    } ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          구간 {index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          zone.significance === 'critical' ? 'bg-red-500/30 text-red-300' :
                          zone.significance === 'high' ? 'bg-yellow-500/30 text-yellow-300' :
                          zone.significance === 'medium' ? 'bg-blue-500/30 text-blue-300' :
                          'bg-gray-500/30 text-gray-300'
                        }`}>
                          {zone.significance === 'critical' ? '매우중요' :
                           zone.significance === 'high' ? '중요' :
                           zone.significance === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className={isAbove ? 'text-red-400' : 'text-green-400'}>
                          {isAbove ? '↑' : '↓'} {Math.abs(distance).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">가격 범위</div>
                        <div className="text-white font-mono">
                          {formatPrice(zone.priceRange[0])} - {formatPrice(zone.priceRange[1])}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">중심 가격</div>
                        <div className="text-white font-mono">
                          {formatPrice(midPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div>
                        <div className="text-xs text-gray-400">유형</div>
                        <div className={`text-sm font-medium ${
                          zone.type === 'accumulation' ? 'text-green-400' :
                          zone.type === 'distribution' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {zone.type === 'accumulation' ? '매집' :
                           zone.type === 'distribution' ? '분산' : '중립'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">강도</div>
                        <div className="text-white font-medium">
                          {formatValue(zone.strength)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">거래량</div>
                        <div className="text-white font-medium">
                          {formatValue(zone.volume)}
                        </div>
                      </div>
                    </div>

                    {/* 상세 정보 (선택된 존만) */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
                          <div>
                            <div className="text-gray-400 mb-1">시간프레임</div>
                            <div>{zone.timeframe}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">현재가와 거리</div>
                            <div>{Math.abs(distance).toFixed(2)}% ({isAbove ? '위' : '아래'})</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">구간 폭</div>
                            <div>{((zone.priceRange[1] - zone.priceRange[0]) / currentPrice * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">강도 비율</div>
                            <div>{((zone.strength / zoneStats.averageStrength) * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 유동성 레벨 */}
        {(viewMode === 'levels' || viewMode === 'combined') && (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📊 핵심 유동성 레벨
            </h4>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredData.levels.slice(0, 20).map((level, index) => {
                const { distance, isAbove } = getPriceDistance(level.price)
                
                return (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          level.type === 'support' ? 'bg-green-400' :
                          level.type === 'resistance' ? 'bg-red-400' :
                          'bg-yellow-400'
                        }`} />
                        <span className={`font-mono text-sm ${getLevelColor(level)}`}>
                          {formatPrice(level.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          level.strength === 'extreme' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {level.strength === 'extreme' ? '극강' : '강함'}
                        </span>
                        <span className={`text-xs ${isAbove ? 'text-red-400' : 'text-green-400'}`}>
                          {isAbove ? '↑' : '↓'} {Math.abs(distance).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
                      <div>
                        <div className="text-gray-500">매수</div>
                        <div className="text-green-400">{formatValue(level.buyLiquidity)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">매도</div>
                        <div className="text-red-400">{formatValue(level.sellLiquidity)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">총량</div>
                        <div className="text-white">{formatValue(level.totalLiquidity)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">주문</div>
                        <div className="text-white">{level.orders}</div>
                      </div>
                    </div>

                    {/* 매수/매도 비율 바 */}
                    <div className="mt-2">
                      <div className="flex w-full h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500"
                          style={{ width: `${(level.buyLiquidity / level.totalLiquidity) * 100}%` }}
                        />
                        <div 
                          className="bg-red-500"
                          style={{ width: `${(level.sellLiquidity / level.totalLiquidity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 트레이딩 시사점 */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-500/20">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          💡 트레이딩 시사점
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-white font-medium mb-2">주요 지지/저항 레벨</h5>
            <div className="space-y-2">
              {filteredData.levels
                .filter(l => l.type !== 'neutral')
                .slice(0, 3)
                .map((level, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className={`${getLevelColor(level)}`}>
                      {formatPrice(level.price)} ({level.type === 'support' ? '지지' : '저항'})
                    </span>
                    <span className="text-gray-400">
                      {getPriceDistance(level.price).isAbove ? '↑' : '↓'} 
                      {Math.abs(getPriceDistance(level.price).distance).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h5 className="text-white font-medium mb-2">매매 전략</h5>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• 강한 지지선 근처에서 매수 기회 탐색</div>
              <div>• 저항선 돌파 시 추가 상승 가능성</div>
              <div>• 매집 구간에서는 단계적 진입 고려</div>
              <div>• 분산 구간에서는 위험 관리 강화</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}