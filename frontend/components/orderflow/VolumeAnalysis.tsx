'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface VolumeAnalysisProps {
  symbol: string
}

interface VolumeData {
  time: string
  buyVolume: number
  sellVolume: number
  totalVolume: number
  avgVolume: number
  volumeRatio: number
  priceChange: number
}

export default function VolumeAnalysis({ symbol }: VolumeAnalysisProps) {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])
  const [currentVolume, setCurrentVolume] = useState<VolumeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        const [klinesResponse, ticker24hrResponse] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${symbol}&interval=5m&limit=12`), // 1시간 데이터
          fetch(`/api/binance/ticker/24hr?symbol=${symbol}`)
        ])

        if (!klinesResponse.ok || !ticker24hrResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const klinesResult = await klinesResponse.json()
        const ticker24hr = await ticker24hrResponse.json()
        
        // API 응답에서 data 배열 추출
        const klines = klinesResult.data || klinesResult.klines || klinesResult || []
        
        if (!Array.isArray(klines) || klines.length === 0) {
          console.error('Invalid klines data:', klinesResult)
          setIsLoading(false)
          return
        }
        
        const avgVolume24h = parseFloat(ticker24hr.quoteVolume) / 288 // 5분 평균 (24시간 = 288개 5분)
        
        const processedData: VolumeData[] = klines.map((kline: any[]) => {
          const time = new Date(kline[0]).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          const volume = parseFloat(kline[5])
          const quote = parseFloat(kline[7])
          const open = parseFloat(kline[1])
          const close = parseFloat(kline[4])
          const priceChange = ((close - open) / open) * 100
          
          // 매수/매도 볼륨 추정 (가격 상승 시 매수 우세로 가정)
          const buyRatio = priceChange > 0 ? 0.6 : 0.4
          const buyVolume = volume * buyRatio
          const sellVolume = volume * (1 - buyRatio)
          
          return {
            time,
            buyVolume,
            sellVolume,
            totalVolume: volume,
            avgVolume: avgVolume24h,
            volumeRatio: volume / avgVolume24h,
            priceChange
          }
        })

        setVolumeData(processedData)
        setCurrentVolume(processedData[processedData.length - 1])
        setIsLoading(false)
      } catch (error) {
        console.error('Volume data fetch error:', error)
        setIsLoading(false)
      }
    }

    fetchVolumeData()
    intervalRef.current = setInterval(fetchVolumeData, 5000) // 5초마다 업데이트

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [symbol])

  const getVolumeStatus = (ratio: number) => {
    if (ratio > 3) return { text: '폭발적 거래량', color: 'text-purple-400', emoji: '🔥' }
    if (ratio > 2) return { text: '매우 높음', color: 'text-red-400', emoji: '🚀' }
    if (ratio > 1.5) return { text: '높음', color: 'text-orange-400', emoji: '📈' }
    if (ratio > 1) return { text: '평균 이상', color: 'text-yellow-400', emoji: '📊' }
    if (ratio > 0.5) return { text: '평균 이하', color: 'text-blue-400', emoji: '📉' }
    return { text: '매우 낮음', color: 'text-gray-400', emoji: '😴' }
  }

  const formatVolume = (volume: number) => {
    if (volume > 1e9) return `${(volume / 1e9).toFixed(2)}B`
    if (volume > 1e6) return `${(volume / 1e6).toFixed(2)}M`
    if (volume > 1e3) return `${(volume / 1e3).toFixed(2)}K`
    return safeFixed(volume, 2)
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="h-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const currentStatus = currentVolume ? getVolumeStatus(currentVolume.volumeRatio) : null

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          거래량 분석
        </h3>
        {currentStatus && (
          <div className="text-right">
            <p className="text-sm text-gray-400">거래량 상태</p>
            <p className={`text-lg font-bold ${currentStatus.color} flex items-center gap-1`}>
              <span className="text-2xl">{currentStatus.emoji}</span>
              {currentStatus.text}
            </p>
          </div>
        )}
      </div>

      {/* 현재 거래량 요약 */}
      {currentVolume && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-400">현재 거래량</p>
            <p className="text-lg font-bold text-white">{formatVolume(currentVolume.totalVolume)}</p>
            <p className={`text-xs ${currentVolume.volumeRatio > 1 ? 'text-green-400' : 'text-red-400'}`}>
              평균 대비 {(currentVolume.volumeRatio * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">매수 거래량</p>
            <p className="text-lg font-bold text-green-400">{formatVolume(currentVolume.buyVolume)}</p>
            <p className="text-xs text-gray-500">
              {((currentVolume.buyVolume / currentVolume.totalVolume) * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">매도 거래량</p>
            <p className="text-lg font-bold text-red-400">{formatVolume(currentVolume.sellVolume)}</p>
            <p className="text-xs text-gray-500">
              {((currentVolume.sellVolume / currentVolume.totalVolume) * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">24시간 평균</p>
            <p className="text-lg font-bold text-gray-300">{formatVolume(currentVolume.avgVolume)}</p>
            <p className="text-xs text-gray-500">5분 단위</p>
          </div>
        </div>
      )}

      {/* 거래량 차트 */}
      <div className="space-y-2 mb-6">
        {volumeData.map((data, index) => {
          const maxVolume = Math.max(...volumeData.map(d => d.totalVolume))
          const volumePercent = (data.totalVolume / maxVolume) * 100
          const buyPercent = (data.buyVolume / data.totalVolume) * 100
          
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-12">{data.time}</span>
              <div className="flex-1 relative h-6 bg-gray-800 rounded overflow-hidden">
                {/* 전체 거래량 바 */}
                <div 
                  className="absolute inset-y-0 left-0 bg-gray-600"
                  style={{ width: `${volumePercent}%` }}
                ></div>
                {/* 매수 거래량 */}
                <div 
                  className="absolute inset-y-0 left-0 bg-green-500/70"
                  style={{ width: `${volumePercent * buyPercent / 100}%` }}
                ></div>
                {/* 평균선 */}
                <div 
                  className="absolute inset-y-0 w-px bg-yellow-400/50"
                  style={{ left: `${(data.avgVolume / maxVolume) * 100}%` }}
                ></div>
                {/* 거래량 비율 표시 */}
                {data.volumeRatio > 2 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-bold">
                    {safeFixed(data.volumeRatio, 1)}x
                  </span>
                )}
              </div>
              <span className={`text-xs w-12 text-right ${data.priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.priceChange > 0 ? '+' : ''}{safePrice(data.priceChange, 1)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-4 text-xs mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">매수</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span className="text-gray-400">매도</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-px bg-yellow-400"></div>
          <span className="text-gray-400">평균</span>
        </div>
      </div>

      {/* 거래량 해석 */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-400 mb-2">📈 거래량 기반 트레이딩 전략</h4>
        <div className="text-xs text-gray-300 space-y-2">
          {currentVolume && currentVolume.volumeRatio > 2 && (
            <div className="p-2 bg-red-900/20 rounded">
              <p className="font-medium text-red-400">🔥 폭발적 거래량 감지!</p>
              <p>• 중요한 가격 변동이 일어날 가능성 높음</p>
              <p>• 브레이크아웃 또는 급락 가능성 주의</p>
              <p className="text-yellow-400 font-medium mt-1">💡 포지션 조정 또는 관망 권장</p>
            </div>
          )}
          {currentVolume && currentVolume.volumeRatio > 1 && currentVolume.volumeRatio <= 2 && (
            <div className="p-2 bg-yellow-900/20 rounded">
              <p className="font-medium text-yellow-400">📊 평균 이상 거래량</p>
              <p>• 시장 관심도 증가 신호</p>
              <p>• 추세 전환 가능성 주목</p>
              <p className="text-green-400 font-medium mt-1">💡 추세 추종 전략 고려</p>
            </div>
          )}
          {currentVolume && currentVolume.volumeRatio <= 1 && (
            <div className="p-2 bg-gray-800/50 rounded">
              <p className="font-medium text-gray-400">😴 낮은 거래량</p>
              <p>• 시장 관심도 저조</p>
              <p>• 가격 조작 위험 증가</p>
              <p className="text-blue-400 font-medium mt-1">💡 거래 자제 또는 소액 거래</p>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="font-medium text-gray-200 mb-1">거래량 패턴 해석</p>
            <ul className="space-y-1">
              <li>• 가격↑ + 거래량↑ = 강한 상승 추세</li>
              <li>• 가격↑ + 거래량↓ = 상승 약화 (주의)</li>
              <li>• 가격↓ + 거래량↑ = 강한 하락 추세</li>
              <li>• 가격↓ + 거래량↓ = 하락 약화 (바닥 근처)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}