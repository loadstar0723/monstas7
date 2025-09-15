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
const CryptoHeatmap = dynamic(() => import('@/components/CryptoHeatmap'), { ssr: false })
const AIDashboard = dynamic(() => import('@/components/AIDashboard'), { ssr: false })
const TradingViewSeasonalWidget = dynamic(() => import('@/components/TradingViewSeasonalWidget'), { ssr: false })
import { 
  FaRocket, FaChartLine, FaRobot, FaTelegram, FaGlobe, 
  FaChevronRight, FaBook, FaChartBar, FaShieldAlt, FaBrain, 
  FaLightbulb, FaUsers, FaTrophy, FaCheck, FaFireAlt,
  FaDatabase, FaCode, FaWallet, FaBolt, FaAward, FaLock,
  FaArrowRight, FaCrown, FaGem, FaDollarSign
} from 'react-icons/fa'

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
  const [error, setError] = useState<string | null>(null)

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
        setError('실시간 데이터를 가져올 수 없습니다. 샘플 데이터를 표시 중입니다.')
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

  return (
    <div className="min-h-screen">
      {/* 에러 메시지 */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {/* Hero Section - 최상단 위치 */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5 animate-gradient"></div>
          <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-purple-500/[0.02] rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-cyan-500/[0.02] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
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
                <div className="relative inline-block">
                  {/* 배경 글로우 - 매우 은은하게 */}
                  <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 scale-110"></div>
                  
                  <span className="relative inline-block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-black tracking-wider transform hover:scale-105 transition-transform duration-300" 
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 ${config.percentage.value0}, #EC4899 ${config.percentage.value50}, #8B5CF6 ${config.percentage.value100})',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
                      filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      letterSpacing: '0.08em'
                  }}>
                    MONSTA 🚀
                  </span>
                  
                  {/* 언더라인 효과 */}
                  <motion.div 
                    className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-4"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </div>
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
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">91.${config.percentage.value5}</div>
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

      {/* 구독자 일일 대시보드 - 매일 체크하는 핵심 정보 */}
      <section className="bg-gradient-to-b from-purple-900/20 to-black border-b border-purple-500/20 mt-16">
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
                      BTC 돌파 예상 - AI 신뢰도 ${config.percentage.value95}
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
              <div className="text-2xl font-bold text-green-400 mb-1">+24.${config.percentage.value5}</div>
              <div className="text-sm text-gray-300">$125,430</div>
              <div className="text-xs text-gray-500 mt-2">오늘 +$3,250 (2.${config.percentage.value7})</div>
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
              <div className="text-xs text-green-400 mt-2">예상 수익률 +${config.percentage.value18}</div>
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
              <div className="text-xs text-gray-500 mt-2">승률 78.${config.percentage.value2}</div>
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
              { label: 'BTC Dominance', value: '52.${config.percentage.value3}', change: '+0.${config.percentage.value8}', color: 'yellow' },
              { label: '시총', value: '$2.1T', change: '+3.${config.percentage.value2}', color: 'green' },
              { label: '24h 거래량', value: '$98B', change: '+${config.percentage.value12}', color: 'green' },
              { label: '알트 시즌', value: '65/100', change: '상승중', color: 'purple' },
              { label: '변동성', value: 'High', change: '↑${config.percentage.value15}', color: 'red' },
              { label: '네트워크', value: '정상', change: '99.${config.percentage.value9}', color: 'green' },
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
                  <span className="text-gray-300">미국 시장 긍정적, 나스닥 +1.${config.percentage.value2} 마감</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span className="text-gray-300">아시아 시장 혼조세, 규제 뉴스 주목</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span className="text-gray-300">DeFi TVL $48B 돌파, 전월 대비 +${config.percentage.value15}</span>
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
                  <div className="text-xs text-gray-300">소셜 미디어 긍정 비율 ${config.percentage.value73} ↑</div>
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
                  <span className="text-green-400 font-bold">+${config.percentage.value32}</span>
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

      {/* Real-time Crypto Ticker */}
      <CryptoTicker />

      {/* TradingView Chart */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-gradient">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <CryptoHeatmap />
        </div>
      </section>

      {/* AI Dashboard - 백엔드 연동 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">🤖 AI 하이브리드 엔진</span>
            </h2>
            <p className="text-gray-400 text-lg">Next.js UI + Python AI = 최강 트레이딩</p>
          </motion.div>
          
          <AIDashboard />
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">💎 구독 플랜</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Silver Plan */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-8 border border-gray-700"
            >
              <h3 className="text-2xl font-bold mb-2">🥈 Silver</h3>
              <div className="text-4xl font-bold mb-4">₩49,000<span className="text-lg text-gray-400">/월</span></div>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✅ 실시간 뉴스 & 분석</li>
                <li>✅ 기본 기술적 분석</li>
                <li>✅ AI 질문 30개/일</li>
                <li>✅ 텔레그램 기본 시그널</li>
                <li>✅ 포트폴리오 추적</li>
              </ul>
              <button className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all font-bold">
                시작하기
              </button>
            </motion.div>

            {/* Gold Plan - Popular */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gradient-to-b from-purple-900/50 to-blue-900/50 rounded-xl p-8 border-2 border-purple-500 relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">🥇 Gold</h3>
              <div className="text-4xl font-bold mb-4">₩190,000<span className="text-lg text-gray-400">/월</span></div>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✅ 모든 Silver 기능</li>
                <li>✅ AI 무제한 질문</li>
                <li>✅ 고급 자동매매 봇</li>
                <li>✅ 백테스팅 도구</li>
                <li>✅ 우선 고객 지원</li>
                <li>✅ 프리미엄 시그널</li>
              </ul>
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-bold shadow-lg">
                시작하기
              </button>
            </motion.div>

            {/* Diamond Plan */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-8 border border-gray-700"
            >
              <h3 className="text-2xl font-bold mb-2">💎 Diamond</h3>
              <div className="text-4xl font-bold mb-4">₩990,000<span className="text-lg text-gray-400">/월</span></div>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✅ 모든 Gold 기능</li>
                <li>✅ 전담 매니저</li>
                <li>✅ 맞춤 전략 개발</li>
                <li>✅ API 무제한</li>
                <li>✅ 1:1 컨설팅</li>
                <li>✅ 화이트라벨 솔루션</li>
              </ul>
              <button className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all font-bold">
                문의하기
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 실시간 트레이딩 시그널 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-purple-900/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">💹 실시간 AI 트레이딩 시그널</span>
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
                  <span className="text-green-400 font-bold">+12.${config.percentage.value5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정확도</span>
                  <span className="text-white font-bold">94.${config.percentage.value2}</span>
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
                  <span className="text-yellow-400 font-bold">±2.${config.percentage.value1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정확도</span>
                  <span className="text-white font-bold">88.${config.percentage.value7}</span>
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
                  <span className="text-red-400 font-bold">-8.${config.percentage.value3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정확도</span>
                  <span className="text-white font-bold">91.${config.percentage.value1}</span>
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

      {/* 소셜 트레이딩 리더보드 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">🏆 소셜 트레이딩 리더보드</span>
            </h2>
            <p className="text-gray-400 text-lg">상위 트레이더들의 실시간 성과를 따라해보세요</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left py-3 px-4">순위</th>
                  <th className="text-left py-3 px-4">트레이더</th>
                  <th className="text-right py-3 px-4">수익률</th>
                  <th className="text-right py-3 px-4">승률</th>
                  <th className="text-right py-3 px-4">팔로워</th>
                  <th className="text-right py-3 px-4">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { rank: 1, name: 'CryptoMaster', profit: 342.5, winRate: 87.3, followers: 15234, badge: '🥇' },
                  { rank: 2, name: 'WhaleHunter', profit: 285.7, winRate: 82.1, followers: 9821, badge: '🥈' },
                  { rank: 3, name: 'AI_Trader_Pro', profit: 198.3, winRate: 79.5, followers: 7654, badge: '🥉' },
                  { rank: 4, name: 'DeFi_King', profit: 156.2, winRate: 75.8, followers: 5432 },
                  { rank: 5, name: 'Moon_Walker', profit: 134.8, winRate: 71.2, followers: 4321 },
                ].map(trader => (
                  <motion.tr
                    key={trader.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{trader.badge || trader.rank}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                        <div>
                          <p className="font-bold">{trader.name}</p>
                          <p className="text-xs text-gray-500">전문가 인증</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-green-400 font-bold text-lg">+{trader.profit}%</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-white font-bold">{trader.winRate}%</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-300">{trader.followers.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all font-bold text-sm">
                        팔로우
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 자동매매 봇 성과 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">🤖 자동매매 봇 실시간 성과</span>
            </h2>
            <p className="text-gray-400 text-lg">24시간 쉬지 않고 수익을 창출하는 AI 봇</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Grid Bot Pro', profit24h: 2.8, profit7d: 18.5, profit30d: 62.3, status: 'active', trades: 342 },
              { name: 'DCA Master', profit24h: 1.2, profit7d: 8.7, profit30d: 31.2, status: 'active', trades: 156 },
              { name: 'Sniper Bot', profit24h: 5.4, profit7d: 35.2, profit30d: 124.7, status: 'active', trades: 89 },
              { name: 'Arbitrage AI', profit24h: 0.8, profit7d: 5.6, profit30d: 22.1, status: 'paused', trades: 512 },
            ].map((bot, index) => (
              <motion.div
                key={bot.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold">{bot.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    bot.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {bot.status === 'active' ? '활성화' : '일시정지'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">24시간</span>
                    <span className={`font-bold ${bot.profit24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.profit24h > 0 ? '+' : ''}{bot.profit24h}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">7일</span>
                    <span className={`font-bold ${bot.profit7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.profit7d > 0 ? '+' : ''}{bot.profit7d}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">30일</span>
                    <span className={`font-bold ${bot.profit30d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.profit30d > 0 ? '+' : ''}{bot.profit30d}%
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">거래 횟수</span>
                      <span className="text-gray-400">{bot.trades}회</span>
                    </div>
                  </div>
                </div>

                <button className={`w-full py-2 rounded-lg transition-all font-bold mt-4 text-sm ${
                  bot.status === 'active'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}>
                  {bot.status === 'active' ? '정지' : '시작'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 뉴스 & 시장 이벤트 타임라인 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">📰 실시간 뉴스 & 이벤트</span>
            </h2>
            <p className="text-gray-400 text-lg">AI가 분석한 시장 영향도와 함께</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">🔥 Breaking News</h3>
              {[
                { time: '방금 전', title: 'SEC, 비트코인 ETF 승인 임박', impact: 'high', sentiment: 95 },
                { time: '5분 전', title: '테슬라, BTC 결제 재개 검토', impact: 'medium', sentiment: 78 },
                { time: '15분 전', title: '일본 은행, 디지털 엔화 파일럿 시작', impact: 'low', sentiment: 62 },
                { time: '30분 전', title: 'Binance, 유럽 규제 라이선스 획득', impact: 'high', sentiment: 88 },
              ].map((news, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4 hover:bg-gray-800/50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">{news.time}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      news.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      news.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {news.impact === 'high' ? '중요' : news.impact === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <h4 className="font-bold mb-2">{news.title}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">AI 감정</span>
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                          style={{ width: `${news.sentiment}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-400">{news.sentiment}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">📅 Upcoming Events</h3>
              {[
                { date: '오늘 21:30', event: 'Fed 금리 발표', importance: 5 },
                { date: '내일 09:00', event: '중국 GDP 발표', importance: 4 },
                { date: '12/28 15:00', event: 'EU 암호화폐 규제 회의', importance: 3 },
                { date: '12/30 00:00', event: 'CME 비트코인 선물 만기', importance: 5 },
              ].map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4 hover:bg-gray-800/50 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{event.date}</p>
                      <p className="font-bold">{event.event}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-6 rounded ${
                            i < event.importance ? 'bg-purple-500' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 퀀트 지표 대시보드 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-blue-900/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">📊 퀀트 지표 대시보드</span>
            </h2>
            <p className="text-gray-400 text-lg">전문가용 기술적 분석 지표</p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'RSI', value: 68.5, status: 'overbought', color: 'yellow' },
              { name: 'MACD', value: 'Bullish', status: 'cross', color: 'green' },
              { name: 'Stoch', value: 82.3, status: 'overbought', color: 'red' },
              { name: 'BB', value: 'Upper', status: 'touch', color: 'yellow' },
              { name: 'EMA', value: 'Above', status: '200', color: 'green' },
              { name: 'Volume', value: '+${config.percentage.value45}', status: '24h', color: 'green' },
            ].map((indicator, index) => (
              <motion.div
                key={indicator.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 text-center"
              >
                <h4 className="text-sm text-gray-500 mb-2">{indicator.name}</h4>
                <p className={`text-2xl font-bold mb-1 ${
                  indicator.color === 'green' ? 'text-green-400' :
                  indicator.color === 'red' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {indicator.value}
                </p>
                <p className="text-xs text-gray-600">{indicator.status}</p>
              </motion.div>
            ))}
          </div>

          {/* Fear & Greed Index */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-8 glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-center">공포 & 탐욕 지수</h3>
            <div className="relative h-20 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 rounded-full">
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                style={{ left: '${config.percentage.value72}' }}
              />
              <div className="absolute -bottom-8 left-0 text-xs text-red-400">극도의 공포</div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400">중립</div>
              <div className="absolute -bottom-8 right-0 text-xs text-green-400">극도의 탐욕</div>
            </div>
            <div className="text-center mt-12">
              <p className="text-3xl font-bold text-green-400">72</p>
              <p className="text-gray-400">탐욕</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 실시간 센티멘트 분석 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">💬 실시간 센티멘트 분석</span>
            </h2>
            <p className="text-gray-400 text-lg">소셜 미디어 감정 분석 & 트렌드</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 감정 분석 게이지 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6">소셜 미디어 감정 지표</h3>
              <div className="space-y-4">
                {[
                  { platform: 'Twitter', positive: 68, negative: 32, icon: '🐦' },
                  { platform: 'Reddit', positive: 75, negative: 25, icon: '🤖' },
                  { platform: 'Telegram', positive: 82, negative: 18, icon: '✈️' },
                  { platform: 'Discord', positive: 71, negative: 29, icon: '💬' },
                ].map(platform => (
                  <div key={platform.platform} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{platform.icon} {platform.platform}</span>
                      <span className="text-green-400">{platform.positive}% 긍정</span>
                    </div>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div 
                          className="bg-green-500"
                          style={{ width: `${platform.positive}%` }}
                        />
                        <div 
                          className="bg-red-500"
                          style={{ width: `${platform.negative}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 트렌딩 키워드 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6">🔥 트렌딩 키워드</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { word: 'BTC ETF', size: 'large', trend: 'up' },
                  { word: '반감기', size: 'medium', trend: 'up' },
                  { word: 'DeFi', size: 'medium', trend: 'stable' },
                  { word: 'NFT', size: 'small', trend: 'down' },
                  { word: 'Web3', size: 'large', trend: 'up' },
                  { word: 'Layer2', size: 'medium', trend: 'up' },
                  { word: 'Metaverse', size: 'small', trend: 'down' },
                  { word: 'AI Trading', size: 'large', trend: 'up' },
                  { word: 'Staking', size: 'medium', trend: 'stable' },
                  { word: 'GameFi', size: 'small', trend: 'stable' },
                ].map(keyword => (
                  <motion.span
                    key={keyword.word}
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 rounded-full font-bold cursor-pointer ${
                      keyword.size === 'large' ? 'text-lg' :
                      keyword.size === 'medium' ? 'text-base' : 'text-sm'
                    } ${
                      keyword.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                      keyword.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {keyword.word}
                    {keyword.trend === 'up' ? ' ↑' : keyword.trend === 'down' ? ' ↓' : ''}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 리스크 관리 알림 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-red-900/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">⚠️ 리스크 관리 시스템</span>
            </h2>
            <p className="text-gray-400 text-lg">포트폴리오 위험도 실시간 모니터링</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 전체 리스크 게이지 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">포트폴리오 리스크 레벨</h3>
              <div className="relative h-32">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <path
                    d="M 20 80 A 60 60 0 0 1 180 80"
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="10"
                  />
                  <path
                    d="M 20 80 A 60 60 0 0 1 180 80"
                    fill="none"
                    stroke="url(#riskGradient)"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset="85"
                  />
                  <defs>
                    <linearGradient id="riskGradient">
                      <stop offset="${config.percentage.value0}" stopColor="rgb(34, 197, 94)" />
                      <stop offset="${config.percentage.value50}" stopColor="rgb(250, 204, 21)" />
                      <stop offset="${config.percentage.value100}" stopColor="rgb(239, 68, 68)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-yellow-400">${config.percentage.value65}</p>
                  <p className="text-sm text-gray-400">중간 위험</p>
                </div>
              </div>
            </div>

            {/* 실시간 알림 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">🚨 실시간 알림</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[
                  { type: 'warning', message: 'BTC 포지션 손실 -${config.percentage.value5} 도달' },
                  { type: 'info', message: 'ETH 자동 손절 준비됨' },
                  { type: 'danger', message: '마진 레벨 위험 수준 접근' },
                  { type: 'success', message: 'SOL 목표가 도달, 익절 추천' },
                ].map((alert, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-sm ${
                      alert.type === 'danger' ? 'bg-red-500/20 text-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      alert.type === 'success' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>

            {/* 자동 보호 설정 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">🛡️ 자동 보호 설정</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">자동 손절</span>
                  <button className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">포지션 분산</span>
                  <button className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">긴급 청산</span>
                  <button className="w-12 h-6 bg-gray-700 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5" />
                  </button>
                </div>
                <button className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold mt-4">
                  전체 포지션 청산
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 교육 아카데미 프리뷰 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">🎓 트레이딩 아카데미</span>
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

      {/* 커뮤니티 활동 피드 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">👥 커뮤니티 활동</span>
            </h2>
            <p className="text-gray-400 text-lg">실시간 토론 & 인사이트 공유</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 실시간 채팅 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">💬 실시간 채팅</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {[
                  { user: 'CryptoKing', message: 'BTC 지지선 테스트중!', time: '방금' },
                  { user: 'MoonBoy', message: 'ETH 강세 신호 포착', time: '1분 전' },
                  { user: 'DeFiMaster', message: '새로운 스테이킹 풀 오픈', time: '2분 전' },
                  { user: 'Whale123', message: '대량 매수 감지됨', time: '5분 전' },
                ].map((chat, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-400 font-bold">{chat.user}</span>
                      <span className="text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-sm">{chat.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 인기 토론 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">🔥 인기 토론</h3>
              <div className="space-y-3">
                {[
                  { topic: '2025년 비트코인 전망', replies: 342, views: 5421 },
                  { topic: 'AI 트레이딩 봇 수익률 공유', replies: 256, views: 3122 },
                  { topic: 'NFT 시장은 죽었나?', replies: 189, views: 2311 },
                  { topic: 'Layer 2 투자 전략', replies: 134, views: 1876 },
                ].map((topic, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all cursor-pointer">
                    <p className="font-bold text-sm mb-2">{topic.topic}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>💬 {topic.replies}</span>
                      <span>👁️ {topic.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 활동 리더보드 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">🏆 주간 활동 TOP</h3>
              <div className="space-y-2">
                {[
                  { user: 'TraderPro', points: 8542, badge: '🥇' },
                  { user: 'CryptoGuru', points: 7231, badge: '🥈' },
                  { user: 'DeFiKing', points: 6122, badge: '🥉' },
                  { user: 'MoonShot', points: 5433, badge: '4️⃣' },
                  { user: 'HODLer', points: 4876, badge: '5️⃣' },
                ].map((user, index) => (
                  <div key={index} className="flex justify-between items-center p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{user.badge}</span>
                      <span className="font-bold text-sm">{user.user}</span>
                    </div>
                    <span className="text-sm text-gray-400">{user.points.toLocaleString()}점</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 전략 마켓플레이스 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-900/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">🛍️ 전략 마켓플레이스</span>
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

      {/* 경제 캘린더 위젯 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">📅 경제 캘린더</span>
            </h2>
            <p className="text-gray-400 text-lg">주요 경제 이벤트 & 시장 영향도</p>
          </motion.div>

          <div className="glass-card p-6">
            <div className="grid lg:grid-cols-7 gap-4">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
                const today = index === 3; // 목요일을 오늘로 가정
                const events = [
                  { time: '09:00', event: 'GDP 발표', impact: 'high' },
                  { time: '15:30', event: 'FOMC 회의', impact: 'critical' },
                  { time: '21:00', event: '실업률 발표', impact: 'medium' },
                ];
                
                return (
                  <div
                    key={day}
                    className={`p-4 rounded-lg ${
                      today ? 'bg-purple-900/30 border border-purple-500/50' : 'bg-gray-800/30'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="font-bold">{day}</p>
                      <p className="text-2xl font-bold">{25 + index}</p>
                      {today && <p className="text-xs text-purple-400">오늘</p>}
                    </div>
                    
                    {today && (
                      <div className="space-y-2">
                        {events.map((evt, i) => (
                          <div key={i} className="text-xs p-2 bg-gray-800 rounded">
                            <p className="text-gray-400">{evt.time}</p>
                            <p className="font-bold truncate">{evt.event}</p>
                            <div className={`h-1 rounded mt-1 ${
                              evt.impact === 'critical' ? 'bg-red-500' :
                              evt.impact === 'high' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 글로벌 시장 요약 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-900/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">🌍 글로벌 시장 요약</span>
            </h2>
            <p className="text-gray-400 text-lg">전 세계 암호화폐 시장 동향</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 지역별 거래량 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">지역별 거래량</h3>
              <div className="space-y-3">
                {[
                  { region: '🇺🇸 미국', volume: '45.2B', change: 12.3 },
                  { region: '🇨🇳 중국', volume: '32.1B', change: -5.2 },
                  { region: '🇯🇵 일본', volume: '18.7B', change: 8.7 },
                  { region: '🇰🇷 한국', volume: '15.3B', change: 15.2 },
                  { region: '🇪🇺 유럽', volume: '22.8B', change: 6.5 },
                ].map(region => (
                  <div key={region.region} className="flex justify-between items-center">
                    <span>{region.region}</span>
                    <div className="text-right">
                      <p className="font-bold">${region.volume}</p>
                      <p className={`text-xs ${region.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {region.change > 0 ? '+' : ''}{region.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 규제 뉴스 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">🏛️ 규제 뉴스</h3>
              <div className="space-y-3">
                {[
                  { country: '미국', news: 'SEC, 새로운 암호화폐 가이드라인 발표' },
                  { country: 'EU', news: 'MiCA 규제 2025년 전면 시행' },
                  { country: '일본', news: '스테이블코인 규제 완화 검토' },
                  { country: '한국', news: '가상자산 과세 유예 연장 논의' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{item.country}</p>
                    <p className="text-sm">{item.news}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 환율 변동 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">💱 주요 환율</h3>
              <div className="space-y-3">
                {[
                  { pair: 'USD/KRW', rate: 1342.50, change: 0.3 },
                  { pair: 'EUR/USD', rate: 1.0821, change: -0.2 },
                  { pair: 'USD/JPY', rate: 148.23, change: 0.5 },
                  { pair: 'GBP/USD', rate: 1.2634, change: -0.1 },
                  { pair: 'USD/CNY', rate: 7.2451, change: 0.1 },
                ].map(currency => (
                  <div key={currency.pair} className="flex justify-between items-center">
                    <span className="font-bold">{currency.pair}</span>
                    <div className="text-right">
                      <p>{currency.rate}</p>
                      <p className={`text-xs ${currency.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currency.change > 0 ? '+' : ''}{currency.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <FaGlobe className="inline mr-2 text-blue-400" />
            전 세계를 위한 플랫폼
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