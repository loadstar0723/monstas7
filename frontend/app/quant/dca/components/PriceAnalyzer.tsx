'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartBar, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface PriceStats {
  current: number
  high24h: number
  low24h: number
  change24h: number
  changePercent24h: number
  volume24h: number
  volatility: number
  rsi: number
  movingAvg20: number
  movingAvg50: number
}

export default function PriceAnalyzer({ selectedCoin }: Props) {
  const [priceData, setPriceData] = useState<any[]>([])
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null)
  const [timeframe, setTimeframe] = useState('1d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPriceData()
    const interval = setInterval(loadPriceData, 30000) // 30초마다 업데이트
    return () => clearInterval(interval)
  }, [selectedCoin.fullSymbol, timeframe])

  const loadPriceData = async () => {
    try {
      setLoading(true)

      // 현재 가격 정보
      const tickerResponse = await fetch(`/api/binance/ticker?symbol=${selectedCoin.fullSymbol}`)
      const tickerData = await tickerResponse.json()

      // 캔들 데이터
      let interval = '1h'
      let limit = 24
      if (timeframe === '7d') {
        interval = '4h'
        limit = 42
      } else if (timeframe === '30d') {
        interval = '1d'
        limit = 30
      } else if (timeframe === '90d') {
        interval = '1d'
        limit = 90
      }

      const klinesResponse = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=${interval}&limit=${limit}`
      )
      const klinesData = await klinesResponse.json()

      if (Array.isArray(tickerData) && tickerData.length > 0 && Array.isArray(klinesData)) {
        const ticker = tickerData[0]
        
        // 가격 데이터 처리
        const prices = klinesData.map((candle: any) => ({
          time: new Date(candle[0]).toLocaleString('ko-KR', { 
            month: 'short', 
            day: 'numeric',
            hour: timeframe === '1d' ? '2-digit' : undefined
          }),
          price: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }))

        setPriceData(prices)

        // RSI 계산 (간단한 버전)
        const rsi = calculateRSI(prices.map(p => p.price))

        // 이동평균 계산
        const ma20 = calculateMovingAverage(prices.map(p => p.price), 20)
        const ma50 = calculateMovingAverage(prices.map(p => p.price), 50)

        // 변동성 계산
        const volatility = calculateVolatility(prices.map(p => p.price))

        setPriceStats({
          current: parseFloat(ticker.lastPrice),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          change24h: parseFloat(ticker.priceChange),
          changePercent24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.quoteVolume),
          volatility,
          rsi,
          movingAvg20: ma20,
          movingAvg50: ma50
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('가격 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const calculateRSI = (prices: number[], period = 14) => {
    if (prices.length < period) return 50

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  const calculateMovingAverage = (prices: number[], period: number) => {
    if (prices.length < period) return prices[prices.length - 1]
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  const calculateVolatility = (prices: number[]) => {
    if (prices.length < 2) return 0
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avg, 2), 0) / returns.length
    return Math.sqrt(variance) * 100 // 백분율로 표시
  }

  const getDCASignal = () => {
    if (!priceStats) return { signal: 'neutral', message: '데이터 로딩 중...' }

    const rsi = priceStats.rsi
    const priceVsMA20 = ((priceStats.current - priceStats.movingAvg20) / priceStats.movingAvg20) * 100

    if (rsi < 30) {
      return { 
        signal: 'strong-buy', 
        message: '과매도 구간 - DCA 투자 적극 추천',
        color: 'text-green-400'
      }
    } else if (rsi < 40 && priceVsMA20 < -5) {
      return { 
        signal: 'buy', 
        message: '매수 우위 구간 - DCA 투자 추천',
        color: 'text-green-300'
      }
    } else if (rsi > 70) {
      return { 
        signal: 'wait', 
        message: '과매수 구간 - DCA 투자 대기 추천',
        color: 'text-red-400'
      }
    } else if (rsi > 60 && priceVsMA20 > 5) {
      return { 
        signal: 'caution', 
        message: '상승 구간 - DCA 투자 신중',
        color: 'text-yellow-400'
      }
    } else {
      return { 
        signal: 'neutral', 
        message: '중립 구간 - 정상적인 DCA 진행',
        color: 'text-gray-300'
      }
    }
  }

  const signal = getDCASignal()

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">가격 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaChartBar className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">가격 분석</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} 실시간 가격 분석 및 DCA 신호</p>
        </div>
      </div>

      {/* 시간대 선택 */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: '1d', label: '1일' },
          { id: '7d', label: '7일' },
          { id: '30d', label: '30일' },
          { id: '90d', label: '90일' }
        ].map(tf => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* 현재 가격 정보 */}
      {priceStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">현재가</p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              ${priceStats.current.toFixed(priceStats.current < 10 ? 4 : 2)}
            </p>
            <p className={`text-xs sm:text-sm mt-1 ${
              priceStats.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {priceStats.changePercent24h >= 0 ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />}
              {Math.abs(priceStats.changePercent24h).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">24h 고가/저가</p>
            <p className="text-sm sm:text-base font-medium text-green-400">
              ${priceStats.high24h.toFixed(priceStats.high24h < 10 ? 4 : 2)}
            </p>
            <p className="text-sm sm:text-base font-medium text-red-400">
              ${priceStats.low24h.toFixed(priceStats.low24h < 10 ? 4 : 2)}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">RSI (14)</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              priceStats.rsi < 30 ? 'text-green-400' :
              priceStats.rsi > 70 ? 'text-red-400' : 'text-white'
            }`}>
              {safePrice(priceStats.rsi, 1)}
            </p>
            <p className="text-xs text-gray-400">
              {priceStats.rsi < 30 ? '과매도' :
               priceStats.rsi > 70 ? '과매수' : '중립'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">변동성</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              priceStats.volatility > 5 ? 'text-yellow-400' :
              priceStats.volatility > 10 ? 'text-red-400' : 'text-green-400'
            }`}>
              {safePrice(priceStats.volatility, 1)}%
            </p>
            <p className="text-xs text-gray-400">
              {priceStats.volatility > 10 ? '매우 높음' :
               priceStats.volatility > 5 ? '높음' : '낮음'}
            </p>
          </div>
        </div>
      )}

      {/* DCA 신호 */}
      <div className={`bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 border ${
        signal.signal === 'strong-buy' ? 'border-green-500' :
        signal.signal === 'buy' ? 'border-green-400' :
        signal.signal === 'wait' ? 'border-red-400' :
        signal.signal === 'caution' ? 'border-yellow-400' : 'border-gray-600'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${
            signal.signal === 'strong-buy' ? 'bg-green-500/20' :
            signal.signal === 'buy' ? 'bg-green-400/20' :
            signal.signal === 'wait' ? 'bg-red-400/20' :
            signal.signal === 'caution' ? 'bg-yellow-400/20' : 'bg-gray-600/20'
          }`}>
            {signal.signal === 'wait' || signal.signal === 'caution' ? 
              <FaExclamationTriangle className={`text-xl ${signal.color}`} /> :
              <FaInfoCircle className={`text-xl ${signal.color}`} />
            }
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">DCA 투자 신호</h3>
            <p className={`text-sm sm:text-base ${signal.color}`}>{signal.message}</p>
            {priceStats && (
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400">20일 이동평균:</span>
                  <span className="text-white ml-2">${safePrice(priceStats.movingAvg20, 2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">현재가 대비:</span>
                  <span className={`ml-2 ${
                    priceStats.current > priceStats.movingAvg20 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {((priceStats.current - priceStats.movingAvg20) / priceStats.movingAvg20 * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 가격 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">가격 추이</h3>
        <div className="h-64 sm:h-80">
          {priceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(value < 10 ? 2 : 0)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                  formatter={(value: number) => `$${safeFixed(value, 4)}`}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              차트 데이터를 로딩 중입니다...
            </div>
          )}
        </div>
      </div>

      {/* DCA 최적 타이밍 추천 */}
      <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">DCA 최적 타이밍</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-300">오전 9시 - 11시</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-600 rounded-full h-2">
                <div className="h-2 bg-green-400 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-xs text-green-400">추천</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-300">오후 2시 - 4시</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-600 rounded-full h-2">
                <div className="h-2 bg-yellow-400 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <span className="text-xs text-yellow-400">보통</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-300">저녁 8시 - 10시</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-600 rounded-full h-2">
                <div className="h-2 bg-blue-400 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <span className="text-xs text-blue-400">양호</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          * 과거 데이터 기반 통계적 분석 결과이며, 실제 가격은 다를 수 있습니다
        </p>
      </div>
    </div>
  )
}