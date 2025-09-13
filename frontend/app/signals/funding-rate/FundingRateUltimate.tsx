'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  FaPercent, FaClock, FaChartLine, FaExclamationTriangle, 
  FaArrowUp, FaArrowDown, FaDollarSign, FaExchangeAlt,
  FaBitcoin, FaEthereum, FaCoins, FaChartBar, FaHistory,
  FaRobot, FaCalculator, FaBalanceScale, FaFireAlt,
  FaWater, FaChartArea, FaInfoCircle, FaTrophy,
  FaGraduationCap, FaLightbulb, FaUserGraduate
} from 'react-icons/fa'
import { SiBinance, SiSolana, SiRipple, SiDogecoin } from 'react-icons/si'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

// 코인 설정
const COINS = [
  { symbol: 'BTCUSDT', name: 'BTC', icon: FaBitcoin, color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'ETH', icon: FaEthereum, color: '#627EEA' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: SiBinance, color: '#F3BA2F' },
  { symbol: 'SOLUSDT', name: 'SOL', icon: SiSolana, color: '#9945FF' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: SiRipple, color: '#23292F' },
  { symbol: 'ADAUSDT', name: 'ADA', icon: FaCoins, color: '#0033AD' },
  { symbol: 'DOGEUSDT', name: 'DOGE', icon: SiDogecoin, color: '#C2A633' },
  { symbol: 'AVAXUSDT', name: 'AVAX', icon: FaCoins, color: '#E84142' },
  { symbol: 'MATICUSDT', name: 'MATIC', icon: FaCoins, color: '#8247E5' },
  { symbol: 'ARBUSDT', name: 'ARB', icon: FaCoins, color: '#28A0F0' }
]

interface FundingData {
  current: {
    symbol: string
    fundingRate: number
    nextFundingRate: number
    lastFundingRate: number
    fundingTime: number
    nextFundingTime: number
    countdown: string
    countdownMs: number
    markPrice: number
    indexPrice: number
    premium: number
    annualizedRate: number
  }
  statistics: {
    avgRate: number
    maxRate: number
    minRate: number
    trend: string
    sentiment: string
    dataPoints: number
  }
  history: Array<{
    time: number
    rate: number
    symbol: string
  }>
  recommendation: {
    action: string
    confidence: number
    reason: string
  }
}

export default function FundingRateUltimate() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [fundingData, setFundingData] = useState<FundingData | null>(null)
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const streamName = symbol.toLowerCase().replace('usdt', '') + 'usdt@markPrice@1s'
    const ws = new WebSocket(`wss://fstream.binance.com/ws/${streamName}`)

    ws.onopen = () => {
      }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.e === 'markPriceUpdate') {
        setCurrentPrice(parseFloat(data.p))
      }
    }

    ws.onerror = (error) => {
      // WebSocket 에러 조용히 처리
      // console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      if (autoRefresh) {
        setTimeout(() => connectWebSocket(symbol), 3000)
      }
    }

    wsRef.current = ws
  }, [autoRefresh])

  // 펀딩비 데이터 가져오기
  const fetchFundingData = async () => {
    try {
      const [fundingRes, historyRes] = await Promise.all([
        fetch(`/api/binance/funding-rate?symbol=${selectedSymbol}`),
        fetch(`/api/binance/funding-history?symbol=${selectedSymbol}&limit=200`)
      ])

      if (fundingRes.ok && historyRes.ok) {
        const funding = await fundingRes.json()
        const history = await historyRes.json()
        
        if (funding.success) {
          setFundingData(funding.data)
        }
        if (history.success) {
          setHistoryData(history.data)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching funding data:', error)
      setLoading(false)
    }
  }

  // 초기 로드 및 자동 새로고침
  useEffect(() => {
    fetchFundingData()
    connectWebSocket(selectedSymbol)

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchFundingData, 30000) // 30초마다
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [selectedSymbol, autoRefresh, connectWebSocket])

  // 코인 변경
  const handleCoinChange = (symbol: string) => {
    setSelectedSymbol(symbol)
    setLoading(true)
  }

  const currentCoin = COINS.find(c => c.symbol === selectedSymbol)
  const Icon = currentCoin?.icon || FaCoins

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* 상단 코인 선택 버튼 */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaPercent className="text-yellow-400" />
              펀딩비 시그널 Ultimate
            </h1>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              자동 새로고침 {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {COINS.map((coin) => {
              const CoinIcon = coin.icon
              return (
                <button
                  key={coin.symbol}
                  onClick={() => handleCoinChange(coin.symbol)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedSymbol === coin.symbol
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                  }`}
                >
                  <CoinIcon className="text-xl" style={{ color: coin.color }} />
                  {coin.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">펀딩비 데이터 로딩 중...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 섹션 1: 펀딩비 개념 & 실시간 현황 */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <FaGraduationCap className="text-3xl text-yellow-400" />
                <h2 className="text-2xl font-bold">펀딩비 개념 & 실시간 현황</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 펀딩비 설명 */}
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                      <FaLightbulb /> 펀딩비란?
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      무기한 선물 계약에서 선물 가격과 현물 가격의 균형을 맞추기 위한 메커니즘입니다.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">▸</span>
                        <span className="text-gray-300">
                          <span className="text-green-400 font-semibold">양수(+)</span>: 
                          롱 포지션이 숏에게 지불 (시장 과열)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">▸</span>
                        <span className="text-gray-300">
                          <span className="text-red-400 font-semibold">음수(-)</span>: 
                          숏 포지션이 롱에게 지불 (공포 시장)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                      <FaUserGraduate /> 트레이딩 전략
                    </h3>
                    <p className="text-sm text-gray-300">
                      현재 펀딩비: {fundingData?.current?.fundingRate ? fundingData.current.fundingRate.toFixed(4) : '0.0000'}%
                    </p>
                    <div className="mt-2 p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-yellow-400">
                        {fundingData?.recommendation.action === 'SHORT_OPPORTUNITY' 
                          ? '📉 숏 포지션 기회' 
                          : fundingData?.recommendation.action === 'LONG_OPPORTUNITY'
                          ? '📈 롱 포지션 기회'
                          : '⏸️ 관망 권장'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {fundingData?.recommendation.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 실시간 데이터 */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                        <Icon className="text-2xl" style={{ color: currentCoin?.color }} />
                        {currentCoin?.name} 실시간 펀딩비
                      </h3>
                      <div className="text-3xl font-bold">
                        <span className={(fundingData?.current?.fundingRate || 0) > 0 ? 'text-green-400' : 'text-red-400'}>
                          {fundingData?.current?.fundingRate ? fundingData.current.fundingRate.toFixed(4) : '0.0000'}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">다음 펀딩 시간</p>
                        <p className="text-lg font-semibold text-white flex items-center gap-1">
                          <FaClock className="text-sm" />
                          {fundingData?.current.countdown}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">연율화 수익률</p>
                        <p className="text-lg font-semibold text-yellow-400">
                          {fundingData?.current?.annualizedRate ? fundingData.current.annualizedRate.toFixed(2) : '0.00'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Mark Price</p>
                        <p className="text-lg font-semibold">
                          ${fundingData?.current.markPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">프리미엄</p>
                        <p className={`text-lg font-semibold ${
                          (fundingData?.current.premium || 0) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {fundingData?.current?.premium ? fundingData.current.premium.toFixed(3) : '0.000'}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 시장 센티먼트 */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FaChartBar /> 시장 센티먼트
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          fundingData?.statistics.sentiment === 'BULLISH' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : fundingData?.statistics.sentiment === 'BEARISH'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-700 text-gray-400 border border-gray-600'
                        }`}>
                          {fundingData?.statistics.sentiment === 'BULLISH' ? '🔥 과열' :
                           fundingData?.statistics.sentiment === 'BEARISH' ? '❄️ 공포' : '😐 중립'}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">트렌드:</span>
                          <span className={`ml-2 font-semibold ${
                            fundingData?.statistics.trend === 'INCREASING' ? 'text-green-400' :
                            fundingData?.statistics.trend === 'DECREASING' ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {fundingData?.statistics.trend === 'INCREASING' ? '↗️ 상승' :
                             fundingData?.statistics.trend === 'DECREASING' ? '↘️ 하락' : '→ 보합'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">신뢰도</p>
                        <p className="text-lg font-bold text-yellow-400">
                          {fundingData?.recommendation?.confidence ? fundingData.recommendation.confidence.toFixed(1) : '0.0'}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 섹션 2: 펀딩비 차트 & 분석 */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-3xl text-blue-400" />
                <h2 className="text-2xl font-bold">펀딩비 차트 & 트렌드 분석</h2>
              </div>

              {/* 펀딩비 히스토리 차트 */}
              <div className="mb-6">
                <h3 className="font-bold mb-4 text-gray-300">펀딩비 히스토리 (최근 50개)</h3>
                <div className="h-80 bg-gray-900/50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fundingData?.history.slice(0, 50).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        tickFormatter={(time) => new Date(time).toLocaleString('ko-KR', { 
                          month: 'numeric', 
                          day: 'numeric',
                          hour: '2-digit'
                        })}
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `${safeFixed(value, 3)}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(time) => new Date(time).toLocaleString('ko-KR')}
                        formatter={(value: any) => `${safeFixed(value, 4)}%`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        name="펀딩비"
                        stroke={currentCoin?.color || '#F59E0B'}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => 0}
                        stroke="#EF4444"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 시간대별 펀딩비 히트맵 */}
              {historyData?.hourlyAnalysis && (
                <div className="mb-6">
                  <h3 className="font-bold mb-4 text-gray-300">시간대별 펀딩비 패턴</h3>
                  <div className="grid grid-cols-12 gap-1">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hourData = historyData.hourlyAnalysis[i]
                      const avgRate = hourData?.avg || 0
                      const intensity = Math.min(Math.abs(avgRate) * 1000, 1)
                      
                      return (
                        <div
                          key={i}
                          className="aspect-square rounded flex items-center justify-center text-xs font-semibold"
                          style={{
                            backgroundColor: avgRate > 0 
                              ? `rgba(34, 197, 94, ${intensity})`
                              : `rgba(239, 68, 68, ${intensity})`,
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                          title={`${i}시: ${avgRate?.toFixed(4)}%`}
                        >
                          {i}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div> 양수 (롱 지불)
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div> 음수 (숏 지불)
                    </span>
                  </div>
                </div>
              )}

              {/* 통계 요약 */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">평균 펀딩비</p>
                  <p className="text-xl font-bold text-white">
                    {fundingData?.statistics ? safeFixed(fundingData.statistics.avgRate, 4) : '0.0000'}%
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">최대 펀딩비</p>
                  <p className="text-xl font-bold text-green-400">
                    {fundingData?.statistics ? safeFixed(fundingData.statistics.maxRate, 4) : '0.0000'}%
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">최소 펀딩비</p>
                  <p className="text-xl font-bold text-red-400">
                    {fundingData?.statistics ? safeFixed(fundingData.statistics.minRate, 4) : '0.0000'}%
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">데이터 포인트</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {fundingData?.statistics.dataPoints}개
                  </p>
                </div>
              </div>
            </section>

            {/* 섹션 3: 차익거래 기회 분석 */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <FaDollarSign className="text-3xl text-green-400" />
                <h2 className="text-2xl font-bold">차익거래 기회 분석</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 수익 계산기 */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FaCalculator /> 펀딩비 수익 계산기
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">투자금액 (USDT)</label>
                      <input
                        type="number"
                        defaultValue="10000"
                        className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg"
                        id="investment"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">레버리지</label>
                      <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg">
                        <option>1x</option>
                        <option>2x</option>
                        <option>3x</option>
                        <option>5x</option>
                      </select>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">8시간 예상 수익</p>
                          <p className="text-lg font-bold text-green-400">
                            ${(10000 * Math.abs(fundingData?.current.fundingRate || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">일일 예상 수익</p>
                          <p className="text-lg font-bold text-green-400">
                            ${(10000 * Math.abs(fundingData?.current.fundingRate || 0) * 3 / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">월간 예상 수익</p>
                          <p className="text-lg font-bold text-yellow-400">
                            ${(10000 * Math.abs(fundingData?.current.fundingRate || 0) * 90 / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">연간 수익률</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {Math.abs(fundingData?.current.annualizedRate || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 차익거래 전략 */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FaBalanceScale /> 현물-선물 차익거래 전략
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">현재 기회</h4>
                      {(fundingData?.current.fundingRate || 0) > 0.01 ? (
                        <div>
                          <p className="text-sm text-gray-300 mb-2">
                            📉 <span className="font-semibold">숏 헤지 전략</span>
                          </p>
                          <ol className="text-xs space-y-1 text-gray-400">
                            <li>1. 현물 {currentCoin?.name} 매수</li>
                            <li>2. 선물 {currentCoin?.name} 숏 포지션</li>
                            <li>3. 펀딩비 {fundingData?.current?.fundingRate ? fundingData.current.fundingRate.toFixed(4) : '0.0000'}% 수취</li>
                            <li>4. 리스크 없는 수익 실현</li>
                          </ol>
                        </div>
                      ) : (fundingData?.current.fundingRate || 0) < -0.01 ? (
                        <div>
                          <p className="text-sm text-gray-300 mb-2">
                            📈 <span className="font-semibold">롱 헤지 전략</span>
                          </p>
                          <ol className="text-xs space-y-1 text-gray-400">
                            <li>1. 현물 {currentCoin?.name} 매도</li>
                            <li>2. 선물 {currentCoin?.name} 롱 포지션</li>
                            <li>3. 펀딩비 {Math.abs(fundingData?.current.fundingRate || 0).toFixed(4)}% 수취</li>
                            <li>4. 리스크 없는 수익 실현</li>
                          </ol>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          현재 펀딩비가 낮아 차익거래 기회가 제한적입니다.
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <h4 className="font-semibold text-yellow-400 mb-2">리스크 관리</h4>
                      <ul className="text-xs space-y-1 text-gray-400">
                        <li>• 포지션 크기: 전체 자본의 20-30%</li>
                        <li>• 레버리지: 최대 3x 권장</li>
                        <li>• 청산 가격: 현재가 대비 ±30% 설정</li>
                        <li>• 모니터링: 펀딩비 변동 실시간 추적</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 섹션 4: AI 트레이딩 전략 */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <FaRobot className="text-3xl text-purple-400" />
                <h2 className="text-2xl font-bold">AI 트레이딩 전략 & 실전 가이드</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* 단기 전략 */}
                <div className="bg-gradient-to-b from-blue-900/30 to-blue-900/10 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <FaFireAlt /> 단기 전략 (8시간)
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">진입 시점</p>
                      <p className="text-xs text-gray-400">
                        펀딩비 {Math.abs(fundingData?.current.fundingRate || 0) > 0.03 ? '극단값' : '정상'} 구간
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">포지션</p>
                      <p className="text-xs text-gray-400">
                        {(fundingData?.current.fundingRate || 0) > 0.01 ? '숏 우위' : '롱 우위'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">목표 수익</p>
                      <p className="text-xs text-gray-400">
                        펀딩비 수취 + 가격 변동 1-2%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 중기 전략 */}
                <div className="bg-gradient-to-b from-green-900/30 to-green-900/10 rounded-lg p-6 border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2">
                    <FaChartArea /> 중기 전략 (3-7일)
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">트렌드 활용</p>
                      <p className="text-xs text-gray-400">
                        펀딩비 {fundingData?.statistics.trend === 'INCREASING' ? '상승' : 
                                fundingData?.statistics.trend === 'DECREASING' ? '하락' : '보합'} 추세
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">평균 회귀</p>
                      <p className="text-xs text-gray-400">
                        현재 vs 평균: {((fundingData?.current.fundingRate || 0) - (fundingData?.statistics.avgRate || 0)).toFixed(4)}%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">리밸런싱</p>
                      <p className="text-xs text-gray-400">
                        일일 1회 포지션 조정
                      </p>
                    </div>
                  </div>
                </div>

                {/* 장기 전략 */}
                <div className="bg-gradient-to-b from-purple-900/30 to-purple-900/10 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <FaWater /> 장기 전략 (30일+)
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">캐리 트레이드</p>
                      <p className="text-xs text-gray-400">
                        연율 {Math.abs(fundingData?.current.annualizedRate || 0).toFixed(2)}% 수익
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">헤지 비율</p>
                      <p className="text-xs text-gray-400">
                        현물 50% : 선물 50%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-sm font-semibold text-white mb-1">복리 효과</p>
                      <p className="text-xs text-gray-400">
                        수익 재투자로 연 {(Math.pow(1 + Math.abs(fundingData?.current.fundingRate || 0) * 3 / 100, 365) - 1).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 실행 체크리스트 */}
              <div className="mt-6 p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg border border-orange-500/30">
                <h3 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <FaTrophy /> 실전 실행 체크리스트
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">진입 전 확인사항</h4>
                    <ul className="text-sm space-y-1 text-gray-300">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>펀딩비 극단값 확인 (±0.03% 이상)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>시장 센티먼트 확인</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>리스크 관리 설정 완료</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>레버리지 3x 이하 설정</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">포지션 관리</h4>
                    <ul className="text-sm space-y-1 text-gray-300">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>손절선 설정 (-3%)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>익절 목표 설정 (+5%)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>펀딩 시간 알람 설정</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>일일 모니터링 계획</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 하단 정보 */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>✅ 실시간 Binance Futures 데이터</span>
                <span>📊 {fundingData?.statistics.dataPoints}개 데이터 포인트 분석</span>
                <span>🔄 30초마다 자동 업데이트</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}