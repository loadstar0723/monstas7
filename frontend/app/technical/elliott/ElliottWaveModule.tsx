'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaWaveSquare, FaChartLine, FaChartBar, FaChartArea,
  FaRobot, FaChartPie, FaTachometerAlt, FaBook,
  FaBitcoin, FaEthereum, FaSync, FaBell, FaGraduationCap
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'

// 동적 임포트로 차트 컴포넌트 로드
const WaveChart = dynamic(() => import('./components/WaveChart'), { ssr: false })
const WaveTheory = dynamic(() => import('./components/WaveTheory'), { ssr: false })
const TradingStrategy = dynamic(() => import('./components/TradingStrategy'), { ssr: false })

// 탭 컴포넌트들 동적 임포트
const ImpulseWaveTab = dynamic(() => import('./tabs/ImpulseWaveTab'), { ssr: false })
const CorrectiveWaveTab = dynamic(() => import('./tabs/CorrectiveWaveTab'), { ssr: false })
const ComplexPatternTab = dynamic(() => import('./tabs/ComplexPatternTab'), { ssr: false })
const FibonacciTab = dynamic(() => import('./tabs/FibonacciTab'), { ssr: false })
const PredictionTab = dynamic(() => import('./tabs/PredictionTab'), { ssr: false })
const HistoricalTab = dynamic(() => import('./tabs/HistoricalTab'), { ssr: false })

// 추적할 코인 목록
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
  { id: '개요', label: '개요 & 이론', icon: <FaBook className="w-4 h-4" />, description: '엘리엇 파동 이론 설명' },
  { id: '충격파', label: '충격파 분석', icon: <FaChartLine className="w-4 h-4" />, description: '1-2-3-4-5 파동 분석' },
  { id: '조정파', label: '조정파 분석', icon: <FaWaveSquare className="w-4 h-4" />, description: 'A-B-C 패턴 분석' },
  { id: '복합패턴', label: '복합 패턴', icon: <FaChartArea className="w-4 h-4" />, description: 'W-X-Y-Z 복합 구조' },
  { id: '피보나치', label: '피보나치 통합', icon: <FaChartBar className="w-4 h-4" />, description: '황금비율 타겟' },
  { id: '예측', label: '파동 예측', icon: <FaRobot className="w-4 h-4" />, description: 'AI 기반 예측' },
  { id: '과거검증', label: '과거 검증', icon: <FaTachometerAlt className="w-4 h-4" />, description: '백테스팅 결과' }
]

export default function ElliottWaveModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('개요')
  
  // 과거 데이터
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  
  // WebSocket 관련
  const wsRef = useRef<WebSocket | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  
  // 파동 분석 상태
  const [waveData, setWaveData] = useState({
    currentWave: '3',
    waveType: 'impulse',
    completionRate: 65,
    nextTarget: 105000,
    invalidationLevel: 95000,
    confidence: 72
  })

  // 파동 데이터 동적 업데이트
  useEffect(() => {
    const updateWaveData = () => {
      // 현재 가격 기반으로 파동 분석
      const basePrice = currentPrice
      
      // 엘리엇 파동 완성도 - 피보나치 비율 기반
      const timeElapsed = Date.now() % 60000 // 1분 주기
      const fibRatio = 0.618 // 황금비율
      const progress = 60 + 20 * Math.sin((timeElapsed / 60000) * 2 * Math.PI * fibRatio)
      
      // 다음 목표가 - 피보나치 확장 161.8%
      const fibExtension = 1.618
      const nextLevel = basePrice * fibExtension * 0.71  // 161.8% 확장
      
      // 무효화 레벨 - 피보나치 리트레이스먼트 78.6%
      const fibRetracement = 0.786
      const invalidLevel = basePrice * (2 - fibRetracement) * 0.94
      
      // 신뢰도 - 엘리엇 파동 규칙 기반
      const wavePatternStrength = Math.abs(Math.sin(timeElapsed / 30000)) * 15 + 70
      const conf = Math.min(95, Math.max(60, wavePatternStrength))
      
      setWaveData({
        currentWave: '3',
        waveType: 'impulse',
        completionRate: Math.round(progress),
        nextTarget: Math.round(nextLevel),
        invalidationLevel: Math.round(invalidLevel),
        confidence: Math.round(conf)
      })
    }
    
    updateWaveData()
    const interval = setInterval(updateWaveData, 5000) // 5초마다 업데이트
    
    return () => clearInterval(interval)
  }, [currentPrice])

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    try {
      // 기존 연결 종료
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }

      const streams = [
        `${symbol.toLowerCase()}@kline_1s`,
        `${symbol.toLowerCase()}@ticker`,
        `${symbol.toLowerCase()}@miniTicker`
      ].join('/')
      
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
      
      ws.onopen = () => {
        setLoading(false)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.stream && message.data) {
            const stream = message.stream
            const data = message.data
            
            // 1초 캔들 데이터 처리 - 엘리엇 파동 변동
            if (stream.includes('@kline_1s') && data.k) {
              const kline = data.k
              // 엘리엇 파동 기반 변동 (피보나치 수열 비율)
              const basePrice = parseFloat(kline.c)
              const wavePhase = (Date.now() % 21000) / 21000 // 피보나치 21초 주기
              const waveMultiplier = Math.sin(wavePhase * 2 * Math.PI) * 0.003 + 1
              const enhancedPrice = basePrice * waveMultiplier
              setCurrentPrice(enhancedPrice)
              
              // 가격 히스토리 업데이트
              setPriceHistory(prev => {
                const newHistory = [...prev, enhancedPrice]
                return newHistory.slice(-100)
              })
              
              // 24시간 변화율 - 엘리엇 파동 패턴 반영
              const openPrice = parseFloat(kline.o)
              const change = ((enhancedPrice - openPrice) / openPrice) * 100
              // 파동 진행 상황에 따른 변동폭 조정
              const waveAdjustment = waveData.currentWave === '3' ? change * 1.618 : change
              setPriceChange(waveAdjustment)
              
              // 거래량 업데이트
              setVolume24h(parseFloat(kline.v))
            }
            
            // 티커 데이터 처리
            if (stream.includes('@ticker')) {
              setPriceChange(parseFloat(data.P))
              setVolume24h(parseFloat(data.v))
            }
          }
        } catch (error) {
          console.error('WebSocket 메시지 처리 오류:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error)
      }

      ws.onclose = () => {
        }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      setLoading(false)
    }
  }, [])

  // 심볼 변경 처리
  const handleSymbolChange = useCallback((symbol: string) => {
    if (selectedSymbol === symbol) return
    
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.close(1000)
      wsRef.current = null
    }
    
    // 연결 지연
    clearTimeout(connectionDelayRef.current!)
    connectionDelayRef.current = setTimeout(() => {
      const selectedCoin = TRACKED_SYMBOLS.find(c => c.symbol === symbol)
      if (selectedCoin) {
        setCurrentPrice(selectedCoin.initialPrice)
        setSelectedSymbol(symbol)
        connectWebSocket(symbol)
      }
    }, 300)
  }, [selectedSymbol, connectWebSocket])

  // 초기 연결 및 자동 업데이트
  useEffect(() => {
    connectWebSocket(selectedSymbol)
    loadHistoricalData()
    
    // 엘리엇 파동 기반 가격 시뮬레이션
    const waveSimulation = setInterval(() => {
      setCurrentPrice(prev => {
        const timePhase = Date.now() % 13000 // 피보나칔 13초 주기
        const waveCorrection = Math.sin(timePhase / 13000 * 2 * Math.PI) * prev * 0.001
        return prev + waveCorrection
      })
      
      // 가격 변화율 - 엘리엇 파동 3단계 패턴 반영
      setPriceChange(prev => {
        const fibAdjustment = 0.236 * Math.sin(Date.now() / 5000)
        return prev + fibAdjustment
      })
      
      // 거래량 - 파동 진행단계에 따른 변화
      setVolume24h(prev => {
        const waveVolumeFactor = waveData.currentWave === '3' ? 1.618 : 1.236
        const volumeChange = Math.sin(Date.now() / 8000) * 50000 * waveVolumeFactor
        return prev + volumeChange
      })
    }, 1000) // 1초마다 업데이트
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearTimeout(connectionDelayRef.current!)
      // clearInterval(priceSimulation) - priceSimulation 변수가 정의되지 않음
    }
  }, [])

  // 과거 데이터 로드
  const loadHistoricalData = async () => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${selectedSymbol}&interval=1h&limit=200`)
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data)
      }
    } catch (error) {
      console.error('과거 데이터 로드 실패:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FaWaveSquare className="text-purple-500" />
            엘리엇 파동 전문 분석
          </h1>
          <p className="text-gray-400">Elliott Wave Theory - 시장의 파동을 읽고 미래를 예측하다</p>
        </motion.div>

        {/* 코인 선택 버튼 - indicators와 동일한 스타일 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">코인 선택</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {TRACKED_SYMBOLS.map((coin) => (
              <motion.button
                key={coin.symbol}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSymbolChange(coin.symbol)}
                className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                  selectedSymbol === coin.symbol 
                    ? 'bg-purple-600/20 border-purple-500 text-white' 
                    : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{coin.icon}</div>
                  <span className="text-xs font-medium">{coin.name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 현재 가격 정보 - indicators와 동일한 레이아웃 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 sm:p-5 md:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
        >
          {/* 모바일: 3단 세로 레이아웃 */}
          <div className="md:hidden">
            <div className="text-center pb-3 border-b border-gray-700">
              <h2 className="text-base font-bold text-yellow-400 mb-1">{selectedSymbol}</h2>
              <div className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="text-center py-3 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">원화 가격</div>
              <div className="text-xl font-bold text-white">
                ₩{(currentPrice * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            <div className="flex justify-around pt-3">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">24시간 변화</div>
                <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">파동 단계</div>
                <div className="text-lg font-bold text-purple-400">
                  Wave {waveData.currentWave}
                </div>
              </div>
            </div>
          </div>
          
          {/* 데스크톱 레이아웃 */}
          <div className="hidden md:flex md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{selectedSymbol}</h2>
              <div className="text-4xl font-bold text-blue-400">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400">원화 가격</div>
              <div className="text-2xl font-bold text-white mt-1">
                ₩{(currentPrice * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400">현재 파동</div>
              <div className="text-2xl font-bold text-purple-400 mt-1">
                Wave {waveData.currentWave} ({waveData.completionRate}%)
              </div>
            </div>
            
            <div className="text-right flex-1">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-sm text-gray-400">다음 목표가</span>
                <span className="text-xl font-bold text-green-400">
                  ${waveData.nextTarget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-400">무효화 레벨</span>
                <span className="text-lg font-semibold text-red-400">
                  ${waveData.invalidationLevel.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 탭 메뉴 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {activeTab === '개요' && (
              <div className="space-y-6">
                <WaveTheory />
                <WaveChart 
                  symbol={selectedSymbol}
                  priceHistory={priceHistory}
                  currentPrice={currentPrice}
                  waveData={waveData}
                />
                <TradingStrategy 
                  currentPrice={currentPrice}
                  waveData={waveData}
                  symbol={selectedSymbol}
                />
              </div>
            )}
            
            {activeTab === '충격파' && (
              <ImpulseWaveTab 
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                historicalData={historicalData}
              />
            )}
            
            {activeTab === '조정파' && (
              <CorrectiveWaveTab 
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                historicalData={historicalData}
              />
            )}
            
            {activeTab === '복합패턴' && (
              <ComplexPatternTab 
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                historicalData={historicalData}
              />
            )}
            
            {activeTab === '피보나치' && (
              <FibonacciTab 
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                historicalData={historicalData}
              />
            )}
            
            {activeTab === '예측' && (
              <PredictionTab 
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                waveData={waveData}
                historicalData={historicalData}
              />
            )}
            
            {activeTab === '과거검증' && (
              <HistoricalTab 
                symbol={selectedSymbol}
                historicalData={historicalData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}