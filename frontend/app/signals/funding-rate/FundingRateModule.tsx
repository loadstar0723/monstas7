'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaPercent, FaClock, FaChartLine, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'
import dynamic from 'next/dynamic'

// 새로운 컴포넌트들 동적 임포트
const MultiTimeframePlan = dynamic(() => import('@/components/signals/MultiTimeframePlan'), { ssr: false })
const ProfitCalculator = dynamic(() => import('@/components/signals/ProfitCalculator'), { ssr: false })
const BacktestResults = dynamic(() => import('@/components/signals/BacktestResults'), { ssr: false })
const AlertSettings = dynamic(() => import('@/components/signals/AlertSettings'), { ssr: false })
const PortfolioManager = dynamic(() => import('@/components/signals/PortfolioManager'), { ssr: false })
const DetailedAIAnalysis = dynamic(() => import('@/components/signals/DetailedAIAnalysis'), { ssr: false })

interface FundingRateData {
  symbol: string
  fundingRate: number
  fundingTime: number
  countdownTime: string
  markPrice: number
  indexPrice: number
  estimatedRate: number
  historicalRates: number[]
}

interface FundingStats {
  avgFundingRate: number
  maxFundingRate: number
  minFundingRate: number
  totalPayments: number
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

export default function FundingRateModule() {
  const [fundingRates, setFundingRates] = useState<FundingRateData[]>([])
  const [stats, setStats] = useState<FundingStats>({
    avgFundingRate: 0,
    maxFundingRate: 0,
    minFundingRate: 0,
    totalPayments: 0,
    trend: 'NEUTRAL'
  })
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'analysis' | 'strategy' | 'tools'>('current')
  const [countdown, setCountdown] = useState<string>('00:00:00')
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('FundingRate'))
  const countdownInterval = useRef<NodeJS.Timeout | null>(null)
  
  // 펀딩비 트렌드 계산
  const calculateTrend = (rates: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
    if (rates.length < 3) return 'NEUTRAL'
    const recent = rates.slice(-3)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    
    if (avg > 0.01) return 'BULLISH' // 롱이 많음 (숏 유리)
    if (avg < -0.01) return 'BEARISH' // 숏이 많음 (롱 유리)
    return 'NEUTRAL'
  }
  
  // 카운트다운 계산
  const calculateCountdown = (fundingTime: number) => {
    const now = Date.now()
    const timeLeft = fundingTime - now
    
    if (timeLeft <= 0) return '00:00:00'
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // 펀딩비 데이터 가져오기
  const fetchFundingRates = async () => {
    try {
      // Binance Futures 펀딩비 API
      const response = await fetch(`${BINANCE_CONFIG.FUTURES_BASE}/fapi/v1/fundingRate?limit=100`)
      const data = await response.json()
      
      // 심볼별로 그룹화
      const symbolData: { [key: string]: number[] } = {}
      data.forEach((item: any) => {
        if (!symbolData[item.symbol]) {
          symbolData[item.symbol] = []
        }
        symbolData[item.symbol].push(parseFloat(item.fundingRate))
      })
      
      // 주요 심볼들의 펀딩비 계산
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
      const rates: FundingRateData[] = []
      
      for (const symbol of symbols) {
        const historicalRates = symbolData[symbol] || []
        const currentRate = historicalRates[historicalRates.length - 1] || 0
        
        // 다음 펀딩 시간 계산 (8시간마다)
        const now = new Date()
        const hours = now.getUTCHours()
        const nextFundingHour = Math.ceil(hours / 8) * 8
        const fundingTime = new Date(now)
        fundingTime.setUTCHours(nextFundingHour, 0, 0, 0)
        
        rates.push({
          symbol,
          fundingRate: currentRate,
          fundingTime: fundingTime.getTime(),
          countdownTime: calculateCountdown(fundingTime.getTime()),
          markPrice: 0, // WebSocket에서 업데이트
          indexPrice: 0, // WebSocket에서 업데이트
          estimatedRate: currentRate * 1.1, // 예상치
          historicalRates: historicalRates.slice(-24) // 최근 24개
        })
      }
      
      setFundingRates(rates)
      
      // 통계 계산
      const allRates = rates.flatMap(r => r.historicalRates)
      if (allRates.length > 0) {
        setStats({
          avgFundingRate: allRates.reduce((a, b) => a + b, 0) / allRates.length,
          maxFundingRate: Math.max(...allRates),
          minFundingRate: Math.min(...allRates),
          totalPayments: allRates.length,
          trend: calculateTrend(allRates)
        })
      }
    } catch (error) {
      console.error('[FundingRate] API error:', error)
    }
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 초기 데이터 로드
        await fetchFundingRates()
        
        // WebSocket 연결 (mark price 스트림)
        wsRef.current = new ModuleWebSocket('FundingRate')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedSymbol.toLowerCase()}@markPrice@1s`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 마크 가격과 펀딩비 업데이트
          setFundingRates(prev => prev.map(rate => {
            if (rate.symbol === data.s) {
              return {
                ...rate,
                markPrice: parseFloat(data.p),
                indexPrice: parseFloat(data.i),
                fundingRate: parseFloat(data.r),
                fundingTime: data.T,
                countdownTime: calculateCountdown(data.T)
              }
            }
            return rate
          }))
          
          measureWs()
        })
        
        // 카운트다운 업데이트
        countdownInterval.current = setInterval(() => {
          setFundingRates(prev => prev.map(rate => ({
            ...rate,
            countdownTime: calculateCountdown(rate.fundingTime)
          })))
        }, 1000)
        
        // 5분마다 펀딩비 데이터 새로고침
        const refreshInterval = setInterval(fetchFundingRates, 300000)
        
        setLoading(false)
        
        return () => {
          clearInterval(refreshInterval)
        }
      } catch (err) {
        console.error('[FundingRate] Initialization error:', err)
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
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
    }
  }, [selectedSymbol])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">펀딩비 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  const currentRate = fundingRates.find(r => r.symbol === selectedSymbol)
  
  return (
    <div className="space-y-8">
      {/* 심볼 선택 */}
      <div className="flex gap-2">
        {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'].map(symbol => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {symbol.replace('USDT', '')}
          </button>
        ))}
      </div>
      
      {/* 실시간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaPercent className="text-yellow-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">현재 펀딩비</p>
          <p className={`text-2xl font-bold ${
            currentRate && currentRate.fundingRate > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {currentRate ? `${(currentRate.fundingRate * 100).toFixed(4)}%` : '0.0000%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {currentRate && currentRate.fundingRate > 0 ? '롱이 숏에게 지불' : '숏이 롱에게 지불'}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaClock className="text-blue-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">다음 결제까지</p>
          <p className="text-2xl font-bold text-white">
            {currentRate ? currentRate.countdownTime : '00:00:00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">8시간마다 결제</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaChartLine className="text-purple-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">시장 트렌드</p>
          <p className={`text-2xl font-bold ${
            stats.trend === 'BULLISH' ? 'text-green-400' :
            stats.trend === 'BEARISH' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {stats.trend === 'BULLISH' ? '과매수' :
             stats.trend === 'BEARISH' ? '과매도' :
             '중립'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.trend === 'BULLISH' ? '숏 포지션 유리' :
             stats.trend === 'BEARISH' ? '롱 포지션 유리' :
             '방향성 없음'}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaExclamationTriangle className="text-orange-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">예상 펀딩비</p>
          <p className="text-2xl font-bold text-white">
            {currentRate ? `${(currentRate.estimatedRate * 100).toFixed(4)}%` : '0.0000%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">다음 결제 예상치</p>
        </motion.div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800 overflow-x-auto">
        {[
          { id: 'current', label: '현재 펀딩비' },
          { id: 'history', label: '과거 내역' },
          { id: 'analysis', label: '분석' },
          { id: 'strategy', label: '전략' },
          { id: 'tools', label: '도구' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">실시간 펀딩비</h2>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">심볼</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">펀딩비</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">마크 가격</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">인덱스 가격</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">다음 결제</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">신호</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {fundingRates.map((rate, index) => (
                    <motion.tr
                      key={rate.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {rate.symbol.replace('USDT', '')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          rate.fundingRate > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(rate.fundingRate * 100).toFixed(4)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        ${rate.markPrice.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        ${rate.indexPrice.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-400 font-mono">
                        {rate.countdownTime}
                      </td>
                      <td className="px-6 py-4">
                        {Math.abs(rate.fundingRate) > 0.01 ? (
                          <span className={`flex items-center gap-1 text-sm font-bold ${
                            rate.fundingRate > 0.01 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {rate.fundingRate > 0.01 ? <FaArrowDown /> : <FaArrowUp />}
                            {rate.fundingRate > 0.01 ? '숏 유리' : '롱 유리'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">중립</span>
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
      
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">펀딩비 히스토리</h2>
          
          {currentRate && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">
                {selectedSymbol.replace('USDT', '')} 최근 24회 펀딩비
              </h3>
              <div className="grid grid-cols-12 gap-1">
                {currentRate.historicalRates.map((rate, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-full rounded ${
                        rate > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        height: `${Math.abs(rate) * 10000}px`,
                        minHeight: '4px',
                        maxHeight: '60px'
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-400">
                  평균: <span className="text-white font-bold">
                    {(stats.avgFundingRate * 100).toFixed(4)}%
                  </span>
                </span>
                <span className="text-gray-400">
                  최대: <span className="text-green-400 font-bold">
                    {(stats.maxFundingRate * 100).toFixed(4)}%
                  </span>
                </span>
                <span className="text-gray-400">
                  최소: <span className="text-red-400 font-bold">
                    {(stats.minFundingRate * 100).toFixed(4)}%
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">펀딩비 분석</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">시장 심리 분석</h3>
              <p className="text-gray-300 mb-4">
                현재 평균 펀딩비가 {(stats.avgFundingRate * 100).toFixed(4)}%로
                {stats.avgFundingRate > 0 
                  ? ' 롱 포지션이 우세합니다. 시장이 과열되었을 가능성이 있으니 숏 포지션을 고려해보세요.'
                  : ' 숏 포지션이 우세합니다. 과매도 상태일 수 있으니 롱 포지션을 고려해보세요.'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">시장 상태</span>
                  <span className={`font-bold ${
                    stats.trend === 'BULLISH' ? 'text-green-400' :
                    stats.trend === 'BEARISH' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {stats.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">추천 전략</span>
                  <span className="text-white font-bold">
                    {stats.trend === 'BULLISH' ? '숏 진입 고려' :
                     stats.trend === 'BEARISH' ? '롱 진입 고려' :
                     '관망'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">리스크 레벨</span>
                  <span className={`font-bold ${
                    Math.abs(stats.avgFundingRate) > 0.01 ? 'text-red-400' :
                    Math.abs(stats.avgFundingRate) > 0.005 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {Math.abs(stats.avgFundingRate) > 0.01 ? '높음' :
                     Math.abs(stats.avgFundingRate) > 0.005 ? '중간' :
                     '낮음'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">트레이딩 전략</h3>
              <div className="space-y-3">
                {stats.avgFundingRate > 0.01 && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400 font-bold">📉 숏 포지션 추천</p>
                    <p className="text-sm text-gray-300 mt-1">
                      높은 양의 펀딩비는 롱 과열을 의미. 조정 가능성 높음.
                    </p>
                  </div>
                )}
                {stats.avgFundingRate < -0.01 && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="text-green-400 font-bold">📈 롱 포지션 추천</p>
                    <p className="text-sm text-gray-300 mt-1">
                      높은 음의 펀딩비는 숏 과열을 의미. 반등 가능성 높음.
                    </p>
                  </div>
                )}
                {Math.abs(stats.avgFundingRate) <= 0.01 && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 font-bold">⚖️ 중립 시장</p>
                    <p className="text-sm text-gray-300 mt-1">
                      펀딩비가 안정적. 다른 지표와 함께 판단 필요.
                    </p>
                  </div>
                )}
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                  <p className="text-blue-400 font-bold">💡 활용 팁</p>
                  <p className="text-sm text-gray-300 mt-1">
                    펀딩비 지불 직전 포지션 정리로 비용 절감 가능
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI 상세 분석 - 실제 AI 모델 기반 */}
          <DetailedAIAnalysis 
            symbol={selectedSymbol.replace('USDT', '')}
            analysisType="funding"
          />
        </div>
      )}
      
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">펀딩비 기반 전략</h2>
          
          {/* 다중 시간대 전략 - 실제 데이터 기반 */}
          <MultiTimeframePlan
            symbol={selectedSymbol.replace('USDT', '')}
          />
          
          {/* 백테스팅 결과 - 실제 데이터베이스 기반 */}
          <BacktestResults
            symbol={selectedSymbol.replace('USDT', '')}
            pattern="펀딩비 역배치 전략"
          />
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">트레이딩 도구</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 수익 계산기 - 실제 가격 기반 */}
            <ProfitCalculator
              symbol={selectedSymbol.replace('USDT', '')}
            />
            
            {/* 알림 설정 - 실제 가격 기반 */}
            <AlertSettings
              symbol={selectedSymbol.replace('USDT', '')}
            />
          </div>
          
          {/* 포트폴리오 관리 - 실제 데이터베이스 연동 */}
          <PortfolioManager />
        </div>
      )}
    </div>
  )
}