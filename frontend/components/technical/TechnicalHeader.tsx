'use client'

import { motion } from 'framer-motion'
import type { MarketData } from './types'

interface TechnicalHeaderProps {
  title: string
  description: string
  marketData?: MarketData
  showMarketData?: boolean
  className?: string
  children?: React.ReactNode
}

export default function TechnicalHeader({
  title,
  description,
  marketData,
  showMarketData = true,
  className = '',
  children
}: TechnicalHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {/* 페이지 타이틀 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-gray-400">{description}</p>
      </motion.div>

      {/* 시장 데이터 표시 */}
      {showMarketData && marketData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 sm:p-5 md:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
        >
          {/* 모바일: 3단 세로 레이아웃 */}
          <div className="md:hidden">
            {/* 1단: 심볼과 USD 가격 */}
            <div className="text-center pb-3 border-b border-gray-700">
              <h2 className="text-base font-bold text-yellow-400 mb-1">{marketData.symbol}</h2>
              <div className="text-2xl font-bold text-white">
                ${marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* 2단: 원화 가격 */}
            <div className="text-center py-3 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">원화 가격</div>
              <div className="text-xl font-bold text-white">
                ₩{(marketData.price * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {/* 3단: 24시간 변화 & 거래량 */}
            <div className="flex justify-around pt-3">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">24시간 변화</div>
                <div className={`text-lg font-bold ${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">24시간 거래량</div>
                <div className="text-sm font-semibold text-white">
                  {marketData.volume24h > 1000000 ? 
                    `${(marketData.volume24h / 1000000).toFixed(1)}M` : 
                    `${marketData.volume24h.toFixed(0)}`
                  } USDT
                </div>
              </div>
            </div>
          </div>
          
          {/* 데스크톱 레이아웃 */}
          <div className="hidden md:flex md:items-center md:justify-between gap-6">
            {/* 심볼과 USD 가격 섹션 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{marketData.symbol}</h2>
              <div className="text-4xl font-bold text-blue-400">
                ${marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* 원화 가격 중앙 표시 */}
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400">원화 가격</div>
              <div className="text-2xl font-bold text-white mt-1">
                ₩{(marketData.price * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {/* 24시간 정보 섹션 */}
            <div className="text-right flex-1">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-sm text-gray-400">24시간 변화</span>
                <span className={`text-xl font-bold ${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-400">24시간 거래량</span>
                <span className="text-lg font-semibold text-white">
                  {marketData.volume24h > 1000000 ? 
                    `${(marketData.volume24h / 1000000).toFixed(1)}M` : 
                    `${marketData.volume24h.toFixed(0)}`
                  } USDT
                </span>
              </div>
              {marketData.high24h && marketData.low24h && (
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-xs text-gray-500">24H 고가/저가</span>
                  <span className="text-sm text-gray-300">
                    ${marketData.high24h.toFixed(2)} / ${marketData.low24h.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 추가 컨텐츠 */}
      {children}
    </div>
  )
}