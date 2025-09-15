'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
  body?: string
  categories?: string
  published_on: number
  imageurl?: string
  source?: string
  url?: string
  source_info?: {
    name: string
  }
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 60000) // 1분마다 갱신
    return () => clearInterval(interval)
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news/cryptocompare')
      if (response.ok) {
        const data = await response.json()
        if (data.Data && data.Data.length > 0) {
          // 실제 API 데이터만 사용
          const formattedNews = data.Data.slice(0, 6).map((item: any) => ({
            id: item.id,
            title: item.title,
            body: item.body,
            categories: item.categories,
            published_on: item.published_on,
            imageurl: item.imageurl,
            source: item.source,
            url: item.url,
            source_info: item.source_info
          }))
          setNews(formattedNews)
          setLoading(false)
          return
        }
      }

      // API가 안 되면 다른 뉴스 소스 시도
      const altResponse = await fetch('https://api.coingecko.com/api/v3/news')
      if (altResponse.ok) {
        const altData = await altResponse.json()
        if (altData.data && altData.data.length > 0) {
          const formattedNews = altData.data.slice(0, 6).map((item: any) => ({
            id: item.id || Math.random().toString(),
            title: item.title,
            body: item.description,
            categories: 'Crypto|News',
            published_on: new Date(item.updated_at).getTime() / 1000,
            imageurl: item.thumb_2x || item.thumb,
            source: item.news_site,
            url: item.url,
            source_info: { name: item.news_site }
          }))
          setNews(formattedNews)
        }
      }
    } catch (error) {
      console.error('뉴스 가져오기 실패:', error)
    }
    setLoading(false)
  }

  const getSampleNews = () => {
    const now = Math.floor(Date.now() / 1000)
    return [
      {
        id: '1',
        title: 'Bitcoin Surges Past $100,000 Mark in Historic Rally',
        body: 'Bitcoin reaches new all-time high as institutional adoption accelerates...',
        published_on: now - 300,
        imageurl: 'https://picsum.photos/400/300?random=1',
        source: 'CryptoCompare',
        categories: 'BTC|Market',
        source_info: { name: 'CryptoCompare' }
      },
      {
        id: '2',
        title: 'Ethereum 2.0 Staking Hits Record High',
        body: 'More than 30% of all ETH is now staked on the Beacon Chain...',
        published_on: now - 600,
        imageurl: 'https://picsum.photos/400/300?random=2',
        source: 'CryptoCompare',
        categories: 'ETH|Technology',
        source_info: { name: 'CryptoCompare' }
      },
      {
        id: '3',
        title: 'SEC Approves Multiple Bitcoin ETF Applications',
        body: 'The Securities and Exchange Commission has approved several Bitcoin ETF applications...',
        published_on: now - 900,
        imageurl: 'https://picsum.photos/400/300?random=3',
        source: 'CryptoCompare',
        categories: 'Regulation|ETF',
        source_info: { name: 'CryptoCompare' }
      },
      {
        id: '4',
        title: 'DeFi Total Value Locked Reaches $200 Billion',
        body: 'The decentralized finance sector continues its explosive growth...',
        published_on: now - 1200,
        imageurl: 'https://picsum.photos/400/300?random=4',
        source: 'CryptoCompare',
        categories: 'DeFi|Market',
        source_info: { name: 'CryptoCompare' }
      },
      {
        id: '5',
        title: 'Major Bank Announces Crypto Custody Service',
        body: 'One of the world\'s largest banks is launching cryptocurrency custody...',
        published_on: now - 1500,
        imageurl: 'https://picsum.photos/400/300?random=5',
        source: 'CryptoCompare',
        categories: 'Banking|Adoption',
        source_info: { name: 'CryptoCompare' }
      },
      {
        id: '6',
        title: 'NFT Market Shows Signs of Recovery',
        body: 'After months of decline, the NFT market is showing positive signals...',
        published_on: now - 1800,
        imageurl: 'https://picsum.photos/400/300?random=6',
        source: 'CryptoCompare',
        categories: 'NFT|Market',
        source_info: { name: 'CryptoCompare' }
      }
    ]
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now() / 1000
    const diff = now - timestamp

    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    return `${Math.floor(diff / 86400)}일 전`
  }

  const getCategoryColor = (category: string) => {
    const firstCat = category?.split('|')[0]?.toLowerCase()
    switch (firstCat) {
      case 'btc':
      case 'bitcoin':
        return 'bg-orange-600'
      case 'eth':
      case 'ethereum':
        return 'bg-blue-600'
      case 'defi':
        return 'bg-purple-600'
      case 'regulation':
        return 'bg-red-600'
      case 'market':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all"
        >
          {item.imageurl && (
            <div className="h-48 bg-gray-900 relative overflow-hidden">
              <img
                src={item.imageurl}
                alt={item.title}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  console.clear() // 404 에러 콘솔 정리
                }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {item.categories && (
                <span className={`text-xs text-white px-2 py-1 rounded ${getCategoryColor(item.categories)}`}>
                  {item.categories.split('|')[0]}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatTime(item.published_on)}
              </span>
            </div>

            <h3 className="text-white font-semibold mb-2 line-clamp-2">
              {item.title}
            </h3>

            {item.body && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {item.body}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {item.source_info?.name || item.source || 'CryptoCompare'}
              </span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                >
                  자세히 →
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}