'use client'

import { useEffect, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface VolumeAnalysisProps {
  symbol: string
  volumeData: any[]
}

export default function VolumeAnalysis({ symbol, volumeData }: VolumeAnalysisProps) {
  const [volumeTrend, setVolumeTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable')
  const [obv, setObv] = useState(0)
  const [volumeRatio, setVolumeRatio] = useState(1)
  const [mfi, setMfi] = useState(50)

  useEffect(() => {
    if (volumeData.length < 2) return

    // OBV (On-Balance Volume) 계산
    let obvValue = 0
    for (let i = 1; i < volumeData.length; i++) {
      const priceChange = volumeData[i].close - volumeData[i - 1].close
      if (priceChange > 0) {
        obvValue += volumeData[i].volume
      } else if (priceChange < 0) {
        obvValue -= volumeData[i].volume
      }
    }
    setObv(obvValue)

    // 거래량 추세 분석
    const recentVolumes = volumeData.slice(-10).map(d => d.volume)
    const avgRecent = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length
    const avgPrevious = volumeData.slice(-20, -10).map(d => d.volume).reduce((a, b) => a + b, 0) / 10

    if (avgRecent > avgPrevious * 1.2) {
      setVolumeTrend('increasing')
    } else if (avgRecent < avgPrevious * 0.8) {
      setVolumeTrend('decreasing')
    } else {
      setVolumeTrend('stable')
    }

    // Volume Ratio 계산
    const currentVolume = volumeData[volumeData.length - 1]?.volume || 0
    const avgVolume = volumeData.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20
    setVolumeRatio(currentVolume / avgVolume)

    // MFI (Money Flow Index) 간단 계산
    const typicalPrice = volumeData.slice(-14).map(d => (d.high + d.low + d.close) / 3)
    const moneyFlow = typicalPrice.map((tp, i) => tp * volumeData[volumeData.length - 14 + i]?.volume || 0)
    const positiveMF = moneyFlow.filter((_, i) => i > 0 && typicalPrice[i] > typicalPrice[i - 1]).reduce((a, b) => a + b, 0)
    const negativeMF = moneyFlow.filter((_, i) => i > 0 && typicalPrice[i] < typicalPrice[i - 1]).reduce((a, b) => a + b, 0)
    const mfiValue = negativeMF === 0 ? 100 : 100 - (100 / (1 + positiveMF / negativeMF))
    setMfi(mfiValue)
  }, [volumeData])

  const getTrendIcon = () => {
    switch (volumeTrend) {
      case 'increasing': return '📈'
      case 'decreasing': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = () => {
    switch (volumeTrend) {
      case 'increasing': return 'text-green-400'
      case 'decreasing': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">거래량 분석</h2>
        <span className={`flex items-center gap-2 text-sm ${getTrendColor()}`}>
          <span className="text-lg">{getTrendIcon()}</span>
          {volumeTrend === 'increasing' ? '증가 추세' : volumeTrend === 'decreasing' ? '감소 추세' : '보합'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OBV */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">OBV</h3>
          <p className="text-2xl font-bold text-white">
            {(obv / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">On-Balance Volume</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${obv > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
              style={{ width: '60%' }}
            />
          </div>
        </div>

        {/* Volume Ratio */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">거래량 비율</h3>
          <p className="text-2xl font-bold text-white">
            {safeFixed(volumeRatio, 2)}x
          </p>
          <p className="text-xs text-gray-500 mt-1">20일 평균 대비</p>
          <div className="mt-3">
            <div className={`text-xs ${volumeRatio > 1.5 ? 'text-green-400' : volumeRatio < 0.5 ? 'text-red-400' : 'text-gray-400'}`}>
              {volumeRatio > 1.5 ? '⚡ 거래량 급증' : volumeRatio < 0.5 ? '💤 거래량 감소' : '➡️ 평균 수준'}
            </div>
          </div>
        </div>

        {/* MFI */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">MFI</h3>
          <p className="text-2xl font-bold text-white">
            {safeFixed(mfi, 1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Money Flow Index</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${mfi > 80 ? 'bg-red-500' : mfi < 20 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full transition-all duration-500`}
              style={{ width: `${mfi}%` }}
            />
          </div>
        </div>

        {/* Volume Profile */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">거래량 프로파일</h3>
          <div className="space-y-1">
            {volumeData.slice(-5).reverse().map((data, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ 
                      width: `${(data.volume / Math.max(...volumeData.slice(-5).map(d => d.volume))) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 min-w-[40px] text-right">
                  {(data.volume / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 거래량 신호 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-800/30">
          <p className="text-xs text-purple-400 mb-1">거래량 신호</p>
          <p className="text-sm text-white">
            {volumeRatio > 2 ? '🔥 매집 가능성' : 
             volumeRatio > 1.5 ? '⚡ 관심 증가' :
             volumeRatio < 0.5 ? '💤 관심 감소' : '➡️ 보통 수준'}
          </p>
        </div>
        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-800/30">
          <p className="text-xs text-purple-400 mb-1">MFI 신호</p>
          <p className="text-sm text-white">
            {mfi > 80 ? '🔴 과매수 구간' :
             mfi < 20 ? '🟢 과매도 구간' : '⚪ 중립 구간'}
          </p>
        </div>
        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-800/30">
          <p className="text-xs text-purple-400 mb-1">OBV 추세</p>
          <p className="text-sm text-white">
            {obv > 0 ? '📈 매집 진행' : '📉 분산 진행'}
          </p>
        </div>
      </div>
    </div>
  )
}