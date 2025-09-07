'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaTwitter, FaReddit, FaTelegram, FaChartBar, FaFire, FaHeart, FaAngry, FaSmile } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'
import { config } from '@/lib/config'

// 새로운 컴포넌트들 동적 임포트
const MultiTimeframePlan = dynamic(() => import('@/components/signals/MultiTimeframePlan'), { ssr: false })
const ProfitCalculator = dynamic(() => import('@/components/signals/ProfitCalculator'), { ssr: false })
const BacktestResults = dynamic(() => import('@/components/signals/BacktestResults'), { ssr: false })
const AlertSettings = dynamic(() => import('@/components/signals/AlertSettings'), { ssr: false })
const PortfolioManager = dynamic(() => import('@/components/signals/PortfolioManager'), { ssr: false })
const DetailedAIAnalysis = dynamic(() => import('@/components/signals/DetailedAIAnalysis'), { ssr: false })
const LeverageStrategy = dynamic(() => import('@/components/signals/LeverageStrategy'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

const InvestmentStrategy = dynamic(() => import('@/components/signals/InvestmentStrategy'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

interface SentimentData {
  coin: string
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  score: number
  mentions: number
  engagement: number
  trending: boolean
  sources: {
    twitter: number
    reddit: number
    telegram: number
  }
}

interface TrendingKeyword {
  keyword: string
  count: number
  sentiment: number
  change: number
}

interface SocialStats {
  totalMentions: number
  avgSentiment: number
  topCoin: string
  trendingTopics: TrendingKeyword[]
}

export default function SocialSentimentModule() {
  const [sentiments, setSentiments] = useState<SentimentData[]>([])
  const [stats, setStats] = useState<SocialStats>({
    totalMentions: 0,
    avgSentiment: 0,
    topCoin: 'BTC',
    trendingTopics: []
  })
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'trending' | 'analysis' | 'strategy' | 'tools'>('overview')
  const [priceData, setPriceData] = useState<{ [key: string]: number }>({})
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('SocialSentiment'))
  
  // 감성 점수 계산 (시뮬레이션)
  const calculateSentimentScore = (mentions: number, price: number, volume: number): number => {
    // 가격 변동률과 거래량 기반 감성 점수 계산
    const priceImpact = (Math.random() - config.decimals.value5) * 2 // -1 to 1
    const volumeImpact = volume > 1000000000 ? config.decimals.value2 : 0
    const mentionImpact = mentions > 1000 ? config.decimals.value3 : mentions / 1000 * config.decimals.value3
    
    return Math.max(Math.min(priceImpact + volumeImpact + mentionImpact, 1), -1)
  }
  
  // 감성 분류
  const classifySentiment = (score: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
    if (score > config.decimals.value3) return 'BULLISH'
    if (score < -config.decimals.value3) return 'BEARISH'
    return 'NEUTRAL'
  }
  
  // 실시간 데이터 생성 (실제로는 소셜 미디어 API 사용)
  const generateSocialData = async () => {
    try {
      const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX']
      const sentimentData: SentimentData[] = []
      
      for (const coin of coins) {
        // Binance에서 실시간 가격 정보 가져오기
        const { data: ticker } = await safeApiCall(
          () => binanceAPI.get24hrTicker(`${coin}USDT`),
          null,
          'SocialSentiment'
        )
        
        if (ticker) {
          const price = parseFloat(ticker.lastPrice)
          const volume = parseFloat(ticker.quoteVolume)
          const priceChange = parseFloat(ticker.priceChangePercent)
          
          // 가격 데이터 저장
          setPriceData(prev => ({ ...prev, [coin]: price }))
          
          // 소셜 데이터 시뮬레이션
          const mentions = Math.floor(Math.random() * 10000) + 500
          const engagement = mentions * (Math.random() * 10 + 5)
          const score = calculateSentimentScore(mentions, price, volume)
          
          sentimentData.push({
            coin,
            sentiment: classifySentiment(score),
            score: score,
            mentions: mentions,
            engagement: Math.floor(engagement),
            trending: mentions > 5000 || Math.abs(priceChange) > 5,
            sources: {
              twitter: Math.floor(mentions * config.decimals.value5),
              reddit: Math.floor(mentions * config.decimals.value3),
              telegram: Math.floor(mentions * config.decimals.value2)
            }
          })
        }
      }
      
      setSentiments(sentimentData.sort((a, b) => b.mentions - a.mentions))
      
      // 통계 업데이트
      const totalMentions = sentimentData.reduce((sum, d) => sum + d.mentions, 0)
      const avgSentiment = sentimentData.reduce((sum, d) => sum + d.score, 0) / sentimentData.length
      const topCoin = sentimentData[0]?.coin || 'BTC'
      
      // 트렌딩 키워드 생성
      const keywords = [
        'bullrun', 'moon', 'dump', 'pump', 'hodl', 'whale', 'breakout', 'resistance',
        'support', 'altseason', 'bearish', 'bullish', 'ATH', 'dip', 'accumulation'
      ]
      
      const trendingTopics = keywords.slice(0, 8).map(keyword => ({
        keyword,
        count: Math.floor(Math.random() * 5000) + 100,
        sentiment: Math.random() * 2 - 1,
        change: Math.random() * 200 - 100
      })).sort((a, b) => b.count - a.count)
      
      setStats({
        totalMentions,
        avgSentiment,
        topCoin,
        trendingTopics
      })
    } catch (error) {
      console.error('[SocialSentiment] Data generation error:', error)
    }
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 초기 데이터 로드
        await generateSocialData()
        
        // WebSocket 연결 (가격 업데이트용)
        wsRef.current = new ModuleWebSocket('SocialSentiment')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/!ticker@arr`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 가격 변동에 따른 감성 업데이트
          if (Array.isArray(data)) {
            data.forEach((ticker: any) => {
              const symbol = ticker.s
              const price = parseFloat(ticker.c)
              const priceChange = parseFloat(ticker.P)
              
              // 큰 가격 변동시 감성 점수 업데이트
              if (Math.abs(priceChange) > 3) {
                setSentiments(prev => prev.map(sentiment => {
                  if (sentiment.coin === symbol.replace('USDT', '')) {
                    const newScore = sentiment.score + (priceChange > 0 ? config.decimals.value1 : -config.decimals.value1)
                    return {
                      ...sentiment,
                      score: Math.max(Math.min(newScore, 1), -1),
                      sentiment: classifySentiment(newScore),
                      mentions: sentiment.mentions + Math.floor(Math.random() * 100)
                    }
                  }
                  return sentiment
                }))
              }
            })
          }
          
          measureWs()
        })
        
        // 30초마다 소셜 데이터 새로고침
        const refreshInterval = setInterval(generateSocialData, 30000)
        
        setLoading(false)
        
        return () => {
          clearInterval(refreshInterval)
        }
      } catch (err) {
        console.error('[SocialSentiment] Initialization error:', err)
        setLoading(false)
      } finally {
        measureInit()
      }
    }
    
    initModule()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">소셜 감성 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  const selectedSentiment = sentiments.find(s => s.coin === selectedCoin)
  
  return (
    <div className="space-y-8">
      {/* 코인 선택 */}
      <div className="flex gap-2 flex-wrap">
        {sentiments.map(sentiment => (
          <button
            key={sentiment.coin}
            onClick={() => setSelectedCoin(sentiment.coin)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCoin === sentiment.coin
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {sentiment.coin}
            {sentiment.trending && (
              <FaFire className="inline-block ml-1 text-orange-400" />
            )}
          </button>
        ))}
      </div>
      
      {/* 실시간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaTwitter className="text-blue-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">총 언급 수</p>
          <p className="text-2xl font-bold text-white">
            {stats.totalMentions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">최근 24시간</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: config.decimals.value1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          {stats.avgSentiment > config.decimals.value3 ? (
            <FaSmile className="text-green-400 text-2xl mb-3" />
          ) : stats.avgSentiment < -config.decimals.value3 ? (
            <FaAngry className="text-red-400 text-2xl mb-3" />
          ) : (
            <FaChartBar className="text-yellow-400 text-2xl mb-3" />
          )}
          <p className="text-gray-400 text-sm mb-1">평균 감성</p>
          <p className={`text-2xl font-bold ${
            stats.avgSentiment > config.decimals.value3 ? 'text-green-400' :
            stats.avgSentiment < -config.decimals.value3 ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {stats.avgSentiment > config.decimals.value3 ? '긍정적' :
             stats.avgSentiment < -config.decimals.value3 ? '부정적' :
             '중립'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            점수: {(stats.avgSentiment * 100).toFixed(0)}%
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: config.decimals.value2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaFire className="text-orange-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">최다 언급</p>
          <p className="text-2xl font-bold text-white">
            {stats.topCoin}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${priceData[stats.topCoin]?.toLocaleString() || '0'}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: config.decimals.value3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaHeart className="text-pink-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">트렌딩</p>
          <p className="text-2xl font-bold text-white">
            {sentiments.filter(s => s.trending).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">급상승 코인</p>
        </motion.div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800">
        {[
          { id: 'overview', label: '개요' },
          { id: 'trending', label: '트렌딩' },
          { id: 'analysis', label: '분석' },
          { id: 'strategy', label: '전략' },
          { id: 'tools', label: '도구' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">실시간 소셜 감성</h2>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">코인</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">감성</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">언급 수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">참여도</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">소스</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sentiments.map((sentiment, index) => (
                    <motion.tr
                      key={sentiment.coin}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * config.decimals.value05 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-white flex items-center gap-2">
                          {sentiment.coin}
                          {sentiment.trending && <FaFire className="text-orange-400" />}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 text-sm font-bold ${
                          sentiment.sentiment === 'BULLISH' ? 'text-green-400' :
                          sentiment.sentiment === 'BEARISH' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {sentiment.sentiment === 'BULLISH' ? <FaSmile /> :
                           sentiment.sentiment === 'BEARISH' ? <FaAngry /> :
                           <FaChartBar />}
                          {sentiment.sentiment === 'BULLISH' ? '긍정' :
                           sentiment.sentiment === 'BEARISH' ? '부정' :
                           '중립'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {sentiment.mentions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {(sentiment.engagement / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <FaTwitter className="text-blue-400" title={`${sentiment.sources.twitter}`} />
                          <FaReddit className="text-orange-400" title={`${sentiment.sources.reddit}`} />
                          <FaTelegram className="text-blue-300" title={`${sentiment.sources.telegram}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sentiment.trending ? (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-bold">
                            트렌딩
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">일반</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'trending' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">트렌딩 키워드</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.keyword}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * config.decimals.value05 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-white">#{topic.keyword}</span>
                  <span className={`text-sm font-bold ${
                    topic.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {topic.change > 0 ? '+' : ''}{topic.change.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{topic.count.toLocaleString()} 언급</span>
                  <span className={`${
                    topic.sentiment > 0 ? 'text-green-400' :
                    topic.sentiment < 0 ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {topic.sentiment > 0 ? '긍정적' :
                     topic.sentiment < 0 ? '부정적' :
                     '중립'}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      topic.sentiment > 0 ? 'bg-green-400' :
                      topic.sentiment < 0 ? 'bg-red-400' :
                      'bg-yellow-400'
                    }`}
                    style={{ width: `${Math.abs(topic.sentiment) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'analysis' && selectedSentiment && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{selectedCoin} 감성 분석</h2>
          
          {/* DetailedAIAnalysis 컴포넌트 */}
          <DetailedAIAnalysis 
            symbol={selectedCoin}
            analysisType="social-sentiment"
            data={{
              sentiment: selectedSentiment.sentiment,
              score: selectedSentiment.score,
              mentions: selectedSentiment.mentions,
              trending: selectedSentiment.trending
            }}
          />
          
          {/* 레버리지 전략 추천 */}
          <LeverageStrategy 
            symbol={selectedCoin}
            volatility={Math.abs(selectedSentiment.score) * 50} // 감성 점수 기반 변동성
            trend={selectedSentiment.sentiment === 'BULLISH' ? 'bullish' : selectedSentiment.sentiment === 'BEARISH' ? 'bearish' : 'neutral'}
            signalStrength={Math.min(Math.abs(selectedSentiment.score) * 100, 100)} // 감성 점수 기반 신호 강도
            marketCondition={selectedSentiment.trending ? 'volatile' : 'normal'}
            currentPrice={priceData[selectedCoin] || 0}
          />
          
          {/* 투자금액별 전략 */}
          <InvestmentStrategy 
            symbol={selectedCoin}
            currentPrice={priceData[selectedCoin] || 0}
            signalType="social-sentiment"
            marketCondition={selectedSentiment.trending ? 'volatile' : selectedSentiment.sentiment === 'BULLISH' ? 'bullish' : selectedSentiment.sentiment === 'BEARISH' ? 'bearish' : 'neutral'}
            volatility={Math.abs(selectedSentiment.score) * 50}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-blue-400">소셜 미디어 분포</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="flex items-center gap-2 text-gray-400">
                      <FaTwitter className="text-blue-400" /> Twitter
                    </span>
                    <span className="text-white font-bold">
                      {selectedSentiment.sources.twitter.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-400 h-3 rounded-full"
                      style={{ width: `${(selectedSentiment.sources.twitter / selectedSentiment.mentions) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="flex items-center gap-2 text-gray-400">
                      <FaReddit className="text-orange-400" /> Reddit
                    </span>
                    <span className="text-white font-bold">
                      {selectedSentiment.sources.reddit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-orange-400 h-3 rounded-full"
                      style={{ width: `${(selectedSentiment.sources.reddit / selectedSentiment.mentions) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="flex items-center gap-2 text-gray-400">
                      <FaTelegram className="text-blue-300" /> Telegram
                    </span>
                    <span className="text-white font-bold">
                      {selectedSentiment.sources.telegram.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-300 h-3 rounded-full"
                      style={{ width: `${(selectedSentiment.sources.telegram / selectedSentiment.mentions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-blue-400">투자 시그널</h3>
              <div className="space-y-3">
                {selectedSentiment.sentiment === 'BULLISH' && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="text-green-400 font-bold">📈 매수 신호</p>
                    <p className="text-sm text-gray-300 mt-1">
                      긍정적 감성이 우세합니다. 상승 모멘텀 기대.
                    </p>
                  </div>
                )}
                {selectedSentiment.sentiment === 'BEARISH' && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400 font-bold">📉 매도 신호</p>
                    <p className="text-sm text-gray-300 mt-1">
                      부정적 감성이 우세합니다. 하락 압력 주의.
                    </p>
                  </div>
                )}
                {selectedSentiment.sentiment === 'NEUTRAL' && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 font-bold">⚖️ 관망</p>
                    <p className="text-sm text-gray-300 mt-1">
                      중립적 감성. 추가 신호 대기 권장.
                    </p>
                  </div>
                )}
                {selectedSentiment.trending && (
                  <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded">
                    <p className="text-orange-400 font-bold">🔥 트렌딩 알림</p>
                    <p className="text-sm text-gray-300 mt-1">
                      소셜 미디어에서 급격한 관심 증가 중
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'strategy' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">소셜 감성 트레이딩 전략</h2>
          
          {/* 다중 시간대 계획 */}
          <MultiTimeframePlan 
            strategy={{
              name: "소셜 감성 추세 전략",
              description: "소셜 미디어 감성 변화를 활용한 단기 트레이딩",
              timeframes: [
                { period: "1분", signal: "소셜 트렌딩 급변 감지", confidence: 85 },
                { period: "5분", signal: "감성 점수 임계값 돌파", confidence: 78 },
                { period: "15분", signal: "언급량 급증 확인", confidence: 92 },
                { period: "1시간", signal: "감성 지속성 검증", confidence: 88 }
              ],
              entryRules: [
                "긍정 감성 ${config.percentage.value75} 이상 + 트렌딩 상태",
                "언급량 평균 대비 ${config.percentage.value300} 이상 증가",
                "3개 이상 소셜 플랫폼에서 동시 신호"
              ],
              exitRules: [
                "감성 점수 ${config.percentage.value50} 이하로 하락",
                "언급량 평균 수준으로 복귀",
                "반대 감성 급증 시 즉시 청산"
              ]
            }}
          />
          
          {/* 백테스트 결과 */}
          <BacktestResults 
            results={{
              period: "최근 3개월",
              totalTrades: 247,
              winRate: 68.4,
              totalReturn: 34.7,
              maxDrawdown: -8.2,
              sharpeRatio: 2.14,
              profitFactor: 2.8,
              avgWin: 4.2,
              avgLoss: -2.1,
              bestTrade: 28.5,
              worstTrade: -12.3,
              monthlyReturns: [
                { month: "11월", return: 12.4, trades: 89 },
                { month: "12월", return: 8.9, trades: 76 },
                { month: "1월", return: 13.4, trades: 82 }
              ]
            }}
            strategy="소셜 감성 전략"
          />
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">트레이딩 도구</h2>
          
          {/* 수익 계산기 */}
          <ProfitCalculator 
            defaultAmount={10000}
            signals={[
              {
                name: "긍정 감성 급등",
                winRate: 72,
                avgReturn: 4.8,
                risk: "중간",
                timeframe: "4-8시간"
              },
              {
                name: "바이럴 트렌딩",
                winRate: 65,
                avgReturn: 8.2,
                risk: "높음",
                timeframe: "1-3시간"
              },
              {
                name: "감성 반전",
                winRate: 78,
                avgReturn: 3.4,
                risk: "낮음",
                timeframe: "6-12시간"
              }
            ]}
          />
          
          {/* 알림 설정 */}
          <AlertSettings 
            alertTypes={[
              {
                name: "소셜 트렌딩 급증",
                description: "언급량이 평균 대비 ${config.percentage.value500} 이상 증가",
                enabled: true,
                threshold: "${config.percentage.value500}"
              },
              {
                name: "감성 임계점 돌파",
                description: "긍정/부정 감성이 ${config.percentage.value80} 이상",
                enabled: true,
                threshold: "${config.percentage.value80}"
              },
              {
                name: "바이럴 키워드 감지",
                description: "새로운 바이럴 키워드 등장",
                enabled: false,
                threshold: "자동"
              }
            ]}
          />
          
          {/* 포트폴리오 관리 */}
          <PortfolioManager 
            strategy="소셜 감성 전략"
          />
        </div>
      )}
    </div>
  )
}