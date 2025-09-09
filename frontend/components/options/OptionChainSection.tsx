'use client'

import { useState, useEffect } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface OptionData {
  instrument_name: string
  bid: number
  ask: number
  last: number
  volume: number
  open_interest: number
  iv: number
  delta?: number
  gamma?: number
  theta?: number
  vega?: number
}

interface ChainRow {
  strike: number
  call: OptionData | null
  put: OptionData | null
}

interface Props {
  coin: string
  spotPrice: number
  optionChainData: ChainRow[] | null
  loading: boolean
}

export default function OptionChainSection({ coin, spotPrice, optionChainData, loading }: Props) {
  const [filter, setFilter] = useState<'all' | 'itm' | 'otm' | 'atm'>('all')
  const [showGreeks, setShowGreeks] = useState(false)

  // 필터링된 데이터
  const filteredData = optionChainData?.filter(row => {
    if (filter === 'all') return true
    
    const moneyness = row.strike / spotPrice
    
    switch (filter) {
      case 'itm': // In The Money
        return moneyness < 0.95 // 콜 기준
      case 'atm': // At The Money
        return moneyness >= 0.95 && moneyness <= 1.05
      case 'otm': // Out of The Money
        return moneyness > 1.05 // 콜 기준
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // Deribit은 BTC와 ETH만 지원
  if (!['BTC', 'ETH'].includes(coin)) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">옵션 체인</h3>
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">
            현재 {coin}는 Deribit 옵션을 지원하지 않습니다.
          </p>
          <p className="text-sm text-gray-500">
            BTC 또는 ETH를 선택해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">옵션 체인</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('itm')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'itm' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              ITM
            </button>
            <button
              onClick={() => setFilter('atm')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'atm' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              ATM
            </button>
            <button
              onClick={() => setFilter('otm')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'otm' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              OTM
            </button>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGreeks}
              onChange={(e) => setShowGreeks(e.target.checked)}
              className="rounded"
            />
            그리스 표시
          </label>
        </div>
      </div>

      {/* 옵션 체인 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th colSpan={showGreeks ? 8 : 4} className="text-center py-2 text-green-400">
                콜 옵션
              </th>
              <th className="text-center py-2 text-white">
                행사가
              </th>
              <th colSpan={showGreeks ? 8 : 4} className="text-center py-2 text-red-400">
                풋 옵션
              </th>
            </tr>
            <tr className="text-xs text-gray-400">
              {/* 콜 옵션 헤더 */}
              <th className="text-right py-2 px-2">OI</th>
              <th className="text-right px-2">Vol</th>
              <th className="text-right px-2">IV</th>
              <th className="text-right px-2">가격</th>
              {showGreeks && (
                <>
                  <th className="text-right px-2">Δ</th>
                  <th className="text-right px-2">Γ</th>
                  <th className="text-right px-2">Θ</th>
                  <th className="text-right px-2">V</th>
                </>
              )}
              
              {/* 행사가 */}
              <th className="text-center px-4"></th>
              
              {/* 풋 옵션 헤더 */}
              <th className="text-left px-2">가격</th>
              <th className="text-left px-2">IV</th>
              <th className="text-left px-2">Vol</th>
              <th className="text-left px-2">OI</th>
              {showGreeks && (
                <>
                  <th className="text-left px-2">Δ</th>
                  <th className="text-left px-2">Γ</th>
                  <th className="text-left px-2">Θ</th>
                  <th className="text-left px-2">V</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((row) => {
              const isATM = Math.abs(row.strike - spotPrice) / spotPrice < 0.02
              const isITMCall = row.strike < spotPrice
              const isITMPut = row.strike > spotPrice
              
              return (
                <tr 
                  key={row.strike} 
                  className={`border-b border-gray-700 hover:bg-gray-700/50 ${
                    isATM ? 'bg-purple-900/20' : ''
                  }`}
                >
                  {/* 콜 옵션 데이터 */}
                  <td className={`text-right py-2 px-2 ${isITMCall ? 'bg-green-900/20' : ''}`}>
                    {row.call?.open_interest?.toLocaleString() || '-'}
                  </td>
                  <td className={`text-right px-2 ${isITMCall ? 'bg-green-900/20' : ''}`}>
                    {row.call?.volume?.toLocaleString() || '-'}
                  </td>
                  <td className={`text-right px-2 ${isITMCall ? 'bg-green-900/20' : ''}`}>
                    {row.call?.iv ? `${(row.call.iv * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className={`text-right px-2 font-semibold ${isITMCall ? 'bg-green-900/20' : ''}`}>
                    {row.call?.last?.toFixed(4) || '-'}
                  </td>
                  {showGreeks && (
                    <>
                      <td className={`text-right px-2 text-xs ${isITMCall ? 'bg-green-900/20' : ''}`}>
                        {row.call?.delta?.toFixed(3) || '-'}
                      </td>
                      <td className={`text-right px-2 text-xs ${isITMCall ? 'bg-green-900/20' : ''}`}>
                        {row.call?.gamma?.toFixed(4) || '-'}
                      </td>
                      <td className={`text-right px-2 text-xs ${isITMCall ? 'bg-green-900/20' : ''}`}>
                        {row.call?.theta?.toFixed(4) || '-'}
                      </td>
                      <td className={`text-right px-2 text-xs ${isITMCall ? 'bg-green-900/20' : ''}`}>
                        {row.call?.vega?.toFixed(4) || '-'}
                      </td>
                    </>
                  )}
                  
                  {/* 행사가 */}
                  <td className="text-center px-4 font-bold text-white">
                    ${row.strike.toLocaleString()}
                  </td>
                  
                  {/* 풋 옵션 데이터 */}
                  <td className={`text-left px-2 font-semibold ${isITMPut ? 'bg-red-900/20' : ''}`}>
                    {row.put?.last?.toFixed(4) || '-'}
                  </td>
                  <td className={`text-left px-2 ${isITMPut ? 'bg-red-900/20' : ''}`}>
                    {row.put?.iv ? `${(row.put.iv * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className={`text-left px-2 ${isITMPut ? 'bg-red-900/20' : ''}`}>
                    {row.put?.volume?.toLocaleString() || '-'}
                  </td>
                  <td className={`text-left px-2 ${isITMPut ? 'bg-red-900/20' : ''}`}>
                    {row.put?.open_interest?.toLocaleString() || '-'}
                  </td>
                  {showGreeks && (
                    <>
                      <td className={`text-left px-2 text-xs ${isITMPut ? 'bg-red-900/20' : ''}`}>
                        {row.put?.delta?.toFixed(3) || '-'}
                      </td>
                      <td className={`text-left px-2 text-xs ${isITMPut ? 'bg-red-900/20' : ''}`}>
                        {row.put?.gamma?.toFixed(4) || '-'}
                      </td>
                      <td className={`text-left px-2 text-xs ${isITMPut ? 'bg-red-900/20' : ''}`}>
                        {row.put?.theta?.toFixed(4) || '-'}
                      </td>
                      <td className={`text-left px-2 text-xs ${isITMPut ? 'bg-red-900/20' : ''}`}>
                        {row.put?.vega?.toFixed(4) || '-'}
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-900/20 rounded"></div>
          <span>ITM 콜</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-900/20 rounded"></div>
          <span>ITM 풋</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-900/20 rounded"></div>
          <span>ATM</span>
        </div>
      </div>
    </div>
  )
}