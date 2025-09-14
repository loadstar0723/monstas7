'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dataService } from '@/lib/services/comprehensiveDataService'
import {
  FaNewspaper, FaChartLine, FaBrain, FaGlobe,
  FaGithub, FaReddit, FaTwitter, FaCubes,
  FaFireAlt, FaBolt, FaShieldAlt, FaRocket
} from 'react-icons/fa'

export default function ComprehensiveNewsPage() {
  const [marketSentiment, setMarketSentiment] = useState<any>(null)
  const [latestNews, setLatestNews] = useState<any[]>([])
  const [onchainData, setOnchainData] = useState<any>(null)
  const [coinData, setCoinData] = useState<any>(null)
  const [githubActivity, setGithubActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState('BTC')

  useEffect(() => {
    loadAllData()
    const interval = setInterval(loadAllData, 60000) // 1Î∂ÑÎßà??Í∞±Ïã†
    return () => clearInterval(interval)
  }, [selectedCoin])

  const loadAllData = async () => {
    try {
      setLoading(true)

      // Î≥ëÎ†¨Î°?Î™®Îì† ?∞Ïù¥??Î°úÎìú (?êÎü¨Í∞Ä ?òÎèÑ Í≥ÑÏÜç ÏßÑÌñâ)
      const results = await Promise.allSettled([
        dataService.getMarketSentiment(selectedCoin),
        dataService.getLatestNews(10),
        dataService.getBlockchainData(),
        dataService.getCoinPaprikaData(selectedCoin),
        dataService.getCoinCapData(selectedCoin),
        dataService.getGithubActivity(selectedCoin)
      ])

      // ?±Í≥µ??Í≤∞Í≥ºÎß?Ï≤òÎ¶¨
      if (results[0].status === 'fulfilled') setMarketSentiment(results[0].value)
      if (results[1].status === 'fulfilled') setLatestNews(results[1].value)
      if (results[2].status === 'fulfilled') setOnchainData(results[2].value)

      // CoinPaprika?Ä CoinCap ?∞Ïù¥??Î≥ëÌï©
      const coinDataResult: any = {}
      if (results[3].status === 'fulfilled') {
        coinDataResult.paprika = results[3].value
      }
      if (results[4].status === 'fulfilled') {
        coinDataResult.coincap = results[4].value
      }
      if (Object.keys(coinDataResult).length > 0) {
        setCoinData(coinDataResult)
      }

      if (results[5].status === 'fulfilled') setGithubActivity(results[5].value)
    } catch (error) {
      console.error('Data loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* ?§Îçî */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ?ìä Ï¢ÖÌï© ?îÌò∏?îÌèê ?ïÎ≥¥ ?ºÌÑ∞
          </h1>
          <p className="text-gray-400">
            10Í∞?Î¨¥Î£å APIÎ•??µÌï©???§ÏãúÍ∞??¥Ïä§, ?åÏÖú, ?®Ï≤¥???∞Ïù¥??Î∂ÑÏÑù
          </p>
        </motion.div>

        {/* ÏΩîÏù∏ ?†ÌÉù - TOP 30 ÏΩîÏù∏ */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3">?ìà TOP 30 ?îÌò∏?îÌèê ?†ÌÉù</div>
          <div className="flex gap-2 flex-wrap">
            {[
              'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'LINK',
              'DOT', 'MATIC', 'TON', 'ICP', 'SHIB', 'DAI', 'LTC', 'BCH', 'ATOM', 'UNI',
              'ETC', 'LEO', 'XLM', 'NEAR', 'APT', 'FIL', 'ARB', 'VET', 'OP', 'INJ'
            ].map(coin => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  selectedCoin === coin
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            ?í° ?†ÌÉù??ÏΩîÏù∏: <span className="text-purple-400 font-bold">{selectedCoin}</span> - ?§ÏãúÍ∞??¥Ïä§, ?åÏÖú, ?®Ï≤¥???∞Ïù¥??Î∂ÑÏÑù
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. ?úÏû• ?¨Î¶¨ Ï¢ÖÌï© ?êÏàò */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaBrain className="mr-2 text-purple-400" />
                ?úÏû• ?¨Î¶¨ Ï¢ÖÌï© Î∂ÑÏÑù
              </h2>

              {marketSentiment && (
                <div className="space-y-4">
                  {/* Ï¢ÖÌï© ?êÏàò Í≤åÏù¥ÏßÄ */}
                  <div className="relative h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white">
                          {marketSentiment.score}
                        </div>
                        <div className={`text-lg ${
                          marketSentiment.score < 30 ? 'text-red-400' :
                          marketSentiment.score > 70 ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          {marketSentiment.analysis.condition}
                        </div>
                      </div>
                    </div>
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke={
                          marketSentiment.score < 30 ? '#ef4444' :
                          marketSentiment.score > 70 ? '#10b981' :
                          '#eab308'
                        }
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${marketSentiment.score * 2.83} 283`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                  </div>

                  {/* Fear & Greed */}
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Fear & Greed</span>
                      <span className="font-bold">{marketSentiment.fearGreed.value}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {marketSentiment.fearGreed.classification}
                    </div>
                  </div>

                  {/* Ï∂îÏ≤ú ?ÑÎûµ */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-sm text-purple-400 mb-1">Ï∂îÏ≤ú ?ÑÎûµ</div>
                    <div className="font-bold">{marketSentiment.analysis.action}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Î¶¨Ïä§?? {marketSentiment.analysis.risk}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 2. ?§ÏãúÍ∞??¥Ïä§ ?ºÎìú */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaNewspaper className="mr-2 text-blue-400" />
                ÏµúÏã† ?¥Ïä§ (RSS ?ºÎìú)
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {latestNews.map((news, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900/70 transition-all"
                  >
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="font-semibold text-white hover:text-blue-400 transition-colors">
                        {news.title}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {news.description}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{news.source}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(news.pubDate).toLocaleString()}
                        </span>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 3. ?®Ï≤¥???∞Ïù¥??*/}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaCubes className="mr-2 text-orange-400" />
                ?®Ï≤¥???∞Ïù¥??              </h2>

              {onchainData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">?¥Ïãú?àÏù¥??/span>
                    <span className="font-mono">{(onchainData.hashRate / 1e18).toFixed(2)} EH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">?úÏù¥??/span>
                    <span className="font-mono">{(onchainData.difficulty / 1e12).toFixed(2)}T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Î©§Ì? ?¨Í∏∞</span>
                    <span className="font-mono">{onchainData.mempoolSize?.toLocaleString()} txs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">?âÍ∑† Î∏îÎ°ù ?¨Í∏∞</span>
                    <span className="font-mono">{(onchainData.blockSize / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 4. ÎßàÏºì ?∞Ïù¥??(CoinPaprika + CoinCap) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-green-400" />
                ÎßàÏºì ?∞Ïù¥??              </h2>

              {coinData && (
                <div className="space-y-3">
                  {coinData.paprika && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">?úÍ?Ï¥ùÏï° ?úÏúÑ</span>
                        <span className="font-bold">#{coinData.paprika.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ATH</span>
                        <span className="font-mono">${coinData.paprika.ath?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ATH ?ÄÎπ?/span>
                        <span className={`font-bold ${
                          coinData.paprika.percentFromATH < -50 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {coinData.paprika.percentFromATH?.toFixed(2)}%
                        </span>
                      </div>
                    </>
                  )}
                  {coinData.coincap && (
                    <>
                      {coinData.coincap.supply > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Í≥µÍ∏â??/span>
                          <span className="font-mono">
                            {(coinData.coincap.supply / 1e6).toFixed(2)}M
                          </span>
                        </div>
                      )}
                      {coinData.coincap.vwap24Hr > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">VWAP 24h</span>
                          <span className="font-mono">
                            ${coinData.coincap.vwap24Hr.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {coinData.coincap.volumeUsd24Hr > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Í±∞Îûò??24h</span>
                          <span className="font-mono">
                            ${(coinData.coincap.volumeUsd24Hr / 1e9).toFixed(2)}B
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>

            {/* 5. GitHub Í∞úÎ∞ú ?úÎèô */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaGithub className="mr-2 text-gray-400" />
                Í∞úÎ∞ú ?úÎèô
              </h2>

              {githubActivity && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">‚≠?Stars</span>
                    <span className="font-bold">{githubActivity.stars?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">?ç¥ Forks</span>
                    <span className="font-bold">{githubActivity.forks?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">?ìù Open Issues</span>
                    <span className="font-bold">{githubActivity.openIssues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">?? Watchers</span>
                    <span className="font-bold">{githubActivity.watchers?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ?∞Ïù¥???åÏä§ ?úÏãú */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>?ìä ?∞Ïù¥???úÍ≥µ: Binance ??Alternative.me ??CoinPaprika ??CoinGecko ??Blockchain.com</p>
          <p>?¥Ïä§ ?ùÏÑ±: Binance Market Data ??GitHub API ??CryptoCompare ??Etherscan</p>
        </motion.div>
      </div>
    </div>
  )
}
