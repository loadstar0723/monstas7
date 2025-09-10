'use client'

import { motion } from 'framer-motion'
import { FaCircle } from 'react-icons/fa'

interface CoinInfo {
  symbol: string
  name: string
}

interface CoinDashboard {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  orderbook: any
  metrics: any
  alerts: any[]
}

interface CoinSelectorProps {
  symbols: CoinInfo[]
  selected: string
  onChange: (symbol: string) => void
  dashboards: Record<string, CoinDashboard>
}

export default function CoinSelector({ 
  symbols, 
  selected, 
  onChange, 
  dashboards 
}: CoinSelectorProps) {
  
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-400'
  }
  
  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-500 animate-pulse'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }
  
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
    if (price >= 1) return price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    return price.toLocaleString('ko-KR', { maximumFractionDigits: 4 })
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
      {symbols.map((coin) => {
        const dashboard = dashboards[coin.symbol]
        const isSelected = selected === coin.symbol
        const hasAlerts = dashboard?.alerts?.length > 0
        const spoofingScore = dashboard?.metrics?.spoofingScore || 0
        
        return (
          <motion.button
            key={coin.symbol}
            onClick={() => onChange(coin.symbol)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-3 rounded-xl border transition-all
              ${isSelected 
                ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20' 
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
              }
            `}
          >
            {/* 알림 배지 */}
            {hasAlerts && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            
            {/* 스푸핑 경고 */}
            {spoofingScore > 70 && (
              <div className="absolute top-1 right-1">
                <span className="text-xs text-red-500">⚠️</span>
              </div>
            )}
            
            <div className="space-y-1">
              {/* 심볼 */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {coin.symbol.replace('USDT', '')}
                </span>
                <FaCircle className={`text-[6px] ${getRiskColor(dashboard?.metrics?.riskLevel)}`} />
              </div>
              
              {/* 이름 */}
              <div className="text-[10px] text-gray-400 truncate">
                {coin.name}
              </div>
              
              {/* 가격 */}
              <div className="text-sm font-semibold text-white">
                ${formatPrice(dashboard?.price || 0)}
              </div>
              
              {/* 변화율 */}
              <div className={`text-xs ${getChangeColor(dashboard?.change24h || 0)}`}>
                {dashboard?.change24h > 0 && '+'}
                {(dashboard?.change24h || 0).toFixed(2)}%
              </div>
              
              {/* 스푸핑 점수 바 */}
              {spoofingScore > 0 && (
                <div className="mt-1">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        spoofingScore > 70 ? 'bg-red-500' : 
                        spoofingScore > 40 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${spoofingScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}