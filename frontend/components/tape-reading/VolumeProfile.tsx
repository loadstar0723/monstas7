'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface VolumeProfileProps {
  symbol: string
}

interface PriceLevel {
  price: number
  volume: number
  buyVolume: number
  sellVolume: number
  isPOC: boolean
}

export default function VolumeProfile({ symbol }: VolumeProfileProps) {
  const [profileData, setProfileData] = useState<PriceLevel[]>([])
  const [poc, setPoc] = useState<number>(0)
  const [valueAreaHigh, setValueAreaHigh] = useState<number>(0)
  const [valueAreaLow, setValueAreaLow] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  
  // 코인별 초기 가격 설정
  const initialPrices: Record<string, number> = {
    'BTCUSDT': 98000,
    'ETHUSDT': 3500,
    'BNBUSDT': 700,
    'SOLUSDT': 200,
    'XRPUSDT': 2.5,
    'ADAUSDT': 1.0,
    'DOGEUSDT': 0.4,
    'AVAXUSDT': 50,
    'MATICUSDT': 1.5,
    'DOTUSDT': 10
  }

  useEffect(() => {
    // 즉시 초기값 설정
    const initPrice = initialPrices[symbol] || 100
    setPoc(initPrice)
    setValueAreaHigh(initPrice * 1.01)
    setValueAreaLow(initPrice * 0.99)
    setLoading(false) // 초기값 설정 후 로딩 해제
    
    // 실제 데이터 로드
    const timer = setTimeout(() => {
      generateVolumeProfile()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [symbol])

  const generateVolumeProfile = async () => {
    setLoading(true)
    try {
      // 실제 API에서 최근 거래 데이터 가져오기
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=5m&limit=100`)
      
      if (!response.ok) {
        console.error(`API 응답 에러: ${response.status}`)
        // 에러 발생 시 빈 데이터로 처리
        setProfileData([])
        setLoading(false)
        return
      }
      
      // response.text()로 먼저 받아서 확인
      const text = await response.text()
      let klines
      
      try {
        klines = JSON.parse(text)
      } catch (parseError) {
        console.error('JSON 파싱 에러:', parseError)
        console.error('응답 텍스트:', text)
        setProfileData([])
        setLoading(false)
        return
      }
      
      // API 응답이 객체 형태로 올 수 있음
      const klinesData = klines?.data || klines?.klines || klines
      
      if (Array.isArray(klinesData) && klinesData.length > 0) {
        const klines = klinesData
        // 가격대별 거래량 집계
        const priceVolumeMap = new Map<number, PriceLevel>()
        let totalVolume = 0
        let maxVolume = 0
        let pocPrice = 0
        
        klines.forEach((kline: number[]) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          const volume = parseFloat(kline[5])
          const avgPrice = (high + low) / 2
          
          // 코인별로 적절한 가격 단위 설정
          let priceUnit = 10 // 기본값
          if (avgPrice > 10000) priceUnit = 100 // BTC 같은 고가 코인
          else if (avgPrice > 1000) priceUnit = 10
          else if (avgPrice > 100) priceUnit = 1
          else if (avgPrice > 10) priceUnit = 0.5
          else if (avgPrice > 1) priceUnit = 0.1
          else priceUnit = 0.01 // 저가 코인
          
          const priceLevel = Math.floor(avgPrice / priceUnit) * priceUnit
          
          if (!priceVolumeMap.has(priceLevel)) {
            priceVolumeMap.set(priceLevel, {
              price: priceLevel,
              volume: 0,
              buyVolume: 0,
              sellVolume: 0,
              isPOC: false
            })
          }
          
          const level = priceVolumeMap.get(priceLevel)!
          level.volume += volume
          totalVolume += volume
          
          // 가격이 올랐으면 매수, 내렸으면 매도로 간주
          const close = parseFloat(kline[4])
          const open = parseFloat(kline[1])
          if (close > open) {
            level.buyVolume += volume
          } else {
            level.sellVolume += volume
          }
          
          if (level.volume > maxVolume) {
            maxVolume = level.volume
            pocPrice = priceLevel
          }
        })
        
        // POC 표시
        const profileArray = Array.from(priceVolumeMap.values())
          .sort((a, b) => a.price - b.price)
        
        profileArray.forEach(level => {
          level.isPOC = level.price === pocPrice
        })
        
        // Value Area 계산 (전체 거래량의 70%)
        const targetVolume = totalVolume * 0.7
        let accumulatedVolume = 0
        let vaLow = pocPrice
        let vaHigh = pocPrice
        
        // POC부터 시작해서 위아래로 확장
        const pocIndex = profileArray.findIndex(l => l.isPOC)
        let upperIndex = pocIndex + 1
        let lowerIndex = pocIndex - 1
        
        accumulatedVolume = profileArray[pocIndex].volume
        
        while (accumulatedVolume < targetVolume && (upperIndex < profileArray.length || lowerIndex >= 0)) {
          const upperVolume = upperIndex < profileArray.length ? profileArray[upperIndex].volume : 0
          const lowerVolume = lowerIndex >= 0 ? profileArray[lowerIndex].volume : 0
          
          if (upperVolume > lowerVolume) {
            if (upperIndex < profileArray.length) {
              accumulatedVolume += upperVolume
              vaHigh = profileArray[upperIndex].price
              upperIndex++
            }
          } else {
            if (lowerIndex >= 0) {
              accumulatedVolume += lowerVolume
              vaLow = profileArray[lowerIndex].price
              lowerIndex--
            }
          }
        }

        setProfileData(profileArray)
        setPoc(pocPrice)
        setValueAreaHigh(vaHigh)
        setValueAreaLow(vaLow)
      } else {
        // 데이터가 없을 때 초기값 유지
        const initPrice = initialPrices[symbol] || 100
        setPoc(initPrice)
        setValueAreaHigh(initPrice * 1.01)
        setValueAreaLow(initPrice * 0.99)
      }
    } catch (error) {
      console.error('거래량 프로파일 생성 실패:', error)
      // 에러 시 초기값 설정
      const initPrice = initialPrices[symbol] || 100
      setPoc(initPrice)
      setValueAreaHigh(initPrice * 1.01)
      setValueAreaLow(initPrice * 0.99)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">📊 거래량 프로파일</h3>
        
        {/* 주요 레벨 표시 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-purple-900/30 rounded-lg p-2">
            <p className="text-purple-400 text-xs mb-1">POC</p>
            <p className="text-white font-bold">${safeFixed(poc, 2)}</p>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-2">
            <p className="text-blue-400 text-xs mb-1">VA High</p>
            <p className="text-white font-bold">${safeFixed(valueAreaHigh, 2)}</p>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-2">
            <p className="text-blue-400 text-xs mb-1">VA Low</p>
            <p className="text-white font-bold">${safeFixed(valueAreaLow, 2)}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={profileData} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="volume" 
                type="number"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                dataKey="price" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `$${safeFixed(value, 0)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
                formatter={(value: number, name: string) => {
                  if (name === 'volume') {
                    return [`${(value / 1000).toFixed(2)}K`, '거래량']
                  }
                  return [value, name]
                }}
              />
              <Bar dataKey="volume" fill="#8884d8">
                {profileData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.isPOC ? '#FBBF24' : 
                      entry.price <= valueAreaHigh && entry.price >= valueAreaLow ? '#60A5FA' : 
                      '#6B7280'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {/* 범례 */}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-400">POC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-gray-400">Value Area (70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-gray-400">기타</span>
          </div>
        </div>
      </div>
    </div>
  )
}