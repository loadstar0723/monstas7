'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TradingViewWidget from '@/components/TradingViewWidget'
import CryptoHeatmap from '@/components/CryptoHeatmap'
import AIDashboard from '@/components/AIDashboard'
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
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']
      const promises = symbols.map(symbol => 
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          .then(res => res.json())
          .catch(() => null)
      )
      
      const results = await Promise.all(promises)
      const validResults = results.filter(r => r !== null)
      
      if (validResults.length > 0) {
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
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-cyan-900/30 animate-gradient"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
            
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black mb-6">
              <motion.span 
                className="block gradient-text"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                퀀텀 AI가 창조하는
              </motion.span>
              <motion.span 
                className="block text-white mt-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                크립토 유니버스
              </motion.span>
              <motion.span 
                className="block mt-4"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <span className="gradient-text text-6xl md:text-8xl xl:text-9xl neon-text">MONSTA</span>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="stat-card group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative z-10">
                  <div className="text-4xl font-bold gradient-text mb-1">11</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">AI Models</div>
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
                  <div className="text-4xl font-bold text-cyan-400">24/7</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">Auto Trading</div>
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
                  <div className="text-4xl font-bold text-emerald-400">91.5%</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">Accuracy</div>
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
                  <div className="text-4xl font-bold text-amber-400">50K+</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">Active Users</div>
                </div>
              </motion.div>
            </div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Link 
                href="/signup" 
                className="btn-primary inline-flex items-center justify-center text-lg glow-effect"
              >
                <FaRocket className="mr-2" />
                7일 무료 체험 시작
              </Link>
              <Link 
                href="/demo" 
                className="px-8 py-4 border-2 border-purple-500/50 rounded-lg text-lg font-semibold bg-transparent backdrop-blur hover:bg-purple-600/10 hover:border-purple-400 transition-all"
              >
                라이브 데모 보기
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">실시간 시장 현황</span>
            </h2>
            <p className="text-gray-400 text-lg">주요 암호화폐 실시간 가격 및 변동률</p>
          </motion.div>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Main Coins */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topCoins.map((coin, index) => (
                  <motion.div 
                    key={coin.symbol}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 cursor-pointer group"
                    onClick={() => setSelectedSymbol(`BINANCE:${coin.symbol}`)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <h3 className="text-xl font-bold">{coin.symbol.replace('USDT', '')}</h3>
                        </div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">USDT Pair</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur ${
                        coin.priceChangePercent > 0 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {coin.priceChangePercent > 0 ? '↑' : '↓'} {Math.abs(coin.priceChangePercent).toFixed(2)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-3xl font-bold group-hover:gradient-text transition-all">
                          ${coin.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <span className="text-gray-500 text-xs">24h Volume</span>
                        <span className="text-gray-300 text-sm font-medium">
                          ${(coin.quoteVolume / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

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
            <div className="gradient-border-content p-0">
              <TradingViewWidget symbol={selectedSymbol} height={600} />
            </div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <AIDashboard />
          </motion.div>
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