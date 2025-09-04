'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TradingViewWidget from '@/components/TradingViewWidget'
import CryptoHeatmap from '@/components/CryptoHeatmap'
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">퀀텀 AI가 창조하는</span>
              <br />
              <span className="text-white">크립토 유니버스</span>{' '}
              <span className="gradient-text">MONSTA</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Crypto Universe Created by Quantum Intelligence
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/50 backdrop-blur rounded-xl p-4"
              >
                <div className="text-3xl font-bold text-purple-400">11</div>
                <div className="text-gray-400 text-sm">AI 모델</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 backdrop-blur rounded-xl p-4"
              >
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-gray-400 text-sm">자동 트레이딩</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 backdrop-blur rounded-xl p-4"
              >
                <div className="text-3xl font-bold text-green-400">91.5%</div>
                <div className="text-gray-400 text-sm">예측 정확도</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900/50 backdrop-blur rounded-xl p-4"
              >
                <div className="text-3xl font-bold text-yellow-400">50K+</div>
                <div className="text-gray-400 text-sm">활성 사용자</div>
              </motion.div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <FaRocket className="inline mr-2" />
                7일 무료 체험 시작
              </Link>
              <Link 
                href="/demo" 
                className="px-8 py-4 border-2 border-purple-600 rounded-lg text-lg font-semibold hover:bg-purple-600/20 transition-all"
              >
                라이브 데모 보기
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            🔥 실시간 시장 현황
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Main Coins */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {topCoins.map((coin, index) => (
                  <motion.div 
                    key={coin.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800 card-hover cursor-pointer"
                    onClick={() => setSelectedSymbol(`BINANCE:${coin.symbol}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{coin.symbol.replace('USDT', '')}/USDT</h3>
                        <p className="text-gray-400 text-sm">Binance</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        coin.priceChangePercent > 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {coin.priceChangePercent > 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      ${coin.price.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                      거래량: ${(coin.quoteVolume / 1000000).toFixed(1)}M
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* TradingView Chart */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">📊 Professional Trading Chart</h2>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <TradingViewWidget symbol={selectedSymbol} height={600} />
          </div>
        </div>
      </section>

      {/* Crypto Heatmap */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <CryptoHeatmap />
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            🤖 AI 트레이딩 시스템
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <FaRobot size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">11개 AI 모델 앙상블</h3>
              <p className="text-gray-400">GPT-4, Claude, LSTM 등 최첨단 AI 모델을 결합한 정확한 예측 시스템</p>
              <div className="mt-4 text-green-400 font-bold">예측 정확도: 91.5%</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <FaChartLine size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">실시간 기술적 분석</h3>
              <p className="text-gray-400">30개 이상의 기술적 지표를 실시간으로 분석하여 최적의 진입/청산 시점 포착</p>
              <div className="mt-4 text-blue-400 font-bold">분석 지표: 30+</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <FaTelegram size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 자동 트레이딩</h3>
              <p className="text-gray-400">텔레그램 봇과 연동된 완전 자동화 트레이딩 시스템으로 24시간 수익 창출</p>
              <div className="mt-4 text-yellow-400 font-bold">가동률: 99.9%</div>
            </motion.div>
          </div>
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