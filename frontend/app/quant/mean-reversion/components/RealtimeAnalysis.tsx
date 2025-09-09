'use client'

import { motion } from 'framer-motion'

interface Coin {
  symbol: string
  name: string
  icon: string
  color: string
}

interface MarketData {
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  sma20: number
  sma50: number
  sma200: number
  upperBand: number
  lowerBand: number
  zScore: number
  rsi: number
}

interface RealtimeAnalysisProps {
  coin: Coin
  marketData: MarketData | null
  loading: boolean
}

export default function RealtimeAnalysis({ coin, marketData, loading }: RealtimeAnalysisProps) {
  if (loading || !marketData) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // 평균회귀 상태 판단
  const getMeanReversionStatus = () => {
    const deviationFrom20SMA = ((marketData.price - marketData.sma20) / marketData.sma20) * 100
    const zScore = marketData.zScore
    const rsi = marketData.rsi

    if (zScore < -2 || rsi < 30) {
      return { status: '강한 매수', color: 'text-green-400', bgColor: 'bg-green-900/20', confidence: 90 }
    } else if (zScore < -1 || rsi < 40) {
      return { status: '매수 신호', color: 'text-green-300', bgColor: 'bg-green-800/20', confidence: 70 }
    } else if (zScore > 2 || rsi > 70) {
      return { status: '강한 매도', color: 'text-red-400', bgColor: 'bg-red-900/20', confidence: 90 }
    } else if (zScore > 1 || rsi > 60) {
      return { status: '매도 신호', color: 'text-red-300', bgColor: 'bg-red-800/20', confidence: 70 }
    } else {
      return { status: '중립', color: 'text-gray-400', bgColor: 'bg-gray-800/20', confidence: 50 }
    }
  }

  const status = getMeanReversionStatus()
  const priceFromSMA20 = ((marketData.price - marketData.sma20) / marketData.sma20) * 100
  const priceFromUpperBand = ((marketData.upperBand - marketData.price) / marketData.price) * 100
  const priceFromLowerBand = ((marketData.price - marketData.lowerBand) / marketData.lowerBand) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span style={{ color: coin.color }}>{coin.icon}</span>
          실시간 평균회귀 분석
        </h2>
        <div className={`px-4 py-2 rounded-lg ${status.bgColor} border ${status.color.replace('text', 'border')}`}>
          <span className={`font-bold ${status.color}`}>{status.status}</span>
          <span className="text-xs text-gray-400 ml-2">신뢰도 {status.confidence}%</span>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-black/30 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-gray-400 text-sm mb-1">현재 가격</div>
          <div className="text-2xl font-bold text-white">
            ${marketData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm mt-1 ${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {marketData.change24h >= 0 ? '▲' : '▼'} {Math.abs(marketData.change24h).toFixed(2)}%
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-black/30 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-gray-400 text-sm mb-1">Z-Score</div>
          <div className={`text-2xl font-bold ${
            Math.abs(marketData.zScore) > 2 ? 'text-red-400' : 
            Math.abs(marketData.zScore) > 1 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {marketData.zScore.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.abs(marketData.zScore) > 2 ? '극단 구간' : 
             Math.abs(marketData.zScore) > 1 ? '주의 구간' : '정상 구간'}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-black/30 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-gray-400 text-sm mb-1">RSI</div>
          <div className={`text-2xl font-bold ${
            marketData.rsi > 70 ? 'text-red-400' : 
            marketData.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {marketData.rsi.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {marketData.rsi > 70 ? '과매수' : 
             marketData.rsi < 30 ? '과매도' : '중립'}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-black/30 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-gray-400 text-sm mb-1">20일 SMA 이격</div>
          <div className={`text-2xl font-bold ${
            Math.abs(priceFromSMA20) > 5 ? 'text-red-400' : 
            Math.abs(priceFromSMA20) > 2 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {priceFromSMA20 >= 0 ? '+' : ''}{priceFromSMA20.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            SMA: ${marketData.sma20.toFixed(2)}
          </div>
        </motion.div>
      </div>

      {/* 이동평균선 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 font-medium">20일 이동평균</span>
            <span className="text-white font-bold">${marketData.sma20.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, 50 + priceFromSMA20))}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400 font-medium">50일 이동평균</span>
            <span className="text-white font-bold">${marketData.sma50.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (marketData.price / marketData.sma50) * 50))}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 rounded-lg p-4 border border-orange-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-400 font-medium">200일 이동평균</span>
            <span className="text-white font-bold">${marketData.sma200.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (marketData.price / marketData.sma200) * 50))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 볼린저 밴드 상태 */}
      <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">볼린저 밴드 포지션</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">상단 밴드</span>
            <span className="text-red-300">${marketData.upperBand.toFixed(2)}</span>
            <span className="text-red-400">+{priceFromUpperBand.toFixed(2)}%</span>
          </div>
          <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-red-400" style={{ left: '90%' }} />
            <div className="absolute top-0 left-0 h-full w-1 bg-blue-400" style={{ left: '50%' }} />
            <div className="absolute top-0 left-0 h-full w-1 bg-green-400" style={{ left: '10%' }} />
            <motion.div 
              className="absolute top-0 h-full w-2 bg-white rounded-full"
              initial={{ left: '50%' }}
              animate={{ 
                left: `${Math.min(90, Math.max(10, 50 + (priceFromSMA20 * 2)))}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">하단 밴드</span>
            <span className="text-green-300">${marketData.lowerBand.toFixed(2)}</span>
            <span className="text-green-400">-{priceFromLowerBand.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}