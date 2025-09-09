'use client'

import { motion } from 'framer-motion'
import { FearGreedData } from '../hooks/useFearGreedData'

interface FearGreedGaugeProps {
  coin: string
  fearGreedData: FearGreedData | null
  loading: boolean
}

export default function FearGreedGauge({ coin, fearGreedData, loading }: FearGreedGaugeProps) {
  const getGaugeColor = (value: number) => {
    if (value <= 20) return '#ef4444' // 극공포 - 빨강
    if (value <= 40) return '#f97316' // 공포 - 주황
    if (value <= 60) return '#eab308' // 중립 - 노랑
    if (value <= 80) return '#84cc16' // 탐욕 - 연두
    return '#22c55e' // 극탐욕 - 초록
  }

  const getGradientColors = (value: number) => {
    if (value <= 20) return 'from-red-600 to-red-400'
    if (value <= 40) return 'from-orange-600 to-orange-400'
    if (value <= 60) return 'from-yellow-600 to-yellow-400'
    if (value <= 80) return 'from-lime-600 to-lime-400'
    return 'from-green-600 to-green-400'
  }

  const getActionText = (value: number) => {
    if (value <= 20) return '🔥 강력 매수 신호'
    if (value <= 35) return '📈 매수 고려'
    if (value <= 65) return '⚖️ 관망'
    if (value <= 80) return '📉 매도 고려'
    return '⚠️ 강력 매도 신호'
  }

  const value = fearGreedData?.value || 50

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded-full mx-auto w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {coin} 공포탐욕 지수
          </h2>
          <p className="text-sm text-gray-400">
            실시간 업데이트: {fearGreedData?.updateTime || '대기 중'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">현재 상태</p>
          <p className={`text-lg font-bold bg-gradient-to-r ${getGradientColors(value)} bg-clip-text text-transparent`}>
            {fearGreedData?.coinSentiment || 'Neutral'}
          </p>
        </div>
      </div>

      {/* 원형 게이지 */}
      <div className="relative w-56 h-56 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          {/* 배경 원 */}
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke="#374151"
            strokeWidth="20"
            fill="none"
          />
          {/* 진행 원 */}
          <motion.circle
            cx="112"
            cy="112"
            r="100"
            stroke={getGaugeColor(value)}
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 628' }}
            animate={{ strokeDasharray: `${(value / 100) * 628} 628` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            className="text-5xl font-bold"
            style={{ color: getGaugeColor(value) }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {value}
          </motion.div>
          <div className="text-sm text-gray-400 mt-2">Fear & Greed</div>
        </div>

        {/* 포인터 */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1 h-24 origin-bottom"
          initial={{ rotate: -90 }}
          animate={{ rotate: -90 + (value / 100) * 180 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            transform: `translate(-50%, -100%) rotate(${-90 + (value / 100) * 180}deg)`,
          }}
        >
          <div className="w-full h-full bg-white rounded-full shadow-lg" />
        </motion.div>
      </div>

      {/* 스케일 바 */}
      <div className="mb-6">
        <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative overflow-hidden">
          <motion.div
            className="absolute top-0 w-1 h-full bg-white shadow-lg"
            initial={{ left: '50%' }}
            animate={{ left: `${value}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>0</span>
          <span>극공포</span>
          <span>공포</span>
          <span>중립</span>
          <span>탐욕</span>
          <span>극탐욕</span>
          <span>100</span>
        </div>
      </div>

      {/* 액션 박스 */}
      <motion.div
        className={`bg-gradient-to-r ${getGradientColors(value)} p-4 rounded-xl bg-opacity-10`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">
            {getActionText(value)}
          </p>
          <p className="text-sm text-gray-300">
            신뢰도: {fearGreedData?.confidence || 50}%
          </p>
        </div>
      </motion.div>

      {/* 지표 정보 */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">현재 가격</p>
          <p className="text-lg font-bold text-white">
            ${fearGreedData?.coinPrice?.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) || '0'}
          </p>
          <p className={`text-xs ${(fearGreedData?.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(fearGreedData?.priceChange24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(fearGreedData?.priceChange24h || 0).toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">RSI</p>
          <p className="text-lg font-bold text-white">
            {fearGreedData?.rsi?.toFixed(0) || '50'}
          </p>
          <p className="text-xs text-gray-400">
            {(fearGreedData?.rsi || 50) > 70 ? '과매수' : (fearGreedData?.rsi || 50) < 30 ? '과매도' : '중립'}
          </p>
        </div>
      </div>
    </div>
  )
}