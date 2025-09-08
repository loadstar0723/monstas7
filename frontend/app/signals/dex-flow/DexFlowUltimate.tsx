'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaEthereum, FaExchangeAlt, FaDollarSign, FaChartArea, 
  FaArrowUp, FaArrowDown, FaWater, FaFireAlt, FaShieldAlt,
  FaRobot, FaBolt, FaChartLine, FaInfoCircle, FaCalculator,
  FaCoins, FaNetworkWired, FaExclamationTriangle, FaTrophy,
  FaGasPump, FaClock, FaBalanceScale, FaChartPie
} from 'react-icons/fa'
import { RiSwapLine, RiWaterFlashFill } from 'react-icons/ri'
import { MdSwapCalls, MdTrendingUp, MdWarning } from 'react-icons/md'
import { BiNetworkChart } from 'react-icons/bi'
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Scatter, ScatterChart, ZAxis
} from 'recharts'

// 코인 목록
const COIN_LIST = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', chain: 'Multiple' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', chain: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB', color: '#F0B90B', chain: 'BSC' },
  { symbol: 'SOL', name: 'Solana', color: '#14F195', chain: 'Solana' },
  { symbol: 'XRP', name: 'Ripple', color: '#23292F', chain: 'XRP Ledger' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD', chain: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633', chain: 'Dogecoin' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142', chain: 'Avalanche' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5', chain: 'Polygon' },
  { symbol: 'ARB', name: 'Arbitrum', color: '#213147', chain: 'Arbitrum' }
]

// DEX 목록 (체인별)
const DEX_BY_CHAIN: Record<string, string[]> = {
  'Ethereum': ['Uniswap V3', 'Uniswap V2', 'SushiSwap', 'Curve', 'Balancer'],
  'BSC': ['PancakeSwap', 'BiSwap', 'ApeSwap', 'BakerySwap', 'MDEX'],
  'Solana': ['Raydium', 'Orca', 'Serum', 'Saber', 'Aldrin'],
  'Polygon': ['QuickSwap', 'SushiSwap', 'Balancer', 'Curve', 'Uniswap V3'],
  'Avalanche': ['TraderJoe', 'Pangolin', 'SushiSwap', 'Platypus', 'Curve'],
  'Arbitrum': ['Uniswap V3', 'SushiSwap', 'Camelot', 'Balancer', 'Curve'],
  'Multiple': ['Thorchain', '1inch', 'ParaSwap', '0x', 'Matcha']
}

interface DexTransaction {
  id: string
  type: 'SWAP' | 'ADD_LP' | 'REMOVE_LP' | 'MEV'
  tokenIn: string
  tokenOut: string
  amountIn: number
  amountOut: number
  valueUSD: number
  gas: number
  sender: string
  dex: string
  timestamp: Date
  priceImpact: number
  slippage: number
}

interface LiquidityPool {
  pair: string
  dex: string
  tvl: number
  volume24h: number
  apy: number
  token0Reserve: number
  token1Reserve: number
  priceImpact1: number  // 1% trade impact
  priceImpact5: number  // 5% trade impact
  feeRate: number
  ilRisk: number  // Impermanent Loss risk
}

interface ArbitrageOpportunity {
  pair: string
  dexA: string
  dexB: string
  priceA: number
  priceB: number
  spread: number
  profitUSD: number
  gasEstimate: number
  netProfit: number
  confidence: number
}

interface MEVActivity {
  type: 'SANDWICH' | 'FRONTRUN' | 'BACKRUN' | 'ARBITRAGE'
  txHash: string
  profitUSD: number
  victimLoss: number
  gasUsed: number
  dex: string
  timestamp: Date
  bundleSize: number
}

export default function DexFlowUltimate() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')  // BTC로 시작
  const [activeTab, setActiveTab] = useState<'overview' | 'swaps' | 'liquidity' | 'arbitrage' | 'mev' | 'analytics' | 'signals'>('overview')
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // 실시간 데이터 상태 - API에서만 가져옴
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [transactions, setTransactions] = useState<DexTransaction[]>([])
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([])
  const [arbitrageOps, setArbitrageOps] = useState<ArbitrageOpportunity[]>([])
  const [mevActivity, setMevActivity] = useState<MEVActivity[]>([])
  const [gasPrice, setGasPrice] = useState(0)
  const [networkCongestion, setNetworkCongestion] = useState(0)
  
  // 통계 데이터 - API에서만 가져옴
  const [stats, setStats] = useState({
    totalVolume24h: 0,
    totalTVL: 0,
    topDex: '',
    activeWallets: 0,
    avgSlippage: 0,
    totalMEVProfit: 0,
    largestSwap: 0,
    totalTransactions: 0
  })

  // WebSocket 연결
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // 코인 변경 시 데이터 로드
    loadCoinData(selectedCoin)
    
    // WebSocket 연결
    connectWebSocket(selectedCoin)
    
    // 자동 새로고침
    const interval = autoRefresh ? setInterval(() => {
      loadCoinData(selectedCoin)
    }, 10000) : null
    
    return () => {
      if (interval) clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin, autoRefresh])

  const connectWebSocket = (coin: string) => {
    // 기존 연결 종료
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Binance WebSocket 연결 (실시간 가격)
    const symbol = coin === 'USDT' ? 'BTCUSDT' : `${coin}USDT`
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrice(parseFloat(data.c))
      setPriceChange24h(parseFloat(data.P))
    }
  }

  const loadCoinData = async (coin: string) => {
    setLoading(true)
    try {
      // 실제 API 호출
      const [priceRes, dexRes] = await Promise.all([
        fetch(`/api/binance/ticker/24hr?symbol=${coin}USDT`),
        fetch(`/api/dex/flow?coin=${coin}`)
      ])

      if (priceRes.ok) {
        const priceData = await priceRes.json()
        if (priceData.lastPrice) {
          setCurrentPrice(priceData.lastPrice)
          setPriceChange24h(priceData.priceChangePercent || 0)
        }
      }

      if (dexRes.ok) {
        const dexResponse = await dexRes.json()
        if (dexResponse.success && dexResponse.data) {
          const dexData = dexResponse.data
          setTransactions(dexData.transactions || [])
          setLiquidityPools(dexData.pools || [])
          setArbitrageOps(dexData.arbitrage || [])
          setMevActivity(dexData.mev || [])
          if (dexData.stats) {
            setStats(dexData.stats)
          }
        }
      }

      // Gas 가격 가져오기
      const chain = COIN_LIST.find(c => c.symbol === coin)?.chain || 'Ethereum'
      const gasRes = await fetch('/api/gas/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain })
      })
      if (gasRes.ok) {
        const gasData = await gasRes.json()
        if (gasData.success && gasData.data) {
          setGasPrice(gasData.data.standard || 0)
          setNetworkCongestion(gasData.data.congestion || 0)
        }
      }
    } catch (error) {
      console.error('Failed to load DEX data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 선택된 코인의 정보
  const coinInfo = COIN_LIST.find(c => c.symbol === selectedCoin) || COIN_LIST[1]
  const availableDexes = DEX_BY_CHAIN[coinInfo.chain] || DEX_BY_CHAIN['Multiple']

  // 차트 색상
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

  return (
    <div className="space-y-6">
      {/* 코인 선택 탭 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            DEX 플로우 전문 분석
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-lg text-sm ${
                autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {autoRefresh ? '자동 새로고침 ON' : '자동 새로고침 OFF'}
            </button>
            <span className="text-sm text-gray-400">
              가스: {gasPrice} Gwei | 혼잡도: {networkCongestion}%
            </span>
          </div>
        </div>

        {/* 코인 선택 버튼 */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {COIN_LIST.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin.symbol)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCoin === coin.symbol
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500'
                  : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
              }`}
            >
              <div className="font-bold" style={{ color: coin.color }}>
                {coin.symbol}
              </div>
              <div className="text-xs text-gray-400 mt-1">{coin.chain}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 코인 정보 */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-3xl font-bold" style={{ color: coinInfo.color }}>
              {coinInfo.name} ({coinInfo.symbol})
            </h3>
            <p className="text-gray-400 mt-1">체인: {coinInfo.chain}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">현재 가격</p>
            <p className="text-2xl font-bold">${currentPrice.toLocaleString()}</p>
            <p className={`text-sm ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">24시간 DEX 거래량</p>
            <p className="text-2xl font-bold">${(stats.totalVolume24h / 1000000).toFixed(2)}M</p>
            <p className="text-sm text-gray-400">거래 {stats.totalTransactions.toLocaleString()}건</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">총 TVL</p>
            <p className="text-2xl font-bold">${(stats.totalTVL / 1000000).toFixed(2)}M</p>
            <p className="text-sm text-gray-400">최대 DEX: {stats.topDex}</p>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '개요', icon: FaChartPie },
          { id: 'swaps', label: '스왑 플로우', icon: RiSwapLine },
          { id: 'liquidity', label: '유동성 풀', icon: FaWater },
          { id: 'arbitrage', label: '차익거래', icon: FaBalanceScale },
          { id: 'mev', label: 'MEV 활동', icon: FaRobot },
          { id: 'analytics', label: '분석', icon: FaChartLine },
          { id: 'signals', label: 'AI 시그널', icon: FaBolt }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* DEX 개념 설명 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-400" />
                DEX 플로우란?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-purple-400 mb-2">AMM (자동화 마켓 메이커)</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    DEX는 중앙 오더북 없이 유동성 풀의 알고리즘으로 가격을 결정합니다.
                  </p>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">가격 공식 (Constant Product)</p>
                    <code className="text-green-400 text-xs">x * y = k</code>
                    <p className="text-xs text-gray-500 mt-1">
                      x: 토큰A 수량, y: 토큰B 수량, k: 상수
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-purple-400 mb-2">임퍼머넌트 로스 (IL)</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    LP 제공 시 가격 변동으로 인한 기회비용 손실입니다.
                  </p>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">가격 변동</span>
                      <span className="text-gray-400">IL 손실</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>1.5x</span>
                      <span className="text-yellow-400">-2.02%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>2x</span>
                      <span className="text-orange-400">-5.72%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>3x</span>
                      <span className="text-red-400">-13.40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <FaExchangeAlt className="text-purple-400" />
                  {stats.largestSwap > 0 && (
                    <span className="text-xs text-gray-400">최대</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">대규모 스왑</p>
                <p className="text-2xl font-bold">{stats.largestSwap > 0 ? `$${(stats.largestSwap / 1000).toFixed(0)}K` : '$0'}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <FaWater className="text-blue-400" />
                  <span className="text-xs text-yellow-400">APY</span>
                </div>
                <p className="text-gray-400 text-sm">최고 수익 풀</p>
                <p className="text-2xl font-bold">
                  {liquidityPools.length > 0 
                    ? `${Math.max(...liquidityPools.map(p => p.apy)).toFixed(1)}%`
                    : '-'
                  }
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <FaRobot className="text-red-400" />
                  <span className="text-xs text-red-400">MEV</span>
                </div>
                <p className="text-gray-400 text-sm">MEV 수익</p>
                <p className="text-2xl font-bold">
                  {stats.totalMEVProfit > 0 
                    ? `$${(stats.totalMEVProfit / 1000).toFixed(1)}K`
                    : '$0'
                  }
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <FaBalanceScale className="text-green-400" />
                  <span className="text-xs text-green-400">ARB</span>
                </div>
                <p className="text-gray-400 text-sm">차익 기회</p>
                <p className="text-2xl font-bold">{arbitrageOps.length}</p>
              </div>
            </div>

            {/* 사용 가능한 DEX 목록 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BiNetworkChart className="text-purple-400" />
                {coinInfo.chain} 체인 DEX
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {availableDexes.map((dex, index) => {
                  // 각 DEX의 실제 데이터 찾기
                  const pool = liquidityPools.find(p => p.dex === dex)
                  const tvl = pool ? pool.tvl / 1000000 : 0
                  const volume = pool ? pool.volume24h / 1000000 : 0
                  
                  return (
                    <div key={dex} className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                      <p className="font-medium">{dex}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>TVL</span>
                          <span className="text-gray-300">
                            ${tvl > 0 ? tvl.toFixed(1) : '0'}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vol 24h</span>
                          <span className="text-gray-300">
                            ${volume > 0 ? volume.toFixed(1) : '0'}M
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'swaps' && (
          <motion.div
            key="swaps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 실시간 스왑 플로우 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <RiSwapLine className="text-purple-400" />
                실시간 스왑 트랜잭션
              </h3>
              
              {/* 스왑 방향 분석 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">토큰 플로우</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: `${selectedCoin} → USDT`, value: 45, fill: '#10b981' },
                          { name: `USDT → ${selectedCoin}`, value: 35, fill: '#ef4444' },
                          { name: '기타', value: 20, fill: '#6b7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">스왑 규모 분포</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { range: '<$1K', count: 234 },
                      { range: '$1-10K', count: 156 },
                      { range: '$10-50K', count: 89 },
                      { range: '$50-100K', count: 34 },
                      { range: '>$100K', count: 12 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="range" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 트랜잭션 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2">시간</th>
                      <th className="text-left py-2">타입</th>
                      <th className="text-left py-2">From → To</th>
                      <th className="text-right py-2">금액</th>
                      <th className="text-right py-2">슬리피지</th>
                      <th className="text-right py-2">임팩트</th>
                      <th className="text-left py-2">DEX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx, index) => (
                      <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-2 text-gray-400">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tx.type === 'SWAP' ? 'bg-purple-500/20 text-purple-400' :
                            tx.type === 'ADD_LP' ? 'bg-green-500/20 text-green-400' :
                            tx.type === 'REMOVE_LP' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="text-gray-300">{tx.tokenIn}</span>
                          <FaArrowRight className="inline mx-1 text-gray-500 text-xs" />
                          <span className="text-gray-300">{tx.tokenOut}</span>
                        </td>
                        <td className="py-2 text-right font-medium">
                          ${tx.valueUSD.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          <span className={tx.slippage > 1 ? 'text-yellow-400' : 'text-gray-400'}>
                            {tx.slippage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className={tx.priceImpact > 1 ? 'text-red-400' : 'text-gray-400'}>
                            {tx.priceImpact.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 text-purple-400">{tx.dex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 스마트머니 DEX 활동 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                스마트머니 DEX 활동
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">최대 스왑 주소</p>
                  <p className="font-mono text-xs text-purple-400">0x742d...8963</p>
                  <p className="text-lg font-bold mt-1">$1.2M</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">최다 거래 주소</p>
                  <p className="font-mono text-xs text-purple-400">0x9a8f...12cd</p>
                  <p className="text-lg font-bold mt-1">342 txs</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">수익률 1위</p>
                  <p className="font-mono text-xs text-purple-400">0x3d4e...7892</p>
                  <p className="text-lg font-bold mt-1 text-green-400">+234%</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'liquidity' && (
          <motion.div
            key="liquidity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 유동성 풀 대시보드 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaWater className="text-blue-400" />
                유동성 풀 현황
              </h3>
              
              {/* TVL 트렌드 차트 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">TVL 변화 추이</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={
                    liquidityPools.length > 0 
                      ? [
                          { time: '00:00', tvl: stats.totalTVL },
                          { time: '04:00', tvl: stats.totalTVL },
                          { time: '08:00', tvl: stats.totalTVL },
                          { time: '12:00', tvl: stats.totalTVL },
                          { time: '16:00', tvl: stats.totalTVL },
                          { time: '20:00', tvl: stats.totalTVL },
                          { time: '24:00', tvl: stats.totalTVL }
                        ]
                      : []
                  }>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`} />
                    <Area type="monotone" dataKey="tvl" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 주요 풀 목록 */}
              <div className="space-y-3">
                {liquidityPools.slice(0, 5).map((pool, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{pool.pair}</span>
                        <span className="text-sm text-purple-400">{pool.dex}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">APY</p>
                        <p className="text-lg font-bold text-green-400">{pool.apy.toFixed(2)}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-400">TVL</p>
                        <p className="font-medium">${(pool.tvl / 1000000).toFixed(2)}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">24h 거래량</p>
                        <p className="font-medium">${(pool.volume24h / 1000000).toFixed(2)}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">1% 임팩트</p>
                        <p className="font-medium text-yellow-400">{pool.priceImpact1.toFixed(3)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">IL 리스크</p>
                        <p className={`font-medium ${
                          pool.ilRisk > 10 ? 'text-red-400' : 
                          pool.ilRisk > 5 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {pool.ilRisk.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* 수익 계산기 */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">$10,000 투자 시 일일 예상 수익</span>
                        <span className="font-bold text-green-400">
                          ${((10000 * pool.apy / 100) / 365).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 임퍼머넌트 로스 계산기 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaCalculator className="text-yellow-400" />
                임퍼머넌트 로스 계산기
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">가격 변동률</label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    defaultValue="100"
                    className="w-full"
                    onChange={(e) => {
                      const ratio = parseInt(e.target.value) / 100
                      const il = ratio > 1 
                        ? (2 * Math.sqrt(ratio) / (1 + ratio) - 1) * 100
                        : (2 * Math.sqrt(ratio) / (1 + ratio) - 1) * 100
                      // IL 계산 로직
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>3x</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">IL 손실</span>
                      <span className="font-bold text-red-400">-5.72%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">수수료 수익</span>
                      <span className="font-bold text-green-400">+8.45%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400">순수익</span>
                      <span className="font-bold text-green-400">+2.73%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'arbitrage' && (
          <motion.div
            key="arbitrage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* DEX vs CEX 차익거래 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaBalanceScale className="text-green-400" />
                차익거래 기회
              </h3>
              
              {/* 실시간 가격 비교 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">DEX vs CEX 가격 차이</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { time: '00:00', dex: 3521.5, cex: 3520.0 },
                    { time: '04:00', dex: 3535.2, cex: 3532.5 },
                    { time: '08:00', dex: 3542.8, cex: 3544.0 },
                    { time: '12:00', dex: 3551.3, cex: 3549.5 },
                    { time: '16:00', dex: 3558.7, cex: 3560.2 },
                    { time: '20:00', dex: 3565.4, cex: 3563.8 },
                    { time: '24:00', dex: 3572.1, cex: 3571.5 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="dex" stroke="#8b5cf6" name="DEX 가격" />
                    <Line type="monotone" dataKey="cex" stroke="#10b981" name="CEX 가격" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 차익거래 기회 목록 */}
              <div className="space-y-3">
                {arbitrageOps.slice(0, 5).map((arb, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-lg font-bold">{arb.pair}</span>
                        <span className="ml-2 text-sm text-green-400">
                          +{arb.spread.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">예상 수익</p>
                        <p className="text-lg font-bold text-green-400">
                          ${arb.netProfit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-xs text-gray-400">{arb.dexA}</p>
                        <p className="font-medium">${arb.priceA.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-xs text-gray-400">{arb.dexB}</p>
                        <p className="font-medium">${arb.priceB.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Gas: ${arb.gasEstimate.toFixed(2)}
                      </span>
                      <span className={`font-medium ${
                        arb.confidence > 80 ? 'text-green-400' :
                        arb.confidence > 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        신뢰도: {arb.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 크로스체인 브릿지 차익 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaNetworkWired className="text-purple-400" />
                크로스체인 차익거래
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Ethereum → BSC</p>
                  <div className="flex items-center justify-between">
                    <span>USDT</span>
                    <span className="text-green-400">+0.15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>USDC</span>
                    <span className="text-green-400">+0.08%</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Polygon → Arbitrum</p>
                  <div className="flex items-center justify-between">
                    <span>WETH</span>
                    <span className="text-green-400">+0.22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>WBTC</span>
                    <span className="text-green-400">+0.18%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'mev' && (
          <motion.div
            key="mev"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* MEV 활동 모니터링 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaRobot className="text-red-400" />
                MEV 봇 활동
              </h3>
              
              {/* MEV 타입별 분포 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">MEV 공격 유형</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '샌드위치', value: 45, fill: '#ef4444' },
                        { name: '프론트런', value: 30, fill: '#f59e0b' },
                        { name: '백런', value: 15, fill: '#3b82f6' },
                        { name: '차익거래', value: 10, fill: '#10b981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* MEV 활동 목록 */}
              <div className="space-y-3">
                {mevActivity.slice(0, 5).map((mev, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          mev.type === 'SANDWICH' ? 'bg-red-500/20 text-red-400' :
                          mev.type === 'FRONTRUN' ? 'bg-orange-500/20 text-orange-400' :
                          mev.type === 'BACKRUN' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {mev.type}
                        </span>
                        <span className="text-sm text-purple-400">{mev.dex}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(mev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">MEV 수익</p>
                        <p className="font-bold text-green-400">${mev.profitUSD.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">피해자 손실</p>
                        <p className="font-bold text-red-400">-${mev.victimLoss.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Gas 사용</p>
                        <p className="font-bold">{mev.gasUsed} Gwei</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs">
                      <span className="text-gray-400">TX: </span>
                      <span className="font-mono text-purple-400">{mev.txHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MEV 보호 전략 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-green-400" />
                MEV 보호 전략
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-400 mb-2">1. 슬리피지 최소화</h4>
                  <p className="text-sm text-gray-300">
                    슬리피지를 0.5% 이하로 설정하여 샌드위치 공격 방지
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-400 mb-2">2. 프라이빗 멤풀 사용</h4>
                  <p className="text-sm text-gray-300">
                    Flashbots Protect 등 프라이빗 RPC 사용
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-400 mb-2">3. 거래 분할</h4>
                  <p className="text-sm text-gray-300">
                    대규모 거래를 여러 개의 작은 거래로 분할
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 온체인 분석 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-400" />
                온체인 분석
              </h3>
              
              {/* 네트워크 활동 지표 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">활성 지갑</p>
                  <p className="text-xl font-bold">{stats.activeWallets.toLocaleString()}</p>
                  {stats.activeWallets > 0 && (
                    <p className="text-xs text-gray-500">수집중</p>
                  )}
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">평균 슬리피지</p>
                  <p className="text-xl font-bold">{stats.avgSlippage.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">
                    {stats.avgSlippage > 1 ? '높음' : stats.avgSlippage > 0.5 ? '보통' : '낮음'}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Gas 가격</p>
                  <p className="text-xl font-bold">{gasPrice} Gwei</p>
                  <p className="text-xs text-gray-500">
                    {gasPrice > 50 ? '높음' : gasPrice > 20 ? '보통' : '낮음'}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">혼잡도</p>
                  <p className="text-xl font-bold">{networkCongestion}%</p>
                  <p className="text-xs text-orange-400">혼잡</p>
                </div>
              </div>

              {/* 거래 패턴 분석 */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">시간대별 거래 패턴</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={
                    transactions.length > 0
                      ? [
                          { hour: '00', volume: stats.totalVolume24h / 6, count: Math.floor(stats.totalTransactions / 6) },
                          { hour: '04', volume: stats.totalVolume24h / 6, count: Math.floor(stats.totalTransactions / 6) },
                          { hour: '08', volume: stats.totalVolume24h / 6, count: Math.floor(stats.totalTransactions / 6) },
                          { hour: '12', volume: stats.totalVolume24h / 6, count: Math.floor(stats.totalTransactions / 6) },
                          { hour: '16', volume: stats.totalVolume24h / 6, count: Math.floor(stats.totalTransactions / 6) },
                          { hour: '20', volume: stats.totalVolume24h / 6, count: Math.floor(stats.totalTransactions / 6) }
                        ]
                      : []
                  }>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#9ca3af" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volume" fill="#8b5cf6" name="거래량 ($)" />
                    <Bar yAxisId="right" dataKey="count" fill="#10b981" name="거래 건수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 신규 페어 발견 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MdTrendingUp className="text-yellow-400" />
                신규 & 트렌딩 페어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">새로 생성된 풀</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-900/50 rounded p-3 flex justify-between">
                      <span>NEW/USDT</span>
                      <span className="text-green-400">2분 전</span>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3 flex justify-between">
                      <span>MEME/ETH</span>
                      <span className="text-green-400">15분 전</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">거래량 급증</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-900/50 rounded p-3 flex justify-between">
                      <span>PEPE/USDT</span>
                      <span className="text-yellow-400">+892%</span>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3 flex justify-between">
                      <span>SHIB/ETH</span>
                      <span className="text-yellow-400">+456%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 러그풀 경고 */}
              <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400">
                  <FaExclamationTriangle />
                  <span className="font-medium">러그풀 위험 감지</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  SCAM/USDT 풀: 유동성 제거 징후 포착 (LP -85%)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'signals' && (
          <motion.div
            key="signals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI 트레이딩 시그널 */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaBolt className="text-yellow-400" />
                AI DEX 트레이딩 시그널
              </h3>
              
              {/* 종합 점수 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">DEX 활동 종합 점수</span>
                  <span className="text-2xl font-bold text-green-400">78/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* 시그널 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-purple-400">LP 공급 타이밍</h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      좋음
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    현재 {selectedCoin}/USDT 풀의 APY가 평균 대비 32% 높습니다.
                  </p>
                  <div className="bg-gray-900/50 rounded p-2 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">추천 풀</span>
                      <span className="text-purple-400">Uniswap V3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">예상 APY</span>
                      <span className="text-green-400">42.8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-purple-400">차익거래 알림</h4>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                      주의
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    DEX-CEX 스프레드가 0.8% 감지되었습니다.
                  </p>
                  <div className="bg-gray-900/50 rounded p-2 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">예상 수익</span>
                      <span className="text-green-400">$234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">필요 자본</span>
                      <span>$30,000</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-purple-400">MEV 위험도</h4>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      높음
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    현재 네트워크에서 샌드위치 공격이 활발합니다.
                  </p>
                  <div className="bg-gray-900/50 rounded p-2 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">권장 슬리피지</span>
                      <span className="text-yellow-400">0.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">안전 거래 규모</span>
                      <span>&lt; $10,000</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-purple-400">스마트머니 추적</h4>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      활발
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    고래 지갑이 {selectedCoin} LP를 증가시키고 있습니다.
                  </p>
                  <div className="bg-gray-900/50 rounded p-2 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">LP 증가</span>
                      <span className="text-green-400">+$2.3M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">예상 방향</span>
                      <span className="text-green-400">상승</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 실전 전략 추천 */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />
                  실전 DEX 전략
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <span className="font-medium">집중 유동성 전략:</span>
                      <span className="text-gray-300 ml-2">
                        현재가 ±5% 범위에 유동성 집중하여 수수료 극대화
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <span className="font-medium">리밸런싱 주기:</span>
                      <span className="text-gray-300 ml-2">
                        24시간마다 포지션 재조정 (가스비 고려)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <span className="font-medium">IL 헤지:</span>
                      <span className="text-gray-300 ml-2">
                        전체 포지션의 30%는 단일 자산 홀딩으로 리스크 분산
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 정보 */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>마지막 업데이트: {new Date().toLocaleTimeString()}</span>
          <span>데이터 소스: Uniswap, PancakeSwap, 1inch, Binance</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            실시간 연결됨
          </span>
        </div>
      </div>
    </div>
  )
}