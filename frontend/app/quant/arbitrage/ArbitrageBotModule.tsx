'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// 컴포넌트들 동적 임포트
const CoinSelector = dynamic(() => import('./components/CoinSelector'), { ssr: false })
const BotConceptGuide = dynamic(() => import('./components/BotConceptGuide'), { ssr: false })
const BotConfiguration = dynamic(() => import('./components/BotConfiguration'), { ssr: false })
const LiveBotMonitor = dynamic(() => import('./components/LiveBotMonitor'), { ssr: false })
const TriangularArbitrage = dynamic(() => import('./components/TriangularArbitrage'), { ssr: false })
const StatisticalArbitrage = dynamic(() => import('./components/StatisticalArbitrage'), { ssr: false })
const BacktestingEngine = dynamic(() => import('./components/BacktestingEngine'), { ssr: false })
const ProfitAnalytics = dynamic(() => import('./components/ProfitAnalytics'), { ssr: false })
const RiskManagement = dynamic(() => import('./components/RiskManagement'), { ssr: false })
const ExecutionLogs = dynamic(() => import('./components/ExecutionLogs'), { ssr: false })

// 10개 주요 코인 (USDT 페어)
export const MAJOR_COINS = [
  { symbol: 'BTC', fullSymbol: 'BTCUSDT', name: '비트코인', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
  { symbol: 'ETH', fullSymbol: 'ETHUSDT', name: '이더리움', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  { symbol: 'BNB', fullSymbol: 'BNBUSDT', name: '바이낸스', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
  { symbol: 'SOL', fullSymbol: 'SOLUSDT', name: '솔라나', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
  { symbol: 'XRP', fullSymbol: 'XRPUSDT', name: '리플', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' },
  { symbol: 'ADA', fullSymbol: 'ADAUSDT', name: '카르다노', color: 'text-blue-300', bgColor: 'bg-blue-400/20', borderColor: 'border-blue-400/30' },
  { symbol: 'DOGE', fullSymbol: 'DOGEUSDT', name: '도지코인', color: 'text-yellow-300', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/30' },
  { symbol: 'AVAX', fullSymbol: 'AVAXUSDT', name: '아발란체', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
  { symbol: 'DOT', fullSymbol: 'DOTUSDT', name: '폴카닷', color: 'text-pink-400', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
  { symbol: 'MATIC', fullSymbol: 'MATICUSDT', name: '폴리곤', color: 'text-purple-300', bgColor: 'bg-purple-400/20', borderColor: 'border-purple-400/30' }
]

// 봇 설정 인터페이스
export interface BotConfig {
  coin: string
  strategy: 'triangular' | 'statistical' | 'cross-exchange' | 'dex-cex'
  minProfit: number      // 최소 수익률 (%)
  maxPosition: number    // 최대 포지션 크기 (USDT)
  slippage: number      // 슬리피지 허용치 (%)
  gasLimit: number      // 가스 한도
  autoExecute: boolean  // 자동 실행 여부
  stopLoss: number      // 손절 라인 (%)
  takeProfit: number    // 익절 라인 (%)
}

// 봇 상태 타입
type BotStatus = 'running' | 'paused' | 'stopped' | 'initializing'

export default function ArbitrageBotModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('concept')
  const [botStatus, setBotStatus] = useState<BotStatus>('stopped')
  const [botConfig, setBotConfig] = useState<BotConfig>({
    coin: 'BTC',
    strategy: 'triangular',
    minProfit: 0.5,
    maxPosition: 1000,
    slippage: 0.1,
    gasLimit: 300000,
    autoExecute: false,
    stopLoss: 2,
    takeProfit: 5
  })
  
  // 선택된 코인 정보
  const selectedCoinInfo = MAJOR_COINS.find(coin => coin.symbol === selectedCoin) || MAJOR_COINS[0]
  
  useEffect(() => {
    const initModule = async () => {
      try {
        setLoading(true)
        // 초기화 로직
        // 실제 API 데이터 로드는 각 컴포넌트에서 수행
        
        // 약간의 지연 후 로딩 완료
        await new Promise(resolve => setTimeout(resolve, 800))
        setLoading(false)
      } catch (err) {
        console.error('[ArbitrageBot] 초기화 오류:', err)
        setLoading(false)
      }
    }
    
    initModule()
  }, [])
  
  // 봇 제어 함수들
  const handleBotStart = () => {
    setBotStatus('initializing')
    setTimeout(() => setBotStatus('running'), 1000)
  }
  
  const handleBotPause = () => {
    setBotStatus('paused')
  }
  
  const handleBotStop = () => {
    setBotStatus('stopped')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">차익거래 봇 시스템 초기화 중...</p>
          <p className="text-sm text-gray-500 mt-2">10개 주요 코인 봇 설정 로드 중</p>
        </div>
      </div>
    )
  }
  
  // 섹션 네비게이션
  const sections = [
    { id: 'concept', label: '봇 개념', icon: '🤖' },
    { id: 'monitor', label: '실시간 모니터링', icon: '📊' },
    { id: 'config', label: '봇 설정', icon: '⚙️' },
    { id: 'triangular', label: '삼각 차익', icon: '🔺' },
    { id: 'statistical', label: '통계 차익', icon: '📈' },
    { id: 'backtest', label: '백테스팅', icon: '⏪' },
    { id: 'profit', label: '수익 분석', icon: '💰' },
    { id: 'risk', label: '리스크 관리', icon: '⚠️' },
    { id: 'logs', label: '실행 로그', icon: '📝' }
  ]
  
  // 무한 리렌더링 디버깅을 위해 단순화
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          차익거래 봇 전문 시스템
        </h1>
        <p className="text-gray-400 text-lg">
          10개 주요 코인의 자동 차익거래 봇 설정 및 모니터링 대시보드
        </p>
      </div>
      
      {/* 봇 상태 표시 및 제어 */}
      <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                botStatus === 'running' ? 'bg-green-400 animate-pulse' :
                botStatus === 'paused' ? 'bg-yellow-400' :
                botStatus === 'initializing' ? 'bg-blue-400 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {botStatus === 'running' ? '봇 실행 중' :
                 botStatus === 'paused' ? '일시 정지' :
                 botStatus === 'initializing' ? '초기화 중' :
                 '정지됨'}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              선택된 코인: <span className={selectedCoinInfo.color}>{selectedCoinInfo.name}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {botStatus === 'stopped' ? (
              <button
                onClick={handleBotStart}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>▶️</span>
                <span>봇 시작</span>
              </button>
            ) : botStatus === 'running' ? (
              <>
                <button
                  onClick={handleBotPause}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>⏸️</span>
                  <span>일시정지</span>
                </button>
                <button
                  onClick={handleBotStop}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>⏹️</span>
                  <span>정지</span>
                </button>
              </>
            ) : botStatus === 'paused' ? (
              <>
                <button
                  onClick={() => setBotStatus('running')}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>▶️</span>
                  <span>재개</span>
                </button>
                <button
                  onClick={handleBotStop}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>⏹️</span>
                  <span>정지</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* 코인 선택기 */}
      <CoinSelector 
        selectedCoin={selectedCoin}
        onCoinSelect={setSelectedCoin}
        coins={MAJOR_COINS}
      />
      
      {/* 섹션 네비게이션 - 모바일 스크롤 가능 */}
      <div className="mb-8 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max py-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeSection === section.id
                  ? `${selectedCoinInfo.bgColor} ${selectedCoinInfo.color} border ${selectedCoinInfo.borderColor}`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="space-y-8">
        {/* 선택된 코인 정보 배너 */}
        <div className={`p-6 rounded-xl ${selectedCoinInfo.bgColor} border ${selectedCoinInfo.borderColor}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${selectedCoinInfo.color}`}>
                {selectedCoinInfo.name} ({selectedCoinInfo.symbol})
              </h2>
              <p className="text-gray-400 mt-1">차익거래 봇 전문 대시보드</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">실시간 업데이트</p>
              <p className={`text-lg font-mono ${selectedCoinInfo.color}`}>
                {new Date().toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* 섹션별 컨텐츠 */}
        <div className="min-h-[600px]">
          {activeSection === 'concept' && (
            <BotConceptGuide 
              selectedCoin={selectedCoinInfo}
            />
          )}
          
          {activeSection === 'monitor' && (
            <LiveBotMonitor 
              selectedCoin={selectedCoinInfo}
              botStatus={botStatus}
              botConfig={botConfig}
            />
          )}
          
          {activeSection === 'config' && (
            <BotConfiguration 
              selectedCoin={selectedCoinInfo}
              config={botConfig}
              onConfigChange={setBotConfig}
            />
          )}
          
          {activeSection === 'triangular' && (
            <TriangularArbitrage 
              selectedCoin={selectedCoinInfo}
              botConfig={botConfig}
            />
          )}
          
          {activeSection === 'statistical' && (
            <StatisticalArbitrage 
              selectedCoin={selectedCoinInfo}
              botConfig={botConfig}
            />
          )}
          
          {activeSection === 'backtest' && (
            <BacktestingEngine 
              selectedCoin={selectedCoinInfo}
              botConfig={botConfig}
            />
          )}
          
          {activeSection === 'profit' && (
            <ProfitAnalytics 
              selectedCoin={selectedCoinInfo}
            />
          )}
          
          {activeSection === 'risk' && (
            <RiskManagement 
              selectedCoin={selectedCoinInfo}
              config={botConfig}
              onConfigChange={setBotConfig}
            />
          )}
          
          {activeSection === 'logs' && (
            <ExecutionLogs 
              selectedCoin={selectedCoinInfo}
              botStatus={botStatus}
            />
          )}
        </div>
      </div>
    </div>
  )
}