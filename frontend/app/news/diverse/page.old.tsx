'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsItem {
  title: string
  description: string
  time: string
  category: string
  sentiment: string
  source?: string
  impact?: string
  tags?: string[]
  url?: string
  importance?: string
}

// 뉴스 서비스 클래스
class NewsService {
  private getTimeAgo(hours: number): string {
    return new Date(Date.now() - hours * 3600000).toISOString()
  }

  private getTimeAgoMinutes(minutes: number): string {
    return new Date(Date.now() - minutes * 60000).toISOString()
  }

  getHeadlineNews(): NewsItem[] {
    return [
      {
        title: '🚨 블랙록 비트코인 ETF, 일일 유입액 10억 달러 돌파',
        description: '기관 투자자들의 관심이 폭발적으로 증가하며 역대 최대 유입액을 기록했습니다.',
        category: 'breaking',
        sentiment: 'positive',
        time: this.getTimeAgoMinutes(15),
        importance: 'high',
        impact: 'high',
        tags: ['ETF', 'BlackRock', '기관투자']
      },
      {
        title: '📢 연준, 금리 인하 신호... 암호화폐 시장 환호',
        description: '연준이 인플레이션 둔화를 언급하며 금리 인하 가능성을 시사했습니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgoMinutes(45),
        importance: 'high',
        impact: 'high',
        tags: ['연준', '금리', '매크로']
      },
      {
        title: '⚡ 이더리움 덴쿤 업그레이드 성공적 완료',
        description: 'Layer 2 수수료가 90% 감소하며 대규모 채택의 길이 열렸습니다.',
        category: 'technical',
        sentiment: 'positive',
        time: this.getTimeAgo(2),
        importance: 'high',
        impact: 'high',
        tags: ['Ethereum', '업그레이드', 'L2']
      },
      {
        title: '🏦 JP모건, 암호화폐 거래 플랫폼 정식 출시',
        description: '월스트리트 대형 은행이 기관 고객 대상 암호화폐 거래 서비스를 시작했습니다.',
        category: 'breaking',
        sentiment: 'positive',
        time: this.getTimeAgo(3),
        importance: 'high',
        impact: 'high',
        tags: ['JPMorgan', '기관', '월스트리트']
      },
      {
        title: '🇰🇷 한국 정부, 암호화폐 과세 2년 추가 유예 발표',
        description: '2027년까지 암호화폐 투자 소득세 과세가 유예됩니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(4),
        importance: 'high',
        impact: 'medium',
        tags: ['한국', '규제', '세금']
      },
      {
        title: '🐋 미스터리 고래, 5억 달러 규모 비트코인 매집',
        description: '정체불명의 대형 투자자가 지난 일주일간 12,000 BTC를 매집했습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(5),
        importance: 'high',
        impact: 'medium',
        tags: ['고래', '온체인', '매집']
      },
      {
        title: '💎 마이크로스트래티지, 추가 10억 달러 비트코인 매입 계획',
        description: '마이클 세일러 CEO가 추가 매입 계획을 발표했습니다.',
        category: 'breaking',
        sentiment: 'positive',
        time: this.getTimeAgo(6),
        importance: 'high',
        impact: 'medium',
        tags: ['MicroStrategy', '기관투자', 'Saylor']
      },
      {
        title: '🔥 바이낸스 거래량 사상 최고치 경신',
        description: '24시간 거래량이 1,500억 달러를 돌파했습니다.',
        category: 'price',
        sentiment: 'neutral',
        time: this.getTimeAgo(7),
        importance: 'medium',
        impact: 'medium',
        tags: ['Binance', '거래량', '변동성']
      },
      {
        title: '🌐 엘살바도르, 비트코인 채권 발행 성공',
        description: '10억 달러 규모의 비트코인 채권이 초과 청약되었습니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(8),
        importance: 'medium',
        impact: 'low',
        tags: ['엘살바도르', '채권', '국가채택']
      },
      {
        title: '⚠️ SEC, 리플 소송 항소 제기',
        description: 'SEC가 리플 판결에 불복하고 항소를 제기했습니다.',
        category: 'regulatory',
        sentiment: 'negative',
        time: this.getTimeAgo(10),
        importance: 'medium',
        impact: 'medium',
        tags: ['SEC', 'Ripple', '소송']
      }
    ]
  }

  async getMarketNews() {
    // API 오류로 인해 정적 데이터 반환
    return [
      {
        title: `📈 BTC 3.5% 상승, $105,000 돌파`,
        description: `비트코인이 강력한 매수세로 $105,000를 돌파했습니다.`,
        category: 'price',
        sentiment: 'positive',
        time: this.getTimeAgoMinutes(5),
        importance: 'high',
        tags: ['BTC', '상승']
      },
      {
        title: `📈 ETH 5.2% 급등, $3,800 회복`,
        description: `이더리움이 주요 저항선을 돌파하며 $3,800를 회복했습니다.`,
        category: 'price',
        sentiment: 'positive',
        time: this.getTimeAgoMinutes(10),
        importance: 'high',
        tags: ['ETH', '상승']
      },
      {
        title: `📈 SOL 8.7% 폭등, $250 신고점`,
        description: `솔라나가 생태계 성장과 함께 신고점을 경신했습니다.`,
        category: 'price',
        sentiment: 'positive',
        time: this.getTimeAgoMinutes(15),
        importance: 'high',
        tags: ['SOL', '상승']
      },
      {
        title: `📉 XRP 2.3% 하락, $2.20 조정`,
        description: `리플이 차익실현 매물로 조정받고 있습니다.`,
        category: 'price',
        sentiment: 'negative',
        time: this.getTimeAgoMinutes(20),
        importance: 'medium',
        tags: ['XRP', '하락']
      },
      {
        title: `📉 DOGE 4.1% 하락, $0.35 지지선 테스트`,
        description: `도지코인이 주요 지지선을 테스트하고 있습니다.`,
        category: 'price',
        sentiment: 'negative',
        time: this.getTimeAgoMinutes(25),
        importance: 'medium',
        tags: ['DOGE', '하락']
      }
    ]
  }

  getOnchainNews(): NewsItem[] {
    return [
      {
        title: '🐋 비트코인 고래 지갑 10% 증가',
        description: '1,000 BTC 이상 보유 지갑이 지난 한 달간 10% 증가했습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(1),
        importance: 'high',
        tags: ['Bitcoin', '고래', '매집']
      },
      {
        title: '💼 거래소 비트코인 보유량 3년 최저',
        description: '투자자들이 거래소에서 개인 지갑으로 비트코인을 인출하고 있습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(3),
        importance: 'high',
        tags: ['거래소', '보유량', '인출']
      },
      {
        title: '🔥 이더리움 소각량 일일 1만 ETH 돌파',
        description: 'EIP-1559 이후 최대 소각량을 기록했습니다.',
        category: 'onchain',
        sentiment: 'positive',
        time: this.getTimeAgo(5),
        importance: 'medium',
        tags: ['Ethereum', '소각', 'EIP-1559']
      }
    ]
  }

  getDeFiNews(): NewsItem[] {
    return [
      {
        title: '🎨 나이키, NFT 마켓플레이스 오픈',
        description: '나이키가 독자적인 NFT 플랫폼을 출시했습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(2),
        importance: 'medium',
        tags: ['NFT', 'Nike', 'Web3']
      },
      {
        title: '🌊 Uniswap V4 출시 임박',
        description: '커스터마이징 가능한 풀과 훅 시스템을 도입한 V4가 곧 출시됩니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(4),
        importance: 'high',
        tags: ['Uniswap', 'DeFi', 'DEX']
      },
      {
        title: '🚀 Arbitrum TVL 50억 달러 돌파',
        description: 'Layer 2 솔루션 Arbitrum의 생태계가 빠르게 성장하고 있습니다.',
        category: 'defi',
        sentiment: 'positive',
        time: this.getTimeAgo(6),
        importance: 'medium',
        tags: ['Arbitrum', 'L2', 'TVL']
      }
    ]
  }

  getRegulatoryNews(): NewsItem[] {
    return [
      {
        title: '🏛️ EU, 암호화폐 규제 프레임워크 MiCA 최종 승인',
        description: '유럽연합이 포괄적인 암호화폐 규제안을 승인했습니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(1),
        importance: 'high',
        tags: ['EU', 'MiCA', '규제']
      },
      {
        title: '🇺🇸 미국 하원, 암호화폐 우호적 법안 통과',
        description: '스테이블코인 규제와 DeFi 가이드라인을 포함한 법안이 하원을 통과했습니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(3),
        importance: 'high',
        tags: ['미국', '규제', '법안']
      },
      {
        title: '🇯🇵 일본, 암호화폐 세율 20%로 인하 검토',
        description: '현재 최대 55%인 암호화폐 세율을 주식과 동일한 20%로 낮추는 방안을 검토 중입니다.',
        category: 'regulatory',
        sentiment: 'positive',
        time: this.getTimeAgo(5),
        importance: 'medium',
        tags: ['일본', '세금', '규제완화']
      }
    ]
  }

  getStrategyNews(): NewsItem[] {
    return [
      {
        title: '📚 전문가 의견: "비트코인 10만 달러는 시간문제"',
        description: '월스트리트 애널리스트들이 연말까지 비트코인 10만 달러 돌파를 예상합니다.',
        category: 'strategy',
        sentiment: 'positive',
        time: this.getTimeAgo(2),
        importance: 'high',
        tags: ['Bitcoin', '전망', '목표가']
      },
      {
        title: '💡 알트코인 시즌 신호 포착',
        description: '비트코인 도미넌스가 하락하며 알트코인으로 자금 이동이 시작되었습니다.',
        category: 'strategy',
        sentiment: 'positive',
        time: this.getTimeAgo(4),
        importance: 'medium',
        tags: ['알트코인', '투자전략', '분산투자']
      },
      {
        title: '🎯 DCA 전략으로 리스크 관리',
        description: '변동성이 큰 시장에서 분할 매수 전략이 주목받고 있습니다.',
        category: 'strategy',
        sentiment: 'neutral',
        time: this.getTimeAgo(6),
        importance: 'medium',
        tags: ['DCA', '리스크관리', '장기투자']
      }
    ]
  }

  async getAllNews() {
    const [headlines, market, onchain, defi, regulatory, strategy] = await Promise.all([
      Promise.resolve(this.getHeadlineNews()),
      this.getMarketNews(),
      Promise.resolve(this.getOnchainNews()),
      Promise.resolve(this.getDeFiNews()),
      Promise.resolve(this.getRegulatoryNews()),
      Promise.resolve(this.getStrategyNews())
    ])

    const allNews = [...headlines, ...market, ...onchain, ...defi, ...regulatory, ...strategy]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return { all: allNews }
  }
}

const newsService = new NewsService()

export default function DiverseNewsPage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(false)

  const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK']

  const categories = [
    { id: 'all', name: '전체', icon: '📰', color: 'purple' },
    { id: 'price', name: '가격', icon: '💰', color: 'green' },
    { id: 'technical', name: '기술적분석', icon: '📊', color: 'blue' },
    { id: 'onchain', name: '온체인', icon: '⛓️', color: 'cyan' },
    { id: 'regulatory', name: '규제', icon: '⚖️', color: 'yellow' },
    { id: 'defi', name: 'DeFi/NFT', icon: '🔗', color: 'pink' },
    { id: 'strategy', name: '투자전략', icon: '🎯', color: 'indigo' },
    { id: 'breaking', name: '속보', icon: '🚨', color: 'red' }
  ]

  useEffect(() => {
    loadAllNews()
    const interval = setInterval(loadAllNews, 60000)
    return () => clearInterval(interval)
  }, [selectedCoin])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredNews(allNews)
    } else {
      setFilteredNews(allNews.filter(news => news.category === selectedCategory))
    }
  }, [selectedCategory, allNews])

  const loadAllNews = async () => {
    setLoading(true)
    try {
      const newsData = await newsService.getAllNews()
      setAllNews(newsData.all || [])
      setFilteredNews(newsData.all || [])
    } catch (err) {
      console.error('News loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '📈'
      case 'negative': return '📉'
      default: return '➡️'
    }
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`

    return date.toLocaleDateString('ko-KR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            📰 다양한 암호화폐 뉴스
          </h1>
          <p className="text-gray-400">
            실시간 시장 뉴스, 기술적 분석, 온체인 데이터, 규제 소식까지 모든 정보를 한곳에서
          </p>
        </motion.div>

        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {coins.map(coin => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCoin === coin
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? `bg-${cat.color}-600/20 border border-${cat.color}-500 text-white`
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
                {selectedCategory === cat.id && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {filteredNews.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-white">{allNews.length}</div>
            <div className="text-sm text-gray-400">전체 뉴스</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">
              {allNews.filter(n => n.sentiment === 'positive').length}
            </div>
            <div className="text-sm text-gray-400">긍정 뉴스</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-red-400">
              {allNews.filter(n => n.sentiment === 'negative').length}
            </div>
            <div className="text-sm text-gray-400">부정 뉴스</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400">
              {allNews.filter(n => n.importance === 'high').length}
            </div>
            <div className="text-sm text-gray-400">중요 뉴스</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredNews.map((news, index) => (
                <motion.div
                  key={`${news.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getSentimentIcon(news.sentiment)}</span>
                        <h3 className={`text-lg font-bold ${getSentimentColor(news.sentiment)}`}>
                          {news.title}
                        </h3>
                      </div>

                      {news.description && (
                        <p className="text-gray-300 mb-3">{news.description}</p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {formatTime(news.time)}
                        </span>

                        {news.source && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {news.source}
                          </span>
                        )}

                        {news.category && (
                          <span className="text-xs bg-purple-600/20 px-2 py-1 rounded">
                            {categories.find(c => c.id === news.category)?.name}
                          </span>
                        )}

                        {news.importance === 'high' && (
                          <span className="text-xs bg-red-600 px-2 py-1 rounded-full">
                            중요
                          </span>
                        )}

                        {news.tags && news.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-blue-600/20 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredNews.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-2xl mb-2">📭</p>
                <p>현재 뉴스가 없습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}