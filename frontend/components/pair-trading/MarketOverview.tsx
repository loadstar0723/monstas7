'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'

export default function MarketOverview() {
  const [marketData, setMarketData] = useState({
    totalVolume: 0,
    btcDominance: 0,
    fearGreedIndex: 0,
    topGainer: { symbol: '', change: 0 },
    topLoser: { symbol: '', change: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // 여러 코인의 데이터 가져오기
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']
        const responses = await Promise.all(
          symbols.map(symbol => 
            fetch(`/api/binance/ticker/${symbol}`).then(r => r.json())
          )
        )

        // 총 거래량 계산
        const totalVol = responses.reduce((sum, data) => {
          return sum + parseFloat(data.quoteVolume || data.volume || '0')
        }, 0)

        // 상승/하락 탑 찾기
        let topGainer = { symbol: '', change: -100 }
        let topLoser = { symbol: '', change: 100 }
        
        responses.forEach((data, index) => {
          const change = parseFloat(data.priceChangePercent || '0')
          if (change > topGainer.change) {
            topGainer = { symbol: symbols[index].replace('USDT', ''), change }
          }
          if (change < topLoser.change) {
            topLoser = { symbol: symbols[index].replace('USDT', ''), change }
          }
        })

        // BTC 도미넌스 (간단 계산)
        const btcVolume = parseFloat(responses[0].quoteVolume || '0')
        const dominance = (btcVolume / totalVol) * 100

        // Fear & Greed Index (시뮬레이션 - 실제로는 API 필요)
        const fearGreed = 50 + Math.sin(Date.now() / 10000) * 30

        setMarketData({
          totalVolume: totalVol,
          btcDominance: dominance,
          fearGreedIndex: fearGreed,
          topGainer,
          topLoser
        })
        setLoading(false)
      } catch (error) {
        console.error('마켓 데이터 로드 실패:', error)
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000) // 30초마다 업데이트
    return () => clearInterval(interval)
  }, [])

  const getFearGreedColor = (value: number) => {
    if (value < 20) return 'text-red-500'
    if (value < 40) return 'text-orange-500'
    if (value < 60) return 'text-yellow-500'
    if (value < 80) return 'text-green-500'
    return 'text-green-600'
  }

  const getFearGreedText = (value: number) => {
    if (value < 20) return '극도의 공포'
    if (value < 40) return '공포'
    if (value < 60) return '중립'
    if (value < 80) return '탐욕'
    return '극도의 탐욕'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-purple-400">🌍</span>
        마켓 오버뷰
      </h3>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* 총 거래량 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 rounded-lg p-3"
          >
            <div className="text-xs text-gray-400 mb-1">24h 거래량</div>
            <div className="text-lg font-bold text-white">
              ${(marketData.totalVolume / 1000000000).toFixed(2)}B
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="inline-block w-full bg-gray-700 rounded-full h-1">
                <motion.span
                  className="block bg-purple-500 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                />
              </span>
            </div>
          </motion.div>

          {/* BTC 도미넌스 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3"
          >
            <div className="text-xs text-gray-400 mb-1">BTC 도미넌스</div>
            <div className="text-lg font-bold text-orange-400">
              {safeFixed(marketData.btcDominance, 1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="inline-block w-full bg-gray-700 rounded-full h-1">
                <motion.span
                  className="block bg-orange-500 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${marketData.btcDominance}%` }}
                  transition={{ duration: 1, delay: 0.1 }}
                />
              </span>
            </div>
          </motion.div>

          {/* Fear & Greed Index */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-3"
          >
            <div className="text-xs text-gray-400 mb-1">공포 탐욕 지수</div>
            <div className={`text-lg font-bold ${getFearGreedColor(marketData.fearGreedIndex)}`}>
              {Math.round(marketData.fearGreedIndex)}
            </div>
            <div className={`text-xs ${getFearGreedColor(marketData.fearGreedIndex)} mt-1`}>
              {getFearGreedText(marketData.fearGreedIndex)}
            </div>
          </motion.div>

          {/* 최고 상승 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-3"
          >
            <div className="text-xs text-gray-400 mb-1">최고 상승</div>
            <div className="text-sm font-bold text-white">{marketData.topGainer.symbol}</div>
            <div className="text-lg font-bold text-green-400">
              +{safePercent(marketData.topGainer.change)}%
            </div>
          </motion.div>

          {/* 최고 하락 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 rounded-lg p-3"
          >
            <div className="text-xs text-gray-400 mb-1">최고 하락</div>
            <div className="text-sm font-bold text-white">{marketData.topLoser.symbol}</div>
            <div className="text-lg font-bold text-red-400">
              {safePercent(marketData.topLoser.change)}%
            </div>
          </motion.div>
        </div>
      )}

      {/* 실시간 펄스 애니메이션 */}
      <motion.div
        className="mt-4 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  )
}