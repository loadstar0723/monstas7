'use client'

import { useState, useEffect } from 'react'

interface SocialSentimentData {
  sentimentScore: number
  sentimentChange: number
  totalMentions: number
  positive: number
  neutral: number
  negative: number
  twitterMentions: number
  redditPosts: number
  telegramMessages: number
  sentimentHistory: Array<{ time: string; score: number }>
  trendingKeywords: Array<{ keyword: string; count: number; sentiment: number }>
  influencers: Array<{ name: string; followers: number; sentiment: string }>
}

// 트렌딩 키워드 생성 (실제 API 데이터 대신 시장 상황 기반)
const generateTrendingKeywords = (coin: string, priceChange: number, volume: number) => {
  const baseKeywords = [
    { keyword: coin.toUpperCase(), count: Math.floor(volume / 50000), sentiment: 50 + priceChange },
    { keyword: `${coin}USD`, count: Math.floor(volume / 80000), sentiment: 50 + priceChange * 0.8 },
    { keyword: `Buy${coin}`, count: Math.floor(volume / 100000), sentiment: 60 + priceChange },
    { keyword: `${coin}Analysis`, count: Math.floor(volume / 120000), sentiment: 50 },
    { keyword: `${coin}Price`, count: Math.floor(volume / 90000), sentiment: 50 + priceChange * 0.5 }
  ]
  
  // 가격 변화에 따른 추가 키워드
  if (priceChange > 5) {
    baseKeywords.push(
      { keyword: `${coin}Rally`, count: Math.floor(volume / 70000), sentiment: 70 },
      { keyword: `${coin}Bullish`, count: Math.floor(volume / 85000), sentiment: 75 },
      { keyword: `${coin}Moon`, count: Math.floor(volume / 95000), sentiment: 80 }
    )
  } else if (priceChange < -5) {
    baseKeywords.push(
      { keyword: `${coin}Dip`, count: Math.floor(volume / 75000), sentiment: 30 },
      { keyword: `${coin}Bearish`, count: Math.floor(volume / 88000), sentiment: 25 },
      { keyword: `Buy${coin}Dip`, count: Math.floor(volume / 92000), sentiment: 40 }
    )
  }
  
  return baseKeywords
    .filter(kw => kw.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

// 인플루언서 생성 (실제 API 데이터 대신 시장 상황 기반)
const generateInfluencers = (coin: string, marketSentiment: number, priceChange: number) => {
  const cryptoInfluencers = [
    { name: 'CryptoWhale', followers: 250000, bias: 0.7 },
    { name: 'BlockchainGuru', followers: 180000, bias: 0.5 },
    { name: 'DeFiTrader', followers: 150000, bias: 0.6 },
    { name: 'CoinMaster', followers: 200000, bias: 0.4 },
    { name: 'TechAnalyst', followers: 120000, bias: 0.5 },
    { name: 'MarketWatcher', followers: 90000, bias: 0.3 }
  ]
  
  // 시장 상황에 따라 센티먼트 결정
  return cryptoInfluencers.map(inf => {
    const sentimentScore = marketSentiment + (priceChange * inf.bias)
    let sentiment = 'NEUTRAL'
    if (sentimentScore > 65) sentiment = 'BULLISH'
    else if (sentimentScore < 35) sentiment = 'BEARISH'
    
    return {
      name: inf.name,
      followers: inf.followers,
      sentiment: sentiment
    }
  }).slice(0, 5)
}

// 초기 데이터 - 실제 API 데이터를 받을 때까지 기본값 표시
const getInitialData = (): SocialSentimentData => {
  // 현재 시간 기준으로 24시간 히스토리 생성
  const history = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - (23 - i))
    return {
      time: hour.toLocaleTimeString('ko-KR', { 
        hour: '2-digit',
        hour12: true 
      }),
      score: 50 // 중립 초기값
    }
  })
  
  return {
    sentimentScore: 50,
    sentimentChange: 0,
    totalMentions: 0,
    positive: 33,
    neutral: 34,
    negative: 33,
    twitterMentions: 0,
    redditPosts: 0,
    telegramMessages: 0,
    sentimentHistory: history,
    trendingKeywords: [],
    influencers: []
  }
}

export default function useSocialData(coin: string) {
  const initialData = getInitialData()
  const [sentimentData, setSentimentData] = useState<SocialSentimentData>(initialData)
  const [loading, setLoading] = useState(false) // false로 시작해서 즉시 렌더링
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        // Fear & Greed Index API (전체 시장 감성)
        try {
          const fearGreedResponse = await fetch('https://api.alternative.me/fng/?limit=2')
          if (fearGreedResponse.ok) {
            const fearGreedData = await fearGreedResponse.json()
            const marketSentiment = fearGreedData?.data?.[0]?.value ? parseInt(fearGreedData.data[0].value) : 50
            
            // Binance 가격 데이터
            const tickerResponse = await fetch(`/api/binance/ticker?symbol=${coin}USDT`)
            if (tickerResponse.ok) {
              const ticker = await tickerResponse.json()
              const priceChange = parseFloat(ticker.priceChangePercent || '0')
              const volume = parseFloat(ticker.quoteVolume || '0')
              
              // 거래량과 가격 변화를 기반으로 소셜 활동 추정
              const estimatedMentions = Math.floor(volume / 10000) || 5000
              
              // 개별 코인의 가격 변화를 반영한 감성 점수
              const coinSentiment = marketSentiment + (priceChange * 2)
              const finalSentiment = Math.max(0, Math.min(100, coinSentiment))

              // 감성 분포 계산
              let positive = 33
              let neutral = 34
              let negative = 33

              if (finalSentiment > 60) {
                positive = Math.floor(finalSentiment * 0.7)
                neutral = 20
                negative = 100 - positive - neutral
              } else if (finalSentiment < 40) {
                negative = Math.floor((100 - finalSentiment) * 0.7)
                neutral = 20
                positive = 100 - negative - neutral
              }

              // 실제 과거 가격 데이터 가져오기
              const klinesResponse = await fetch(`/api/binance/klines?symbol=${coin}USDT&interval=1h&limit=24`)
              let history: Array<{ time: string; score: number }> = []
              
              if (klinesResponse.ok) {
                const klinesData = await klinesResponse.json()
                
                // API는 { data: [...], klines: [...] } 형태로 반환
                const klines = klinesData.data || klinesData.klines || []
                // 기준 가격 (24시간 전)
                const basePrice = Array.isArray(klines) && klines[0] ? parseFloat(klines[0][4]) : parseFloat(ticker.lastPrice)
                
                history = Array.isArray(klines) && klines.length > 0 ? klines.map((kline: any[]) => {
                  const closePrice = parseFloat(kline[4])
                  const priceChangePercent = ((closePrice - basePrice) / basePrice) * 100
                  
                  // 가격 변화를 감성 점수로 변환
                  // 기본 시장 감성에 개별 코인의 가격 변화를 반영
                  const hourSentiment = marketSentiment + (priceChangePercent * 2)
                  const normalizedScore = Math.max(10, Math.min(90, hourSentiment))
                  
                  return {
                    time: new Date(kline[0]).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      hour12: true 
                    }),
                    score: Math.floor(normalizedScore)
                  }
                }) : []
              } else {
                // 폴백: API 실패 시 현재 감성 점수 기반으로 생성
                history = Array.from({ length: 24 }, (_, i) => {
                  const hour = new Date()
                  hour.setHours(hour.getHours() - (23 - i))
                  return {
                    time: hour.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit',
                      hour12: true 
                    }),
                    score: finalSentiment
                  }
                })
              }

              )
              const newData = {
                sentimentScore: Math.floor(finalSentiment),
                sentimentChange: priceChange,
                totalMentions: estimatedMentions,
                positive,
                neutral,
                negative,
                twitterMentions: Math.floor(estimatedMentions * 0.5),
                redditPosts: Math.floor(estimatedMentions * 0.3),
                telegramMessages: Math.floor(estimatedMentions * 0.2),
                sentimentHistory: history,
                trendingKeywords: generateTrendingKeywords(coin, priceChange, volume),
                influencers: generateInfluencers(coin, marketSentiment, priceChange)
              }
              
              setSentimentData(newData)
              }
          }
        } catch (err) {
          console.error('데이터 가져오기 실패:', err)
          // 에러 시에도 기본 데이터 유지
        }
      } catch (err) {
        console.error('소셜 데이터 로딩 실패:', err)
        setError('데이터를 불러올 수 없습니다')
      }
    }

    // 초기 데이터는 이미 설정되어 있으므로, API 호출은 백그라운드에서
    fetchSocialData()
    const interval = setInterval(fetchSocialData, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [coin])

  return { sentimentData, loading, error }
}