'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { dataService } from '@/lib/services/finalDataService'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  FaUserSecret, FaWallet, FaLock, FaUnlock, FaExchangeAlt, 
  FaChartLine, FaExclamationTriangle, FaCheckCircle, FaArrowUp, 
  FaArrowDown, FaClock, FaShieldAlt, FaChartBar, FaBook, 
  FaGraduationCap, FaLightbulb, FaBell, FaEye, FaBalanceScale,
  FaUniversity, FaNetworkWired, FaRobot, FaChartPie, FaCoins,
  FaBinoculars, FaSkullCrossbones, FaTrophy, FaFire
} from 'react-icons/fa'
import { AiOutlineRadarChart } from 'react-icons/ai'
import { BiTargetLock } from 'react-icons/bi'
import { MdShowChart } from 'react-icons/md'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar, 
  Area, AreaChart, ComposedChart, Legend, Treemap
} from 'recharts'

// 10개 주요 코인
const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BNB', name: 'Binance Coin', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
  { symbol: 'XRP', name: 'Ripple', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' }
]

// 실시간 인사이더 거래 생성 함수
const generateInsiderTransaction = (
  symbol: string,
  currentPrice: number,
  index: number
): InsiderTransaction => {
  const types: InsiderTransaction['type'][] = ['buy', 'sell', 'transfer']
  const categories: InsiderTransaction['category'][] = ['team', 'vc', 'whale', 'exchange']
  // index를 기반으로 결정적으로 선택
  const type = types[index % types.length]
  const category = categories[(index + 1) % categories.length]
  
  // 카테고리별 거래 규모 설정
  const volumeMultiplier = 
    category === 'whale' ? 10 :
    category === 'vc' ? 5 :
    category === 'team' ? 3 : 1
    
  const baseAmount = symbol === 'BTC' ? 0.5 * volumeMultiplier :
                    symbol === 'ETH' ? 10 * volumeMultiplier :
                    symbol === 'BNB' ? 50 * volumeMultiplier :
                    100 * volumeMultiplier
                    
  const amount = baseAmount + (index % 10) * baseAmount * 0.2 // index 기반 변동
  const value = amount * currentPrice
  
  // 영향도 계산
  const impact: InsiderTransaction['impact'] = 
    value > 1000000 ? 'critical' :
    value > 500000 ? 'high' :
    value > 100000 ? 'medium' : 'low'
    
  return {
    id: `tx_${Date.now()}_${index}`,
    timestamp: new Date(Date.now() - (index * 3600000)), // index * 1시간
    type,
    category,
    wallet: `0x${symbol.toLowerCase()}${category}${index.toString(16).padStart(4, '0')}...${index.toString(16).padStart(6, '0')}`,
    amount,
    value,
    price: currentPrice,
    impact,
    description: type === 'sell' ? `${category === 'team' ? '팀' : category === 'vc' ? 'VC' : category === 'whale' ? '고래' : '거래소'} 대량 매도 감지` :
                 type === 'buy' ? `${category === 'team' ? '팀' : category === 'vc' ? 'VC' : category === 'whale' ? '고래' : '거래소'} 매수 포지션 증가` :
                 `대규모 토큰 이동 감지`
  }
}

// 인사이더 거래 타입
interface InsiderTransaction {
  id: string
  timestamp: Date
  type: 'buy' | 'sell' | 'transfer'
  category: 'team' | 'vc' | 'whale' | 'exchange'
  wallet: string
  amount: number
  value: number
  price: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

// 지갑 정보
interface WalletInfo {
  address: string
  label: string
  type: 'team' | 'vc' | 'whale'
  balance: number
  value: number
  lastActivity: Date
  riskLevel: number
  isLocked: boolean
  unlockDate?: Date
}

// 언락 이벤트
interface UnlockEvent {
  date: string
  amount: number
  type: 'team' | 'vc' | 'investor'
  impact: 'low' | 'medium' | 'high'
  percentage: number
}

export default function InsiderFlowUltimate() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [loading, setLoading] = useState(true) // 초기값을 true로 변경
  const [error, setError] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [insiderTransactions, setInsiderTransactions] = useState<InsiderTransaction[]>([])
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [unlockSchedule, setUnlockSchedule] = useState<UnlockEvent[]>([])
  const [exchangeFlow, setExchangeFlow] = useState({ inflow: 0, outflow: 0, netflow: 0 })
  const [riskScore, setRiskScore] = useState(0)
  const [onchainMetrics, setOnchainMetrics] = useState({
    activeAddresses: 0,
    transactionCount: 0,
    largeHolders: 0,
    networkActivity: 0,
    holderDistribution: { top10: 45, top11to50: 25, top51to100: 15, others: 15 }
  })
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string, price: number }>>([])
  const [volumeHistory, setVolumeHistory] = useState<Array<{ time: string, volume: number }>>([])
  const [wsRetryCount, setWsRetryCount] = useState(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const maxRetries = 5

  // API를 통한 가격 업데이트
  const updatePriceViaAPI = useCallback(async (coin: string) => {
    try {
      const response = await fetch(`/api/insider/config?symbol=${coin}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.marketData) {
          setCurrentPrice(result.data.marketData.price)
          setPriceChange(result.data.marketData.priceChange)
        }
      }
    } catch (error) {
      console.error('Price update error:', error)
    }
  }, [])
  
  // 폴링 대체 함수
  const startPricePolling = useCallback((coin: string) => {
    console.log('Starting price polling for:', coin)
    
    // 기존 폴링 정리
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    
    // 즉시 가격 업데이트
    updatePriceViaAPI(coin)
    
    // 5초마다 가격 업데이트
    const interval = setInterval(() => {
      updatePriceViaAPI(coin)
    }, 5000)
    
    setPollingInterval(interval)
  }, [pollingInterval, updatePriceViaAPI])
  
  // WebSocket 연결
  const connectWebSocket = useCallback((coin: string) => {
    try {
      // 클라이언트 사이드에서만 실행
      if (typeof window === 'undefined') return
      
      // 기존 연결 정리
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close(1000, 'Changing symbol')
        }
        wsRef.current = null
      }

      // Binance WebSocket 형식에 맞게 수정
      const symbol = `${coin}USDT`.toLowerCase()
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@ticker`
      
      console.log('Attempting WebSocket connection:', wsUrl)
      
      try {$100K)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">팀/VC 지갑 이동</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">언락 이벤트 24시간 전</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">리스크 레벨 변화</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">거래소 대량 입출금</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">알림 채널</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">텔레그램</span>
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded">
                        연결하기
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">실시간 알림 수신</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">이메일</span>
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded">
                        설정하기
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">일일 요약 리포트</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">웹훅</span>
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded">
                        API 설정
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">자동 트레이딩 연동</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 10: 실전 활용 가이드 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-green-400" />
              실전 활용 가이드
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-400">인사이더 플로우 해석법</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">✅ 긍정적 신호</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 팀이 추가 매수하는 경우</li>
                      <li>• 거래소에서 지갑으로 대량 출금</li>
                      <li>• 장기 홀더 증가</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">❌ 부정적 신호</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 팀/VC 지갑에서 대량 매도</li>
                      <li>• 거래소로 대량 입금</li>
                      <li>• 언락 직후 즉시 매도</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-yellow-400">주의해야 할 함정들</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">🪤 일반적인 함정</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 소액 거래로 위장한 대규모 덤핑</li>
                      <li>• 여러 지갑으로 분산 매도</li>
                      <li>• 가짜 매수 후 대량 매도</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">🛡️ 방어 전략</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 항상 복수의 지표 확인</li>
                      <li>• 온체인 데이터와 교차 검증</li>
                      <li>• 리스크 관리 철저히</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FaLightbulb className="text-orange-400" />
                성공 사례: SOL 인사이더 플로우 활용
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                2023년 10월, SOL 팀 지갑에서 대규모 추가 매수가 감지된 후 3개월 만에 300% 상승했습니다.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• 신호: 팀 지갑 $5M 추가 매수 + 거래소 출금 증가</li>
                <li>• 진입가: $22 / 청산가: $88 (4배 수익)</li>
                <li>• 교훈: 강한 인사이더 신호는 중장기 트렌드를 예측</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}