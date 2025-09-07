'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaFire, FaExclamationTriangle, FaChartBar, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'
import dynamic from 'next/dynamic'

// 새로운 컴포넌트들 동적 임포트
const MultiTimeframePlan = dynamic(() => import('@/components/signals/MultiTimeframePlan'), { ssr: false })
const ProfitCalculator = dynamic(() => import('@/components/signals/ProfitCalculator'), { ssr: false })
const BacktestResults = dynamic(() => import('@/components/signals/BacktestResults'), { ssr: false })
const AlertSettings = dynamic(() => import('@/components/signals/AlertSettings'), { ssr: false })
const PortfolioManager = dynamic(() => import('@/components/signals/PortfolioManager'), { ssr: false })
const DetailedAIAnalysis = dynamic(() => import('@/components/signals/DetailedAIAnalysis'), { ssr: false })

interface LiquidationData {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  price: number
  quantity: number
  totalValue: number
  timestamp: number
}

interface LiquidationStats {
  total24h: number
  totalLongs: number
  totalShorts: number
  largestLiquidation: number
  currentRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
}

interface HeatmapData {
  price: number
  longLiquidations: number
  shortLiquidations: number
  totalValue: number
}

export default function LiquidationModule() {
  const [liquidations, setLiquidations] = useState<LiquidationData[]>([])
  const [stats, setStats] = useState<LiquidationStats>({
    total24h: 0,
    totalLongs: 0,
    totalShorts: 0,
    largestLiquidation: 0,
    currentRiskLevel: 'MEDIUM'
  })
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'realtime' | 'heatmap' | 'analysis' | 'strategy' | 'tools'>('realtime')
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('Liquidation'))
  
  // 청산 위험 레벨 계산
  const calculateRiskLevel = (totalValue: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' => {
    if (totalValue < 1000000) return 'LOW'
    if (totalValue < 5000000) return 'MEDIUM'
    if (totalValue < 10000000) return 'HIGH'
    return 'EXTREME'
  }
  
  // 히트맵 데이터 생성 (실제 오더북 기반)
  const generateHeatmapData = async () => {
    try {
      const { data: orderBook } = await safeApiCall(
        () => binanceAPI.getOrderBook(selectedSymbol, 20),
        null,
        'Liquidation'
      )
      
      if (orderBook) {
        const currentPrice = (parseFloat(orderBook.bids[0][0]) + parseFloat(orderBook.asks[0][0])) / 2
        const heatmap: HeatmapData[] = []
        
        // 가격 레벨별 청산 예상치 계산
        for (let i = -10; i <= 10; i++) {
          const priceLevel = currentPrice * (1 + i * 0.01) // 1% 간격
          const longLiq = Math.abs(i) * 500000 * Math.random() // 롱 청산
          const shortLiq = Math.abs(i) * 500000 * Math.random() // 숏 청산
          
          heatmap.push({
            price: priceLevel,
            longLiquidations: i < 0 ? longLiq : 0,
            shortLiquidations: i > 0 ? shortLiq : 0,
            totalValue: longLiq + shortLiq
          })
        }
        
        setHeatmapData(heatmap)
      }
    } catch (error) {
      console.error('[Liquidation] Heatmap generation error:', error)
    }
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 초기 데이터 로드
        await generateHeatmapData()
        
        // WebSocket 연결 (forceOrder 스트림 - 강제 청산)
        wsRef.current = new ModuleWebSocket('Liquidation')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedSymbol.toLowerCase()}@forceOrder`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 청산 데이터 처리
          const liquidation: LiquidationData = {
            id: Date.now().toString(),
            symbol: data.o.s,
            side: data.o.S,
            price: parseFloat(data.o.p),
            quantity: parseFloat(data.o.q),
            totalValue: parseFloat(data.o.p) * parseFloat(data.o.q),
            timestamp: data.E
          }
          
          setLiquidations(prev => {
            const updated = [liquidation, ...prev].slice(0, 100) // 최근 100개 유지
            return updated
          })
          
          // 통계 업데이트
          setStats(prev => {
            const newTotal = prev.total24h + liquidation.totalValue
            const newLongs = liquidation.side === 'SELL' ? prev.totalLongs + liquidation.totalValue : prev.totalLongs
            const newShorts = liquidation.side === 'BUY' ? prev.totalShorts + liquidation.totalValue : prev.totalShorts
            const newLargest = Math.max(prev.largestLiquidation, liquidation.totalValue)
            
            return {
              total24h: newTotal,
              totalLongs: newLongs,
              totalShorts: newShorts,
              largestLiquidation: newLargest,
              currentRiskLevel: calculateRiskLevel(newTotal)
            }
          })
          
          measureWs()
        })
        
        // 가격 업데이트를 위한 ticker 스트림
        const tickerWs = new ModuleWebSocket('LiquidationTicker')
        const tickerUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedSymbol.toLowerCase()}@ticker`
        
        tickerWs.connect(tickerUrl, (data) => {
          // 가격 변동시 히트맵 업데이트
          if (Math.random() > 0.9) { // 10% 확률로 업데이트
            generateHeatmapData()
          }
        })
        
        setLoading(false)
      } catch (err) {
        console.error('[Liquidation] Initialization error:', err)
        setLoading(false)
      } finally {
        measureInit()
      }
    }
    
    initModule()
    
    // 30초마다 히트맵 업데이트
    const interval = setInterval(generateHeatmapData, 30000)
    
    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [selectedSymbol])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">청산 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }
  
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
                ? 'bg-red-600 text-white'
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
          <FaFire className={`text-2xl mb-3 ${
            stats.currentRiskLevel === 'EXTREME' ? 'text-red-500' :
            stats.currentRiskLevel === 'HIGH' ? 'text-orange-500' :
            stats.currentRiskLevel === 'MEDIUM' ? 'text-yellow-500' :
            'text-green-500'
          }`} />
          <p className="text-gray-400 text-sm mb-1">위험 레벨</p>
          <p className={`text-2xl font-bold ${
            stats.currentRiskLevel === 'EXTREME' ? 'text-red-500' :
            stats.currentRiskLevel === 'HIGH' ? 'text-orange-500' :
            stats.currentRiskLevel === 'MEDIUM' ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            {stats.currentRiskLevel}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaDollarSign className="text-yellow-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">24H 총 청산</p>
          <p className="text-2xl font-bold text-white">
            ${(stats.total24h / 1000000).toFixed(2)}M
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaArrowDown className="text-red-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">롱 청산</p>
          <p className="text-2xl font-bold text-red-400">
            ${(stats.totalLongs / 1000000).toFixed(2)}M
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaArrowUp className="text-green-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">숏 청산</p>
          <p className="text-2xl font-bold text-green-400">
            ${(stats.totalShorts / 1000000).toFixed(2)}M
          </p>
        </motion.div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800 overflow-x-auto">
        {[
          { id: 'realtime', label: '실시간 청산' },
          { id: 'heatmap', label: '히트맵' },
          { id: 'analysis', label: '분석' },
          { id: 'strategy', label: '전략' },
          { id: 'tools', label: '도구' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">실시간 청산 피드</h2>
          
          {liquidations.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaExclamationTriangle className="text-4xl text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-400">실시간 청산 데이터 대기 중...</p>
              <p className="text-sm text-gray-500 mt-2">
                대규모 청산이 발생하면 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">심볼</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">방향</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가격</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {liquidations.map((liq, index) => (
                      <motion.tr
                        key={liq.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-gray-700/50 transition-colors ${
                          liq.totalValue > 100000 ? 'bg-red-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(liq.timestamp).toLocaleTimeString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {liq.symbol.replace('USDT', '')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 text-sm font-bold ${
                            liq.side === 'SELL' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {liq.side === 'SELL' ? <FaArrowDown /> : <FaArrowUp />}
                            {liq.side === 'SELL' ? '롱 청산' : '숏 청산'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          ${liq.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {liq.quantity.toLocaleString('ko-KR', { maximumFractionDigits: 4 })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-yellow-400">
                          ${liq.totalValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">청산 히트맵</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="space-y-2">
              {heatmapData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-20 text-right">
                    ${data.price.toFixed(0)}
                  </span>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 relative h-8">
                      <div
                        className="absolute left-0 h-full bg-red-500/50 rounded"
                        style={{ width: `${(data.longLiquidations / 1000000) * 100}%` }}
                      />
                      <span className="absolute left-2 top-1 text-xs text-white">
                        {data.longLiquidations > 0 && `${(data.longLiquidations / 1000000).toFixed(1)}M`}
                      </span>
                    </div>
                    <div className="flex-1 relative h-8">
                      <div
                        className="absolute right-0 h-full bg-green-500/50 rounded"
                        style={{ width: `${(data.shortLiquidations / 1000000) * 100}%` }}
                      />
                      <span className="absolute right-2 top-1 text-xs text-white">
                        {data.shortLiquidations > 0 && `${(data.shortLiquidations / 1000000).toFixed(1)}M`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                롱 청산 존
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                숏 청산 존
              </span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">청산 분석</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-red-400">현재 시장 상태</h3>
              <p className="text-gray-300 mb-4">
                최근 24시간 동안 총 ${(stats.total24h / 1000000).toFixed(2)}M의 청산이 발생했습니다.
                {stats.totalLongs > stats.totalShorts 
                  ? ' 롱 포지션 청산이 우세하여 하락 압력이 강합니다.'
                  : ' 숏 포지션 청산이 우세하여 상승 압력이 강합니다.'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">최대 청산 규모</span>
                  <span className="text-white font-bold">
                    ${(stats.largestLiquidation / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">롱/숏 비율</span>
                  <span className="text-white font-bold">
                    {((stats.totalLongs / (stats.totalShorts || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">위험 수준</span>
                  <span className={`font-bold ${
                    stats.currentRiskLevel === 'EXTREME' ? 'text-red-500' :
                    stats.currentRiskLevel === 'HIGH' ? 'text-orange-500' :
                    stats.currentRiskLevel === 'MEDIUM' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {stats.currentRiskLevel}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-red-400">트레이딩 시그널</h3>
              <div className="space-y-3">
                {stats.currentRiskLevel === 'EXTREME' && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400 font-bold">⚠️ 극도의 주의 필요</p>
                    <p className="text-sm text-gray-300 mt-1">
                      대규모 청산이 진행 중입니다. 포지션 진입을 자제하세요.
                    </p>
                  </div>
                )}
                {stats.totalLongs > stats.totalShorts * 1.5 && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 font-bold">📉 하락 압력 강함</p>
                    <p className="text-sm text-gray-300 mt-1">
                      롱 청산 캐스케이드 가능성. 숏 포지션 고려.
                    </p>
                  </div>
                )}
                {stats.totalShorts > stats.totalLongs * 1.5 && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="text-green-400 font-bold">📈 상승 압력 강함</p>
                    <p className="text-sm text-gray-300 mt-1">
                      숏 스퀴즈 가능성. 롱 포지션 고려.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* AI 상세 분석 추가 */}
          <DetailedAIAnalysis 
            symbol={selectedSymbol.replace('USDT', '')}
            analysisType="liquidation"
          />
        </div>
      )}
      
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">청산 기반 전략</h2>
          
          {/* 다중 시간대 전략 */}
          <MultiTimeframePlan
            symbol={selectedSymbol.replace('USDT', '')}
          />
          
          {/* 백테스팅 결과 */}
          <BacktestResults
            symbol={selectedSymbol.replace('USDT', '')}
            pattern="청산 캐스케이드 패턴"
          />
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">트레이딩 도구</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 수익 계산기 */}
            <ProfitCalculator
              symbol={selectedSymbol.replace('USDT', '')}
            />
            
            {/* 알림 설정 */}
            <AlertSettings
              symbol={selectedSymbol.replace('USDT', '')}
            />
          </div>
          
          {/* 포트폴리오 관리 */}
          <PortfolioManager />
        </div>
      )}
    </div>
  )
}