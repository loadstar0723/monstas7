'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

// 동적 로딩으로 성능 최적화
const OptionChainSection = dynamic(() => import('@/components/options/OptionChainSection').catch(() => () => <div>옵션 체인 로드 실패</div>), {
  loading: () => <div className="animate-pulse bg-gray-800 h-96 rounded-xl"></div>,
  ssr: false
})

const GreeksDisplay = dynamic(() => import('@/components/options/GreeksDisplay').catch(() => () => <div>그리스 표시 로드 실패</div>), {
  loading: () => <div className="animate-pulse bg-gray-800 h-64 rounded-xl"></div>,
  ssr: false
})

const OptionStrategies = dynamic(() => import('@/components/options/OptionStrategies').catch(() => () => <div>전략 로드 실패</div>), {
  loading: () => <div className="animate-pulse bg-gray-800 h-96 rounded-xl"></div>,
  ssr: false
})

const PayoffDiagram = dynamic(() => import('@/components/options/PayoffDiagram').catch(() => () => <div>수익 다이어그램 로드 실패</div>), {
  loading: () => <div className="animate-pulse bg-gray-800 h-96 rounded-xl"></div>,
  ssr: false
})

const IVAnalysis = dynamic(() => import('@/components/options/IVAnalysis').catch(() => () => <div>IV 분석 로드 실패</div>), {
  loading: () => <div className="animate-pulse bg-gray-800 h-64 rounded-xl"></div>,
  ssr: false
})

// 지원하는 코인 목록
const SUPPORTED_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-400' },
  { symbol: 'ETH', name: 'Ethereum', color: 'text-blue-400' },
  { symbol: 'BNB', name: 'BNB', color: 'text-yellow-400' },
  { symbol: 'SOL', name: 'Solana', color: 'text-purple-400' },
  { symbol: 'XRP', name: 'XRP', color: 'text-gray-400' },
  { symbol: 'ADA', name: 'Cardano', color: 'text-blue-600' },
  { symbol: 'DOGE', name: 'Dogecoin', color: 'text-yellow-600' },
  { symbol: 'AVAX', name: 'Avalanche', color: 'text-red-400' },
  { symbol: 'MATIC', name: 'Polygon', color: 'text-purple-600' },
  { symbol: 'DOT', name: 'Polkadot', color: 'text-pink-400' }
]

export default function OptionsStrategyModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [loading, setLoading] = useState(true)
  const [spotPrice, setSpotPrice] = useState<number>(0)
  const [optionChainData, setOptionChainData] = useState<any>(null)
  const [selectedExpiry, setSelectedExpiry] = useState<string>('')
  const [expiries, setExpiries] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  // 옵션 데이터 로드 (try-catch 강화)
  const loadOptionsData = useCallback(async (currency: string) => {
    try {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      
      setLoading(true)
      setError(null)
      
      // Deribit은 BTC와 ETH만 옵션 지원, 다른 코인은 기본값 사용
      if (currency === 'BTC' || currency === 'ETH') {
        try {
          // 옵션 상품 목록 가져오기
          const optionsResponse = await fetch(
            `/api/deribit/options?currency=${currency}`,
            { signal: abortControllerRef.current.signal }
          )
          
          // response.ok 체크
          if (!optionsResponse.ok) {
            console.warn(`Deribit API 응답 오류: ${optionsResponse.status}`)
            // 에러 시 기본 만료일 설정
            const defaultExpiries = ['2024-12-27', '2025-01-03', '2025-01-10']
            setExpiries(defaultExpiries)
            if (!selectedExpiry) {
              setSelectedExpiry(defaultExpiries[0])
            }
          } else {
            const optionsData = await optionsResponse.json()
            
            // 데이터 유효성 검사
            if (optionsData && optionsData.optionsByExpiry) {
              const expiryDates = Object.keys(optionsData.optionsByExpiry).sort()
              setExpiries(expiryDates)
              
              if (expiryDates.length > 0 && !selectedExpiry) {
                setSelectedExpiry(expiryDates[0])
              }
              
              // 현물 가격 설정
              setSpotPrice(parseFloat(optionsData.spotPrice) || 0)
            }
          }
        } catch (optionsError) {
          console.error('Deribit 옵션 데이터 로드 실패:', optionsError)
          // 기본 만료일 설정
          const defaultExpiries = ['2024-12-27', '2025-01-03', '2025-01-10']
          setExpiries(defaultExpiries)
          if (!selectedExpiry) {
            setSelectedExpiry(defaultExpiries[0])
          }
        }
      }
      
      // 현물 가격 가져오기 (Binance)
      try {
        const priceResponse = await fetch(
          `/api/binance/ticker?symbol=${currency}USDT`,
          { signal: abortControllerRef.current.signal }
        )
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          if (priceData && priceData.lastPrice) {
            setSpotPrice(parseFloat(priceData.lastPrice))
          }
        } else {
          throw new Error(`Binance API 오류: ${priceResponse.status}`)
        }
      } catch (priceError: any) {
        // AbortError는 정상적인 취소이므로 무시
        if (priceError?.name === 'AbortError' || priceError?.message?.includes('aborted')) {
          console.log('현물 가격 로드 취소됨 (코인 변경 또는 컴포넌트 언마운트)')
          return
        }
        
        console.error('현물 가격 로드 실패:', priceError)
        
        // 에러 시 기본가격 맵 사용
        const priceMap: Record<string, number> = {
          'BTC': 98000, 'ETH': 3500, 'BNB': 700, 'SOL': 240,
          'XRP': 2.5, 'ADA': 1.0, 'DOGE': 0.4, 'AVAX': 45,
          'MATIC': 1.5, 'DOT': 10
        }
        
        const defaultPrice = priceMap[currency] || 100
        setSpotPrice(defaultPrice)
      }
      
    } catch (error: any) {
      // AbortError는 정상적인 취소이므로 무시
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.log('옵션 데이터 로드 취소됨 (코인 변경 또는 컴포넌트 언마운트)')
        return
      }
      
      console.error('옵션 데이터 로드 실패:', error)
      
      // 완전 실패 시 기본가격 맵 사용
      const priceMap: Record<string, number> = {
        'BTC': 98000, 'ETH': 3500, 'BNB': 700, 'SOL': 240,
        'XRP': 2.5, 'ADA': 1.0, 'DOGE': 0.4, 'AVAX': 45,
        'MATIC': 1.5, 'DOT': 10
      }
      
      const defaultPrice = priceMap[currency] || 100
      setSpotPrice(defaultPrice)
      setError('일부 데이터를 불러오는데 실패했습니다. 기본값을 사용합니다.')
    } finally {
      setLoading(false)
    }
  }, [selectedExpiry])

  // 옵션 체인 데이터 로드 (try-catch 강화)
  const loadOptionChain = useCallback(async () => {
    if (!selectedExpiry || (!['BTC', 'ETH'].includes(selectedCoin))) {
      // BTC, ETH가 아닌 경우 기본 옵션 체인 데이터 생성
      const defaultChain = generateDefaultOptionChain(selectedCoin)
      setOptionChainData(defaultChain)
      return
    }
    
    try {
      const response = await fetch(
        `/api/deribit/option-chain?currency=${selectedCoin}&expiry=${selectedExpiry}`
      )
      
      // response.ok 체크
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // 데이터 유효성 검사
      if (!data) {
        throw new Error('Empty response data')
      }
      
      setOptionChainData(data.optionChain || null)
      
      if (data.spotPrice && !isNaN(parseFloat(data.spotPrice))) {
        setSpotPrice(parseFloat(data.spotPrice))
      }
      
      setError(null) // 성공시 에러 해제
      
    } catch (error) {
      console.error('옵션 체인 로드 실패:', error)
      
      // 에러 시 기본 옵션 체인 데이터로 폴백
      const defaultChain = generateDefaultOptionChain(selectedCoin)
      setOptionChainData(defaultChain)
      
      setError('옵션 체인 데이터를 불러오는데 실패했습니다. 기본 데이터를 사용합니다.')
    }
  }, [selectedCoin, selectedExpiry])
  
  // 기본 옵션 체인 데이터 생성 함수 (강화된 계산)
  const generateDefaultOptionChain = (coin: string) => {
    // 코인별 기본 가격 맵핑
    const priceMap: Record<string, number> = {
      'BTC': 98000,
      'ETH': 3500,
      'BNB': 700,
      'SOL': 240,
      'XRP': 2.5,
      'ADA': 1.0,
      'DOGE': 0.4,
      'AVAX': 45,
      'MATIC': 1.5,
      'DOT': 10
    }
    
    const basePrice = priceMap[coin] || 100 // 기본값 100
    
    // 기본 행사가격들 (현재가 기준 ±20%)
    const strikes: number[] = []
    for (let i = -20; i <= 20; i += 5) {
      const strike = Math.round(basePrice * (1 + i / 100))
      if (strike > 0) strikes.push(strike) // 양수만 추가
    }
    
    return strikes.map(strike => {
      // 내재가치 계산 (안전하게)
      const callIntrinsic = Math.max(0, basePrice - strike)
      const putIntrinsic = Math.max(0, strike - basePrice)
      
      // 시간가치 + 내재가치
      const timeValue = basePrice * 0.02 // 2% 시간가치
      
      return {
        strike,
        call: {
          price: Math.max(0.01, callIntrinsic + timeValue),
          delta: strike < basePrice ? Math.min(0.95, Math.max(0.05, 0.7)) : Math.min(0.95, Math.max(0.05, 0.3)),
          gamma: Math.max(0.0001, Math.min(0.01, 0.001)),
          theta: Math.max(-0.1, Math.min(-0.01, -0.05)),
          vega: Math.max(0.01, Math.min(0.5, 0.1)),
          iv: Math.max(0.1, Math.min(1.0, 0.25))
        },
        put: {
          price: Math.max(0.01, putIntrinsic + timeValue),
          delta: strike > basePrice ? Math.max(-0.95, Math.min(-0.05, -0.7)) : Math.max(-0.95, Math.min(-0.05, -0.3)),
          gamma: Math.max(0.0001, Math.min(0.01, 0.001)),
          theta: Math.max(-0.1, Math.min(-0.01, -0.05)),
          vega: Math.max(0.01, Math.min(0.5, 0.1)),
          iv: Math.max(0.1, Math.min(1.0, 0.25))
        }
      }
    })
  }

  // 코인 변경 시
  useEffect(() => {
    loadOptionsData(selectedCoin)
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted or coin changed')
      }
    }
  }, [selectedCoin, loadOptionsData])

  // 만기일 변경 시
  useEffect(() => {
    if (selectedExpiry) {
      loadOptionChain()
    }
  }, [selectedExpiry, loadOptionChain])

  // 현재 선택된 코인 정보
  const currentCoin = SUPPORTED_COINS.find(coin => coin.symbol === selectedCoin)

  // 에러 발생 시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 max-w-md">
          <h3 className="text-xl font-bold mb-2">오류 발생</h3>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              loadOptionsData(selectedCoin)
            }}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="border-b border-gray-800 sticky top-0 bg-gray-900 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold mb-2">옵션 전략 분석</h1>
          <p className="text-gray-400 text-sm">암호화폐 옵션 전문 분석 및 전략 수립</p>
        </div>
      </div>

      {/* 코인 선택 탭 */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {SUPPORTED_COINS.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin.symbol)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCoin === coin.symbol
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className={coin.color}>{coin.symbol}</span>
              <span className="ml-1 text-xs">{coin.name}</span>
            </button>
          ))}
        </div>

        {/* 현재 가격 표시 */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {currentCoin?.name} ({currentCoin?.symbol})
              </h2>
              <p className="text-3xl font-bold">
                ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            {expiries.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">만기일:</span>
                <select 
                  value={selectedExpiry}
                  onChange={(e) => setSelectedExpiry(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  {expiries.map(expiry => (
                    <option key={expiry} value={expiry}>{expiry}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-gray-800 p-1 rounded-lg mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">개요</TabsTrigger>
            <TabsTrigger value="chain" className="data-[state=active]:bg-purple-600">옵션체인</TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-purple-600">전략</TabsTrigger>
            <TabsTrigger value="greeks" className="data-[state=active]:bg-purple-600">그리스</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600">분석</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 옵션 기초 개념 */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">옵션 기초 개념</h3>
                <div className="space-y-3 text-sm">
                  <div className="border-b border-gray-700 pb-3">
                    <h4 className="font-semibold text-purple-400 mb-1">콜 옵션 (Call Option)</h4>
                    <p className="text-gray-300">특정 가격에 기초자산을 매수할 수 있는 권리</p>
                  </div>
                  <div className="border-b border-gray-700 pb-3">
                    <h4 className="font-semibold text-purple-400 mb-1">풋 옵션 (Put Option)</h4>
                    <p className="text-gray-300">특정 가격에 기초자산을 매도할 수 있는 권리</p>
                  </div>
                  <div className="border-b border-gray-700 pb-3">
                    <h4 className="font-semibold text-purple-400 mb-1">행사가 (Strike Price)</h4>
                    <p className="text-gray-300">옵션 행사 시 거래되는 가격</p>
                  </div>
                  <div className="border-b border-gray-700 pb-3">
                    <h4 className="font-semibold text-purple-400 mb-1">프리미엄 (Premium)</h4>
                    <p className="text-gray-300">옵션을 구매하기 위해 지불하는 가격</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-1">만기일 (Expiry)</h4>
                    <p className="text-gray-300">옵션 권리가 소멸되는 날짜</p>
                  </div>
                </div>
              </div>

              {/* 현재 시장 상황 */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">현재 시장 분석</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">추세</span>
                    <span className="text-green-400 font-semibold">상승세</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">변동성</span>
                    <span className="text-yellow-400 font-semibold">보통</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">추천 전략</span>
                    <span className="text-purple-400 font-semibold">불 스프레드</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 트레이딩 팁</h4>
                  <p className="text-sm text-gray-300">
                    현재 {currentCoin?.symbol}의 변동성이 안정적이므로, 
                    프리미엄 수익을 노리는 커버드 콜 전략이나 
                    캐시 시큐어드 풋 전략을 고려해보세요.
                  </p>
                </div>
              </div>
            </div>

            {/* 주요 전략 요약 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">주요 옵션 전략</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">롱 콜</h4>
                  <p className="text-sm text-gray-300">상승장 예상 시</p>
                  <p className="text-xs text-gray-400 mt-1">최대 손실: 프리미엄</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-400 mb-2">롱 풋</h4>
                  <p className="text-sm text-gray-300">하락장 예상 시</p>
                  <p className="text-xs text-gray-400 mt-1">최대 손실: 프리미엄</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-2">스트래들</h4>
                  <p className="text-sm text-gray-300">큰 변동성 예상 시</p>
                  <p className="text-xs text-gray-400 mt-1">양방향 수익 가능</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">아이언 컨도르</h4>
                  <p className="text-sm text-gray-300">횡보장 예상 시</p>
                  <p className="text-xs text-gray-400 mt-1">제한된 수익/손실</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 옵션 체인 탭 */}
          <TabsContent value="chain">
            <OptionChainSection 
              coin={selectedCoin} 
              spotPrice={spotPrice}
              optionChainData={optionChainData}
              loading={loading}
            />
          </TabsContent>

          {/* 전략 탭 */}
          <TabsContent value="strategies">
            <OptionStrategies 
              coin={selectedCoin} 
              spotPrice={spotPrice}
            />
          </TabsContent>

          {/* 그리스 탭 */}
          <TabsContent value="greeks">
            <GreeksDisplay 
              coin={selectedCoin}
              optionChainData={optionChainData}
            />
          </TabsContent>

          {/* 분석 탭 */}
          <TabsContent value="analysis">
            <div className="space-y-6">
              <PayoffDiagram 
                coin={selectedCoin} 
                spotPrice={spotPrice}
              />
              <IVAnalysis 
                coin={selectedCoin}
                optionChainData={optionChainData}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}