'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaClock, FaGlobeAsia, FaGlobeEurope, FaGlobeAmericas,
  FaChartArea, FaInfoCircle, FaExchangeAlt, FaTachometerAlt
} from 'react-icons/fa'
import { formatPrice, formatVolume, formatPercentage } from '@/lib/formatters'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, BarChart, Bar } from 'recharts'

interface SessionData {
  id: string
  name: string
  icon: any
  startHour: number
  endHour: number
  volumeData: any[]
  totalVolume: number
  avgVolume: number
  dominantPrice: number
  priceRange: { high: number; low: number }
  volatility: number
  characteristics: string[]
}

interface SessionProfilesProps {
  priceHistory: any[]
  currentPrice: number
  volumeProfileData: any
}

export default function SessionProfiles({ priceHistory, currentPrice, volumeProfileData }: SessionProfilesProps) {
  const [selectedSession, setSelectedSession] = useState<string>('asia')
  const [compareMode, setCompareMode] = useState(false)
  
  // 세션별 데이터 분석
  const sessionAnalysis = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) {
      return {
        asia: null,
        europe: null,
        americas: null
      }
    }
    
    // 현재 UTC 시간
    const now = new Date()
    const currentHour = now.getUTCHours()
    
    // 세션 정의 (UTC 기준)
    const sessions = {
      asia: { 
        name: '아시아 세션',
        icon: FaGlobeAsia,
        start: 23, // 23:00 UTC (08:00 KST)
        end: 7,    // 07:00 UTC (16:00 KST)
        color: '#f59e0b'
      },
      europe: { 
        name: '유럽 세션',
        icon: FaGlobeEurope,
        start: 7,  // 07:00 UTC (08:00 CET)
        end: 15,   // 15:00 UTC (16:00 CET)
        color: '#3b82f6'
      },
      americas: { 
        name: '미주 세션',
        icon: FaGlobeAmericas,
        start: 13, // 13:00 UTC (09:00 EST)
        end: 21,   // 21:00 UTC (17:00 EST)
        color: '#ef4444'
      }
    }
    
    // 세션별 데이터 필터링 및 분석
    const analyzeSession = (sessionKey: string) => {
      const session = sessions[sessionKey as keyof typeof sessions]
      
      // 세션 시간대에 해당하는 데이터 필터링
      const sessionData = priceHistory.filter(candle => {
        const hour = new Date(candle.time).getUTCHours()
        if (session.start > session.end) {
          // 자정을 넘는 경우 (아시아)
          return hour >= session.start || hour <= session.end
        }
        return hour >= session.start && hour <= session.end
      })
      
      if (sessionData.length === 0) return null
      
      // 볼륨 프로파일 계산
      const priceVolumes: { [price: string]: number } = {}
      let totalVolume = 0
      let highestPrice = 0
      let lowestPrice = Infinity
      
      sessionData.forEach(candle => {
        const priceKey = Math.round(candle.close / 10) * 10 // 10단위로 그룹핑
        priceVolumes[priceKey] = (priceVolumes[priceKey] || 0) + candle.volume
        totalVolume += candle.volume
        highestPrice = Math.max(highestPrice, candle.high)
        lowestPrice = Math.min(lowestPrice, candle.low)
      })
      
      // 볼륨 데이터 정렬
      const volumeData = Object.entries(priceVolumes)
        .map(([price, volume]) => ({
          price: Number(price),
          volume: volume,
          percentage: (volume / totalVolume) * 100
        }))
        .sort((a, b) => b.volume - a.volume)
      
      // 지배적 가격대 (최대 볼륨)
      const dominantPrice = volumeData[0]?.price || currentPrice
      
      // 변동성 계산
      const returns = sessionData.slice(1).map((candle, i) => 
        (candle.close - sessionData[i].close) / sessionData[i].close
      )
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
      const volatility = Math.sqrt(variance) * 100
      
      // 세션 특성 분석
      const characteristics = []
      if (volatility > 2) characteristics.push('높은 변동성')
      else if (volatility < 1) characteristics.push('낮은 변동성')
      
      const priceRange = ((highestPrice - lowestPrice) / lowestPrice) * 100
      if (priceRange > 5) characteristics.push('넓은 가격 범위')
      else characteristics.push('좁은 가격 범위')
      
      if (totalVolume > priceHistory.reduce((sum, c) => sum + c.volume, 0) / 3) {
        characteristics.push('높은 거래량')
      }
      
      return {
        id: sessionKey,
        name: session.name,
        icon: session.icon,
        color: session.color,
        startHour: session.start,
        endHour: session.end,
        volumeData: volumeData.slice(0, 20), // 상위 20개
        totalVolume,
        avgVolume: totalVolume / sessionData.length,
        dominantPrice,
        priceRange: { high: highestPrice, low: lowestPrice },
        volatility,
        characteristics,
        isActive: isSessionActive(session.start, session.end, currentHour)
      }
    }
    
    // 현재 활성 세션 확인
    const isSessionActive = (start: number, end: number, current: number) => {
      if (start > end) {
        return current >= start || current <= end
      }
      return current >= start && current <= end
    }
    
    return {
      asia: analyzeSession('asia'),
      europe: analyzeSession('europe'),
      americas: analyzeSession('americas')
    }
  }, [priceHistory, currentPrice])
  
  // 세션 비교 데이터
  const comparisonData = useMemo(() => {
    const sessions = [sessionAnalysis.asia, sessionAnalysis.europe, sessionAnalysis.americas]
      .filter(Boolean) as SessionData[]
    
    if (sessions.length === 0) return []
    
    return [
      {
        metric: '평균 거래량',
        asia: sessionAnalysis.asia?.avgVolume || 0,
        europe: sessionAnalysis.europe?.avgVolume || 0,
        americas: sessionAnalysis.americas?.avgVolume || 0
      },
      {
        metric: '변동성',
        asia: sessionAnalysis.asia?.volatility || 0,
        europe: sessionAnalysis.europe?.volatility || 0,
        americas: sessionAnalysis.americas?.volatility || 0
      },
      {
        metric: '가격 범위',
        asia: sessionAnalysis.asia ? 
          ((sessionAnalysis.asia.priceRange.high - sessionAnalysis.asia.priceRange.low) / sessionAnalysis.asia.priceRange.low * 100) : 0,
        europe: sessionAnalysis.europe ? 
          ((sessionAnalysis.europe.priceRange.high - sessionAnalysis.europe.priceRange.low) / sessionAnalysis.europe.priceRange.low * 100) : 0,
        americas: sessionAnalysis.americas ? 
          ((sessionAnalysis.americas.priceRange.high - sessionAnalysis.americas.priceRange.low) / sessionAnalysis.americas.priceRange.low * 100) : 0
      }
    ]
  }, [sessionAnalysis])
  
  const selectedSessionData = sessionAnalysis[selectedSession as keyof typeof sessionAnalysis]
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaClock className="text-purple-400" />
        세션별 볼륨 프로파일 분석
      </h3>
      
      {/* 세션 선택 및 비교 모드 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(['asia', 'europe', 'americas'] as const).map(sessionKey => {
            const session = sessionAnalysis[sessionKey]
            if (!session) return null
            
            return (
              <button
                key={sessionKey}
                onClick={() => setSelectedSession(sessionKey)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedSession === sessionKey
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-600'
                } border`}
              >
                <session.icon className={`text-lg ${session.isActive ? 'text-green-400' : ''}`} />
                <span className="font-medium">{session.name}</span>
                {session.isActive && (
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
        
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            compareMode
              ? 'bg-blue-500/20 border-blue-500 text-blue-400'
              : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-600'
          } border`}
        >
          <FaExchangeAlt />
          <span>비교 모드</span>
        </button>
      </div>
      
      {compareMode ? (
        /* 세션 비교 뷰 */
        <div className="space-y-6">
          {/* 비교 차트 */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">세션별 지표 비교</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => {
                      if (typeof value === 'number') {
                        return value > 1000 ? formatVolume(value) : formatPercentage(value) + '%'
                      }
                      return value
                    }}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="asia" fill="#f59e0b" />
                  <Bar dataKey="europe" fill="#3b82f6" />
                  <Bar dataKey="americas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 세션별 특징 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['asia', 'europe', 'americas'] as const).map(sessionKey => {
              const session = sessionAnalysis[sessionKey]
              if (!session) return null
              
              return (
                <div key={sessionKey} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <session.icon className="text-lg" style={{ color: session.color }} />
                      {session.name}
                    </h4>
                    {session.isActive && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        활성
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">시간대</span>
                      <span className="text-white">
                        {session.startHour}:00 - {session.endHour}:00 UTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">주요 가격대</span>
                      <span className="text-white">${formatPrice(session.dominantPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">변동성</span>
                      <span className={`font-medium ${
                        session.volatility > 2 ? 'text-red-400' : 
                        session.volatility < 1 ? 'text-green-400' : 
                        'text-yellow-400'
                      }`}>
                        {formatPercentage(session.volatility)}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex flex-wrap gap-1">
                        {session.characteristics.map((char, i) => (
                          <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* 개별 세션 상세 뷰 */
        selectedSessionData && (
          <div className="space-y-6">
            {/* 세션 정보 헤더 */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <selectedSessionData.icon className="text-xl" style={{ color: selectedSessionData.color }} />
                    {selectedSessionData.name}
                    {selectedSessionData.isActive && (
                      <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        현재 활성
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-300 text-sm mt-1">
                    {selectedSessionData.startHour}:00 - {selectedSessionData.endHour}:00 UTC
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-400">평균 거래량</p>
                  <p className="text-2xl font-bold text-white">
                    {formatVolume(selectedSessionData.avgVolume)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 세션 볼륨 프로파일 차트 */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">세션 볼륨 분포</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={selectedSessionData.volumeData} 
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="price" 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      tickFormatter={(value) => '$' + formatPrice(value)}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      tickFormatter={(value) => formatVolume(value)}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatVolume(value), 'Volume']}
                      labelFormatter={(label) => `$${formatPrice(label)}`}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="volume">
                      {selectedSessionData.volumeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            Math.abs(entry.price - currentPrice) < 50 
                              ? '#a855f7' 
                              : selectedSessionData.color
                          }
                        />
                      ))}
                    </Bar>
                    
                    {/* 현재 가격선 */}
                    <ReferenceLine 
                      x={currentPrice} 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 세션 특성 분석 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 가격 범위 분석 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <FaChartArea className="text-purple-400" />
                  가격 범위 분석
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">최고가</span>
                    <span className="text-white font-medium">
                      ${formatPrice(selectedSessionData.priceRange.high)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">최저가</span>
                    <span className="text-white font-medium">
                      ${formatPrice(selectedSessionData.priceRange.low)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">변동 폭</span>
                    <span className="text-purple-400 font-medium">
                      {formatPercentage(
                        ((selectedSessionData.priceRange.high - selectedSessionData.priceRange.low) / 
                         selectedSessionData.priceRange.low) * 100
                      )}%
                    </span>
                  </div>
                  
                  {/* 현재 가격 위치 */}
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">현재 가격 위치</p>
                    <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 h-full bg-gradient-to-r from-green-500 to-red-500"
                        style={{
                          left: '0',
                          width: '100%'
                        }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded"
                        style={{
                          left: `${
                            ((currentPrice - selectedSessionData.priceRange.low) /
                             (selectedSessionData.priceRange.high - selectedSessionData.priceRange.low)) * 100
                          }%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>최저</span>
                      <span>최고</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 세션 트레이딩 가이드 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-purple-400" />
                  세션 트레이딩 가이드
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded p-3">
                    <p className="text-sm text-gray-300">
                      {selectedSession === 'asia' && 
                        '아시아 세션은 일반적으로 변동성이 낮고 Range 트레이딩에 적합합니다. 도쿄와 싱가포르 시장이 주도합니다.'}
                      {selectedSession === 'europe' && 
                        '유럽 세션은 런던 시장 오픈과 함께 변동성이 증가합니다. 주요 경제 지표 발표가 많습니다.'}
                      {selectedSession === 'americas' && 
                        '미주 세션은 가장 높은 거래량과 변동성을 보입니다. 뉴욕 시장이 주도하며 주요 뉴스가 집중됩니다.'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-purple-300">추천 전략</h5>
                    {selectedSession === 'asia' && (
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Range 내 평균 회귀 전략</li>
                        <li>• Support/Resistance 레벨 활용</li>
                        <li>• 낮은 레버리지 권장</li>
                      </ul>
                    )}
                    {selectedSession === 'europe' && (
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• 돌파 전략 (런던 오픈)</li>
                        <li>• 뉴스 트레이딩 주의</li>
                        <li>• 중간 레버리지 가능</li>
                      </ul>
                    )}
                    {selectedSession === 'americas' && (
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• 트렌드 추종 전략</li>
                        <li>• 높은 유동성 활용</li>
                        <li>• 리스크 관리 중요</li>
                      </ul>
                    )}
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3">
                    <p className="text-xs text-yellow-400">
                      💡 팁: 세션 전환 시간대(오버랩)에는 변동성이 급증할 수 있으니 주의하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}