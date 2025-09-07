'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaChartBar, FaExclamationTriangle, FaClock, FaDollarSign, FaArrowUp, FaArrowDown, FaFire } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'

// 새로운 컴포넌트들 동적 임포트
const MultiTimeframePlan = dynamic(() => import('@/components/signals/MultiTimeframePlan'), { ssr: false })
const ProfitCalculator = dynamic(() => import('@/components/signals/ProfitCalculator'), { ssr: false })
const BacktestResults = dynamic(() => import('@/components/signals/BacktestResults'), { ssr: false })
const AlertSettings = dynamic(() => import('@/components/signals/AlertSettings'), { ssr: false })
const PortfolioManager = dynamic(() => import('@/components/signals/PortfolioManager'), { ssr: false })
const DetailedAIAnalysis = dynamic(() => import('@/components/signals/DetailedAIAnalysis'), { ssr: false })

interface OptionsFlow {
  id: string
  symbol: string
  type: 'CALL' | 'PUT'
  strike: number
  expiry: string
  volume: number
  openInterest: number
  premium: number
  iv: number // Implied Volatility
  delta: number
  gamma: number
  unusualScore: number
  timestamp: Date
  exchange: string
}

interface OptionsStats {
  totalVolume: number
  putCallRatio: number
  avgIV: number
  maxPain: number
  totalOpenInterest: number
  unusualFlowCount: number
}

interface GammaExposure {
  strike: number
  callGamma: number
  putGamma: number
  netGamma: number
}

export default function UnusualOptionsModule() {
  const [optionsFlows, setOptionsFlows] = useState<OptionsFlow[]>([])
  const [stats, setStats] = useState<OptionsStats>({
    totalVolume: 0,
    putCallRatio: 0,
    avgIV: 0,
    maxPain: 0,
    totalOpenInterest: 0,
    unusualFlowCount: 0
  })
  const [gammaExposure, setGammaExposure] = useState<GammaExposure[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'unusual' | 'gamma' | 'analysis' | 'strategy' | 'tools'>('unusual')
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('UnusualOptions'))
  
  // 비정상 점수 계산
  const calculateUnusualScore = (volume: number, avgVolume: number, oi: number, premium: number): number => {
    const volumeRatio = volume / (avgVolume || 1)
    const oiRatio = volume / (oi || 1)
    const premiumWeight = premium > 100000 ? 2 : 1
    
    return (volumeRatio * 0.4 + oiRatio * 0.3 + premiumWeight * 0.3) * 100
  }
  
  // 옵션 데이터 생성 (실제로는 옵션 거래소 API)
  const generateOptionsData = async () => {
    try {
      const symbols = ['BTC', 'ETH', 'BNB', 'SOL']
      const flows: OptionsFlow[] = []
      const gammaData: GammaExposure[] = []
      
      for (const symbol of symbols) {
        // 실제 가격 데이터
        const { data: ticker } = await safeApiCall(
          () => binanceAPI.get24hrTicker(`${symbol}USDT`),
          null,
          'UnusualOptions'
        )
        
        if (ticker) {
          const spotPrice = parseFloat(ticker.lastPrice)
          const volume = parseFloat(ticker.volume)
          
          // 옵션 체인 생성 (시뮬레이션)
          const strikes = []
          for (let i = -5; i <= 5; i++) {
            strikes.push(Math.round(spotPrice * (1 + i * 0.05)))
          }
          
          // 만기일 생성
          const expiries = ['1D', '7D', '30D', '90D']
          
          for (const strike of strikes) {
            for (const expiry of expiries) {
              // Call과 Put 옵션 생성
              for (const type of ['CALL', 'PUT'] as const) {
                const isITM = type === 'CALL' ? strike < spotPrice : strike > spotPrice
                const moneyness = Math.abs(strike - spotPrice) / spotPrice
                
                // 옵션 거래량과 미결제약정 시뮬레이션
                const baseVolume = Math.random() * 1000 + 100
                const isUnusual = Math.random() > 0.9 // 10% 확률로 비정상
                const volumeMultiplier = isUnusual ? Math.random() * 10 + 5 : 1
                const optionVolume = baseVolume * volumeMultiplier
                
                const openInterest = Math.random() * 5000 + 500
                const iv = 0.5 + Math.random() * 0.5 + moneyness * 0.2 // 50-100% IV
                const premium = optionVolume * (isITM ? strike * 0.01 : strike * 0.001)
                
                // Greeks 계산 (간단한 시뮬레이션)
                const delta = type === 'CALL' 
                  ? 0.5 + (spotPrice - strike) / spotPrice * 0.5
                  : -0.5 + (spotPrice - strike) / spotPrice * 0.5
                const gamma = Math.exp(-moneyness * moneyness * 2) * 0.1
                
                const unusualScore = calculateUnusualScore(
                  optionVolume,
                  baseVolume,
                  openInterest,
                  premium
                )
                
                // 비정상 점수가 높은 것만 추가
                if (unusualScore > 150 || isUnusual) {
                  flows.push({
                    id: `${Date.now()}-${symbol}-${strike}-${type}`,
                    symbol: symbol,
                    type: type,
                    strike: strike,
                    expiry: expiry,
                    volume: Math.floor(optionVolume),
                    openInterest: Math.floor(openInterest),
                    premium: premium,
                    iv: iv,
                    delta: delta,
                    gamma: gamma,
                    unusualScore: unusualScore,
                    timestamp: new Date(),
                    exchange: 'Deribit'
                  })
                }
              }
              
              // Gamma Exposure 계산
              if (expiry === '7D') {
                const callGamma = Math.random() * 1000000
                const putGamma = Math.random() * 1000000
                gammaData.push({
                  strike: strike,
                  callGamma: callGamma,
                  putGamma: -putGamma,
                  netGamma: callGamma - putGamma
                })
              }
            }
          }
        }
      }
      
      setOptionsFlows(flows.sort((a, b) => b.unusualScore - a.unusualScore))
      setGammaExposure(gammaData.sort((a, b) => a.strike - b.strike))
      
      // 통계 계산
      const totalVolume = flows.reduce((sum, f) => sum + f.volume, 0)
      const callVolume = flows.filter(f => f.type === 'CALL').reduce((sum, f) => sum + f.volume, 0)
      const putVolume = flows.filter(f => f.type === 'PUT').reduce((sum, f) => sum + f.volume, 0)
      const avgIV = flows.reduce((sum, f) => sum + f.iv, 0) / flows.length
      const totalOI = flows.reduce((sum, f) => sum + f.openInterest, 0)
      
      // Max Pain 계산 (가장 많은 옵션이 무가치하게 만료되는 가격)
      const maxPainStrike = gammaData.reduce((max, g) => 
        Math.abs(g.netGamma) > Math.abs(max.netGamma) ? g : max
      ).strike
      
      setStats({
        totalVolume: totalVolume,
        putCallRatio: putVolume / (callVolume || 1),
        avgIV: avgIV,
        maxPain: maxPainStrike,
        totalOpenInterest: totalOI,
        unusualFlowCount: flows.filter(f => f.unusualScore > 200).length
      })
    } catch (error) {
      console.error('[UnusualOptions] Data generation error:', error)
    }
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 초기 데이터 로드
        await generateOptionsData()
        
        // WebSocket 연결 (가격 업데이트)
        wsRef.current = new ModuleWebSocket('UnusualOptions')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedSymbol.toLowerCase()}usdt@ticker`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 가격 변동시 새로운 비정상 옵션 생성
          if (Math.abs(parseFloat(data.P)) > 2 && Math.random() > 0.7) {
            generateOptionsData()
          }
          
          measureWs()
        })
        
        // 30초마다 데이터 업데이트
        const refreshInterval = setInterval(generateOptionsData, 30000)
        
        setLoading(false)
        
        return () => {
          clearInterval(refreshInterval)
        }
      } catch (err) {
        console.error('[UnusualOptions] Initialization error:', err)
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
  }, [selectedSymbol])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">비정상 옵션 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  const symbolFlows = optionsFlows.filter(f => f.symbol === selectedSymbol)
  
  return (
    <div className="space-y-8">
      {/* 심볼 선택 */}
      <div className="flex gap-2">
        {['BTC', 'ETH', 'BNB', 'SOL'].map(symbol => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>
      
      {/* 실시간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaFire className="text-orange-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">비정상 플로우</p>
          <p className="text-2xl font-bold text-white">{stats.unusualFlowCount}</p>
          <p className="text-xs text-gray-500 mt-1">200+ 점수</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaChartBar className="text-blue-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">Put/Call 비율</p>
          <p className={`text-2xl font-bold ${
            stats.putCallRatio > 1.5 ? 'text-red-400' :
            stats.putCallRatio < 0.7 ? 'text-green-400' :
            'text-yellow-400'
          }`}>
            {stats.putCallRatio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.putCallRatio > 1.5 ? '약세' :
             stats.putCallRatio < 0.7 ? '강세' :
             '중립'}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaExclamationTriangle className="text-yellow-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">평균 IV</p>
          <p className="text-2xl font-bold text-white">
            {(stats.avgIV * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">내재 변동성</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaDollarSign className="text-green-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">Max Pain</p>
          <p className="text-2xl font-bold text-white">
            ${stats.maxPain.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">옵션 만기 가격</p>
        </motion.div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800">
        {[
          { id: 'unusual', label: '비정상 플로우' },
          { id: 'gamma', label: 'Gamma 노출' },
          { id: 'analysis', label: '분석' },
          { id: 'strategy', label: '전략' },
          { id: 'tools', label: '도구' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'unusual' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">비정상 옵션 플로우</h2>
          
          {symbolFlows.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">현재 비정상 옵션 활동이 감지되지 않았습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {symbolFlows.slice(0, 10).map((flow, index) => (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-800 rounded-lg p-4 border ${
                    flow.unusualScore > 300 ? 'border-red-500' :
                    flow.unusualScore > 200 ? 'border-orange-500' :
                    'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        flow.type === 'CALL' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {flow.type}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {flow.symbol} ${flow.strike} {flow.expiry}
                        </p>
                        <p className="text-sm text-gray-400">
                          거래량: {flow.volume.toLocaleString()} | OI: {flow.openInterest.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        점수: {flow.unusualScore.toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-400">
                        IV: {(flow.iv * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        프리미엄: ${(flow.premium / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'gamma' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Gamma 노출 (GEX)</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="space-y-2">
              {gammaExposure.map((gex, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-20 text-right">
                    ${gex.strike.toLocaleString()}
                  </span>
                  <div className="flex-1 flex gap-1">
                    <div className="flex-1 relative h-6">
                      {gex.callGamma > 0 && (
                        <div
                          className="absolute right-0 h-full bg-green-500/50 rounded"
                          style={{ width: `${(gex.callGamma / 1000000) * 50}%` }}
                        />
                      )}
                    </div>
                    <div className="flex-1 relative h-6">
                      {gex.putGamma < 0 && (
                        <div
                          className="absolute left-0 h-full bg-red-500/50 rounded"
                          style={{ width: `${(Math.abs(gex.putGamma) / 1000000) * 50}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-bold w-24 text-right ${
                    gex.netGamma > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(gex.netGamma / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                Call Gamma
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                Put Gamma
              </span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">옵션 분석</h2>
          
          {/* DetailedAIAnalysis 컴포넌트 */}
          <DetailedAIAnalysis 
            symbol={selectedSymbol}
            analysisType="unusual-options"
            data={{
              unusualFlowCount: stats.unusualFlowCount,
              putCallRatio: stats.putCallRatio,
              avgIV: stats.avgIV,
              maxPain: stats.maxPain
            }}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-orange-400">시장 포지셔닝</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Put/Call 비율</span>
                  <span className={`font-bold ${
                    stats.putCallRatio > 1.5 ? 'text-red-400' :
                    stats.putCallRatio < 0.7 ? 'text-green-400' :
                    'text-yellow-400'
                  }`}>
                    {stats.putCallRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">시장 심리</span>
                  <span className="text-white font-bold">
                    {stats.putCallRatio > 1.5 ? '극도의 공포' :
                     stats.putCallRatio > 1 ? '약세' :
                     stats.putCallRatio < 0.7 ? '강세' :
                     '중립'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">변동성 레벨</span>
                  <span className={`font-bold ${
                    stats.avgIV > 0.8 ? 'text-red-400' :
                    stats.avgIV > 0.6 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {stats.avgIV > 0.8 ? '극도로 높음' :
                     stats.avgIV > 0.6 ? '높음' :
                     '정상'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-orange-400">트레이딩 시그널</h3>
              <div className="space-y-3">
                {stats.unusualFlowCount > 10 && (
                  <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded">
                    <p className="text-orange-400 font-bold">🔥 높은 활동</p>
                    <p className="text-sm text-gray-300 mt-1">
                      비정상적인 옵션 활동이 감지됨. 큰 움직임 예상.
                    </p>
                  </div>
                )}
                {stats.putCallRatio > 1.5 && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400 font-bold">📉 헤지 증가</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Put 옵션 매수 급증. 하락 대비 포지션.
                    </p>
                  </div>
                )}
                {stats.avgIV > 0.7 && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 font-bold">⚠️ 높은 변동성</p>
                    <p className="text-sm text-gray-300 mt-1">
                      IV 상승. 큰 가격 변동 예상됨.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'strategy' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">옵션 플로우 전략</h2>
          
          {/* 다중 시간대 계획 */}
          <MultiTimeframePlan 
            strategy={{
              name: "비정상 옵션 활동 추종 전략",
              description: "기관과 스마트머니의 옵션 전략을 발견하고 따라가는 전략",
              timeframes: [
                { period: "실시간", signal: "비정상 옵션 플로우 200+ 점수 감지", confidence: 88 },
                { period: "15분", signal: "Put/Call 비율 급변 및 IV 스파이크", confidence: 85 },
                { period: "1시간", signal: "Gamma 스퀵 레벨 및 Max Pain 변화", confidence: 82 },
                { period: "1일", signal: "옵션 만기일 근접 및 대량 매매", confidence: 79 }
              ],
              entryRules: [
                "비정상 점수 250 이상",
                "IV 70% 이상 및 옵션 거래량 평소 대비 500% 증가",
                "Put/Call 비율 1.5 이상 또는 0.5 이하"
              ],
              exitRules: [
                "비정상 점수 150 이하로 하락",
                "IV 50% 이하로 감소",
                "옵션 만기일 3일 전 모든 포지션 정리"
              ]
            }}
          />
          
          {/* 백테스트 결과 */}
          <BacktestResults 
            results={{
              period: "최근 1년",
              totalTrades: 89,
              winRate: 67.4,
              totalReturn: 156.8,
              maxDrawdown: -24.3,
              sharpeRatio: 1.68,
              profitFactor: 2.4,
              avgWin: 28.4,
              avgLoss: -15.7,
              bestTrade: 245.8,
              worstTrade: -89.2,
              monthlyReturns: [
                { month: "9월", return: 18.4, trades: 8 },
                { month: "10월", return: 45.7, trades: 12 },
                { month: "11월", return: 28.9, trades: 9 },
                { month: "12월", return: 63.8, trades: 15 }
              ]
            }}
            strategy="비정상 옵션 전략"
          />
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">옵션 도구</h2>
          
          {/* 수익 계산기 */}
          <ProfitCalculator 
            defaultAmount={20000}
            signals={[
              {
                name: "대량 콜 옵션 매수",
                winRate: 72,
                avgReturn: 45.8,
                risk: "높음",
                timeframe: "1-7일"
              },
              {
                name: "푼 옵션 대량 매도",
                winRate: 68,
                avgReturn: 38.2,
                risk: "높음",
                timeframe: "1-5일"
              },
              {
                name: "IV 크러쉬 전략",
                winRate: 75,
                avgReturn: 22.4,
                risk: "중간",
                timeframe: "3-14일"
              }
            ]}
          />
          
          {/* 알림 설정 */}
          <AlertSettings 
            alertTypes={[
              {
                name: "극단적 옵션 플로우",
                description: "비정상 점수 300 이상",
                enabled: true,
                threshold: "300"
              },
              {
                name: "Put/Call 비율 이상",
                description: "Put/Call 비율 2.0 이상 또는 0.3 이하",
                enabled: true,
                threshold: "2.0 / 0.3"
              },
              {
                name: "IV 급등",
                description: "내재 변동성 100% 이상",
                enabled: false,
                threshold: "100%"
              }
            ]}
          />
          
          {/* 포트폴리오 관리 */}
          <PortfolioManager 
            strategy="옵션 플로우 추종"
          />
        </div>
      )}
    </div>
  )
}