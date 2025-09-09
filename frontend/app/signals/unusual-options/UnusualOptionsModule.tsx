'use client'

import { useState, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useOptionsData } from './hooks/useOptionsData'
import { 
  FaBitcoin, FaEthereum, FaChartLine, FaChartBar, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaBolt, FaFire, FaRocket, FaShieldAlt,
  FaClock, FaDollarSign, FaChartPie, FaBalanceScale, FaCoins
} from 'react-icons/fa'
import { 
  SiSolana, SiRipple, SiCardano, SiDogecoin, SiPolygon 
} from 'react-icons/si'

// 동적 임포트로 각 탭 컴포넌트 로드 (코드 스플리팅)
const ConceptTab = dynamic(() => import('./components/ConceptTab'), {
  loading: () => <div className="text-center py-8">로딩 중...</div>,
  ssr: false
})

const RealtimeTab = dynamic(() => import('./components/RealtimeTab'), {
  loading: () => <div className="text-center py-8">실시간 데이터 로딩 중...</div>,
  ssr: false
})

const AnalysisTab = dynamic(() => import('./components/AnalysisTab'), {
  loading: () => <div className="text-center py-8">분석 로딩 중...</div>,
  ssr: false
})

const StrategyTab = dynamic(() => import('./components/StrategyTab'), {
  loading: () => <div className="text-center py-8">전략 로딩 중...</div>,
  ssr: false
})

const ExecutionTab = dynamic(() => import('./components/ExecutionTab'), {
  loading: () => <div className="text-center py-8">실행 계획 로딩 중...</div>,
  ssr: false
})

// 코인 설정
const COINS = [
  { symbol: 'BTCUSDT', name: 'BTC', icon: FaBitcoin, color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'ETH', icon: FaEthereum, color: '#627EEA' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: FaCoins, color: '#F3BA2F' },
  { symbol: 'SOLUSDT', name: 'SOL', icon: SiSolana, color: '#9945FF' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: SiRipple, color: '#23292F' },
  { symbol: 'ADAUSDT', name: 'ADA', icon: SiCardano, color: '#0033AD' },
  { symbol: 'DOGEUSDT', name: 'DOGE', icon: SiDogecoin, color: '#C2A633' },
  { symbol: 'AVAXUSDT', name: 'AVAX', icon: FaRocket, color: '#E84142' },
  { symbol: 'MATICUSDT', name: 'MATIC', icon: SiPolygon, color: '#8247E5' },
  { symbol: 'ARBUSDT', name: 'ARB', icon: FaBolt, color: '#28A0F0' }
]

// 헤더 컴포넌트 (모듈화)
function Header({ currentCoin, currentPrice, stats }: any) {
  const Icon = currentCoin?.icon || FaBitcoin
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="text-3xl" style={{ color: currentCoin?.color }} />
          <div>
            <h2 className="text-xl font-bold">{currentCoin?.name}/USDT</h2>
            <p className="text-2xl font-mono">
              ${currentPrice.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Put/Call Ratio</p>
          <p className={`text-2xl font-bold ${
            stats.putCallRatio > 1 ? 'text-red-400' : 'text-green-400'
          }`}>
            {stats.putCallRatio?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>
    </div>
  )
}

// 코인 선택 버튼 컴포넌트
function CoinSelector({ selectedCoin, onSelect }: any) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
      {COINS.map((coin) => {
        const CoinIcon = coin.icon
        return (
          <button
            key={coin.symbol}
            onClick={() => onSelect(coin.symbol)}
            className={`p-3 rounded-lg border transition-all ${
              selectedCoin === coin.symbol
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
            }`}
          >
            <CoinIcon 
              className="text-2xl mx-auto mb-1" 
              style={{ color: coin.color }}
            />
            <div className="text-xs">{coin.name}</div>
          </button>
        )
      })}
    </div>
  )
}

// 탭 메뉴 컴포넌트
function TabMenu({ activeTab, onTabChange }: any) {
  const tabs = [
    { id: 'concept', label: '개념', icon: '📚' },
    { id: 'realtime', label: '실시간', icon: '⚡' },
    { id: 'analysis', label: '분석', icon: '📊' },
    { id: 'strategy', label: '전략', icon: '🎯' },
    { id: 'execution', label: '실행', icon: '🚀' }
  ]

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-purple-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// 메인 모듈 컴포넌트
export default function UnusualOptionsModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('concept')
  
  // Custom Hook으로 데이터 관리
  const {
    currentPrice,
    optionsFlows,
    gammaExposure,
    stats,
    loading,
    volumeHistory
  } = useOptionsData(selectedCoin)

  const currentCoin = COINS.find(c => c.symbol === selectedCoin)

  return (
    <ErrorBoundary moduleName="UnusualOptions">
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎯 비정상 옵션 Ultimate
            </h1>
            <p className="text-gray-400">
              대규모 옵션 거래를 실시간으로 추적하여 스마트 머니의 움직임을 포착합니다
            </p>
          </div>

          {/* 코인 선택 */}
          <ErrorBoundary>
            <CoinSelector selectedCoin={selectedCoin} onSelect={setSelectedCoin} />
          </ErrorBoundary>

          {/* 현재 가격 표시 */}
          <ErrorBoundary>
            <Header currentCoin={currentCoin} currentPrice={currentPrice} stats={stats} />
          </ErrorBoundary>

          {/* 탭 메뉴 */}
          <TabMenu activeTab={activeTab} onTabChange={setActiveTab} />

          {/* 탭 컨텐츠 */}
          <div className="space-y-6">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
                {activeTab === 'concept' && <ConceptTab />}
                
                {activeTab === 'realtime' && (
                  <RealtimeTab 
                    optionsFlows={optionsFlows}
                    volumeHistory={volumeHistory}
                    currentPrice={currentPrice}
                    stats={stats}
                  />
                )}

                {activeTab === 'analysis' && (
                  <AnalysisTab
                    gammaExposure={gammaExposure}
                    currentPrice={currentPrice}
                    stats={stats}
                    selectedCoin={selectedCoin}
                  />
                )}

                {activeTab === 'strategy' && (
                  <StrategyTab
                    currentPrice={currentPrice}
                    selectedCoin={selectedCoin}
                    stats={stats}
                  />
                )}

                {activeTab === 'execution' && (
                  <ExecutionTab
                    currentPrice={currentPrice}
                    stats={stats}
                  />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}