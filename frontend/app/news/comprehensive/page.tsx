'use client'

import { useState, useEffect } from 'react'
import { translateToKorean, translateNewsBody } from '@/lib/translateService'
import { motion } from 'framer-motion'
import { dataService } from '@/lib/services/comprehensiveDataService'
import NewsModuleWrapper from '../components/NewsModuleWrapper'
import {
  FaNewspaper, FaChartLine, FaBrain, FaGlobe,
  FaGithub, FaReddit, FaTwitter, FaCubes,
  FaFireAlt, FaBolt, FaShieldAlt, FaRocket
} from 'react-icons/fa'

export default function ComprehensiveNewsModule() {
  const [marketSentiment, setMarketSentiment] = useState<any>(null)
  const [latestNews, setLatestNews] = useState<any[]>([])
  const [onchainData, setOnchainData] = useState<any>(null)
  const [coinData, setCoinData] = useState<any>(null)
  const [githubActivity, setGithubActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState('BTC')

  useEffect(() => {
    loadAllData()
    const interval = setInterval(loadAllData, 60000) // 1분마??갱신
    return () => clearInterval(interval)
  }, [selectedCoin])

  const loadAllData = async () => {
    try {
      setLoading(true)

      // 병렬�?모든 데이??로드 (러가 도 계속 진행)
      const results = await Promise.allSettled([
        dataService.getMarketSentiment(selectedCoin),
        dataService.getLatestNews(10),
        dataService.getBlockchainData(),
        dataService.getCoinPaprikaData(selectedCoin),
        dataService.getCoinCapData(selectedCoin),
        dataService.getGithubActivity(selectedCoin)
      ])

      // 공??결과�?처리
      if (results[0].status === 'fulfilled') setMarketSentiment(results[0].value)
      if (results[1].status === 'fulfilled') setLatestNews(results[1].value)
      if (results[2].status === 'fulfilled') setOnchainData(results[2].value)

      // CoinPaprika CoinCap 데이??병합
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
    <NewsModuleWrapper moduleName="ComprehensiveNewsModule">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{translateToKorean("�� 종합 호폐 보 터")}</h1>
          <p className="text-gray-400">{translateNewsBody("10�?무료 API�?합??시�?스, 소셜, 전체??데이??분석")}</p>
        </motion.div>

        {/* 코인 택 - TOP 30 코인 */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3">�� TOP 30 호폐 택</div>
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
            �� 택??코인: <span className="text-purple-400 font-bold">{selectedCoin}</span> - 시�?스, 소셜, 전체??데이??분석
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. 시장 리 종합 수 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaBrain className="mr-2 text-purple-400" />
                시장 리 종합 분석
              </h2>

              {marketSentiment && (
                <div className="space-y-4">
                  {/* 종합 수 게이지 */}
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

                  {/* 추천 략 */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-sm text-purple-400 mb-1">추천 략</div>
                    <div className="font-bold">{marketSentiment.analysis.action}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      리스?? {marketSentiment.analysis.risk}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 2. 시�?스 드 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaNewspaper className="mr-2 text-blue-400" />
                최신 스 (RSS 드)
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
                        {translateToKorean(news.title)}
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

            {/* 3. 전체??데이??*/}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaCubes className="mr-2 text-orange-400" />
                전체??데이??              </h2>

              {onchainData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">해시레이트</span>
                    <span className="font-mono">{(onchainData.hashRate / 1e18).toFixed(2)} EH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">난이도</span>
                    <span className="font-mono">{(onchainData.difficulty / 1e12).toFixed(2)}T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">멤�? 기</span>
                    <span className="font-mono">{onchainData.mempoolSize?.toLocaleString()} txs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">균 블록 기</span>
                    <span className="font-mono">{(onchainData.blockSize / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 4. 마켓 데이??(CoinPaprika + CoinCap) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-green-400" />
                마켓 데이??              </h2>

              {coinData && (
                <div className="space-y-3">
                  {coinData.paprika && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">��?총액 위</span>
                        <span className="font-bold">#{coinData.paprika.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ATH</span>
                        <span className="font-mono">${coinData.paprika.ath?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ATH 대비</span>
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
                          <span className="text-gray-400">공급??/span>
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
                          <span className="text-gray-400">거래??24h</span>
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

            {/* 5. GitHub 개발 동 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaGithub className="mr-2 text-gray-400" />
                개발 동
              </h2>

              {githubActivity && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">�?Stars</span>
                    <span className="font-bold">{githubActivity.stars?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">�� Forks</span>
                    <span className="font-bold">{githubActivity.forks?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">�� Open Issues</span>
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

        {/* 데이??스 시 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>{translateNewsBody("�� 데이??공: Binance ??Alternative.me ??CoinPaprika ??CoinGecko ??Blockchain.com")}</p>
          <p>{translateNewsBody("스 성: Binance Market Data ??GitHub API ??CryptoCompare ??Etherscan")}</p>
        </motion.div>
      </div>
    </div>
      </NewsModuleWrapper>
  )}
