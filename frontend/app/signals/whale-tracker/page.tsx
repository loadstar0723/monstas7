'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaFish, FaArrowUp, FaArrowDown, FaExchangeAlt, FaBitcoin, FaEthereum, FaHistory, FaChartBar } from 'react-icons/fa'
import { SiBinance } from 'react-icons/si'

const MarketAnalysis = dynamic(() => import('@/components/signals/MarketAnalysis'), { ssr: false })
const SimplePriceChart = dynamic(() => import('@/components/SimplePriceChart'), { ssr: false })

interface WhaleTransaction {
  id: string
  asset: string
  amount: number
  value: number
  type: 'buy' | 'sell' | 'transfer'
  from: string
  to: string
  timestamp: Date
  impact: 'high' | 'medium' | 'low'
}

interface WhaleWallet {
  address: string
  label: string
  balance: number
  holdings: { asset: string; amount: number; value: number }[]
  lastActive: Date
  profitLoss: number
  winRate: number
}

export default function WhaleTrackerPage() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [whaleWallets, setWhaleWallets] = useState<WhaleWallet[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'wallets' | 'patterns' | 'alerts'>('overview')
  const [selectedAsset, setSelectedAsset] = useState<'ALL' | 'BTC' | 'ETH' | 'BNB' | 'SOL'>('ALL')
  
  useEffect(() => {
    // 시뮬레이션 데이터 생성
    const generateTransactions = () => {
      const assets = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA']
      const types: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer']
      const impacts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low']
      
      const newTransactions: WhaleTransaction[] = Array.from({ length: 20 }, (_, i) => {
        const asset = assets[Math.floor(Math.random() * assets.length)]
        const amount = Math.random() * 1000 + 100
        const price = asset === 'BTC' ? 110000 : asset === 'ETH' ? 3900 : 500
        
        return {
          id: `tx_${Date.now()}_${i}`,
          asset,
          amount,
          value: amount * price,
          type: types[Math.floor(Math.random() * types.length)],
          from: `0x${Math.random().toString(16).substr(2, 8)}...`,
          to: `0x${Math.random().toString(16).substr(2, 8)}...`,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          impact: impacts[Math.floor(Math.random() * impacts.length)]
        }
      })
      
      setTransactions(newTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }
    
    const generateWallets = () => {
      const labels = ['Binance Cold', 'Unknown Whale #1', 'Jump Trading', 'FTX Wallet', 'Coinbase Cold']
      
      const wallets: WhaleWallet[] = labels.map((label, i) => ({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        label,
        balance: Math.random() * 100000000 + 10000000,
        holdings: [
          { asset: 'BTC', amount: Math.random() * 10000, value: Math.random() * 1000000000 },
          { asset: 'ETH', amount: Math.random() * 50000, value: Math.random() * 200000000 },
          { asset: 'BNB', amount: Math.random() * 100000, value: Math.random() * 50000000 }
        ],
        lastActive: new Date(Date.now() - Math.random() * 86400000),
        profitLoss: (Math.random() - 0.3) * 100,
        winRate: Math.random() * 40 + 50
      }))
      
      setWhaleWallets(wallets)
    }
    
    generateTransactions()
    generateWallets()
    const interval = setInterval(() => {
      generateTransactions()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'buy': return <FaArrowUp className="text-green-400" />
      case 'sell': return <FaArrowDown className="text-red-400" />
      case 'transfer': return <FaExchangeAlt className="text-blue-400" />
      default: return null
    }
  }

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-gray-400 bg-gray-400/10'
      default: return ''
    }
  }

  const filteredTransactions = selectedAsset === 'ALL' 
    ? transactions 
    : transactions.filter(tx => tx.asset === selectedAsset)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            고래 추적 시스템
          </h1>
          <p className="text-gray-400">대규모 거래와 고래 지갑을 실시간으로 모니터링합니다</p>
        </motion.div>

        {/* 자산 필터 */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'BTC', 'ETH', 'BNB', 'SOL'].map(asset => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedAsset === asset
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {[
            { id: 'overview', label: '개요' },
            { id: 'transactions', label: '거래 내역' },
            { id: 'wallets', label: '고래 지갑' },
            { id: 'patterns', label: '패턴 분석' },
            { id: 'alerts', label: '알림 설정' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
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
                <p className="text-gray-400 text-sm mb-1">활성 고래</p>
                <p className="text-2xl font-bold text-white">342</p>
                <p className="text-green-400 text-sm mt-2">+12% 증가</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaArrowUp className="text-green-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">24H 매수량</p>
                <p className="text-2xl font-bold text-white">$8.7B</p>
                <p className="text-green-400 text-sm mt-2">매수 우세</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaExchangeAlt className="text-yellow-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">대규모 이동</p>
                <p className="text-2xl font-bold text-white">156건</p>
                <p className="text-yellow-400 text-sm mt-2">주의 필요</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <FaChartBar className="text-purple-400 text-2xl mb-3" />
                <p className="text-gray-400 text-sm mb-1">평균 거래 규모</p>
                <p className="text-2xl font-bold text-white">$2.4M</p>
                <p className="text-purple-400 text-sm mt-2">역대 최고</p>
              </motion.div>
            </div>

            {/* 실시간 차트 */}
            <SimplePriceChart symbol="BTCUSDT" height={400} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">실시간 고래 거래</h2>
            
            {/* 거래 테이블 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">자산</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">가치</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">영향도</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">From → To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredTransactions.map((tx, index) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {tx.timestamp.toLocaleTimeString('ko-KR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <span className="text-sm font-medium text-white">
                              {tx.type === 'buy' ? '매수' : tx.type === 'sell' ? '매도' : '이동'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-white">{tx.asset}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-white">
                          {tx.amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-400">
                          ${tx.value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getImpactColor(tx.impact)}`}>
                            {tx.impact === 'high' ? '높음' : tx.impact === 'medium' ? '보통' : '낮음'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {tx.from} → {tx.to}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">주요 고래 지갑</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {whaleWallets.map((wallet, index) => (
                <motion.div
                  key={wallet.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{wallet.label}</h3>
                      <p className="text-xs text-gray-400 font-mono">
                        {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">총 자산</p>
                      <p className="text-xl font-bold text-white">
                        ${(wallet.balance / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {wallet.holdings.map((holding, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-400">{holding.asset}</span>
                        <span className="text-white">
                          {holding.amount.toLocaleString()} 
                          <span className="text-gray-500 ml-2">
                            (${(holding.value / 1000000).toFixed(1)}M)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400">수익률</p>
                      <p className={`text-sm font-bold ${wallet.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {wallet.profitLoss >= 0 ? '+' : ''}{wallet.profitLoss.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">승률</p>
                      <p className="text-sm font-bold text-white">{wallet.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">마지막 활동</p>
                      <p className="text-sm text-white">
                        {Math.floor((Date.now() - wallet.lastActive.getTime()) / 3600000)}시간 전
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">고래 패턴 분석</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-blue-400">매집 패턴 감지</h3>
                <p className="text-gray-300 mb-4">
                  최근 72시간 동안 대규모 BTC 매수가 지속적으로 관찰되고 있습니다.
                  특히 $108,000-$110,000 구간에서 집중적인 매집이 이루어지고 있어
                  상승 돌파 가능성이 높습니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">매집 강도</span>
                    <span className="text-green-400 font-bold">매우 강함</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">주요 매집 구간</span>
                    <span className="text-white font-bold">$108,000-$110,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">예상 목표가</span>
                    <span className="text-white font-bold">$118,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-blue-400">분산 패턴 감지</h3>
                <p className="text-gray-300 mb-4">
                  ETH 고래들이 보유 물량을 여러 지갑으로 분산시키는 움직임이 포착되었습니다.
                  이는 규제 회피 또는 대규모 매도 준비 신호일 수 있습니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">분산 규모</span>
                    <span className="text-yellow-400 font-bold">50,000 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">분산 지갑 수</span>
                    <span className="text-white font-bold">23개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">위험도</span>
                    <span className="text-yellow-400 font-bold">중간</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-blue-400">거래소 유입/유출</h3>
                <p className="text-gray-300 mb-4">
                  거래소에서 개인 지갑으로의 대규모 인출이 계속되고 있습니다.
                  이는 장기 보유 의도를 나타내며 매도 압력 감소를 시사합니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">순 유출량</span>
                    <span className="text-green-400 font-bold">-15,000 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">거래소 보유량</span>
                    <span className="text-white font-bold">2.1M BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">전망</span>
                    <span className="text-green-400 font-bold">긍정적</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-blue-400">스마트 머니 동향</h3>
                <p className="text-gray-300 mb-4">
                  수익률 상위 10% 지갑들이 SOL과 AVAX에 집중 투자하고 있습니다.
                  이들의 평균 수익률은 +127%로 시장을 크게 상회합니다.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">주요 매수 종목</span>
                    <span className="text-white font-bold">SOL, AVAX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">평균 수익률</span>
                    <span className="text-green-400 font-bold">+127%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">추종 신호</span>
                    <span className="text-green-400 font-bold">강한 매수</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">알림 설정</h2>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-purple-400">고래 알림 조건</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">대규모 BTC 거래</p>
                    <p className="text-sm text-gray-400">100 BTC 이상 거래 발생 시</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium">
                    활성화
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">거래소 대량 입금</p>
                    <p className="text-sm text-gray-400">$10M 이상 거래소 입금 시</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium">
                    활성화
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">스마트 머니 추종</p>
                    <p className="text-sm text-gray-400">상위 10% 지갑 매수/매도 시</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 rounded-lg text-white font-medium">
                    비활성
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">패턴 감지</p>
                    <p className="text-sm text-gray-400">매집/분산 패턴 발견 시</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium">
                    활성화
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold mb-2">텔레그램 봇 연동</h3>
              <p className="text-gray-300 mb-4">
                실시간 고래 알림을 텔레그램으로 받아보세요
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
                텔레그램 연동하기
              </button>
            </div>
          </div>
        )}

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl border border-blue-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 고래 추적</h3>
            <p className="text-gray-400 mb-4">
              실시간 고래 움직임, 패턴 분석, 맞춤 알림을 모두 이용하세요
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all">
              프리미엄 구독하기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}