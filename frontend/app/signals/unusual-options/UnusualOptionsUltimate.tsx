'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  FaBitcoin, FaEthereum, FaChartLine, FaChartBar, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaBolt, FaFire, FaRocket, FaShieldAlt,
  FaClock, FaDollarSign, FaChartPie, FaBalanceScale, FaCoins
} from 'react-icons/fa'
import { 
  SiSolana, SiRipple, SiCardano, SiDogecoin, SiPolygon 
} from 'react-icons/si'
// Chart.js 컴포넌트 import
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

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

interface OptionsFlow {
  id: string
  symbol: string
  type: 'CALL' | 'PUT'
  strike: number
  expiry: string
  volume: number
  premium: number
  iv: number
  delta: number
  gamma: number
  unusualScore: number
  timestamp: Date
  exchange: string
}

interface GammaExposure {
  strike: number
  callGamma: number
  putGamma: number
  netGamma: number
}

export default function UnusualOptionsUltimate() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('concept')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [optionsFlows, setOptionsFlows] = useState<OptionsFlow[]>([])
  const [gammaExposure, setGammaExposure] = useState<GammaExposure[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [volumeHistory, setVolumeHistory] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = new WebSocket('wss://stream.binance.com:9443/ws')
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [`${symbol.toLowerCase()}@ticker`],
        id: 1
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.e === '24hrTicker') {
        setCurrentPrice(parseFloat(data.c))
      }
    }

    ws.onerror = (error) => {
      // WebSocket 에러 조용히 처리
      // console.error('WebSocket error:', error)
    }

    wsRef.current = ws
  }, [])

  // 옵션 플로우 데이터 가져오기
  const fetchOptionsFlow = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/binance/options-flow-v2?symbol=${selectedCoin}`)
      const data = await res.json()
      
      if (data.success) {
        setOptionsFlows(data.data.flows || [])
        setGammaExposure(data.data.gammaExposure || [])
        setStats(data.data.stats || {})
        
        // 볼륨 히스토리 생성
        const history = data.data.flows.slice(0, 10).map((flow: OptionsFlow, index: number) => ({
          time: new Date(flow.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          call: flow.type === 'CALL' ? flow.volume : 0,
          put: flow.type === 'PUT' ? flow.volume : 0,
          total: flow.volume
        }))
        setVolumeHistory(history)
      }
    } catch (error) {
      console.error('Options flow error:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCoin])

  useEffect(() => {
    connectWebSocket(selectedCoin)
    fetchOptionsFlow()
    
    const interval = setInterval(fetchOptionsFlow, 30000)
    
    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin, connectWebSocket, fetchOptionsFlow])

  const currentCoin = COINS.find(c => c.symbol === selectedCoin)
  const Icon = currentCoin?.icon || FaBitcoin

  // Chart.js 차트 데이터
  const volumeChartData = {
    labels: volumeHistory.map(v => v.time),
    datasets: [
      {
        label: 'Call Volume',
        data: volumeHistory.map(v => v.call),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1
      },
      {
        label: 'Put Volume',
        data: volumeHistory.map(v => v.put),
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    ]
  }

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF'
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB'
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      }
    }
  }

  return (
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

        {/* 코인 선택 버튼 */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
          {COINS.map((coin) => {
            const CoinIcon = coin.icon
            return (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin.symbol)}
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

        {/* 현재 가격 표시 */}
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

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'concept', label: '개념', icon: '📚' },
            { id: 'realtime', label: '실시간', icon: '⚡' },
            { id: 'analysis', label: '분석', icon: '📊' },
            { id: 'strategy', label: '전략', icon: '🎯' },
            { id: 'execution', label: '실행', icon: '🚀' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {activeTab === 'concept' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* 옵션 기초 개념 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-blue-400">
                  📖 옵션 거래 기초
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">CALL 옵션</h4>
                    <p className="text-sm text-gray-300">
                      특정 가격에 매수할 권리. 가격 상승 예상 시 구매
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400 mb-2">PUT 옵션</h4>
                    <p className="text-sm text-gray-300">
                      특정 가격에 매도할 권리. 가격 하락 예상 시 구매
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Strike Price</h4>
                    <p className="text-sm text-gray-300">
                      옵션 행사가격. 매수/매도 권리를 행사할 수 있는 가격
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">Expiry</h4>
                    <p className="text-sm text-gray-300">
                      옵션 만기일. 이 날짜까지만 권리 행사 가능
                    </p>
                  </div>
                </div>
              </div>

              {/* Greeks 설명 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  🎯 옵션 Greeks
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Delta (Δ)</span>
                    <span className="text-sm text-gray-300">가격 민감도</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gamma (Γ)</span>
                    <span className="text-sm text-gray-300">Delta 변화율</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Theta (Θ)</span>
                    <span className="text-sm text-gray-300">시간 가치 감소</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Vega (ν)</span>
                    <span className="text-sm text-gray-300">변동성 민감도</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rho (ρ)</span>
                    <span className="text-sm text-gray-300">금리 민감도</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="space-y-6">
              {/* 볼륨 히스토리 차트 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-purple-400">
                  📈 실시간 볼륨 추이
                </h3>
                <div style={{ height: '250px' }}>
                  <Bar data={volumeChartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* 시장 포지셔닝 분석 */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-yellow-400">시장 포지셔닝</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Put/Call Ratio</span>
                      <span className={`font-bold ${
                        stats.putCallRatio > 1 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {stats.putCallRatio?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">평균 IV</span>
                      <span className="font-bold text-purple-400">
                        {stats.avgIV?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Max Pain</span>
                      <span className="font-bold text-yellow-400">
                        ${stats.maxPain?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">OI Total</span>
                      <span className="font-bold text-blue-400">
                        {stats.totalOpenInterest?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 비정상 거래 알림 */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-red-400">
                    🚨 비정상 거래 감지
                  </h3>
                  <div className="space-y-2">
                    {optionsFlows.slice(0, 5).map((flow) => (
                      <div key={flow.id} className="flex items-center justify-between">
                        <span className={`text-sm ${
                          flow.type === 'CALL' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {flow.type} ${flow.strike}
                        </span>
                        <span className="text-xs text-gray-400">
                          Vol: {flow.volume.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 실시간 옵션 플로우 테이블 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-x-auto">
                <h3 className="text-lg font-bold mb-4 text-green-400">
                  💹 실시간 옵션 플로우
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Strike</th>
                      <th className="text-left py-2">Expiry</th>
                      <th className="text-left py-2">Volume</th>
                      <th className="text-left py-2">Premium</th>
                      <th className="text-left py-2">IV</th>
                      <th className="text-left py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsFlows.slice(0, 10).map((flow) => (
                      <tr key={flow.id} className="border-b border-gray-700/50">
                        <td className={`py-2 ${
                          flow.type === 'CALL' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {flow.type}
                        </td>
                        <td className="py-2">${flow.strike}</td>
                        <td className="py-2">{flow.expiry}</td>
                        <td className="py-2">{flow.volume.toLocaleString()}</td>
                        <td className="py-2">${flow.premium.toLocaleString()}</td>
                        <td className="py-2">{safeFixed(flow.iv, 1)}%</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            flow.unusualScore > 70 ? 'bg-red-500/20 text-red-400' :
                            flow.unusualScore > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {safeFixed(flow.unusualScore, 0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Gamma Exposure 히트맵 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  🔥 Gamma Exposure 히트맵
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {gammaExposure.map((gex) => {
                    const intensity = Math.abs(gex.netGamma) / 
                      Math.max(...gammaExposure.map(g => Math.abs(g.netGamma)))
                    return (
                      <div
                        key={gex.strike}
                        className="p-3 rounded text-center"
                        style={{
                          backgroundColor: gex.netGamma > 0 
                            ? `rgba(16, 185, 129, ${intensity * 0.5})`
                            : `rgba(239, 68, 68, ${intensity * 0.5})`,
                          border: `1px solid ${gex.netGamma > 0 ? '#10b981' : '#ef4444'}`
                        }}
                      >
                        <div className="text-xs font-bold">${gex.strike}</div>
                        <div className="text-xs mt-1">
                          {gex.netGamma > 0 ? '🟢' : '🔴'} {Math.abs(gex.netGamma).toFixed(0)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 시장 분석 인사이트 */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-bold mb-3 text-green-400">
                    📈 상승 신호
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Call 옵션 대량 매수</li>
                    <li>• Put/Call 비율 &lt; 0.7</li>
                    <li>• 높은 Call Gamma</li>
                    <li>• OTM Call 관심 증가</li>
                  </ul>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-bold mb-3 text-red-400">
                    📉 하락 신호
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Put 옵션 대량 매수</li>
                    <li>• Put/Call 비율 &gt; 1.3</li>
                    <li>• 높은 Put Gamma</li>
                    <li>• OTM Put 관심 증가</li>
                  </ul>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-bold mb-3 text-yellow-400">
                    ⚡ 변동성 신호
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• IV 급등 (&gt;100%)</li>
                    <li>• Straddle 대량 거래</li>
                    <li>• 양방향 옵션 증가</li>
                    <li>• Vega 민감도 상승</li>
                  </ul>
                </div>
              </div>

              {/* AI 예측 */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-500">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  🤖 AI 시장 예측
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">단기 전망 (1-3일)</h4>
                    <p className="text-gray-300">
                      현재 Put/Call 비율 {stats.putCallRatio?.toFixed(2)}와 
                      평균 IV {stats.avgIV?.toFixed(1)}% 기준으로 
                      {stats.putCallRatio > 1 ? ' 단기 하락 압력' : ' 단기 상승 모멘텀'}이 
                      예상됩니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">주요 레벨</h4>
                    <div className="space-y-1 text-sm">
                      <p>• Max Pain: ${stats.maxPain?.toLocaleString()}</p>
                      <p>• 현재가: ${currentPrice.toLocaleString()}</p>
                      <p>• 괴리율: {((currentPrice / stats.maxPain - 1) * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-6">
              {/* 트레이딩 전략 가이드 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-blue-400">
                    🎯 롱 포지션 전략
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-900/30 rounded border border-green-500/30">
                      <h4 className="font-semibold text-green-400 mb-2">진입 신호</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Call 대량 매수 감지</li>
                        <li>• P/C Ratio &lt; 0.7</li>
                        <li>• 현재가 &lt; Max Pain</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded">
                      <h4 className="font-semibold mb-2">리스크 관리</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• 손절: -3%</li>
                        <li>• 목표: +5~10%</li>
                        <li>• 포지션: 자본의 5%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-red-400">
                    📉 숏 포지션 전략
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-900/30 rounded border border-red-500/30">
                      <h4 className="font-semibold text-red-400 mb-2">진입 신호</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Put 대량 매수 감지</li>
                        <li>• P/C Ratio &gt; 1.3</li>
                        <li>• 현재가 &gt; Max Pain</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded">
                      <h4 className="font-semibold mb-2">리스크 관리</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• 손절: -2%</li>
                        <li>• 목표: +3~7%</li>
                        <li>• 포지션: 자본의 3%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 옵션 전략 매트릭스 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  📊 옵션 전략 매트릭스
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">전략</th>
                        <th className="text-left py-2">시장 전망</th>
                        <th className="text-left py-2">최대 수익</th>
                        <th className="text-left py-2">최대 손실</th>
                        <th className="text-left py-2">적합 상황</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 text-green-400">Long Call</td>
                        <td className="py-2">상승</td>
                        <td className="py-2">무제한</td>
                        <td className="py-2">프리미엄</td>
                        <td className="py-2">강한 상승 예상</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 text-red-400">Long Put</td>
                        <td className="py-2">하락</td>
                        <td className="py-2">Strike - 프리미엄</td>
                        <td className="py-2">프리미엄</td>
                        <td className="py-2">강한 하락 예상</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 text-yellow-400">Straddle</td>
                        <td className="py-2">큰 변동성</td>
                        <td className="py-2">무제한</td>
                        <td className="py-2">총 프리미엄</td>
                        <td className="py-2">방향성 불확실</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 text-purple-400">Iron Condor</td>
                        <td className="py-2">횡보</td>
                        <td className="py-2">순 크레딧</td>
                        <td className="py-2">스프레드 폭</td>
                        <td className="py-2">낮은 변동성</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-6">
              {/* 실시간 체크리스트 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  ✅ 실행 체크리스트
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">진입 전 확인</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'P/C Ratio 확인', value: stats.putCallRatio?.toFixed(2) },
                        { label: 'IV 레벨 체크', value: `${stats.avgIV?.toFixed(1)}%` },
                        { label: 'Max Pain 대비', value: `$${stats.maxPain?.toLocaleString()}` },
                        { label: '비정상 거래', value: `${stats.unusualFlowCount || 0}건` }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">포지션 관리</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-900/30 rounded border border-blue-500/30">
                        <p className="text-sm mb-2">권장 레버리지</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {stats.avgIV > 80 ? '1-2x' : stats.avgIV > 50 ? '2-3x' : '3-5x'}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-900/30 rounded border border-yellow-500/30">
                        <p className="text-sm mb-2">자본 배분</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {stats.unusualFlowCount > 10 ? '5-10%' : '3-5%'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 실시간 액션 플랜 */}
              <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg p-6 border border-green-500">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  🚀 즉시 실행 가능한 전략
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">현재 시장 상태</h4>
                      <span className={`px-3 py-1 rounded text-sm font-bold ${
                        stats.putCallRatio > 1 ? 'bg-red-500/20 text-red-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {stats.putCallRatio > 1 ? 'BEARISH' : 'BULLISH'}
                      </span>
                    </div>
                    <p className="text-gray-300">
                      {stats.putCallRatio > 1 
                        ? 'Put 옵션이 우세합니다. 하락 헤지 또는 역추세 전략 고려'
                        : 'Call 옵션이 우세합니다. 상승 추세 추종 전략 고려'}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-700/50 rounded text-center">
                      <p className="text-sm text-gray-400 mb-1">진입가</p>
                      <p className="text-xl font-bold text-green-400">
                        ${currentPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded text-center">
                      <p className="text-sm text-gray-400 mb-1">손절가</p>
                      <p className="text-xl font-bold text-red-400">
                        ${(currentPrice * 0.97).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded text-center">
                      <p className="text-sm text-gray-400 mb-1">목표가</p>
                      <p className="text-xl font-bold text-blue-400">
                        ${(currentPrice * 1.05).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/50">
                <h3 className="text-lg font-bold mb-3 text-red-400">
                  ⚠️ 리스크 경고
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 옵션 데이터는 지표일 뿐, 절대적 신호가 아닙니다</li>
                  <li>• 높은 IV는 큰 변동성을 의미하며 리스크가 높습니다</li>
                  <li>• Max Pain은 만기일에만 유효한 지표입니다</li>
                  <li>• 반드시 손절선을 설정하고 리스크 관리를 철저히 하세요</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}