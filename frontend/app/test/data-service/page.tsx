'use client'

import { useOptimizedMarketData, useMarketNews, useFearGreedIndex, useDataServiceStats } from '@/lib/hooks/useOptimizedMarketData'
import { useState } from 'react'

export default function DataServiceTest() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const { data: marketData, loading: priceLoading } = useOptimizedMarketData(symbol)
  const { news, loading: newsLoading } = useMarketNews(['BTC', 'Analysis'])
  const { index: fearGreed, loading: fearLoading } = useFearGreedIndex()
  const stats = useDataServiceStats()
  
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 데이터 서비스 테스트</h1>
      
      {/* 심볼 선택 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">코인 선택</h2>
        <div className="flex gap-2">
          {symbols.map(s => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`px-4 py-2 rounded ${
                symbol === s ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              {s.replace('USDT', '')}
            </button>
          ))}
        </div>
      </div>
      
      {/* 실시간 가격 (Binance WebSocket) */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          📊 실시간 가격 (Binance WebSocket)
        </h2>
        {priceLoading ? (
          <div>로딩중...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-gray-400 text-sm">현재가</div>
              <div className="text-2xl font-bold text-green-400">
                ${marketData.price.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24시간 변동</div>
              <div className={`text-xl ${marketData.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketData.change24h > 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24시간 거래량</div>
              <div className="text-lg">
                {(marketData.volume24h / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24시간 고가</div>
              <div className="text-lg text-green-300">
                ${marketData.high24h.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24시간 저가</div>
              <div className="text-lg text-red-300">
                ${marketData.low24h.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">업데이트</div>
              <div className="text-sm">
                {new Date(marketData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 공포 탐욕 지수 (Alternative.me) */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          😱 공포 & 탐욕 지수 (Alternative.me)
        </h2>
        {fearLoading ? (
          <div>로딩중...</div>
        ) : fearGreed ? (
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-yellow-400">
              {fearGreed.value}
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {fearGreed.value_classification}
              </div>
              <div className="text-gray-400">
                업데이트: {new Date(fearGreed.timestamp * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div>데이터 없음</div>
        )}
      </div>
      
      {/* 뉴스 (CryptoCompare) */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          📰 최신 뉴스 (CryptoCompare)
        </h2>
        {newsLoading ? (
          <div>로딩중...</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {news.slice(0, 5).map((article, i) => (
              <div key={i} className="border-b border-gray-700 pb-3">
                <h3 className="font-semibold text-purple-400">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {article.body?.substring(0, 150)}...
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  {article.source} • {new Date(article.published_on * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* API 사용량 통계 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          📊 API 사용량 통계
        </h2>
        {stats ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">CryptoCompare</h3>
              <div className="bg-gray-700 rounded p-3">
                <div className="flex justify-between">
                  <span>사용량</span>
                  <span>{stats.cryptoCompare.used} / {stats.cryptoCompare.limit}</span>
                </div>
                <div className="flex justify-between">
                  <span>남은 호출</span>
                  <span className="text-green-400">{stats.cryptoCompare.remaining}</span>
                </div>
                <div className="flex justify-between">
                  <span>사용률</span>
                  <span>{stats.cryptoCompare.percentage.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">캐시 통계</h3>
              <div className="bg-gray-700 rounded p-3 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">가격 캐시:</span>
                  <span className="ml-2">히트 {stats.cache.price.hits} / 미스 {stats.cache.price.misses}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">뉴스 캐시:</span>
                  <span className="ml-2">히트 {stats.cache.news.hits} / 미스 {stats.cache.news.misses}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">소셜 캐시:</span>
                  <span className="ml-2">히트 {stats.cache.social.hits} / 미스 {stats.cache.social.misses}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>통계 로딩중...</div>
        )}
      </div>
    </div>
  )
}