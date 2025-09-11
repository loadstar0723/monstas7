'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, FaBell, FaFireAlt, FaWater, FaBalanceScale, 
  FaChartLine, FaBrain, FaExchangeAlt, FaHistory, FaCog, 
  FaTelegram, FaClock, FaFilter, FaSync, FaInfoCircle,
  FaPlay, FaPause, FaExpand, FaCompress, FaArrowUp, FaArrowDown,
  FaEye, FaBookOpen, FaRocket, FaShieldAlt, FaLightbulb,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa'

// 컴포넌트 임포트
import CoinSelector from './components/CoinSelector'
import ConceptGuide from './components/ConceptGuide'
import SpoofingHeatmap from './components/SpoofingHeatmap'
import DetectionPanel from './components/DetectionPanel'
import CancellationChart from './components/CancellationChart'
import WallDetector from './components/WallDetector'
import FlashOrderTracker from './components/FlashOrderTracker'
import VolumeManipulation from './components/VolumeManipulation'
import TradingStrategy from './components/TradingStrategy'
import HistoricalReplay from './components/HistoricalReplay'
import RiskScorecard from './components/RiskScorecard'
import AlertPanel from './components/AlertPanel'

// Hooks 임포트
import { useSpoofingWebSocket } from './hooks/useSpoofingWebSocket'
import { useSpoofingAnalysis } from './hooks/useSpoofingAnalysis'

// 타입 정의
interface OrderLevel {
  price: number
  amount: number
  total: number
  timestamp?: number
  lifespan?: number // 주문 생존 시간
  cancelled?: boolean // 취소 여부
  suspicious?: boolean // 스푸핑 의심
}

interface OrderbookData {
  bids: OrderLevel[]
  asks: OrderLevel[]
  lastUpdateId: number
  spread: number
  spreadPercent: number
  bestBid: number
  bestAsk: number
  timestamp: number
}

interface SpoofingMetrics {
  spoofingScore: number // 0-100
  cancellationRate: number // 취소율
  wallsDetected: number // 감지된 벽 수
  flashOrders: number // 플래시 오더 수
  volumeAnomaly: number // 볼륨 이상도
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 신뢰도
}

interface CoinDashboard {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  orderbook: OrderbookData | null
  metrics: SpoofingMetrics | null
  alerts: Alert[]
}

interface Alert {
  id: string
  type: 'spoofing' | 'wall' | 'flash' | 'volume' | 'pattern'
  severity: 'info' | 'warning' | 'danger' | 'critical'
  message: string
  timestamp: number
  data?: any
}

export default function SpoofingDetectorModule() {
  // 추적할 10개 코인
  const TRACKED_SYMBOLS = [
    { symbol: 'BTCUSDT', name: '비트코인' },
    { symbol: 'ETHUSDT', name: '이더리움' },
    { symbol: 'BNBUSDT', name: '바이낸스' },
    { symbol: 'SOLUSDT', name: '솔라나' },
    { symbol: 'XRPUSDT', name: '리플' },
    { symbol: 'ADAUSDT', name: '카르다노' },
    { symbol: 'DOGEUSDT', name: '도지' },
    { symbol: 'AVAXUSDT', name: '아발란체' },
    { symbol: 'MATICUSDT', name: '매틱' },
    { symbol: 'DOTUSDT', name: '폴카닷' }
  ]

  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview') // overview, detection, analysis, strategy, alerts
  const [coinDashboards, setCoinDashboards] = useState<Record<string, CoinDashboard>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showSettings, setShowSettings] = useState(false)
  
  // 설정 상태
  const [settings, setSettings] = useState({
    alertThreshold: 70, // 스푸핑 점수 임계값
    cancellationThreshold: 60, // 취소율 임계값
    wallMinSize: 10, // 최소 벽 크기 (BTC)
    flashTimeWindow: 1000, // 플래시 오더 시간 (ms)
    enableSound: true,
    enableNotifications: true
  })

  // WebSocket 연결
  const { 
    isConnected,
    orderbookData,
    tradeData,
    reconnect
  } = useSpoofingWebSocket(selectedSymbol)

  // 스푸핑 분석
  const analysis = useSpoofingAnalysis(orderbookData, settings)

  // 현재 선택된 코인의 대시보드
  const currentDashboard = coinDashboards[selectedSymbol]

  // 초기 로드
  useEffect(() => {
    // 각 코인별 초기 대시보드 설정
    const initialDashboards: Record<string, CoinDashboard> = {}
    TRACKED_SYMBOLS.forEach(coin => {
      initialDashboards[coin.symbol] = {
        symbol: coin.symbol,
        name: coin.name,
        price: 0,
        change24h: 0,
        volume24h: 0,
        orderbook: null,
        metrics: null,
        alerts: []
      }
    })
    setCoinDashboards(initialDashboards)
    setIsLoading(false)
    
    // 모든 코인의 가격 데이터 로드
    loadAllPrices()
    
    // 5초마다 가격 업데이트
    const priceInterval = setInterval(loadAllPrices, 5000)
    return () => clearInterval(priceInterval)
  }, [])
  
  // 모든 코인 가격 데이터 로드
  const loadAllPrices = async () => {
    try {
      const promises = TRACKED_SYMBOLS.map(async (coin) => {
        const response = await fetch(`/api/binance/ticker/24hr?symbol=${coin.symbol}`)
        if (response.ok) {
          const data = await response.json()
          return {
            symbol: coin.symbol,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.volume)
          }
        }
        return null
      })
      
      const results = await Promise.all(promises)
      
      setCoinDashboards(prev => {
        const updated = { ...prev }
        results.forEach(result => {
          if (result) {
            updated[result.symbol] = {
              ...updated[result.symbol],
              price: result.price,
              change24h: result.change24h,
              volume24h: result.volume24h
            }
          }
        })
        return updated
      })
    } catch (error) {
      console.error('Failed to load prices:', error)
    }
  }

  // 오더북 데이터 업데이트
  useEffect(() => {
    if (orderbookData && selectedSymbol) {
      setCoinDashboards(prev => ({
        ...prev,
        [selectedSymbol]: {
          ...prev[selectedSymbol],
          orderbook: orderbookData
        }
      }))
    }
  }, [orderbookData, selectedSymbol])

  // 분석 결과 업데이트
  useEffect(() => {
    if (analysis && selectedSymbol) {
      setCoinDashboards(prev => ({
        ...prev,
        [selectedSymbol]: {
          ...prev[selectedSymbol],
          metrics: analysis
        }
      }))

      // 알림 생성
      if (analysis.spoofingScore > settings.alertThreshold) {
        addAlert({
          type: 'spoofing',
          severity: analysis.riskLevel === 'critical' ? 'critical' : 'warning',
          message: `${selectedSymbol}: 스푸핑 감지 (점수: ${safeFixed(analysis.spoofingScore, 0)})`,
          data: analysis
        })
      }
    }
  }, [analysis, selectedSymbol, settings.alertThreshold])

  // 알림 추가 함수
  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)) // 최대 50개
    
    // 사운드 재생
    if (settings.enableSound && alert.severity !== 'info') {
      // 사운드 재생 로직
    }
  }, [settings.enableSound])

  // 심볼 변경 핸들러
  const handleSymbolChange = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
  }, [])

  // 탭 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'detection':
        return renderDetectionTab()
      case 'analysis':
        return renderAnalysisTab()
      case 'strategy':
        return renderStrategyTab()
      case 'alerts':
        return renderAlertsTab()
      default:
        return renderOverviewTab()
    }
  }

  // 개요 탭
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* 개념 가이드 */}
      <ConceptGuide />
      
      {/* 메인 히트맵 */}
      <SpoofingHeatmap 
        orderbook={currentDashboard?.orderbook}
        symbol={selectedSymbol}
      />
      
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="스푸핑 점수"
          value={currentDashboard?.metrics?.spoofingScore || 0}
          unit="%"
          icon={<FaExclamationTriangle />}
          color={getSpoofingColor(currentDashboard?.metrics?.spoofingScore || 0)}
        />
        <MetricCard
          title="취소율"
          value={currentDashboard?.metrics?.cancellationRate || 0}
          unit="%"
          icon={<FaTimesCircle />}
          color="yellow"
        />
        <MetricCard
          title="감지된 벽"
          value={currentDashboard?.metrics?.wallsDetected || 0}
          unit="개"
          icon={<FaShieldAlt />}
          color="blue"
        />
        <MetricCard
          title="리스크 레벨"
          value={currentDashboard?.metrics?.riskLevel || 'low'}
          icon={<FaFireAlt />}
          color={getRiskColor(currentDashboard?.metrics?.riskLevel || 'low')}
        />
      </div>
    </div>
  )

  // 감지 탭
  const renderDetectionTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetectionPanel 
          orderbook={currentDashboard?.orderbook}
          settings={settings}
        />
        <WallDetector
          orderbook={currentDashboard?.orderbook}
          minSize={settings.wallMinSize}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FlashOrderTracker
          orderbook={currentDashboard?.orderbook}
          timeWindow={settings.flashTimeWindow}
        />
        <VolumeManipulation
          orderbook={currentDashboard?.orderbook}
          trades={tradeData}
        />
      </div>
    </div>
  )

  // 분석 탭
  const renderAnalysisTab = () => (
    <div className="space-y-6">
      <CancellationChart
        orderbook={currentDashboard?.orderbook}
        symbol={selectedSymbol}
      />
      
      <HistoricalReplay
        symbol={selectedSymbol}
      />
      
      <RiskScorecard
        metrics={currentDashboard?.metrics}
        orderbook={currentDashboard?.orderbook}
      />
    </div>
  )

  // 전략 탭
  const renderStrategyTab = () => (
    <div className="space-y-6">
      <TradingStrategy
        metrics={currentDashboard?.metrics}
        orderbook={currentDashboard?.orderbook}
        symbol={selectedSymbol}
      />
    </div>
  )

  // 알림 탭
  const renderAlertsTab = () => (
    <div className="space-y-6">
      <AlertPanel
        alerts={alerts}
        onClear={() => setAlerts([])}
      />
    </div>
  )

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">스푸핑 감지 시스템 초기화 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">
                🔍 스푸핑 감지 시스템
              </h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs text-gray-400">
                  {isConnected ? '실시간 연결됨' : '연결 끊김'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 뷰 모드 */}
              <button
                onClick={() => setViewMode(viewMode === 'simple' ? 'advanced' : 'simple')}
                className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
              >
                {viewMode === 'simple' ? '고급 모드' : '간단 모드'}
              </button>
              
              {/* 설정 */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <FaCog />
              </button>
              
              {/* 새로고침 */}
              <button
                onClick={reconnect}
                className="p-2 text-gray-400 hover:text-white"
              >
                <FaSync className={autoRefresh ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 코인 선택기 */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CoinSelector
            symbols={TRACKED_SYMBOLS}
            selected={selectedSymbol}
            onChange={handleSymbolChange}
            dashboards={coinDashboards}
          />
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: '개요', icon: <FaChartBar /> },
              { id: 'detection', label: '실시간 감지', icon: <FaEye /> },
              { id: 'analysis', label: '분석', icon: <FaBrain /> },
              { id: 'strategy', label: '전략', icon: <FaRocket /> },
              { id: 'alerts', label: '알림', icon: <FaBell /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </div>

      {/* 설정 모달 */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

// 메트릭 카드 컴포넌트
const MetricCard = ({ title, value, unit, icon, color }: any) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{title}</span>
      <span className={`text-${color}-500`}>{icon}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-white">
        {typeof value === 'number' ? safeFixed(value, 1) : value}
      </span>
      {unit && <span className="text-gray-400 text-sm">{unit}</span>}
    </div>
  </div>
)

// 설정 모달 컴포넌트
const SettingsModal = ({ settings, onUpdate, onClose }: any) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4">
      <h2 className="text-xl font-bold text-white mb-4">설정</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm">스푸핑 알림 임계값</label>
          <input
            type="range"
            min="50"
            max="100"
            value={settings.alertThreshold}
            onChange={(e) => onUpdate({ ...settings, alertThreshold: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-white">{settings.alertThreshold}%</span>
        </div>
        
        <div>
          <label className="text-gray-400 text-sm">취소율 임계값</label>
          <input
            type="range"
            min="30"
            max="90"
            value={settings.cancellationThreshold}
            onChange={(e) => onUpdate({ ...settings, cancellationThreshold: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-white">{settings.cancellationThreshold}%</span>
        </div>
        
        <div>
          <label className="text-gray-400 text-sm">최소 벽 크기 (BTC)</label>
          <input
            type="number"
            value={settings.wallMinSize}
            onChange={(e) => onUpdate({ ...settings, wallMinSize: Number(e.target.value) })}
            className="w-full bg-gray-800 text-white rounded px-3 py-2"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enableSound}
            onChange={(e) => onUpdate({ ...settings, enableSound: e.target.checked })}
          />
          <label className="text-gray-400">사운드 알림</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enableNotifications}
            onChange={(e) => onUpdate({ ...settings, enableNotifications: e.target.checked })}
          />
          <label className="text-gray-400">브라우저 알림</label>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
)

// 유틸리티 함수
const getSpoofingColor = (score: number) => {
  if (score >= 80) return 'red'
  if (score >= 60) return 'yellow'
  return 'green'
}

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    default: return 'green'
  }
}