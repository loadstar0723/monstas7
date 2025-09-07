'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/LoadingSpinner'
import { config } from '@/lib/config'

// 동적 임포트로 차트 컴포넌트 로드
const AdvancedCandlestickChart = dynamic(
  () => import('@/components/charts/AdvancedCandlestickChart'),
  { 
    loading: () => <LoadingSpinner size="lg" text="차트 로딩 중..." />,
    ssr: false 
  }
)

const RealtimeLineChart = dynamic(
  () => import('@/components/charts/RealtimeLineChart'),
  { 
    loading: () => <LoadingSpinner size="md" text="로딩 중..." />,
    ssr: false 
  }
)

const MarketDepthChart = dynamic(
  () => import('@/components/charts/MarketDepthChart'),
  { 
    loading: () => <LoadingSpinner size="md" text="로딩 중..." />,
    ssr: false 
  }
)

const symbols = [
  { value: 'BTCUSDT', label: 'BTC/USDT', color: '#F7931A' },
  { value: 'ETHUSDT', label: 'ETH/USDT', color: '#627EEA' },
  { value: 'BNBUSDT', label: 'BNB/USDT', color: '#F3BA2F' },
  { value: 'SOLUSDT', label: 'SOL/USDT', color: '#14F195' },
  { value: 'XRPUSDT', label: 'XRP/USDT', color: '#23292F' },
]

const intervals = [
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
  { value: '15m', label: '15분' },
  { value: '1h', label: '1시간' },
  { value: '4h', label: '4시간' },
  { value: '1d', label: '1일' },
]

export default function AdvancedChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [selectedInterval, setSelectedInterval] = useState('1h')
  
  const currentSymbolData = symbols.find(s => s.value === selectedSymbol)

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          고급 차트 분석
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          실시간 시장 데이터와 기술적 분석 도구
        </p>
      </motion.div>

      {/* 심볼 & 인터벌 선택 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: config.decimals.value1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 심볼 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              암호화폐 선택
            </label>
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol.value}
                  onClick={() => setSelectedSymbol(symbol.value)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    selectedSymbol === symbol.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {symbol.label}
                </button>
              ))}
            </div>
          </div>

          {/* 인터벌 선택 */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              시간 간격
            </label>
            <div className="grid grid-cols-3 gap-2">
              {intervals.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => setSelectedInterval(interval.value)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    selectedInterval === interval.value
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 메인 캔들스틱 차트 */}
      <motion.div
        initial={{ opacity: 0, scale: config.decimals.value95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: config.decimals.value2 }}
        className="mb-6"
      >
        <AdvancedCandlestickChart 
          symbol={selectedSymbol} 
          interval={selectedInterval}
          height={500}
        />
      </motion.div>

      {/* 보조 차트들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: config.decimals.value3 }}
        >
          <RealtimeLineChart
            symbol={selectedSymbol}
            title="실시간 가격 추이"
            color={currentSymbolData?.color || '#8B5CF6'}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: config.decimals.value4 }}
        >
          <MarketDepthChart symbol={selectedSymbol} />
        </motion.div>
      </div>

      {/* 추가 정보 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: config.decimals.value5 }}
        className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white"
      >
        <h3 className="text-lg font-bold mb-2">💡 차트 활용 팁</h3>
        <ul className="space-y-2 text-sm">
          <li>• 캔들스틱 차트에서 마우스 휠로 확대/축소가 가능합니다</li>
          <li>• 전체화면 버튼을 클릭하여 더 큰 화면에서 분석할 수 있습니다</li>
          <li>• 시장 깊이 차트로 매수/매도 압력을 파악할 수 있습니다</li>
          <li>• 모든 차트는 실시간으로 업데이트됩니다</li>
        </ul>
      </motion.div>
    </div>
  )
}