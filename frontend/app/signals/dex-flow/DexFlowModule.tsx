'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaEthereum, FaExchangeAlt, FaDollarSign, FaChartArea, FaArrowUp, FaArrowDown, FaWater } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'
import { config } from '@/lib/config'

// 새로운 컴포넌트들 동적 임포트
const MultiTimeframePlan = dynamic(() => import('@/components/signals/MultiTimeframePlan'), { ssr: false })
const ProfitCalculator = dynamic(() => import('@/components/signals/ProfitCalculator'), { ssr: false })
const BacktestResults = dynamic(() => import('@/components/signals/BacktestResults'), { ssr: false })
const AlertSettings = dynamic(() => import('@/components/signals/AlertSettings'), { ssr: false })
const PortfolioManager = dynamic(() => import('@/components/signals/PortfolioManager'), { ssr: false })
const DetailedAIAnalysis = dynamic(() => import('@/components/signals/DetailedAIAnalysis'), { ssr: false })
const LeverageStrategy = dynamic(() => import('@/components/signals/LeverageStrategy'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

const InvestmentStrategy = dynamic(() => import('@/components/signals/InvestmentStrategy'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

interface DexTransaction {
  id: string
  type: 'SWAP' | 'ADD_LIQUIDITY' | 'REMOVE_LIQUIDITY'
  tokenIn: string
  tokenOut: string
  amountIn: number
  amountOut: number
  value: number
  gas: number
  sender: string
  dex: string
  timestamp: Date
}

interface LiquidityPool {
  pair: string
  dex: string
  tvl: number
  volume24h: number
  apy: number
  token0Reserve: number
  token1Reserve: number
  priceImpact: number
}

interface DexStats {
  totalVolume24h: number
  totalTVL: number
  topDex: string
  activeWallets: number
  avgGasPrice: number
  topPair: string
}

export default function DexFlowModule() {
  const [transactions, setTransactions] = useState<DexTransaction[]>([])
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([])
  const [stats, setStats] = useState<DexStats>({
    totalVolume24h: 0,
    totalTVL: 0,
    topDex: 'Uniswap',
    activeWallets: 0,
    avgGasPrice: 0,
    topPair: 'ETH/USDT'
  })
  const [selectedDex, setSelectedDex] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'flow' | 'liquidity' | 'analytics' | 'strategy' | 'tools'>('flow')
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('DexFlow'))
  
  // DEX 목록
  const dexList = ['All', 'Uniswap', 'PancakeSwap', 'SushiSwap', 'Curve', '1inch']
  
  // 트랜잭션 생성 (실제로는 온체인 데이터)
  const generateDexTransactions = async () => {
    try {
      const tokens = ['ETH', 'BNB', 'MATIC', 'AVAX', 'FTM']
      const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI']
      const dexes = ['Uniswap', 'PancakeSwap', 'SushiSwap', 'Curve', '1inch']
      
      const newTransactions: DexTransaction[] = []
      
      // 실제 가격 데이터 가져오기
      for (let i = 0; i < 10; i++) {
        const tokenIn = tokens[Math.floor(Math.random() * tokens.length)]
        const tokenOut = stablecoins[Math.floor(Math.random() * stablecoins.length)]
        
        const { data: ticker } = await safeApiCall(
          () => binanceAPI.get24hrTicker(`${tokenIn}USDT`),
          null,
          'DexFlow'
        )
        
        if (ticker) {
          const price = parseFloat(ticker.lastPrice)
          const amountIn = Math.random() * 10 + 1
          const amountOut = amountIn * price * (1 - Math.random() * config.decimals.value005) // 0.${config.percentage.value5} 슬리피지
          
          newTransactions.push({
            id: `tx-${Date.now()}-${i}`,
            type: Math.random() > config.decimals.value7 ? 'SWAP' : Math.random() > config.decimals.value5 ? 'ADD_LIQUIDITY' : 'REMOVE_LIQUIDITY',
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            value: amountOut,
            gas: 20 + Math.random() * 30,
            sender: `0x${Math.random().toString(16).substr(2, 8)}...`,
            dex: dexes[Math.floor(Math.random() * dexes.length)],
            timestamp: new Date()
          })
        }
      }
      
      setTransactions(prev => [...newTransactions, ...prev].slice(0, 50))
    } catch (error) {
      console.error('[DexFlow] Transaction generation error:', error)
    }
  }
  
  // 유동성 풀 데이터 생성
  const generateLiquidityPools = async () => {
    try {
      const pairs = ['ETH/USDT', 'BNB/USDT', 'MATIC/USDT', 'ETH/USDC', 'BNB/BUSD']
      const dexes = ['Uniswap', 'PancakeSwap', 'SushiSwap', 'Curve']
      const pools: LiquidityPool[] = []
      
      for (const pair of pairs) {
        for (const dex of dexes) {
          const [token0] = pair.split('/')
          
          const { data: ticker } = await safeApiCall(
            () => binanceAPI.get24hrTicker(`${token0}USDT`),
            null,
            'DexFlow'
          )
          
          if (ticker) {
            const price = parseFloat(ticker.lastPrice)
            const volume = parseFloat(ticker.quoteVolume)
            
            pools.push({
              pair,
              dex,
              tvl: volume * (Math.random() * config.decimals.value5 + config.decimals.value5),
              volume24h: volume * config.decimals.value1,
              apy: Math.random() * 100 + 5,
              token0Reserve: Math.random() * 10000 + 1000,
              token1Reserve: Math.random() * 10000000 + 100000,
              priceImpact: Math.random() * 5
            })
          }
        }
      }
      
      setLiquidityPools(pools.sort((a, b) => b.tvl - a.tvl))
      
      // 통계 업데이트
      const totalTVL = pools.reduce((sum, p) => sum + p.tvl, 0)
      const totalVolume = pools.reduce((sum, p) => sum + p.volume24h, 0)
      
      setStats({
        totalVolume24h: totalVolume,
        totalTVL: totalTVL,
        topDex: pools[0]?.dex || 'Uniswap',
        activeWallets: Math.floor(Math.random() * 10000 + 5000),
        avgGasPrice: 20 + Math.random() * 30,
        topPair: pools[0]?.pair || 'ETH/USDT'
      })
    } catch (error) {
      console.error('[DexFlow] Liquidity pool generation error:', error)
    }
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 초기 데이터 로드
        await generateDexTransactions()
        await generateLiquidityPools()
        
        // WebSocket 연결 (가격 업데이트)
        wsRef.current = new ModuleWebSocket('DexFlow')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/!miniTicker@arr`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 가격 변동시 새로운 트랜잭션 생성
          if (Array.isArray(data) && Math.random() > config.decimals.value9) {
            generateDexTransactions()
          }
          
          measureWs()
        })
        
        // 5초마다 데이터 업데이트
        const refreshInterval = setInterval(() => {
          generateDexTransactions()
          if (Math.random() > config.decimals.value7) {
            generateLiquidityPools()
          }
        }, 5000)
        
        setLoading(false)
        
        return () => {
          clearInterval(refreshInterval)
        }
      } catch (err) {
        console.error('[DexFlow] Initialization error:', err)
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
    }
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">DEX 플로우 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  const filteredTransactions = selectedDex === 'All' 
    ? transactions 
    : transactions.filter(tx => tx.dex === selectedDex)
  
  return (
    <div className="space-y-8">
      {/* DEX 선택 */}
      <div className="flex gap-2 flex-wrap">
        {dexList.map(dex => (
          <button
            key={dex}
            onClick={() => setSelectedDex(dex)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedDex === dex
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {dex}
          </button>
        ))}
      </div>
      
      {/* 실시간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaDollarSign className="text-green-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">24H 거래량</p>
          <p className="text-2xl font-bold text-white">
            ${(stats.totalVolume24h / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">모든 DEX</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: config.decimals.value1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaWater className="text-blue-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">총 TVL</p>
          <p className="text-2xl font-bold text-white">
            ${(stats.totalTVL / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">잠긴 유동성</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: config.decimals.value2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaEthereum className="text-purple-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">가스비</p>
          <p className="text-2xl font-bold text-white">
            {stats.avgGasPrice.toFixed(0)} Gwei
          </p>
          <p className="text-xs text-gray-500 mt-1">평균 가스비</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: config.decimals.value3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaChartArea className="text-yellow-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">활성 지갑</p>
          <p className="text-2xl font-bold text-white">
            {stats.activeWallets.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">24시간</p>
        </motion.div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800">
        {[
          { id: 'flow', label: 'DEX 플로우' },
          { id: 'liquidity', label: '유동성 풀' },
          { id: 'analytics', label: '분석' },
          { id: 'strategy', label: '전략' },
          { id: 'tools', label: '도구' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">실시간 DEX 트랜잭션</h2>
          
          {filteredTransactions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">트랜잭션 대기 중...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 10).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * config.decimals.value05 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'SWAP' ? 'bg-blue-500/20' :
                        tx.type === 'ADD_LIQUIDITY' ? 'bg-green-500/20' :
                        'bg-red-500/20'
                      }`}>
                        <FaExchangeAlt className={`${
                          tx.type === 'SWAP' ? 'text-blue-400' :
                          tx.type === 'ADD_LIQUIDITY' ? 'text-green-400' :
                          'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {tx.type === 'SWAP' ? '스왑' :
                           tx.type === 'ADD_LIQUIDITY' ? '유동성 추가' :
                           '유동성 제거'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {tx.amountIn.toFixed(4)} {tx.tokenIn} → {tx.amountOut.toFixed(2)} {tx.tokenOut}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${tx.value.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{tx.dex}</p>
                      <p className="text-xs text-gray-500">Gas: {tx.gas.toFixed(0)} Gwei</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'liquidity' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">유동성 풀 현황</h2>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">풀</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">DEX</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">TVL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">24H 거래량</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">APY</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가격 영향</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {liquidityPools.slice(0, 10).map((pool, index) => (
                    <tr key={`${pool.pair}-${pool.dex}`} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {pool.pair}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {pool.dex}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        ${(pool.tvl / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        ${(pool.volume24h / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-400">
                        {pool.apy.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-400">
                        {pool.priceImpact.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">DEX 분석</h2>
          
          {/* DetailedAIAnalysis 컴포넌트 */}
          <DetailedAIAnalysis 
            symbol="DEX_FLOW"
            analysisType="dex-flow"
            data={{
              totalVolume: stats.totalVolume24h,
              totalTVL: stats.totalTVL,
              topDex: stats.topDex,
              gasPrice: stats.avgGasPrice
            }}
          />
          
          {/* 레버리지 전략 추천 */}
          <LeverageStrategy 
            symbol="DEX_FLOW"
            volatility={stats.avgGasPrice} // 가스비 기반 변동성
            trend={stats.totalTVL > 50000000 ? 'bullish' : 'neutral'}
            signalStrength={Math.min((stats.totalVolume24h / 1000000) / 10, 100)} // 거래량 기반 신호 강도
            marketCondition={stats.avgGasPrice > 50 ? 'volatile' : 'normal'}
            currentPrice={45000} // DEX 플로우는 특정 가격이 없으므로 기본값
          />
          
          {/* 투자금액별 전략 */}
          <InvestmentStrategy 
            symbol="DEX_FLOW"
            currentPrice={45000}
            signalType="dex-flow"
            marketCondition={stats.avgGasPrice > 50 ? 'volatile' : stats.totalTVL > 50000000 ? 'bullish' : 'neutral'}
            volatility={stats.avgGasPrice}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-purple-400">거래 패턴</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">주요 DEX</span>
                  <span className="text-white font-bold">{stats.topDex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">인기 페어</span>
                  <span className="text-white font-bold">{stats.topPair}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">평균 슬리피지</span>
                  <span className="text-yellow-400 font-bold">0.${config.percentage.value3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MEV 활동</span>
                  <span className="text-red-400 font-bold">높음</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-purple-400">유동성 분석</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                  <p className="text-green-400 font-bold">📈 유동성 증가</p>
                  <p className="text-sm text-gray-300 mt-1">
                    지난 24시간 동안 TVL이 ${config.percentage.value5} 증가했습니다
                  </p>
                </div>
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <p className="text-yellow-400 font-bold">⚠️ 높은 가스비</p>
                  <p className="text-sm text-gray-300 mt-1">
                    현재 네트워크 혼잡으로 가스비가 높습니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'strategy' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">DEX MEV 전략</h2>
          
          {/* 다중 시간대 계획 */}
          <MultiTimeframePlan 
            strategy={{
              name: "DEX 유동성 및 MEV 전략",
              description: "탈중앙화 거래소의 유동성 이동과 MEV 기회를 활용한 전략",
              timeframes: [
                { period: "실시간", signal: "대량 스웑 및 유동성 이동 감지", confidence: 92 },
                { period: "5분", signal: "가스비 역치 및 최적 타이밍 계산", confidence: 88 },
                { period: "15분", signal: "유동성 풀 APY 변동 추적", confidence: 85 },
                { period: "1시간", signal: "DEX 간 유동성 마이그레이션", confidence: 78 }
              ],
              entryRules: [
                "${config.percentage.value100} APY 이상 유동성 풀 발견",
                "가스비 50 Gwei 이하로 하락",
                "MEV 기회 ${config.percentage.value5} 이상 예상 수익"
              ],
              exitRules: [
                "APY ${config.percentage.value50} 이하로 하락",
                "가스비 100 Gwei 초과",
                "유동성 ${config.percentage.value5} 이하로 감소"
              ]
            }}
          />
          
          {/* 백테스트 결과 */}
          <BacktestResults 
            results={{
              period: "최근 6개월",
              totalTrades: 2847,
              winRate: 63.2,
              totalReturn: 89.4,
              maxDrawdown: -18.7,
              sharpeRatio: 1.95,
              profitFactor: 2.1,
              avgWin: 12.8,
              avgLoss: -8.4,
              bestTrade: 145.2,
              worstTrade: -68.3,
              monthlyReturns: [
                { month: "10월", return: 28.4, trades: 487 },
                { month: "11월", return: -12.8, trades: 623 },
                { month: "12월", return: 34.7, trades: 529 },
                { month: "1월", return: 39.1, trades: 598 }
              ]
            }}
            strategy="DEX MEV 전략"
          />
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">DEX 도구</h2>
          
          {/* 수익 계산기 */}
          <ProfitCalculator 
            defaultAmount={5000}
            signals={[
              {
                name: "유동성 공급 마이닝",
                winRate: 78,
                avgReturn: 35.8,
                risk: "중간",
                timeframe: "7-30일"
              },
              {
                name: "MEV 프론트러닝",
                winRate: 45,
                avgReturn: 125.7,
                risk: "매우 높음",
                timeframe: "수초-수분"
              },
              {
                name: "샌드위치 공격",
                winRate: 58,
                avgReturn: 48.2,
                risk: "높음",
                timeframe: "1-5분"
              }
            ]}
          />
          
          {/* 알림 설정 */}
          <AlertSettings 
            alertTypes={[
              {
                name: "고수익 유동성 풀",
                description: "${config.percentage.value100} APY 이상 유동성 풀 발견",
                enabled: true,
                threshold: "${config.percentage.value100} APY"
              },
              {
                name: "가스비 급등",
                description: "가스비 100 Gwei 초과 알림",
                enabled: true,
                threshold: "100 Gwei"
              },
              {
                name: "MEV 기회 감지",
                description: "대규모 MEV 기회 발견",
                enabled: false,
                threshold: "자동"
              }
            ]}
          />
          
          {/* 포트폴리오 관리 */}
          <PortfolioManager 
            strategy="DEX 유동성 전략"
          />
        </div>
      )}
    </div>
  )
}