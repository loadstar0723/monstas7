'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUniversity, FaChartLine, FaExchangeAlt, FaArrowUp, FaArrowDown, FaEye } from 'react-icons/fa'
import { GiBank, GiPiggyBank } from 'react-icons/gi'
import { BiTransfer } from 'react-icons/bi'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  TreeMap, Sankey, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, RadialBarChart, RadialBar, PieChart, Pie
} from 'recharts'

interface InstitutionalData {
  timestamp: number
  
  // 기관 거래 메트릭
  spotVolume: number
  futuresVolume: number
  optionsVolume: number
  otcVolume: number
  
  // 기관별 플로우
  flows: {
    institution: string
    type: 'bank' | 'fund' | 'pension' | 'insurance' | 'corporate'
    netFlow: number
    buyVolume: number
    sellVolume: number
    position: 'long' | 'short' | 'neutral'
    avgPrice: number
  }[]
  
  // 포지션 데이터
  positions: {
    longPositions: number
    shortPositions: number
    netPositions: number
    openInterest: number
    fundingRate: number
  }
  
  // 파생상품 활동
  derivatives: {
    callVolume: number
    putVolume: number
    putCallRatio: number
    maxPain: number
    gamma: number
    vanna: number
  }
  
  // 스마트 머니 지표
  smartMoney: {
    accumulation: number
    distribution: number
    confidence: number
    trend: 'bullish' | 'bearish' | 'neutral'
  }
}

interface CustodyData {
  custodian: string
  holdings: number
  change24h: number
  change7d: number
  clients: number
  dominance: number
}

interface ETFFlow {
  ticker: string
  name: string
  inflow: number
  outflow: number
  netFlow: number
  aum: number
  premium: number
}

interface DarkPoolActivity {
  exchange: string
  volume: number
  avgSize: number
  blockTrades: number
  sentiment: 'accumulation' | 'distribution' | 'neutral'
}

interface Props {
  symbol: string
  onFlowAlert?: (alert: any) => void
  includeETFs?: boolean
  includeDarkPools?: boolean
}

export default function InstitutionalFlowTracking({
  symbol,
  onFlowAlert,
  includeETFs = true,
  includeDarkPools = true
}: Props) {
  const [institutionalData, setInstitutionalData] = useState<InstitutionalData | null>(null)
  const [historicalFlows, setHistoricalFlows] = useState<any[]>([])
  const [custodyData, setCustodyData] = useState<CustodyData[]>([])
  const [etfFlows, setEtfFlows] = useState<ETFFlow[]>([])
  const [darkPoolActivity, setDarkPoolActivity] = useState<DarkPoolActivity[]>([])
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h')
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)

  // 기관 데이터 수집
  useEffect(() => {
    const fetchInstitutionalData = async () => {
      try {
        // 실제로는 기관 데이터 API 사용 (CoinMetrics, Glassnode, etc.)
        const data = generateMockInstitutionalData()
        setInstitutionalData(data)
        
        // 히스토리컬 데이터
        const historical = generateHistoricalFlows(timeframe)
        setHistoricalFlows(historical)
        
        // 커스터디 데이터
        const custody = generateCustodyData()
        setCustodyData(custody)
        
        // ETF 플로우
        if (includeETFs) {
          const etfs = generateETFFlows()
          setEtfFlows(etfs)
        }
        
        // 다크풀 활동
        if (includeDarkPools) {
          const darkPools = generateDarkPoolData()
          setDarkPoolActivity(darkPools)
        }
        
        // 알림 체크
        checkForAlerts(data)
      } catch (error) {
        console.error('Error fetching institutional data:', error)
      }
    }

    fetchInstitutionalData()
    const interval = setInterval(fetchInstitutionalData, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [symbol, timeframe, includeETFs, includeDarkPools])

  // 모의 기관 데이터 생성
  const generateMockInstitutionalData = (): InstitutionalData => {
    const institutions = [
      { name: 'BlackRock', type: 'fund' as const },
      { name: 'Grayscale', type: 'fund' as const },
      { name: 'MicroStrategy', type: 'corporate' as const },
      { name: 'JP Morgan', type: 'bank' as const },
      { name: 'Fidelity', type: 'fund' as const },
      { name: 'Goldman Sachs', type: 'bank' as const },
      { name: 'Morgan Stanley', type: 'bank' as const },
      { name: 'ARK Invest', type: 'fund' as const }
    ]
    
    const flows = institutions.map(inst => {
      const buyVolume = Math.random() * 100000000
      const sellVolume = Math.random() * 80000000
      const netFlow = buyVolume - sellVolume
      
      return {
        institution: inst.name,
        type: inst.type,
        netFlow,
        buyVolume,
        sellVolume,
        position: netFlow > 10000000 ? 'long' as const : 
                  netFlow < -10000000 ? 'short' as const : 
                  'neutral' as const,
        avgPrice: 45000 + Math.random() * 5000
      }
    })
    
    const totalLong = Math.random() * 5000000000
    const totalShort = Math.random() * 4000000000
    
    return {
      timestamp: Date.now(),
      spotVolume: Math.random() * 10000000000,
      futuresVolume: Math.random() * 20000000000,
      optionsVolume: Math.random() * 5000000000,
      otcVolume: Math.random() * 3000000000,
      flows,
      positions: {
        longPositions: totalLong,
        shortPositions: totalShort,
        netPositions: totalLong - totalShort,
        openInterest: totalLong + totalShort,
        fundingRate: (Math.random() - 0.5) * 0.01
      },
      derivatives: {
        callVolume: Math.random() * 1000000000,
        putVolume: Math.random() * 800000000,
        putCallRatio: 0.8 + Math.random() * 0.4,
        maxPain: 45000,
        gamma: Math.random() * 1000000,
        vanna: Math.random() * 500000
      },
      smartMoney: {
        accumulation: Math.random() * 100,
        distribution: Math.random() * 100,
        confidence: Math.random() * 100,
        trend: Math.random() > 0.5 ? 'bullish' : 'bearish'
      }
    }
  }

  // 히스토리컬 플로우 생성
  const generateHistoricalFlows = (timeframe: string) => {
    const periods = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30
    const data = []
    
    for (let i = 0; i < periods; i++) {
      data.push({
        time: timeframe === '24h' 
          ? `${i}:00`
          : new Date(Date.now() - (periods - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        institutional: Math.random() * 1000000000 - 500000000,
        retail: Math.random() * 500000000 - 250000000,
        smart: Math.random() * 200000000 - 100000000,
        cumulative: 0
      })
    }
    
    // 누적 계산
    let cumulative = 0
    data.forEach(d => {
      cumulative += d.institutional
      d.cumulative = cumulative
    })
    
    return data
  }

  // 커스터디 데이터 생성
  const generateCustodyData = (): CustodyData[] => {
    return [
      {
        custodian: 'Coinbase Custody',
        holdings: 950000,
        change24h: 2.5,
        change7d: 5.8,
        clients: 450,
        dominance: 28.5
      },
      {
        custodian: 'Grayscale',
        holdings: 650000,
        change24h: -1.2,
        change7d: -3.5,
        clients: 0,
        dominance: 19.5
      },
      {
        custodian: 'Fidelity Digital',
        holdings: 420000,
        change24h: 3.8,
        change7d: 12.5,
        clients: 280,
        dominance: 12.6
      },
      {
        custodian: 'BitGo',
        holdings: 380000,
        change24h: 1.5,
        change7d: 4.2,
        clients: 1200,
        dominance: 11.4
      },
      {
        custodian: 'Bakkt',
        holdings: 220000,
        change24h: 0.8,
        change7d: 2.1,
        clients: 150,
        dominance: 6.6
      }
    ]
  }

  // ETF 플로우 생성
  const generateETFFlows = (): ETFFlow[] => {
    return [
      {
        ticker: 'GBTC',
        name: 'Grayscale Bitcoin Trust',
        inflow: Math.random() * 100000000,
        outflow: Math.random() * 120000000,
        netFlow: 0,
        aum: 15000000000,
        premium: -15.5
      },
      {
        ticker: 'BITO',
        name: 'ProShares Bitcoin Strategy',
        inflow: Math.random() * 50000000,
        outflow: Math.random() * 30000000,
        netFlow: 0,
        aum: 1200000000,
        premium: 0.5
      },
      {
        ticker: 'BTF',
        name: 'Valkyrie Bitcoin Strategy',
        inflow: Math.random() * 20000000,
        outflow: Math.random() * 15000000,
        netFlow: 0,
        aum: 80000000,
        premium: 0.2
      }
    ].map(etf => ({
      ...etf,
      netFlow: etf.inflow - etf.outflow
    }))
  }

  // 다크풀 데이터 생성
  const generateDarkPoolData = (): DarkPoolActivity[] => {
    return [
      {
        exchange: 'Coinbase Prime',
        volume: Math.random() * 500000000,
        avgSize: Math.random() * 5000000 + 1000000,
        blockTrades: Math.floor(Math.random() * 50) + 10,
        sentiment: Math.random() > 0.5 ? 'accumulation' : 'distribution'
      },
      {
        exchange: 'Kraken Dark Pool',
        volume: Math.random() * 300000000,
        avgSize: Math.random() * 3000000 + 500000,
        blockTrades: Math.floor(Math.random() * 30) + 5,
        sentiment: 'neutral'
      },
      {
        exchange: 'Binance OTC',
        volume: Math.random() * 800000000,
        avgSize: Math.random() * 10000000 + 2000000,
        blockTrades: Math.floor(Math.random() * 80) + 20,
        sentiment: Math.random() > 0.6 ? 'accumulation' : 'distribution'
      }
    ]
  }

  // 알림 체크
  const checkForAlerts = (data: InstitutionalData) => {
    const newAlerts = []
    
    // 대규모 기관 플로우
    const largeFlows = data.flows.filter(f => Math.abs(f.netFlow) > 50000000)
    largeFlows.forEach(flow => {
      newAlerts.push({
        type: 'large_flow',
        severity: Math.abs(flow.netFlow) > 100000000 ? 'high' : 'medium',
        message: `${flow.institution}: ${flow.netFlow > 0 ? '매수' : '매도'} $${Math.abs(flow.netFlow / 1000000).toFixed(1)}M`,
        timestamp: Date.now()
      })
    })
    
    // 스마트 머니 신호
    if (data.smartMoney.confidence > 80) {
      newAlerts.push({
        type: 'smart_money',
        severity: 'high',
        message: `스마트 머니 ${data.smartMoney.trend === 'bullish' ? '매집' : '분산'} 신호 (신뢰도: ${data.smartMoney.confidence.toFixed(0)}%)`,
        timestamp: Date.now()
      })
    }
    
    // Put/Call 비율 극단값
    if (data.derivatives.putCallRatio > 1.2 || data.derivatives.putCallRatio < 0.6) {
      newAlerts.push({
        type: 'derivatives',
        severity: 'medium',
        message: `Put/Call 비율 이상: ${data.derivatives.putCallRatio.toFixed(2)}`,
        timestamp: Date.now()
      })
    }
    
    setAlerts(prev => [...newAlerts, ...prev.slice(0, 10)])
    
    if (onFlowAlert && newAlerts.length > 0) {
      newAlerts.forEach(alert => onFlowAlert(alert))
    }
  }

  // 색상 함수
  const getFlowColor = (flow: number): string => {
    if (flow > 0) return '#10B981'
    return '#EF4444'
  }

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 p-6 rounded-lg border border-emerald-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <GiBank className="text-emerald-400" />
            기관 자금 추적
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="24h">24시간</option>
              <option value="7d">7일</option>
              <option value="30d">30일</option>
            </select>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">매수</span>
              <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
              <span className="text-gray-300">매도</span>
            </div>
          </div>
        </div>

        {/* 주요 지표 */}
        {institutionalData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="text-gray-400 text-sm mb-1">현물 거래량</div>
              <div className="text-xl font-bold text-white">
                ${(institutionalData.spotVolume / 1000000000).toFixed(2)}B
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="text-gray-400 text-sm mb-1">선물 거래량</div>
              <div className="text-xl font-bold text-blue-400">
                ${(institutionalData.futuresVolume / 1000000000).toFixed(2)}B
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="text-gray-400 text-sm mb-1">순 포지션</div>
              <div className={`text-xl font-bold ${
                institutionalData.positions.netPositions > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${(Math.abs(institutionalData.positions.netPositions) / 1000000000).toFixed(2)}B
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="text-gray-400 text-sm mb-1">스마트 머니</div>
              <div className={`text-xl font-bold ${
                institutionalData.smartMoney.trend === 'bullish' ? 'text-green-400' : 'text-red-400'
              }`}>
                {institutionalData.smartMoney.trend === 'bullish' ? '매집' : '분산'}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* 실시간 알림 */}
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert, index) => (
          <motion.div
            key={`${alert.timestamp}-${index}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              alert.severity === 'high' ? 'bg-red-900/30 border-red-500' :
              'bg-yellow-900/30 border-yellow-500'
            }`}
          >
            <FaUniversity className={
              alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
            } />
            <span className="text-white text-sm">{alert.message}</span>
            <span className="text-gray-400 text-xs ml-auto">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 기관별 플로우 */}
      {institutionalData && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4">주요 기관 자금 흐름</h4>
          <div className="space-y-2">
            {institutionalData.flows
              .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
              .slice(0, 8)
              .map((flow) => (
                <motion.div
                  key={flow.institution}
                  whileHover={{ scale: 1.01 }}
                  className="p-3 bg-gray-700/50 rounded-lg cursor-pointer"
                  onClick={() => setSelectedInstitution(flow.institution)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {flow.type === 'bank' && <FaUniversity className="text-blue-400" />}
                      {flow.type === 'fund' && <GiPiggyBank className="text-purple-400" />}
                      {flow.type === 'corporate' && <FaChartLine className="text-green-400" />}
                      <span className="text-white font-semibold">{flow.institution}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        flow.position === 'long' ? 'bg-green-500/20 text-green-400' :
                        flow.position === 'short' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {flow.position.toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-xl font-bold ${
                      flow.netFlow > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {flow.netFlow > 0 ? '+' : ''}${(flow.netFlow / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">매수</span>
                      <div className="text-green-400">${(flow.buyVolume / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <span className="text-gray-400">매도</span>
                      <div className="text-red-400">${(flow.sellVolume / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <span className="text-gray-400">평균가</span>
                      <div className="text-white">${flow.avgPrice.toFixed(0)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* 자금 흐름 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">시간대별 자금 흐름</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={historicalFlows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `$${(value / 1000000).toFixed(1)}M`}
            />
            <Legend />
            
            <Bar yAxisId="left" dataKey="institutional" name="기관">
              {historicalFlows.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.institutional > 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              name="누적"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 커스터디 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaEye className="text-blue-400" />
            주요 커스터디 보유량
          </h4>
          <div className="space-y-3">
            {custodyData.map((custody, index) => (
              <div key={custody.custodian} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{custody.custodian}</span>
                  <span className="text-gray-400 text-sm">{custody.dominance.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">보유량</span>
                    <span className="text-white font-bold">{custody.holdings.toLocaleString()} BTC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={custody.change24h > 0 ? 'text-green-400' : 'text-red-400'}>
                      {custody.change24h > 0 ? '+' : ''}{custody.change24h.toFixed(1)}%
                    </span>
                    <span className="text-gray-500">24h</span>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${custody.dominance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 파생상품 지표 */}
        {institutionalData && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-purple-400" />
              파생상품 활동
            </h4>
            <div className="space-y-4">
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Put/Call 비율</span>
                  <span className={`text-xl font-bold ${
                    institutionalData.derivatives.putCallRatio > 1 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {institutionalData.derivatives.putCallRatio.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {institutionalData.derivatives.putCallRatio > 1 ? '약세 신호' : '강세 신호'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-gray-400 text-sm">콜 거래량</div>
                  <div className="text-green-400 font-bold">
                    ${(institutionalData.derivatives.callVolume / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-gray-400 text-sm">풋 거래량</div>
                  <div className="text-red-400 font-bold">
                    ${(institutionalData.derivatives.putVolume / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Pain</span>
                  <span className="text-white font-bold">${institutionalData.derivatives.maxPain.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-400">Gamma Exposure</span>
                  <span className="text-purple-400">${(institutionalData.derivatives.gamma / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ETF 플로우 */}
      {includeETFs && etfFlows.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BiTransfer className="text-yellow-400" />
            ETF 자금 흐름
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left p-2">ETF</th>
                  <th className="text-right p-2">유입</th>
                  <th className="text-right p-2">유출</th>
                  <th className="text-right p-2">순 흐름</th>
                  <th className="text-right p-2">AUM</th>
                  <th className="text-right p-2">프리미엄</th>
                </tr>
              </thead>
              <tbody>
                {etfFlows.map((etf) => (
                  <tr key={etf.ticker} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-2">
                      <div>
                        <div className="text-white font-semibold">{etf.ticker}</div>
                        <div className="text-gray-400 text-xs">{etf.name}</div>
                      </div>
                    </td>
                    <td className="text-right p-2 text-green-400">
                      ${(etf.inflow / 1000000).toFixed(1)}M
                    </td>
                    <td className="text-right p-2 text-red-400">
                      ${(etf.outflow / 1000000).toFixed(1)}M
                    </td>
                    <td className={`text-right p-2 font-bold ${
                      etf.netFlow > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {etf.netFlow > 0 ? '+' : ''}${(etf.netFlow / 1000000).toFixed(1)}M
                    </td>
                    <td className="text-right p-2 text-white">
                      ${(etf.aum / 1000000000).toFixed(2)}B
                    </td>
                    <td className={`text-right p-2 ${
                      etf.premium > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {etf.premium > 0 ? '+' : ''}{etf.premium.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 다크풀 활동 */}
      {includeDarkPools && darkPoolActivity.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaExchangeAlt className="text-indigo-400" />
            다크풀 활동
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {darkPoolActivity.map((pool) => (
              <motion.div
                key={pool.exchange}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">{pool.exchange}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    pool.sentiment === 'accumulation' ? 'bg-green-500/20 text-green-400' :
                    pool.sentiment === 'distribution' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {pool.sentiment === 'accumulation' ? '매집' :
                     pool.sentiment === 'distribution' ? '분산' : '중립'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">거래량</span>
                    <span className="text-white font-bold">
                      ${(pool.volume / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">평균 크기</span>
                    <span className="text-white">
                      ${(pool.avgSize / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">블록 거래</span>
                    <span className="text-purple-400 font-bold">
                      {pool.blockTrades}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}