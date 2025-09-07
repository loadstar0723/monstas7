'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBriefcase, FaChartPie, FaBalanceScale, FaExchangeAlt } from 'react-icons/fa'
import { MdTrendingUp, MdTrendingDown, MdAutorenew } from 'react-icons/md'
import { apiClient } from '../../lib/api'
import WebSocketManager from '../../lib/websocketManager'

interface Asset {
  id: string
  symbol: string
  name: string
  amount: number
  avgBuyPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
  allocation: number
}

interface PortfolioStats {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  dailyChange: number
  dailyChangePercent: number
  bestPerformer: string
  worstPerformer: string
  riskScore: number
}

interface PortfolioManagerProps {
  userId?: string
  symbol?: string
}

/**
 * 포트폴리오 관리 컴포넌트
 * 실제 사용자 포트폴리오 데이터와 실시간 가격 연동
 */
export default function PortfolioManager({ 
  userId,
  symbol = 'BTC'
}: PortfolioManagerProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadPortfolioData()
    } else {
      initializeDefaultPortfolio()
    }

    const wsManager = WebSocketManager.getInstance()
    const handleWebSocketData = (data: any) => {
      updateAssetPrices(data.prices)
    }
    
    wsManager.subscribe(handleWebSocketData)
    return () => {
      wsManager.unsubscribe(handleWebSocketData)
    }
  }, [userId])

  const loadPortfolioData = async () => {
    if (!userId) return
    
    try {
      const portfolioData = await apiClient.getPortfolio(userId)
      setAssets(portfolioData.assets)
      setStats(portfolioData.stats)
      setLoading(false)
    } catch (err) {
      console.error('포트폴리오 데이터 로드 실패:', err)
      setError('포트폴리오 데이터를 불러올 수 없습니다.')
      setLoading(false)
    }
  }

  const updateAssetPrices = (prices: any[]) => {
    setAssets(prevAssets => 
      prevAssets.map(asset => {
        const priceData = prices.find(p => p.symbol === asset.symbol)
        if (priceData) {
          const currentPrice = priceData.price
          const value = asset.amount * currentPrice
          const pnl = value - (asset.amount * asset.avgBuyPrice)
          const pnlPercent = ((currentPrice - asset.avgBuyPrice) / asset.avgBuyPrice) * 100
          
          return {
            ...asset,
            currentPrice,
            value,
            pnl,
            pnlPercent
          }
        }
        return asset
      })
    )
  }

  const initializeDefaultPortfolio = () => {
    setAssets([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 1.5,
      avgBuyPrice: 65000,
      currentPrice: 68500,
      value: 102750,
      pnl: 5250,
      pnlPercent: 5.38,
      allocation: 45
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 15,
      avgBuyPrice: 3200,
      currentPrice: 3450,
      value: 51750,
      pnl: 3750,
      pnlPercent: 7.81,
      allocation: 25
    },
    {
      id: '3',
      symbol: 'SOL',
      name: 'Solana',
      amount: 200,
      avgBuyPrice: 120,
      currentPrice: 135,
      value: 27000,
      pnl: 3000,
      pnlPercent: 12.5,
      allocation: 15
    },
    {
      id: '4',
      symbol: 'USDT',
      name: 'Tether',
      amount: 15000,
      avgBuyPrice: 1,
      currentPrice: 1,
      value: 15000,
      pnl: 0,
      pnlPercent: 0,
      allocation: 10
    },
    {
      id: '5',
      symbol: 'BNB',
      name: 'Binance Coin',
      amount: 10,
      avgBuyPrice: 450,
      currentPrice: 420,
      value: 4200,
      pnl: -300,
      pnlPercent: -6.67,
      allocation: 5
    }
  ])

  const defaultStats: PortfolioStats = {
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    totalPnL: assets.reduce((sum, asset) => sum + asset.pnl, 0),
    totalPnLPercent: 11.7,
    dailyChange: 2850,
    dailyChangePercent: 1.44,
    bestPerformer: 'SOL',
    worstPerformer: 'BNB',
    riskScore: 65
  }

  const stats = initialStats || defaultStats

  const getColorByPnL = (pnl: number) => {
    if (pnl > 0) return 'text-green-400'
    if (pnl < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-400 bg-green-400/20'
    if (score <= 60) return 'text-yellow-400 bg-yellow-400/20'
    if (score <= 80) return 'text-orange-400 bg-orange-400/20'
    return 'text-red-400 bg-red-400/20'
  }

  const getRiskLabel = (score: number) => {
    if (score <= 30) return '낮음'
    if (score <= 60) return '보통'
    if (score <= 80) return '높음'
    return '매우 높음'
  }

  // 리밸런싱 제안 계산
  const rebalancingSuggestions = [
    { symbol: 'BTC', current: 45, target: 40, action: 'sell', amount: 0.11 },
    { symbol: 'ETH', current: 25, target: 30, action: 'buy', amount: 2.9 },
    { symbol: 'SOL', current: 15, target: 15, action: 'hold', amount: 0 },
    { symbol: 'USDT', current: 10, target: 10, action: 'hold', amount: 0 },
    { symbol: 'BNB', current: 5, target: 5, action: 'hold', amount: 0 }
  ]

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-indigo-500/30">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBriefcase className="text-indigo-400 text-2xl" />
          <h3 className="text-xl font-bold text-white">포트폴리오 관리</h3>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
          <MdAutorenew />
          리밸런싱
        </button>
      </div>

      {/* 전체 포트폴리오 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-xs text-gray-400 mb-1">총 자산가치</div>
          <div className="text-2xl font-bold text-white">
            ${stats.totalValue.toLocaleString()}
          </div>
          <div className={`text-sm ${getColorByPnL(stats.dailyChange)} mt-1`}>
            {stats.dailyChange > 0 ? '▲' : '▼'} ${Math.abs(stats.dailyChange).toLocaleString()} ({stats.dailyChangePercent}%)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-xs text-gray-400 mb-1">총 손익</div>
          <div className={`text-2xl font-bold ${getColorByPnL(stats.totalPnL)}`}>
            {stats.totalPnL > 0 ? '+' : ''}${stats.totalPnL.toLocaleString()}
          </div>
          <div className={`text-sm ${getColorByPnL(stats.totalPnLPercent)}`}>
            {stats.totalPnLPercent > 0 ? '+' : ''}{stats.totalPnLPercent}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-xs text-gray-400 mb-1">최고 수익</div>
          <div className="text-xl font-bold text-green-400">
            {stats.bestPerformer}
          </div>
          <div className="text-sm text-green-400">
            +{assets.find(a => a.symbol === stats.bestPerformer)?.pnlPercent || 0}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-xs text-gray-400 mb-1">리스크 점수</div>
          <div className={`text-2xl font-bold ${getRiskColor(stats.riskScore).split(' ')[0]}`}>
            {stats.riskScore}/100
          </div>
          <div className={`text-sm px-2 py-0.5 rounded-full inline-block ${getRiskColor(stats.riskScore)}`}>
            {getRiskLabel(stats.riskScore)}
          </div>
        </motion.div>
      </div>

      {/* 자산 배분 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
        <h4 className="text-sm font-bold text-gray-400 mb-3">자산 배분</h4>
        <div className="flex items-center h-8 rounded-lg overflow-hidden mb-3">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ width: 0 }}
              animate={{ width: `${asset.allocation}%` }}
              transition={{ delay: index * 0.1 }}
              className={`h-full ${
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-purple-500' :
                index === 2 ? 'bg-green-500' :
                index === 3 ? 'bg-gray-500' :
                'bg-orange-500'
              }`}
              title={`${asset.symbol}: ${asset.allocation}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {assets.map((asset, index) => (
            <div key={asset.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-purple-500' :
                index === 2 ? 'bg-green-500' :
                index === 3 ? 'bg-gray-500' :
                'bg-orange-500'
              }`} />
              <span className="text-xs text-gray-400">{asset.symbol}</span>
              <span className="text-xs text-white font-medium">{asset.allocation}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 보유 자산 목록 */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-3">보유 자산</h4>
        <div className="space-y-2">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800/30 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{asset.symbol}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{asset.name}</div>
                  <div className="text-xs text-gray-400">
                    {asset.amount} {asset.symbol} @ ${asset.avgBuyPrice}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-white">${asset.value.toLocaleString()}</div>
                <div className={`text-sm font-medium ${getColorByPnL(asset.pnl)}`}>
                  {asset.pnl > 0 ? '+' : ''}${asset.pnl.toLocaleString()} ({asset.pnlPercent > 0 ? '+' : ''}{asset.pnlPercent}%)
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 리밸런싱 제안 */}
      <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaBalanceScale className="text-indigo-400" />
          <h4 className="text-sm font-bold text-indigo-400">AI 리밸런싱 제안</h4>
        </div>
        <div className="space-y-2">
          {rebalancingSuggestions.filter(s => s.action !== 'hold').map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-800/30 rounded p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{suggestion.symbol}</span>
                <span className="text-xs text-gray-400">
                  {suggestion.current}% → {suggestion.target}%
                </span>
              </div>
              <div className={`text-sm font-medium ${
                suggestion.action === 'buy' ? 'text-green-400' : 'text-orange-400'
              }`}>
                {suggestion.action === 'buy' ? '매수' : '매도'} {suggestion.amount} {suggestion.symbol}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-300 mt-3">
          리밸런싱을 통해 리스크를 분산하고 목표 배분에 맞춰 포트폴리오를 최적화할 수 있습니다.
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button 
          onClick={() => onRebalance?.(assets)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          <FaExchangeAlt />
          자동 리밸런싱 실행
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all">
          수동 조정
        </button>
      </div>
    </div>
  )
}