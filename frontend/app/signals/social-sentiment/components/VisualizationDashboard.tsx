'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts'
import { FaChartBar, FaMapMarkerAlt, FaNetworkWired, FaGlobe } from 'react-icons/fa'
import useSocialData from '../hooks/useSocialData'

interface VisualizationDashboardProps {
  coin: string
}

// 상관계수 계산 함수
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0)
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0)
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  if (denominator === 0) return 0
  return numerator / denominator
}

export default function VisualizationDashboard({ coin }: VisualizationDashboardProps) {
  const { sentimentData } = useSocialData(coin)
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [correlationData, setCorrelationData] = useState<any[]>([])
  const [globalSentiment, setGlobalSentiment] = useState<any[]>([])

  useEffect(() => {
    const generateVisualizationData = async () => {
      try {
        // 가격 데이터 가져오기
        const klinesResponse = await fetch(`/api/binance/klines?symbol=${coin}USDT&interval=1h&limit=48`)
        let klines: any[] = []
        if (klinesResponse.ok) {
          klines = await klinesResponse.json()
        }

        // 히트맵 데이터 생성 (시간대별 감성)
        // TODO: 실제 시간대별 데이터를 API에서 가져와야 함
        const heatmap = Array.from({ length: 7 }, (_, day) => 
          Array.from({ length: 24 }, (_, hour) => {
            const baseValue = sentimentData.sentimentScore || 0
            return {
              day,
              hour,
              value: baseValue, // 실제 시간대별 데이터 필요
              mentions: Math.floor((sentimentData.totalMentions || 0) / 168) // 평균값
            }
          })
        ).flat()
        setHeatmapData(heatmap)

        // 가격-감성 상관관계 데이터
        const correlation = Array.isArray(klines) ? klines.slice(-24).map((kline: any[], index: number) => {
          const price = parseFloat(kline[4])
          const volume = parseFloat(kline[5])
          const time = new Date(kline[0]).toLocaleTimeString('ko-KR', { hour: '2-digit' })
          
          // 감성 점수는 가격 변화와 거래량을 기반으로 계산
          const priceChange = index > 0 ? (price - parseFloat(klines[index - 1][4])) / parseFloat(klines[index - 1][4]) * 100 : 0
          // TODO: 감성 점수 계산을 위한 실제 로직 필요
          const sentiment = sentimentData.sentimentScore || 0
          
          return {
            time,
            price: price,
            sentiment: Math.max(0, Math.min(100, sentiment)),
            volume: volume / 1000000,
            correlation: Math.abs(priceChange) > 2 ? 'HIGH' : 'LOW'
          }
        }) : []
        setCorrelationData(correlation)

        // 글로벌 센티먼트 비교 (주요 코인들)
        const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']
        const global = await Promise.all(
          coins.map(async (symbol) => {
            try {
              const tickerResponse = await fetch(`/api/binance/ticker?symbol=${symbol}USDT`)
              let priceChange = 0
              let volume = 0
              
              if (tickerResponse.ok) {
                const ticker = await tickerResponse.json()
                priceChange = parseFloat(ticker.priceChangePercent || '0')
                volume = parseFloat(ticker.quoteVolume || '0')
              }
              
              return {
                coin: symbol,
                sentiment: 50 + priceChange * 2,
                volume: volume / 1000000000,
                priceChange,
                mentions: Math.floor(volume / 100000)
              }
            } catch {
              return {
                coin: symbol,
                sentiment: 50,
                volume: 0,
                priceChange: 0,
                mentions: 0
              }
            }
          })
        )
        setGlobalSentiment(global)
      } catch (error) {
        console.error('시각화 데이터 생성 실패:', error)
      }
    }

    generateVisualizationData()
    const interval = setInterval(generateVisualizationData, 300000) // 5분마다 업데이트

    return () => clearInterval(interval)
  }, [coin, sentimentData])

  // 레이더 차트 데이터 (다차원 분석)
  const radarData = [
    {
      subject: '감성 점수',
      value: sentimentData.sentimentScore || 50,
      fullMark: 100
    },
    {
      subject: '멘션 수',
      value: Math.min(100, (sentimentData.totalMentions || 0) / 100),
      fullMark: 100
    },
    {
      subject: '긍정 비율',
      value: sentimentData.positive || 33,
      fullMark: 100
    },
    {
      subject: '트렌딩',
      value: sentimentData.trendingKeywords.length * 10,
      fullMark: 100
    },
    {
      subject: '인플루언서',
      value: sentimentData.influencers.filter(i => i.sentiment === 'BULLISH').length * 20,
      fullMark: 100
    },
    {
      subject: '변동성',
      value: Math.abs(sentimentData.sentimentChange || 0),
      fullMark: 100
    }
  ]

  // 시간대별 히트맵 시각화
  const renderHeatmap = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    return (
      <div className="w-full">
        <div className="flex gap-1">
          <div className="w-8"></div>
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-gray-400">
              {hour}
            </div>
          ))}
        </div>
        {days.map((day, dayIndex) => (
          <div key={day} className="flex gap-1 mt-1">
            <div className="w-8 text-xs text-gray-400 flex items-center">{day}</div>
            {hours.map(hour => {
              const data = heatmapData.find(d => d.day === dayIndex && d.hour === hour)
              const value = data?.value || 50
              const opacity = value / 100
              
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="flex-1 aspect-square rounded-sm relative group cursor-pointer"
                  style={{
                    backgroundColor: value > 60 ? `rgba(16, 185, 129, ${opacity})` :
                                   value < 40 ? `rgba(239, 68, 68, ${opacity})` :
                                   `rgba(251, 191, 36, ${opacity})`
                  }}
                >
                  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 -top-16 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                    <p>감성: {value}%</p>
                    <p>멘션: {data?.mentions || 0}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 감성 히트맵 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-purple-400" />
          시간대별 감성 히트맵
        </h3>
        <div className="overflow-x-auto">
          {renderHeatmap()}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">긍정 (60%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-400">중립 (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">부정 (40%-)</span>
          </div>
        </div>
      </div>

      {/* 다차원 분석 레이더 차트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaNetworkWired className="text-blue-400" />
          종합 지표 분석
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
            <Radar 
              name={coin} 
              dataKey="value" 
              stroke="#A855F7" 
              fill="#A855F7" 
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 가격-감성 상관관계 차트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaChartBar className="text-green-400" />
          가격-감성-거래량 복합 분석
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={correlationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#A855F7" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar yAxisId="right" dataKey="volume" fill="#6366F1" opacity={0.3} name="거래량(M)" />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2}
              name="가격"
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#A855F7" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="감성 점수"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">가격-감성 상관계수</p>
            <p className="text-2xl font-bold text-purple-400">
              {correlationData.length > 0 ? calculateCorrelation(
                correlationData.map(d => d.price),
                correlationData.map(d => d.sentiment)
              ).toFixed(2) : '계산중'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">거래량-감성 상관계수</p>
            <p className="text-2xl font-bold text-blue-400">
              {correlationData.length > 0 ? calculateCorrelation(
                correlationData.map(d => d.volume),
                correlationData.map(d => d.sentiment)
              ).toFixed(2) : '계산중'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">예측 신뢰도</p>
            <p className="text-2xl font-bold text-green-400">
              {correlationData.length > 0 ? 
                Math.max(0, Math.min(100, 
                  50 + Math.abs(calculateCorrelation(
                    correlationData.map(d => d.price),
                    correlationData.map(d => d.sentiment)
                  )) * 50
                )).toFixed(0) : '계산중'}%
            </p>
          </div>
        </div>
      </div>

      {/* 글로벌 센티먼트 비교 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaGlobe className="text-orange-400" />
          주요 코인 감성 비교
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={globalSentiment} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" domain={[0, 100]} />
            <YAxis type="category" dataKey="coin" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any, name: string) => {
                if (name === 'sentiment') return [`${safeFixed(value, 0)}%`, '감성']
                if (name === 'priceChange') return [`${safeFixed(value, 2)}%`, '가격 변화']
                return [value, name]
              }}
            />
            <Bar dataKey="sentiment" fill="#A855F7" name="감성">
              {globalSentiment.map((entry, index) => (
                <Bar key={`cell-${index}`} fill={
                  entry.sentiment > 60 ? '#10B981' :
                  entry.sentiment < 40 ? '#EF4444' :
                  '#F59E0B'
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">시장 전체 감성 지표</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">평균 감성</span>
                <span className="text-white font-medium">
                  {(globalSentiment.reduce((acc, cur) => acc + cur.sentiment, 0) / globalSentiment.length).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${globalSentiment.reduce((acc, cur) => acc + cur.sentiment, 0) / globalSentiment.length}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 멘션 볼륨 차트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">멘션 볼륨 트렌드</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={sentimentData.sentimentHistory || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#8B5CF6" 
              fill="url(#colorGradient)" 
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}