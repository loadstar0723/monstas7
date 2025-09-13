'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface SpreadAnalysisProps {
  pair: { coin1: string; coin2: string }
  timeframe: string
  strategy: string
}

export default function SpreadAnalysis({ pair, timeframe, strategy }: SpreadAnalysisProps) {
  const [spreadData, setSpreadData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [zScore, setZScore] = useState(0)
  const [mean, setMean] = useState(0)
  const [stdDev, setStdDev] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // 초기 샘플 데이터 설정 (API 호출 전 빠른 렌더링용)
    const generateInitialData = () => {
      const now = Date.now()
      const initialData = []
      const baseSpread = pair.coin1 === 'BTCUSDT' ? 28 : 1.5
      
      for (let i = 0; i < 50; i++) {
        const time = new Date(now - (50 - i) * 60000).toLocaleTimeString()
        const spread = baseSpread + (Math.sin(i / 10) * 0.1) + ((((Date.now() % 1000) / 1000) * 0.05 - 0.025))
        initialData.push({
          time,
          spread: spread,
          price1: spread * 3500,
          price2: 3500,
          ratio: spread
        })
      }
      
      return initialData
    }

    // 즉시 초기 데이터 설정
    const initialData = generateInitialData()
    setSpreadData(initialData)
    
    const spreadValues = initialData.map(s => s.spread)
    const initialMean = spreadValues.reduce((a, b) => a + b, 0) / spreadValues.length
    const initialStdDev = Math.sqrt(
      spreadValues.reduce((sq, n) => sq + Math.pow(n - initialMean, 2), 0) / spreadValues.length
    )
    
    setMean(initialMean)
    setStdDev(initialStdDev)
    setZScore((spreadValues[spreadValues.length - 1] - initialMean) / initialStdDev)
    setLoading(false)

    const fetchSpreadData = async () => {
      try {
        // 두 코인의 과거 가격 데이터 가져오기
        const [response1, response2] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${pair.coin1}&interval=${timeframe}&limit=100`),
          fetch(`/api/binance/klines?symbol=${pair.coin2}&interval=${timeframe}&limit=100`)
        ])

        const data1 = await response1.json()
        const data2 = await response2.json()

        if (data1.data && data2.data && data1.data.length > 0 && data2.data.length > 0) {
          // 스프레드 계산
          const spreads = data1.data.map((kline1: any[], index: number) => {
            const kline2 = data2.data[index]
            if (!kline2) return null

            const price1 = parseFloat(kline1[4]) // 종가
            const price2 = parseFloat(kline2[4])
            const spread = price2 > 0 ? price1 / price2 : 0
            const time = new Date(kline1[0]).toLocaleTimeString()

            return {
              time,
              spread,
              price1,
              price2,
              ratio: spread
            }
          }).filter(Boolean)

          if (spreads.length > 0) {
            // 평균과 표준편차 계산
            const spreadValues = spreads.map(s => s.spread)
            const calculatedMean = spreadValues.reduce((a, b) => a + b, 0) / spreadValues.length
            const calculatedStdDev = Math.sqrt(
              spreadValues.reduce((sq, n) => sq + Math.pow(n - calculatedMean, 2), 0) / spreadValues.length
            )

            // Z-Score 계산
            const latestSpread = spreadValues[spreadValues.length - 1]
            const calculatedZScore = calculatedStdDev > 0 ? (latestSpread - calculatedMean) / calculatedStdDev : 0

            setMean(calculatedMean)
            setStdDev(calculatedStdDev)
            setZScore(calculatedZScore)
            setSpreadData(spreads)
          }
        }
      } catch (error) {
        console.error('스프레드 데이터 로드 실패:', error)
        // 에러 시에도 기존 데이터 유지
      }
    }

    // API 호출
    fetchSpreadData()
    const interval = setInterval(fetchSpreadData, 10000) // 10초마다 업데이트
    
    return () => clearInterval(interval)

    // WebSocket으로 실시간 업데이트
    if (typeof window !== 'undefined') {
      const connectWebSocket = () => {
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${pair.coin1.toLowerCase()}@ticker/${pair.coin2.toLowerCase()}@ticker`)
        
        let price1Current = 0
        let price2Current = 0
        
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          if (message.stream && message.data) {
            const ticker = message.data
            
            if (message.stream.includes(pair.coin1.toLowerCase())) {
              price1Current = parseFloat(ticker.c)
            } else if (message.stream.includes(pair.coin2.toLowerCase())) {
              price2Current = parseFloat(ticker.c)
            }
            
            // 두 가격이 모두 있으면 스프레드 업데이트
            if (price1Current > 0 && price2Current > 0) {
              const newSpread = price1Current / price2Current
              const newZScore = (newSpread - mean) / stdDev
              
              setZScore(newZScore)
              
              // 차트 데이터에 추가
              setSpreadData(prev => {
                const newData = [...prev]
                if (newData.length > 100) newData.shift()
                newData.push({
                  time: new Date().toLocaleTimeString(),
                  spread: newSpread,
                  price1: price1Current,
                  price2: price2Current,
                  ratio: newSpread
                })
                return newData
              })
            }
          }
        }

        ws.onerror = () => {
          setTimeout(connectWebSocket, 5000) // 5초 후 재연결
        }

        wsRef.current = ws
      }

      connectWebSocket()

      return () => {
        if (wsRef.current) {
          wsRef.current.close()
        }
      }
    }
  }, [pair, timeframe])

  const getZScoreColor = (z: number) => {
    if (Math.abs(z) > 3) return 'text-red-500'
    if (Math.abs(z) > 2) return 'text-yellow-500'
    if (Math.abs(z) > 1) return 'text-blue-500'
    return 'text-green-500'
  }

  const getSignalStatus = () => {
    if (strategy === 'mean-reversion') {
      if (zScore > 2) return { signal: 'SHORT', color: 'text-red-400', desc: '매도 신호 (과매수)' }
      if (zScore < -2) return { signal: 'LONG', color: 'text-green-400', desc: '매수 신호 (과매도)' }
      if (Math.abs(zScore) < 0.5) return { signal: 'CLOSE', color: 'text-yellow-400', desc: '청산 신호' }
    }
    return { signal: 'WAIT', color: 'text-gray-400', desc: '대기 중' }
  }

  const signal = getSignalStatus()

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">📈</span>
          스프레드 분석
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-400">Z-Score: </span>
            <span className={`font-bold ${getZScoreColor(zScore)}`}>
              {safeFixed(zScore, 3)}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${signal.color} bg-gray-800`}>
            {signal.signal}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* 스프레드 차트 */}
          {spreadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spreadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                
                {/* 평균선 */}
                <ReferenceLine y={mean} stroke="#10B981" strokeDasharray="5 5" />
                {/* +2 표준편차 */}
                <ReferenceLine y={mean + 2 * stdDev} stroke="#F59E0B" strokeDasharray="3 3" />
                {/* -2 표준편차 */}
                <ReferenceLine y={mean - 2 * stdDev} stroke="#F59E0B" strokeDasharray="3 3" />
                {/* +3 표준편차 */}
                <ReferenceLine y={mean + 3 * stdDev} stroke="#EF4444" strokeDasharray="3 3" />
                {/* -3 표준편차 */}
                <ReferenceLine y={mean - 3 * stdDev} stroke="#EF4444" strokeDasharray="3 3" />
                
                <Line 
                  type="monotone" 
                  dataKey="spread" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                  name="스프레드"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              데이터를 불러오는 중...
            </div>
          )}

          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">평균 (μ)</div>
              <div className="text-lg font-bold text-white">{safeFixed(mean, 4)}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">표준편차 (σ)</div>
              <div className="text-lg font-bold text-white">{safeFixed(stdDev, 4)}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">현재 스프레드</div>
              <div className="text-lg font-bold text-white">
                {spreadData.length > 0 ? spreadData[spreadData.length - 1].spread?.toFixed(4) || '0.0000' : '0.0000'}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">신호 상태</div>
              <div className={`text-lg font-bold ${signal.color}`}>{signal.desc}</div>
            </motion.div>
          </div>

          {/* 트레이딩 구간 표시 */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-yellow-400 mb-3">트레이딩 구간</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">극단 매도 구간 (Z {'>'} 3)</span>
                <span className="text-red-500 font-bold">{(mean + 3 * stdDev).toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">매도 진입 구간 (Z {'>'} 2)</span>
                <span className="text-orange-500 font-bold">{(mean + 2 * stdDev).toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">중립 구간 (-1 {'<'} Z {'<'} 1)</span>
                <span className="text-green-500 font-bold">{safeFixed(mean, 4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">매수 진입 구간 (Z {'<'} -2)</span>
                <span className="text-blue-500 font-bold">{(mean - 2 * stdDev).toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">극단 매수 구간 (Z {'<'} -3)</span>
                <span className="text-purple-500 font-bold">{(mean - 3 * stdDev).toFixed(4)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}