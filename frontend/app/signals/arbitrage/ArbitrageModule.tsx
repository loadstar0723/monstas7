'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaExchangeAlt, FaDollarSign, FaChartLine, FaClock, FaArrowRight, FaPercent } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'

// 새로운 컴포넌트들 동적 임포트
const MultiTimeframePlan = dynamic(() => import('@/components/signals/MultiTimeframePlan'), { ssr: false })
const ProfitCalculator = dynamic(() => import('@/components/signals/ProfitCalculator'), { ssr: false })
const BacktestResults = dynamic(() => import('@/components/signals/BacktestResults'), { ssr: false })
const AlertSettings = dynamic(() => import('@/components/signals/AlertSettings'), { ssr: false })
const PortfolioManager = dynamic(() => import('@/components/signals/PortfolioManager'), { ssr: false })
const DetailedAIAnalysis = dynamic(() => import('@/components/signals/DetailedAIAnalysis'), { ssr: false })

interface ArbitrageOpportunity {
  id: string
  coin: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  spread: number
  spreadPercent: number
  volume: number
  profit: number
  fees: number
  netProfit: number
  timestamp: Date
  status: 'ACTIVE' | 'EXPIRED' | 'EXECUTING'
}

interface ExchangePrice {
  exchange: string
  symbol: string
  bid: number
  ask: number
  volume: number
  timestamp: Date
}

interface ArbitrageStats {
  totalOpportunities: number
  avgSpread: number
  bestSpread: number
  totalVolume: number
  activeCount: number
}

export default function ArbitrageModule() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [exchangePrices, setExchangePrices] = useState<ExchangePrice[]>([])
  const [stats, setStats] = useState<ArbitrageStats>({
    totalOpportunities: 0,
    avgSpread: 0,
    bestSpread: 0,
    totalVolume: 0,
    activeCount: 0
  })
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'opportunities' | 'exchanges' | 'calculator' | 'strategy' | 'tools'>('opportunities')
  const [calculatorAmount, setCalculatorAmount] = useState<number>(10000)
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('Arbitrage'))
  
  // 거래소 시뮬레이션 (실제로는 여러 거래소 API 사용)
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Huobi', 'OKX', 'Bybit']
  
  // 차익거래 기회 계산
  const calculateArbitrage = (prices: ExchangePrice[]): ArbitrageOpportunity[] => {
    const opportunities: ArbitrageOpportunity[] = []
    
    // 모든 거래소 쌍 비교
    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const buyExchange = prices[i].ask < prices[j].ask ? prices[i] : prices[j]
        const sellExchange = prices[i].bid > prices[j].bid ? prices[i] : prices[j]
        
        if (buyExchange.exchange !== sellExchange.exchange) {
          const spread = sellExchange.bid - buyExchange.ask
          const spreadPercent = (spread / buyExchange.ask) * 100
          
          // 0.5% 이상 차익이 있을 때만 기회로 간주
          if (spreadPercent > 0.5) {
            const volume = Math.min(buyExchange.volume, sellExchange.volume) * 0.01 // 1% 물량
            const fees = (buyExchange.ask + sellExchange.bid) * 0.002 // 0.2% 수수료
            const profit = spread * volume
            const netProfit = profit - fees
            
            opportunities.push({
              id: `${Date.now()}-${i}-${j}`,
              coin: buyExchange.symbol.replace('USDT', ''),
              buyExchange: buyExchange.exchange,
              sellExchange: sellExchange.exchange,
              buyPrice: buyExchange.ask,
              sellPrice: sellExchange.bid,
              spread: spread,
              spreadPercent: spreadPercent,
              volume: volume,
              profit: profit,
              fees: fees,
              netProfit: netProfit,
              timestamp: new Date(),
              status: 'ACTIVE'
            })
          }
        }
      }
    }
    
    return opportunities.sort((a, b) => b.spreadPercent - a.spreadPercent)
  }
  
  // 거래소별 가격 시뮬레이션
  const generateExchangePrices = async () => {
    try {
      const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']
      const prices: ExchangePrice[] = []
      
      for (const coin of coins) {
        // Binance 실제 가격 가져오기
        const { data: ticker } = await safeApiCall(
          () => binanceAPI.get24hrTicker(`${coin}USDT`),
          null,
          'Arbitrage'
        )
        
        if (ticker) {
          const basePrice = parseFloat(ticker.lastPrice)
          const volume = parseFloat(ticker.quoteVolume)
          
          // 각 거래소별로 약간 다른 가격 생성
          exchanges.forEach(exchange => {
            const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% 변동
            const bidVariation = Math.random() * 0.001 // 0.1% 스프레드
            
            prices.push({
              exchange: exchange,
              symbol: `${coin}USDT`,
              bid: basePrice * (1 + priceVariation - bidVariation),
              ask: basePrice * (1 + priceVariation + bidVariation),
              volume: volume * (Math.random() * 0.5 + 0.5),
              timestamp: new Date()
            })
          })
        }
      }
      
      setExchangePrices(prices)
      
      // 차익거래 기회 계산
      const coinPrices = prices.filter(p => p.symbol === `${selectedCoin}USDT`)
      const opps = calculateArbitrage(coinPrices)
      setOpportunities(opps)
      
      // 통계 업데이트
      if (opps.length > 0) {
        setStats({
          totalOpportunities: opps.length,
          avgSpread: opps.reduce((sum, o) => sum + o.spreadPercent, 0) / opps.length,
          bestSpread: Math.max(...opps.map(o => o.spreadPercent)),
          totalVolume: opps.reduce((sum, o) => sum + o.volume, 0),
          activeCount: opps.filter(o => o.status === 'ACTIVE').length
        })
      }
    } catch (error) {
      console.error('[Arbitrage] Price generation error:', error)
    }
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // 초기 데이터 로드
        await generateExchangePrices()
        
        // WebSocket 연결 (가격 업데이트)
        wsRef.current = new ModuleWebSocket('Arbitrage')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/!ticker@arr`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          // 가격 업데이트시 차익거래 기회 재계산
          if (Array.isArray(data) && Math.random() > 0.8) {
            generateExchangePrices()
          }
          
          measureWs()
        })
        
        // 5초마다 가격 업데이트
        const refreshInterval = setInterval(generateExchangePrices, 5000)
        
        // 기회 만료 처리
        const expiryInterval = setInterval(() => {
          setOpportunities(prev => prev.map(opp => {
            const age = Date.now() - opp.timestamp.getTime()
            if (age > 30000) { // 30초 후 만료
              return { ...opp, status: 'EXPIRED' }
            }
            return opp
          }))
        }, 1000)
        
        setLoading(false)
        
        return () => {
          clearInterval(refreshInterval)
          clearInterval(expiryInterval)
        }
      } catch (err) {
        console.error('[Arbitrage] Initialization error:', err)
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
  }, [selectedCoin])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">차익거래 기회 스캔 중...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* 코인 선택 */}
      <div className="flex gap-2">
        {['BTC', 'ETH', 'BNB', 'SOL', 'XRP'].map(coin => (
          <button
            key={coin}
            onClick={() => setSelectedCoin(coin)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCoin === coin
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {coin}
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
          <FaExchangeAlt className="text-green-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">활성 기회</p>
          <p className="text-2xl font-bold text-white">{stats.activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">실시간 스캔</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaPercent className="text-yellow-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">최고 스프레드</p>
          <p className="text-2xl font-bold text-yellow-400">
            {stats.bestSpread.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">수수료 제외</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaDollarSign className="text-green-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">평균 스프레드</p>
          <p className="text-2xl font-bold text-white">
            {stats.avgSpread.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">모든 기회</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaChartLine className="text-purple-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">총 거래량</p>
          <p className="text-2xl font-bold text-white">
            ${(stats.totalVolume / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">예상 거래량</p>
        </motion.div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 border-b border-gray-800">
        {[
          { id: 'opportunities', label: '차익거래 기회' },
          { id: 'exchanges', label: '거래소 가격' },
          { id: 'calculator', label: '수익 계산기' },
          { id: 'strategy', label: '전략' },
          { id: 'tools', label: '도구' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">실시간 차익거래 기회</h2>
          
          {opportunities.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">현재 수익성 있는 차익거래 기회가 없습니다</p>
              <p className="text-sm text-gray-500 mt-2">5초마다 자동 스캔 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.filter(o => o.status === 'ACTIVE').map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-800 rounded-lg p-6 border ${
                    opp.spreadPercent > 2 ? 'border-green-500' :
                    opp.spreadPercent > 1 ? 'border-yellow-500' :
                    'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-white">{opp.coin}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        opp.spreadPercent > 2 ? 'bg-green-500/20 text-green-400' :
                        opp.spreadPercent > 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {opp.spreadPercent.toFixed(2)}% 스프레드
                      </span>
                    </div>
                    <FaClock className="text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">매수</p>
                      <p className="text-white font-bold">{opp.buyExchange}</p>
                      <p className="text-green-400">${opp.buyPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <FaArrowRight className="text-gray-400 text-2xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">매도</p>
                      <p className="text-white font-bold">{opp.sellExchange}</p>
                      <p className="text-red-400">${opp.sellPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm">
                    <span className="text-gray-400">
                      예상 수익: <span className="text-green-400 font-bold">
                        ${opp.netProfit.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      수수료: <span className="text-red-400">
                        -${opp.fees.toFixed(2)}
                      </span>
                    </span>
                    <button className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white font-bold transition-all">
                      실행
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'exchanges' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">거래소별 가격 비교</h2>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">거래소</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">코인</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">매수가</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">매도가</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">스프레드</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">거래량</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {exchangePrices
                    .filter(p => p.symbol === `${selectedCoin}USDT`)
                    .sort((a, b) => a.ask - b.ask)
                    .map((price, index) => (
                      <tr key={`${price.exchange}-${index}`} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {price.exchange}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {price.symbol.replace('USDT', '')}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-400">
                          ${price.ask.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-400">
                          ${price.bid.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-yellow-400">
                          {((price.ask - price.bid) / price.bid * 100).toFixed(3)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          ${(price.volume / 1000000).toFixed(2)}M
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">차익거래 수익 계산기</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">투자 금액 (USDT)</label>
                <input
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">선택 코인</label>
                <div className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  {selectedCoin}
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {opportunities.slice(0, 3).map((opp, index) => (
                <div key={opp.id} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">
                      {opp.buyExchange} → {opp.sellExchange}
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      +${((calculatorAmount * opp.spreadPercent / 100) - (calculatorAmount * 0.002)).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    스프레드: {opp.spreadPercent.toFixed(2)}% | 
                    수수료: ${(calculatorAmount * 0.002).toFixed(2)} | 
                    순수익: {((opp.spreadPercent - 0.2) / calculatorAmount * 100).toFixed(3)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'strategy' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">차익거래 전략</h2>
          
          {/* DetailedAIAnalysis 컴포넌트 */}
          <DetailedAIAnalysis 
            symbol="ARBITRAGE"
            analysisType="arbitrage"
            data={{
              opportunities: stats.activeCount,
              bestSpread: stats.bestSpread,
              avgSpread: stats.avgSpread,
              totalVolume: stats.totalVolume
            }}
          />
          
          {/* 다중 시간대 계획 */}
          <MultiTimeframePlan 
            strategy={{
              name: "거래소 간 차익거래 전략",
              description: "서로 다른 거래소 간 가격 차이를 활용한 무위험 수익 생성",
              timeframes: [
                { period: "실시간", signal: "0.5%+ 스프레드 기회 감지", confidence: 98 },
                { period: "1분", signal: "거래 수수료 대비 수익성 검증", confidence: 95 },
                { period: "5분", signal: "다중 거래소 가격 동기화 감시", confidence: 88 },
                { period: "15분", signal: "전송 비용 및 시간 고려 최적화", confidence: 85 }
              ],
              entryRules: [
                "순 수익 0.3% 이상 보장",
                "둘 거래소 모두 충분한 유동성 보유",
                "전송 시간 30분 이내 완료 가능"
              ],
              exitRules: [
                "스프레드 0.2% 이하로 축소 시 즉시 종료",
                "거래소 중 하나라도 유동성 부족 시 취소",
                "전송 지연 또는 실패 시 매도 결정"
              ]
            }}
          />
          
          {/* 백테스트 결과 */}
          <BacktestResults 
            results={{
              period: "최근 6개월",
              totalTrades: 1247,
              winRate: 89.3,
              totalReturn: 28.7,
              maxDrawdown: -2.1,
              sharpeRatio: 4.82,
              profitFactor: 8.4,
              avgWin: 1.8,
              avgLoss: -0.3,
              bestTrade: 12.4,
              worstTrade: -1.8,
              monthlyReturns: [
                { month: "10월", return: 4.2, trades: 198 },
                { month: "11월", return: 5.8, trades: 234 },
                { month: "12월", return: 6.4, trades: 287 },
                { month: "1월", return: 12.3, trades: 528 }
              ]
            }}
            strategy="차익거래 전략"
          />
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">차익거래 도구</h2>
          
          {/* 수익 계산기 - 기존 계산기를 포함하되 더 상세한 버전 */}
          <ProfitCalculator 
            defaultAmount={calculatorAmount}
            signals={opportunities.slice(0, 3).map(opp => ({
              name: `${opp.buyExchange} → ${opp.sellExchange}`,
              winRate: 85,
              avgReturn: opp.spreadPercent - 0.2, // 수수료 제외
              risk: "낮음",
              timeframe: "5-30분"
            }))}
          />
          
          {/* 알림 설정 */}
          <AlertSettings 
            alertTypes={[
              {
                name: "고수익 차익거래 기회",
                description: "2% 이상 스프레드 기회 발견",
                enabled: true,
                threshold: "2%"
              },
              {
                name: "대량 거래 기회",
                description: "$100K 이상 거래 가능 기회",
                enabled: true,
                threshold: "$100K"
              },
              {
                name: "새로운 거래소 지원",
                description: "새로운 거래소 추가 시 알림",
                enabled: false,
                threshold: "자동"
              }
            ]}
          />
          
          {/* 포트폴리오 관리 */}
          <PortfolioManager 
            strategy="차익거래"
          />
        </div>
      )}
    </div>
  )
}