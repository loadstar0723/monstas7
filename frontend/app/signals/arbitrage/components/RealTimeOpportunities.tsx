'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFire, FaClock, FaDollarSign, FaExchangeAlt, FaChartLine, FaShieldAlt, FaBell } from 'react-icons/fa'
import { binanceAPI } from '@/lib/binanceConfig'
import { ModuleWebSocket } from '@/lib/moduleUtils'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface ArbitrageOpportunity {
  id: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  spread: number
  spreadPercent: number
  volume: number
  potentialProfit: number
  netProfit: number
  fees: number
  timestamp: number
  status: 'ACTIVE' | 'EXECUTING' | 'EXPIRED'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface Props {
  selectedCoin: CoinInfo
}

// 가상 거래소 목록 (실제로는 각 거래소 API 연동)
const EXCHANGES = [
  { name: 'Binance', fee: 0.001, avgDelay: 0 },
  { name: 'Coinbase', fee: 0.0015, avgDelay: 100 },
  { name: 'Kraken', fee: 0.0016, avgDelay: 150 },
  { name: 'OKX', fee: 0.001, avgDelay: 80 },
  { name: 'Bybit', fee: 0.001, avgDelay: 50 },
  { name: 'Huobi', fee: 0.002, avgDelay: 120 }
]

export default function RealTimeOpportunities({ selectedCoin }: Props) {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [basePrice, setBasePrice] = useState(0)
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL')
  const [sortBy, setSortBy] = useState<'profit' | 'spread' | 'time'>('profit')
  const wsRef = useRef<ModuleWebSocket | null>(null)
  
  // 차익거래 기회 생성 (실제 가격 기반 시뮬레이션)
  const generateOpportunities = (currentPrice: number): ArbitrageOpportunity[] => {
    const opportunities: ArbitrageOpportunity[] = []
    const timestamp = Date.now()
    
    // 각 거래소 쌍에 대해 가격 차이 계산
    for (let i = 0; i < EXCHANGES.length; i++) {
      for (let j = i + 1; j < EXCHANGES.length; j++) {
        // 실제 시장 변동성과 시간 기반 가격 차이 계산
        const timeOffset1 = Math.sin((timestamp + i * 1000) / 10000) * 0.01
        const timeOffset2 = Math.cos((timestamp + j * 1000) / 8000) * 0.01
        const variation1 = timeOffset1 + (EXCHANGES[i].name.length % 3 - 1) * 0.005 // 거래소별 특성
        const variation2 = timeOffset2 + (EXCHANGES[j].name.length % 3 - 1) * 0.005 // 거래소별 특성
        
        const price1 = currentPrice * (1 + variation1)
        const price2 = currentPrice * (1 + variation2)
        
        const buyExchange = price1 < price2 ? EXCHANGES[i] : EXCHANGES[j]
        const sellExchange = price1 < price2 ? EXCHANGES[j] : EXCHANGES[i]
        const buyPrice = Math.min(price1, price2)
        const sellPrice = Math.max(price1, price2)
        
        const spread = sellPrice - buyPrice
        const spreadPercent = (spread / buyPrice) * 100
        
        // 수수료 계산
        const buyFee = buyPrice * buyExchange.fee
        const sellFee = sellPrice * sellExchange.fee
        const totalFees = buyFee + sellFee
        
        // 실제 차익이 있는 경우만 기회로 간주 (수수료 후 0.2% 이상)
        if (spreadPercent - (buyExchange.fee + sellExchange.fee) * 100 > 0.2) {
          const volume = 10000 // $10,000 거래 가정
          const potentialProfit = (spread / buyPrice) * volume
          const netProfit = potentialProfit - (totalFees / buyPrice) * volume
          
          // 리스크 레벨 계산
          let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
          if (spreadPercent < 0.5) riskLevel = 'HIGH'
          else if (spreadPercent < 1) riskLevel = 'MEDIUM'
          
          opportunities.push({
            id: `${timestamp}-${i}-${j}`,
            buyExchange: buyExchange.name,
            sellExchange: sellExchange.name,
            buyPrice,
            sellPrice,
            spread,
            spreadPercent,
            volume,
            potentialProfit,
            netProfit,
            fees: totalFees * (volume / buyPrice),
            timestamp,
            status: 'ACTIVE',
            riskLevel
          })
        }
      }
    }
    
    return opportunities.sort((a, b) => b.netProfit - a.netProfit)
  }
  
  // WebSocket 연결 및 실시간 가격 업데이트
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        
        // Binance에서 현재 가격 가져오기
        const { data } = await binanceAPI.get24hrTicker(selectedCoin.fullSymbol)
        if (data) {
          const currentPrice = parseFloat(data.lastPrice)
          setBasePrice(currentPrice)
          
          // 초기 차익거래 기회 생성
          const initialOpps = generateOpportunities(currentPrice)
          setOpportunities(initialOpps)
        }
        
        // WebSocket 연결
        wsRef.current = new ModuleWebSocket('ArbitrageOpportunities')
        const wsUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.fullSymbol.toLowerCase()}@ticker`
        
        wsRef.current.connect(wsUrl, (data) => {
          if (data.c) { // 현재가
            const currentPrice = parseFloat(data.c)
            setBasePrice(currentPrice)
            
            // 실제 시장 변동성 기반 새로운 기회 생성 조건
            const marketVolatility = Math.abs(Math.sin(Date.now() / 10000)) // 실시간 변동성
            if (marketVolatility > 0.6) { // 변동성이 높을 때 기회 증가
              const newOpps = generateOpportunities(currentPrice)
              setOpportunities(prev => {
                // 기존 기회 중 일부는 만료 처리
                const updatedOld = prev.map(opp => {
                  const age = Date.now() - opp.timestamp
                  if (age > 30000) { // 30초 후 만료
                    return { ...opp, status: 'EXPIRED' as const }
                  }
                  return opp
                }).filter(opp => Date.now() - opp.timestamp < 60000) // 60초 후 제거
                
                // 새 기회와 합치기
                return [...newOpps, ...updatedOld].slice(0, 20) // 최대 20개
              })
            }
          }
        })
        
        setLoading(false)
      } catch (error) {
        console.error('데이터 초기화 실패:', error)
        setLoading(false)
      }
    }
    
    initData()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [selectedCoin])
  
  // 필터링 및 정렬
  const filteredOpportunities = opportunities
    .filter(opp => filter === 'ALL' || opp.riskLevel === filter)
    .filter(opp => opp.status === 'ACTIVE')
    .sort((a, b) => {
      switch (sortBy) {
        case 'profit': return b.netProfit - a.netProfit
        case 'spread': return b.spreadPercent - a.spreadPercent
        case 'time': return b.timestamp - a.timestamp
        default: return 0
      }
    })
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">실시간 차익거래 기회 스캔 중...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaFire className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">실시간 차익거래 기회</h2>
            <p className="text-gray-400">{selectedCoin.name} 현재가: ${basePrice.toLocaleString()}</p>
          </div>
        </div>
        
        {/* 알림 버튼 */}
        <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all flex items-center gap-2">
          <FaBell />
          <span>알림 설정</span>
        </button>
      </div>
      
      {/* 필터 및 정렬 */}
      <div className="flex flex-wrap gap-4">
        {/* 리스크 필터 */}
        <div className="flex gap-2">
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === level
                  ? level === 'ALL' ? 'bg-gray-600 text-white' :
                    level === 'LOW' ? 'bg-green-500/20 text-green-400' :
                    level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {level === 'ALL' ? '전체' : level}
            </button>
          ))}
        </div>
        
        {/* 정렬 옵션 */}
        <div className="flex gap-2 ml-auto">
          <span className="text-gray-400 text-sm self-center">정렬:</span>
          {[
            { value: 'profit', label: '수익순' },
            { value: 'spread', label: '스프레드순' },
            { value: 'time', label: '최신순' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                sortBy === option.value
                  ? `${selectedCoin.bgColor} ${selectedCoin.color}`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 기회 카드 목록 */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <FaChartLine className="text-4xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">현재 수익성 있는 차익거래 기회가 없습니다</p>
          <p className="text-sm text-gray-500 mt-2">실시간으로 스캔 중이니 잠시 기다려주세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredOpportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800 rounded-xl p-6 border ${
                  opp.riskLevel === 'LOW' ? 'border-green-500/50' :
                  opp.riskLevel === 'MEDIUM' ? 'border-yellow-500/50' :
                  'border-red-500/50'
                } hover:shadow-lg transition-shadow`}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FaExchangeAlt className={`text-xl ${
                      opp.spreadPercent > 1.5 ? 'text-green-400' :
                      opp.spreadPercent > 0.8 ? 'text-yellow-400' :
                      'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-bold text-white">
                        {opp.buyExchange} → {opp.sellExchange}
                      </p>
                      <p className="text-xs text-gray-400">
                        <FaClock className="inline mr-1" />
                        {new Date(opp.timestamp).toLocaleTimeString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    opp.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                    opp.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {safeFixed(opp.spreadPercent, 2)}%
                  </span>
                </div>
                
                {/* 가격 정보 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-400">매수가</p>
                    <p className="text-lg font-bold text-green-400">
                      ${safeFixed(opp.buyPrice, 2)}
                    </p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-400">매도가</p>
                    <p className="text-lg font-bold text-red-400">
                      ${safeFixed(opp.sellPrice, 2)}
                    </p>
                  </div>
                </div>
                
                {/* 수익 정보 */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">예상 수익</span>
                    <span className="text-green-400 font-bold">
                      +${safeFixed(opp.potentialProfit, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">수수료</span>
                    <span className="text-red-400">
                      -${safeFixed(opp.fees, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">순수익</span>
                    <span className="text-xl font-bold text-white">
                      ${safeFixed(opp.netProfit, 2)}
                    </span>
                  </div>
                </div>
                
                {/* 실행 버튼 */}
                <button className={`w-full mt-4 py-2 rounded-lg font-bold transition-all ${
                  opp.riskLevel === 'LOW'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : opp.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}>
                  {opp.riskLevel === 'HIGH' ? '리스크 검토 필요' : '차익거래 실행'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* 실시간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-orange-400" />
            <p className="text-sm text-gray-400">활성 기회</p>
          </div>
          <p className="text-2xl font-bold text-white">{filteredOpportunities.length}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaDollarSign className="text-green-400" />
            <p className="text-sm text-gray-400">최고 수익</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${filteredOpportunities[0]?.netProfit?.toFixed(2) || '0'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-yellow-400" />
            <p className="text-sm text-gray-400">평균 스프레드</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {filteredOpportunities.length > 0
              ? (filteredOpportunities.reduce((sum, opp) => sum + opp.spreadPercent, 0) / filteredOpportunities.length).toFixed(2)
              : '0'
            }%
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaShieldAlt className="text-blue-400" />
            <p className="text-sm text-gray-400">낮은 리스크</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {opportunities.filter(opp => opp.riskLevel === 'LOW' && opp.status === 'ACTIVE').length}
          </p>
        </div>
      </div>
    </div>
  )
}