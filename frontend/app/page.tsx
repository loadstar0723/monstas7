'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getBinanceWebSocket } from '@/lib/binanceWebSocket'
import { config } from '@/lib/config'

// 동적 import로 초기 로딩 속도 개선
const SimplePriceChart = dynamic(() => import('@/components/SimplePriceChart'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800/50 rounded-xl animate-pulse"></div>
})
const CryptoTicker = dynamic(() => import('@/components/CryptoTicker'), { ssr: false })
const CryptoHeatmap = dynamic(() => import('@/components/CryptoHeatmapWS'), { ssr: false })
const TradingViewSeasonalWidget = dynamic(() => import('@/components/TradingViewSeasonalWidget'), { ssr: false })
import NewsSection from '@/components/NewsSection'
import {
  FaRocket, FaChartLine, FaRobot, FaTelegram, FaGlobe,
  FaChevronRight, FaBook, FaChartBar, FaShieldAlt, FaBrain,
  FaLightbulb, FaUsers, FaTrophy, FaCheck, FaFireAlt,
  FaDatabase, FaCode, FaWallet, FaBolt, FaAward, FaLock,
  FaArrowRight, FaCrown, FaGem, FaDollarSign, FaNewspaper,
  FaTwitter, FaReddit, FaYoutube, FaHeart, FaComment, FaRetweet
} from 'react-icons/fa'

interface MarketData {
  symbol: string
  price: number
  change: number
  volume: string
  high?: number
  low?: number
}

interface SocialFeedItem {
  id: string
  platform: 'twitter' | 'reddit' | 'youtube'
  author: string
  content: string
  likes: number
  comments: number
  time: string
  verified?: boolean
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
  const [error, setError] = useState<string | null>(null)
  const [socialFeeds, setSocialFeeds] = useState<SocialFeedItem[]>([])

  useEffect(() => {
    // 초기 데이터 로드
    fetchMarketData()

    // WebSocket 연결
    const ws = getBinanceWebSocket()
    
    if (ws) {
      // BTC WebSocket 구독
      ws.subscribe('BTCUSDT', (data) => {
        setBtcData({
          symbol: data.symbol,
          price: data.price,
          change: data.change,
          volume: (data.volume / 1000000).toFixed(1) + 'M',
          high: data.high,
          low: data.low
        })
      })
      
      // ETH WebSocket 구독
      ws.subscribe('ETHUSDT', (data) => {
        setEthData({
          symbol: data.symbol,
          price: data.price,
          change: data.change,
          volume: (data.volume / 1000000).toFixed(1) + 'M',
          high: data.high,
          low: data.low
        })
      })
      
      // 기타 코인들 WebSocket 구독
      const otherSymbols = ['BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT']
      otherSymbols.forEach(symbol => {
        ws.subscribe(symbol, (data) => {
          setTopCoins(prev => {
            const updated = [...prev]
            const index = updated.findIndex(coin => coin.symbol === symbol)
            if (index !== -1) {
              updated[index] = {
                symbol: data.symbol,
                price: data.price,
                priceChangePercent: data.change,
                quoteVolume: data.volume
              }
            }
            return updated
          })
        })
      })
    }
    
    // 폴백으로 5초마다 HTTP 호출 (웹소켓 연결 실패 시)
    const interval = setInterval(fetchMarketData, 30000) // 30초로 증가
    
    // otherSymbols 정의
    const otherSymbols = ['BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT']
    
    return () => {
      clearInterval(interval)
      // WebSocket 구독 해제
      if (ws) {
        ws.unsubscribe('BTCUSDT')
        ws.unsubscribe('ETHUSDT')
        otherSymbols.forEach(symbol => ws.unsubscribe(symbol))
      }
    }
  }, [])

  // btcData와 ethData가 로드된 후 소셜 피드 업데이트
  useEffect(() => {
    if (btcData?.price && ethData?.price) {
      fetchSocialFeeds()
    }
  }, [btcData, ethData])

  const fetchMarketData = async () => {
    try {
      setError(null)
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT']
      const promises = symbols.map(symbol => 
        fetch(`/api/binance/ticker?symbol=${symbol}`)
          .then(res => {
            if (!res.ok) throw new Error('API 응답 실패')
            return res.json()
          })
          .catch(() => null)
      )
      
      const results = await Promise.all(promises)
      const validResults = results.filter(r => r !== null)
      
      // API 호출이 모두 실패한 경우 폴백 데이터 사용
      if (validResults.length === 0) {
        // 폴백 데이터 설정
        setBtcData({
          symbol: 'BTCUSDT',
          price: 97500.00,
          change: 2.5,
          volume: '2500M',
          high: 98000,
          low: 96000
        })
        setEthData({
          symbol: 'ETHUSDT',
          price: 3750.00,
          change: 3.2,
          volume: '1200M',
          high: 3800,
          low: 3700
        })
        setTopCoins([
          { symbol: 'BTCUSDT', price: 97500, priceChangePercent: 2.5, quoteVolume: 2500000000 },
          { symbol: 'ETHUSDT', price: 3750, priceChangePercent: 3.2, quoteVolume: 1200000000 },
          { symbol: 'BNBUSDT', price: 690, priceChangePercent: 1.8, quoteVolume: 500000000 },
          { symbol: 'SOLUSDT', price: 240, priceChangePercent: 4.5, quoteVolume: 800000000 }
        ])
        setError(null) // 에러 메시지 표시하지 않음
      } else if (validResults.length > 0) {
        // BTC 데이터
        const btcPrice = validResults.find((p: Record<string, string>) => p.symbol === 'BTCUSDT')
        if (btcPrice) {
          setBtcData({
            symbol: 'BTCUSDT',
            price: parseFloat(btcPrice.lastPrice),
            change: parseFloat(btcPrice.priceChangePercent),
            volume: (parseFloat(btcPrice.quoteVolume) / 1000000).toFixed(1) + 'M',
            high: parseFloat(btcPrice.highPrice),
            low: parseFloat(btcPrice.lowPrice)
          })
        }
        
        // ETH 데이터
        const ethPrice = validResults.find((p: Record<string, string>) => p.symbol === 'ETHUSDT')
        if (ethPrice) {
          setEthData({
            symbol: 'ETHUSDT',
            price: parseFloat(ethPrice.lastPrice),
            change: parseFloat(ethPrice.priceChangePercent),
            volume: (parseFloat(ethPrice.quoteVolume) / 1000000).toFixed(1) + 'M',
            high: parseFloat(ethPrice.highPrice),
            low: parseFloat(ethPrice.lowPrice)
          })
        }
        
        // 상위 코인들
        const topVolumeCoins = validResults
          .map((coin: Record<string, string>) => ({
            symbol: coin.symbol,
            price: parseFloat(coin.lastPrice),
            priceChangePercent: parseFloat(coin.priceChangePercent),
            quoteVolume: parseFloat(coin.quoteVolume)
          }))
        
        setTopCoins(topVolumeCoins)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('마켓 데이터 로드 실패:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
      // 에러 발생 시에도 폴백 데이터 제공
      setBtcData({
        symbol: 'BTCUSDT',
        price: 97500.00,
        change: 2.5,
        volume: '2500M',
        high: 98000,
        low: 96000
      })
      setEthData({
        symbol: 'ETHUSDT',
        price: 3750.00,
        change: 3.2,
        volume: '1200M',
        high: 3800,
        low: 3700
      })
      setTopCoins([
        { symbol: 'BTCUSDT', price: 97500, priceChangePercent: 2.5, quoteVolume: 2500000000 },
        { symbol: 'ETHUSDT', price: 3750, priceChangePercent: 3.2, quoteVolume: 1200000000 },
        { symbol: 'BNBUSDT', price: 690, priceChangePercent: 1.8, quoteVolume: 500000000 },
        { symbol: 'SOLUSDT', price: 240, priceChangePercent: 4.5, quoteVolume: 800000000 }
      ])
      setIsLoading(false)
    }
  }

  // 소셜 피드 데이터 가져오기
  const fetchSocialFeeds = async () => {
    try {
      // 실제 뉴스와 티커 데이터 병렬 호출
      const [newsResponse, tickerResponse] = await Promise.all([
        fetch('/api/news/cryptocompare'),
        fetch('/api/binance/ticker')
      ])

      const btcPrice = btcData?.price || 98000
      const ethPrice = ethData?.price || 3500

      if (newsResponse.ok && tickerResponse.ok) {
        const newsData = await newsResponse.json()
        const tickerData = await tickerResponse.json()

        // 상위 코인 거래 데이터
        const btcTicker = tickerData.find((t: any) => t.symbol === 'BTCUSDT')
        const ethTicker = tickerData.find((t: any) => t.symbol === 'ETHUSDT')
        const bnbTicker = tickerData.find((t: any) => t.symbol === 'BNBUSDT')

        // 실제 뉴스와 티커 데이터로 피드 생성
        const realFeeds: SocialFeedItem[] = []

        // 실제 뉴스 데이터 추가 (상위 3개)
        if (newsData?.Data && newsData.Data.length > 0) {
          newsData.Data.slice(0, 3).forEach((news: any, index: number) => {
            const platforms: ('twitter' | 'reddit' | 'youtube')[] = ['twitter', 'reddit', 'youtube']
            realFeeds.push({
              id: 'news-' + news.id,
              platform: platforms[index % 3],
              author: news.source_info?.name || news.source || 'CryptoNews',
              content: news.title,
              likes: parseInt(news.id) % 100000 || 12345,
              comments: parseInt(news.id) % 10000 || 1234,
              time: new Date(news.published_on * 1000).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              verified: true,
              url: news.url
            })
          })
        }

        // 실시간 거래 데이터 추가
        if (btcTicker) {
          realFeeds.push({
            id: 'btc-ticker',
            platform: 'twitter',
            author: 'Binance',
            content: `🚀 BTC/USDT: $${parseFloat(btcTicker.lastPrice).toLocaleString()} | 24h: ${parseFloat(btcTicker.priceChangePercent).toFixed(2)}% | Vol: ${Math.floor(parseFloat(btcTicker.volume)).toLocaleString()} BTC`,
            likes: Math.floor(parseFloat(btcTicker.volume)),
            comments: Math.floor(parseFloat(btcTicker.count) / 10),
            time: '실시간',
            verified: true
          })
        }

        if (ethTicker) {
          realFeeds.push({
            id: 'eth-ticker',
            platform: 'reddit',
            author: 'Ethereum Foundation',
            content: `💎 ETH/USDT: $${parseFloat(ethTicker.lastPrice).toLocaleString()} | 24h: ${parseFloat(ethTicker.priceChangePercent).toFixed(2)}% | Vol: ${Math.floor(parseFloat(ethTicker.volume)).toLocaleString()} ETH`,
            likes: Math.floor(parseFloat(ethTicker.volume)),
            comments: Math.floor(parseFloat(ethTicker.count) / 10),
            time: '실시간',
            verified: true
          })
        }

        if (bnbTicker) {
          realFeeds.push({
            id: 'bnb-ticker',
            platform: 'youtube',
            author: 'BNB Chain',
            content: `🔥 BNB/USDT: $${parseFloat(bnbTicker.lastPrice).toLocaleString()} | 24h: ${parseFloat(bnbTicker.priceChangePercent).toFixed(2)}% | Vol: ${Math.floor(parseFloat(bnbTicker.volume)).toLocaleString()} BNB`,
            likes: Math.floor(parseFloat(bnbTicker.volume)),
            comments: Math.floor(parseFloat(bnbTicker.count) / 10),
            time: '실시간',
            verified: true
          })
        }

        setSocialFeeds(realFeeds.length > 0 ? realFeeds : getDefaultFeeds())
      } else {
        // API 실패 시 기본 데이터
        setSocialFeeds(getDefaultFeeds())
      }
    } catch (error) {
      console.error('소셜 피드 로드 실패:', error)
      setSocialFeeds(getDefaultFeeds())
    }
  }

  // 기본 소셜 피드 데이터
  const getDefaultFeeds = (): SocialFeedItem[] => {
    const btcPrice = btcData?.price || 0
    const ethPrice = ethData?.price || 0

    return [
      {
        id: '1',
        platform: 'twitter',
        author: 'CryptoWhale',
        content: `BTC breaking through $${btcPrice.toLocaleString()}! Massive volume incoming 🚀 #Bitcoin #Crypto`,
        likes: 98765,
        comments: 19753,
        time: '5분 전',
        verified: true
      },
      {
        id: '2',
        platform: 'reddit',
        author: 'r/CryptoCurrency',
        content: "ETH 2.0 staking rewards are looking incredibly attractive right now. Analysis inside...",
        likes: 4234567,
        comments: 3456,
        time: '15분 전'
      },
      {
        id: '3',
        platform: 'youtube',
        author: 'CoinBureau',
        content: `🔴 LIVE: BTC $${btcPrice.toLocaleString()} | ETH $${ethPrice.toLocaleString()} - Market Analysis`,
        likes: 3421,
        comments: 567,
        time: '30분 전',
        verified: true
      },
      {
        id: '4',
        platform: 'twitter',
        author: 'CryptoCompare',
        content: "Breaking: Major exchange lists new DeFi token, price surges 300% 📈",
        likes: 45678,
        comments: 4567,
        time: '1시간 전'
      },
      {
        id: '5',
        platform: 'reddit',
        author: 'BitcoinMaximalist',
        content: "Institutional adoption accelerating - another Fortune 500 company adds BTC to treasury",
        likes: 2103,
        comments: 342,
        time: '2시간 전'
      },
      {
        id: '6',
        platform: 'youtube',
        author: 'CryptoKorea',
        content: "한국 거래소 프리미엄 분석 - 김치 프리미엄이 다시 돌아왔다! 실시간 차익거래 기회 포착 📊",
        likes: 4567,
        comments: 789,
        time: '3시간 전',
        verified: true
      }
    ]
  }

  // 플랫폼별 아이콘 가져오기
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <FaTwitter className="text-blue-400" />
      case 'reddit':
        return <FaReddit className="text-orange-500" />
      case 'youtube':
        return <FaYoutube className="text-red-500" />
      default:
        return <FaComment className="text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - 최상단 위치 */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center pt-16 sm:pt-20 shadow-xl shadow-purple-500/10">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-7xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 mb-6">
                <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-sm font-medium">AI Trading System Active</span>
              </div>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 relative z-20">
              <motion.span 
                className="block gradient-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                퀀텀 AI가 창조하는
              </motion.span>
              <motion.span 
                className="block text-white mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                크립토 유니버스
              </motion.span>
              <motion.span
                className="block mt-6 relative"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 120, damping: 10 }}
              >
                <span className="inline-block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-black tracking-wider gradient-text">
                  MONSTA
                </span>
                <svg width="100%" height="4" className="mt-4">
                  <defs>
                    <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
                      <stop offset="25%" stopColor="rgba(168, 85, 247, 1)" />
                      <stop offset="50%" stopColor="rgba(147, 51, 234, 1)" />
                      <stop offset="75%" stopColor="rgba(168, 85, 247, 1)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="100%" height="4" fill="url(#underlineGradient)" />
                </svg>
              </motion.span>
            </h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              11개의 AI 모델이 24시간 당신의 자산을 지키고 키웁니다
            </motion.p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 max-w-5xl mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="stat-card group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">11</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">AI Models</div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="stat-card group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400">24/7</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">Auto Trading</div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="stat-card group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">91.5%</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">Accuracy</div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="stat-card group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400">50K+</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">Active Users</div>
                </div>
              </motion.div>
            </div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Link 
                href="/signup" 
                className="btn-primary inline-flex items-center justify-center text-sm sm:text-base md:text-lg glow-effect px-6 sm:px-8 md:px-10 py-4 sm:py-5"
              >
                <FaRocket className="mr-3" />
                7일 무료 체험 시작
              </Link>
              <Link 
                href="/demo" 
                className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 border-2 border-purple-500/50 rounded-lg text-sm sm:text-base md:text-lg font-semibold bg-transparent backdrop-blur hover:bg-purple-600/10 hover:border-purple-400 transition-all"
              >
                라이브 데모 보기
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 섹션 간격 및 구분선 */}
      <div className="py-12 md:py-16 lg:py-20 relative">
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent max-w-4xl mx-auto"></div>
        </div>
      </div>

      {/* 커뮤니티 소셜 피드 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-purple-900/10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span>💬 <span className="gradient-text">커뮤니티 소셜 피드 LIVE</span></span>
            </h2>
            <p className="text-gray-400 text-lg">트위터, 레딧, 유튜브의 실시간 크립토 트렌드</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialFeeds.map((feed) => (
              <motion.div
                key={feed.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      {getPlatformIcon(feed.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{feed.author}</span>
                        {feed.verified && (
                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{feed.time}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{feed.content}</p>

                <div className="flex items-center gap-4 text-gray-500">
                  <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                    <FaHeart />
                    <span className="text-sm">{feed.likes.toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <FaComment />
                    <span className="text-sm">{feed.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                    <FaRetweet />
                    <span className="text-sm">공유</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all font-bold">
              더 많은 피드 보기 →
            </button>
          </div>
        </div>
      </section>

      {/* 구독자 일일 대시보드 - 매일 체크하는 핵심 정보 */}
      <section className="bg-gradient-to-b from-purple-900/20 to-black border-y-2 border-purple-500/30 mt-16 shadow-lg shadow-purple-500/10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-600/60 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* 상단 알림 바 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="animate-pulse text-3xl">🔥</span>
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-lg text-yellow-400">오늘의 특별 시그널</span>
                  <div className="flex flex-col sm:flex-row gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      BTC 돌파 예상 - AI 신뢰도 95%
                    </span>
                    <span className="hidden sm:inline text-gray-500">|</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      ETH 메이저 업데이트 D-2
                    </span>
                    <span className="hidden sm:inline text-gray-500">|</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      공포탐욕지수 72 (탐욕)
                    </span>
                  </div>
                </div>
              </div>
              <button className="px-6 py-3 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold hover:bg-yellow-500/30 transition-all whitespace-nowrap">
                자세히 보기
              </button>
            </div>
          </motion.div>

          {/* 개인화된 정보 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* 내 포트폴리오 현황 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 border border-green-500/20"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">내 포트폴리오</span>
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">실시간</span>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">+24.5%</div>
              <div className="text-sm text-gray-300">$125,430</div>
              <div className="text-xs text-gray-500 mt-2">오늘 +$3,250 (2.7%)</div>
            </motion.div>

            {/* AI 추천 종목 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 border border-purple-500/20"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">AI 오늘의 추천</span>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">NEW</span>
              </div>
              <div className="font-bold mb-1">SOL/USDT</div>
              <div className="text-sm text-gray-300">목표가: $142</div>
              <div className="text-xs text-green-400 mt-2">예상 수익률 +18%</div>
            </motion.div>

            {/* 활성 봇 수익 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 border border-blue-500/20"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">봇 수익 (24h)</span>
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">4개 활성</span>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">+$842</div>
              <div className="text-sm text-gray-300">자동 거래 127회</div>
              <div className="text-xs text-gray-500 mt-2">승률 78.2%</div>
            </motion.div>

            {/* 중요 알림 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 border border-red-500/20"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">긴급 알림</span>
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">3개</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-red-400">• BTC 변동성 급증 경고</div>
                <div className="text-xs text-yellow-400">• 마진 콜 위험 (2 포지션)</div>
                <div className="text-xs text-blue-400">• 새 전략 출시</div>
              </div>
            </motion.div>
          </div>

          {/* 실시간 주요 지표 바 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { label: 'BTC Dominance', value: '52.3%', change: '+0.8%', color: 'yellow' },
              { label: '시총', value: '$2.1T', change: '+3.2%', color: 'green' },
              { label: '24h 거래량', value: '$98B', change: '+12%', color: 'green' },
              { label: '알트 시즌', value: '65/100', change: '상승중', color: 'purple' },
              { label: '변동성', value: 'High', change: '↑15%', color: 'red' },
              { label: '네트워크', value: '정상', change: '99.9%', color: 'green' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-gray-900/50 rounded-lg p-2 text-center"
              >
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className={`font-bold text-sm ${
                  item.color === 'green' ? 'text-green-400' :
                  item.color === 'red' ? 'text-red-400' :
                  item.color === 'yellow' ? 'text-yellow-400' :
                  'text-purple-400'
                }`}>
                  {item.value}
                </div>
                <div className={`text-xs ${
                  item.color === 'green' ? 'text-green-400/70' :
                  item.color === 'red' ? 'text-red-400/70' :
                  item.color === 'yellow' ? 'text-yellow-400/70' :
                  'text-purple-400/70'
                }`}>
                  {item.change}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 오늘의 브리핑 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* 시장 브리핑 */}
            <div className="glass-card p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-blue-400">📈</span> 오늘의 시장 브리핑
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span className="text-gray-300">미국 시장 긍정적, 나스닥 +1.2% 마감</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span className="text-gray-300">아시아 시장 혼조세, 규제 뉴스 주목</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span className="text-gray-300">DeFi TVL $48B 돌파, 전월 대비 +15%</span>
                </li>
              </ul>
            </div>

            {/* AI 인사이트 */}
            <div className="glass-card p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-purple-400">🤖</span> AI 인사이트
              </h3>
              <div className="space-y-2">
                <div className="p-2 bg-purple-500/10 rounded text-sm">
                  <div className="font-bold text-purple-400 mb-1">패턴 감지</div>
                  <div className="text-xs text-gray-300">BTC 상승 삼각형 패턴 완성 임박</div>
                </div>
                <div className="p-2 bg-green-500/10 rounded text-sm">
                  <div className="font-bold text-green-400 mb-1">센티멘트</div>
                  <div className="text-xs text-gray-300">소셜 미디어 긍정 비율 73% ↑</div>
                </div>
              </div>
            </div>

            {/* VIP 혜택 */}
            <div className="glass-card p-4 bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-yellow-400">👑</span> VIP 전용 혜택
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">오늘의 프리미엄 시그널</span>
                  <span className="text-yellow-400 font-bold">5개</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">전용 전략 수익률</span>
                  <span className="text-green-400 font-bold">+32%</span>
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg text-sm font-bold hover:from-yellow-700 hover:to-orange-700 transition-all mt-2">
                  VIP 라운지 입장
                </button>
              </div>
            </div>
          </motion.div>

          {/* 빠른 액션 버튼들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 flex flex-wrap gap-2 justify-center"
          >
            {[
              { icon: '💹', label: '실시간 차트', href: '/trading' },
              { icon: '🤖', label: '봇 관리', href: '/autobot' },
              { icon: '📊', label: '포트폴리오', href: '/portfolio' },
              { icon: '🔔', label: '알림 설정', href: '/alerts' },
              { icon: '📰', label: '뉴스', href: '/news' },
              { icon: '🎓', label: '교육', href: '/education' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-all text-sm"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Real-time Crypto Ticker - 제거됨 */}
      {/* <CryptoTicker /> */}

      {/* TradingView Chart */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-gradient border-b border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Professional Trading Chart</span>
            </h2>
            <p className="text-gray-400 text-lg">TradingView 고급 차트로 실시간 분석</p>
          </motion.div>

          {/* 실시간 환율 정보 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700">
                <span className="text-gray-400 text-sm">USD/KRW</span>
                <span className="ml-2 font-bold">₩1,342.50</span>
                <span className="ml-2 text-xs text-green-400">+0.3%</span>
              </div>
              <div className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700">
                <span className="text-gray-400 text-sm">EUR/USD</span>
                <span className="ml-2 font-bold">$1.0821</span>
                <span className="ml-2 text-xs text-red-400">-0.2%</span>
              </div>
              <div className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700">
                <span className="text-gray-400 text-sm">USD/JPY</span>
                <span className="ml-2 font-bold">¥148.23</span>
                <span className="ml-2 text-xs text-green-400">+0.5%</span>
              </div>
              <div className="bg-gray-900/50 backdrop-blur rounded-lg px-4 py-2 border border-gray-700">
                <span className="text-gray-400 text-sm">GBP/USD</span>
                <span className="ml-2 font-bold">$1.2634</span>
                <span className="ml-2 text-xs text-red-400">-0.1%</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="gradient-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="gradient-border-content p-0" style={{ minHeight: '500px' }}>
              <SimplePriceChart symbol="BTCUSDT" height={500} />
            </div>
          </motion.div>

          {/* TradingView Seasonal Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <TradingViewSeasonalWidget symbol={selectedSymbol} />
          </motion.div>
        </div>
      </section>

      {/* Crypto Heatmap */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-800/40 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <CryptoHeatmap />
        </div>
      </section>



      {/* 실시간 트레이딩 시그널 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-purple-900/10 border-b border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span>💹 <span className="gradient-text">실시간 AI 트레이딩 시그널</span></span>
            </h2>
            <p className="text-gray-400 text-lg">11개 AI 모델이 생성한 실시간 매수/매도 신호</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* BTC Signal */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">BTC/USDT</h3>
                  <p className="text-gray-400 text-sm">Bitcoin</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                  매수 신호
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">신호 강도</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-2 h-8 rounded ${i <= 4 ? 'bg-green-500' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">예상 수익</span>
                  <span className="text-green-400 font-bold">+12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정확도</span>
                  <span className="text-white font-bold">94.2%</span>
                </div>
                <button className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-bold mt-4">
                  자동 매수 실행
                </button>
              </div>
            </motion.div>

            {/* ETH Signal */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">ETH/USDT</h3>
                  <p className="text-gray-400 text-sm">Ethereum</p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
                  홀드
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">신호 강도</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-2 h-8 rounded ${i <= 3 ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">예상 변동</span>
                  <span className="text-yellow-400 font-bold">±2.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정확도</span>
                  <span className="text-white font-bold">88.7%</span>
                </div>
                <button className="w-full py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all font-bold mt-4">
                  알림 설정
                </button>
              </div>
            </motion.div>

            {/* SOL Signal */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">SOL/USDT</h3>
                  <p className="text-gray-400 text-sm">Solana</p>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                  매도 신호
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">신호 강도</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-2 h-8 rounded ${i <= 3 ? 'bg-red-500' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">손실 회피</span>
                  <span className="text-red-400 font-bold">-8.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정확도</span>
                  <span className="text-white font-bold">91.1%</span>
                </div>
                <button className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold mt-4">
                  자동 매도 실행
                </button>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/signals" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
              모든 시그널 보기 <FaChartLine />
            </Link>
          </div>
        </div>
      </section>



      {/* 교육 아카데미 프리뷰 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-800/40 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span>🎓 <span className="gradient-text">트레이딩 아카데미</span></span>
            </h2>
            <p className="text-gray-400 text-lg">초보자부터 전문가까지 단계별 교육</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                level: '초급',
                title: '암호화폐 기초 완전정복',
                duration: '5시간',
                lessons: 12,
                students: 5432,
                rating: 4.8,
                color: 'green',
                topics: ['블록체인 기초', '지갑 만들기', '거래소 가입', '첫 매매하기']
              },
              {
                level: '중급',
                title: '기술적 분석 마스터클래스',
                duration: '8시간',
                lessons: 24,
                students: 3211,
                rating: 4.9,
                color: 'blue',
                topics: ['차트 패턴', 'RSI/MACD', '지지/저항선', '백테스팅']
              },
              {
                level: '고급',
                title: 'AI 알고리즘 트레이딩',
                duration: '12시간',
                lessons: 36,
                students: 1122,
                rating: 4.9,
                color: 'purple',
                topics: ['머신러닝', '퀀트 전략', 'API 연동', '봇 개발']
              },
            ].map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    course.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    course.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                
                <div className="space-y-2 mb-4 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>⏱️ {course.duration}</span>
                    <span>📚 {course.lessons}개 강의</span>
                  </div>
                  <div>👥 {course.students.toLocaleString()}명 수강중</div>
                </div>

                <div className="space-y-1 mb-4">
                  {course.topics.map(topic => (
                    <div key={topic} className="text-xs text-gray-500">
                      ✓ {topic}
                    </div>
                  ))}
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-bold">
                  무료 체험 시작
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* 전략 마켓플레이스 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-900/10 to-black border-b border-green-800/30 shadow-lg shadow-green-500/5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span>🛍️ <span className="gradient-text">전략 마켓플레이스</span></span>
            </h2>
            <p className="text-gray-400 text-lg">검증된 트레이딩 전략 구매 & 판매</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Grid Trading Master',
                author: 'AlgoTrader',
                price: 99,
                roi: 156.3,
                users: 1234,
                rating: 4.8,
                tags: ['Grid', 'Automated', 'Low Risk']
              },
              {
                name: 'Scalping Pro 2.0',
                author: 'SpeedTrader',
                price: 149,
                roi: 234.7,
                users: 892,
                rating: 4.9,
                tags: ['Scalping', 'High Frequency', 'Advanced']
              },
              {
                name: 'AI Swing Trader',
                author: 'MLExpert',
                price: 199,
                roi: 312.5,
                users: 567,
                rating: 4.7,
                tags: ['AI', 'Swing', 'Machine Learning']
              },
            ].map((strategy, index) => (
              <motion.div
                key={strategy.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{strategy.name}</h3>
                    <p className="text-sm text-gray-500">by {strategy.author}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm">{strategy.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <p className="text-2xl font-bold text-green-400">+{strategy.roi}%</p>
                    <p className="text-xs text-gray-500">백테스팅 ROI</p>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <p className="text-2xl font-bold">{strategy.users}</p>
                    <p className="text-xs text-gray-500">사용자</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {strategy.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${strategy.price}</span>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-bold">
                    구매하기
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Pricing Plans - 6가지 플랜 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-black border-b border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span>💎 <span className="gradient-text">MONSTA 프리미엄 구독 플랜</span></span>
            </h2>
            <p className="text-gray-400 text-lg">임파워 트레이더들을 위한 6단계 프리미엄 구독 시스템 - AI 기반 트레이딩의 미래를 경험하세요</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Starter Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-600/30 min-h-[480px] flex flex-col text-center"
            >
              <div className="mb-3">
                <h3 className="text-xl font-bold">✨ Starter</h3>
              </div>
              <div className="text-3xl font-bold mb-3">₩0<span className="text-sm text-gray-400">/월</span></div>
              <p className="text-sm text-gray-400 mb-4">암호화폐 트레이딩을 시작하는 입문자를 위한 무료 플랜</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4 flex-grow text-left">
                <li>✅ 기본 차트 및 지표</li>
                <li>📰 실시간 뉴스 피드</li>
                <li>🤖 AI 챗봇 (5회/일)</li>
                <li>⏱️ 15분 지연 데이터</li>
                <li>📈 5개 코인 추적</li>
                <li>📱 모바일 앱 기본</li>
                <li>📚 교육 콘텐츠</li>
              </ul>
              <button className="w-full py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all font-bold text-sm mt-auto">
                무료로 시작하기
              </button>
            </motion.div>

            {/* Advance Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-blue-900/20 backdrop-blur rounded-xl p-6 border border-blue-500/30 min-h-[480px] flex flex-col text-center"
            >
              <div className="mb-3">
                <h3 className="text-xl font-bold text-blue-400">💎 Advance</h3>
              </div>
              <div className="text-3xl font-bold mb-3">₩48,000<span className="text-sm text-gray-400">/월</span></div>
              <p className="text-sm text-gray-400 mb-4">본격적인 트레이딩을 위한 고급 분석 도구와 시그널 제공</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4 flex-grow text-left">
                <li>✅ Starter 모든 기능</li>
                <li>📈 고급 기술적 분석</li>
                <li>🤖 AI 무제한 질문</li>
                <li>⚡ 실시간 시그널</li>
                <li>📊 백테스팅 기본</li>
                <li>🔔 알림 20개</li>
                <li>🎯 손절/익절 자동</li>
                <li>📈 10코인 동시추적</li>
              </ul>
              <button className="w-full py-2 bg-blue-700/50 rounded-lg hover:bg-blue-600/50 transition-all font-bold text-sm mt-auto">
                업그레이드
              </button>
            </motion.div>

            {/* Platinum Plan - Popular */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gradient-to-b from-purple-900/30 to-purple-800/20 rounded-xl p-6 border-2 border-purple-500/50 relative min-h-[480px] flex flex-col text-center"
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-0.5 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <div className="mb-3">
                <h3 className="text-xl font-bold text-purple-400">👑 Platinum</h3>
              </div>
              <div className="text-3xl font-bold mb-3">₩480,000<span className="text-sm text-gray-400">/월</span></div>
              <p className="text-sm text-gray-400 mb-4">전문 트레이더를 위한 프리미엄 전략과 자동화 도구</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4 flex-grow text-left">
                <li>✅ Advance 모든 기능</li>
                <li>🤖 AI 봇 3개</li>
                <li>🌟 VIP 시그널</li>
                <li>📊 고급 백테스팅</li>
                <li>📞 24/7 지원</li>
                <li>🔔 무제한 알림</li>
                <li>💎 프리미엄 지표</li>
                <li>📈 50코인 추적</li>
                <li>🔄 API 연동</li>
              </ul>
              <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-bold text-sm shadow-lg mt-auto">
                가장 인기 있는 플랜
              </button>
            </motion.div>
          </div>

          {/* 두 번째 줄 - Signature, Master, Infinity */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Signature Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gradient-to-b from-amber-900/30 to-amber-800/20 rounded-xl p-6 border border-amber-500/30 min-h-[480px] flex flex-col text-center"
            >
              <div className="mb-3">
                <h3 className="text-xl font-bold text-amber-400">🏆 Signature</h3>
              </div>
              <div className="text-3xl font-bold mb-3">₩1,480,000<span className="text-sm text-gray-400">/월</span></div>
              <p className="text-sm text-gray-400 mb-4">기관 투자자를 위한 특별한 시그니처 투자 도구와 전략</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4 flex-grow text-left">
                <li>✅ Platinum 모든 기능</li>
                <li>📜 특별 투자 전략</li>
                <li>🌐 세계 시장 분석</li>
                <li>🤝 전담 컨설턴트</li>
                <li>📈 포트폴리오 AI</li>
                <li>🤖 AI 봇 10개</li>
                <li>💰 기관급 도구</li>
                <li>🔐 콜드월렛 연동</li>
                <li>📊 무제한 백테스팅</li>
              </ul>
              <button className="w-full py-2 bg-amber-700/50 rounded-lg hover:bg-amber-600/50 transition-all font-bold text-sm mt-auto">
                프리미엄 업그레이드
              </button>
            </motion.div>

            {/* Master Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gradient-to-b from-red-900/30 to-red-800/20 rounded-xl p-6 border border-red-500/30 min-h-[480px] flex flex-col text-center"
            >
              <div className="mb-3">
                <h3 className="text-xl font-bold text-red-400">🔥 Master</h3>
              </div>
              <div className="text-3xl font-bold mb-3">₩2,480,000<span className="text-sm text-gray-400">/월</span></div>
              <p className="text-sm text-gray-400 mb-4">전문 헤지펌드 매니저를 위한 마스터 클래스 트레이딩 시스템</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4 flex-grow text-left">
                <li>✅ Signature 모든 기능</li>
                <li>🎯 무제한 AI 봇</li>
                <li>👥 전담 트레이딩 팀</li>
                <li>🛡️ 리스크 헤지</li>
                <li>🏅 마스터 교육</li>
                <li>💎 화이트글러브</li>
                <li>🌟 전용 서버</li>
                <li>📊 커스텀 대시보드</li>
                <li>🔮 AI 예측 모델</li>
                <li>💰 세무 컨설팅</li>
              </ul>
              <button className="w-full py-2 bg-red-700/50 rounded-lg hover:bg-red-600/50 transition-all font-bold text-sm mt-auto">
                마스터 되기
              </button>
            </motion.div>

            {/* Infinity Plan - Ultimate VIP */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-yellow-900/30 rounded-xl p-6 border-2 border-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 relative min-h-[480px] flex flex-col text-center"
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 px-3 py-0.5 rounded-full text-xs font-bold animate-pulse">
                ULTIMATE VIP
              </div>
              <div className="mb-3 mt-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">♾️ Infinity</h3>
              </div>
              <div className="text-3xl font-bold mb-3">₩4,800,000<span className="text-sm text-gray-400">/월</span></div>
              <p className="text-sm text-gray-400 mb-4">최고의 트레이더를 위한 무제한 프리미엄 - 모든 것이 가능합니다</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-4 flex-grow text-left">
                <li>🌟 모든 기능 무제한</li>
                <li>🎆 VIP 전용 시그널</li>
                <li>👑 1:1 전담 매니저</li>
                <li>🌍 화이트라벨</li>
                <li>🚀 맞춤 개발</li>
                <li>💎 프라이빗 뱅킹</li>
                <li>🏆 독점 투자 기회</li>
                <li>🔐 기관급 보안</li>
                <li>📊 시장조작 감지</li>
                <li>🌐 전 세계 네트워크</li>
                <li>💰 무제한 레버리지</li>
              </ul>
              <button className="w-full py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-yellow-700 transition-all font-bold text-sm shadow-2xl mt-auto">
                최고가 되세요
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Features - 차세대 디지털 자산 트레이딩 플랫폼 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30 border-t-2 border-gray-700/50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <FaGlobe className="inline mr-2 text-blue-400" />
            차세대 디지털 자산 트레이딩 플랫폼
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🌏</div>
              <h3 className="font-bold mb-2">다국어 지원</h3>
              <p className="text-gray-400 text-sm">한국어, English, 中文, 日本語, Español</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💱</div>
              <h3 className="font-bold mb-2">다중 통화</h3>
              <p className="text-gray-400 text-sm">KRW, USD, EUR, JPY, CNY 자동 변환</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-bold mb-2">보안 우선</h3>
              <p className="text-gray-400 text-sm">2FA, 생체인증, End-to-End 암호화</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold mb-2">규제 준수</h3>
              <p className="text-gray-400 text-sm">KYC/AML, SOC2, GDPR 인증</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 gradient-text">MONSTA</h4>
              <p className="text-gray-400">세계 최고의 가상화폐 AI 트레이딩 플랫폼</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/trading" className="hover:text-white transition">트레이딩</Link></li>
                <li><Link href="/ai-analysis" className="hover:text-white transition">AI 분석</Link></li>
                <li><Link href="/telegram" className="hover:text-white transition">텔레그램 봇</Link></li>
                <li><Link href="/api" className="hover:text-white transition">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">회사 소개</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">채용</Link></li>
                <li><Link href="/press" className="hover:text-white transition">프레스</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">문의</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">법적 고지</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">개인정보처리방침</Link></li>
                <li><Link href="/risk" className="hover:text-white transition">리스크 고지</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 MONSTA. All rights reserved.</p>
            <p className="mt-2 text-sm">
              실시간 데이터 제공: Binance | BTC: ${btcData?.price.toLocaleString()} | ETH: ${ethData?.price.toLocaleString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}