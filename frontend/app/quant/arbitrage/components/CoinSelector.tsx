'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'

interface Coin {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
  borderColor: string
}

interface CoinSelectorProps {
  selectedCoin: string
  onCoinSelect: (coin: string) => void
  coins: Coin[]
}

export default function CoinSelector({ selectedCoin, onCoinSelect, coins }: CoinSelectorProps) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [changes, setChanges] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 실제 Binance API에서 가격 데이터 가져오기
    const fetchRealPrices = async () => {
      try {
        // 프록시 API를 통해 실시간 가격 가져오기
        const response = await fetch('/api/binance/prices')
        
        if (!response.ok) {
          console.error('API response not ok:', response.status, response.statusText)
          throw new Error(`API 호출 실패: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API response data:', data)
        
        const newPrices: Record<string, number> = {}
        const newChanges: Record<string, number> = {}
        
        // API 데이터 파싱
        data.forEach((ticker: any) => {
          const symbol = ticker.symbol.replace('USDT', '')
          // lastPrice 또는 price 필드 체크
          const price = ticker.lastPrice || ticker.price
          const change = ticker.priceChangePercent || 0
          
          if (price) {
            newPrices[symbol] = parseFloat(price)
            newChanges[symbol] = parseFloat(change)
          }
        })
        
        console.log('Parsed prices:', newPrices)
        console.log('Parsed changes:', newChanges)
        
        // 데이터가 있는 경우에만 업데이트
        if (Object.keys(newPrices).length > 0) {
          setPrices(newPrices)
          setChanges(newChanges)
          setLoading(false)
        }
      } catch (error) {
        console.error('실시간 가격 조회 실패:', error)
        // 에러 시에도 로딩 상태 해제
        setLoading(false)
      }
    }
    
    // 즉시 실행
    fetchRealPrices()
    
    // 5초마다 업데이트
    const interval = setInterval(fetchRealPrices, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  // 가격 포맷팅 함수
  const formatPrice = (symbol: string, price: number) => {
    if (!price || price === 0) return '로딩중...'
    
    // 가격대에 따른 소수점 자리수 조정
    if (price >= 1000) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })
    } else if (price >= 10) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    } else if (price >= 1) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 3, 
        maximumFractionDigits: 3 
      })
    } else {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 4 
      })
    }
  }
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">
        코인 선택 {loading && <span className="text-sm text-gray-500">(실시간 가격 로딩중...)</span>}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {coins.map(coin => {
          const price = prices[coin.symbol] || 0
          const change = changes[coin.symbol] || 0
          const isSelected = selectedCoin === coin.symbol
          
          return (
            <button
              key={coin.symbol}
              onClick={() => onCoinSelect(coin.symbol)}
              className={`p-4 rounded-lg border transition-all ${
                isSelected
                  ? `${coin.bgColor} border-current ${coin.color}`
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {isSelected && (
                <div className="text-xs mb-1 opacity-75">선택됨</div>
              )}
              <div className="font-bold text-lg">{coin.symbol}</div>
              <div className="text-xs opacity-75 mb-2">{coin.name}</div>
              <div className="text-sm font-mono">
                ${formatPrice(coin.symbol, price)}
              </div>
              <div className={`text-xs mt-1 ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </div>
            </button>
          )
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">현재 선택된 코인</span>
          <div className="text-right">
            <span className="font-bold text-lg mr-2">
              {selectedCoin}
            </span>
            <span className="text-sm text-gray-400">
              ${formatPrice(selectedCoin, prices[selectedCoin] || 0)}
            </span>
            {changes[selectedCoin] !== undefined && (
              <span className={`text-sm ml-2 ${
                changes[selectedCoin] >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ({changes[selectedCoin] >= 0 ? '+' : ''}{changes[selectedCoin]?.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}