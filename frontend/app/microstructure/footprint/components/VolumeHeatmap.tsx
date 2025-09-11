'use client'

import { useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FootprintCell } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'
import { FaFireAlt, FaThermometerHalf, FaSnowflake, FaChartBar } from 'react-icons/fa'

interface VolumeHeatmapProps {
  data: FootprintCell[]
  symbol: string
}

export default function VolumeHeatmap({ data, symbol }: VolumeHeatmapProps) {
  // 시간대별 거래량 집계
  const hourlyVolumes = useMemo(() => {
    const volumes = new Map<number, { buyVolume: number, sellVolume: number, totalVolume: number }>()
    
    data.forEach(cell => {
      const hour = parseInt(cell.time.split(':')[0])
      const existing = volumes.get(hour) || { buyVolume: 0, sellVolume: 0, totalVolume: 0 }
      
      volumes.set(hour, {
        buyVolume: existing.buyVolume + cell.buyVolume,
        sellVolume: existing.sellVolume + cell.sellVolume,
        totalVolume: existing.totalVolume + cell.totalVolume
      })
    })
    
    // 24시간 배열로 변환
    const hourlyArray = []
    for (let i = 0; i < 24; i++) {
      const volume = volumes.get(i) || { buyVolume: 0, sellVolume: 0, totalVolume: 0 }
      hourlyArray.push({ hour: i, ...volume })
    }
    
    return hourlyArray
  }, [data])

  // 가격대별 거래량 집계
  const priceVolumes = useMemo(() => {
    const volumes = new Map<number, { buyVolume: number, sellVolume: number, totalVolume: number }>()
    
    data.forEach(cell => {
      const priceKey = Math.round(cell.price / 100) * 100 // 100달러 단위로 그룹화
      const existing = volumes.get(priceKey) || { buyVolume: 0, sellVolume: 0, totalVolume: 0 }
      
      volumes.set(priceKey, {
        buyVolume: existing.buyVolume + cell.buyVolume,
        sellVolume: existing.sellVolume + cell.sellVolume,
        totalVolume: existing.totalVolume + cell.totalVolume
      })
    })
    
    return Array.from(volumes.entries())
      .map(([price, volume]) => ({ price, ...volume }))
      .sort((a, b) => b.price - a.price)
  }, [data])

  // 최대값 계산 (색상 농도 계산용)
  const maxHourlyVolume = useMemo(() => {
    return Math.max(...hourlyVolumes.map(v => v.totalVolume))
  }, [hourlyVolumes])

  const maxPriceVolume = useMemo(() => {
    return Math.max(...priceVolumes.map(v => v.totalVolume))
  }, [priceVolumes])

  // 히트맵 색상 계산
  const getHeatmapColor = (volume: number, maxVolume: number) => {
    const intensity = maxVolume > 0 ? volume / maxVolume : 0
    
    if (intensity > 0.8) return 'bg-red-600'
    if (intensity > 0.6) return 'bg-orange-500'
    if (intensity > 0.4) return 'bg-yellow-500'
    if (intensity > 0.2) return 'bg-blue-500'
    return 'bg-gray-700'
  }

  // 핫존 식별
  const hotZones = useMemo(() => {
    const threshold = maxPriceVolume * FOOTPRINT_CONFIG.HEATMAP_THRESHOLD_RATIO
    return priceVolumes
      .filter(pv => pv.totalVolume > threshold)
      .slice(0, 5)
  }, [priceVolumes, maxPriceVolume])

  // 가장 활발한 시간대
  const peakHours = useMemo(() => {
    const threshold = maxHourlyVolume * FOOTPRINT_CONFIG.HEATMAP_HOURLY_THRESHOLD
    return hourlyVolumes
      .filter(hv => hv.totalVolume > threshold)
      .map(hv => hv.hour)
  }, [hourlyVolumes, maxHourlyVolume])

  return (
    <div className="space-y-6">
      {/* 시간대별 거래량 히트맵 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">시간대별 거래 히트맵</h3>
        
        <div className="space-y-4">
          {/* 히트맵 그리드 */}
          <div className="grid grid-cols-12 gap-1">
            {hourlyVolumes.map(volume => (
              <div key={volume.hour} className="relative group">
                <div 
                  className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${
                    getHeatmapColor(volume.totalVolume, maxHourlyVolume)
                  }`}
                >
                  {volume.hour}
                </div>
                
                {/* 호버 정보 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-900 rounded shadow-xl hidden group-hover:block z-10 whitespace-nowrap">
                  <div className="text-xs">
                    <div className="font-medium text-white">{volume.hour}:00</div>
                    <div className="text-green-400">매수: {safeFixed(volume.buyVolume, 2)}</div>
                    <div className="text-red-400">매도: {safeFixed(volume.sellVolume, 2)}</div>
                    <div className="text-gray-300">총: {safeFixed(volume.totalVolume, 2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 범례 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-gray-400">매우 활발</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-400">활발</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-400">보통</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-400">조용</span>
            </div>
          </div>
          
          {/* 피크 시간대 */}
          {peakHours.length > 0 && (
            <div className="p-3 bg-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">
                <FaFireAlt className="inline mr-1" />
                가장 활발한 시간대: {peakHours.map(h => `${h}시`).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 가격대별 거래 집중도 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">가격대별 거래 집중도</h3>
        
        <div className="space-y-2">
          {priceVolumes.slice(0, 20).map(pv => {
            const buyRatio = pv.totalVolume > 0 ? (pv.buyVolume / pv.totalVolume) * 100 : 50
            const sellRatio = 100 - buyRatio
            
            return (
              <div key={pv.price} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">${pv.price.toLocaleString('ko-KR')}</span>
                  <span className="text-gray-400">{safeFixed(pv.totalVolume, 2)}</span>
                </div>
                <div className="flex h-6 rounded overflow-hidden bg-gray-700">
                  <div 
                    className="bg-green-500 flex items-center justify-center text-xs font-medium text-black"
                    style={{ width: `${buyRatio}%` }}
                  >
                    {buyRatio > 20 && `${safeFixed(buyRatio, 0)}%`}
                  </div>
                  <div 
                    className="bg-red-500 flex items-center justify-center text-xs font-medium text-black"
                    style={{ width: `${sellRatio}%` }}
                  >
                    {sellRatio > 20 && `${safeFixed(sellRatio, 0)}%`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 핫존 분석 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaFireAlt className="text-red-400" />
          거래 핫존
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotZones.map((zone, index) => (
            <div key={zone.price} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-white">
                  ${zone.price.toLocaleString('ko-KR')}
                </span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  핫존 #{index + 1}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">총 거래량</span>
                  <span className="text-white">{safeFixed(zone.totalVolume, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">매수/매도 비율</span>
                  <span className="text-white">
                    {(zone.buyVolume / zone.sellVolume).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 거래 패턴 인사이트 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">거래 패턴 인사이트</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <FaFireAlt className="text-3xl text-red-400 mx-auto mb-2" />
            <div className="text-xl font-bold">{hotZones.length}</div>
            <div className="text-sm text-gray-400">거래 핫존</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <FaThermometerHalf className="text-3xl text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold">{peakHours.length}</div>
            <div className="text-sm text-gray-400">피크 시간대</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <FaChartBar className="text-3xl text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold">{priceVolumes.length}</div>
            <div className="text-sm text-gray-400">활성 가격대</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-gray-400">
          <p>
            • 거래가 집중된 가격대는 강한 지지/저항 구간으로 작용할 가능성이 높습니다.
          </p>
          <p>
            • 특정 시간대에 거래가 집중되는 패턴을 파악하여 최적의 진입 시점을 찾을 수 있습니다.
          </p>
          <p>
            • 매수/매도 비율이 극단적인 구간은 추세 전환의 신호일 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}