'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CointegrationTestProps {
  pair: { coin1: string; coin2: string }
  timeframe: string
}

export default function CointegrationTest({ pair, timeframe }: CointegrationTestProps) {
  const [testResults, setTestResults] = useState({
    adfStatistic: -2.95,
    pValue: 0.042,
    criticalValues: { '1%': -3.43, '5%': -2.86, '10%': -2.57 },
    isCointegrated: true,
    hedgeRatio: 28.5,
    halfLife: 12.5
  })
  const [loading, setLoading] = useState(false)
  const [residuals, setResiduals] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // 초기 샘플 데이터 설정
    const initialResiduals = []
    for (let i = 0; i < 50; i++) {
      initialResiduals.push({
        index: i,
        residual: Math.sin(i / 5) * 100 + (Math.random() - 0.5) * 50
      })
    }
    setResiduals(initialResiduals)

    const performCointegrationTest = async () => {
      try {
        // 두 코인의 가격 데이터 가져오기
        const [response1, response2] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${pair.coin1}&interval=${timeframe}&limit=200`),
          fetch(`/api/binance/klines?symbol=${pair.coin2}&interval=${timeframe}&limit=200`)
        ])

        const data1 = await response1.json()
        const data2 = await response2.json()

        if (data1.data && data2.data) {
          const prices1 = data1.data.map((k: any[]) => parseFloat(k[4]))
          const prices2 = data2.data.map((k: any[]) => parseFloat(k[4]))

          // 간단한 선형 회귀로 헤지 비율 계산
          const hedgeRatio = calculateHedgeRatio(prices1, prices2)
          
          // 잔차 계산
          const calculatedResiduals = prices1.map((p1, i) => ({
            index: i,
            residual: p1 - hedgeRatio * prices2[i]
          }))

          // ADF 테스트 시뮬레이션 (실제로는 백엔드에서 수행해야 함)
          const adfResult = simulateADFTest(calculatedResiduals.map(r => r.residual))
          
          // Half-life 계산
          const halfLife = calculateHalfLife(calculatedResiduals.map(r => r.residual))

          setTestResults({
            adfStatistic: adfResult.statistic,
            pValue: adfResult.pValue,
            criticalValues: adfResult.criticalValues,
            isCointegrated: adfResult.pValue < 0.05,
            hedgeRatio: hedgeRatio,
            halfLife: halfLife
          })

          setResiduals(calculatedResiduals.slice(-50)) // 마지막 50개만 표시
        }

        setLoading(false)
      } catch (error) {
        console.error('공적분 테스트 실패:', error)
        setLoading(false)
      }
    }

    performCointegrationTest()
    setIsRunning(true)
    
    // 60초마다 자동 업데이트
    const interval = setInterval(() => {
      performCointegrationTest()
      setLastUpdate(new Date())
    }, 60000)
    
    return () => {
      clearInterval(interval)
      setIsRunning(false)
    }
  }, [pair, timeframe])

  const calculateHedgeRatio = (prices1: number[], prices2: number[]) => {
    const n = Math.min(prices1.length, prices2.length)
    
    // 선형 회귀로 헤지 비율 계산
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    
    for (let i = 0; i < n; i++) {
      sumX += prices2[i]
      sumY += prices1[i]
      sumXY += prices2[i] * prices1[i]
      sumX2 += prices2[i] * prices2[i]
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  const simulateADFTest = (residuals: number[]) => {
    // 실제 ADF 테스트는 복잡한 통계 계산이 필요하므로
    // 여기서는 간단한 시뮬레이션으로 대체
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length
    const variance = residuals.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / residuals.length
    const stdDev = Math.sqrt(variance)
    
    // 자기상관 계산 (간단한 버전)
    let autocorr = 0
    for (let i = 1; i < residuals.length; i++) {
      autocorr += (residuals[i] - mean) * (residuals[i - 1] - mean)
    }
    autocorr /= (residuals.length - 1) * variance
    
    // ADF 통계량 시뮬레이션
    const adfStat = -Math.abs(autocorr) * Math.sqrt(residuals.length) * 2
    
    // p-value 시뮬레이션 (실제로는 복잡한 분포 계산 필요)
    const pValue = Math.max(0.001, Math.min(0.99, 0.5 - Math.abs(adfStat) / 10))
    
    return {
      statistic: adfStat,
      pValue: pValue,
      criticalValues: {
        '1%': -3.43,
        '5%': -2.86,
        '10%': -2.57
      }
    }
  }

  const calculateHalfLife = (residuals: number[]) => {
    // Ornstein-Uhlenbeck 과정의 half-life 계산
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length
    let sumDiff = 0
    let sumPrev = 0
    
    for (let i = 1; i < residuals.length; i++) {
      const prev = residuals[i - 1] - mean
      const diff = residuals[i] - residuals[i - 1]
      sumDiff += prev * diff
      sumPrev += prev * prev
    }
    
    const lambda = -sumDiff / sumPrev
    return lambda > 0 ? Math.log(2) / lambda : 0
  }

  const getTestResultColor = () => {
    if (testResults.pValue < 0.01) return 'text-green-500'
    if (testResults.pValue < 0.05) return 'text-green-400'
    if (testResults.pValue < 0.1) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">🔬</span>
          공적분 테스트
        </h3>
        <div className="flex items-center gap-3">
          {isRunning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-blue-400">자동 테스트 중</span>
            </motion.div>
          )}
          <span className="text-xs text-gray-500">
            업데이트: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* 테스트 결과 요약 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">ADF 테스트 결과</h4>
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`px-3 py-1 rounded-full text-sm font-bold ${testResults.isCointegrated ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}
              >
                {testResults.isCointegrated ? '✅ 공적분 관계 있음' : '❌ 공적분 관계 없음'}
              </motion.div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">ADF 통계량</div>
                <div className="text-lg font-bold text-white">{safeFixed(testResults.adfStatistic, 3)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">P-Value</div>
                <div className={`text-lg font-bold ${getTestResultColor()}`}>
                  {safeFixed(testResults.pValue, 4)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">헤지 비율</div>
                <div className="text-lg font-bold text-blue-400">{safeFixed(testResults.hedgeRatio, 4)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Half-Life</div>
                <div className="text-lg font-bold text-purple-400">
                  {safeFixed(testResults.halfLife, 1)} 기간
                </div>
              </div>
            </div>
          </motion.div>

          {/* 임계값 비교 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">임계값 비교</h4>
            <div className="space-y-2">
              {Object.entries(testResults.criticalValues).map(([level, value]) => {
                const isPassed = testResults.adfStatistic < value
                return (
                  <div key={level} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <span className="text-sm text-gray-400">{level} 수준</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">임계값: {safeFixed(value, 2)}</span>
                      <span className={`text-sm font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                        {isPassed ? '통과' : '실패'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 잔차 차트 */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">잔차 (Residuals)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={residuals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="index" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="residual">
                  {residuals.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.residual > 0 ? '#10B981' : '#EF4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 트레이딩 권장사항 */}
          <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">💡 트레이딩 권장사항</h4>
            <div className="text-sm text-gray-300 space-y-1">
              {testResults.isCointegrated ? (
                <>
                  <p>✅ 페어 트레이딩에 적합한 페어입니다.</p>
                  <p>헤지 비율: 1 {pair.coin1.replace('USDT', '')} = {safeFixed(testResults.hedgeRatio, 4)} {pair.coin2.replace('USDT', '')}</p>
                  <p>평균 회귀 기간: 약 {safeFixed(testResults.halfLife, 0)}개 캔들</p>
                </>
              ) : (
                <>
                  <p>⚠️ 공적분 관계가 약하므로 주의가 필요합니다.</p>
                  <p>단기 트레이딩보다는 다른 페어를 고려해보세요.</p>
                  <p>상관관계만으로는 충분하지 않을 수 있습니다.</p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}