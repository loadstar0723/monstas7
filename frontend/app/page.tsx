'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TradingViewChart from '@/components/TradingViewChart'
import CryptoHeatmap from '@/components/CryptoHeatmap'
import AIDashboard from '@/components/AIDashboard'
import TradingViewSeasonalWidget from '@/components/TradingViewSeasonalWidget'
import { FaRocket, FaChartLine, FaRobot, FaTelegram, FaGlobe } from 'react-icons/fa'

interface MarketData {
  symbol: string
  price: number
  change: number
  volume: string
  high?: number
  low?: number
}

export default function Home() {
  const [btcData, setBtcData] = useState<MarketData | null>(null)
  const [ethData, setEthData] = useState<MarketData | null>(null)
  const [topCoins, setTopCoins] = useState<Array<{
    symbol: string
    price: number
    priceChangePercent: number
    quoteVolume: number
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT')

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT']
      const promises = symbols.map(symbol => 
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          .then(res => res.json())
          .catch(() => null)
      )
      
      const results = await Promise.all(promises)
      const validResults = results.filter(r => r !== null)
      
      if (validResults.length > 0) {
        const btc = validResults.find(r => r.symbol === 'BTCUSDT')
        const eth = validResults.find(r => r.symbol === 'ETHUSDT')
        
        if (btc) {
          setBtcData({
            symbol: 'BTC',
            price: parseFloat(btc.lastPrice),
            change: parseFloat(btc.priceChangePercent),
            volume: `$${(parseFloat(btc.quoteVolume) / 1000000).toFixed(0)}M`,
            high: parseFloat(btc.highPrice),
            low: parseFloat(btc.lowPrice)
          })
        }
        
        if (eth) {
          setEthData({
            symbol: 'ETH',
            price: parseFloat(eth.lastPrice),
            change: parseFloat(eth.priceChangePercent),
            volume: `$${(parseFloat(eth.quoteVolume) / 1000000).toFixed(0)}M`
          })
        }
        
        setTopCoins(validResults.map(coin => ({
          symbol: coin.symbol.replace('USDT', ''),
          price: parseFloat(coin.lastPrice),
          priceChangePercent: parseFloat(coin.priceChangePercent),
          quoteVolume: parseFloat(coin.quoteVolume)
        })))
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching market data:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                MONSTA AI
              </span>
              <br className="sm:hidden" />
              <span className="text-white text-2xl sm:text-4xl lg:text-6xl"> Trading Platform</span>
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 px-4 sm:px-0">
              퀀텀 AI 기반 차세대 크립토 트레이딩 플랫폼
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link href="/signals/smart-money">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <FaRocket className="inline mr-2" />
                  시작하기
                </motion.button>
              </Link>
              <Link href="/education/basics">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg border border-gray-700 hover:bg-gray-700 transition-all"
                >
                  더 알아보기
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">실시간 시장 현황</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {topCoins.map((coin, index) => (
                <motion.div
                  key={coin.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-700 transition-all cursor-pointer"
                  onClick={() => setSelectedSymbol(`BINANCE:${coin.symbol}USDT`)}
                >
                  <div className="text-xs sm:text-sm text-gray-400 mb-1">{coin.symbol}</div>
                  <div className="text-sm sm:text-lg font-bold text-white">
                    ${coin.price.toLocaleString()}
                  </div>
                  <div className={`text-xs sm:text-sm ${coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">실시간 차트</h3>
              <div className="bg-gray-800 rounded-xl p-2 sm:p-4">
                <TradingViewChart symbol={selectedSymbol} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">시장 히트맵</h3>
              <div className="bg-gray-800 rounded-xl p-2 sm:p-4">
                <CryptoHeatmap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12">
            핵심 기능
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: FaRobot,
                title: 'AI 트레이딩',
                description: '딥러닝 기반 자동매매',
                link: '/ai/gpt'
              },
              {
                icon: FaChartLine,
                title: '기술적 분석',
                description: '고급 차트 분석 도구',
                link: '/technical/indicators'
              },
              {
                icon: FaTelegram,
                title: '실시간 시그널',
                description: '24/7 알림 시스템',
                link: '/telegram/alerts'
              },
              {
                icon: FaGlobe,
                title: '글로벌 마켓',
                description: '전 세계 거래소 연동',
                link: '/crypto/live'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={feature.link}>
                  <div className="bg-gray-800 rounded-xl p-4 sm:p-6 hover:bg-gray-700 transition-all cursor-pointer">
                    <feature.icon className="text-3xl sm:text-4xl text-purple-500 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Dashboard Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12">
            AI 분석 대시보드
          </h2>
          <AIDashboard />
        </div>
      </section>

      {/* Seasonal Analysis */}
      <section className="px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12">
            시즈널 분석
          </h2>
          <TradingViewSeasonalWidget />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            지금 시작하세요
          </h2>
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
            전문가들이 사용하는 AI 트레이딩 도구를 경험해보세요
          </p>
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-base sm:text-xl shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              무료로 시작하기
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  )
}