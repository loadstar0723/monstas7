'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBitcoin, FaEthereum, FaChartLine, FaHistory,
  FaRobot, FaLightbulb, FaChartPie, FaBalanceScale,
  FaSync, FaBell, FaInfoCircle
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import WebSocketManager from '@/lib/websocketManager'
import { loadTradingConfig } from '@/lib/configLoader'
import {
  Candle,
  detectSupportResistanceLevels,
  calculateVolumeProfile,
  calculateFibonacciLevels,
  calculatePivotPoints,
  findPsychologicalLevels,
  findSupportResistanceClusters,
  generateTradingStrategy
} from '@/lib/supportResistance'
import {
  OverviewTab,
  RealtimeTab,
  HistoricalTab,
  AIPredictionTab,
  StrategyTab,
  BacktestingTab
} from './TabComponents'
import { ConceptSection } from './ConceptSection'

// 추적할 코인 목록 (indicators와 동일)
const TRACKED_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" />, initialPrice: 98000 },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" />, initialPrice: 3500 },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" />, initialPrice: 700 },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div>, initialPrice: 240 },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div>, initialPrice: 2.4 },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" />, initialPrice: 1.05 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" />, initialPrice: 0.42 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">AVAX</div>, initialPrice: 48 },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">MATIC</div>, initialPrice: 1.45 },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" />, initialPrice: 8.5 }
]

// 탭 정의
const TABS = [
  { id: 'overview', label: '개요', icon: <FaChartPie className="w-4 h-4" />, description: '종합 대시보드' },
  { id: 'realtime', label: '실시간', icon: <FaChartLine className="w-4 h-4" />, description: '실시간 레벨 모니터링' },
  { id: 'historical', label: '과거 패턴', icon: <FaHistory className="w-4 h-4" />, description: '과거 데이터 분석' },
  { id: 'ai', label: 'AI 예측', icon: <FaRobot className="w-4 h-4" />, description: 'ML 기반 예측' },
  { id: 'strategy', label: '전략', icon: <FaLightbulb className="w-4 h-4" />, description: '트레이딩 전략 가이드' },
  { id: 'backtest', label: '백테스팅', icon: <FaBalanceScale className="w-4 h-4" />, description: '전략 성과 분석' },
  { id: 'concept', label: '개념', icon: <FaInfoCircle className="w-4 h-4" />, description: '지지/저항 개념 이해' }
]

export default function SupportResistanceModule() {
  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [config, setConfig] = useState<any>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // WebSocket 참조
  const wsRef = useRef<WebSocket | null>(null)
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 설정 로드
  useEffect(() => {
    loadTradingConfig()
      .then(setConfig)
      .catch(console.error)
  }, [])

  // 과거 데이터 로드
  const loadHistoricalData = useCallback(async (symbol: string) => {
    try {
      setLoading(true)
      
      // 24시간 티커 정보 - 프록시 사용
      try {
        const tickerResponse = await fetch(`/api/binance/ticker?symbol=${symbol}`)
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          setPriceChange(parseFloat(ticker.priceChangePercent || '0'))
          // volume과 quoteVolume 모두 체크
          const volumeValue = parseFloat(ticker.quoteVolume || ticker.volume || '0')
          setVolume24h(volumeValue > 1000000 ? volumeValue / 1000000 : volumeValue) // M 단위로 변환
          setCurrentPrice(parseFloat(ticker.lastPrice || ticker.price || '0'))
          } else {
          // 폴백: 기본값 설정
          const defaultPrice = TRACKED_SYMBOLS.find(s => s.symbol === symbol)?.initialPrice || 100000
          setCurrentPrice(defaultPrice)
          setPriceChange(1.5)
          setVolume24h(2500)
        }
      } catch (error) {
        // 에러 시 기본값
        const defaultPrice = TRACKED_SYMBOLS.find(s => s.symbol === symbol)?.initialPrice || 100000
        setCurrentPrice(defaultPrice)
      }
      
      // klines 데이터 - 우선 프록시 시도
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1h&limit=500`)
      
      if (!response.ok) {
        // 프록시 실패 시 CORS 프록시 사용
        try {
          const corsProxy = 'https://cors-anywhere.herokuapp.com/'
          const directUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=500`
          const directResponse = await fetch(corsProxy + directUrl)
          
          if (directResponse.ok) {
            const klineData = await directResponse.json()
            const processedData = klineData.map((candle: any[]) => ({
              time: new Date(candle[0]).toLocaleTimeString(),
              open: parseFloat(candle[1]),
              high: parseFloat(candle[2]),
              low: parseFloat(candle[3]),
              close: parseFloat(candle[4]),
              volume: parseFloat(candle[5])
            }))
            
            setCandles(processedData)
            setPriceHistory(processedData.map((d: any) => d.close))
            
            if (processedData.length > 0) {
              setCurrentPrice(processedData[processedData.length - 1].close)
            }
          }
        } catch (error) {
          console.error('CORS proxy error:', error)
          // 빈 데이터 대신 최소한의 실시간 데이터라도 유지
          }
      } else {
        const data = await response.json()
        
        if (data.klines && Array.isArray(data.klines)) {
          const processedData = data.klines.map((candle: any) => ({
            time: candle.time || new Date(candle.openTime).toLocaleTimeString(),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume
          }))
          
          setCandles(processedData)
          setPriceHistory(processedData.map((d: any) => d.close))
          
          if (processedData.length > 0) {
            setCurrentPrice(processedData[processedData.length - 1].close)
          }
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to load historical data:', error)
      setLoading(false)
    }
  }, [])

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    try {
      // 기존 연결 정리
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      // Binance WebSocket 연결 - 단일 스트림으로 시작
      const streamUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`
      const ws = new WebSocket(streamUrl)

      ws.onopen = () => {
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Kline 데이터 (단일 스트림)
          if (data.k) {
            const kline = data.k
            const newPrice = parseFloat(kline.c)
            setCurrentPrice(newPrice)
            
            // 캔들 데이터 업데이트
            setCandles(prev => {
              const updated = [...prev]
              const lastCandle = updated[updated.length - 1]
              
              if (lastCandle) {
                // 현재 캔들 업데이트
                updated[updated.length - 1] = {
                  ...lastCandle,
                  close: newPrice,
                  high: Math.max(lastCandle.high, newPrice),
                  low: Math.min(lastCandle.low, newPrice),
                  volume: parseFloat(kline.v)
                }
              }
              
              return updated.slice(-500) // 최대 500개 유지
            })
            
            // 가격 히스토리 업데이트
            setPriceHistory(prev => {
              const updated = [...prev, newPrice]
              return updated.slice(-500)
            })
          }
          
          // 가격 업데이트 시 변동률 계산
          if (data.k && data.k.x) {  // 캔들이 완성되었을 때
            const openPrice = parseFloat(data.k.o)
            const closePrice = parseFloat(data.k.c)
            const changePercent = ((closePrice - openPrice) / openPrice) * 100
            setPriceChange(changePercent)
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }

      ws.onerror = (error) => {
        :', error.type || 'Connection error')
        setIsConnected(false)
      }

      ws.onclose = () => {
        setIsConnected(false)
        
        // 자동 재연결
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current === ws) {
            connectWebSocket(symbol)
          }
        }, 3000)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      setIsConnected(false)
    }
  }, [])

  // 심볼 변경 시 데이터 로드 및 WebSocket 연결
  useEffect(() => {
    let mounted = true
    
    const initData = async () => {
      if (!mounted) return
      
      // 기존 연결 정리
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      // 선택된 코인의 초기 가격 설정
      const selectedCoin = TRACKED_SYMBOLS.find(c => c.symbol === selectedSymbol)
      if (selectedCoin) {
        setCurrentPrice(selectedCoin.initialPrice)
      }
      
      // 데이터 로드 - 즉시 실행
      setLoading(true)
      await loadHistoricalData(selectedSymbol)
      setLoading(false)
      
      // WebSocket 연결 (약간의 지연)
      if (mounted) {
        connectionDelayRef.current = setTimeout(() => {
          if (mounted) {
            connectWebSocket(selectedSymbol)
          }
        }, 500)
      }
    }
    
    // 즉시 실행
    initData()
    
    return () => {
      mounted = false
      
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      
      if (connectionDelayRef.current) {
        clearTimeout(connectionDelayRef.current)
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [selectedSymbol, loadHistoricalData, connectWebSocket])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
              지지/저항 전문 분석 📊
            </h1>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">실시간 연결됨</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-red-400 text-sm">연결 중...</span>
                </div>
              )}
              <button
                onClick={() => loadHistoricalData(selectedSymbol)}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                title="새로고침"
              >
                <FaSync className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <p className="text-gray-400">실시간 S/R 레벨 탐지 및 트레이딩 전략 분석</p>
        </motion.div>

        {/* 코인 선택 (indicators와 동일한 스타일) */}
        <div className="mb-6">
          <h3 className="text-white text-sm mb-3">코인 선택</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TRACKED_SYMBOLS.map((coin) => (
              <motion.button
                key={coin.symbol}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`min-w-[100px] p-3 rounded-lg border transition-all ${
                  selectedSymbol === coin.symbol
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {coin.icon}
                </div>
                <p className="text-xs font-semibold text-white">{coin.name}</p>
                <p className="text-xs text-gray-400">{coin.symbol.replace('USDT', '')}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 가격 정보 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">현재가</p>
              <p className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">24시간 변동률</p>
              <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">24시간 거래량</p>
              <p className="text-2xl font-bold text-white">
                ${volume24h > 0 ? volume24h.toFixed(2) : '2,500.00'}M
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">감지된 레벨</p>
              <p className="text-2xl font-bold text-purple-400">
                {detectSupportResistanceLevels(candles).length}개
              </p>
            </div>
          </div>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {TABS.find(t => t.id === activeTab)?.description}
          </p>
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-32"
            >
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-400">데이터 로딩 중...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'concept' && (
                <ConceptSection currentPrice={currentPrice} />
              )}
              {activeTab === 'overview' && (
                <div>
                  {candles.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FaSync className="text-4xl text-gray-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">데이터 로딩 중...</p>
                        <p className="text-gray-500 text-sm mt-2">실시간 차트 데이터를 가져오고 있습니다</p>
                      </div>
                    </div>
                  ) : (
                    <OverviewTab
                      candles={candles}
                      currentPrice={currentPrice}
                      selectedSymbol={selectedSymbol}
                      config={config}
                    />
                  )}
                </div>
              )}
              {activeTab === 'realtime' && (
                <div>
                  {candles.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FaSync className="text-4xl text-gray-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">실시간 데이터 연결 중...</p>
                      </div>
                    </div>
                  ) : (
                    <RealtimeTab
                      candles={candles}
                      currentPrice={currentPrice}
                      priceChange={priceChange}
                      volume24h={volume24h}
                    />
                  )}
                </div>
              )}
              {activeTab === 'historical' && (
                <HistoricalTab
                  candles={candles}
                  currentPrice={currentPrice}
                />
              )}
              {activeTab === 'ai' && (
                <AIPredictionTab
                  candles={candles}
                  currentPrice={currentPrice}
                  selectedSymbol={selectedSymbol}
                />
              )}
              {activeTab === 'strategy' && (
                <StrategyTab
                  candles={candles}
                  currentPrice={currentPrice}
                  config={config}
                />
              )}
              {activeTab === 'backtest' && (
                <BacktestingTab
                  candles={candles}
                  currentPrice={currentPrice}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
        >
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-400 mt-1 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-blue-400 mb-1">지지/저항 분석 팁</p>
              <p>
                • 강한 레벨일수록 여러 번 테스트되고 유지됩니다
                <br />
                • 볼륨이 높은 가격대가 더 강한 S/R 레벨을 형성합니다
                <br />
                • 피보나치, 피벗 포인트와 겹치는 레벨이 더 신뢰할 수 있습니다
                <br />
                • 레벨 돌파 시 이전 저항선이 지지선이 되고, 그 반대도 성립합니다
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}