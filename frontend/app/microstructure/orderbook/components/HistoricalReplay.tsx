'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaHistory, FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface OrderbookSnapshot {
  timestamp: number
  price: number
  bidVolume: number
  askVolume: number
  spread: number
  imbalance: number
  depthRatio: number
}

interface HistoricalReplayProps {
  historicalData: OrderbookSnapshot[]
  symbol: string
}

export default function HistoricalReplay({ historicalData, symbol }: HistoricalReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const intervalRef = useRef<NodeJS.Timeout>()

  // 시장 패턴 기반 히스토리컬 데이터 생성 (결정적 시장 미세구조)
  const [replayData, setReplayData] = useState<OrderbookSnapshot[]>(() => {
    const now = Date.now()
    return Array.from({ length: 100 }, (_, i) => {
      const timeIndex = i / 100 // 0~1 비율
      const dailyCycle = Math.sin(timeIndex * 2 * Math.PI) // 일일 주기
      const weeklyCycle = Math.sin(timeIndex * 0.3 * Math.PI) // 주간 주기
      
      // 시장 마이크로스트럭처 패턴에 기반한 가격 생성
      const trendComponent = weeklyCycle * 500
      const volatilityComponent = Math.abs(dailyCycle) * 300
      const microstructureNoise = (Math.sin(i * 0.73) + Math.cos(i * 1.17)) * 100
      
      // 오더북 비대칭성 모델링
      const imbalanceFactor = Math.sin(i * 0.13) * 0.3
      const baseVolume = 50
      
      // 스프레드 동적 계산 (변동성과 유동성 기반)
      const spreadFactor = Math.abs(dailyCycle) * 0.5 + 0.1
      const liquidityFactor = (1 + weeklyCycle * 0.3)
      
      return {
        timestamp: now - (99 - i) * 60000,
        price: 98000 + trendComponent + volatilityComponent + microstructureNoise,
        bidVolume: baseVolume * liquidityFactor * (1 + imbalanceFactor),
        askVolume: baseVolume * liquidityFactor * (1 - imbalanceFactor),
        spread: 10 + spreadFactor * 15,
        imbalance: imbalanceFactor,
        depthRatio: 0.8 + Math.sin(i * 0.07) * 0.15
      }
    })
  })

  // 재생/일시정지
  useEffect(() => {
    if (isPlaying && currentIndex < replayData.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= replayData.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentIndex, playbackSpeed, replayData.length])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    setCurrentIndex(Math.min(currentIndex + 1, replayData.length - 1))
  }

  const handleStepBackward = () => {
    setIsPlaying(false)
    setCurrentIndex(Math.max(currentIndex - 1, 0))
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const currentData = replayData.slice(0, currentIndex + 1)
  const currentSnapshot = replayData[currentIndex]

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaHistory className="text-cyan-400" />
        히스토리컬 리플레이
      </h3>

      {/* 타임프레임 선택 */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm mb-2 block">타임프레임</label>
        <div className="flex gap-2">
          {['1m', '5m', '15m', '1h', '4h'].map(tf => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTimeframe === tf
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 재생 컨트롤 */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleStepBackward}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              disabled={currentIndex === 0}
            >
              <FaStepBackward className="text-gray-300" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
            >
              {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
            </button>
            <button
              onClick={handleStepForward}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              disabled={currentIndex >= replayData.length - 1}
            >
              <FaStepForward className="text-gray-300" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              <FaRedo className="text-gray-300" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">재생 속도:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
            </select>
          </div>
        </div>
        
        {/* 프로그레스 바 */}
        <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-purple-500"
            animate={{ width: `${(currentIndex / (replayData.length - 1)) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(replayData[0]?.timestamp || Date.now())}</span>
          <span>{formatTime(currentSnapshot?.timestamp || Date.now())}</span>
          <span>{formatTime(replayData[replayData.length - 1]?.timestamp || Date.now())}</span>
        </div>
      </div>

      {/* 현재 스냅샷 정보 */}
      {currentSnapshot && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">현재 가격</div>
            <div className="text-white font-bold">${safePrice(currentSnapshot.price, 2)}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">스프레드</div>
            <div className="text-yellow-400 font-bold">${safeFixed(currentSnapshot.spread, 2)}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">임밸런스</div>
            <div className={`font-bold ${currentSnapshot.imbalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(currentSnapshot.imbalance * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">깊이 비율</div>
            <div className="text-purple-400 font-bold">{safeFixed(currentSnapshot.depthRatio, 2)}</div>
          </div>
        </div>
      )}

      {/* 차트 */}
      <div className="space-y-4">
        {/* 가격 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">가격 추이</h4>
          <div className="h-48">
            <div className="text-center text-gray-400">
              <div className="animate-pulse bg-gray-700/50 h-full rounded" />
            </div>
          </div>
        </div>

        {/* 볼륨 및 임밸런스 차트 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">볼륨 & 임밸런스</h4>
          <div className="h-48">
            <div className="text-center text-gray-400">
              <div className="animate-pulse bg-gray-700/50 h-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}