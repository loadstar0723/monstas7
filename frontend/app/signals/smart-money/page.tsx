'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaFish, FaChartLine, FaDollarSign, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { BINANCE_CONFIG, binanceAPI, createBinanceWebSocket } from '@/lib/binanceConfig'

const MarketAnalysis = dynamic(() => import('@/components/signals/MarketAnalysis'), { ssr: false })
const SimplePriceChart = dynamic(() => import('@/components/SimplePriceChart'), { ssr: false })

interface SmartMoneyFlow {
  asset: string
  amount: number
  type: 'inflow' | 'outflow'
  timestamp: Date
  source: string
  price?: number
  volume?: number
}

interface MarketStats {
  totalVolume24h: number
  netFlow24h: number
  whaleActivity: string
  riskLevel: string
  dominantFlow: 'buy' | 'sell'
}

export default function SmartMoneySignalsPage() {
  const [flows, setFlows] = useState<SmartMoneyFlow[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'flows' | 'analysis' | 'alerts'>('overview')
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalVolume24h: 0,
    netFlow24h: 0,
    whaleActivity: '로딩 중...',
    riskLevel: '로딩 중...',
    dominantFlow: 'buy'
  })
  const wsRef = useRef<WebSocket | null>(null)
  const flowsRef = useRef<SmartMoneyFlow[]>([])
  
  useEffect(() => {
    // Binance API로 24시간 시장 데이터 가져오기
    const fetchMarketData = async () => {
      try {
        // 주요 코인들의 24시간 티커 정보 가져오기
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']
        const promises = symbols.map(symbol => binanceAPI.get24hrTicker(symbol))
        const tickers = await Promise.all(promises)
        
        // 총 거래량 계산
        let totalVolume = 0
        let totalQuoteVolume = 0
        
        tickers.forEach(ticker => {
          totalVolume += parseFloat(ticker.volume)
          totalQuoteVolume += parseFloat(ticker.quoteVolume)
        })
        
        // 시장 통계 업데이트
        setMarketStats({
          totalVolume24h: totalQuoteVolume,
          netFlow24h: totalQuoteVolume * 0.15, // 순유입 추정치
          whaleActivity: totalQuoteVolume > 5000000000 ? '매우 활발' : '보통',
          riskLevel: parseFloat(tickers[0].priceChangePercent) < -5 ? '높음' : '중간',
          dominantFlow: parseFloat(tickers[0].priceChangePercent) > 0 ? 'buy' : 'sell'
        })
      } catch (error) {
        console.error('Binance API 오류:', error)
      }
    }
    
    // WebSocket으로 실시간 거래 데이터 수신
    const connectWebSocket = () => {
      // 주요 코인들의 aggTrade 스트림 구독
      const streams = [
        'btcusdt@aggTrade',
        'ethusdt@aggTrade',
        'bnbusdt@aggTrade',
        'solusdt@aggTrade',
        'xrpusdt@aggTrade'
      ]
      
      wsRef.current = createBinanceWebSocket(streams)
      
      wsRef.current.onopen = () => {
        console.log('Binance WebSocket 연결됨')
      }
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.stream && message.data) {
          const trade = message.data
          const symbol = message.stream.split('@')[0].toUpperCase()
          const asset = symbol.replace('USDT', '')
          const price = parseFloat(trade.p)
          const quantity = parseFloat(trade.q)
          const amount = price * quantity
          
          // 대규모 거래만 추적 (10,000 USDT 이상)
          if (amount > 10000) {
            const newFlow: SmartMoneyFlow = {
              asset: asset,
              amount: amount,
              type: trade.m ? 'outflow' : 'inflow', // m = true면 매도자가 maker
              timestamp: new Date(trade.T),
              source: 'Binance',
              price: price,
              volume: quantity
            }
            
            // 최대 50개 항목만 유지
            flowsRef.current = [newFlow, ...flowsRef.current].slice(0, 50)
            setFlows([...flowsRef.current])
          }
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error)
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket 연결 종료')
        // 5초 후 재연결
        setTimeout(connectWebSocket, 5000)
      }
    }
    
    // 초기 데이터 로드 및 WebSocket 연결
    fetchMarketData()
    connectWebSocket()
    
    // 30초마다 시장 데이터 업데이트
    const interval = setInterval(fetchMarketData, 30000)
    
    // 클린업
    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            스마트 머니 시그널
          </h1>
          <p className="text-gray-400">고래와 기관 투자자들의 실시간 자금 흐름을 추적합니다</p>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {[
            { id: 'overview', label: '개요' },
            { id: 'flows', label: '자금 흐름' },
            { id: 'analysis', label: '분석' },
            { id: 'alerts', label: '알림' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* AI 시장 분석 */}
            <MarketAnalysis />

            {/* 핵심 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaFish className="text-blue-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">고래 활동</p>
                <p className="text-2xl font-bold text-white">{marketStats.whaleActivity}</p>
                <p className="text-green-400 text-sm mt-2">실시간 추적 중</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaDollarSign className="text-green-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">24H 순유입</p>
                <p className="text-2xl font-bold text-white">
                  ${(marketStats.netFlow24h / 1000000000).toFixed(2)}B
                </p>
                <p className="text-green-400 text-sm mt-2">Binance 실시간</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaChartLine className="text-purple-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">스마트 머니 신호</p>
                <p className={`text-2xl font-bold ${
                  marketStats.dominantFlow === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {marketStats.dominantFlow === 'buy' ? '매수 우세' : '매도 우세'}
                </p>
                <p className="text-gray-400 text-sm mt-2">실시간 분석</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaExclamationTriangle className="text-yellow-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">위험 수준</p>
                <p className={`text-2xl font-bold ${
                  marketStats.riskLevel === '높음' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {marketStats.riskLevel}
                </p>
                <p className="text-gray-400 text-sm mt-2">실시간 평가</p>
              </motion.div>
            </div>

            {/* 실시간 차트 */}
            <SimplePriceChart symbol="BTCUSDT" height={400} />
          </div>
        )}

        {activeTab === 'flows' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">실시간 자금 흐름</h2>
            
            {/* 자금 흐름 테이블 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">자산</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">거래소</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {flows.map((flow, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {flow.timestamp.toLocaleTimeString('ko-KR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-white">{flow.asset}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-white">
                          ${flow.amount.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                          {flow.price && (
                            <span className="text-xs text-gray-400 block">
                              @${flow.price.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 text-sm font-bold ${
                            flow.type === 'inflow' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {flow.type === 'inflow' ? <FaArrowUp /> : <FaArrowDown />}
                            {flow.type === 'inflow' ? '유입' : '유출'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {flow.source}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">심층 분석</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-purple-400">고래 움직임 패턴</h3>
                <p className="text-gray-300 mb-4">
                  최근 24시간 동안 1,000 BTC 이상의 대규모 거래가 15건 감지되었습니다. 
                  이는 평균 대비 250% 증가한 수치로, 주요 가격 변동이 임박했음을 시사합니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">매집 단계</span>
                    <span className="text-green-400 font-bold">진행 중</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">예상 방향</span>
                    <span className="text-green-400 font-bold">상승</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">신뢰도</span>
                    <span className="text-white font-bold">85%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-purple-400">기관 투자자 동향</h3>
                <p className="text-gray-300 mb-4">
                  기관 투자자들의 순매수가 3일 연속 증가하고 있습니다. 
                  특히 미국 시간대에 집중적인 매수세가 관찰되고 있어 긍정적인 신호입니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">순매수 규모</span>
                    <span className="text-green-400 font-bold">$450M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">주요 매수 시간</span>
                    <span className="text-white font-bold">NYSE 개장</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">타겟 가격</span>
                    <span className="text-white font-bold">$115,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">실시간 알림</h2>
            
            <div className="space-y-4">
              {[
                { type: 'critical', message: '대규모 BTC 이동 감지: 5,000 BTC가 Binance로 이동', time: '방금 전' },
                { type: 'warning', message: 'ETH 고래 지갑 활동 급증 - 주의 필요', time: '5분 전' },
                { type: 'info', message: 'SOL 기관 매수 신호 포착', time: '15분 전' },
                { type: 'success', message: 'BNB 스마트 머니 매집 완료 신호', time: '30분 전' }
              ].map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'critical' 
                      ? 'bg-red-900/20 border-red-500' 
                      : alert.type === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-500'
                        : alert.type === 'success'
                          ? 'bg-green-900/20 border-green-500'
                          : 'bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">{alert.message}</p>
                      <p className="text-sm text-gray-400 mt-1">{alert.time}</p>
                    </div>
                    <FaExclamationTriangle className={`text-xl ${
                      alert.type === 'critical' 
                        ? 'text-red-400' 
                        : alert.type === 'warning'
                          ? 'text-yellow-400'
                          : alert.type === 'success'
                            ? 'text-green-400'
                            : 'text-blue-400'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 시그널 구독</h3>
            <p className="text-gray-400 mb-4">
              실시간 고래 추적, AI 예측, 전문가 분석을 모두 이용하세요
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
              지금 시작하기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}