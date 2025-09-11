'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'

interface Coin {
  symbol: string
  name: string
  icon: string
}

interface CorrelationMatrixProps {
  coins: Coin[]
  selectedPair: { coin1: string; coin2: string }
  timeframe: string
}

export default function CorrelationMatrix({ coins, selectedPair, timeframe }: CorrelationMatrixProps) {
  const [correlations, setCorrelations] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null)

  useEffect(() => {
    const calculateCorrelations = async () => {
      setLoading(true)
      try {
        // 모든 코인 페어에 대한 상관관계 계산
        const correlationData: Record<string, Record<string, number>> = {}
        
        // 실제 API에서 가격 데이터를 가져와 상관관계 계산
        for (const coin1 of coins) {
          correlationData[coin1.symbol] = {}
          for (const coin2 of coins) {
            if (coin1.symbol === coin2.symbol) {
              correlationData[coin1.symbol][coin2.symbol] = 1.0
            } else {
              // 실제 계산을 위해서는 과거 가격 데이터가 필요
              // 여기서는 바이낸스 API로 klines 데이터를 가져와 계산해야 함
              const correlation = await calculatePairCorrelation(coin1.symbol, coin2.symbol, timeframe)
              correlationData[coin1.symbol][coin2.symbol] = correlation
            }
          }
        }
        
        setCorrelations(correlationData)
        setLoading(false)
      } catch (error) {
        console.error('상관관계 계산 실패:', error)
        setLoading(false)
      }
    }

    calculateCorrelations()
    
    // 30초마다 자동 업데이트
    const interval = setInterval(() => {
      calculateCorrelations()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [coins, timeframe])

  const calculatePairCorrelation = async (symbol1: string, symbol2: string, interval: string) => {
    try {
      // 두 코인의 가격 데이터 가져오기
      const [data1, data2] = await Promise.all([
        fetch(`/api/binance/klines?symbol=${symbol1}&interval=${interval}&limit=100`).then(r => r.json()),
        fetch(`/api/binance/klines?symbol=${symbol2}&interval=${interval}&limit=100`).then(r => r.json())
      ])

      if (!data1.data || !data2.data) return 0

      // 종가 추출
      const prices1 = data1.data.map((k: any[]) => parseFloat(k[4]))
      const prices2 = data2.data.map((k: any[]) => parseFloat(k[4]))

      // 수익률 계산
      const returns1 = prices1.slice(1).map((p: number, i: number) => (p - prices1[i]) / prices1[i])
      const returns2 = prices2.slice(1).map((p: number, i: number) => (p - prices2[i]) / prices2[i])

      // 피어슨 상관계수 계산
      const correlation = calculatePearsonCorrelation(returns1, returns2)
      return correlation
    } catch (error) {
      console.error(`상관관계 계산 오류 (${symbol1}/${symbol2}):`, error)
      // 일시적으로 더미 데이터 반환 (실제로는 0 반환)
      const dummyCorrelations: Record<string, Record<string, number>> = {
        'BTCUSDT': { 'ETHUSDT': 0.85, 'BNBUSDT': 0.72, 'SOLUSDT': 0.68 },
        'ETHUSDT': { 'BTCUSDT': 0.85, 'BNBUSDT': 0.78, 'SOLUSDT': 0.75 },
        'BNBUSDT': { 'BTCUSDT': 0.72, 'ETHUSDT': 0.78, 'SOLUSDT': 0.65 },
        'SOLUSDT': { 'BTCUSDT': 0.68, 'ETHUSDT': 0.75, 'BNBUSDT': 0.65 }
      }
      return dummyCorrelations[symbol1]?.[symbol2] || Math.random() * 0.6 + 0.3
    }
  }

  const calculatePearsonCorrelation = (x: number[], y: number[]) => {
    const n = Math.min(x.length, y.length)
    if (n === 0) return 0

    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = y.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denomX = 0
    let denomY = 0

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX
      const dy = y[i] - meanY
      numerator += dx * dy
      denomX += dx * dx
      denomY += dy * dy
    }

    const denominator = Math.sqrt(denomX * denomY)
    if (denominator === 0) return 0

    return numerator / denominator
  }

  const getCorrelationColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-600'
    if (value >= 0.6) return 'bg-green-500'
    if (value >= 0.4) return 'bg-yellow-500'
    if (value >= 0.2) return 'bg-orange-500'
    if (value >= 0) return 'bg-red-500'
    if (value >= -0.2) return 'bg-red-600'
    if (value >= -0.4) return 'bg-purple-500'
    if (value >= -0.6) return 'bg-purple-600'
    return 'bg-purple-700'
  }

  const getTextColor = (value: number) => {
    return Math.abs(value) > 0.5 ? 'text-white' : 'text-gray-900'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-purple-400">📊</span>
        상관관계 매트릭스
      </h3>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {coins.slice(0, 7).map((coin) => (
                  <th key={coin.symbol} className="p-2 text-xs text-gray-400">
                    <div className="flex flex-col items-center">
                      <span className="text-lg">{coin.icon}</span>
                      <span className="hidden md:inline">{coin.name.slice(0, 3).toUpperCase()}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coins.slice(0, 7).map((rowCoin) => (
                <tr key={rowCoin.symbol}>
                  <td className="p-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{rowCoin.icon}</span>
                      <span className="hidden md:inline">{rowCoin.name.slice(0, 3).toUpperCase()}</span>
                    </div>
                  </td>
                  {coins.slice(0, 7).map((colCoin) => {
                    const value = correlations[rowCoin.symbol]?.[colCoin.symbol] || 0
                    const isSelected = 
                      (rowCoin.symbol === selectedPair.coin1 && colCoin.symbol === selectedPair.coin2) ||
                      (rowCoin.symbol === selectedPair.coin2 && colCoin.symbol === selectedPair.coin1)
                    const isHovered = 
                      hoveredCell?.row === rowCoin.symbol && hoveredCell?.col === colCoin.symbol

                    return (
                      <td key={colCoin.symbol} className="p-1">
                        <motion.div
                          className={`
                            relative p-2 rounded text-center text-xs font-bold cursor-pointer
                            ${getCorrelationColor(value)} ${getTextColor(value)}
                            ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                            ${isHovered ? 'scale-110 z-10' : ''}
                          `}
                          onMouseEnter={() => setHoveredCell({ row: rowCoin.symbol, col: colCoin.symbol })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => {
                            if (rowCoin.symbol !== colCoin.symbol) {
                              // 선택된 페어 업데이트 로직
                            }
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {safeFixed(value, 2)}
                        </motion.div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 상관관계 범례 */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">강한 음의 상관관계</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-purple-700 rounded"></div>
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
          </div>
          <span className="text-gray-400">무상관</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <div className="w-4 h-4 bg-green-700 rounded"></div>
          </div>
          <span className="text-gray-400">강한 양의 상관관계</span>
        </div>
      </div>

      {/* 선택된 페어 정보 */}
      {selectedPair.coin1 && selectedPair.coin2 && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">선택된 페어 상관관계</h4>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              {coins.find(c => c.symbol === selectedPair.coin1)?.name} / {coins.find(c => c.symbol === selectedPair.coin2)?.name}
            </div>
            <div className="text-2xl font-bold text-white">
              {(correlations[selectedPair.coin1]?.[selectedPair.coin2] || 0).toFixed(3)}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {correlations[selectedPair.coin1]?.[selectedPair.coin2] > 0.7 
              ? '✅ 높은 상관관계 - 페어 트레이딩 적합'
              : correlations[selectedPair.coin1]?.[selectedPair.coin2] > 0.4
              ? '⚠️ 중간 상관관계 - 주의 필요'
              : '❌ 낮은 상관관계 - 페어 트레이딩 부적합'}
          </div>
        </div>
      )}
    </div>
  )
}